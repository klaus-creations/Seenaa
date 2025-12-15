import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import {
  eq,
  and,
  desc,
  sql,
  isNull,
  inArray,
  InferSelectModel,
  count,
} from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto, FeedType } from './dto/paginated-posts.dto';
import { AuthorDto, PostResponseDto } from './dto/post-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

type ReactionType = 'thumbs_up' | 'thumbs_down' | null;

type PostWithAuthor = InferSelectModel<typeof schema.post> & {
  user: AuthorDto;
};

@Injectable()
export class PostsService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const { content, images, communityId } = createPostDto;

    const mentions = this.extractMentions(content);
    const hashtags = this.extractHashtags(content);

    if (communityId) {
      const membership = await this.db.query.communityMember.findFirst({
        where: and(
          eq(schema.communityMember.communityId, communityId),
          eq(schema.communityMember.userId, userId),
          eq(schema.communityMember.status, 'active'),
        ),
      });

      if (!membership) {
        throw new ForbiddenException(
          'You must be a member of this community to post',
        );
      }
    }

    const now = new Date();
    const newPostId = uuidv4();

    // Insert Post
    const [newPost] = (await this.db
      .insert(schema.post)
      .values({
        id: newPostId,
        userId,
        content,
        images: images || null,
        communityId: communityId || null,
        mentions: mentions.length > 0 ? mentions : null,
        hashtags: hashtags.length > 0 ? hashtags : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()) as InferSelectModel<typeof schema.post>[];

    // Update Community Counts
    if (communityId) {
      await this.db
        .update(schema.community)
        .set({
          postCount: sql`${schema.community.postCount} + 1`,
          updatedAt: now,
        })
        .where(eq(schema.community.id, communityId));
    }

    // ============================================================
    // 🔥 NOTIFICATION LOGIC (Mentions)
    // ============================================================
    if (mentions.length > 0) {
      // 1. Resolve usernames to User IDs
      const mentionedUsers = await this.db.query.user.findMany({
        where: inArray(schema.user.username, mentions),
        columns: { id: true },
      });

      // 2. Emit events
      for (const user of mentionedUsers) {
        if (user.id !== userId) {
          // Don't notify self
          this.eventEmitter.emit('notification.create', {
            recipientId: user.id,
            actorId: userId,
            type: 'mention_in_post',
            targetId: newPostId,
            targetType: 'post',
            content: 'mentioned you in a post',
            actionUrl: `/post/${newPostId}`,
          });
        }
      }
    }
    // ============================================================

    const authorRecord = await this.db.query.user.findFirst({
      where: eq(schema.user.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    if (!authorRecord) throw new ForbiddenException('Author not found');

    const author: AuthorDto = {
      id: authorRecord.id,
      name: authorRecord.name,
      image: authorRecord.image,
    };

    return this.formatPostResponse({ ...newPost, user: author }, author, null);
  }

  // ... (Rest of the service remains exactly the same below)

  async getFeed(userId: string | null, query: GetPostsQueryDto) {
    const { limit = 20, page = 1, feedType, communityId } = query;
    const offset = (page - 1) * limit;

    let posts: PostWithAuthor[] = [];
    let total = 0;

    if (communityId) {
      ({ posts, total } = await this.getCommunityFeed(
        communityId,
        limit,
        offset,
      ));
    } else {
      switch (feedType) {
        case FeedType.FOLLOWING:
          ({ posts, total } = await this.getFollowingFeed(
            userId,
            limit,
            offset,
          ));
          break;

        case FeedType.TRENDING:
          ({ posts, total } = await this.getTrendingFeed(limit, offset));
          break;

        case FeedType.FRESH:
          ({ posts, total } = await this.getFreshFeed(limit, offset));
          break;

        case FeedType.FOR_YOU:
        default:
          ({ posts, total } = await this.getForYouFeed(userId, limit, offset));
      }
    }

    return this.processPostsAndReactions(
      posts,
      total,
      userId,
      page,
      limit,
      offset,
    );
  }

  async getUserPosts(
    targetUserId: string,
    viewerId: string | null,
    query: GetPostsQueryDto,
  ) {
    const { limit = 20, page = 1 } = query;
    const offset = (page - 1) * limit;

    const posts = await this.db.query.post.findMany({
      where: and(
        eq(schema.post.userId, targetUserId),
        isNull(schema.post.deletedAt),
      ),
      with: { user: true },
      orderBy: [desc(schema.post.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: count() })
      .from(schema.post)
      .where(
        and(
          eq(schema.post.userId, targetUserId),
          isNull(schema.post.deletedAt),
        ),
      );

    const total = Number(countResult?.count || 0);

    return this.processPostsAndReactions(
      posts,
      total,
      viewerId,
      page,
      limit,
      offset,
    );
  }

  async findOne(postId: string, userId: string | null) {
    const post = await this.db.query.post.findFirst({
      where: and(eq(schema.post.id, postId), isNull(schema.post.deletedAt)),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    await this.db
      .update(schema.post)
      .set({ viewCount: sql`${schema.post.viewCount} + 1` })
      .where(eq(schema.post.id, postId));

    let userReaction: ReactionType = null;

    if (userId) {
      const reaction = await this.db.query.reaction.findFirst({
        where: and(
          eq(schema.reaction.targetId, postId),
          eq(schema.reaction.userId, userId),
          eq(schema.reaction.targetType, 'post'),
        ),
      });

      userReaction = reaction?.reactionType || null;
    }

    return this.formatPostResponse(post, post.user, userReaction);
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.db.query.post.findFirst({
      where: and(eq(schema.post.id, postId), isNull(schema.post.deletedAt)),
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You can only edit your own posts');

    const { content, images } = updatePostDto;
    const now = new Date();

    let mentions = post.mentions;
    let hashtags = post.hashtags;

    if (content) {
      mentions = this.extractMentions(content);
      hashtags = this.extractHashtags(content);
    }

    const [updatedPost] = await this.db
      .update(schema.post)
      .set({
        content: content || post.content,
        images: images !== undefined ? images : post.images,
        mentions: mentions?.length ? mentions : null,
        hashtags: hashtags?.length ? hashtags : null,
        editedAt: now,
        updatedAt: now,
      })
      .where(eq(schema.post.id, postId))
      .returning();

    const author = await this.db.query.user.findFirst({
      where: eq(schema.user.id, userId),
      columns: { id: true, name: true, image: true },
    });

    const reaction = await this.db.query.reaction.findFirst({
      where: and(
        eq(schema.reaction.targetId, postId),
        eq(schema.reaction.userId, userId),
        eq(schema.reaction.targetType, 'post'),
      ),
    });

    return this.formatPostResponse(
      { ...updatedPost, user: author! },
      author!,
      reaction?.reactionType || null,
    );
  }

  async remove(postId: string, userId: string) {
    const post = await this.db.query.post.findFirst({
      where: and(eq(schema.post.id, postId), isNull(schema.post.deletedAt)),
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('You can only delete your own posts');

    await this.db
      .update(schema.post)
      .set({ deletedAt: new Date() })
      .where(eq(schema.post.id, postId));

    if (post.communityId) {
      await this.db
        .update(schema.community)
        .set({
          postCount: sql`${schema.community.postCount} - 1`,
        })
        .where(eq(schema.community.id, post.communityId));
    }

    return { message: 'Post deleted successfully' };
  }

  // ==============================
  // HELPER TO PROCESS POST LISTS
  // ==============================
  private async processPostsAndReactions(
    posts: PostWithAuthor[],
    total: number,
    userId: string | null,
    page: number,
    limit: number,
    offset: number,
  ) {
    let userReactions: Map<string, ReactionType> = new Map();
    if (userId && posts.length > 0) {
      userReactions = await this.getUserReactionsForPosts(
        userId,
        posts.map((p) => p.id),
      );
    }

    const formattedPosts = posts.map((post) =>
      this.formatPostResponse(
        post,
        post.user,
        userReactions.get(post.id) || null,
      ),
    );

    return {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    };
  }

  // ==============================
  // FEED HELPERS
  // ==============================
  private async getForYouFeed(
    userId: string | null,
    limit: number,
    offset: number,
  ) {
    const posts = await this.db.query.post.findMany({
      where: and(
        isNull(schema.post.deletedAt),
        isNull(schema.post.communityId),
      ),
      with: {
        user: true,
      },
      orderBy: [
        desc(
          sql`(${schema.post.thumbsUpCount} * 2 + ${schema.post.commentCount} * 3 - ${schema.post.thumbsDownCount}) / (EXTRACT(EPOCH FROM (NOW() - ${schema.post.createdAt})) / 3600 + 2) ^ 1.5`,
        ),
      ],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.post)
      .where(
        and(isNull(schema.post.deletedAt), isNull(schema.post.communityId)),
      );

    return { posts, total: countResult.count };
  }

  private async getFollowingFeed(
    userId: string | null,
    limit: number,
    offset: number,
  ) {
    if (!userId) return this.getFreshFeed(limit, offset);

    const follows = await this.db.query.follow.findMany({
      where: eq(schema.follow.followerId, userId),
      columns: { followingId: true },
    });

    const followedUserIds = follows.map((f) => f.followingId);

    if (!followedUserIds.length) return { posts: [], total: 0 };

    const posts = await this.db.query.post.findMany({
      where: and(
        isNull(schema.post.deletedAt),
        isNull(schema.post.communityId),
        inArray(schema.post.userId, followedUserIds),
      ),
      with: { user: true },
      orderBy: [desc(schema.post.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.post)
      .where(
        and(
          isNull(schema.post.deletedAt),
          isNull(schema.post.communityId),
          inArray(schema.post.userId, followedUserIds),
        ),
      );

    return { posts, total: countResult.count };
  }

  private async getTrendingFeed(limit: number, offset: number) {
    const oneDayAgo = new Date(Date.now() - 86400000);

    const posts = await this.db.query.post.findMany({
      where: and(
        isNull(schema.post.deletedAt),
        isNull(schema.post.communityId),
        sql`${schema.post.createdAt} >= ${oneDayAgo}`,
      ),
      with: { user: true },
      orderBy: [
        desc(
          sql`${schema.post.thumbsUpCount} + ${schema.post.commentCount} * 2`,
        ),
      ],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.post)
      .where(
        and(
          isNull(schema.post.deletedAt),
          isNull(schema.post.communityId),
          sql`${schema.post.createdAt} >= ${oneDayAgo}`,
        ),
      );

    return { posts, total: countResult.count };
  }

  private async getFreshFeed(limit: number, offset: number) {
    const posts = await this.db.query.post.findMany({
      where: and(
        isNull(schema.post.deletedAt),
        isNull(schema.post.communityId),
      ),
      with: { user: true },
      orderBy: [desc(schema.post.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.post)
      .where(
        and(isNull(schema.post.deletedAt), isNull(schema.post.communityId)),
      );

    return { posts, total: countResult.count };
  }

  private async getCommunityFeed(
    communityId: string,
    limit: number,
    offset: number,
  ) {
    const posts = await this.db.query.post.findMany({
      where: and(
        isNull(schema.post.deletedAt),
        eq(schema.post.communityId, communityId),
      ),
      with: { user: true },
      orderBy: [desc(schema.post.isPinned), desc(schema.post.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.post)
      .where(
        and(
          isNull(schema.post.deletedAt),
          eq(schema.post.communityId, communityId),
        ),
      );

    return { posts, total: countResult.count };
  }

  private async getUserReactionsForPosts(userId: string, postIds: string[]) {
    const reactions = await this.db.query.reaction.findMany({
      where: and(
        eq(schema.reaction.userId, userId),
        inArray(schema.reaction.targetId, postIds),
        eq(schema.reaction.targetType, 'post'),
      ),
    });

    const map = new Map<string, ReactionType>();
    reactions.forEach((r) => map.set(r.targetId, r.reactionType));
    return map;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const out: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(content))) {
      out.push(match[1]);
    }

    return [...new Set(out)];
  }

  private extractHashtags(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const out: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(content))) {
      out.push(match[1]);
    }

    return [...new Set(out)];
  }

  private formatPostResponse(
    post: PostWithAuthor,
    author: AuthorDto,
    userReaction: ReactionType,
  ): PostResponseDto {
    return {
      id: post.id,
      content: post.content,
      images: post.images,
      communityId: post.communityId,
      viewCount: post.viewCount,
      thumbsUpCount: post.thumbsUpCount,
      thumbsDownCount: post.thumbsDownCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
      mentions: post.mentions,
      hashtags: post.hashtags,
      isPinned: post.isPinned,
      author,
      userReaction,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      editedAt: post.editedAt,
    };
  }
}
