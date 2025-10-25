# Audit System Documentation

## Overview

The audit system automatically tracks administrative actions in the API, recording what changes were made, when, and by whom.

## How it Works

- **Automatic Logging**: The system automatically captures admin actions without manual intervention
- **Change Tracking**: Records both old and new values for each field that was modified
- **User Attribution**: Links each action to the admin user who performed it
- **Data Retention**: Audit logs are automatically deleted after 1 year (TTL)

## Tracked Actions

### User Management Actions

| Action     | Description             | What's Logged                     |
| ---------- | ----------------------- | --------------------------------- |
| **UPDATE** | Modify user information | Only fields that actually changed |
| **DELETE** | Remove user from system | User data before deletion         |

### Action Details

#### UPDATE Action

- **Triggered by**: `PATCH /api/admin/users/{id}`
- **Logged Fields**: `username`, `email`, `role`, `active`
- **Example**:
  ```json
  {
    "action": "UPDATE",
    "oldValues": { "username": "olduser", "active": false },
    "newValues": { "username": "newuser", "active": true }
  }
  ```

#### DELETE Action

- **Triggered by**: `DELETE /api/admin/users/{id}`
- **Logged Fields**: Complete user data before deletion
- **Example**:
  ```json
  {
    "action": "DELETE",
    "oldValues": {
      "username": "user",
      "email": "user@example.com",
      "role": "USER",
      "active": true
    },
    "newValues": { "deleted": true }
  }
  ```

## Audit Log Structure

### Fields in Each Log Entry

```json
{
  "_id": "unique_log_id",
  "userId": "admin_user_id_who_performed_action",
  "username": "admin_username",
  "action": "UPDATE|DELETE",
  "resource": "user",
  "resourceId": "target_user_id",
  "oldValues": { "field": "old_value" },
  "newValues": { "field": "new_value" },
  "expiresAt": "2025-10-24T14:43:07.604Z",
  "createdAt": "2025-10-24T14:43:07.605Z"
}
```

### Field Descriptions

- **userId**: ID of the admin who performed the action
- **username**: Username of the admin who performed the action
- **action**: Type of action performed (UPDATE, DELETE)
- **resource**: Type of resource being modified (always "user" for user management)
- **resourceId**: ID of the user being modified
- **oldValues**: Previous values of changed fields
- **newValues**: New values of changed fields
- **expiresAt**: Automatic deletion date (1 year from creation)
- **createdAt**: When the action was performed

## API Endpoints

### Get Audit Logs

```
GET /api/audit?page=1&limit=10
```

- **Access**: Admin/Root users only
- **Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Paginated list of audit logs

### Example Response

```json
{
  "audits": [
    {
      "_id": "68fb907bfe9db96a2bf302ce",
      "userId": "68fb5dfab2e16769937036c6",
      "username": "admin",
      "action": "UPDATE",
      "resource": "user",
      "resourceId": "68fb5dfab2e16769937036d5",
      "oldValues": { "username": "olduser" },
      "newValues": { "username": "newuser" },
      "expiresAt": "2025-10-24T14:43:07.604Z",
      "createdAt": "2025-10-24T14:43:07.605Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

## Smart Change Detection

The system only logs fields that actually changed:

### Example Scenarios

#### Scenario 1: Only Username Changed

**Request**: `PATCH /api/admin/users/123` with `{"username": "newuser"}`
**Result**: Only logs the username change, ignores unchanged fields

#### Scenario 2: Multiple Fields Changed

**Request**: `PATCH /api/admin/users/123` with `{"username": "newuser", "active": true}`
**Result**: Logs both username and active status changes

#### Scenario 3: No Changes

**Request**: `PATCH /api/admin/users/123` with `{"username": "sameuser"}` (same as current)
**Result**: No audit log created (no actual changes)

## Security Features

- **Admin Only**: Only admin and root users can view audit logs
- **Automatic Cleanup**: Logs are automatically deleted after 1 year
- **Change Tracking**: Records exactly what changed, not the entire object
- **User Attribution**: Every action is linked to the admin who performed it

## Technical Implementation

- **Interceptor**: Automatically captures admin actions
- **Database**: MongoDB with TTL index for automatic cleanup
- **Validation**: Only logs actual changes, not unchanged fields
- **Performance**: Minimal impact on API response times
