# Pagination

All list endpoints use the same pagination convention. This ensures a consistent experience across users, friends, notifications and audit logs.

A shared helper in `src/common/helpers/pagination.helper.ts` in [pbb-api](https://github.com/PokemonBB/pbb-api/tree/main/src/common/helpers/pagination.helper.ts) is used by every paginated request: it computes `page`, `limit`, `skip` from the query and builds the response with `data` and `pagination` (total, totalPages, hasNext, hasPrev).  

## Query Parameters

- **page**: Page number. Default: 1.
- **limit**: Items per page. Default: 10. Max: 100.

Example: `GET /api/users?page=2&limit=20`

## Response Format

Paginated responses include a `data` array and a `pagination` object:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

- **total**: Total number of items across all pages
- **totalPages**: Number of pages
- **hasNext**: true if there is a next page
- **hasPrev**: true if there is a previous page

## Endpoints That Use Pagination

- GET /api/users
- GET /api/users/search
- GET /api/friends
- GET /api/friends/requests
- GET /api/friends/sent
- GET /api/notifications
- GET /api/audit

For request/response schemas, see [Swagger]({API_BASE_URL}/api#/Users).