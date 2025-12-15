import { sql } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';

export const profileThemeEnum = pgEnum('profile_theme', [
  'default',
  'minimal',
  'neo',
  'classic',
]);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  displayUsername: text('display_username'),

  bio: text('bio').notNull().default(''),
  country: text('country'),
  city: text('city'),
  languages: text('languages')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  followingCount: integer('following_count').notNull().default(0),
  followerCount: integer('follower_count').notNull().default(0),
  postsCount: integer('posts_count').notNull().default(0),
  communitiesCount: integer('communities_count').notNull().default(0),
  likesReceivedCount: integer('likes_received_count').notNull().default(0),
  profileViewsCount: integer('profile_views_count').notNull().default(0),

  isVerified: boolean('is_verified').notNull().default(false),
  isBanned: boolean('is_banned').notNull().default(false),

  isOnline: boolean('is_online').notNull().default(false),
  lastActiveAt: timestamp('last_active_at')
    .notNull()
    .default(sql`now() - interval '1 hour'`),

  allowMessages: boolean('allow_messages').notNull().default(true),
  allowMentions: boolean('allow_mentions').notNull().default(true),
  showActivityStatus: boolean('show_activity_status').notNull().default(true),
  profileTheme: profileThemeEnum('profile_theme').notNull().default('default'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);
