# Development Configuration

Runs the full DIBBS stack behind Traefik with hostnames under `BASE_DOMAIN` (default `localtest.me`).

## Prerequisites

1. Start Traefik (once per Docker host):

   ```bash
   cd ../extras && docker compose up --detach
   ```

2. Ensure `*.localtest.me` resolves to `127.0.0.1` (most systems resolve `localtest.me` subdomains automatically).

3. Obtain `ERSD_API_KEY`, `UMLS_API_KEY`, and `AIDBOX_LICENSE` — see [development.mdx](../../../src/docs/development.mdx).

## Setup

Copy default env files:

```bash
for file in *.default; do
  cp "$file" "${file%%.default}"
done
cp default.env .env
chmod 777 ../keys
```

Edit `.env`, `query-connector.env`, and `aidbox.env` (set API keys and `AIDBOX_LICENSE`).

`AUTH_CLIENT_SECRET` in `query-connector.env` must match the `query-connector` client secret in [`keycloak/localhost.json`](../../../keycloak/localhost.json) (default from `.env.sample`).

## Deploy

```bash
docker compose pull && docker compose up --detach
```

If `db` fails with a PostgreSQL 18+ data-directory error after a previous attempt, remove the stale volume and retry (replace the project name if yours differs):

```bash
docker compose down
docker volume rm dibbs-env-dev-ivanc_db-data
docker compose up --detach
```

## URLs

| Service | URL |
|---------|-----|
| Query Connector | `https://localtest.me` |
| Keycloak | `https://keycloak.localtest.me` |
| Aidbox | `https://aidbox.localtest.me` |
| Traefik dashboard | `http://localhost:8080` |

Keycloak admin: `admin` / `admin` (defaults in base compose).

App login (dev realm): user `qc-admin`, password `QcDev2024!`

JWKS signing keys are written to [`../keys`](../keys/) (bind-mounted at `/app/keys`). Run `chmod 777 ../keys` during setup so the container user can write key files.

## Optional: hot-reload in container

Uncomment in `.env`:

```env
COMPOSE_FILE=docker-compose.yaml:docker-compose.dev.query-connector.yaml
QUERY_CONNECTOR_CHECKOUT_DIR=../../
```

This bind-mounts the repo and runs `npm run dev` inside the container via `Dockerfile.dev`.
