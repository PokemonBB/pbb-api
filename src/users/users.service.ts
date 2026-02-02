import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ToggleActiveDto } from './dto/toggle-active.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import {
  USER_FIELD_SELECTORS,
  USER_FILTERS,
} from './constants/user-fields.constants';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find(USER_FILTERS.ALL_USERS)
      .select(USER_FIELD_SELECTORS.ADMIN)
      .exec();
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
    excludeUserId?: string,
  ): Promise<PaginatedResponse<User>> {
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const filter = {
      ...USER_FILTERS.ALL_USERS,
      ...(excludeUserId && { _id: { $ne: excludeUserId } }),
    };

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(USER_FIELD_SELECTORS.ADMIN)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findAllForUser(excludeUserId?: string): Promise<User[]> {
    const filter = {
      ...USER_FILTERS.ACTIVE_ONLY,
      ...(excludeUserId && { _id: { $ne: excludeUserId } }),
    };

    return this.userModel.find(filter).select(USER_FIELD_SELECTORS.USER).exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel
      .findOne({ _id: id, ...USER_FILTERS.ALL_USERS })
      .select(USER_FIELD_SELECTORS.ADMIN)
      .exec();
  }

  async findOneForUser(id: string): Promise<User | null> {
    return this.userModel
      .findOne({ _id: id, ...USER_FILTERS.ACTIVE_ONLY })
      .select(USER_FIELD_SELECTORS.USER)
      .exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUsername(
    id: string,
    updateUsernameDto: UpdateUsernameDto,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUsernameDto, { new: true })
      .select('-password')
      .exec();
  }

  async updateEmail(
    id: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateEmailDto, { new: true })
      .select('-password')
      .exec();
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }

    const isCurrentPasswordValid = await this.validatePassword(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    return this.userModel
      .findByIdAndUpdate(id, { password: hashedNewPassword }, { new: true })
      .select('-password')
      .exec();
  }

  async updatePasswordDirect(
    id: string,
    newPassword: string,
  ): Promise<User | null> {
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.userModel
      .findByIdAndUpdate(id, { password: hashedNewPassword }, { new: true })
      .select('-password')
      .exec();
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchRegex = new RegExp(query, 'i');
    return this.userModel
      .find({
        username: { $regex: searchRegex },
        ...USER_FILTERS.ALL_USERS,
      })
      .select(USER_FIELD_SELECTORS.ADMIN)
      .exec();
  }

  async searchUsersPaginated(
    query: string,
    paginationDto: PaginationDto,
    excludeUserId?: string,
  ): Promise<PaginatedResponse<User>> {
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      username: { $regex: searchRegex },
      ...USER_FILTERS.ALL_USERS,
      ...(excludeUserId && { _id: { $ne: excludeUserId } }),
    };

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(USER_FIELD_SELECTORS.ADMIN)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async searchUsersForUser(
    query: string,
    excludeUserId?: string,
  ): Promise<User[]> {
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      username: { $regex: searchRegex },
      ...USER_FILTERS.ACTIVE_ONLY,
      ...(excludeUserId && { _id: { $ne: excludeUserId } }),
    };

    return this.userModel.find(filter).select(USER_FIELD_SELECTORS.USER).exec();
  }

  async deleteAccount(
    id: string,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return false;
    }

    const isPasswordValid = await this.validatePassword(
      deleteAccountDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return true;
  }

  async toggleActive(
    id: string,
    toggleActiveDto: ToggleActiveDto,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { active: toggleActiveDto.active }, { new: true })
      .select(USER_FIELD_SELECTORS.ADMIN)
      .exec();
  }

  async updateConfiguration(
    id: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { configuration: updateConfigurationDto },
        { new: true },
      )
      .select(USER_FIELD_SELECTORS.ADMIN)
      .exec();
  }
}
