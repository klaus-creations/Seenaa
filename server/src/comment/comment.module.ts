import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ReactionsService } from '../post/reactions.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CommentController],
  providers: [CommentService, ReactionsService],
  exports: [CommentService],
})
export class CommentModule {}
