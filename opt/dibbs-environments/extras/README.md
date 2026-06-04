# Traefik Ingress

Creates the `external_web` Docker network used by [`dev`](../dev/) and [`prod`](../prod/) stacks.

## Start

```bash
docker compose up --detach
```

Ports:

- **80** / **443** — HTTP(S) entrypoints (redirects HTTP to HTTPS)
- **8080** — Traefik dashboard (insecure API)

Start this before bringing up `dev/` or `prod/`.
