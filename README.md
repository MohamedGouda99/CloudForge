# CloudForge Developer Guide

CloudForge is a diagram-first Terraform authoring platform consisting of a React/Vite frontend, a FastAPI backend, and supporting data services packaged for local or containerised execution. This guide provides a single, technical reference for contributors.

---

## Contents
1. [System Overview](#system-overview)
2. [Repository Layout](#repository-layout)
3. [Local Environment Setup](#local-environment-setup)
4. [Configuration](#configuration)
5. [Execution Modes](#execution-modes)
6. [Service Operations](#service-operations)
7. [Health & Diagnostics](#health--diagnostics)
8. [Packaging & Deployment](#packaging--deployment)
9. [Data Management](#data-management)
10. [Troubleshooting Matrix](#troubleshooting-matrix)
11. [Security Checklist](#security-checklist)
12. [Reference Links](#reference-links)

---

## System Overview

| Component | Technology | Purpose | Default Port | Notes |
|-----------|------------|---------|--------------|-------|
| Frontend | React 18 + Vite | Diagram editor, Terraform previews | 3000 | Dev server or Nginx (prod) |
| Backend API | FastAPI + Uvicorn | Auth, Terraform generation, API | 8000 | Celery worker shares code base |
| Celery Worker | Celery + Redis broker | Async drift scans & tasks | n/a | Known `ModuleNotFoundError` during dev |
| PostgreSQL | PostgreSQL 15 | Persistent metadata store | 5433 (host) | Mapped to 5432 in-container |
| Redis | Redis 7 | Cache, background tasks queue | 6379 | In-memory only |
| Terraform | Hashicorp Terraform 1.6.x | IaC generation toolchain | n/a | Bundled inside backend images |

---

## Repository Layout

```
brainboard/
|-- backend/                  # FastAPI application
|   |-- app/api               # REST endpoints
|   |-- app/core              # Settings, celery, logging
|   |-- app/services          # Business/domain logic
|   |-- Dockerfile            # Dev image (reload)
|   `-- Dockerfile.prod       # Hardened production image
|-- frontend/                 # React + Vite SPA
|   |-- src/                  # UI, hooks, utilities
|   |-- Dockerfile            # Dev server
|   `-- Dockerfile.prod       # Static build + Nginx
|-- scripts/                  # Automation helpers (PowerShell)
|-- docker-compose.yaml       # Local stack (profiles supported)
|-- Dockerfile                # Monolithic runtime image
|-- .env.example              # Configuration template
`-- Cloud_Services/           # Provider icon packs & assets
```

---

## Local Environment Setup

| Tool | Version | Install Notes |
|------|---------|---------------|
| Docker Desktop | Latest (WSL 2 backend) | Required for containers & compose |
| WSL 2 + Ubuntu | Latest | Scripts assume repository at `/mnt/c/...` |
| Node.js | v18 or v20 LTS | Includes npm; powers `npm run dev` |
| Python (optional) | 3.11 | Needed only for direct backend scripting without Docker |

Verify installations:

```powershell
docker --version
docker compose version
wsl --status
node --version
npm --version
```

---

## Configuration

1. Bootstrap environment variables:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Update secrets before first run.

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `POSTGRES_PASSWORD` | Yes | cloudforge_dev_password | Database password (dev only) |
| `REDIS_PASSWORD` | Yes | redis_password_change_me | Redis authentication (optional for dev) |
| `SECRET_KEY` | Yes | generate | FastAPI signing key (`openssl rand -hex 32`) |
| `JWT_SECRET_KEY` | Yes | generate | JWT signing key (`openssl rand -hex 32`) |
| `CORS_ORIGINS` | Yes | http://localhost:3000 | CSV of trusted origins |
| `VITE_API_URL` | Yes | http://localhost:8000 | Frontend to API base URL |

> `.env` is consumed by Docker Compose and scripts. Never commit a filled `.env`.

---

## Execution Modes

| Mode | Entry Command | Scope | Notes |
|------|---------------|-------|-------|
| Windows helper script | `powershell -ExecutionPolicy Bypass -File scripts/run_cloudforge_background.ps1` | Backend (Docker) + local Vite | Skips frontend start if port 3000 busy |
| Docker Compose (backend only) | `wsl -d Ubuntu sh -lc "cd /mnt/c/Users/goda/Downloads/brainboard && docker compose up -d"` | Postgres, Redis, FastAPI, Celery | Default profile; frontend untouched |
| Docker Compose (full stack) | `... docker compose --profile full up -d` | Adds frontend container | Frontend stops only with `--profile full down` |
| Manual | `docker compose up -d postgres redis backend` (WSL) + `npm run dev` (Windows) | Custom mix | Useful for hot reload plus local Node runtime |

---

## Service Operations

| Action | Backend Stack | Frontend Dev Server | Notes |
|--------|---------------|---------------------|-------|
| Start | `docker compose up -d` | `npm run dev -- --host 0.0.0.0` | Run from repository root (`WSL` vs Windows terminals) |
| Stop | `docker compose down` | `Get-Process node \| Stop-Process` | Stopping backend does not kill a Windows Vite process |
| Full stop | `docker compose --profile full down` | n/a | Removes frontend container and backend services |
| Logs | `docker compose logs -f` | `npm run dev` terminal output | Use `docker logs cloudforge-backend` for API only |

---

## Health & Diagnostics

| Check | Command | Expected |
|-------|---------|----------|
| Backend health | `Invoke-WebRequest http://localhost:8000/health` | `{"status":"healthy"}` |
| API docs | Browser -> `http://localhost:8000/docs` | Swagger UI |
| Frontend reachability | `Invoke-WebRequest http://localhost:3000` | HTTP 200 (HTML bundle) |
| Container status | `wsl -d Ubuntu docker ps` | `cloudforge-*` containers listed |
| Port ownership | `Get-NetTCPConnection -LocalPort <port>` | Identify conflicting processes |

---

## Packaging & Deployment

### Multi-Service Images

| Image | Dockerfile | Highlights |
|-------|------------|------------|
| Backend (dev) | `backend/Dockerfile` | Uvicorn autoreload, bind mount `/app` |
| Backend (prod) | `backend/Dockerfile.prod` | Installs Terraform, non-root user, health check |
| Frontend (dev) | `frontend/Dockerfile` | Vite dev server |
| Frontend (prod) | `frontend/Dockerfile.prod` | Two-stage build -> Nginx, security headers |

Build examples:

```bash
docker build -t cloudforge-backend:prod -f backend/Dockerfile.prod backend
docker build -t cloudforge-frontend:prod -f frontend/Dockerfile.prod frontend --build-arg VITE_API_URL=https://api.example.com
```

### Monolithic Runtime

`Dockerfile` at repo root bundles backend, frontend build, PostgreSQL, Redis, and Nginx.

```bash
docker build -t cloudforge:latest .
docker run -d \
  --name cloudforge \
  -p 80:80 \
  -v cloudforge-data:/var/lib/postgresql/15/main \
  -v cloudforge-terraform:/app/generated_terraform \
  --restart unless-stopped \
  cloudforge:latest
```

Inspect:

```bash
docker logs -f cloudforge
docker exec -it cloudforge bash
```

---

## Data Management

| Task | Command | Notes |
|------|---------|-------|
| PostgreSQL health | `docker exec cloudforge-postgres pg_isready -U cloudforge` | Works with compose service name |
| psql shell | `docker exec -it cloudforge-postgres psql -U cloudforge -d cloudforge` | Use `\q` to exit |
| Dump database | `docker compose exec postgres pg_dump -U cloudforge cloudforge > backup.sql` | Run from repo root |
| Backup volume | `docker run --rm -v cloudforge-stack_postgres_data:/data -v "$PWD":/backup ubuntu tar czf /backup/postgres_volume.tar.gz /data` | Captures raw volume |
| Apply migrations | `docker exec cloudforge-backend alembic upgrade head` | Ensure backend container running |

---

## Troubleshooting Matrix

| Symptom | Diagnostic | Resolution |
|---------|-----------|------------|
| Port already in use | `Get-NetTCPConnection -LocalPort 3000` | Stop owning process (`Stop-Process -Id <pid>`) |
| Backend health fails | `docker compose logs backend` | Confirm Docker Desktop + WSL running; restart stack |
| Frontend stays up after compose down | `Get-Process node` | Kill lingering Node process or run `docker compose --profile full down` |
| Celery container exits | `docker compose ps -a` | Known missing module; safe to ignore for core workflows |
| Compose command slow | Use `--progress plain` | Large context (icons, node_modules); consider `.dockerignore` tuning |
| Terraform binary missing | `docker exec cloudforge-backend terraform version` | Rebuild backend image (prod Dockerfile installs Terraform) |

---

## Security Checklist

| Area | Action |
|------|--------|
| Secrets | Generate unique values for `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `SECRET_KEY`, `JWT_SECRET_KEY` |
| HTTPS | Terminate TLS (Nginx, Traefik, or load balancer) before exposing frontend/backend |
| CORS | Tighten `CORS_ORIGINS` to trusted domains in production |
| Network | Restrict database and Redis ports to internal networks; expose API via reverse proxy |
| Accounts | Rotate credentials regularly and enforce least privilege |
| Monitoring | Enable alerts on backend logs and container health checks |

---

## Reference Links
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Docker: https://docs.docker.com/
- Terraform: https://developer.hashicorp.com/terraform

For project issues:
- Review compose logs: `docker compose logs -f`
- Inspect backend logs: `docker logs cloudforge-backend`
- Capture bugs in the project issue tracker

---

**Last updated:** 5 November 2025  
**Maintainer:** CloudForge Development Team
...