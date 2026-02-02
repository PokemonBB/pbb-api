# Registration

Registration is closed: a valid invitation code is required. Registration is performed via the [Auth](/docs/auth) API (register endpoint).

## Flow

1. User receives an invitation code (from ROOT, ADMIN or a user with canInvite permission).

The invitation code can be generated in:
- Admin panel: [Admin Panel]({ADMIN_PANEL_BASE_URL})
- Main game: [Main Game]({WEBAPP_BASE_URL})
- API endpoint: [Generate Invitation Code]({API_BASE_URL}/api#/Invitations/InvitationsController_createInvitation) 

Once generated, the invitation is saved in the **invitations** collection (not activation_codes).

2. User registers with username, email, password and invitation code.
3. The system validates the code (not expired, not used).
4. User account is created with role USER and active=false.
5. An [activation email](/docs/email) is sent with an **activation code** (different from invitation code).
6. Invitation is marked as used only after the email is sent successfully. If the email fails, the user is deleted and the invitation remains valid.
7. User must [activate](/docs/users/ACTIVATION) their account before they can [login](/docs/auth).

## Two Different Code Systems

| | Invitation Code | Activation Code |
|---|-----------------|-----------------|
| **Purpose** | Required for registration | Required to activate account after registration |
| **Collection** | invitations | activation_codes |
| **When created** | When admin/user generates invitation | When user registers (sent by email) |
| **TTL** | Default 7 days (configurable 1-30) | 24 hours |
| **When deleted** | MongoDB TTL index when expiresAt passes | MongoDB TTL index when expiresAt passes |

## Time to Live (TTL)

Both schemas use a MongoDB TTL index on `expiresAt` with `expireAfterSeconds: 0`. MongoDB automatically deletes documents when the expiration date has passed. The TTL monitor runs approximately every 60 seconds.

**Invitation codes:**
- Default: 7 days. Configurable when creating (1-30 days).
- Expired or used invitations are removed when expiresAt passes.

**Activation codes:**
- Fixed: 24 hours.
- Expired or used codes are removed when expiresAt passes.
