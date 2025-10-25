# User Visibility System

## Overview

This document explains the user visibility system that controls what data different user roles can see.

## Field Visibility Rules

### 🔒 **Private Fields (Always Hidden)**

- `password` - Never exposed in API responses
- `__v` - MongoDB version field (internal)

### 👑 **Admin-Only Fields**

- `email` - Only ROOT and ADMIN can see user emails
- `createdAt` - Only ROOT and ADMIN can see creation timestamps
- `updatedAt` - Only ROOT and ADMIN can see update timestamps

### 👤 **Public Fields (All Roles)**

- `_id` - User ID
- `username` - Username
- `role` - User role (ROOT, ADMIN, USER)
- `active` - User active status (true/false)

## Role-Based Visibility

### 🛡️ **ROOT Role**

- ✅ Can see all fields (except password)
- ✅ Can see emails of all users
- ✅ Can see timestamps
- ✅ Can modify any user
- ❌ Cannot be modified by anyone

### 👨‍💼 **ADMIN Role**

- ✅ Can see all fields (except password)
- ✅ Can see emails of all users
- ✅ Can see timestamps
- ✅ Can modify USER role users (username, email only)
- ❌ Cannot modify ROOT users
- ❌ Cannot change user roles (only ROOT can change roles)

### 👤 **USER Role**

- ✅ Can see basic fields: `_id`, `username`, `role`
- ❌ Cannot see emails of other users
- ❌ Cannot see timestamps
- ✅ Can modify only their own profile

## Implementation

### Constants

```typescript
// src/users/constants/user-fields.constants.ts
export const USER_FIELD_SELECTORS = {
  ADMIN: '-password',
  USER: '-password -email -__v -createdAt -updatedAt',
} as const;
```

### Helper Class

```typescript
// src/users/helpers/user-visibility.helper.ts
export class UserVisibilityHelper {
  static isAdminRole(userRole: UserRole): boolean;
  static canSeeEmails(userRole: UserRole): boolean;
  static canSeeTimestamps(userRole: UserRole): boolean;
}
```

### Service Methods

- `findAll()` - Returns **all users** (active + inactive) with admin visibility
- `findAllForUser()` - Returns **active users only** with user visibility
- `findOne(id)` - Returns single user (active or inactive) with admin visibility
- `findOneForUser(id)` - Returns single **active user only** with user visibility
- `searchUsers(query)` - Search **all users** (active + inactive) with admin visibility
- `searchUsersForUser(query)` - Search **active users only** with user visibility
- `toggleActive(id, data)` - Toggle user active status (Admin only)

## API Endpoints

### Admin Endpoints

- `GET /api/users` - All users (active + inactive) with admin visibility
- `GET /api/users/:id` - Single user (active or inactive) with admin visibility
- `GET /api/users/search` - Search all users (active + inactive) with admin visibility
- `PATCH /api/admin/users/:id` - Update user (Admin/Root only)
- `DELETE /api/admin/users/:id` - Delete user (Admin/Root only)
- `PATCH /api/admin/users/:id/active` - Toggle user active status (Admin/Root only)

### User Endpoints

- `GET /api/users/me` - Current user profile (full data)
- `PATCH /api/users/me/username` - Update own username
- `PATCH /api/users/me/email` - Update own email
- `PATCH /api/users/me/password` - Update own password
- `DELETE /api/users/me` - Delete own account

## Active User Behavior

### 🔍 **User Visibility by Role**

#### **👤 USER Role**

- **Inactive users** (`active: false`) are **completely invisible**
- They don't appear in `GET /api/users` lists
- They don't appear in search results
- They cannot be found by `GET /api/users/:id`
- They cannot login (authentication will fail)

#### **👨‍💼 ADMIN & 🛡️ ROOT Roles**

- Can see **all users** (active + inactive)
- Can see inactive users in `GET /api/users` lists
- Can find inactive users by `GET /api/users/:id`
- Can search inactive users
- Can manage active status of users

### 👁️ **Visibility Rules**

- **USER role**: Only sees active users
- **ADMIN/ROOT roles**: See all users (active + inactive)
- The `active` field is visible to all roles
- Inactive users are filtered at the database level for USER role only

### 🔧 **Management**

- **ROOT** users can activate/deactivate any user
- **ADMIN** users can activate/deactivate USER role users only
- **USER** role users cannot modify active status
- Use `PATCH /api/admin/users/:id/active` to toggle status

## Role Change Restrictions

### 🔒 **Role Modification Rules**

- **ROOT users**: Can change roles of any user (including promoting USER to ADMIN)
- **ADMIN users**: Cannot change roles of any user (including their own)
- **USER users**: Cannot change roles of any user

### 🚫 **What ADMIN Cannot Do**

- ❌ Change any user's role (USER → ADMIN, USER → ROOT, etc.)
- ❌ Promote users to higher privilege levels
- ❌ Demote users to lower privilege levels
- ❌ Change their own role

### ✅ **What ADMIN Can Do**

- ✅ Modify username and email of USER role users
- ✅ Toggle active status of USER role users
- ✅ Delete USER role users
- ✅ View all user information

## Security Notes

1. **Password Protection**: Passwords are never returned in API responses
2. **Email Privacy**: USER role cannot see emails of other users
3. **Timestamp Privacy**: USER role cannot see creation/update times
4. **Role-Based Access**: Each endpoint respects role-based visibility rules
5. **Self-Modification**: Users can only modify their own profile through dedicated endpoints
6. **Active Status**: Inactive users are completely invisible and cannot authenticate
7. **Role Security**: Only ROOT users can modify user roles to prevent privilege escalation

## Examples

### Admin Request (ROOT/ADMIN)

```json
GET /api/users
Response: [
  {
    "_id": "...",
    "username": "john",
    "email": "john@example.com",
    "role": "USER",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "...",
    "username": "jane",
    "email": "jane@example.com",
    "role": "USER",
    "active": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### User Request (USER role)

```json
GET /api/users
Response: [
  {
    "_id": "...",
    "username": "john",
    "role": "USER"
  }
]
```

**Note**: Inactive users (like "jane") are completely invisible to USER role
