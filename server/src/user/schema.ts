import { pgTable, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from '../auth/schema';

export const follow = pgTable(
  'follow',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    followerId: varchar('follower_id', { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    followingId: varchar('following_id', { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueFollowerFollowing: uniqueIndex('unique_follower_following').on(
      table.followerId,
      table.followingId,
    ),
  }),
);
