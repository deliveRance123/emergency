import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionCookie } from "@/lib/auth/session";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "citizen",
        phone: phone?.trim() || null,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      });

    await createSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
