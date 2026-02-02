# Profile Management

Users manage their own data through specific endpoints, not the admin panel.

## Editable Fields

- **Username**: Minimum 3 characters. Must be unique.
- **Email**: Must be valid and unique.
- **Password**: Requires current password for verification. Minimum 6 characters.
- **Configuration**: Language and theme.

These endpoints are available to all authenticated users for their own profile only.

## Account Deletion

Users can delete their own account. This action:

- Requires password confirmation
- Is irreversible (all user data is removed)
- Is available to all users for their own account only

Admins delete other users via the admin endpoint (USER role only for ADMIN).

## canInvite Permission

By default, USER accounts cannot create invitations. ADMIN or ROOT can grant this permission by setting canInvite=true on a user. That user can then generate invitation codes to share with others. Useful for trusted community members or beta testers.
