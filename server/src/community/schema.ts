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

export const community = pgTable('community', {
  id: varchar('id', { length: 255 }).primaryKey(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  avatar: text('avatar'),
  banner: text('banner'),

  isPrivate: boolean('is_private').notNull().default(false),
  requireApproval: boolean('require_approval').notNull().default(false),

  rules: text('rules').array(),
  welcomeMessage: text('welcome_message'),

  memberCount: integer('member_count').notNull().default(1),
  postCount: integer('post_count').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const communityRoleEnum = pgEnum('community_role', [
  'creator',
  'admin',
  'moderator',
  'member',
]);

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'pending',
  'banned',
  'left',
]);

export const communityMember = pgTable(
  'community_member',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    communityId: varchar('community_id', { length: 255 })
      .notNull()
      .references(() => community.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).notNull(),
    role: communityRoleEnum('role').notNull().default('member'),
    status: memberStatusEnum('status').notNull().default('active'),

    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    leftAt: timestamp('left_at'),
    bannedAt: timestamp('banned_at'),
    bannedBy: varchar('banned_by', { length: 255 }),
    banReason: text('ban_reason'),
  },
  (table) => ({
    uniqueCommunityUser: uniqueIndex('unique_community_user').on(
      table.communityId,
      table.userId,
    ),
  }),
);

export const communityInvitation = pgTable('community_invitation', {
  id: varchar('id', { length: 255 }).primaryKey(),
  communityId: varchar('community_id', { length: 255 })
    .notNull()
    .references(() => community.id, { onDelete: 'cascade' }),
  inviterId: varchar('inviter_id', { length: 255 }).notNull(),
  inviteeId: varchar('invitee_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  respondedAt: timestamp('responded_at'),
});

export const communityJoinRequest = pgTable('community_join_request', {
  id: varchar('id', { length: 255 }).primaryKey(),
  communityId: varchar('community_id', { length: 255 })
    .notNull()
    .references(() => community.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  message: text('message'), // optional message from user
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
