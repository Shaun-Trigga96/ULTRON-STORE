# 3. Local Development (Docker Compose)

ULTRON is containerized using Docker to ensure environment parity between local development and production.

## Prerequisites
- Docker Engine
- Docker Compose

## Starting the Stack

From the root directory, bring up the entire environment (Databases, API Gateway, Frontend, and 4 Microservices) with a single command:

```bash
docker-compose up -d --build
```

## Local Port Mappings
The local environment maps services so you can inspect them directly:

| Service | Local URL | Description |
|---|---|---|
| Nginx Gateway | `http://localhost:8080` | The primary entry point. UI loads on `/`, APIs on `/api/v1/*` |
| Frontend Store | `http://localhost:3001` | Direct React SPA |
| Inventory Service| `http://localhost:4001` | Direct Inventory API |
| Catalog Service | `http://localhost:4002` | Direct Catalog API |
| Order Service | `http://localhost:4003` | Direct Order API |
| Payment Service | `http://localhost:4004` | Direct Payment API |
| PostgreSQL | `localhost:5432` | Credentials: appuser / devsecret |
| Redis | `localhost:6379` | No password locally |

## Viewing Logs
To watch the interaction between microservices during a checkout:

```bash
# Watch all logs
docker-compose logs -f

# Watch specific service logs (e.g., to watch the Outbox Polling Worker)
docker-compose logs -f payment-service
```

## Shutting Down
To spin down the environment and remove volumes (wiping the local databases):

```bash
docker-compose down -v
```
