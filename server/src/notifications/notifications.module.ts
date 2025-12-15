import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationListener } from './notification.listener';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationGateway, NotificationListener],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}
