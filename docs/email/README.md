# Email

The API sends transactional emails (activation, welcome, password reset, account status) using **Nodemailer** over **Gmail SMTP**. Templates use HTML and plain text and include links that depend on `FRONTEND_URL`.

## Configuration

### Environment Variables

- **GMAIL_EMAIL**: Gmail address used as sender (e.g. `myapp@gmail.com`).
- **GMAIL_PASSWORD**: Not the normal Gmail password. Use an [Application Password](#gmail-application-password).
- **FRONTEND_URL**: Base URL of the frontend (e.g. `http://localhost:3001`). Used in email templates for activation, password reset and welcome links.

If `GMAIL_EMAIL` or `GMAIL_PASSWORD` is missing, the email service does not initialize and all sends fail (the app still starts; see error handling in the flows that send email).

### Gmail Application Password

Gmail requires an Application Password when using SMTP from an app (2-Step Verification must be enabled).

1. Open [Google Account](https://myaccount.google.com/) → Security.
2. Enable **2-Step Verification** if it is not already on.
3. Under "2-Step Verification", open **App passwords**.
4. Select app: "Mail", device: "Other", name e.g. "PBB API".
5. Copy the 16-character password and set it as `GMAIL_PASSWORD` (no spaces).

Use this value only in environment variables; never commit it.

## When Emails Are Sent

| Email | When | Described in |
|-------|------|--------------|
| **Activation code** | After [registration](/docs/users/REGISTRATION); also when user requests [resend activation](/docs/users/ACTIVATION). | [Registration](/docs/users/REGISTRATION), [Activation](/docs/users/ACTIVATION) |
| **Welcome** | After user [activates](/docs/users/ACTIVATION) their account with the code. | [Activation](/docs/users/ACTIVATION) |
| **Password reset** | When user requests a password reset (public endpoint). | [Swagger - Password Reset]({API_BASE_URL}/api#/PasswordReset) |
| **Account activated** | Only when an admin sends it manually via the Email API (e.g. after activating a user by admin). | This doc, [Swagger - Email]({API_BASE_URL}/api#/Email) |
| **Account deactivated** | Only when an admin sends it manually via the Email API (e.g. after deactivating a user). | This doc, [Swagger - Email]({API_BASE_URL}/api#/Email) |

Activation code and welcome emails are sent automatically by the [Auth](/docs/auth) and [Activation](/docs/users/ACTIVATION) flows. Account activated/deactivated emails are not sent automatically when an admin toggles active; they are optional and sent only via the Email API by ROOT/ADMIN.

## Templates

Each type has a subject, HTML body and plain-text fallback. Links (activation, password reset, welcome) use `FRONTEND_URL`. Activation code expires in 24 hours; password reset link expires in 1 hour. Template content is defined in the API codebase (`email/templates`).

## Test and Manual Sending

- **Test connection:** [Test Connection]({API_BASE_URL}/api#/Email/EmailController_testConnection) (ROOT/ADMIN). Verifies Gmail SMTP without sending an email.
- **Manual send:** The Email API exposes endpoints to send each template (welcome, password reset, account activation, account deactivation) with a given body. Used for testing or to notify a user manually. See [Swagger - Email]({API_BASE_URL}/api#/Email).

## Error Handling

If sending fails (e.g. SMTP error), the service returns `false` and logs the error. In [registration](/docs/users/REGISTRATION), if the activation email fails, the user is deleted and the invitation is left unused so the user can try again. Other flows (activation resend, password reset) do not roll back; the user can request another email.
