DOCKER_BUILDKIT=0 -- build hangs without this flag.
Remake keys directory -- it must exist, but it gives a NOPERM error during build if it isn't remade

sudo rm -r keys && \
mkdir keys && \
sudo chown -R 1001:1001 ./keys && \
DOCKER_BUILDKIT=0 docker compose up --build --detach && \
docker compose logs --follow