# Seed

The seed system loads initial data into the database when the API starts. It runs once on application bootstrap and only inserts into empty collections. It is used for local development, testing, and initial production setup.  

## Purpose

- Provide initial users data, like users, pokemons, items... audits for testing...
- Run automatically on application bootstrap

## When It Runs

**Automatic (bootstrap):** A `SeedHook` implements `OnApplicationBootstrap`. When the API finishes starting, it calls `seedDatabase()`. This only seeds empty collections.

**Manual (API):** `POST /api/database/seed/reset` drops collections and re-seeds from the seed files. It is a destructive operation restricted to [ROOT](/docs/users/ROLES) users only. You can reset the entire database or only specific collections (see [Reset scope](#reset-scope-full-vs-specific-collections) below). The response returns `dropped` (collection names that were dropped) and `seeded` (collection names that were re-seeded). Useful for resetting local/dev environments or refreshing only part of the data.

### Reset scope: full vs specific collections

The request body is optional and follows the same pattern as [Export](/docs/common/EXPORT):

| Body | Behaviour |
|------|-----------|
| Omitted or `{}` | **Full reset:** all collections in the database are dropped, then all seed files are applied. |
| `{ "collections": [] }` | Same as full reset. |
| `{ "collections": ["types", "moves"] }` | **Partial reset:** only the listed collections are dropped (if they exist). Then only those that have a corresponding seed file are re-seeded, in fixed order. |

**Important:**

- Only **existing** collections are dropped. If you pass a name that does not exist in the database, it is ignored (no error). The response `dropped` and `seeded` arrays reflect what was actually done.
- **Seeding order** is enforced (e.g. `types` → `pokemons` → `moves`). When you request specific collections, only those with seed files are run, but still in this order. If you reset only `moves`, the seed for moves depends on `types` and `pokemons` already being present; do not reset only `moves` if you have just dropped `types` or `pokemons` without re-seeding them in the same request (include them in `collections` so they are dropped and re-seeded first).
- Partial reset is useful to refresh a subset of data (e.g. only `types` and `moves`) without touching users, audits, or other collections.

**Request body (optional):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `collections` | string[] | no | Collection names to drop and re-seed. If omitted or empty, **all** collections are reset. |

**Response:** `201` with `{ "message": "...", "dropped": string[], "seeded": string[] }`. `dropped` lists collections that were dropped; `seeded` lists collections that were re-seeded (only those that have a seed file and were either requested or implied by full reset).

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
