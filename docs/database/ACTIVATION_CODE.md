# Activation Code

**Collection:** `activation_codes`  
**TTL:** Yes. Documents are deleted automatically when `expiresAt` has passed.

## TTL configuration

- **Field:** `expiresAt` (required, Date).
- **Index:** TTL index with `expireAfterSeconds: 0`. MongoDB removes the document when `expiresAt` is in the past.
- **Typical lifetime:** 24 hours from creation (set in application code when the code is generated). The TTL monitor runs approximately every 60 seconds.

Used for [account activation](/docs/users/ACTIVATION) after registration. When the user activates with the code, the document is marked as used in application logic; expired or used documents are removed by TTL or by explicit cleanup.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User to activate (reference). |
| code | string | Yes | Unique. Code sent by email and entered by user. |
| email | string | Yes | Email where the code was sent. |
| used | boolean | Yes | Default: false. Set to true when the code is used. |
| expiresAt | Date | Yes | TTL: document is deleted when this date is past. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |
