# Visibility

What data each role can see when viewing other users.

## Field Visibility by Role

| Field | ROOT/ADMIN | USER (viewing others) |
|-------|------------|------------------------|
| _id | Yes | Yes |
| username | Yes | Yes |
| email | Yes | No |
| role | Yes | Yes |
| active | Yes | No |
| canInvite | Yes | No |
| configuration | Yes | No |
| createdAt | Yes | No |
| updatedAt | Yes | No |
| password | Never | Never |

## Active User Filter

**USER role:**

- Only sees active users (active=true)
- Inactive users do not appear in lists, search or by ID
- Inactive users cannot login

**ROOT and ADMIN:**

- See all users (active and inactive)
- Can manage active status via admin panel (More info in [Activation](/docs/users/ACTIVATION))
- Inactive users appear in lists and can be found by ID

## Own Profile

All users see their full profile (GET /users/me) including email, active, configuration, timestamps.

## Use Cases

**USER searching for friends:** Only sees active users when using the [friends](/docs/friends) flow. Cannot see who is inactive or pending activation.

**ADMIN managing users:** Sees everyone. Can activate, deactivate, modify and delete USER accounts.

**ROOT managing platform:** Full visibility. Can promote users to ADMIN, change roles and manage all accounts.
