import { NextResponse } from "next/server";
import { db } from "@/db";
import { emergencyCategories } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(emergencyCategories)
      .orderBy(asc(emergencyCategories.priorityLevel));
    return NextResponse.json(list);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}
