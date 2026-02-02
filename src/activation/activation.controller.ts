import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ActivationService } from './activation.service';

@ApiTags('Activation')
@Controller('activation')
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  @Post('activate')
  @ApiOperation({ summary: 'Activate user account with code' })
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Activate account example',
        value: {
          code: 'ABC123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired activation code',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateAccount(@Body() body: { code: string }) {
    const success = await this.activationService.activateAccount(body.code);
    return {
      message: 'Account activated successfully',
      success,
    };
  }

  @Post('resend')
  @ApiOperation({ summary: 'Resend activation code' })
  @ApiBody({
    type: 'object',
    examples: {
      example1: {
        summary: 'Resend activation code example',
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Activation code resent successfully',
  })
  @ApiResponse({ status: 400, description: 'Account already activated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendActivationCode(@Body() body: { email: string }) {
    const success = await this.activationService.resendActivationCode(
      body.email,
    );
    return {
      message: 'Activation code resent successfully',
      success,
    };
  }

  @Get('status/:email')
  @ApiOperation({ summary: 'Check activation status' })
  @ApiResponse({ status: 200, description: 'Activation status retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getActivationStatus(@Param('email') email: string) {
    // This would need to be implemented in the service
    return {
      message: 'Activation status retrieved',
      email,
      // status: 'pending' | 'activated'
    };
  }
}
