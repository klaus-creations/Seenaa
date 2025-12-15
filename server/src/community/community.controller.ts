import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/community-query.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * Create a new community
   * POST /community
   */
  @Post()
  async create(
    @Session() session: UserSession,
    @Body() createCommunityDto: CreateCommunityDto,
  ) {
    return this.communityService.create(session.user.id, createCommunityDto);
  }

  /**
   * Discover communities (Pagination + Search)
   * GET /community
   */
  @Get()
  @OptionalAuth()
  async findAll(@Query() query: CommunityQueryDto) {
    return this.communityService.findAll(query);
  }

  /**
   * Get specific community by ID or Slug
   * GET /community/:idOrSlug
   */
  @Get(':id')
  @OptionalAuth()
  async findOne(
    @Param('id') id: string,
    @Session() session: UserSession | undefined,
  ) {
    const userId = session?.user?.id || null;
    return this.communityService.findOne(id, userId);
  }

  /**
   * Join a community
   * POST /community/:id/join
   */
  @Post(':id/join')
  async join(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() joinDto: JoinCommunityDto,
  ) {
    return this.communityService.join(id, session.user.id, joinDto);
  }

  /**
   * Leave a community
   * POST /community/:id/leave
   */
  @Post(':id/leave')
  async leave(@Param('id') id: string, @Session() session: UserSession) {
    return this.communityService.leave(id, session.user.id);
  }

  /**
   * Update community settings
   * PATCH /community/:id
   * Note: Service should verify Admin role inside the update method (not implemented fully in service for brevity, but pattern is same as review)
   */
  /*
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communityService.update(id, session.user.id, updateCommunityDto);
  }
  */

  /**
   * Get Pending Join Requests (Admin Only)
   * GET /community/:id/requests
   */
  @Get(':id/requests')
  async getRequests(@Param('id') id: string, @Session() session: UserSession) {
    return this.communityService.getPendingRequests(id, session.user.id);
  }

  /**
   * Review a Join Request (Approve/Reject)
   * POST /community/requests/:requestId/review
   */
  @Post('requests/:requestId/review')
  async reviewRequest(
    @Param('requestId') requestId: string,
    @Session() session: UserSession,
    @Body() reviewDto: ReviewRequestDto,
  ) {
    return this.communityService.reviewJoinRequest(
      session.user.id,
      requestId,
      reviewDto,
    );
  }
}
