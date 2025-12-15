import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const notificationTypeEnum = pgEnum('notification_type', [
  'post_thumbs_up',
  'post_thumbs_down',
  'comment_on_post',
  'reply_to_comment',
  'comment_thumbs_up',
  'comment_thumbs_down',
  'mention_in_post',
  'mention_in_comment',
  'new_follower',
  'community_invite',
  'community_join_request',
  'community_post',
  'direct_message',
]);

// Notification Table
export const notification = pgTable(
  'notification',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    // REMOVED .references() to fix circular dependency
    userId: varchar('user_id', { length: 255 }).notNull(),
    // REMOVED .references() to fix circular dependency
    actorId: varchar('actor_id', { length: 255 }),

    type: notificationTypeEnum('type').notNull(),

    targetId: varchar('target_id', { length: 255 }),
    targetType: varchar('target_type', { length: 50 }),

    content: text('content'),
    actionUrl: varchar('action_url', { length: 500 }),

    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userNotificationsIdx: index('user_notifications_idx').on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export const notificationPreference = pgTable('notification_preference', {
  id: varchar('id', { length: 255 }).primaryKey(),
  // REMOVED .references() to fix circular dependency
  userId: varchar('user_id', { length: 255 }).notNull().unique(),

  emailOnPostReaction: boolean('email_on_post_reaction')
    .notNull()
    .default(true),
  emailOnComment: boolean('email_on_comment').notNull().default(true),
  emailOnMention: boolean('email_on_mention').notNull().default(true),
  emailOnFollow: boolean('email_on_follow').notNull().default(true),
  emailOnDirectMessage: boolean('email_on_direct_message')
    .notNull()
    .default(true),
  emailDigestFrequency: varchar('email_digest_frequency', { length: 50 })
    .notNull()
    .default('daily'),

  pushOnPostReaction: boolean('push_on_post_reaction').notNull().default(true),
  pushOnComment: boolean('push_on_comment').notNull().default(true),
  pushOnMention: boolean('push_on_mention').notNull().default(true),
  pushOnFollow: boolean('push_on_follow').notNull().default(true),
  pushOnDirectMessage: boolean('push_on_direct_message')
    .notNull()
    .default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
