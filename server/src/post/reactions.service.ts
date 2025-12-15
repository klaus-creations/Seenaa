import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { schema } from '../database/schema';
import { ReactionType } from './dto/create-reaction.dto'; // Ensure this is the Enum

@Injectable()
export class ReactionsService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private eventEmitter: EventEmitter2,
  ) {}

  // ===========================================================================
  // POST REACTIONS
  // ===========================================================================

  /**
   * Toggle reaction on a post
   */
  async togglePostReaction(
    userId: string,
    postId: string,
    reactionType: ReactionType,
  ) {
    // Check if post exists
    const post = await this.db.query.post.findFirst({
      where: eq(schema.post.id, postId),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user already reacted
    const existingReaction = await this.db.query.reaction.findFirst({
      where: and(
        eq(schema.reaction.userId, userId),
        eq(schema.reaction.targetId, postId),
        eq(schema.reaction.targetType, 'post'),
      ),
    });

    if (existingReaction) {
      if ((existingReaction.reactionType as ReactionType) === reactionType) {
        // Remove reaction (toggle off)
        await this.db
          .delete(schema.reaction)
          .where(eq(schema.reaction.id, existingReaction.id));

        // Decrement count
        await this.updatePostReactionCount(postId, reactionType, -1);

        return {
          action: 'removed' as const,
          reaction: null,
          counts: await this.getPostReactionCounts(postId),
        };
      } else {
        // Change reaction
        await this.db
          .update(schema.reaction)
          .set({ reactionType })
          .where(eq(schema.reaction.id, existingReaction.id));

        // Update counts (decrement old, increment new)
        await this.updatePostReactionCount(
          postId,
          existingReaction.reactionType as ReactionType,
          -1,
        );
        await this.updatePostReactionCount(postId, reactionType, 1);

        // 🔥 EMIT NOTIFICATION EVENT (for the new reaction)
        await this.emitPostReactionNotification(userId, postId, reactionType);

        return {
          action: 'changed' as const,
          reaction: reactionType,
          counts: await this.getPostReactionCounts(postId),
        };
      }
    } else {
      // Add new reaction
      await this.db.insert(schema.reaction).values({
        id: uuidv4(),
        userId,
        targetId: postId,
        targetType: 'post',
        reactionType,
        createdAt: new Date(),
      });

      // Increment count
      await this.updatePostReactionCount(postId, reactionType, 1);

      // 🔥 EMIT NOTIFICATION EVENT
      await this.emitPostReactionNotification(userId, postId, reactionType);

      return {
        action: 'added' as const,
        reaction: reactionType,
        counts: await this.getPostReactionCounts(postId),
      };
    }
  }

  /**
   * Get post reaction counts
   */
  async getPostReactionCounts(postId: string) {
    const post = await this.db.query.post.findFirst({
      where: eq(schema.post.id, postId),
      columns: {
        thumbsUpCount: true,
        thumbsDownCount: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      thumbsUp: post.thumbsUpCount,
      thumbsDown: post.thumbsDownCount,
    };
  }

  /**
   * Helper: Update post reaction count
   */
  private async updatePostReactionCount(
    postId: string,
    reactionType: ReactionType,
    delta: number,
  ) {
    if (reactionType === ReactionType.THUMBS_UP) {
      await this.db
        .update(schema.post)
        .set({
          thumbsUpCount: sql`${schema.post.thumbsUpCount} + ${delta}`,
        })
        .where(eq(schema.post.id, postId));
    } else if (reactionType === ReactionType.THUMBS_DOWN) {
      await this.db
        .update(schema.post)
        .set({
          thumbsDownCount: sql`${schema.post.thumbsDownCount} + ${delta}`,
        })
        .where(eq(schema.post.id, postId));
    }
  }

  // ===========================================================================
  // COMMENT REACTIONS
  // ===========================================================================

  /**
   * Toggle reaction on a comment
   */
  async toggleCommentReaction(
    userId: string,
    commentId: string,
    reactionType: ReactionType,
  ) {
    // Check if comment exists
    const comment = await this.db.query.comment.findFirst({
      where: eq(schema.comment.id, commentId),
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user already reacted
    const existingReaction = await this.db.query.reaction.findFirst({
      where: and(
        eq(schema.reaction.userId, userId),
        eq(schema.reaction.targetId, commentId),
        eq(schema.reaction.targetType, 'comment'),
      ),
    });

    if (existingReaction) {
      if ((existingReaction.reactionType as ReactionType) === reactionType) {
        // Remove reaction (toggle off)
        await this.db
          .delete(schema.reaction)
          .where(eq(schema.reaction.id, existingReaction.id));

        // Decrement count
        await this.updateCommentReactionCount(commentId, reactionType, -1);

        return {
          action: 'removed' as const,
          reaction: null,
          counts: await this.getCommentReactionCounts(commentId),
        };
      } else {
        // Change reaction
        await this.db
          .update(schema.reaction)
          .set({ reactionType })
          .where(eq(schema.reaction.id, existingReaction.id));

        // Update counts (decrement old, increment new)
        await this.updateCommentReactionCount(
          commentId,
          existingReaction.reactionType as ReactionType,
          -1,
        );
        await this.updateCommentReactionCount(commentId, reactionType, 1);

        // 🔥 EMIT NOTIFICATION EVENT (for the new reaction)
        await this.emitCommentReactionNotification(userId, commentId, reactionType);

        return {
          action: 'changed' as const,
          reaction: reactionType,
          counts: await this.getCommentReactionCounts(commentId),
        };
      }
    } else {
      // Add new reaction
      await this.db.insert(schema.reaction).values({
        id: uuidv4(),
        userId,
        targetId: commentId,
        targetType: 'comment',
        reactionType,
        createdAt: new Date(),
      });

      // Increment count
      await this.updateCommentReactionCount(commentId, reactionType, 1);

      // 🔥 EMIT NOTIFICATION EVENT
      await this.emitCommentReactionNotification(userId, commentId, reactionType);

      return {
        action: 'added' as const,
        reaction: reactionType,
        counts: await this.getCommentReactionCounts(commentId),
      };
    }
  }

  /**
   * Get comment reaction counts
   */
  async getCommentReactionCounts(commentId: string) {
    const comment = await this.db.query.comment.findFirst({
      where: eq(schema.comment.id, commentId),
      columns: {
        thumbsUpCount: true,
        thumbsDownCount: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      thumbsUp: comment.thumbsUpCount,
      thumbsDown: comment.thumbsDownCount,
    };
  }

  /**
   * Helper: Update comment reaction count
   */
  private async updateCommentReactionCount(
    commentId: string,
    reactionType: ReactionType,
    delta: number,
  ) {
    if (reactionType === ReactionType.THUMBS_UP) {
      await this.db
        .update(schema.comment)
        .set({
          thumbsUpCount: sql`${schema.comment.thumbsUpCount} + ${delta}`,
        })
        .where(eq(schema.comment.id, commentId));
    } else if (reactionType === ReactionType.THUMBS_DOWN) {
      await this.db
        .update(schema.comment)
        .set({
          thumbsDownCount: sql`${schema.comment.thumbsDownCount} + ${delta}`,
        })
        .where(eq(schema.comment.id, commentId));
    }
  }

  /**
   * Helper: Emit notification for post reactions
   */
  private async emitPostReactionNotification(
    userId: string,
    postId: string,
    reactionType: ReactionType,
  ) {
    // Get the post to find the author
    const post = await this.db.query.post.findFirst({
      where: eq(schema.post.id, postId),
      columns: { userId: true },
    });

    if (!post || post.userId === userId) {
      // Don't notify if post not found or user is reacting to their own post
      return;
    }

    const notificationType = reactionType === ReactionType.THUMBS_UP 
      ? 'post_thumbs_up' 
      : 'post_thumbs_down';

    const content = reactionType === ReactionType.THUMBS_UP 
      ? 'liked your post' 
      : 'disliked your post';

    this.eventEmitter.emit('notification.create', {
      recipientId: post.userId,
      actorId: userId,
      type: notificationType,
      targetId: postId,
      targetType: 'post',
      content,
      actionUrl: `/home/posts/${postId}`,
    });
  }

  /**
   * Helper: Emit notification for comment reactions
   */
  private async emitCommentReactionNotification(
    userId: string,
    commentId: string,
    reactionType: ReactionType,
  ) {
    // Get the comment to find the author and post
    const comment = await this.db.query.comment.findFirst({
      where: eq(schema.comment.id, commentId),
      columns: { userId: true, postId: true },
    });

    if (!comment || comment.userId === userId) {
      // Don't notify if comment not found or user is reacting to their own comment
      return;
    }

    const notificationType = reactionType === ReactionType.THUMBS_UP 
      ? 'comment_thumbs_up' 
      : 'comment_thumbs_down';

    const content = reactionType === ReactionType.THUMBS_UP 
      ? 'liked your comment' 
      : 'disliked your comment';

    this.eventEmitter.emit('notification.create', {
      recipientId: comment.userId,
      actorId: userId,
      type: notificationType,
      targetId: comment.postId,
      targetType: 'post',
      content,
      actionUrl: `/home/posts/${comment.postId}?commentId=${commentId}`,
    });
  }
}
