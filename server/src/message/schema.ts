import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  integer
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

// Conversation Table (between two users)
export const conversation = pgTable(
  "conversation",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    user1Id: varchar("user1_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    user2Id: varchar("user2_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Last message info for preview
    lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
    lastMessageContent: text("last_message_content"), // denormalized for performance

    // Unread counts per user
    unreadCountUser1: integer("unread_count_user1").notNull().default(0),
    unreadCountUser2: integer("unread_count_user2").notNull().default(0),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: only one conversation between two users
    uniqueUsers: uniqueIndex("unique_conversation_users").on(
      table.user1Id,
      table.user2Id
    ),
  })
);

// Direct Message Table
export const directMessage = pgTable(
  "direct_message",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    conversationId: varchar("conversation_id", { length: 255 })
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    senderId: varchar("sender_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: varchar("receiver_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),

    // Message status
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),

    // Optional: Message reactions (like, heart, etc.)
    // Can be extended later if needed

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => ({
    // Index for fast conversation message retrieval
    conversationIndex: index("conversation_messages_idx").on(
      table.conversationId,
      table.createdAt
    ),
  })
);

// Message Read Status (alternative approach - more detailed tracking)
// Use this if you want to track when messages were read more precisely
export const messageReadStatus = pgTable(
  "message_read_status",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    messageId: varchar("message_id", { length: 255 })
      .notNull()
      .references(() => directMessage.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueMessageUser: uniqueIndex("unique_message_user_read").on(
      table.messageId,
      table.userId
    ),
  })
);
