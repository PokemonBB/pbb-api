# Account Activation

New users start with active=false. They cannot [login](/docs/auth) until activated.

## Activation via Email

1. After registration, user receives an [email](/docs/email) with an activation code. (More info in [Registration](/docs/users/REGISTRATION))
2. User submits the code to the activation endpoint.
3. Account becomes active and a welcome email is sent (see [Email](/docs/email)).

## Activation by Admin

ADMIN or ROOT can activate a user directly by setting active=true via:
- Admin panel: [Manage users - Admin Panel]({ADMIN_PANEL_BASE_URL}/users)
- API endpoint: [Update User]({API_BASE_URL}/api#/Admin/AdminController_update) 

## Resend Activation

If the user did not receive the email, they can request a new activation code (Previous unused codes are invalidated) via:

- Main game login page: [Main Game]({WEBAPP_BASE_URL})
- API endpoint: [Resend Activation Code]({API_BASE_URL}/api#/Activation/ActivationController_resendActivationCode) 