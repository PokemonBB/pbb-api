# Request Structure

This document explains how authentication works, the guard order and which endpoints are public or protected.

## Authentication: Cookie-Based JWT

The API uses JWT stored in an HTTP-only cookie named `token`. No Authorization header is used. Login and registration are handled by the [Auth](/docs/auth) API.

**Flow:**
1. User [logs in](/docs/auth) or [registers](/docs/auth). The API sets the cookie via `Set-Cookie`.
2. Browser sends the cookie automatically with each request (same-origin or CORS with credentials).
3. Protected endpoints validate the JWT from the cookie and load the user into `request.user`.

**Cookie options (production):**
- httpOnly: true
- secure: true
- sameSite: 'none' (for cross-origin)
- Optional domain via COOKIE_DOMAIN env var

## Guard Order

Protected endpoints use guards in this order:

1. **JwtAuthGuard:** Validates JWT from cookie. Loads user into `request.user`. Returns 401 if invalid or missing.
2. **ActiveUserGuard:** Ensures `user.active === true`. Returns 403 if account is not activated.
3. **Role-specific guards:** AdminRoleGuard, UserPermissionsGuard, InvitationPermissionsGuard, etc.

If JwtAuthGuard fails, ActiveUserGuard is not executed. If ActiveUserGuard fails, role guards are not executed.

## Protected?

Protected or not protected endpoints are defined in the swagger documentation: [API Swagger]({API_BASE_URL}/docs)

## CORS

The API is configured for cross-origin requests with `credentials: true`. The frontend must send credentials (cookies) for authenticated requests. Allowed origins are configured via CORS_ORIGINS env var.

## Roles
The users roles are defined in the [Users](/docs/users/ROLES) document.