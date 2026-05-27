import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { ConnectionsModule } from '../connections/connections.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConnectionsModule,
    AuditModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
