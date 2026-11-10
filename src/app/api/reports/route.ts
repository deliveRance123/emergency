import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  emergencyReports,
  nlpAnalyses,
  reportUpdates,
  notifications,
  emergencyCategories,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const submitReportSchema = z.object({
  originalMessage: z.string().min(5, "Original description must be provided."),
  categoryCode: z.string().min(1, "Category is required."),
  urgency: z.enum(["critical", "high", "moderate", "low"]),
  locationName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  userCorrectionNotes: z.string().optional(),
  nlpAnalysis: z.object({
    detectedCategoryCode: z.string(),
    detectedCategoryName: z.string(),
    urgencyAssessment: z.enum(["critical", "high", "moderate", "low"]),
    confidenceScore: z.number(),
    temporalContext: z.string(),
    extractedEntities: z.record(z.string(), z.any()),
    detectedKeywords: z.array(z.string()),
    modelVersion: z.string().optional(),
  }),
});

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `EC-${year}-${randomNum}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const urgencyFilter = searchParams.get("urgency");
    const categoryFilter = searchParams.get("category");

    const query = db
      .select({
        id: emergencyReports.id,
        referenceNumber: emergencyReports.referenceNumber,
        originalMessage: emergencyReports.originalMessage,
        urgency: emergencyReports.urgency,
        status: emergencyReports.status,
        locationName: emergencyReports.locationName,
        latitude: emergencyReports.latitude,
        longitude: emergencyReports.longitude,
        createdAt: emergencyReports.createdAt,
        updatedAt: emergencyReports.updatedAt,
        category: {
          id: emergencyCategories.id,
          code: emergencyCategories.code,
          name: emergencyCategories.name,
          badgeColorHex: emergencyCategories.badgeColorHex,
          iconName: emergencyCategories.iconName,
        },
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
        nlpAnalysis: {
          confidenceScore: nlpAnalyses.confidenceScore,
          detectedCategoryName: nlpAnalyses.detectedCategoryName,
          extractedEntities: nlpAnalyses.extractedEntities,
        },
      })
      .from(emergencyReports)
      .leftJoin(emergencyCategories, eq(emergencyReports.categoryId, emergencyCategories.id))
      .leftJoin(users, eq(emergencyReports.userId, users.id))
      .leftJoin(nlpAnalyses, eq(emergencyReports.id, nlpAnalyses.reportId))
      .orderBy(desc(emergencyReports.createdAt));

    let results = await query;

    // Filter by user ownership if not admin
    if (user.role !== "admin") {
      results = results.filter((r) => r.user?.id === user.userId);
    }

    // Apply optional filters
    if (statusFilter && statusFilter !== "all") {
      results = results.filter((r) => r.status === statusFilter);
    }
    if (urgencyFilter && urgencyFilter !== "all") {
      results = results.filter((r) => r.urgency === urgencyFilter);
    }
    if (categoryFilter && categoryFilter !== "all") {
      results = results.filter((r) => r.category?.code === categoryFilter);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: "Failed to retrieve reports." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to submit a report." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid report data." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Look up category ID
    const [category] = await db
      .select({ id: emergencyCategories.id })
      .from(emergencyCategories)
      .where(eq(emergencyCategories.code, data.categoryCode))
      .limit(1);

    const categoryId = category?.id || null;
    const referenceNumber = generateReferenceNumber();

    // 1. Insert emergency report
    const [report] = await db
      .insert(emergencyReports)
      .values({
        referenceNumber,
        userId: user.userId,
        originalMessage: data.originalMessage,
        categoryId,
        urgency: data.urgency,
        locationName: data.locationName || "Location pending dispatcher confirmation",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        status: "submitted",
        userConfirmed: true,
        userCorrectionNotes: data.userCorrectionNotes || null,
      })
      .returning();

    // 2. Insert NLP analysis record
    await db.insert(nlpAnalyses).values({
      reportId: report.id,
      detectedCategoryCode: data.nlpAnalysis.detectedCategoryCode,
      detectedCategoryName: data.nlpAnalysis.detectedCategoryName,
      urgencyAssessment: data.nlpAnalysis.urgencyAssessment,
      confidenceScore: data.nlpAnalysis.confidenceScore,
      temporalContext: data.nlpAnalysis.temporalContext,
      extractedEntities: data.nlpAnalysis.extractedEntities,
      detectedKeywords: data.nlpAnalysis.detectedKeywords,
      modelVersion: data.nlpAnalysis.modelVersion || "v1.2-rule-semantic",
    });

    // 3. Insert initial audit update
    await db.insert(reportUpdates).values({
      reportId: report.id,
      previousStatus: "none",
      newStatus: "submitted",
      internalComment: "Report created by citizen. Initial NLP processing complete.",
      publicNotificationMessage: "Your emergency report has been submitted and queued for operator review.",
    });

    // 4. Create user confirmation notification
    await db.insert(notifications).values({
      userId: user.userId,
      reportId: report.id,
      title: "Emergency Report Submitted",
      message: `Your report (#${referenceNumber}) has been received and queued for review.`,
      type: "status_update",
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      referenceNumber: report.referenceNumber,
    });
  } catch (error) {
    console.error("Submit report error:", error);
    return NextResponse.json({ error: "Failed to submit emergency report." }, { status: 500 });
  }
}
