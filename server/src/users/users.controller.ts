import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Post,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preference.dto';
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  /**
   * Search users by name/username
   * GET /user/search?q=something
   */
  @Get('search')
  @OptionalAuth()
  async search(@Query('q') query: string) {
    return this.userService.searchUsers(query);
  }

  /**
   * Get the currently logged-in user's private profile
   * GET /user/me
   */
  @Get('me')
  async getMe(@Session() session: UserSession) {
    return this.userService.findById(session.user.id);
  }

  /**
   * Update profile details (bio, display name, etc)
   * PATCH /user/me/profile
   */
  @Patch('me/profile')
  async updateProfile(
    @Session() session: UserSession,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(session.user.id, updateProfileDto);
  }

  /**
   * Update preferences (privacy, theme, etc)
   * PATCH /user/me/preferences
   */
  @Patch('me/preferences')
  async updatePreferences(
    @Session() session: UserSession,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.userService.updatePreferences(session.user.id, updatePreferencesDto);
  }

  /**
   * Get a public user profile
   * GET /user/:username
   */
  @Get(':username')
  @OptionalAuth()
  async getProfile(
    @Param('username') username: string,
    @Session() session: UserSession | undefined,
  ) {
    const viewerId = session?.user?.id;
    return this.userService.findByUsername(username, viewerId);
  }

  /**
   * Record a view on a profile
   * POST /user/:username/view
   */
  @Post(':username/view')
  @OptionalAuth()
  async recordView(
    @Param('username') username: string,
    @Session() session: UserSession | undefined,
  ) {
    const viewerId = session?.user?.id;
    return this.userService.incrementProfileView(username);
  }
}

