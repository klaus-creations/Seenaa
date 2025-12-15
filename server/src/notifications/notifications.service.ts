import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NotificationGateway } from './notification.gateway';
import { NotificationEvent, NotificationType } from './notification.event';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc, and, InferSelectModel } from 'drizzle-orm';
import { schema } from '../database/schema';

type NotificationPreference = InferSelectModel<
  typeof schema.notificationPreference
>;

@Injectable()
export class NotificationService {
  constructor(
    @Inject('DB') private db: NodePgDatabase<typeof schema>,
    private notificationGateway: NotificationGateway,
  ) {}

  async processNotification(event: NotificationEvent) {
    console.log('🔄 Processing notification:', event);

    if (event.recipientId === event.actorId) {
      console.log('Skipping notification: recipient is same as actor');
      return;
    }

    const prefs = await this.db.query.notificationPreference.findFirst({
      where: eq(schema.notificationPreference.userId, event.recipientId),
    });

    console.log('⚙️ User notification preferences:', prefs);

    const shouldNotify = this.checkPreference(prefs, event.type);
    console.log('🔔 Should send real-time notification:', shouldNotify);

    const [savedNotification] = await this.db
      .insert(schema.notification)
      .values({
        id: uuidv4(),
        userId: event.recipientId,
        actorId: event.actorId,

        type: event.type,

        targetId: event.targetId,
        targetType: event.targetType,
        content: event.content,
        actionUrl: event.actionUrl,
        isRead: false,
      })
      .returning();

    console.log('💾 Notification saved to database:', savedNotification.id);

    if (shouldNotify) {
      const actor = await this.db.query.user.findFirst({
        where: eq(schema.user.id, event.actorId),
        columns: { id: true, name: true, image: true },
      });

      this.notificationGateway.sendToUser(event.recipientId, {
        ...savedNotification,
        actor,
      });
    }
  }

  private checkPreference(
    prefs: NotificationPreference | undefined,
    type: NotificationType,
  ): boolean {
    if (!prefs) return true;

    switch (type) {
      case 'comment_on_post':
        return prefs.pushOnComment;
      case 'reply_to_comment':
        return prefs.pushOnComment;

      case 'post_thumbs_up':
      case 'post_thumbs_down':
        return prefs.pushOnPostReaction;

      case 'new_follower':
        return prefs.pushOnFollow;

      case 'mention_in_post':
      case 'mention_in_comment':
        return prefs.pushOnMention;

      case 'direct_message':
        return prefs.pushOnDirectMessage;

      default:
        return true;
    }
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    return this.db.query.notification.findMany({
      where: eq(schema.notification.userId, userId),
      orderBy: [desc(schema.notification.createdAt)],
      limit,
      offset,
      with: {
        actor: {
          columns: { id: true, name: true, image: true, username: true },
        },
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.db
      .update(schema.notification)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(schema.notification.id, notificationId),
          eq(schema.notification.userId, userId),
        ),
      );
  }

  async markAllAsRead(userId: string) {
    await this.db
      .update(schema.notification)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(schema.notification.userId, userId),
          eq(schema.notification.isRead, false),
        ),
      );
  }
}
