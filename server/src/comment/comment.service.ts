import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  eq,
  and,
  desc,
  asc,
  sql,
  isNull,
  inArray,
  InferSelectModel,
} from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

// DTOs
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments.dto';
import {
  AuthorDto,
  CommentResponseDto,
  ReactionType,
} from './dto/comment-response.dto';
import { NotificationEvent } from '../notifications/notification.event';

type CommentWithAuthor = InferSelectModel<typeof schema.comment> & {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

@Injectable()
export class CommentService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private eventEmitter: EventEmitter2, // 👈 INJECT THIS
  ) {}

  /**
   * Create a new comment or reply
   */
  async create(userId: string, createCommentDto: CreateCommentDto) {
    const { postId, content, parentCommentId } = createCommentDto;

    // 1. Validate Post Exists
    const post = await this.db.query.post.findFirst({
      where: and(eq(schema.post.id, postId), isNull(schema.post.deletedAt)),
      columns: { id: true, userId: true }, // Ensure we fetch userId (owner)
    });

    if (!post) throw new NotFoundException('Post not found');

    // 2. Handle Threading & Depth Validation
    let depth = 0;
    let validParentId: string | null = null;
    let parentCommentAuthorId: string | null = null; // Store for notification

    if (parentCommentId) {
      const parentComment = await this.db.query.comment.findFirst({
        where: and(
          eq(schema.comment.id, parentCommentId),
          isNull(schema.comment.deletedAt),
        ),
        columns: { id: true, depth: true, userId: true }, // Ensure userId
      });

      if (!parentComment)
        throw new NotFoundException('Parent comment not found');

      depth = parentComment.depth + 1;
      validParentId = parentCommentId;
      parentCommentAuthorId = parentComment.userId;

      if (depth > 2) {
        throw new BadRequestException(
          'Maximum comment depth reached. You cannot reply to this comment.',
        );
      }
    }

    // 3. Prepare Data
    const mentions = this.extractMentions(content);
    const now = new Date();
    const commentId = uuidv4();

    // 4. Insert Comment
    await this.db
      .insert(schema.comment)
      .values({
        id: commentId,
        postId,
        userId,
        parentCommentId: validParentId,
        content,
        depth,
        mentions: mentions.length > 0 ? mentions : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // 5. Update Counters Atomically
    await this.db
      .update(schema.post)
      .set({
        commentCount: sql`${schema.post.commentCount} + 1`,
        updatedAt: now,
      })
      .where(eq(schema.post.id, postId));

    if (validParentId) {
      await this.db
        .update(schema.comment)
        .set({ replyCount: sql`${schema.comment.replyCount} + 1` })
        .where(eq(schema.comment.id, validParentId));
    }

    // ============================================================
    // 🔥 NOTIFICATION LOGIC START
    // ============================================================

    // A. Notify Post Owner (If top-level comment AND not own post)
    if (!validParentId && post.userId !== userId) {
      this.emitNotification({
        recipientId: post.userId,
        actorId: userId,
        type: 'comment_on_post',
        targetId: postId,
        targetType: 'post',
        content: 'commented on your post',
        actionUrl: `/post/${postId}`,
      });
    }

    if (
      validParentId &&
      parentCommentAuthorId &&
      parentCommentAuthorId !== userId
    ) {
      this.emitNotification({
        recipientId: parentCommentAuthorId,
        actorId: userId,
        type: 'reply_to_comment',
        targetId: postId, // Navigate to post
        targetType: 'post', // Usually we link to the post context
        content: 'replied to your comment',
        actionUrl: `/post/${postId}?commentId=${commentId}`, // Deep link
      });
    }

    if (mentions.length > 0) {
      // Find User IDs for these usernames
      const mentionedUsers = await this.db.query.user.findMany({
        where: inArray(schema.user.username, mentions),
        columns: { id: true },
      });

      for (const user of mentionedUsers) {
        if (user.id !== userId) {
          // Don't notify self
          this.emitNotification({
            recipientId: user.id,
            actorId: userId,
            type: 'mention_in_comment',
            targetId: postId,
            targetType: 'post',
            content: 'mentioned you in a comment',
            actionUrl: `/post/${postId}?commentId=${commentId}`,
          });
        }
      }
    }
    // ============================================================
    // 🔥 NOTIFICATION LOGIC END
    // ============================================================

    return this.findOne(commentId, userId);
  }

  /**
   * Helper to emit typed events safely
   */
  private emitNotification(payload: NotificationEvent) {
    this.eventEmitter.emit('notification.create', payload);
  }

  // ... (Rest of your existing methods: getPostComments, getReplies, findOne, update, remove...)
  // ... (Keep them exactly as they were in your previous code)

  async getPostComments(
    postId: string,
    userId: string | null,
    query: GetCommentsQueryDto,
  ) {
    // ... (Your existing implementation)
    const { limit = 20, page = 1, sort = 'newest' } = query;
    const offset = (page - 1) * limit;

    const orderBy =
      sort === 'newest'
        ? [desc(schema.comment.createdAt)]
        : [desc(schema.comment.thumbsUpCount), desc(schema.comment.createdAt)];

    const comments = await this.db.query.comment.findMany({
      where: and(
        eq(schema.comment.postId, postId),
        isNull(schema.comment.parentCommentId),
        isNull(schema.comment.deletedAt),
      ),
      with: {
        user: { columns: { id: true, name: true, image: true } },
      },
      orderBy,
      limit,
      offset,
    });

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.comment)
      .where(
        and(
          eq(schema.comment.postId, postId),
          isNull(schema.comment.parentCommentId),
          isNull(schema.comment.deletedAt),
        ),
      );

    let userReactions = new Map<string, ReactionType>();
    if (userId && comments.length > 0) {
      userReactions = await this.getUserReactionsForComments(
        userId,
        comments.map((c) => c.id),
      );
    }

    const formattedComments = comments.map((c) =>
      this.formatCommentResponse(c, c.user, userReactions.get(c.id) || null),
    );

    return {
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit),
        hasMore: offset + limit < countResult.count,
      },
    };
  }

  async getReplies(
    commentId: string,
    userId: string | null,
    limit = 10,
    offset = 0,
  ) {
    // ... (Your existing implementation)
    const replies = await this.db.query.comment.findMany({
      where: and(
        eq(schema.comment.parentCommentId, commentId),
        isNull(schema.comment.deletedAt),
      ),
      with: { user: { columns: { id: true, name: true, image: true } } },
      orderBy: [asc(schema.comment.createdAt)],
      limit,
      offset,
    });

    let userReactions = new Map<string, ReactionType>();
    if (userId && replies.length > 0) {
      userReactions = await this.getUserReactionsForComments(
        userId,
        replies.map((r) => r.id),
      );
    }

    return replies.map((r) =>
      this.formatCommentResponse(r, r.user, userReactions.get(r.id) || null),
    );
  }

  async findOne(commentId: string, userId: string | null) {
    // ... (Your existing implementation)
    const comment = await this.db.query.comment.findFirst({
      where: and(
        eq(schema.comment.id, commentId),
        isNull(schema.comment.deletedAt),
      ),
      with: { user: { columns: { id: true, name: true, image: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    let userReaction: ReactionType = null;
    if (userId) {
      const reaction = await this.db.query.reaction.findFirst({
        where: and(
          eq(schema.reaction.targetId, commentId),
          eq(schema.reaction.userId, userId),
          eq(schema.reaction.targetType, 'comment'),
        ),
      });
      userReaction = (reaction?.reactionType as ReactionType) || null;
    }
    return this.formatCommentResponse(comment, comment.user, userReaction);
  }

  async update(commentId: string, userId: string, updateDto: UpdateCommentDto) {
    // ... (Your existing implementation)
    const comment = await this.db.query.comment.findFirst({
      where: and(
        eq(schema.comment.id, commentId),
        isNull(schema.comment.deletedAt),
      ),
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('You can only edit your own comments');

    const { content } = updateDto;
    const mentions = content ? this.extractMentions(content) : comment.mentions;

    const [updatedComment] = await this.db
      .update(schema.comment)
      .set({
        content: content || comment.content,
        mentions: mentions,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.comment.id, commentId))
      .returning();
    const author = await this.db.query.user.findFirst({
      where: eq(schema.user.id, userId),
      columns: { id: true, name: true, image: true },
    });
    const reaction = await this.db.query.reaction.findFirst({
      where: and(
        eq(schema.reaction.targetId, commentId),
        eq(schema.reaction.userId, userId),
        eq(schema.reaction.targetType, 'comment'),
      ),
    });

    return this.formatCommentResponse(
      { ...updatedComment, user: author! },
      author!,
      (reaction?.reactionType as ReactionType) || null,
    );
  }

  async remove(commentId: string, userId: string) {
    // ... (Your existing implementation)
    const comment = await this.db.query.comment.findFirst({
      where: and(
        eq(schema.comment.id, commentId),
        isNull(schema.comment.deletedAt),
      ),
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('You can only delete your own comments');

    await this.db
      .update(schema.comment)
      .set({ deletedAt: new Date() })
      .where(eq(schema.comment.id, commentId));
    await this.db
      .update(schema.post)
      .set({ commentCount: sql`${schema.post.commentCount} - 1` })
      .where(eq(schema.post.id, comment.postId));
    if (comment.parentCommentId) {
      await this.db
        .update(schema.comment)
        .set({ replyCount: sql`${schema.comment.replyCount} - 1` })
        .where(eq(schema.comment.id, comment.parentCommentId));
    }
    return { message: 'Comment deleted successfully' };
  }

  // ... (Keep existing helpers)
  private async getUserReactionsForComments(
    userId: string,
    commentIds: string[],
  ): Promise<Map<string, ReactionType>> {
    if (commentIds.length === 0) return new Map();
    const reactions = await this.db.query.reaction.findMany({
      where: and(
        eq(schema.reaction.userId, userId),
        inArray(schema.reaction.targetId, commentIds),
        eq(schema.reaction.targetType, 'comment'),
      ),
    });
    const map = new Map<string, ReactionType>();
    reactions.forEach((r) =>
      map.set(r.targetId, r.reactionType as ReactionType),
    );
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

  private formatCommentResponse(
    comment: CommentWithAuthor,
    author: AuthorDto,
    userReaction: ReactionType,
  ): CommentResponseDto {
    return {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      thumbsUpCount: comment.thumbsUpCount,
      thumbsDownCount: comment.thumbsDownCount,
      replyCount: comment.replyCount,
      depth: comment.depth,
      mentions: comment.mentions,
      author,
      userReaction,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      editedAt: comment.editedAt,
    };
  }
}
