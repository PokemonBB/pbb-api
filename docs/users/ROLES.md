# Roles

There are three roles in the application, ordered by privilege level.

## ROOT

Maximum privilege level. Intended for platform owners or super-administrators.

- Can modify any user (username, email, role, active, canInvite)
- Can change user roles (promote USER to ADMIN, etc.)
- Can delete any user
- Cannot be modified by anyone (including other ROOT users)
- Has access to admin endpoints ([audit](/docs/audit), invitations, docs API, etc.)

## ADMIN

Administrator level. Intended for moderators or support staff.

- Can modify users with USER role (username, email, active, canInvite)
- Cannot change roles (only ROOT can do that)
- Can delete users with USER role only
- Cannot modify ROOT or other ADMIN users
- Can activate or deactivate USER accounts
- Has access to admin endpoints

## USER

Standard user level. Default role for new registrations.

- Can only manage their own profile through dedicated endpoints
- Cannot access admin endpoints
- Cannot modify other users
- Can create invitations only if they have the canInvite permission (granted by admin)

## Permissions Matrix

| Action | ROOT | ADMIN | USER |
|--------|------|-------|------|
| Modify own profile | Yes | Yes | Yes |
| Modify other USER | Yes | Yes | No |
| Modify ADMIN | Yes | No | No |
| Modify ROOT | No | No | No |
| Change user roles | Yes | No | No |
| Activate/deactivate users | Yes | USER only | No |
| Delete other users | Yes | USER only | No |
| Create invitations | Yes | Yes | If canInvite |
| Access admin endpoints | Yes | Yes | No |
