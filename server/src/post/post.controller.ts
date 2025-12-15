import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './post.service';
import { ReactionsService } from './reactions.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { GetPostsQueryDto } from './dto/paginated-posts.dto';
import { Session, OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly reactionsService: ReactionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 4))
  async create(
    @Session() session: UserSession,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false, // the post can be text only
        }),
    )
    files: Express.Multer.File[],
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadFiles(files);
      imageUrls = uploadResults.map((res) => res.secure_url);
    }

    const finalPostData = {
      ...createPostDto,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    };

    return this.postsService.create(session.user.id, finalPostData);
  }

  @Get()
  async findAll(
    @Session() session: UserSession | undefined,
    @Query() query: GetPostsQueryDto,
  ) {
    const userId = session?.user?.id || null;
    return this.postsService.getFeed(userId, query);
  }

  /**
   * Get current user's posts
   * GET /posts/me
   */
  @Get('me')
  async getMyPosts(
    @Session() session: UserSession,
    @Query() query: GetPostsQueryDto,
  ) {
    return this.postsService.getUserPosts(
      session.user.id,
      session.user.id,
      query,
    );
  }

  /**
   * Get specific user's posts
   * GET /posts/user/:userId
   */
  @Get('user/:userId')
  @OptionalAuth()
  async getPostsByUserId(
    @Param('userId') targetUserId: string,
    @Session() session: UserSession | undefined,
    @Query() query: GetPostsQueryDto,
  ) {
    const viewerId = session?.user?.id || null;
    return this.postsService.getUserPosts(targetUserId, viewerId, query);
  }

  // Get a single post by ID
  @Get(':id')
  @OptionalAuth()
  async findOne(
    @Param('id') id: string,
    @Session() session: UserSession | undefined,
  ) {
    const userId = session?.user?.id || null;
    return this.postsService.findOne(id, userId);
  }

  /**
   * Update a post
   * PATCH /posts/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    // Note: If you want to support uploading NEW images during update,
    // you would need to add the Interceptor here too and handle merging logic.
    return this.postsService.update(id, session.user.id, updatePostDto);
  }

  /**
   * Delete a post
   * DELETE /posts/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.postsService.remove(id, session.user.id);
  }

  /**
   * Toggle reaction on a post
   * POST /posts/:id/reactions
   */
  @Post(':id/reactions')
  async toggleReaction(
    @Param('id') postId: string,
    @Session() session: UserSession,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.reactionsService.togglePostReaction(
      session.user.id,
      postId,
      createReactionDto.reactionType,
    );
  }

  /**
   * Get reaction counts for a post
   * GET /posts/:id/reactions
   */
  @Get(':id/reactions')
  @OptionalAuth()
  async getReactions(@Param('id') postId: string) {
    return this.reactionsService.getPostReactionCounts(postId);
  }
}
