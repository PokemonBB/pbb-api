# User

**Collection:** `users`  
**TTL:** None. Documents are not automatically deleted.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique. Login identifier. |
| email | string | Yes | Unique. |
| password | string | Yes | Hashed (e.g. bcrypt). Never returned in API responses. |
| role | string | Yes | Enum: ROOT, ADMIN, USER. Default: USER. See [Roles](/docs/users/ROLES). |
| active | boolean | Yes | Default: false. Must be true to [login](/docs/auth). See [Activation](/docs/users/ACTIVATION). |
| canInvite | boolean | Yes | Default: false. Whether the user can create [invitations](/docs/users/REGISTRATION). |
| configuration | object | No | User preferences. See below. |
| createdAt | Date | Auto | Set by Mongoose timestamps. |
| updatedAt | Date | Auto | Set by Mongoose timestamps. |

## configuration (embedded)

| Field | Type | Description |
|-------|------|-------------|
| language | string | Enum: 'es', 'en'. |
| theme | string | Enum: 'system', 'dark', 'light'. |

See [Configuration](/docs/users/CONFIGURATION).
