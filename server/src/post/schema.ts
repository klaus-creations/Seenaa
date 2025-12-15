import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const post = pgTable('post', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  communityId: varchar('community_id', { length: 255 }),
  content: text('content').notNull(),
  images: text('images').array(),

  viewCount: integer('view_count').notNull().default(0),
  thumbsUpCount: integer('thumbs_up_count').notNull().default(0),
  thumbsDownCount: integer('thumbs_down_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  shareCount: integer('share_count').notNull().default(0),

  mentions: text('mentions').array(),
  hashtags: text('hashtags').array(),
  isPinned: boolean('is_pinned').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'), // soft delete
});

export const reactionTypeEnum = pgEnum('reaction_type', [
  'thumbs_up',
  'thumbs_down',
]);

export const reactionTargetTypeEnum = pgEnum('reaction_target_type', [
  'post',
  'comment',
]);

export const reaction = pgTable(
  'reaction',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    targetId: varchar('target_id', { length: 255 }).notNull(),
    targetType: reactionTargetTypeEnum('target_type').notNull(),
    reactionType: reactionTypeEnum('reaction_type').notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserTarget: uniqueIndex('unique_user_target').on(
      table.userId,
      table.targetId,
      table.targetType,
    ),
  }),
);

export const postView = pgTable(
  'post_view',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    postId: varchar('post_id', { length: 255 }).notNull(),
    ipAddress: varchar('ip_address', { length: 255 }),
    viewedAt: timestamp('viewed_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserPost: uniqueIndex('unique_user_post_view').on(table.postId),
  }),
);

export const bookmark = pgTable(
  'bookmark',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    postId: varchar('post_id', { length: 255 })
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueUserPost: uniqueIndex('unique_user_post_bookmark').on(
      table.userId,
      table.postId,
    ),
  }),
);
