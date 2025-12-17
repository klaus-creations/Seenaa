import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Session,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth'; // Adjust auth import as needed
import type { UserSession } from '@thallesp/nestjs-better-auth';

// DTO Imports (Ensure these exist in your project)
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/community-query.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { UpdateMemberRoleDto, BanMemberDto } from './dto/manage-member.dto'; // NEW
import { UpdateSettingsDto } from './dto/update-settings.dto'; // NEW
import { CreateReportDto } from './dto/report.dto'; // NEW

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ==========================
  // CORE: Create & Discover
  // ==========================

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() createCommunityDto: CreateCommunityDto,
  ) {
    return this.communityService.create(session.user.id, createCommunityDto);
  }

  @Get()
  @OptionalAuth()
  async findAll(@Query() query: CommunityQueryDto) {
    return this.communityService.findAll(query);
  }

  @Get(':id')
  @OptionalAuth()
  async findOne(
    @Param('id') id: string,
    @Session() session: UserSession | undefined,
  ) {
    const userId = session?.user?.id || null;
    return this.communityService.findOne(id, userId);
  }

  // ==========================
  // ACTIONS: Join & Leave
  // ==========================

  @Post(':id/join')
  async join(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() joinDto: JoinCommunityDto,
  ) {
    return this.communityService.join(id, session.user.id, joinDto);
  }

  @Post(':id/leave')
  async leave(@Param('id') id: string, @Session() session: UserSession) {
    return this.communityService.leave(id, session.user.id);
  }

  // ==========================
  // MANAGEMENT: Requests (Admin)
  // ==========================

  @Get(':id/requests')
  async getRequests(@Param('id') id: string, @Session() session: UserSession) {
    return this.communityService.getPendingRequests(id, session.user.id);
  }

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

  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Query('filter') filter: 'all' | 'banned' | 'admin' | 'pending' = 'all',
  ) {
    return this.communityService.getMembers(id, session.user.id, filter);
  }

  // Promote/Demote/Update Permissions
  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Session() session: UserSession,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.communityService.updateMemberRole(
      session.user.id,
      id,
      targetUserId,
      dto,
    );
  }

  // Ban a user
  @Post(':id/members/:userId/ban')
  async banMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Session() session: UserSession,
    @Body() dto: BanMemberDto,
  ) {
    return this.communityService.banMember(
      session.user.id,
      id,
      targetUserId,
      dto.reason,
    );
  }

  // ==========================
  // SETTINGS & REPORTING
  // ==========================

  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.communityService.updateSettings(session.user.id, id, dto);
  }

  @Post(':id/report')
  async reportContent(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() dto: CreateReportDto,
  ) {
    return this.communityService.createReport(session.user.id, id, dto);
  }
}
