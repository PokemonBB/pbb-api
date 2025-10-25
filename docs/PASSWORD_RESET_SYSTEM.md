# Password Reset System

## Overview

The password reset system allows users to recover their accounts by requesting a password reset email with a secure token. Users can reset their password using the token without needing to know their current password.

## How It Works

### 🔄 **Password Reset Flow**

1. **User requests reset** → `POST /api/auth/forgot-password`
2. **Token generated** → 64-character hex token (1 hour expiry)
3. **Reset email sent** → User receives email with reset link
4. **User clicks link** → Redirected to reset page with token
5. **Password updated** → `POST /api/auth/reset-password` with new password
6. **Token invalidated** → Token becomes unusable after reset

### 📧 **Email Template**

#### **Password Reset Email**

- **Subject**: "Password Reset Request for Pokemon BattleBrawl"
- **Content**:
  - Security notice about password reset request
  - Large, prominent reset button
  - Direct reset link with token
  - 1-hour expiry notice
  - Security warning if not requested

## API Endpoints

### 🔐 **Request Password Reset**

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent successfully",
  "success": true
}
```

### 🔑 **Reset Password**

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password reset successfully",
  "success": true
}
```

### ✅ **Validate Reset Token**

```http
GET /api/auth/validate-reset-token/abc123def456...
```

**Response:**

```json
{
  "valid": true,
  "message": "Token is valid"
}
```

## Database Schema

### **PasswordReset Collection**

```typescript
{
  userId: string; // User ID reference
  token: string; // 64-character hex token
  email: string; // User email
  used: boolean; // Whether token was used
  expiresAt: Date; // Expiration timestamp (1 hour)
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

## Security Features

### 🔒 **Token Security**

- **64-character hex tokens** (256 bits of entropy)
- **1-hour expiration** for all tokens
- **Single-use only** - tokens become invalid after use
- **Automatic cleanup** of expired tokens

### 🛡️ **Rate Limiting**

- **One active token per user** at a time
- **Old tokens invalidated** when new ones are generated
- **Email-based requests** prevent abuse

### 🔐 **Account Protection**

- **No password validation** required for reset
- **Secure token generation** using crypto.randomBytes
- **Token validation** before password update

## User Experience

### 📱 **Frontend Integration**

#### **Reset Request Page**

```html
<form action="/forgot-password" method="POST">
  <input type="email" name="email" placeholder="Enter your email" required />
  <button type="submit">Send Reset Email</button>
</form>
```

#### **Reset Password Page**

```html
<form action="/reset-password" method="POST">
  <input type="hidden" name="token" value="abc123def456..." />
  <input
    type="password"
    name="newPassword"
    placeholder="New password"
    required
  />
  <input
    type="password"
    name="confirmPassword"
    placeholder="Confirm password"
    required
  />
  <button type="submit">Reset Password</button>
</form>
```

### 🎨 **Email Design**

#### **Reset Button**

```html
<a
  href="http://localhost:3000/reset-password?token=abc123def456..."
  style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;"
>
  Reset Password
</a>
```

#### **Security Notice**

```html
<div
  style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800;"
>
  <p style="margin: 0; font-size: 14px; color: #666;">
    <strong>Security Notice:</strong> If you didn't request this password reset,
    please ignore this email. Your password will remain unchanged.
  </p>
</div>
```

## Error Handling

### ❌ **Common Errors**

#### **User Not Found**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### **Invalid Token**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token",
  "error": "Bad Request"
}
```

#### **Token Already Used**

```json
{
  "statusCode": 400,
  "message": "Token has already been used",
  "error": "Bad Request"
}
```

### 🔄 **Retry Logic**

- **Request new reset** if email not received
- **New token generated** automatically
- **Old tokens invalidated** to prevent confusion

## Implementation Details

### 🏗️ **Service Architecture**

```typescript
// PasswordResetService methods
generateResetToken(userId: string, email: string): Promise<string>
sendPasswordResetEmail(email: string): Promise<boolean>
resetPassword(token: string, newPassword: string): Promise<boolean>
validateResetToken(token: string): Promise<boolean>
cleanupExpiredTokens(): Promise<void>
```

