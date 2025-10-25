import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivationCode,
  ActivationCodeDocument,
} from '../schemas/activation-code.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UserDocument } from '../schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class ActivationService {
  private readonly logger = new Logger(ActivationService.name);

  constructor(
    @InjectModel(ActivationCode.name)
    private activationCodeModel: Model<ActivationCodeDocument>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async generateActivationCode(userId: string, email: string): Promise<string> {
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.activationCodeModel.create({
      userId,
      code,
      email,
      expiresAt,
    });

    this.logger.log(`Activation code generated for user ${userId}`);
    return code;
  }

  async sendActivationEmail(user: UserDocument): Promise<boolean> {
    const code = await this.generateActivationCode(
      String(user._id),
      user.email,
    );

    const success = await this.emailService.sendActivationCodeEmail({
      username: user.username,
      email: user.email,
      status: 'activated',
      activationCode: code,
    });

    if (success) {
      this.logger.log(`Activation email sent to ${user.email}`);
    } else {
      this.logger.error(`Failed to send activation email to ${user.email}`);
    }

    return success;
  }

  async activateAccount(code: string): Promise<boolean> {
    const activationCode = await this.activationCodeModel.findOne({
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!activationCode) {
      throw new BadRequestException('Invalid or expired activation code');
    }

    this.logger.log(
      `Found activation code for userId: ${activationCode.userId}`,
    );

    const user = await this.usersService.findOne(activationCode.userId);
    if (!user) {
      this.logger.error(`User not found with ID: ${activationCode.userId}`);
      throw new NotFoundException('User not found');
    }

    // Activate user account
    await this.usersService.toggleActive(activationCode.userId, {
      active: true,
    });

    // Mark code as used
    activationCode.used = true;
    await activationCode.save();

    this.logger.log(`Account activated for user ${user.username}`);

    // Send welcome email
    await this.emailService.sendWelcomeEmail({
      username: user.username,
      email: user.email,
    });

    return true;
  }

  async resendActivationCode(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.active) {
      throw new BadRequestException('Account is already activated');
    }

    // Get user document for activation
    const userDoc = await this.usersService.findByUsername(user.username);
    if (!userDoc) {
      throw new NotFoundException('User document not found');
    }

    // Invalidate old codes
    await this.activationCodeModel.updateMany(
      { userId: String(userDoc._id), used: false },
      { used: true },
    );

    return this.sendActivationEmail(userDoc);
  }

  async cleanupExpiredCodes(): Promise<void> {
    const result = await this.activationCodeModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { used: true }],
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} expired activation codes`,
    );
  }
}
