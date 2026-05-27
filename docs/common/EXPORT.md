# Export

The export system allows ROOT users to download database collections as a single JSON file. It is useful for backups, migrations, or feeding seed-like data to other environments.

## Endpoints

### List collections

[`GET /api/database/collections`]({API_BASE_URL}/api#/Database/DatabaseController_getCollections)

Returns the list of non-system collection names. This endpoint is shared by the **Database** group: use it for export selection and for seed-reset collection selection.

**Access:** [ROOT](/docs/users/ROLES) only.

**Response:** `{ "collections": ["users", "types", "audits", ...] }`

### Export collections

[`POST /api/database/export`]({API_BASE_URL}/api#/Database/DatabaseController_export)

**Access:** [ROOT](/docs/users/ROLES) only. Requires authentication (JWT cookie) and an active user.

## Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `collections` | string[] | no | List of collection names to export. If omitted or empty, **all** non-system collections are exported. |

**Examples:**

- Export all collections: `{}` or `{ "collections": [] }`
- Export one collection: `{ "collections": ["types"] }`
- Export several: `{ "collections": ["types", "users", "audits"] }`

Only existing collection names are exported. Invalid or non-existent names are skipped; no error is returned for them.

## Response

- **Content-Type:** `application/json`
- **Content-Disposition:** `attachment; filename="export-<timestamp>.json"` so the browser triggers a file download.

The response body is a single JSON object. Each **key** is a collection name; each **value** is an array of documents (the collection’s documents in insertion order).

**Example structure:**

```json
{
  "types": [
    {
      "id": 9,
      "color": "#B7B7CE",
      "name": "steel",
      "names": { "es": "Acero", "en": "Steel" },
      "damage_relations": { ... },
      "move_damage_class": { "name": "physical" }
    }
  ],
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  ]
}
```

Documents are serialized to plain JSON: `_id` and other MongoDB types (e.g. ObjectId, Date) are converted to strings or ISO dates so the file is portable and re-usable (e.g. for seed data or imports).

## System Collections

When exporting “all” collections, only user collections are included. MongoDB system collections (names starting with `system.`) are never exported.

## API Reference

For request/response schemas and examples, see [Swagger - Export]({API_BASE_URL}/api#/Export).
