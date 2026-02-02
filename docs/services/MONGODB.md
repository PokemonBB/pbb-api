# MongoDB

MongoDB database. Document store used by the API.

## Deployment

Deployed by the [monorepo](/docs/services) with Docker Compose. Its configuration is stored in the monorepo repository.  
The monorepo uses permanent volumes for the database data.  

## Purpose

- Stores users, friendships, notifications, invitations, activation codes, password reset tokens, audit logs. See [Database](/docs/database) for collection and schema details.
- Configured via the monorepo (connection string, credentials)

## Configuration

- Host, port, username, password and database name are set via environment variables in the monorepo
- API connects using Mongoose
