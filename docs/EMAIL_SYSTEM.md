# Email System Documentation

## Overview

The email system is configured to use Gmail SMTP with nodemailer for sending automated emails. The system includes pre-built templates for common email scenarios.

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Gmail SMTP Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `GMAIL_PASSWORD`

## Email Templates

### 🎉 Welcome Email

- **Trigger**: New user registration
- **Template**: `getWelcomeTemplate()`
- **Features**:
  - Branded PokemonBattleBrawl design
  - Welcome message with next steps
  - Call-to-action button

### 🔐 Password Reset Email

- **Trigger**: Password reset request
- **Template**: `getPasswordResetTemplate()`
- **Features**:
  - Security-focused design
  - Reset link with token
  - 1-hour expiration notice

### ✅ Account Activation Email

- **Trigger**: Admin activates user account
- **Template**: `getAccountActivationTemplate()`
- **Features**:
  - Success confirmation
  - Login instructions
  - Platform access information

### ⚠️ Account Deactivation Email

- **Trigger**: Admin deactivates user account
- **Template**: `getAccountDeactivationTemplate()`
- **Features**:
  - Status notification
  - Support contact information
  - Reactivation process

## API Endpoints

### Test Connection

```http
POST /api/email/test-connection
Authorization: Cookie with JWT token
```

**Response:**

```json
{
  "message": "Email connection successful",
  "connected": true
}
```

### Send Welcome Email

```http
POST /api/email/send-welcome
Authorization: Cookie with JWT token
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com"
}
```

### Send Password Reset Email

```http
POST /api/email/send-password-reset
Authorization: Cookie with JWT token
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "resetToken": "abc123def456"
}
```

### Send Account Activation Email

```http
POST /api/email/send-account-activation
Authorization: Cookie with JWT token
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "status": "activated"
}
```

### Send Account Deactivation Email

```http
POST /api/email/send-account-deactivation
Authorization: Cookie with JWT token
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "status": "deactivated"
}
```

## Usage in Services

### Basic Email Sending

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class SomeService {
  constructor(private emailService: EmailService) {}

  async sendNotification() {
    const success = await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Custom Subject',
      html: '<h1>Custom HTML</h1>',
      text: 'Custom text content',
    });
  }
}
```

### Using Templates

```typescript
// Welcome email
await this.emailService.sendWelcomeEmail({
  username: 'johndoe',
  email: 'john@example.com',
});

// Password reset
await this.emailService.sendPasswordResetEmail({
  username: 'johndoe',
  email: 'john@example.com',
  resetToken: 'abc123def456',
});

// Account status
await this.emailService.sendAccountActivationEmail({
  username: 'johndoe',
  email: 'john@example.com',
  status: 'activated',
});
```

## Security Features

### 🔒 Authentication Required

- All email endpoints require JWT authentication
- Only ROOT and ADMIN roles can send emails
- Prevents unauthorized email sending

### 🛡️ Input Validation

- All email data is validated using interfaces
- Email addresses are properly formatted
- HTML content is sanitized in templates

### 🔐 Gmail Security

- Uses OAuth2 app passwords
- No plain text credentials in code
- Secure SMTP connection

## Error Handling

### Connection Issues

```typescript
// Test connection before sending
const isConnected = await this.emailService.testConnection();
if (!isConnected) {
  this.logger.error('Email service not available');
  return false;
}
```

### Send Failures

```typescript
const success = await this.emailService.sendEmail(options);
if (!success) {
  this.logger.error('Failed to send email');
  // Handle failure (retry, notify admin, etc.)
}
```

## Template Customization

### Adding New Templates

1. **Create template method** in `EmailTemplatesService`:

```typescript
getCustomTemplate(data: CustomEmailData): EmailTemplate {
  return {
    subject: 'Custom Subject',
    html: `<div>Custom HTML</div>`,
    text: 'Custom text content'
  };
}
```

2. **Add service method** in `EmailService`:

```typescript
async sendCustomEmail(data: CustomEmailData): Promise<boolean> {
  const template = this.emailTemplatesService.getCustomTemplate(data);
  return this.sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
```

3. **Add controller endpoint** in `EmailController`:

```typescript
@Post('send-custom')
async sendCustomEmail(@Body() data: CustomEmailData) {
  const success = await this.emailService.sendCustomEmail(data);
  return { success, message: success ? 'Email sent' : 'Failed to send' };
}
```

## Monitoring & Logging

### Email Logs

- All email attempts are logged
- Success/failure status tracked
- Message IDs recorded for tracking

### Connection Monitoring

- Regular connection tests recommended
- Automatic retry mechanisms
- Fallback notification systems

## Best Practices

### 📧 Email Content

- Always include both HTML and text versions
- Use responsive design for mobile
- Include unsubscribe links where appropriate
- Test emails before production use

### 🔄 Error Handling

- Implement retry logic for failed sends
- Log all email activities
- Monitor email delivery rates
- Set up alerts for service failures

### 🚀 Performance

- Use connection pooling
- Batch email sending when possible
- Implement rate limiting
- Cache template rendering

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Check Gmail credentials
   - Verify app password is correct
   - Ensure 2FA is enabled

2. **"Connection timeout" error**
   - Check network connectivity
   - Verify Gmail SMTP settings
   - Check firewall settings

3. **"Authentication failed" error**
   - Regenerate app password
   - Check account security settings
   - Verify email address format

### Debug Steps

1. Test connection: `POST /api/email/test-connection`
2. Check logs for detailed error messages
3. Verify environment variables
4. Test with simple email first
5. Check Gmail account security settings
