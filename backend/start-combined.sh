#!/usr/bin/env bash
# Combined start script for free-tier hosts (Render, Fly.io, Railway).
# Runs the Celery worker in the background and uvicorn in the foreground
# so a single container can serve HTTP traffic AND process async jobs.
# If celery exits, the EXIT trap kills uvicorn so the host restarts both.
set -euo pipefail

echo "[boot] starting Celery worker"
celery -A app.core.celery worker --loglevel=info &
CELERY_PID=$!

trap "echo '[boot] shutting down celery'; kill $CELERY_PID 2>/dev/null || true" EXIT

echo "[boot] starting Uvicorn on port ${PORT:-8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
