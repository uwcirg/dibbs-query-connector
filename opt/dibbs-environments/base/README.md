# Base Configuration

Shared Docker Compose service definitions for DIBBS environments.

This directory is for extension only — run Compose from [`../dev`](../dev/) or [`../prod`](../prod/) instead.

Bind mounts and build contexts use `../../../` paths so they resolve to the repository root when extended from `dev/` or `prod/`.

Keycloak realm import lives under `config/keycloak/import/` (derived from `keycloak/dev.json` with env placeholders for the `query-connector` client).
