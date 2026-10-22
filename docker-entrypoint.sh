#!/bin/bash
# Runs as root so it can fix ownership of bind-mounted volumes (e.g. ./keys,
# which Docker creates as root when the host directory doesn't exist yet)
# before dropping privileges to run the app as the unprivileged nextjs user.
set -e

if [ -d /app/keys ]; then
  chown -R nextjs:nodejs /app/keys
fi

exec su-exec nextjs "$@"