### 📊 **Database Operations**

#### **Token Generation**

```typescript
const token = crypto.randomBytes(32).toString('hex');
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
```

#### **Token Validation**

```typescript
const resetRecord = await this.passwordResetModel.findOne({
  token,
  used: false,
  expiresAt: { $gt: new Date() },
});
```

#### **Password Update**

```typescript
await this.usersService.updatePasswordDirect(resetRecord.userId, newPassword);
```

## Monitoring & Maintenance

### 📈 **Metrics to Track**

- **Reset request rate** - How often users request resets
- **Token usage rate** - % of tokens that are actually used
- **Token expiry rate** - % of tokens that expire unused
- **Time to reset** - Average time from request to reset

### 🧹 **Cleanup Tasks**

- **Hourly cleanup** of expired tokens
- **Daily cleanup** of old reset records
- **Weekly cleanup** of unused accounts

### 📊 **Logging**

```typescript
// Password reset events logged
this.logger.log(`Password reset token generated for user ${userId}`);
this.logger.log(`Password reset email sent to ${email}`);
this.logger.log(`Password reset completed for user ${userId}`);
this.logger.log(
  `Cleaned up ${result.deletedCount} expired password reset tokens`,
);
```

## Best Practices

### 🎯 **User Experience**

- **Clear instructions** in reset email
- **Prominent reset button** with good contrast
- **Direct reset link** for convenience
- **Helpful error messages** for common issues

### 🔒 **Security**

- **Short token expiry** (1 hour)
- **Single-use tokens** only
- **Rate limiting** on reset requests
- **Secure token generation** using crypto.randomBytes

### 📧 **Email Delivery**

- **Reliable email service** (Gmail SMTP)
- **Professional templates** with branding
- **Mobile-responsive** design
- **Fallback text version** for all emails

## Troubleshooting

### 🚨 **Common Issues**

#### **Reset Email Not Received**

1. Check spam/junk folder
2. Verify email address is correct
3. Request new reset token
4. Check email service configuration

#### **Token Expired**

1. Request new password reset
2. Check system time synchronization
3. Verify token hasn't been used already

#### **Invalid Token**

1. Check token format (64 hex characters)
2. Verify token hasn't expired
3. Ensure token hasn't been used

### 🔧 **Debug Steps**

1. **Check token in database**:

   ```javascript
   db.passwordresets.findOne({ token: 'abc123def456...' });
   ```

2. **Verify user exists**:

   ```javascript
   db.users.findOne({ email: 'user@example.com' });
   ```

3. **Check email logs**:

   ```bash
   # Check application logs for email delivery
   tail -f logs/application.log | grep "Password reset email"
   ```

4. **Test email service**:
   ```http
   POST /api/email/test-connection
   ```

## Frontend Integration Examples

### 🔗 **Reset Link Handling**

```javascript
// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Validate token before showing form
fetch(`/api/auth/validate-reset-token/${token}`)
  .then((response) => response.json())
  .then((data) => {
    if (data.valid) {
      showResetForm(token);
    } else {
      showErrorMessage('Invalid or expired reset token');
    }
  });
```

### 📝 **Password Reset Form**

```javascript
// Submit reset request
async function requestPasswordReset(email) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();
  if (result.success) {
    showSuccessMessage('Password reset email sent!');
  } else {
    showErrorMessage('Failed to send reset email');
  }
}

// Submit new password
async function resetPassword(token, newPassword) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const result = await response.json();
  if (result.success) {
    showSuccessMessage('Password reset successfully!');
    redirectToLogin();
  } else {
    showErrorMessage('Failed to reset password');
  }
}
```

## Future Enhancements

### 🚀 **Potential Improvements**

- **SMS password reset** as alternative to email
- **Security questions** for additional verification
- **Password strength requirements** during reset
- **Account lockout** after multiple failed attempts
- **Reset analytics** dashboard
- **Custom reset periods** per user type
- **Two-factor authentication** integration
- **Biometric reset** for mobile apps
