#!/usr/bin/env bash
# CloudForge first-run bootstrap
# - Copies .env.example -> .env if missing
# - Builds the shared resource catalog (backend reads the compiled JSON)
# - Brings up the full docker-compose stack in the background
# - Waits for the backend health endpoint
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "    Edit .env to fill in INFRACOST_API_KEY / ANTHROPIC_API_KEY if you have them."
fi

if command -v docker >/dev/null 2>&1; then
  :
else
  echo "ERROR: docker is not installed or not on PATH." >&2
  echo "Install Docker Desktop (Windows/macOS) or docker-ce (Linux) and re-run." >&2
  exit 1
fi

if [ -d shared/resource-catalog ] && command -v npm >/dev/null 2>&1; then
  if [ ! -d shared/resource-catalog/dist ]; then
    echo "==> Building shared resource catalog"
    (cd shared/resource-catalog && npm install --no-audit --no-fund && npm run build)
  fi
fi

echo "==> Starting CloudForge stack (docker compose up -d)"
docker compose up -d

echo "==> Waiting for backend to become healthy"
for i in $(seq 1 60); do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    echo
    echo "Backend is up."
    echo
    echo "  Frontend:      http://localhost:3000"
    echo "  Backend docs:  http://localhost:8000/docs"
    echo "  Default login: admin / admin123   <-- CHANGE THIS if you expose beyond localhost"
    echo
    exit 0
  fi
  sleep 2
  printf '.'
done

echo
echo "Backend did not become healthy in 120s. Check logs with:"
echo "  docker compose logs -f backend"
exit 1
