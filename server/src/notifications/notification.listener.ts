import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notifications.service';
import { NotificationEvent } from './notification.event';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('notification.create')
  async handleNotificationCreate(payload: NotificationEvent) {
    console.log('📨 Notification listener received event:', payload);
    await this.notificationService.processNotification(payload);
  }
}
