import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailTemplatesService } from './templates/email-templates.service';
import {
  WelcomeEmailData,
  PasswordResetEmailData,
  AccountStatusEmailData,
} from './interfaces/email.interface';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplatesService: EmailTemplatesService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const email = this.configService.get<string>('GMAIL_EMAIL');
    const password = this.configService.get<string>('GMAIL_PASSWORD');

    if (!email || !password) {
      this.logger.warn(
        'Gmail credentials not configured. Email service will not work.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    this.logger.log('Email transporter initialized successfully');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error(
        'Email transporter not initialized. Check Gmail credentials.',
      );
      return false;
    }

    try {
      const mailOptions = {
        from:
          options.from ||
          `"Pokemon BattleBrawl" <${this.configService.get<string>('GMAIL_EMAIL')}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = (await this.transporter.sendMail(mailOptions)) as {
        messageId?: string;
      };
      this.logger.log(
        `Email sent successfully to ${options.to}. Message ID: ${result.messageId || 'unknown'}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const template = this.emailTemplatesService.getWelcomeTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const template = this.emailTemplatesService.getPasswordResetTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAccountActivationEmail(
    data: AccountStatusEmailData,
  ): Promise<boolean> {
    const template =
      this.emailTemplatesService.getAccountActivationTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAccountDeactivationEmail(
    data: AccountStatusEmailData,
  ): Promise<boolean> {
    const template =
      this.emailTemplatesService.getAccountDeactivationTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendActivationCodeEmail(
    data: AccountStatusEmailData,
  ): Promise<boolean> {
    const template =
      this.emailTemplatesService.getAccountActivationCodeTemplate(data);

    return this.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }
}
