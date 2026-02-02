# Invitation

**Collection:** `invitations` (Mongoose default; no explicit collection name in schema).  
**TTL:** Yes. Documents are deleted automatically when `expiresAt` has passed.

## TTL configuration

- **Field:** `expiresAt` (required, Date). Set when the invitation is created (e.g. 1–30 days ahead, configurable in the API).
- **Index:** TTL index with `expireAfterSeconds: 0`. MongoDB removes the document when `expiresAt` is in the past.
- The TTL monitor runs approximately every 60 seconds.

Used for [registration](/docs/users/REGISTRATION). When a user registers with the code, the document is marked as used in application logic; expired or used documents may be removed by TTL.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| createdBy | ObjectId | Yes | Ref: User. User who created the invitation. |
| code | string | Yes | Unique. Invitation code shared with the new user. |
| used | boolean | Yes | Default: false. Set to true when the code is used for registration. |
| usedBy | ObjectId | No | Ref: User. Set when the code is used. Default: null. |
| expiresAt | Date | Yes | TTL: document is deleted when this date is past. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |
