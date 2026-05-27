# Pokémons

## Data Model

Each document in the `pokemons` collection contains:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique numeric identifier (national Pokédex number) |
| `name` | string | Internal lowercase name (`bulbasaur`, `pikachu`, …) |
| `types` | array | One or two type slots; each has `slot` (1 or 2) and `type` (ObjectId ref to `PokemonType`) |
| `base_experience` | number | Base experience yielded when the Pokémon is defeated |
| `height` | number | Height in decimetres |
| `weight` | number | Weight in hectograms |
| `stats` | array | Base stats: `name` (e.g. `hp`, `attack`) and `base_stat` (numeric value) |

### Type slots

Each entry in `types` has:

| Field | Type | Description |
| :--- | :--- | :--- |
| `slot` | number | 1 = primary type, 2 = secondary type |
| `type` | ObjectId | Reference to a document in the [`types`](/docs/pokemon/TYPES) collection |

When returned by the API, `type` is populated with the full type document (id, name, color, damage_relations, etc.) so the client does not need extra lookups.

### Stats

The six standard stats are:

| Name | Description |
| :--- | :--- |
| `hp` | Hit points |
| `attack` | Physical attack |
| `defense` | Physical defense |
| `special-attack` | Special attack |
| `special-defense` | Special defense |
| `speed` | Speed |

Each stat object has `name` (string) and `base_stat` (number, typically 0–255).

## Seed Data

Pokémon data is loaded from the [seed system](/docs/common/SEED). The seed file lives in the **common** seed directory (`seed-common/pokemons.json`).

### Type references on seed

The seed file uses **numeric type ids** (1–18) in each Pokémon’s `types` array. During seed:

1. The **types** collection is seeded first (order is enforced so `types` runs before `pokemons`).
2. When seeding **pokemons**, each `types[].type.id` (number) is resolved to the corresponding type document’s MongoDB `_id` (ObjectId).
3. Only `{ slot, type: ObjectId }` is stored; the seed does not store `{ id, name }` in the Pokémon document.

If a type id in the Pokémon seed does not exist in the `types` collection, that slot is skipped and a warning is logged.

## Endpoints

### Get all Pokémons

[`GET /api/pokemon/pokemons`]({API_BASE_URL}/api#/Pokemon/PokemonController_findAll)

Returns a paginated list of Pokémons sorted by numeric `id`. Each item has `types.type` populated with the type document.

Uses the same [pagination](/docs/common/PAGINATION) as other list endpoints: query params `page` (default 1) and `limit` (default 10, max 100). Optional filter by type:

| Param | Required | Description |
| :--- | :--- | :--- |
| `page` | no | Page number (default 1) |
| `limit` | no | Items per page (default 10, max 100) |
| `types` | no | Comma-separated type ids (e.g. `1,12,10`). Only Pokémons that have **at least one** of these types are returned. |

**Examples:**  
`GET /api/pokemon/pokemons?page=1&limit=20`  
`GET /api/pokemon/pokemons?page=1&limit=24&types=10,3` (fire and flying)

**Response:** `{ data: Pokémon[], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`.

### Search Pokémon by id or name

[`GET /api/pokemon/pokemons/search`]({API_BASE_URL}/api#/Pokemon/PokemonController_search)

Search by **id** (exact match) or by **name** (case-insensitive partial match). Uses the same [pagination](/docs/common/PAGINATION) as the list endpoint.

**Query params:**

| Param | Required | Description |
| :--- | :--- | :--- |
| `query` | yes | Numeric id (e.g. `25`) or name substring (e.g. `pika`, `char`) |
| `page` | no | Page number (default 1) |
| `limit` | no | Items per page (default 10, max 100) |

- If `query` is only digits, the filter is `id` equals that number (at most one result).
- Otherwise the filter is `name` matching the string (case-insensitive, substring).
- Empty or whitespace-only `query` returns no results.

**Example:** `GET /api/pokemon/pokemons/search?query=pika&page=1&limit=10`

**Response:** `{ data: Pokémon[], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`.

### Get Pokémon by id

[`GET /api/pokemon/pokemons/:id`]({API_BASE_URL}/api#/Pokemon/PokemonController_findById)

Returns a single Pokémon by its numeric `id` (national Pokédex number). The `types.type` field is populated.

**Response:** Pokémon object, or `404` if not found.

### Update a Pokémon

[`PATCH /api/pokemon/pokemons/:id`]({API_BASE_URL}/api#/Pokemon/PokemonController_update)

Updates **types** and/or **stats** of a Pokémon. Only the fields sent in the body are updated; omitted fields are left unchanged.

> **Requires:** ADMIN or ROOT role.

#### Request body

All fields are optional; at least one of `types` or `stats` must be sent when calling this endpoint.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `types` | array | no | List of type slots; **replaces** the current `types` array. Each element: `slot` (1 or 2), `typeId` (numeric id from the types collection, 1–18). |
| `stats` | array | no | List of base stats; **replaces** the current `stats` array. Each element: `name` (string), `base_stat` (number ≥ 0). |

- If `types` is provided, it must contain at least one element. Each `typeId` is resolved to the corresponding type’s ObjectId; invalid type ids are ignored (no error, that slot is skipped).
- If `stats` is provided, it must contain at least one element.

#### Example

Update Bulbasaur (id 1) to have Grass (12) and Poison (4), and set base stats:

```json
{
  "types": [
    { "slot": 1, "typeId": 12 },
    { "slot": 2, "typeId": 4 }
  ],
  "stats": [
    { "name": "hp", "base_stat": 45 },
    { "name": "attack", "base_stat": 49 },
    { "name": "defense", "base_stat": 49 },
    { "name": "special-attack", "base_stat": 65 },
    { "name": "special-defense", "base_stat": 65 },
    { "name": "speed", "base_stat": 45 }
  ]
}
```

**Response:** the updated Pokémon document (with `types.type` populated).

**Error codes:** `400` invalid body · `401` unauthorized · `403` forbidden (not ADMIN/ROOT) · `404` Pokémon not found.

## Identifiers

Each Pokémon has **two identifiers**:

| Field | Description | Example |
| :--- | :--- | :--- |
| `_id` | MongoDB ObjectId (internal) | `683c...` |
| `id` | Numeric Pokédex number | `1` (Bulbasaur) |

All endpoints use the **numeric `id`** in the path (`:id`) and in responses. The update body uses `typeId` (numeric type id), not MongoDB ObjectIds.

## Access

Read endpoints (`GET`) require authentication ([JWT cookie](/docs/auth)) and an active user account. Any role (USER, ADMIN, ROOT) can read Pokémon data.

The update endpoint (`PATCH`) requires ADMIN or ROOT role.

## API Reference

For request/response schemas, see [Swagger - Pokemon]({API_BASE_URL}/api#/Pokemon).
