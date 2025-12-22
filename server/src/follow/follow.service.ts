import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { eq, and, sql, desc, inArray, InferSelectModel } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { GetFollowsQueryDto } from './dto/get-follows.dto';

// Use the full User type from your schema
type User = InferSelectModel<typeof schema.user>;

// Extend the User type to include UI-specific flags
export type EnhancedUser = User & {
  isFollowing: boolean;
  isSelf: boolean;
};

@Injectable()
export class FollowService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private eventEmitter: EventEmitter2,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.db.query.user.findFirst({
      where: eq(schema.user.id, followingId),
    });

    if (!targetUser) throw new NotFoundException('User not found');

    const existingFollow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, followingId),
      ),
    });

    if (existingFollow) {
      throw new ConflictException('Already following');
    }

    await this.db.transaction(async (tx) => {
      await tx.insert(schema.follow).values({
        id: uuidv4(),
        followerId,
        followingId,
        createdAt: new Date(),
      });

      await tx
        .update(schema.user)
        .set({ followingCount: sql`${schema.user.followingCount} + 1` })
        .where(eq(schema.user.id, followerId));

      await tx
        .update(schema.user)
        .set({ followerCount: sql`${schema.user.followerCount} + 1` })
        .where(eq(schema.user.id, followingId));
    });

    this.eventEmitter.emit('notification.create', {
      recipientId: followingId,
      actorId: followerId,
      type: 'new_follower',
      targetId: followerId,
      targetType: 'user',
      content: 'started following you',
      actionUrl: `/home/peoples/${followerId}`,
    });

    return { message: 'Followed successfully', isFollowing: true };
  }

  async unfollow(followerId: string, followingId: string) {
    const existingFollow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, followingId),
      ),
    });

    if (!existingFollow) {
      throw new NotFoundException('Not following this user');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.follow)
        .where(
          and(
            eq(schema.follow.followerId, followerId),
            eq(schema.follow.followingId, followingId),
          ),
        );

      await tx
        .update(schema.user)
        .set({ followingCount: sql`${schema.user.followingCount} - 1` })
        .where(eq(schema.user.id, followerId));

      await tx
        .update(schema.user)
        .set({ followerCount: sql`${schema.user.followerCount} - 1` })
        .where(eq(schema.user.id, followingId));
    });

    return { message: 'Unfollowed successfully', isFollowing: false };
  }

  async getFollowers(
    targetUserId: string,
    currentViewerId: string | null,
    query: GetFollowsQueryDto,
  ) {
    const { limit = 20, page = 1 } = query;
    const offset = (page - 1) * limit;

    const followersData = await this.db.query.follow.findMany({
      where: eq(schema.follow.followingId, targetUserId),
      limit,
      offset,
      orderBy: [desc(schema.follow.createdAt)],
      with: { follower: true },
    });

    // not showing the current user from
    const rawUsers = followersData
      .map((f) => f.follower)
      .filter((u) => u.id !== currentViewerId);

    const formattedUsers = await this.enrichWithFollowStatus(
      rawUsers,
      currentViewerId,
    );

    return {
      data: formattedUsers,
      pagination: {
        page,
        limit,
        hasMore: followersData.length === limit,
      },
    };
  }

  async getFollowing(
    targetUserId: string,
    currentViewerId: string | null,
    query: GetFollowsQueryDto,
  ) {
    const { limit = 20, page = 1 } = query;
    const offset = (page - 1) * limit;

    const followingData = await this.db.query.follow.findMany({
      where: eq(schema.follow.followerId, targetUserId),
      limit,
      offset,
      orderBy: [desc(schema.follow.createdAt)],
      with: { following: true },
    });

    // Extract user objects and filter out the "Self" (current viewer)
    const rawUsers = followingData
      .map((f) => f.following)
      .filter((u) => u.id !== currentViewerId); // Filter out self

    const formattedUsers = await this.enrichWithFollowStatus(
      rawUsers,
      currentViewerId,
    );

    return {
      data: formattedUsers,
      pagination: {
        page,
        limit,
        hasMore: followingData.length === limit,
      },
    };
  }

  /**
   * Takes a list of users and adds 'isFollowing' and 'isSelf' flags
   * while maintaining all original user fields.
   */
  private async enrichWithFollowStatus(
    users: User[],
    currentViewerId: string | null,
  ): Promise<EnhancedUser[]> {
    if (users.length === 0) return [];

    // If no one is logged in, all follow statuses are false
    if (!currentViewerId) {
      return users.map((u) => ({
        ...u,
        isFollowing: false,
        isSelf: false,
      }));
    }

    const userIds = users.map((u) => u.id);

    // Fetch all follow relationships between the viewer and this list of users in one query
    const relationships = await this.db.query.follow.findMany({
      where: and(
        eq(schema.follow.followerId, currentViewerId),
        inArray(schema.follow.followingId, userIds),
      ),
      columns: { followingId: true },
    });

    const followedSet = new Set(relationships.map((r) => r.followingId));

    return users.map((u) => ({
      ...u, // Spreading the full user object (bio, counts, theme, etc.)
      isFollowing: followedSet.has(u.id),
      isSelf: u.id === currentViewerId,
    }));
  }

  async getFollowStatus(followerId: string, targetUserId: string) {
    const follow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, targetUserId),
      ),
    });

    return {
      isFollowing: !!follow,
      isSelf: followerId === targetUserId,
    };
  }
}
