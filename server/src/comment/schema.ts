import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const comment = pgTable('comment', {
  id: varchar('id', { length: 255 }).primaryKey(),
  postId: varchar('post_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  parentCommentId: varchar('parent_comment_id', { length: 255 }),
  content: text('content').notNull(),

  thumbsUpCount: integer('thumbs_up_count').notNull().default(0),
  thumbsDownCount: integer('thumbs_down_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),

  depth: integer('depth').notNull().default(0),
  mentions: text('mentions').array(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
});
