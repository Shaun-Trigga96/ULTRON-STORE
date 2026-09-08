# ULTRON Store (Modular Architecture)

This repository follows strict **SDLC** and **DRY** principles, divided into a highly modular Frontend and a unified Modular Monolith Backend.

## Architecture

1. `frontend/` - Vite React App
   - `src/modules/` (Auth, Checkout, Products)
   - `src/components/` (Shared UI, Layout)
2. `backend/` - Node.js Express API
   - `src/modules/` (Auth, Orders, Catalog)
   - `src/core/` (Database, Middleware)

## Local Development (Docker)

To run the full stack locally (Database, Backend API, and Frontend UI):

```bash
docker compose -f docker-compose.local.yml up --build -d
```

- **Frontend UI:** http://localhost:3001
- **Backend API:** http://localhost:4000
