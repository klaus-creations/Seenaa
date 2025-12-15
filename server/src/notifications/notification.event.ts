import { notificationTypeEnum } from './schema';

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export class NotificationEvent {
  recipientId: string;
  actorId: string;

  type: NotificationType;

  targetId: string;
  targetType: string;
  content?: string;
  actionUrl?: string;
}
