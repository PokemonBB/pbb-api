# Audit

The audit system records who did what to which resource and when. Logs are stored in the **audits** collection and can be consulted (paginated) only by [ADMIN or ROOT](/docs/users/ROLES). Each record has a TTL of one year; MongoDB deletes it automatically after that.

Authentication and session are required to generate and to read audit logs; see [Request Structure](/docs/common/REQUEST_STRUCTURE) and [Auth](/docs/auth). The list endpoint uses the same [pagination](/docs/common/PAGINATION) as the rest of the API.

## What Is Logged

Each audit entry contains:

- **userId**, **username**: Who performed the action (from the authenticated session).
- **action**: `CREATE` | `UPDATE` | `DELETE` | `READ` | `USE` (or `UNKNOWN` in edge cases).
- **resource**: Type of entity (`user`, `INVITATION`, etc.).
- **resourceId**: ID of the affected entity.
- **oldValues** / **newValues**: Optional objects with the fields that changed (for updates) or the previous state (for deletes). Used for diffs and accountability.

## How Logs Are Created

**Automatic (interceptor):** An interceptor is applied to the [Admin](/docs/users/ROLES) user endpoints:

- **PATCH /api/admin/users/:id** (update user): Before the update, the interceptor loads the current user (username, email, role, active). After the request, it compares the request body with that state and writes one audit log with only the fields that changed in `oldValues` and `newValues`. If nothing changed, no log is created.
- **DELETE /api/admin/users/:id** (delete user): Logs the previous user data in `oldValues` and `newValues: { deleted: true }`.

So all admin user updates and deletions are audited automatically. The interceptor does not run on other controllers (e.g. friends, auth); only admin user operations are covered by it.

**Explicit (service):** Other modules call the audit service directly:

- **Invitations:** When an invitation is [created](/docs/users/REGISTRATION) (action `CREATE`, resource `INVITATION`) and when an invitation is used at [registration](/docs/users/REGISTRATION) (action `USE`, resource `INVITATION`). See [Registration](/docs/users/REGISTRATION) for the invitation flow.

No other resources (e.g. friends, notifications) currently write audit logs.

## Access

The audit system is intended to be consulted from the [Admin Panel - Audit]({ADMIN_PANEL_BASE_URL}/audit). The panel consumes the API to display the paginated log list.

**List logs (API):** `GET /api/audit` is restricted to [ADMIN and ROOT](/docs/users/ROLES). Results are paginated and ordered by creation date (newest first). There is no filter by user or resource in this endpoint.

**Create:** Logs are only created by the interceptor or by the invitation (and any future) logic; there is no public API to insert arbitrary audit entries.

## API Reference

For request/response schemas and query parameters, see [Swagger - Audit]({API_BASE_URL}/api#/Audit).
