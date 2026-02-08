import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Types } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/helpers/pagination.helper';
import { SocketEmitterService } from '../connections/socket-emitter.service';
import { NOTIFICATION } from '../connections/events';
import type { NotificationEventPayload } from '../connections/events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly socketEmitter: SocketEmitterService,
  ) {}

  async createNotificationForUser(
    receiverId: string,
    message: string,
    type:
      | 'notification'
      | 'info'
      | 'warning'
      | 'error'
      | 'success' = 'notification',
  ): Promise<Notification> {
    const user = await this.userModel.findById(receiverId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = new this.notificationModel({
      message,
      type,
      receiver: receiverId,
    });

    const savedNotification = await notification.save();
    this.logger.log(`Notification created for user ${receiverId}`);
    this.emitNotificationEvent(
      receiverId,
      savedNotification as {
        _id: Types.ObjectId;
        message: string;
        type: string;
        createdAt?: Date;
      },
    );
    return savedNotification;
  }

  async createNotificationForAllUsers(
    message: string,
    type:
      | 'notification'
      | 'info'
      | 'warning'
      | 'error'
      | 'success' = 'notification',
  ): Promise<Notification[]> {
    const users = await this.userModel.find({});

    const notifications = users.map((user) => ({
      message,
      type,
      receiver: user._id,
    }));

    const savedNotifications =
      await this.notificationModel.insertMany(notifications);
    this.logger.log(
      `Global notification created for ${savedNotifications.length} users`,
    );
    const withReceiver = savedNotifications as Array<{
      receiver: Types.ObjectId;
      _id: Types.ObjectId;
      message: string;
      type: string;
      createdAt?: Date;
    }>;
    for (const n of withReceiver) {
      this.emitNotificationEvent(n.receiver.toString(), n);
    }
    return savedNotifications as unknown as Notification[];
  }

  async getUserNotifications(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Notification>> {
    const { page, limit, skip } = getPaginationParams(paginationDto);

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ receiver: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ receiver: userId }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.receiver.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete your own notifications',
      );
    }

    await this.notificationModel.findByIdAndDelete(notificationId);
    this.logger.log(`Notification ${notificationId} deleted by user ${userId}`);
  }

  private emitNotificationEvent(
    receiverId: string,
    notification: {
      _id: Types.ObjectId;
      message: string;
      type: string;
      createdAt?: Date;
    },
  ): void {
    const payload: NotificationEventPayload = {
      id: notification._id.toString(),
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt ?? new Date(),
    };
    this.socketEmitter.emitToUser(receiverId, NOTIFICATION, payload);
  }
}
