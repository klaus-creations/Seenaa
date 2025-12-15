import { Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { GetFollowsQueryDto } from './dto/get-follows.dto';
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  /**
   * Follow a user
   * POST /users/:id/follow
   */
  @Post(':id/follow')
  async followUser(
    @Param('id') targetId: string,
    @Session() session: UserSession,
  ) {
    console.log('🚀 Follow request received:', {
      followerId: session.user.id,
      targetId,
      userEmail: session.user.email,
    });

    const result = await this.followService.follow(session.user.id, targetId);
    console.log('✅ Follow result:', result);
    return result;
  }

  /**
   * Unfollow a user
   * DELETE /users/:id/follow
   */
  @Delete(':id/follow')
  async unfollowUser(
    @Param('id') targetId: string,
    @Session() session: UserSession,
  ) {
    return this.followService.unfollow(session.user.id, targetId);
  }

  /**
   * Get Followers of a user
   * GET /users/:id/followers
   */
  @Get(':id/followers')
  @OptionalAuth()
  async getFollowers(
    @Param('id') userId: string,
    @Query() query: GetFollowsQueryDto,
    @Session() session: UserSession | undefined,
  ) {
    const viewerId = session?.user?.id || null;
    return this.followService.getFollowers(userId, viewerId, query);
  }

  /**
   * Get Following list of a user
   * GET /users/:id/following
   */
  @Get(':id/following')
  @OptionalAuth()
  async getFollowing(
    @Param('id') userId: string,
    @Query() query: GetFollowsQueryDto,
    @Session() session: UserSession | undefined,
  ) {
    const viewerId = session?.user?.id || null;
    return this.followService.getFollowing(userId, viewerId, query);
  }

  /**
   * Check if current logged-in user follows specific user
   * GET /users/:id/follow-status
   */
  @Get(':id/follow-status')
  async getFollowStatus(
    @Param('id') targetId: string,
    @Session() session: UserSession,
  ) {
    return this.followService.getFollowStatus(session.user.id, targetId);
  }
}
