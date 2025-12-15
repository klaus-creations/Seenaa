import {
  pgTable,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

// Report Type Enum
export const reportTypeEnum = pgEnum("report_type", [
  "spam",
  "harassment",
  "hate_speech",
  "violence",
  "misinformation",
  "inappropriate_content",
  "other",
]);

// Report Status Enum
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
]);

// Report Table
export const report = pgTable("report", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reporterId: varchar("reporter_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetId: varchar("target_id", { length: 255 }).notNull(), // post/comment/user id
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'post', 'comment', 'user'
  reportType: reportTypeEnum("report_type").notNull(),
  description: text("description"),

  // Review info
  status: reportStatusEnum("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by", { length: 255 }).references(
    () => user.id,
    { onDelete: "set null" }
  ),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
