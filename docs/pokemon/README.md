# Pokémon

Game data used by the battle system and the client UI. All endpoints are under the `/api/pokemon` prefix and require an authenticated, active user (see [Auth](/docs/auth) and [Request Structure](/docs/common/REQUEST_STRUCTURE)).

## Resources

| Resource | Collection | Endpoint prefix | Docs |
| :--- | :--- | :--- | :--- |
| Types | `types` | `/api/pokemon/types` | [TYPES](/docs/pokemon/TYPES) |
| Pokémons | `pokemons` | `/api/pokemon/pokemons` | [POKEMONS](/docs/pokemon/POKEMONS) |

## Seed Data

Type and Pokémon data are loaded automatically from the [seed system](/docs/common/SEED). Seed files live in the **common** seed directory (`seed-common`), so they are shared across all environments (local, pro). The types collection is seeded before pokemons so that type references in Pokémon documents can be resolved to ObjectIds. See [POKEMONS - Seed Data](/docs/pokemon/POKEMONS#seed-data) for how type references are resolved.

## API Reference

For request/response schemas, see [Swagger - Pokemon]({API_BASE_URL}/api#/Pokemon).
