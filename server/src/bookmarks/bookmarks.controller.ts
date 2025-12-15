import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { BookmarksService } from './bookmarks.service';
import { GetBookmarksQueryDto } from './dto/get-bookmarks-query.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':postId')
  @HttpCode(HttpStatus.OK)
  async toggleBookmark(
    @Session() session: UserSession,
    @Param('postId') postId: string,
  ) {
    return this.bookmarksService.toggleBookmark(session.user.id, postId);
  }

  async getUserBookmarks(
    @Session() session: UserSession,
    @Query() query: GetBookmarksQueryDto,
  ) {
    return this.bookmarksService.getUserBookmarks(session.user.id, query);
  }

  @Get(':postId/check')
  async checkIsBookmarked(
    @Session() session: UserSession,
    @Param('postId') postId: string,
  ) {
    return this.bookmarksService.checkIsBookmarked(session.user.id, postId);
  }
}
