# Admin Panel

Administration panel for ROOT and ADMIN users.

## Stack

- Svelte, TypeScript
- Marked (for rendering conceptual documentation)
- Static Adapter (SPA) + Nginx in Docker Hub image

## Purpose

- User management (list, edit, activate/deactivate, delete)
- Invitation creation
- Audit log viewing
- Access to conceptual documentation (Docs API)

## Repository

[pbb-admin-panel](https://github.com/PokemonBB/pbb-admin-panel)

## Access

- Base URL: [Admin Panel ({ADMIN_PANEL_BASE_URL})]({ADMIN_PANEL_BASE_URL})
- Requires ROOT or ADMIN role
- Uses the API for all operations

## Related Documentation

- [Roles](/docs/users/ROLES)
- [User Visibility](/docs/users/VISIBILITY)
