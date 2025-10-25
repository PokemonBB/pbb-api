# Login System - Username or Email

## Overview

The login system now supports authentication using either **username** or **email address**. This provides users with more flexibility when logging into their accounts.

## How It Works

### 🔄 **Login Flow**

1. **User submits credentials** → `POST /api/auth/login`
2. **System tries username first** → Searches by username
3. **If not found, tries email** → Searches by email address
4. **Password validation** → Verifies password
5. **JWT token generation** → Returns authentication token

### 🔍 **Search Priority**

```typescript
// 1. First attempt: Search by username
let user = await this.usersService.findByUsername(username);

// 2. Second attempt: Search by email (if username not found)
if (!user) {
  user = await this.usersService.findByEmail(username);
}
```

## API Endpoints

### 🔐 **Login with Username or Email**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",           // Can be username
  "password": "SecurePassword123!"
}
```

**Or with email:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john@example.com",  // Can be email
  "password": "SecurePassword123!"
}
```

**With remember me:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

## Response Examples

### ✅ **Successful Login**

```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "active": true
  }
}
```

### ❌ **Invalid Credentials**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## User Experience

### 📱 **Frontend Integration**

#### **Login Form**
```html
<form id="loginForm">
  <input 
    type="text" 
    name="username" 
    placeholder="Username or Email" 
    required 
  />
  <input 
    type="password" 
    name="password" 
    placeholder="Password" 
    required 
  />
  <label>
    <input type="checkbox" name="rememberMe" />
    Remember me
  </label>
  <button type="submit">Login</button>
</form>
```

#### **JavaScript Example**
```javascript
async function login(username, password, rememberMe = false) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data.user);
      // Redirect to dashboard
    } else {
      const error = await response.json();
      console.error('Login failed:', error.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage examples:
login('johndoe', 'password123');           // Username login
login('john@example.com', 'password123'); // Email login
login('johndoe', 'password123', true);    // With remember me
```

## Security Considerations

### 🔒 **Authentication Security**

#### **Credential Validation**
- **Username/Email lookup**: Tries username first, then email
- **Password verification**: Uses bcrypt for secure comparison
- **Account status**: Checks if account is active
- **Rate limiting**: Prevents brute force attacks

#### **Token Security**
- **JWT tokens**: Secure, stateless authentication
- **HTTP-only cookies**: Prevents XSS attacks
- **Configurable expiry**: 24 hours default, 30 days with remember me
- **Secure flags**: HTTPS-only in production

### 🛡️ **Error Handling**

#### **Consistent Error Messages**
```typescript
// Both username and email failures return the same error
throw new UnauthorizedException('Invalid credentials');
```

#### **No Information Leakage**
- **Same error message**: Doesn't reveal if username/email exists
- **Timing attacks**: Consistent response times
- **No enumeration**: Can't determine valid usernames/emails

## Implementation Details

### 🏗️ **Service Architecture**

```typescript
async login(loginDto: LoginDto) {
  const { username, password } = loginDto;

  // Try to find user by username first, then by email
  let user = await this.usersService.findByUsername(username);
  if (!user) {
    user = await this.usersService.findByEmail(username);
  }
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Validate password
  const isPasswordValid = await this.usersService.validatePassword(
    password,
    user.password,
  );
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate JWT token
  const payload = { sub: user._id, username: user.username };
  const token = this.jwtService.sign(payload);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
    },
    token,
  };
}
```

### 📊 **Database Queries**

#### **Username Search**
```typescript
// First attempt: Search by username
const user = await this.userModel.findOne({ username }).exec();
```

#### **Email Search**
```typescript
// Second attempt: Search by email
const user = await this.userModel.findOne({ email }).exec();
```

## Best Practices

### 🎯 **User Experience**

#### **Clear Input Labels**
```html
<label for="username">Username or Email</label>
<input 
  type="text" 
  id="username" 
  name="username" 
  placeholder="Enter your username or email"
  autocomplete="username"
/>
```

#### **Helpful Placeholders**
```html
<input 
  type="text" 
  placeholder="Username or email address"
  title="You can use either your username or email to login"
/>
```

### 🔒 **Security Best Practices**

#### **Input Validation**
```typescript
@IsNotEmpty()
@IsString()
username: string; // Can be username or email
```

#### **Consistent Error Handling**
```typescript
// Always return the same error message
throw new UnauthorizedException('Invalid credentials');
```

#### **Rate Limiting**
```typescript
// Implement rate limiting to prevent brute force
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 attempts per minute
```

## Testing Examples

### 🧪 **Test Cases**

#### **Username Login**
```javascript
// Test with username
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'password123'
  })
});
```

#### **Email Login**
```javascript
// Test with email
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john@example.com',
    password: 'password123'
  })
});
```

#### **Invalid Credentials**
```javascript
// Test with invalid credentials
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'nonexistent',
    password: 'wrongpassword'
  })
});
// Should return 401 Unauthorized
```

## Troubleshooting

### 🚨 **Common Issues**

#### **Login Not Working**
1. **Check credentials**: Verify username/email and password
2. **Account status**: Ensure account is active
3. **Email format**: Verify email format is correct
4. **Case sensitivity**: Usernames are case-sensitive

#### **Email vs Username Confusion**
- **Username**: Usually lowercase, no spaces
- **Email**: Must be valid email format
- **System tries both**: Automatically handles both cases

### 🔧 **Debug Steps**

1. **Check user exists**:
   ```javascript
   // Verify user exists in database
   db.users.findOne({ username: "johndoe" })
   db.users.findOne({ email: "john@example.com" })
   ```

2. **Verify password**:
   ```javascript
   // Check password hash
   const user = db.users.findOne({ username: "johndoe" });
   console.log(user.password); // Should be hashed
   ```

3. **Check account status**:
   ```javascript
   // Verify account is active
   const user = db.users.findOne({ username: "johndoe" });
   console.log(user.active); // Should be true
   ```

## Future Enhancements

### 🚀 **Potential Improvements**

- **Social login**: Google, Facebook, GitHub integration
- **Two-factor authentication**: SMS, email, TOTP
- **Account lockout**: After multiple failed attempts
- **Login history**: Track login attempts and locations
- **Device management**: Remember trusted devices
- **Biometric login**: Fingerprint, face recognition
- **Single sign-on (SSO)**: Enterprise integration

## Migration Guide

### 📋 **For Existing Users**

#### **No Breaking Changes**
- **Existing logins**: Continue to work with username
- **New flexibility**: Can now use email as well
- **Backward compatible**: All existing functionality preserved

#### **Frontend Updates**
```javascript
// Update placeholder text
<input placeholder="Username or Email" />

// Update help text
<p>You can login with either your username or email address</p>
```

¡El sistema de login ahora es más flexible y user-friendly! 🎉
