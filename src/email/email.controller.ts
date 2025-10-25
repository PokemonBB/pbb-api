import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';
import type {
  WelcomeEmailData,
  PasswordResetEmailData,
  AccountStatusEmailData,
} from './interfaces/email.interface';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-connection')
  @ApiOperation({ summary: 'Test email connection (Admin/Root only)' })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Email connection test result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async testConnection() {
    const isConnected = await this.emailService.testConnection();
    return {
      message: isConnected
        ? 'Email connection successful'
        : 'Email connection failed',
      connected: isConnected,
    };
  }

  @Post('send-welcome')
  @ApiOperation({ summary: 'Send welcome email (Admin/Root only)' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Send welcome email example',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async sendWelcomeEmail(@Body() data: WelcomeEmailData) {
    const success = await this.emailService.sendWelcomeEmail(data);
    return {
      message: success
        ? 'Welcome email sent successfully'
        : 'Failed to send welcome email',
      success,
    };
  }

  @Post('send-password-reset')
  @ApiOperation({ summary: 'Send password reset email (Admin/Root only)' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Send password reset email example',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
          resetToken: 'abc123def456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async sendPasswordResetEmail(@Body() data: PasswordResetEmailData) {
    const success = await this.emailService.sendPasswordResetEmail(data);
    return {
      message: success
        ? 'Password reset email sent successfully'
        : 'Failed to send password reset email',
      success,
    };
  }

  @Post('send-account-activation')
  @ApiOperation({ summary: 'Send account activation email (Admin/Root only)' })
  @ApiCookieAuth('token')
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Send account activation email example',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
          status: 'activated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account activation email sent successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async sendAccountActivationEmail(@Body() data: AccountStatusEmailData) {
    const success = await this.emailService.sendAccountActivationEmail(data);
    return {
      message: success
        ? 'Account activation email sent successfully'
        : 'Failed to send account activation email',
      success,
    };
  }

  @Post('send-account-deactivation')
  @ApiOperation({
    summary: 'Send account deactivation email (Admin/Root only)',
  })
  @ApiCookieAuth('token')
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Send account deactivation email example',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
          status: 'deactivated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account deactivation email sent successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async sendAccountDeactivationEmail(@Body() data: AccountStatusEmailData) {
    const success = await this.emailService.sendAccountDeactivationEmail(data);
    return {
      message: success
        ? 'Account deactivation email sent successfully'
        : 'Failed to send account deactivation email',
      success,
    };
  }
}
