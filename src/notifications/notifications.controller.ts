import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../enums/user-role.enum';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user notifications with pagination',
    description:
      'Retrieve paginated list of notifications for the authenticated user. Use query parameters: ?page=1&limit=10',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserNotifications(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id as string,
      paginationDto,
    );
  }

  @Delete(':notificationId')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID of the notification to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your notification',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.notificationsService.deleteNotification(
      notificationId,
      req.user.id as string,
    );

    return {
      message: 'Notification deleted successfully',
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create notification (ADMIN/ROOT only)',
    description:
      'Create a notification for a specific user or all users in the system. Only ADMIN or ROOT users can execute this. Use sendToAll=true to send to all users, or specify a receiverId for a single user.',
  })
  @ApiBody({
    description: 'Create notification for specific user',
    examples: {
      singleUser: {
        summary: 'Send to specific user',
        value: {
          message: 'Your friend request was accepted',
          type: 'success',
          receiverId: '507f1f77bcf86cd799439011',
          sendToAll: false,
        },
      },
      allUsers: {
        summary: 'Send to all users',
        value: {
          message: 'System maintenance scheduled for tomorrow',
          type: 'warning',
          sendToAll: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only ADMIN or ROOT can create notifications',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createNotification(
    @Req() req: RequestWithUser,
    @Body()
    createNotificationDto: {
      message: string;
      type?: 'notification' | 'info' | 'warning' | 'error' | 'success';
      receiverId?: string;
      sendToAll?: boolean;
    },
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.ROOT) {
      throw new ForbiddenException(
        'Only ADMIN or ROOT users can create notifications',
      );
    }

    if (createNotificationDto.sendToAll) {
      const notifications =
        await this.notificationsService.createNotificationForAllUsers(
          createNotificationDto.message,
          createNotificationDto.type || 'notification',
        );

      return {
        message: `Notification sent to ${notifications.length} users`,
        notificationsCount: notifications.length,
      };
    } else {
      if (!createNotificationDto.receiverId) {
        throw new BadRequestException(
          'receiverId is required when sendToAll is false',
        );
      }

      const notification =
        await this.notificationsService.createNotificationForUser(
          createNotificationDto.receiverId,
          createNotificationDto.message,
          createNotificationDto.type || 'notification',
        );

      return {
        message: 'Notification created successfully',
        notification,
      };
    }
  }
}
