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
import { FollowUserResponseDto } from './dto/follow-response.dto';

type User = InferSelectModel<typeof schema.user>;

@Injectable()
export class FollowService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private eventEmitter: EventEmitter2, // 👈 INJECT THIS
  ) {}

  /**
   * Follow a user
   */
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // 1. Check if user exists
    const targetUser = await this.db.query.user.findFirst({
      where: eq(schema.user.id, followingId),
    });

    if (!targetUser) throw new NotFoundException('User to follow not found');

    // 2. Check if already following
    const existingFollow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, followingId),
      ),
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
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
        .set({
          followingCount: sql`${schema.user.followingCount} + 1`,
        })
        .where(eq(schema.user.id, followerId));

      await tx
        .update(schema.user)
        .set({
          followerCount: sql`${schema.user.followerCount} + 1`,
        })
        .where(eq(schema.user.id, followingId));
    });

    // 🔥 NOTIFICATION LOGIC
    console.log('🔥 Emitting follow notification:', {
      recipientId: followingId,
      actorId: followerId,
      type: 'new_follower',
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

  //  Unfollow a user

  async unfollow(followerId: string, followingId: string) {
    const existingFollow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, followingId),
      ),
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this user');
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
        .set({
          followingCount: sql`${schema.user.followingCount} - 1`,
        })
        .where(eq(schema.user.id, followerId));

      await tx
        .update(schema.user)
        .set({
          followerCount: sql`${schema.user.followerCount} - 1`,
        })
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

    if (!followersData.length) {
      return { data: [], pagination: { page, limit, hasMore: false } };
    }

    const users = followersData.map((f) => f.follower);
    const formattedUsers = await this.enrichWithFollowStatus(
      users,
      currentViewerId,
    );

    return {
      data: formattedUsers,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit,
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

    if (!followingData.length) {
      return { data: [], pagination: { page, limit, hasMore: false } };
    }

    const users = followingData.map((f) => f.following);
    const formattedUsers = await this.enrichWithFollowStatus(
      users,
      currentViewerId,
    );

    return {
      data: formattedUsers,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit,
      },
    };
  }

  async getFollowStatus(followerId: string, targetUserId: string) {
    const follow = await this.db.query.follow.findFirst({
      where: and(
        eq(schema.follow.followerId, followerId),
        eq(schema.follow.followingId, targetUserId),
      ),
    });

    return { isFollowing: !!follow };
  }

  private async enrichWithFollowStatus(
    users: User[],
    currentViewerId: string | null,
  ): Promise<FollowUserResponseDto[]> {
    if (!currentViewerId || users.length === 0) {
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        isFollowing: false,
      }));
    }

    const userIds = users.map((u) => u.id);

    const relationships = await this.db.query.follow.findMany({
      where: and(
        eq(schema.follow.followerId, currentViewerId),
        inArray(schema.follow.followingId, userIds),
      ),
      columns: { followingId: true },
    });

    const followedSet = new Set(relationships.map((r) => r.followingId));

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      isFollowing: followedSet.has(u.id),
    }));
  }
}
