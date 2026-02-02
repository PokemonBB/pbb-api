import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailTemplate,
  WelcomeEmailData,
  PasswordResetEmailData,
  AccountStatusEmailData,
} from '../interfaces/email.interface';

@Injectable()
export class EmailTemplatesService {
  constructor(private configService: ConfigService) {}

  getWelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
    return {
      subject: 'Welcome to PokemonBattleBrawl!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">🎮 Pokemon BattleBrawl</h1>
            <p style="color: #666; margin: 10px 0;">The ultimate Pokemon battle platform</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Welcome ${data.username}!</h2>
            <p>Your account has been successfully created and you're ready to start your Pokemon journey!</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>🎯 Complete your trainer profile</li>
              <li>⚔️ Start your first battle</li>
              <li>🏆 Climb the leaderboards</li>
              <li>👥 Connect with other trainers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Start Your Journey
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Pokemon BattleBrawl Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `Welcome to Pokemon BattleBrawl!\n\nHello ${data.username},\n\nYour account has been successfully created and you're ready to start your Pokemon journey!\n\nVisit ${this.configService.get<string>('FRONTEND_URL')} to get started.\n\nBest regards,\nThe Pokemon BattleBrawl Team`,
    };
  }

  getPasswordResetTemplate(data: PasswordResetEmailData): EmailTemplate {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${data.resetToken}`;

    return {
      subject: 'Password Reset - PokemonBattleBrawl',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF5722; margin: 0;">🔐 Password Reset</h1>
            <p style="color: #666; margin: 10px 0;">Pokemon BattleBrawl Security</p>
          </div>
          
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #FF5722;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.username}!</h2>
            <p>You have requested to reset your password for your Pokemon BattleBrawl account.</p>
            <p>Click the button below to reset your password:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #FF5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Security Note:</strong> This link will expire in 1 hour for your security. 
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Pokemon BattleBrawl Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `Password Reset - Pokemon BattleBrawl\n\nHello ${data.username},\n\nYou have requested to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 1 hour for your security.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Pokemon BattleBrawl Team`,
    };
  }

  getAccountActivationTemplate(data: AccountStatusEmailData): EmailTemplate {
    return {
      subject: 'Account Activated - PokemonBattleBrawl',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">✅ Account Activated</h1>
            <p style="color: #666; margin: 10px 0;">Pokemon BattleBrawl Administration</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #4CAF50;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.username}!</h2>
            <p>Great news! Your account has been activated by an administrator.</p>
            <p>You can now log in and start using all the features of our platform.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Pokemon BattleBrawl Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `Account Activated - Pokemon BattleBrawl\n\nHello ${data.username},\n\nYour account has been activated by an administrator.\n\nYou can now log in and start using our platform.\n\nVisit ${this.configService.get<string>('FRONTEND_URL')} to get started.\n\nBest regards,\nThe Pokemon BattleBrawl Team`,
    };
  }

  getAccountActivationCodeTemplate(
    data: AccountStatusEmailData,
  ): EmailTemplate {
    return {
      subject: 'Activate Your Account - Pokemon BattleBrawl',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">🎮 Activate Your Account</h1>
            <p style="color: #666; margin: 10px 0;">Pokemon BattleBrawl</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #4CAF50;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.username}!</h2>
            <p>Welcome to Pokemon BattleBrawl! Your account has been created successfully.</p>
            <p>To complete your registration, please activate your account using the code below:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; display: inline-block; border: 2px solid #4CAF50;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 32px; letter-spacing: 4px; font-family: monospace;">${data.activationCode}</h1>
            </div>
          </div>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Important:</strong> This activation code will expire in 24 hours. 
              If you didn't create this account, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL')}/activate?code=${data.activationCode}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Activate Account
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Pokemon BattleBrawl Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `Activate Your Account - Pokemon BattleBrawl\n\nHello ${data.username}!\n\nWelcome to Pokemon BattleBrawl! Your account has been created successfully.\n\nTo complete your registration, please activate your account using this code:\n\n${data.activationCode}\n\nThis code will expire in 24 hours.\n\nYou can also visit: ${this.configService.get<string>('FRONTEND_URL')}/activate?code=${data.activationCode}\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nThe Pokemon BattleBrawl Team`,
    };
  }

  getAccountDeactivationTemplate(data: AccountStatusEmailData): EmailTemplate {
    return {
      subject: 'Account Deactivated - PokemonBattleBrawl',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF5722; margin: 0;">⚠️ Account Deactivated</h1>
            <p style="color: #666; margin: 10px 0;">Pokemon BattleBrawl Administration</p>
          </div>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #FF5722;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.username}!</h2>
            <p>Your account has been deactivated by an administrator.</p>
            <p>You will no longer be able to access the platform until your account is reactivated.</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Need Help?</strong> If you believe this is an error or have questions, 
              please contact our support team.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Best regards,<br>The Pokemon BattleBrawl Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `Account Deactivated - Pokemon BattleBrawl\n\nHello ${data.username},\n\nYour account has been deactivated by an administrator.\n\nYou will no longer be able to access the platform until your account is reactivated.\n\nIf you believe this is an error, please contact our support team.\n\nBest regards,\nThe Pokemon BattleBrawl Team`,
    };
  }
}
