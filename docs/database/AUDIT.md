# Audit

**Collection:** `audits`  
**TTL:** Yes. Documents are deleted 1 year after the value of `expiresAt`.

## TTL configuration

- **Field:** `expiresAt` (Date). Default at creation: `Date.now`.
- **Mongoose option:** `expires: 365 * 24 * 60 * 60` (seconds). MongoDB creates a TTL index so that the document is removed 365 days (1 year) after the date stored in `expiresAt`. With the default, that is 1 year from document creation.
- The TTL background process runs approximately every 60 seconds.

See [Audit](/docs/audit) for what is logged and who can access it.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | ID of the user who performed the action. |
| username | string | Yes | Username at the time of the action. |
| action | string | Yes | CREATE, UPDATE, DELETE, READ, USE, or UNKNOWN. |
| resource | string | Yes | Type: e.g. user, INVITATION. |
| resourceId | string | Yes | ID of the affected entity. |
| oldValues | object | No | Previous state or changed fields (for updates/deletes). Default: {}. |
| newValues | object | No | New state or changed fields. Default: {}. |
| expiresAt | Date | Auto | Used for TTL; default Date.now. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |
