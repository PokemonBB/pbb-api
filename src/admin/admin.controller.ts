import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UpdateUserAdminDto } from '../users/dto/update-user-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { UserPermissionsGuard } from '../users/guards/user-permissions.guard';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Admin')
@Controller('admin/users')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, ActiveUserGuard, UserPermissionsGuard)
  @UseInterceptors(AuditInterceptor)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user (Admin/Root only)',
    description: `
    **Permission Rules:**
    - **ROOT**: Can modify any user, cannot be modified by anyone
    - **ADMIN**: Can modify users (username, email) but CANNOT change roles
    - **USER**: Cannot modify other users
    
    **Fields that can be modified:**
    - username
    - email  
    - role (ROOT users only)
    - active (activate/deactivate user)
    - canInvite (grant/revoke invitation permissions)
    
    **Fields that CANNOT be modified:**
    - password (use dedicated password change endpoint)
    - _id
    - createdAt
    - updatedAt
    
    **Role Change Restrictions:**
    - Only ROOT users can modify user roles
    - ADMIN users cannot change roles of any user
    `,
  })
  @ApiCookieAuth('token')
  @ApiBody({
    type: UpdateUserAdminDto,
    examples: {
      example1: {
        summary: 'Update user username (ADMIN can do this)',
        value: {
          username: 'newusername',
        },
      },
      example2: {
        summary: 'Update user email (ADMIN can do this)',
        value: {
          email: 'newemail@example.com',
        },
      },
      example3: {
        summary: 'Update user role (ROOT only)',
        value: {
          role: 'ADMIN',
        },
      },
      example4: {
        summary: 'Activate/deactivate user',
        value: {
          active: true,
        },
      },
      example5: {
        summary: 'Update username and email (ADMIN can do this)',
        value: {
          username: 'newusername',
          email: 'newemail@example.com',
        },
      },
      example6: {
        summary: 'Grant invitation permissions',
        value: {
          canInvite: true,
        },
      },
      example7: {
        summary: 'Revoke invitation permissions',
        value: {
          canInvite: false,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserAdminDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard, UserPermissionsGuard)
  @UseInterceptors(AuditInterceptor)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user (Admin/Root only)',
    description: `
    **Permission Rules:**
    - **ROOT**: Can delete any user
    - **ADMIN**: Can delete users with USER role only
    - **USER**: Cannot delete other users
    `,
  })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
