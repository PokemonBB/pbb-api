# Account Activation System

## Overview

The account activation system requires new users to verify their email address before they can access the platform. Users receive an activation code via email and must enter it to activate their account.

## How It Works

### 🔄 **Registration Flow**

1. **User registers** → Account created with `active: false`
2. **Activation code generated** → 12-character hex code (24h expiry)
3. **Activation email sent** → User receives email with code
4. **User enters code** → Account activated with `active: true`
5. **Welcome email sent** → User receives welcome message

### 📧 **Email Templates**

#### **Activation Email**

- **Subject**: "Activate Your Account - Pokemon BattleBrawl"
- **Content**:
  - Welcome message
  - Large, highlighted activation code
  - Direct activation link
  - 24-hour expiry notice

#### **Welcome Email**

- **Subject**: "Welcome to Pokemon BattleBrawl!"
- **Content**:
  - Account activation confirmation
  - Platform introduction
  - Next steps guide

## API Endpoints

### 🔐 **Activate Account**

```http
POST /api/activation/activate
Content-Type: application/json

{
  "code": "ABC123DEF456"
}
```

**Response:**

```json
{
  "message": "Account activated successfully",
  "success": true
}
```

### 📤 **Resend Activation Code**

```http
POST /api/activation/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Activation code resent successfully",
  "success": true
}
```

### 📊 **Check Activation Status**

```http
GET /api/activation/status/user@example.com
```

**Response:**

```json
{
  "message": "Activation status retrieved",
  "email": "user@example.com"
}
```

## Database Schema

### **ActivationCode Collection**

```typescript
{
  userId: string; // User ID reference
  code: string; // 12-character hex code
  email: string; // User email
  used: boolean; // Whether code was used
  expiresAt: Date; // Expiration timestamp
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

## Security Features

### 🔒 **Code Security**

- **12-character hex codes** (72 bits of entropy)
- **24-hour expiration** for all codes
- **Single-use only** - codes become invalid after use
- **Automatic cleanup** of expired codes

### 🛡️ **Rate Limiting**

- **One active code per user** at a time
- **Old codes invalidated** when new ones are generated
- **Email-based resend** prevents abuse

### 🔐 **Account Protection**

- **Inactive users cannot login** (filtered at database level)
- **Invisible to other users** until activated
- **Admin override** - ROOT/ADMIN can see inactive users

## User Experience

### 📱 **Frontend Integration**

#### **Registration Response**

```json
{
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "active": false
  },
  "token": "jwt_token_here",
  "message": "Account created successfully. Please check your email to activate your account."
}
```

#### **Activation Page**

- **URL**: `/activate?code=ABC123DEF456`
- **Manual entry**: User can type code manually
- **Auto-fill**: Code pre-filled from email link

### 🎨 **Email Design**

#### **Activation Code Display**

```html
<div
  style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; display: inline-block; border: 2px solid #4CAF50;"
>
  <h1
    style="color: #4CAF50; margin: 0; font-size: 32px; letter-spacing: 4px; font-family: monospace;"
  >
    ABC123DEF456
  </h1>
</div>
```

#### **Call-to-Action Button**

```html
<a
  href="http://localhost:3000/activate?code=ABC123DEF456"
  style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;"
>
  Activate Account
</a>
```

## Error Handling

### ❌ **Common Errors**

#### **Invalid Code**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired activation code",
  "error": "Bad Request"
}
```

#### **Account Already Activated**

```json
{
  "statusCode": 400,
  "message": "Account is already activated",
  "error": "Bad Request"
}
```

#### **User Not Found**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 🔄 **Retry Logic**

- **Resend activation** if email not received
- **New code generated** automatically
- **Old codes invalidated** to prevent confusion

## Implementation Details

### 🏗️ **Service Architecture**

```typescript
// ActivationService methods
generateActivationCode(userId: string, email: string): Promise<string>
sendActivationEmail(user: UserDocument): Promise<boolean>
activateAccount(code: string): Promise<boolean>
resendActivationCode(email: string): Promise<boolean>
cleanupExpiredCodes(): Promise<void>
```

### 📊 **Database Operations**

#### **Code Generation**

```typescript
const code = crypto.randomBytes(6).toString('hex').toUpperCase();
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
```

#### **Code Validation**

```typescript
const activationCode = await this.activationCodeModel.findOne({
  code,
  used: false,
  expiresAt: { $gt: new Date() },
});
```

#### **Account Activation**

```typescript
await this.usersService.toggleActive(String(user._id), { active: true });
```

## Monitoring & Maintenance

### 📈 **Metrics to Track**

- **Activation rate** - % of users who activate
- **Code expiry rate** - % of codes that expire unused
- **Resend frequency** - How often users request new codes
- **Time to activation** - Average time from registration to activation

### 🧹 **Cleanup Tasks**

- **Daily cleanup** of expired codes
- **Weekly cleanup** of old activation records
- **Monthly cleanup** of unused accounts

### 📊 **Logging**

```typescript
// Activation events logged
this.logger.log(`Activation code generated for user ${userId}`);
this.logger.log(`Activation email sent to ${user.email}`);
this.logger.log(`Account activated for user ${user.username}`);
this.logger.log(`Cleaned up ${result.deletedCount} expired activation codes`);
```

## Best Practices

### 🎯 **User Experience**

- **Clear instructions** in activation email
- **Prominent code display** with good contrast
- **Direct activation link** for convenience
- **Helpful error messages** for common issues

### 🔒 **Security**

- **Short code expiry** (24 hours)
- **Single-use codes** only
- **Rate limiting** on resend requests
- **Secure code generation** using crypto.randomBytes

### 📧 **Email Delivery**

- **Reliable email service** (Gmail SMTP)
- **Professional templates** with branding
- **Mobile-responsive** design
- **Fallback text version** for all emails

## Troubleshooting

### 🚨 **Common Issues**

#### **Activation Code Not Received**

1. Check spam/junk folder
2. Verify email address is correct
3. Use resend activation endpoint
4. Check email service configuration

#### **Code Expired**

1. Request new activation code
2. Check system time synchronization
3. Verify code hasn't been used already

#### **Account Already Activated**

1. Try logging in normally
2. Check account status endpoint
3. Contact support if issues persist

### 🔧 **Debug Steps**

1. **Check code in database**:

   ```javascript
   db.activationcodes.findOne({ code: 'ABC123DEF456' });
   ```

2. **Verify user status**:

   ```javascript
   db.users.findOne({ email: 'user@example.com' });
   ```

3. **Check email logs**:

   ```bash
   # Check application logs for email delivery
   tail -f logs/application.log | grep "Activation email"
   ```

4. **Test email service**:
   ```http
   POST /api/email/test-connection
   ```

## Future Enhancements

### 🚀 **Potential Improvements**

- **SMS activation** as alternative to email
- **QR code activation** for mobile apps
- **Social login integration** with activation
- **Bulk activation** for admin users
- **Activation analytics** dashboard
- **Custom activation periods** per user type
