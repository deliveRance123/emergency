import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  emergencyReports,
  emergencyCategories,
  nlpAnalyses,
  reportUpdates,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    const [report] = await db
      .select({
        id: emergencyReports.id,
        referenceNumber: emergencyReports.referenceNumber,
        originalMessage: emergencyReports.originalMessage,
        urgency: emergencyReports.urgency,
        status: emergencyReports.status,
        locationName: emergencyReports.locationName,
        latitude: emergencyReports.latitude,
        longitude: emergencyReports.longitude,
        rejectionReason: emergencyReports.rejectionReason,
        assignedResponder: emergencyReports.assignedResponder,
        userCorrectionNotes: emergencyReports.userCorrectionNotes,
        createdAt: emergencyReports.createdAt,
        updatedAt: emergencyReports.updatedAt,
        userId: emergencyReports.userId,
        category: {
          id: emergencyCategories.id,
          code: emergencyCategories.code,
          name: emergencyCategories.name,
          badgeColorHex: emergencyCategories.badgeColorHex,
          iconName: emergencyCategories.iconName,
        },
        submitter: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(emergencyReports)
      .leftJoin(emergencyCategories, eq(emergencyReports.categoryId, emergencyCategories.id))
      .leftJoin(users, eq(emergencyReports.userId, users.id))
      .where(eq(emergencyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Role security check
    if (user.role !== "admin" && report.userId !== user.userId) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Fetch NLP analysis
    const [nlpAnalysis] = await db
      .select()
      .from(nlpAnalyses)
      .where(eq(nlpAnalyses.reportId, id))
      .limit(1);

    // Fetch Audit updates
    const updates = await db
      .select({
        id: reportUpdates.id,
        previousStatus: reportUpdates.previousStatus,
        newStatus: reportUpdates.newStatus,
        internalComment: reportUpdates.internalComment,
        publicNotificationMessage: reportUpdates.publicNotificationMessage,
        createdAt: reportUpdates.createdAt,
        administrator: {
          id: users.id,
          fullName: users.fullName,
        },
      })
      .from(reportUpdates)
      .leftJoin(users, eq(reportUpdates.administratorId, users.id))
      .where(eq(reportUpdates.reportId, id))
      .orderBy(desc(reportUpdates.createdAt));

    return NextResponse.json({
      ...report,
      nlpAnalysis,
      updates,
    });
  } catch (error) {
    console.error("Fetch report detail error:", error);
    return NextResponse.json({ error: "Failed to fetch report details." }, { status: 500 });
  }
}
