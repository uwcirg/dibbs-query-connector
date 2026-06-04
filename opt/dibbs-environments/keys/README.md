# JWKS signing keys

Bind-mounted at `/app/keys` in the Query Connector container.

Tracked files use mode `777` so the `nextjs` container user can write generated keys here. After clone, ensure the directory itself is world-writable:

```bash
chmod 777 opt/dibbs-environments/keys
```

Generated artifacts (`*.pem`, `jwks.json`) are not committed.
