import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.userId));
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}
