# Audit

The audit system records who did what to which resource and when. Logs are stored in the **audits** collection and can be consulted (paginated) only by [ADMIN or ROOT](/docs/users/ROLES). Each record has a TTL of one year; MongoDB deletes it automatically after that.

Authentication and session are required to generate and to read audit logs; see [Request Structure](/docs/common/REQUEST_STRUCTURE) and [Auth](/docs/auth). The list endpoint uses the same [pagination](/docs/common/PAGINATION) as the rest of the API.

## Audited Actions

| Trigger | Action | Resource |
| :--- | :--- | :--- |
| PATCH /api/admin/users/:id (update user) | UPDATE | USER |
| DELETE /api/admin/users/:id (delete user) | DELETE | USER |
| PATCH /api/users/me/username | UPDATE | USER |
| PATCH /api/users/me/email | UPDATE | USER |
| PATCH /api/users/me/password | UPDATE | USER |
| Password reset via email | UPDATE | USER |
| DELETE /api/users/me (delete own account) | DELETE | USER |
| POST /api/auth/register (success) | REGISTER | USER |
| POST /api/auth/login (failure) | LOGIN_FAILURE | AUTH |
| POST /api/invitations (create invitation) | CREATE | INVITATION |
| Registration using invitation code | USE | INVITATION |
| POST /api/notifications (single user) | CREATE | NOTIFICATION |
| POST /api/notifications (send to all) | CREATE | NOTIFICATION |
| POST /api/friends/request/:receiverId | CREATE | FRIENDSHIP |
| PATCH /api/friends/accept/:requestId | UPDATE | FRIENDSHIP |
| PATCH /api/friends/decline/:requestId | UPDATE | FRIENDSHIP |
| DELETE /api/friends/:friendId | DELETE | FRIENDSHIP |

## What Is Logged

Each audit entry contains:

- **userId**, **username**: Who performed the action (from the authenticated session). For login failures, `userId` is `anonymous` and `username` is the attempted identifier.
- **action**: `CREATE` | `UPDATE` | `DELETE` | `REGISTER` | `LOGIN_FAILURE` | `USE` (or `UNKNOWN` in edge cases).
- **resource**: Type of entity (`USER`, `AUTH`, `INVITATION`, `NOTIFICATION`, `FRIENDSHIP`).
- **resourceId**: ID of the affected entity (or `broadcast` for notifications sent to all users, or the attempted identifier for login failures).
- **oldValues** / **newValues**: Optional objects with the fields that changed (for updates) or the previous state (for deletes). Used for diffs and accountability.

## How Logs Are Created

**Automatic (interceptor):** An interceptor is applied to the [Admin](/docs/users/ROLES) user endpoints:

- **PATCH /api/admin/users/:id** (update user): Before the update, the interceptor loads the current user (username, email, role, active, canInvite). After the request, it compares the request body with that state and writes one audit log with only the fields that changed in `oldValues` and `newValues`. If nothing changed, no log is created.
- **DELETE /api/admin/users/:id** (delete user): Logs the previous user data in `oldValues` and `newValues: { deleted: true }`.

**Explicit (service or controller):** Other modules call the audit service directly:

- **Users (own profile):** When a user updates their username (action `UPDATE`, resource `USER`), email (action `UPDATE`, resource `USER`), or password (action `UPDATE`, resource `USER`, `newValues: { passwordChanged: true }`); when a user deletes their own account (action `DELETE`, resource `USER`). Password reset via email also logs a password change.
- **Auth:** When a user successfully registers (action `REGISTER`, resource `USER`, `newValues: { username, email }`). When a login attempt fails (action `LOGIN_FAILURE`, resource `AUTH`, `userId: 'anonymous'`, `newValues: { reason }` with `user_not_found`, `invalid_password`, or `account_not_activated`).
- **Invitations:** When an invitation is [created](/docs/users/REGISTRATION) (action `CREATE`, resource `INVITATION`) and when an invitation is used at [registration](/docs/users/REGISTRATION) (action `USE`, resource `INVITATION`). See [Registration](/docs/users/REGISTRATION) for the invitation flow.
- **Notifications:** When an ADMIN/ROOT creates a notification (action `CREATE`, resource `NOTIFICATION`). Single user: `resourceId` is the notification id, `newValues` include message, type, receiverId. Send to all: `resourceId` is `broadcast`, `newValues` include message, type, recipientsCount.
- **Friends:** When a user sends a friend request (action `CREATE`, resource `FRIENDSHIP`). When a user accepts (action `UPDATE`, resource `FRIENDSHIP`, status pending → accepted) or declines (action `UPDATE`, resource `FRIENDSHIP`, status pending → declined) a request. When a user removes a friend (action `DELETE`, resource `FRIENDSHIP`).

## Access

The audit system is intended to be consulted from the [Admin Panel - Audit]({ADMIN_PANEL_BASE_URL}/audit). The panel consumes the API to display the paginated log list.

**List logs (API):** `GET /api/audit` is restricted to [ADMIN and ROOT](/docs/users/ROLES). Results are paginated and ordered by creation date (newest first).

### Filters

All filters are optional query parameters that can be combined:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `username` | string | Partial, case-insensitive match on the actor username |
| `userId` | string | Exact match on the actor userId |
| `action` | enum | One of: `CREATE`, `UPDATE`, `DELETE`, `REGISTER`, `LOGIN_FAILURE`, `USE`, `READ`, `UNKNOWN` |
| `resource` | enum | One of: `USER`, `AUTH`, `INVITATION`, `NOTIFICATION`, `FRIENDSHIP`, `UNKNOWN` |
| `resourceId` | string | Exact match on the affected entity ID |
| `dateFrom` | ISO 8601 | Start of date range (inclusive, on `createdAt`) |
| `dateTo` | ISO 8601 | End of date range (inclusive, on `createdAt`) |

Example: `GET /api/audit?action=DELETE&resource=USER&dateFrom=2026-01-01T00:00:00.000Z&page=1&limit=25`

**Create:** Logs are only created by the interceptor or by the modules listed above; there is no public API to insert arbitrary audit entries.

## API Reference

For request/response schemas and query parameters, see [Swagger - Audit]({API_BASE_URL}/api#/Audit).
