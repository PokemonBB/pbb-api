import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { UserVisibilityHelper } from './helpers/user-visibility.helper';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req: RequestWithUser) {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description:
      'Retrieve paginated list of users. Use query parameters: ?page=1&limit=10',
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
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req: RequestWithUser, @Query() paginationDto: PaginationDto) {
    if (UserVisibilityHelper.isAdminRole(req.user.role)) {
      return this.usersService.findAllPaginated(
        paginationDto,
        req.user.id as string,
      );
    } else {
      return this.usersService.findAllForUser(req.user.id as string);
    }
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get('search')
  @ApiOperation({
    summary: 'Search users by username with pagination',
    description:
      'Search users with pagination. Use query parameters: ?query=john&page=1&limit=10',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term (username)',
    example: 'john',
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
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Users found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  searchUsers(
    @Query('query') query: string,
    @Query() paginationDto: PaginationDto,
    @Req() req: RequestWithUser,
  ) {
    if (UserVisibilityHelper.isAdminRole(req.user.role)) {
      return this.usersService.searchUsersPaginated(
        query,
        paginationDto,
        req.user.id as string,
      );
    } else {
      return this.usersService.searchUsersForUser(query, req.user.id as string);
    }
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (UserVisibilityHelper.isAdminRole(req.user.role)) {
      return this.usersService.findOne(id);
    } else {
      return this.usersService.findOneForUser(id);
    }
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('me/username')
  @ApiOperation({ summary: 'Update current user username' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: UpdateUsernameDto,
    examples: {
      example1: {
        summary: 'Update username example',
        value: {
          username: 'newusername',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Username updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  updateUsername(
    @Req() req: RequestWithUser,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(
      String(req.user._id),
      updateUsernameDto,
    );
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('me/email')
  @ApiOperation({ summary: 'Update current user email' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: UpdateEmailDto,
    examples: {
      example1: {
        summary: 'Update email example',
        value: {
          email: 'newemail@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  updateEmail(
    @Req() req: RequestWithUser,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(String(req.user._id), updateEmailDto);
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('me/password')
  @ApiOperation({ summary: 'Update current user password' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: UpdatePasswordDto,
    examples: {
      example1: {
        summary: 'Update password example',
        value: {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  updatePassword(
    @Req() req: RequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(
      String(req.user._id),
      updatePasswordDto,
    );
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: DeleteAccountDto,
    examples: {
      example1: {
        summary: 'Delete account example',
        value: {
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Account deleted successfully' },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Password is incorrect' })
  async deleteAccount(
    @Req() req: RequestWithUser,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    const deleted = await this.usersService.deleteAccount(
      String(req.user._id),
      deleteAccountDto,
    );

    return {
      message: 'Account deleted successfully',
      deleted,
    };
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Patch('me/configuration')
  @ApiOperation({ summary: 'Update current user configuration' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: UpdateConfigurationDto,
    examples: {
      example1: {
        summary: 'Set language and theme',
        value: {
          language: 'es',
          theme: 'dark',
        },
      },
      example2: {
        summary: 'Set only language',
        value: {
          language: 'en',
        },
      },
      example3: {
        summary: 'Set only theme',
        value: {
          theme: 'light',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid configuration values' })
  updateConfiguration(
    @Req() req: RequestWithUser,
    @Body() updateConfigurationDto: UpdateConfigurationDto,
  ) {
    return this.usersService.updateConfiguration(
      String(req.user._id),
      updateConfigurationDto,
    );
  }
}
