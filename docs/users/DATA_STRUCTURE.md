# User Data Structure

Each user has the following fields:

- **username**: Unique identifier for login. 3-20 characters.
- **email**: Unique. Used for activation, password reset and notifications.
- **password**: Hashed. Never returned in API responses.
- **role**: ROOT, ADMIN or USER.
- **active**: Boolean. Inactive users cannot login and are invisible to USER role.
- **canInvite**: Boolean. Allows USER to create invitation codes. Granted by admin.
- **configuration**: Personal preferences (language, theme).
