import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invitation, InvitationDocument } from '../schemas/invitation.schema';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    private auditService: AuditService,
  ) {}

  async createInvitation(
    createInvitationDto: CreateInvitationDto,
    createdBy: string,
    createdByUsername: string,
  ): Promise<InvitationDocument> {
    const { expiresInDays = 7 } = createInvitationDto;

    // Generate unique invitation code
    const code = this.generateInvitationCode();

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = await this.invitationModel.create({
      createdBy,
      code,
      expiresAt,
    });

    this.logger.log(
      `Invitation created by ${createdBy}, expires at ${expiresAt.toISOString()}`,
    );

    // Create audit log
    await this.auditService.createAuditLog({
      userId: createdBy,
      username: createdByUsername,
      action: 'CREATE',
      resource: 'INVITATION',
      resourceId: (invitation as unknown as { _id: unknown })._id as string,
      newValues: {
        code: invitation.code,
        expiresAt: invitation.expiresAt,
        expiresInDays,
      },
    });

    return invitation;
  }

  async validateInvitationCode(
    code: string,
  ): Promise<InvitationDocument | null> {
    const invitation = await this.invitationModel.findOne({
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    return invitation;
  }

  async useInvitationCode(
    code: string,
    userId: string,
    username: string,
  ): Promise<boolean> {
    const invitation = await this.invitationModel.findOne({
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation code');
    }

    // Mark invitation as used
    invitation.used = true;
    invitation.usedBy = new Types.ObjectId(userId);
    await invitation.save();

    this.logger.log(`Invitation ${code} used by ${username} (${userId})`);

    // Create audit log for invitation usage
    await this.auditService.createAuditLog({
      userId,
      username,
      action: 'USE',
      resource: 'INVITATION',
      resourceId: (invitation as unknown as { _id: unknown })._id as string,
      oldValues: {
        used: false,
        usedBy: null,
      },
      newValues: {
        used: true,
        usedBy: userId,
      },
    });

    return true;
  }

  private generateInvitationCode(): string {
    // Generate a secure random code
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex');
  }
}
