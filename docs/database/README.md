# Database

The API uses **MongoDB** as its data store. Connection (host, port, credentials, database name) is configured via environment variables and the [monorepo](/docs/services); see [MongoDB](/docs/services/MONGODB) for deployment and connection details. The API connects with **Mongoose**.

## Collections

| Collection | Description | TTL |
|------------|-------------|-----|
| [users](/docs/database/USER) | User accounts, roles, configuration | No |
| [activation_codes](/docs/database/ACTIVATION_CODE) | Account activation codes (email) | Yes, see schema |
| [audits](/docs/database/AUDIT) | Audit logs (who did what) | Yes, 1 year |
| [friendships](/docs/database/FRIENDSHIP) | Friend requests and accepted friends | No |
| [invitations](/docs/database/INVITATION) | Invitation codes for registration | Yes, see schema |
| [notifications](/docs/database/NOTIFICATION) | In-app notifications per user | No |
| [password_resets](/docs/database/PASSWORD_RESET) | Password reset tokens | Yes, see schema |

## TTL (Time to Live)

Some collections use a MongoDB **TTL index** so that documents are removed automatically after a given time or after a date field has passed. The TTL background process runs about every 60 seconds. In this API:

- **Date-based TTL:** The schema has a field (e.g. `expiresAt`) and an index with `expireAfterSeconds: 0`. MongoDB deletes the document when that date is in the past.
- **Seconds-based TTL (Audit):** The schema uses Mongoose `expires` (seconds). The document is deleted that many seconds after the value of the expiry field (e.g. one year after creation).

Each schema doc below describes its fields and TTL configuration in detail.
