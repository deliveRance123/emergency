import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  emergencyReports,
  emergencyCategories,
  reportUpdates,
  notifications,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const updateReportSchema = z.object({
  status: z.enum(["submitted", "under_review", "confirmed", "assigned", "resolved", "rejected"]).optional(),
  categoryCode: z.string().optional(),
  urgency: z.enum(["critical", "high", "moderate", "low"]).optional(),
  assignedResponder: z.string().optional(),
  rejectionReason: z.string().optional(),
  internalComment: z.string().optional(),
  publicNotificationMessage: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Administrator authorization required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update payload." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch existing report
    const [existingReport] = await db
      .select()
      .from(emergencyReports)
      .where(eq(emergencyReports.id, id))
      .limit(1);

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const updateFields: Partial<typeof emergencyReports.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.status) {
      updateFields.status = data.status;
    }
    if (data.urgency) {
      updateFields.urgency = data.urgency;
    }
    if (data.assignedResponder !== undefined) {
      updateFields.assignedResponder = data.assignedResponder;
    }
    if (data.rejectionReason !== undefined) {
      updateFields.rejectionReason = data.rejectionReason;
    }

    if (data.categoryCode) {
      const [cat] = await db
        .select({ id: emergencyCategories.id })
        .from(emergencyCategories)
        .where(eq(emergencyCategories.code, data.categoryCode))
        .limit(1);
      if (cat) {
        updateFields.categoryId = cat.id;
      }
    }

    // Perform report update
    const [updatedReport] = await db
      .update(emergencyReports)
      .set(updateFields)
      .where(eq(emergencyReports.id, id))
      .returning();

    // Record audit update
    await db.insert(reportUpdates).values({
      reportId: id,
      administratorId: user.userId,
      previousStatus: existingReport.status,
      newStatus: data.status || existingReport.status,
      internalComment: data.internalComment || null,
      publicNotificationMessage:
        data.publicNotificationMessage ||
        (data.status ? `Report status changed from ${existingReport.status} to ${data.status}.` : null),
    });

    // Notify citizen if user is attached
    if (existingReport.userId && (data.status || data.publicNotificationMessage)) {
      await db.insert(notifications).values({
        userId: existingReport.userId,
        reportId: id,
        title: `Report #${existingReport.referenceNumber} Update`,
        message:
          data.publicNotificationMessage ||
          `Your report status has been updated to '${data.status || existingReport.status}'.`,
        type: data.status === "rejected" ? "urgent" : "status_update",
      });
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Admin update report error:", error);
    return NextResponse.json({ error: "Failed to update emergency report." }, { status: 500 });
  }
}
