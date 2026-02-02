# Auth

Authentication and session management: register, login, logout and session verification. The session is a JWT sent in an HTTP-only cookie. See [Request Structure](/docs/common/REQUEST_STRUCTURE) for how the cookie and guards work.

## Register

Registration is performed via the Auth API with username, email, password and an invitation code. The full flow (invitation validation, user creation, [activation email](/docs/email), invitation marked as used) is described in [Registration](/docs/users/REGISTRATION). On success, the API creates the user, sends the activation email and sets the session cookie so the user is logged in; the account remains inactive until [activation](/docs/users/ACTIVATION).

For request body and responses, see [Swagger - Register]({API_BASE_URL}/api#/Auth/AuthController_register).

## Login

Login accepts a single identifier field that can be either username or email, plus password. If the account is not active, login fails; the user must [activate](/docs/users/ACTIVATION) first.

**Remember me:** When set, the session cookie lasts 30 days; otherwise 24 hours.

For request body and responses, see [Swagger - Login]({API_BASE_URL}/api#/Auth/AuthController_login).

## Logout

Logout clears the session cookie. The endpoint is protected: a valid session is required.

For responses, see [Swagger - Logout]({API_BASE_URL}/api#/Auth/AuthController_logout).

## Verify

Verify returns the current authenticated user and confirms the session is valid. It uses the same guards as other protected routes: valid JWT and active account. Used by the frontend to restore session state (e.g. after reload).

For responses, see [Swagger - Verify]({API_BASE_URL}/api#/Auth/AuthController_verify).
