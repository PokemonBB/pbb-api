export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  username: string;
  email: string;
}

export interface PasswordResetEmailData {
  username: string;
  email: string;
  resetToken: string;
}

export interface AccountStatusEmailData {
  username: string;
  email: string;
  status: 'activated' | 'deactivated';
  activationCode?: string;
}

export interface EmailConfig {
  from: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}
