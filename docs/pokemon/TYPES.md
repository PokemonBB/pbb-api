# Types

Pokémon types define the elemental categories that determine strengths, weaknesses and immunities in the battle system. Each Pokémon and each move belongs to one or more types. The type chart governs damage multipliers when a move hits a target.

## Data Model

Each type document in the `types` collection contains:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | number | Unique numeric identifier (1–18 for standard types) |
| `name` | string | Internal lowercase name (`normal`, `fire`, `water`, …) |
| `color` | string | Hex color code associated with the type (`#EE8130` for fire) |
| `names` | object | Translated display names keyed by language code (see [Translations](#translations)) |
| `damage_relations` | object | Type effectiveness chart (see [Damage Relations](#damage-relations)) |
| `move_damage_class` | object \| null | Physical or special classification (`{ name: "physical" }`, `{ name: "special" }`, or `null`) |

### Translations

The `names` field is a key-value map where each key is a language code and the value is the localized display name:

```json
{
  "es": "Fuego",
  "en": "Fire",
  "jp": "ほのお"
}
```

Supported languages: `es` (Spanish), `en` (English). Additional languages (e.g. `jp`) can be added freely.

### Damage Relations

The `damage_relations` object defines how this type interacts offensively and defensively with other types:

| Field | Multiplier | Meaning |
| :--- | :--- | :--- |
| `double_damage_to` | ×2 | This type deals double damage to the listed types |
| `half_damage_to` | ×0.5 | This type deals half damage to the listed types |
| `no_damage_to` | ×0 | This type has no effect on the listed types |
| `double_damage_from` | ×2 | This type receives double damage from the listed types |
| `half_damage_from` | ×0.5 | This type receives half damage from the listed types |
| `no_damage_from` | ×0 | This type is immune to the listed types |

Each entry in these arrays is a type reference with `id` and `name`:

```json
{ "id": 11, "name": "water" }
```

### Move Damage Class

Indicates whether moves of this type are typically physical or special:

- `{ "name": "physical" }` — contact-based moves (e.g. normal, fighting, rock)
- `{ "name": "special" }` — ranged/energy-based moves (e.g. fire, water, psychic)
- `null` — no default classification (e.g. fairy, stellar)

## Available Types

| ID | Name | Color | Class |
| :--- | :--- | :--- | :--- |
| 1 | Normal | `#A8A77A` | physical |
| 2 | Fighting | `#C22E28` | physical |
| 3 | Flying | `#A98FF3` | physical |
| 4 | Poison | `#A33EA1` | physical |
| 5 | Ground | `#E2BF65` | physical |
| 6 | Rock | `#B6A136` | physical |
| 7 | Bug | `#A6B91A` | physical |
| 8 | Ghost | `#735797` | physical |
| 9 | Steel | `#B7B7CE` | physical |
| 10 | Fire | `#EE8130` | special |
| 11 | Water | `#6390F0` | special |
| 12 | Grass | `#7AC74C` | special |
| 13 | Electric | `#F7D02C` | special |
| 14 | Psychic | `#F95587` | special |
| 15 | Ice | `#96D9D6` | special |
| 16 | Dragon | `#6F35FC` | special |
| 17 | Dark | `#705746` | special |
| 18 | Fairy | `#D685AD` | — |

## Endpoints

### Get all types
[`GET /api/pokemon/types`]({API_BASE_URL}/api#/Pokemon/PokemonTypesController_findAll)

Returns the full list of types sorted by `id`. No pagination; the dataset is small and fixed.

**Response:** array of type objects.

### Get type by id

[`GET /api/pokemon/types/:id`]({API_BASE_URL}/api#/Pokemon/PokemonTypesController_findById)

Returns a single type by its numeric `id`.

**Response:** type object, or `404` if not found.

### Update damage relation

[`PATCH /api/pokemon/types/damage-relation`]({API_BASE_URL}/api#/Pokemon/PokemonTypesController_updateDamageRelation)

Changes the damage multiplier from an **attacker** type to a **defender** type. Both types are updated atomically: the attacker's `*_to` arrays and the defender's `*_from` arrays are kept in sync.

> **Requires:** ADMIN or ROOT role.

#### Request body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `attackerId` | number | yes | Numeric `id` of the attacking type (1–18) |
| `defenderId` | number | yes | Numeric `id` of the defending type (1–18) |
| `multiplier` | string | yes | `x2` · `x0.5` · `x0` · `x1` |

#### Multipliers

| Value | Meaning | Attacker array | Defender array |
| :--- | :--- | :--- | :--- |
| `x2` | Double damage | `double_damage_to` | `double_damage_from` |
| `x0.5` | Half damage | `half_damage_to` | `half_damage_from` |
| `x0` | Immune (no effect) | `no_damage_to` | `no_damage_from` |
| `x1` | Neutral (normal damage) | — removed from all — | — removed from all — |

#### How it works

1. The previous relation between the two types is **cleared** — the defender is removed from every `*_to` array of the attacker, and the attacker is removed from every `*_from` array of the defender.
2. If the multiplier is **not** `x1`, the defender is **added** to the corresponding `*_to` array of the attacker and the attacker is added to the corresponding `*_from` array of the defender.
3. If `attackerId === defenderId` (self-reference, e.g. Dragon vs Dragon), all six arrays of the same document are cleaned and updated.

#### Example

**Before:** Steel (9) deals ×2 to Fairy (18).

```
Steel.damage_relations.double_damage_to  → [..., { id: 18, name: "fairy" }]
Fairy.damage_relations.double_damage_from → [..., { id: 9,  name: "steel" }]
```

**Request:** `{ "attackerId": 9, "defenderId": 18, "multiplier": "x0.5" }`

**After:**

```
Steel.damage_relations.double_damage_to  → [...]          (fairy removed)
Steel.damage_relations.half_damage_to    → [..., { id: 18, name: "fairy" }]

Fairy.damage_relations.double_damage_from → [...]          (steel removed)
Fairy.damage_relations.half_damage_from   → [..., { id: 9,  name: "steel" }]
```

#### Response

```json
{
  "message": "Damage relation updated successfully",
  "attacker": { "...updated attacker type object..." },
  "defender": { "...updated defender type object..." }
}
```

**Error codes:** `400` invalid body · `401` unauthorized · `403` forbidden · `404` type not found.

## Identifiers

Each type has **two identifiers**:

| Field | Description | Example |
| :--- | :--- | :--- |
| `_id` | MongoDB ObjectId (internal) | `683c...` |
| `id` | Numeric type identifier (1–18) | `9` |

All endpoints use the **numeric `id`** (1–18) to reference types, not the MongoDB `_id`. This applies to route parameters (`:id`) and to the request body (`attackerId`, `defenderId`). Inside `damage_relations`, type references also use the numeric `id`.

## Access

Read endpoints (`GET`) require authentication ([JWT cookie](/docs/auth)) and an active user account. Any role (USER, ADMIN, ROOT) can read type data.

Write endpoints (`PATCH`) additionally require ADMIN or ROOT role.

## API Reference

For request/response schemas, see [Swagger - Pokemon]({API_BASE_URL}/api#/Pokemon).
