# Seed

The seed system loads initial data into the database when the API starts. It runs once on application bootstrap and only inserts into empty collections. It is used for local development, testing, and initial production setup.  

## Purpose

- Provide initial users data, like users, pokemons, items... audits for testing...
- Run automatically on application bootstrap

## When It Runs

A `SeedHook` implements `OnApplicationBootstrap`. When the API finishes starting, it calls `seedDatabase()`. There is no manual trigger or HTTP endpoint.

## Location

The API reads seed files from the `seed` directory at the application root (`process.cwd()/seed`). This directory is gitignored in pbb-api.

The actual seed files are not stored in the pbb-api repository. They come from the [monorepo](/docs/services), which provides environment-specific templates at `template/seed/{local|pro}/pbb-api/`. In Docker, the monorepo mounts that path into the container as `/app/seed`.

## Idempotence

The seed is idempotent. Before inserting into a collection, it checks if the collection is empty. If it already has data, that collection is skipped. No updates or merges are performed.

- **users**: Uses `UsersService.findAll()`; seeds only when the result is empty
- **audits**: Uses `AuditService.findAllPaginated({ page: 1, limit: 1 })`; seeds only when `pagination.total === 0`

## Mappings

Each `.json` file in the seed directory maps to a collection and a service. The filename (without extension) determines the mapping.

| File       | Collection | Service        | Check method        |
|------------|------------|----------------|---------------------|
| users.json | users      | UsersService   | findAll             |
| audits.json| audits     | AuditService   | findAllPaginated    |

Files without a mapping are ignored (a warning is logged).

## Data Format

**users.json**: Array of objects with `username`, `email`, `password`, `role` (ROOT, ADMIN, USER), `active` (boolean).

**audits.json**: Array of objects with `userId`, `username`, `action`, `resource`, `resourceId`, and optionally `oldValues`, `newValues`. The API may ignore `_id`, `createdAt`, `updatedAt`, `expiresAt`, `__v` if present; it uses `createAuditLog` which sets timestamps and TTL.

## Adding New Collections

To support a new collection:

1. Add the JSON file to the monorepo template at `template/seed/{local|pro}/pbb-api/`
2. Add a `case` in `SeedService.getSeedFiles()` with the correct service and check method
3. Add a `case` in `SeedService.processSeedData()` and implement the insert logic
