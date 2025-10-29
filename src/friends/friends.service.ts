import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friendship, FriendshipDocument } from '../schemas/friendship.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { USER_FIELD_SELECTORS } from '../users/constants/user-fields.constants';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @InjectModel(Friendship.name)
    private friendshipModel: Model<FriendshipDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async sendFriendRequest(
    requesterId: string,
    receiverId: string,
  ): Promise<Friendship> {
    // Verificar que no sea auto-solicitud
    if (requesterId === receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Verificar que el receptor existe
    const receiver = await this.userModel.findById(receiverId);
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // Verificar que no existe una solicitud previa
    const existingRequest = await this.friendshipModel.findOne({
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new ConflictException('Friend request already exists');
      } else if (existingRequest.status === 'accepted') {
        throw new ConflictException('Users are already friends');
      }
    }

    // Crear nueva solicitud
    const friendship = new this.friendshipModel({
      requester: requesterId,
      receiver: receiverId,
      status: 'pending',
    });

    const savedFriendship = await friendship.save();
    this.logger.log(`Friend request sent from ${requesterId} to ${receiverId}`);

    return savedFriendship;
  }

  async acceptFriendRequest(
    requestId: string,
    userId: string,
  ): Promise<Friendship> {
    const friendship = await this.friendshipModel.findById(requestId);

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Verificar que el usuario es el receptor
    if (friendship.receiver.toString() !== userId) {
      throw new ForbiddenException('You can only accept requests sent to you');
    }

    // Verificar que está pendiente
    if (friendship.status !== 'pending') {
      throw new BadRequestException('Friend request is not pending');
    }

    // Actualizar estado
    friendship.status = 'accepted';
    friendship.respondedAt = new Date();
    await friendship.save();

    this.logger.log(`Friend request ${requestId} accepted by ${userId}`);
    return friendship;
  }

  async declineFriendRequest(
    requestId: string,
    userId: string,
  ): Promise<Friendship> {
    const friendship = await this.friendshipModel.findById(requestId);

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Verificar que el usuario es el receptor
    if (friendship.receiver.toString() !== userId) {
      throw new ForbiddenException('You can only decline requests sent to you');
    }

    // Verificar que está pendiente
    if (friendship.status !== 'pending') {
      throw new BadRequestException('Friend request is not pending');
    }

    // Actualizar estado
    friendship.status = 'declined';
    friendship.respondedAt = new Date();
    await friendship.save();

    this.logger.log(`Friend request ${requestId} declined by ${userId}`);
    return friendship;
  }

  async getFriends(
    userId: string,
    paginationDto: PaginationDto,
    userRole: string = 'USER',
  ): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const fieldSelector =
      userRole === 'ADMIN' || userRole === 'ROOT'
        ? USER_FIELD_SELECTORS.ADMIN
        : USER_FIELD_SELECTORS.USER;

    const [friendships, total] = await Promise.all([
      this.friendshipModel
        .find({
          status: 'accepted',
          $or: [{ requester: userId }, { receiver: userId }],
        })
        .skip(skip)
        .limit(limit)
        .populate('requester', fieldSelector)
        .populate('receiver', fieldSelector)
        .exec(),
      this.friendshipModel.countDocuments({
        status: 'accepted',
        $or: [{ requester: userId }, { receiver: userId }],
      }),
    ]);

    // Extraer usuarios amigos (excluyendo al usuario actual)
    const friends = friendships.map((friendship) => {
      const friend =
        friendship.requester._id.toString() === userId
          ? friendship.receiver
          : friendship.requester;
      return friend;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: friends as unknown as User[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getPendingRequests(
    userId: string,
    paginationDto: PaginationDto,
    userRole: string = 'USER',
  ): Promise<PaginatedResponse<Friendship>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const fieldSelector =
      userRole === 'ADMIN' || userRole === 'ROOT'
        ? USER_FIELD_SELECTORS.ADMIN
        : USER_FIELD_SELECTORS.USER;

    const [data, total] = await Promise.all([
      this.friendshipModel
        .find({
          receiver: userId,
          status: 'pending',
        })
        .populate('requester', fieldSelector)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.friendshipModel.countDocuments({
        receiver: userId,
        status: 'pending',
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getSentRequests(
    userId: string,
    paginationDto: PaginationDto,
    userRole: string = 'USER',
  ): Promise<PaginatedResponse<Friendship>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const fieldSelector =
      userRole === 'ADMIN' || userRole === 'ROOT'
        ? USER_FIELD_SELECTORS.ADMIN
        : USER_FIELD_SELECTORS.USER;

    const [data, total] = await Promise.all([
      this.friendshipModel
        .find({
          requester: userId,
          status: 'pending',
        })
        .populate('receiver', fieldSelector)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.friendshipModel.countDocuments({
        requester: userId,
        status: 'pending',
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async removeFriend(friendId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipModel.findOne({
      status: 'accepted',
      $or: [
        { requester: userId, receiver: friendId },
        { requester: friendId, receiver: userId },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipModel.findByIdAndDelete(friendship._id);
    this.logger.log(`Friendship removed between ${userId} and ${friendId}`);
  }
}
