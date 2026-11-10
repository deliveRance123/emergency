import { pgTable, text, timestamp, uuid, integer, boolean, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["citizen", "responder", "admin"]);
export const reportStatusEnum = pgEnum("report_status", [
  "submitted",
  "under_review",
  "confirmed",
  "assigned",
  "resolved",
  "rejected"
]);
export const urgencyLevelEnum = pgEnum("urgency_level", ["critical", "high", "moderate", "low"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("citizen").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Emergency Categories table
export const emergencyCategories = pgTable("emergency_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // e.g. 'medical', 'fire', 'accident', 'security', 'flood', 'other', 'inquiry'
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  badgeColorHex: text("badge_color_hex").notNull(),
  priorityLevel: integer("priority_level").default(3).notNull(), // 1: Critical, 4: Low
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Emergency Reports table
export const emergencyReports = pgTable("emergency_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  referenceNumber: text("reference_number").notNull().unique(), // e.g. EC-2026-9284
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  originalMessage: text("original_message").notNull(),
  categoryId: uuid("category_id").references(() => emergencyCategories.id),
  urgency: urgencyLevelEnum("urgency").default("moderate").notNull(),
  locationName: text("location_name"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: reportStatusEnum("status").default("submitted").notNull(),
  rejectionReason: text("rejection_reason"),
  assignedResponder: text("assigned_responder"),
  userConfirmed: boolean("user_confirmed").default(true).notNull(),
  userCorrectionNotes: text("user_correction_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// NLP Analysis Records table
export const nlpAnalyses = pgTable("nlp_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => emergencyReports.id, { onDelete: "cascade" }).notNull(),
  detectedCategoryCode: text("detected_category_code").notNull(),
  detectedCategoryName: text("detected_category_name").notNull(),
  urgencyAssessment: urgencyLevelEnum("urgency_assessment").notNull(),
  confidenceScore: real("confidence_score").notNull(), // 0.0 to 1.0
  temporalContext: text("temporal_context").notNull(), // 'active_present' | 'historical_past' | 'hypothetical_inquiry'
  extractedEntities: jsonb("extracted_entities").notNull(), // { incidentType, casualties, hazards, locations, actionNeeded }
  detectedKeywords: jsonb("detected_keywords").notNull(), // string[]
  modelVersion: text("model_version").default("v1.2-rule-semantic").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Report Audit Updates & Comments table
export const reportUpdates = pgTable("report_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => emergencyReports.id, { onDelete: "cascade" }).notNull(),
  administratorId: uuid("administrator_id").references(() => users.id, { onDelete: "set null" }),
  previousStatus: text("previous_status").notNull(),
  newStatus: text("new_status").notNull(),
  internalComment: text("internal_comment"),
  publicNotificationMessage: text("public_notification_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reportId: uuid("report_id").references(() => emergencyReports.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info").notNull(), // 'info' | 'urgent' | 'status_update'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(emergencyReports),
  notifications: many(notifications),
}));

export const emergencyReportsRelations = relations(emergencyReports, ({ one, many }) => ({
  user: one(users, {
    fields: [emergencyReports.userId],
    references: [users.id],
  }),
  category: one(emergencyCategories, {
    fields: [emergencyReports.categoryId],
    references: [emergencyCategories.id],
  }),
  nlpAnalysis: one(nlpAnalyses, {
    fields: [emergencyReports.id],
    references: [nlpAnalyses.reportId],
  }),
  updates: many(reportUpdates),
}));

export const nlpAnalysesRelations = relations(nlpAnalyses, ({ one }) => ({
  report: one(emergencyReports, {
    fields: [nlpAnalyses.reportId],
    references: [emergencyReports.id],
  }),
}));
