# Production-like Configuration

Deploys published images behind Traefik. Intended for staging or production hosts with real DNS for `BASE_DOMAIN`.

## Prerequisites

1. Start Traefik:

   ```bash
   cd ../extras && docker compose up --detach
   ```

2. DNS records for `query-connector.${BASE_DOMAIN}`, `keycloak.${BASE_DOMAIN}`, and `aidbox.${BASE_DOMAIN}` pointing at the host.

3. TLS: Traefik obtains certificates via Let's Encrypt (HTTP challenge on port 80).

## Setup

```bash
for file in *.default; do
  cp "$file" "${file%%.default}"
done
cp default.env .env
chmod 777 ../keys
```

Set `BASE_DOMAIN`, `COMPOSE_PROJECT_NAME`, and secrets in `query-connector.env`, `keycloak.env`, and `aidbox.env`.

`AUTH_CLIENT_SECRET` in `query-connector.env` must match `KEYCLOAK_QUERY_CONNECTOR_CLIENT_SECRET` in `keycloak.env`. Query Connector client URLs are derived from `BASE_DOMAIN` at realm import (see [`base/config/keycloak/import/master-realm.json`](../base/config/keycloak/import/master-realm.json)).

## Deploy

```bash
docker compose pull && docker compose up --detach
```

## URLs

| Service | URL |
|---------|-----|
| Query Connector | `https://query-connector.${BASE_DOMAIN}` |
| Keycloak | `https://keycloak.${BASE_DOMAIN}` |
| Aidbox | `https://aidbox.${BASE_DOMAIN}` |
