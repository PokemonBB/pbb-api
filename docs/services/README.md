# Services and Monorepo

This project is split into microservices, each with clear purposes and responsibilities.

## Monorepo

The [pbb-monorepo](https://github.com/PokemonBB/pbb-monorepo) is a private repository that orchestrates the full application deployment, including all microservices (own and third-party). It supports both local development and production environments.

**Contents:**

- Docker Compose scripts and configuration to start, stop and manage the environment
- Service definitions: MongoDB, API, WebApp, Admin Panel, CDS, etc.
- Environment variable templates and [seed data](/docs/common/SEED) for local and production
- CLI (deploy.sh) to start/stop the environment, configure variables, create, delete databases...

**Summary:** Deployment and infrastructure monorepo for the PBB ecosystem. It does not contain application source code; it uses Docker images stored on Docker Hub. The seed template files for pbb-api are located at `template/seed/{local|pro}/pbb-api/`. For how the seed system works in pbb-api, see [Seed](/docs/common/SEED).

## Own Services

| Service | Description | Repository |
|---------|-------------|-------------|
| [API](/docs/services/API) | Main server | [pbb-api](https://github.com/PokemonBB/pbb-api) |
| [WebApp](/docs/services/WEBAPP) | Main web application (game) | [pbb-webapp](https://github.com/PokemonBB/pbb-webapp) |
| [Admin Panel](/docs/services/ADMIN_PANEL) | Administration panel | [pbb-admin-panel](https://github.com/PokemonBB/pbb-admin-panel) |
| [CDS](/docs/services/CDS) | Content distribution system | [pbb-cds](https://github.com/PokemonBB/pbb-cds) |
| [Backup](/docs/services/BACKUP) | Zip storage for CDS content | [pbb-backup](https://github.com/PokemonBB/pbb-backup) |

## Third-Party Services

| Service | Description |
|---------|-------------|
| [MongoDB](/docs/services/MONGODB) | MongoDB database |
| [Gatus (pbb-status)](/docs/services/GATUS) | Service monitoring |
