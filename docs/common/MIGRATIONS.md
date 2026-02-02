# Migrations

This project does **not** use migration files or a dedicated migration runner. There is no NestJS-native migration system for MongoDB in use here (NestJS does not ship one; TypeORM would, but this API uses Mongoose only).

## How the database is updated

The database structure is driven by **Mongoose schemas** in `src/schemas/`. When the application starts and connects to MongoDB:

- **Collections** are created by MongoDB when the first document is written (e.g. first user, first friendship). No explicit “create collection” step is required.
- **Indexes** defined in the schemas (unique, TTL, compound) are created by Mongoose so they exist in MongoDB. So changes to indexes in the schema code are applied when the app runs; there is no separate migration step.

So “migrations” are implicit: you change the schema code (add a field, add or change an index), deploy the new version, and the next time the app runs, Mongoose and MongoDB reflect that (new documents use the new shape; new indexes are created). No migration files or `migrate` script are used.

## What this does not do

- **Removing or renaming a field** in the schema does **not** delete or rename that field in existing documents. Old documents keep the old structure until you update or replace them. If you need to clean or transform existing data, you must run a one-off script or update logic in the app.
- **Changing index definitions** (e.g. dropping an index) is not automatically applied by Mongoose in the same way as creating new indexes; you may need to change or drop indexes directly in MongoDB or via a custom script.

## Summary

| Aspect | In this project |
|--------|-----------------|
| Migration files | None |
| Migration runner / script | None |
| How structure is defined | Mongoose schemas in `src/schemas/` |
| When collections appear | When first document is inserted |
| When indexes are applied | When the app runs (Mongoose creates them from the schema) |
| Changing existing document shape | Manual (script or app logic), not automatic |

See [Database](/docs/database) for the list of collections and schemas.
