import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MailerModule } from '@nestjs-modules/mailer';

import { auth } from './lib/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { MailService } from './mail/mail.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { FollowModule } from './follow/follow.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    EventEmitterModule.forRoot(),

    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    PostModule,
    CommunityModule,
    NotificationsModule,
    CommentModule,
    MessageModule,
    FollowModule,
    BookmarksModule,
    UsersModule,
    SearchModule,
    UploadModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
