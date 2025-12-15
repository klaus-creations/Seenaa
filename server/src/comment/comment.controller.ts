import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ReactionsService } from '../post/reactions.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments.dto';
import { CreateReactionDto } from '../post/dto/create-reaction.dto';
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(session.user.id, createCommentDto);
  }

  //  Get top-level comments for a specific post
  //  *GET /comment/post/:postId
  @Get('post/:postId')
  @OptionalAuth()
  async findAllByPost(
    @Param('postId') postId: string,
    @Session() session: UserSession | undefined,
    @Query() query: GetCommentsQueryDto,
  ) {
    const userId = session?.user?.id || null;
    return this.commentService.getPostComments(postId, userId, query);
  }

  //   Get replies for a specific comment
  //  GET /comment/:id/replies
  @Get(':id/replies')
  @OptionalAuth()
  async findReplies(
    @Param('id') commentId: string,
    @Session() session: UserSession | undefined,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = session?.user?.id || null;
    // Default limit/offset if not provided
    return this.commentService.getReplies(
      commentId,
      userId,
      limit || 10,
      offset || 0,
    );
  }

  @Get(':id')
  @OptionalAuth()
  async findOne(
    @Param('id') id: string,
    @Session() session: UserSession | undefined,
  ) {
    const userId = session?.user?.id || null;
    return this.commentService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, session.user.id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.commentService.remove(id, session.user.id);
  }

  //  Toggle reaction on a comment
  //  POST /comment/:id/reactions
  @Post(':id/reactions')
  toggleReaction(
    @Param('id') commentId: string,
    @Session() session: UserSession,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.reactionsService.toggleCommentReaction(
      session.user.id,
      commentId,
      createReactionDto.reactionType,
    );
  }

  // Get Reaction counts
  @Get(':id/reactions')
  @OptionalAuth()
  async getReactions(@Param('id') commentId: string) {
    return this.reactionsService.getCommentReactionCounts(commentId);
  }
}
