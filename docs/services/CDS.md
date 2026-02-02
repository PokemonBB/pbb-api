# Content Distribution System

A resource distribution API. Its main purpose is to list and deliver files securely. Content with copyright is distributed on-demand to authorized users only, ensuring compliance with licensing and internal access control.

## Stack

- Pure JavaScript with Fastify
- JWT authentication (cookie-based)
- Swagger for API documentation

## Purpose

**File management:** Browse and download assets (images, audio, video, JSON) from a server directory.

**Protected access:** All content (except the health check) requires JWT authorization. Access is further restricted by the application's invitation-based registration. See [User Registration](/docs/users/REGISTRATION).

## Repository

[pbb-cds](https://github.com/PokemonBB/pbb-cds)

## Endpoints

[Swagger documentation]({CDS_BASE_URL}/docs)

| Endpoint | Description |
|----------|-------------|
| GET /api/content | Returns an index of all available files. Lists all content. |
| GET /api/content/file/{*} | File downloader. Pass the path and receive the file. Supports multiple formats (PNG, MP4, MP3, etc.). |
| GET /health | Simple health check to verify the service is running. |
