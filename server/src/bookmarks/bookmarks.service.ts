import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, desc, count, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { schema } from '../database/schema';
import { GetBookmarksQueryDto } from './dto/get-bookmarks-query.dto';
import { PostResponseDto } from '../post/dto/post-response.dto';

@Injectable()
export class BookmarksService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async toggleBookmark(userId: string, postId: string) {
    const postExists = await this.db.query.post.findFirst({
      where: eq(schema.post.id, postId),
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const existingBookmark = await this.db.query.bookmark.findFirst({
      where: and(
        eq(schema.bookmark.userId, userId),
        eq(schema.bookmark.postId, postId),
      ),
    });

    if (existingBookmark) {
      await this.db
        .delete(schema.bookmark)
        .where(eq(schema.bookmark.id, existingBookmark.id));

      return { isBookmarked: false, message: 'Bookmark removed' };
    } else {
      await this.db.insert(schema.bookmark).values({
        id: uuidv4(),
        userId,
        postId,
      });

      return { isBookmarked: true, message: 'Post bookmarked' };
    }
  }

  async getUserBookmarks(userId: string, query: GetBookmarksQueryDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const bookmarks = await this.db
      .select({
        post: schema.post,
        author: {
          id: schema.user.id,
          name: schema.user.name,
          image: schema.user.image,
          email: schema.user.email,
        },
        bookmarkDate: schema.bookmark.createdAt,
      })
      .from(schema.bookmark)
      .innerJoin(schema.post, eq(schema.bookmark.postId, schema.post.id))
      .innerJoin(schema.user, eq(schema.post.userId, schema.user.id))
      .where(eq(schema.bookmark.userId, userId))
      .orderBy(desc(schema.bookmark.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await this.db
      .select({ count: count() })
      .from(schema.bookmark)
      .where(eq(schema.bookmark.userId, userId));

    const total = Number(totalCount.count);

    const postIds = bookmarks.map((b) => b.post.id);
    let userReactionsMap = new Map<
      string,
      'thumbs_up' | 'thumbs_down' | null
    >();

    if (postIds.length > 0) {
      userReactionsMap = await this.getUserReactionsForPosts(userId, postIds);
    }

    const formattedPosts: PostResponseDto[] = bookmarks.map(
      ({ post, author }) => ({
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
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        editedAt: post.editedAt,
        author: {
          id: author.id,
          name: author.name,
          image: author.image,
        },
        userReaction: userReactionsMap.get(post.id) || null,
      }),
    );

    return {
      data: formattedPosts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
    };
  }

  async checkIsBookmarked(userId: string, postId: string) {
    const bookmark = await this.db.query.bookmark.findFirst({
      where: and(
        eq(schema.bookmark.userId, userId),
        eq(schema.bookmark.postId, postId),
      ),
    });

    return { isBookmarked: !!bookmark };
  }

  private async getUserReactionsForPosts(userId: string, postIds: string[]) {
    const reactions = await this.db.query.reaction.findMany({
      where: and(
        eq(schema.reaction.userId, userId),
        inArray(schema.reaction.targetId, postIds),
        eq(schema.reaction.targetType, 'post'),
      ),
    });

    const map = new Map<string, 'thumbs_up' | 'thumbs_down'>();
    reactions.forEach((r) => map.set(r.targetId, r.reactionType));
    return map;
  }
}
