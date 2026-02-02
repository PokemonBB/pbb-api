# Two Types of Documentation

The application has two complementary documentation systems. Each serves a different purpose.

## Conceptual Documentation (This One)

**Purpose:** Explain concepts, systems, flows and how things work so a developer can understand the application.

**Characteristics:**
- Focus on *what* and *why*, not *how to call*
- Describes flows, roles, permissions, data structures
- Cross-references between documents
- Links to Swagger for technical details when needed
- Links to Admin Panel, Main Game or API when relevant

**Location:** `/docs` folder in the [pbb-api](https://github.com/PokemonBB/pbb-api/tree/main/docs) repository root.

**Access:** Served via:
- Admin panel: [Admin Panel]({ADMIN_PANEL_BASE_URL}/docs)  
- API endpoint: [Docs API]({API_BASE_URL}/api#/Docs/DocsController_getDocsRoot)  

Only ROOT and ADMIN users can access it.

**Format:** Markdown files organized in folders (users, auth, invitations, etc.).

**Example topics:** User roles, registration flow, invitation vs activation codes, visibility rules, TTL.

## Swagger (Technical API Documentation)

**Purpose:** Technical reference for API consumers. Request format, response format, required fields, examples.

**Characteristics:**
- Focus on *how to call* each endpoint
- HTTP method, path, headers, body schema
- Possible responses (200, 400, 401, 403, 404)
- Request/response examples
- Field validation rules

**Location:** Each endpoint has its own documentation in his own controller.

**Access:** Public. Available at `{API_BASE_URL}/docs` (or `/swagger`, `/api`).

**Format:** Interactive OpenAPI/Swagger UI. Can be exported as JSON.

**Example topics:** POST /auth/register body schema, GET /users query params, error response format.

## When to Use Each

| Need | Use |
|------|-----|
| Understand how registration works | Conceptual (Registration, Activation) |
| Know what fields to send in register request | Swagger |
| Understand role permissions | Conceptual (Roles) |
| Know the exact endpoint to update a user | Swagger |
| Understand invitation vs activation codes | Conceptual (Registration) |
| See response schema for GET /users | Swagger |

## References Between Them

Conceptual docs link to Swagger when a specific endpoint is relevant:

- `[Generate Invitation Code]({API_BASE_URL}/api#/Invitations/InvitationsController_createInvitation)`
- `[Update User]({API_BASE_URL}/api#/Admin/AdminController_update)`

Swagger does not link back to conceptual docs. The conceptual docs are the entry point for understanding; Swagger is the reference for implementation.
