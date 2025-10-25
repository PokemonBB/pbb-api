import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Friends')
@Controller('friends')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:receiverId')
  @ApiOperation({ summary: 'Send friend request to user' })
  @ApiParam({
    name: 'receiverId',
    description: 'ID of the user to send friend request to',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  @ApiResponse({ status: 400, description: 'Cannot send request to yourself' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Friend request already exists' })
  async sendFriendRequest(
    @Param('receiverId') receiverId: string,
    @Req() req: RequestWithUser,
  ) {
    const friendship = await this.friendsService.sendFriendRequest(
      req.user.id as string,
      receiverId,
    );

    return {
      message: 'Friend request sent successfully',
      friendship: {
        id: (friendship as unknown as { _id: unknown })._id,
        requester: friendship.requester,
        receiver: friendship.receiver,
        status: friendship.status,
        createdAt: (friendship as unknown as { createdAt: unknown }).createdAt,
      },
    };
  }

  @Patch('accept/:requestId')
  @ApiOperation({ summary: 'Accept friend request' })
  @ApiParam({
    name: 'requestId',
    description: 'ID of the friend request to accept',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request accepted successfully',
  })
  @ApiResponse({ status: 400, description: 'Friend request is not pending' })
  @ApiResponse({
    status: 403,
    description: 'You can only accept requests sent to you',
  })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async acceptFriendRequest(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    const friendship = await this.friendsService.acceptFriendRequest(
      requestId,
      req.user.id as string,
    );

    return {
      message: 'Friend request accepted successfully',
      friendship: {
        id: (friendship as unknown as { _id: unknown })._id,
        requester: friendship.requester,
        receiver: friendship.receiver,
        status: friendship.status,
        respondedAt: friendship.respondedAt,
      },
    };
  }

  @Patch('decline/:requestId')
  @ApiOperation({ summary: 'Decline friend request' })
  @ApiParam({
    name: 'requestId',
    description: 'ID of the friend request to decline',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend request declined successfully',
  })
  @ApiResponse({ status: 400, description: 'Friend request is not pending' })
  @ApiResponse({
    status: 403,
    description: 'You can only decline requests sent to you',
  })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async declineFriendRequest(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    const friendship = await this.friendsService.declineFriendRequest(
      requestId,
      req.user.id as string,
    );

    return {
      message: 'Friend request declined successfully',
      friendship: {
        id: (friendship as unknown as { _id: unknown })._id,
        requester: friendship.requester,
        receiver: friendship.receiver,
        status: friendship.status,
        respondedAt: friendship.respondedAt,
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get friends list with pagination',
    description:
      'Retrieve paginated list of friends. Use query parameters: ?page=1&limit=10',
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
    description: 'Friends list retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFriends(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.friendsService.getFriends(req.user.id as string, paginationDto);
  }

  @Get('requests')
  @ApiOperation({
    summary: 'Get pending friend requests with pagination',
    description:
      'Retrieve paginated list of pending friend requests. Use query parameters: ?page=1&limit=10',
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
    description: 'Pending requests retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPendingRequests(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.friendsService.getPendingRequests(
      req.user.id as string,
      paginationDto,
    );
  }

  @Get('sent')
  @ApiOperation({
    summary: 'Get sent friend requests with pagination',
    description:
      'Retrieve paginated list of sent friend requests. Use query parameters: ?page=1&limit=10',
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
    description: 'Sent requests retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSentRequests(
    @Req() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.friendsService.getSentRequests(
      req.user.id as string,
      paginationDto,
    );
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove friend' })
  @ApiParam({
    name: 'friendId',
    description: 'ID of the friend to remove',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Friend removed successfully' })
  @ApiResponse({ status: 404, description: 'Friendship not found' })
  async removeFriend(
    @Param('friendId') friendId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.friendsService.removeFriend(friendId, req.user.id as string);

    return {
      message: 'Friend removed successfully',
    };
  }
}
