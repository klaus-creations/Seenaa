import { Module } from '@nestjs/common';
import { PostsController } from './post.controller';
import { PostsService } from './post.service';
import { ReactionsService } from './reactions.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService, ReactionsService, CloudinaryService],
  exports: [PostsService],
})
export class PostModule {}
