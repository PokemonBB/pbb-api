# Healthcheck

The healthcheck endpoints allow monitoring the API and database status. They are public (no authentication required).  

Used by [Gatus (pbb-status)]({STATUS_BASE_URL})

## Endpoints

### API Status

`GET /api/health/api`

Returns whether the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Status

`GET /api/health/db`

Returns whether the MongoDB connection is healthy.

**Response (healthy):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (unhealthy):**
```json
{
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Returns 503 when the database is unavailable.

## Use Cases

- **Load balancer health checks:** Configure the load balancer to call `/api/health/api` or `/api/health/db` to determine if the instance should receive traffic
- **Monitoring:** External monitoring tools can poll these endpoints to detect outages
- **Deployment verification:** After deployment, verify the API and database are reachable

## Public Access

No authentication required. These endpoints do not expose sensitive data.

For request/response schemas, see [Swagger - Health]({API_BASE_URL}/api#/Health).
