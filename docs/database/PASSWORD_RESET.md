# Password Reset

**Collection:** `password_resets`  
**TTL:** Yes. Documents are deleted automatically when `expiresAt` has passed.

## TTL configuration

- **Field:** `expiresAt` (required, Date). Set when the reset is requested (e.g. 1 hour ahead in application code).
- **Index:** TTL index with `expireAfterSeconds: 0`. MongoDB removes the document when `expiresAt` is in the past.
- The TTL monitor runs approximately every 60 seconds.

When the user resets the password with the token, the document is marked as used in application logic; expired or used documents are removed by TTL or by explicit cleanup.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User who requested the reset. |
| token | string | Yes | Unique. Token sent by email and used in the reset flow. |
| email | string | Yes | Email where the reset link was sent. |
| used | boolean | Yes | Default: false. Set to true when the token is used. |
| expiresAt | Date | Yes | TTL: document is deleted when this date is past. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |
