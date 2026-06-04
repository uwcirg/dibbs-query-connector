# DIBBS Query Connector Environments

Layered Docker Compose configuration for running the full DIBBS stack locally or in production-like deployments.

## Services

- **query-connector** — Next.js application
- **keycloak** — OIDC identity provider
- **aidbox** / **aidbox_db** — FHIR server (development)
- **db** — PostgreSQL for Query Connector data
- **flyway** — database migrations
- **aidbox-seeder** — Aidbox test data and FHIR server registration

## Layout

| Directory | Purpose |
|-----------|---------|
| [`base/`](./base/) | Shared service definitions (not run directly) |
| [`dev/`](./dev/) | Development deploy |
| [`prod/`](./prod/) | Production-like deploy (published images) |
| [`extras/`](./extras/) | Traefik reverse proxy (`external_web` network) |

## Prerequisites

1. [Docker](https://docs.docker.com/get-docker/) with Compose v2
2. DNS or `/etc/hosts` entries for `*.localtest.me` (resolves to `127.0.0.1`)
3. API keys: `ERSD_API_KEY`, `UMLS_API_KEY`, `AIDBOX_LICENSE` (see [development docs](../../src/docs/development.mdx))

## Quick start

1. Start Traefik (creates the `external_web` network):

   ```bash
   cd extras && docker compose up --detach
   ```

2. Configure and deploy (development example):

   ```bash
   cd ../dev
   for file in *.default; do cp "$file" "${file%%.default}"; done
   cp default.env .env
   chmod 777 ../keys
   # Edit .env, query-connector.env, aidbox.env — set secrets and API keys
   docker compose pull && docker compose up --detach
   ```

3. Open the app at `https://localtest.me` (or your `BASE_DOMAIN`).

See [`dev/README.md`](./dev/README.md) or [`prod/README.md`](./prod/README.md) for details.

## Alternative local workflow

You can still use `npm run dev` with the root [`docker-compose-dev.yaml`](../../docker-compose-dev.yaml) (direct host ports, no Traefik). See [development.mdx](../../src/docs/development.mdx).
