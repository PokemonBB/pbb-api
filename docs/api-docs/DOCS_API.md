# Docs API

The Docs API is an endpoint that serves the conceptual documentation (this documentation) to ROOT and ADMIN users. It allows building a docs viewer in the frontend or consuming the content programmatically.

## Access

- **Who:** ROOT and ADMIN only
- **Auth:** JWT cookie (same as other protected endpoints)
- **Where:**
    - API endpoint: [Docs API]({API_BASE_URL}/api#/Docs/DocsController_getDocsRoot)  

Admin panel consumes the Docs API to build the docs viewer: [Admin Panel]({ADMIN_PANEL_BASE_URL}/docs)  

## What It Serves

The content of the `/docs` folder in the repository root. Markdown files organized in a directory structure.

## Response Format

**Directory:** Returns README.md content plus list of children (subdirectories and .md files).

**File:** Returns the markdown content.

Each response includes:
- `type`: "directory" or "file"
- `name`: Display name (capitalized)
- `path`: Path for navigation (e.g. `/users`, `/users/ROLES`)
- `content`: Markdown content (README for directories, file content for files)
- `children`: Only for directories. Array of `{ name, type, path }`

## Search

It is possible to search across the documentation. The search looks in folder names, file names and file content. When a match is found, it returns the document path, a display name, the line number where the match occurs and a snippet of that line. Multiple results can appear for the same document if the query matches in several lines.

For the API specification, see [Swagger - Search Docs]({API_BASE_URL}/api#/Docs/DocsController_searchDocs).

## Path Convention

- Root: `/api/docs` → path `/`
- Subdirectory: `/api/docs/users` → path `/users`
- File: `/api/docs/users/ROLES` → path `/users/ROLES` (no .md in path)

## Use Case

- Admin panel can embed the docs viewer
- Developers can browse conceptual documentation without leaving the app
- The same content is versioned with the code in the `/docs` folder of [pbb-api](https://github.com/PokemonBB/pbb-api/tree/main/docs) repository

For request/response schemas and examples, see [Swagger - Docs]({API_BASE_URL}/api#/Docs).
