# API

Main backend server for the PBB ecosystem. NestJS application with Fastify adapter.

## Stack

- NestJS, Fastify, TypeScript
- MongoDB (Mongoose)
- JWT in HTTP-only cookie
- Swagger for API documentation

## Purpose

- Authentication (registration, login, JWT, password reset)
- User management (roles, permissions, visibility)
- Invitations (closed registration)
- Account activation
- Friends system
- Notifications
- Audit logs
- Conceptual documentation (Docs API for ROOT/ADMIN)
- Health checks

## Repository

[pbb-api](https://github.com/PokemonBB/pbb-api)

## Access

- Base URL: [API ({API_BASE_URL})]({API_BASE_URL})
- Swagger: [API Swagger ({API_BASE_URL}/docs)]({API_BASE_URL}/docs) (or `/swagger`, `/api`)

## Related Documentation

- [Users](/docs/users)
- [Request Structure](/docs/common/REQUEST_STRUCTURE)
- [Pagination](/docs/common/PAGINATION)
