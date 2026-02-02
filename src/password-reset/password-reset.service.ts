import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PasswordReset,
  PasswordResetDocument,
} from '../schemas/password-reset.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async generateResetToken(userId: string, email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.passwordResetModel.create({
      userId,
      token,
      email,
      expiresAt,
    });

    this.logger.log(`Password reset token generated for user ${userId}`);
    return token;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user ID from the user object
    const userId = String((user as unknown as { _id: unknown })._id);

    // Invalidate old tokens
    await this.passwordResetModel.updateMany(
      { userId, used: false },
      { used: true },
    );

    const token = await this.generateResetToken(userId, email);

    const success = await this.emailService.sendPasswordResetEmail({
      username: user.username,
      email: user.email,
      resetToken: token,
    });

    if (success) {
      this.logger.log(`Password reset email sent to ${email}`);
    } else {
      this.logger.error(`Failed to send password reset email to ${email}`);
    }

    return success;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetRecord = await this.passwordResetModel.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update user password
    await this.usersService.updatePasswordDirect(
      resetRecord.userId,
      newPassword,
    );

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    this.logger.log(`Password reset completed for user ${resetRecord.userId}`);

    return true;
  }

  async validateResetToken(token: string): Promise<boolean> {
    const resetRecord = await this.passwordResetModel.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    return !!resetRecord;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.passwordResetModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { used: true }],
    });

    this.logger.log(
      `Cleaned up ${result.deletedCount} expired password reset tokens`,
    );
  }
}
