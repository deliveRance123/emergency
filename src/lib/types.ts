import { NlpAnalysisResult, ExtractedEntities, UrgencyLevel } from "./nlp/types";

export interface UserSummary {
  userId?: string;
  id?: string;
  fullName: string;
  email: string;
  role: "citizen" | "responder" | "admin";
  phone?: string | null;
}

export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  iconName: string;
  badgeColorHex: string;
  priorityLevel?: number;
}

export interface ReportNlpSummary {
  confidenceScore: number;
  detectedCategoryCode?: string;
  detectedCategoryName: string;
  urgencyAssessment?: UrgencyLevel;
  temporalContext?: string;
  extractedEntities: ExtractedEntities;
}

export interface ReportItem {
  id: string;
  referenceNumber: string;
  originalMessage: string;
  urgency: UrgencyLevel;
  status: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  assignedResponder?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  category: CategoryItem | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  nlpAnalysis: ReportNlpSummary | null;
}

export interface ReportUpdateItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  internalComment: string | null;
  publicNotificationMessage: string | null;
  createdAt: string;
  administrator: {
    id: string;
    fullName: string;
  } | null;
}

export interface ReportDetail extends ReportItem {
  userCorrectionNotes: string | null;
  submitter: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  updates: ReportUpdateItem[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  reportId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export type { NlpAnalysisResult };
