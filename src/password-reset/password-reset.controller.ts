import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';

@ApiTags('Auth')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Request password reset',
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() body: { email: string }) {
    const success = await this.passwordResetService.sendPasswordResetEmail(
      body.email,
    );
    return {
      message: 'Password reset email sent successfully',
      success,
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Reset password',
        value: {
          token: 'abc123def456...',
          newPassword: 'newpassword123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const success = await this.passwordResetService.resetPassword(
      body.token,
      body.newPassword,
    );
    return {
      message: 'Password reset successfully',
      success,
    };
  }

  @Get('validate-reset-token/:token')
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateResetToken(@Param('token') token: string) {
    const isValid = await this.passwordResetService.validateResetToken(token);
    return {
      valid: isValid,
      message: isValid ? 'Token is valid' : 'Token is invalid or expired',
    };
  }
}
