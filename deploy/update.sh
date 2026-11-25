#!/bin/sh
# Actualiza el frontend en el VPS desde GitHub y reinicia el contenedor.
#
#   ~/HurgoTrack/frontend/deploy/update.sh               # rama main
#   BRANCH=sergio ~/HurgoTrack/frontend/deploy/update.sh
#
# Necesita que el backend ya esté arriba (usa su red, su Redis y su Caddy).
set -eu
cd "$(dirname "$0")/.."
BRANCH="${BRANCH:-main}"

[ -f .env ] || { echo "Falta .env: cópialo de .env.example y edítalo" >&2; exit 1; }
docker network inspect hurgotrack_default >/dev/null 2>&1 || {
    echo "No existe la red hurgotrack_default: levanta primero el backend" >&2
    exit 1
}

git fetch --quiet origin "$BRANCH"
git checkout --quiet "$BRANCH"
git merge --ff-only --quiet "origin/$BRANCH"

printf 'frontend=%s (%s)\nfecha=%s\n' "$(git rev-parse --short HEAD)" "$BRANCH" \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > RELEASE
echo "== $(tr '\n' ' ' < RELEASE)"

docker compose build --pull
docker compose up -d --remove-orphans
docker compose ps
