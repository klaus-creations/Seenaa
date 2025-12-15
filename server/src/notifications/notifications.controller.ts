import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth'; // Your auth
import { NotificationService } from './notifications.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async findAll(
    @Session() session: UserSession,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationService.getUserNotifications(
      session.user.id,
      limit || 20,
      offset || 0,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Session() session: UserSession) {
    return this.notificationService.markAsRead(id, session.user.id);
  }

  @Patch('read-all')
  async markAllRead(@Session() session: UserSession) {
    return this.notificationService.markAllAsRead(session.user.id);
  }

  // Test endpoint to manually trigger notifications
  @Post('test')
  testNotification(
    @Session() session: UserSession,
    @Body() body: { targetUserId: string },
  ) {
    this.eventEmitter.emit('notification.create', {
      recipientId: body.targetUserId,
      actorId: session.user.id,
      type: 'post_thumbs_up',
      targetId: 'test-post-id',
      targetType: 'post',
      content: 'liked your post',
      actionUrl: '/home/feed',
    });

    return { message: 'Test notification sent' };
  }

  // Test follow notification
  @Post('test-follow')
  testFollowNotification(
    @Session() session: UserSession,
    @Body() body: { targetUserId: string },
  ) {
    console.log('🧪 Testing follow notification:', {
      recipientId: body.targetUserId,
      actorId: session.user.id,
    });

    this.eventEmitter.emit('notification.create', {
      recipientId: body.targetUserId,
      actorId: session.user.id,
      type: 'new_follower',
      targetId: session.user.id,
      targetType: 'user',
      content: 'started following you',
      actionUrl: `/home/peoples/${session.user.id}`,
    });

    return { message: 'Test follow notification sent' };
  }
}
