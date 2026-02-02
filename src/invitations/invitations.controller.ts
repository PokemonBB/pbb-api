import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { InvitationPermissionsGuard } from './guards/invitation-permissions.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('Invitations')
@Controller('invitations')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(InvitationPermissionsGuard)
  @ApiOperation({
    summary: 'Create invitation code',
    description: `
    **Permission Requirements:**
    - **ROOT**: Can create invitations
    - **ADMIN**: Can create invitations  
    - **USER**: Can create invitations only if canInvite is true
    
    **Invitation Details:**
    - Generates unique invitation code
    - Default expiration: 7 days (configurable 1-30 days)
    - No email required - generates generic invitation code
    - Code can be used by anyone for registration
    `,
  })
  @ApiBody({
    type: CreateInvitationDto,
    examples: {
      example1: {
        summary: 'Create invitation with default expiration (7 days)',
        value: {},
      },
      example2: {
        summary: 'Create invitation with custom expiration',
        value: {
          expiresInDays: 14,
        },
      },
      example3: {
        summary: 'Create invitation with short expiration',
        value: {
          expiresInDays: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid expiration days' })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to create invitations',
  })
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: RequestWithUser,
  ) {
    const invitation = await this.invitationsService.createInvitation(
      createInvitationDto,
      req.user.id as string,
      req.user.username,
    );

    return {
      message: 'Invitation created successfully',
      invitation: {
        id: (invitation as unknown as { _id: unknown })._id,
        code: invitation.code,
        expiresAt: invitation.expiresAt,
        createdAt: (invitation as unknown as { createdAt: unknown }).createdAt,
      },
    };
  }
}
