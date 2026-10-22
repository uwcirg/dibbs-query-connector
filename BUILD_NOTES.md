DOCKER_BUILDKIT=0 -- build hangs without this flag.

DOCKER_BUILDKIT=0 docker compose up --build --detach && \
docker compose logs --follow