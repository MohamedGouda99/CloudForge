# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CloudForge is a multi-cloud Infrastructure as Code (IaC) platform that enables visual design of cloud infrastructure and generates Terraform configurations. The platform supports AWS, Azure, and GCP with security scanning, cost estimation, and AI assistance.

**Tech Stack:**
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0, PostgreSQL 15, Celery, Redis
- **Frontend:** React 18, TypeScript 5.6, Zustand, React Flow, TailwindCSS, Vite
- **Infrastructure:** Docker Compose, LocalStack Pro
- **Security:** TFSec, Terrascan, Infracost

## Development Commands

### Docker Compose (Primary Method)

```bash
# Start all services in WSL (from Windows directory)
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d"

# View logs
wsl.exe -d Ubuntu docker logs cloudforge-backend -f
wsl.exe -d Ubuntu docker logs cloudforge-frontend -f

# Restart services
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose restart backend frontend"

# Stop all services
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down"
```

### Backend Development

```bash
cd backend

# Run development server (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v --cov=app

# Code formatting and linting
black app/
flake8 app/
mypy app/
```

### Frontend Development

```bash
cd frontend

npm install
npm run dev           # Development server with HMR
npm run build         # Production build (runs tsc first)
npm run lint          # ESLint
npx tsc --noEmit      # Type check only
```

### TypeScript Terraform Generator

The backend contains a separate TypeScript module at `backend/src/terraform/`:

```bash
cd backend/src/terraform

npm install
npm run test          # Run vitest tests
npm run test:watch    # Watch mode
npm run build         # Compile TypeScript
npm run lint          # ESLint
```

### Testing API Endpoints

```bash
# Login and get JWT token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Create a project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-project","cloud_provider":"aws"}'

# Generate Terraform for project (replace {id} with project ID)
curl -X POST http://localhost:8000/api/terraform/generate/{id} \
  -H "Authorization: Bearer $TOKEN"
```

## Architecture

### Backend Structure

```
backend/app/
├── api/endpoints/          # FastAPI route handlers
│   ├── auth.py            # JWT authentication (/api/auth/*)
│   ├── projects.py        # Project CRUD (/api/projects/*)
│   ├── terraform.py       # Terraform generation (/api/terraform/*)
│   ├── security.py        # TFSec/Terrascan scans
│   ├── dashboard.py       # Analytics/stats
│   └── assistant.py       # AI assistant (Claude)
├── core/
│   ├── config.py          # Settings (loaded from .env)
│   ├── database.py        # SQLAlchemy setup
│   ├── security.py        # JWT utilities, password hashing
│   └── celery.py          # Async task configuration
├── models/                # SQLAlchemy ORM models
├── schemas/               # Pydantic request/response validation
├── services/
│   ├── terraform/
│   │   ├── factory.py     # TerraformGeneratorFactory (multi-cloud)
│   │   ├── generators/    # Cloud-specific generators (aws.py, azure.py, gcp.py)
│   │   └── generator_v2.py
│   └── claude_assistant.py
└── main.py               # Application entry point
```

### Frontend Structure

```
frontend/src/
├── features/             # Feature modules (pages)
│   ├── dashboard/       # Main dashboard view
│   ├── designer/        # Visual infrastructure designer (React Flow)
│   └── analytics/       # Cost analytics
├── components/          # Reusable UI components
│   ├── DesignerToolbar.tsx   # Drag-drop resource palette
│   └── InspectorPanel.tsx    # Resource property editor
├── lib/
│   ├── api/            # Axios API client with interceptors
│   ├── store/          # Zustand state management (authStore, themeStore)
│   └── resources/      # Cloud resource definitions
└── App.tsx
```

### TypeScript Terraform Generator

Located at `backend/src/terraform/`, this is a separate TypeScript module called via subprocess from Python:

- `generate.ts` - Entry point for generation
- `catalog/` - Resource templates
- `registry.ts` - Resource type registry
- `cli.ts` - CLI interface

### Multi-Cloud Terraform Generation Flow

1. **User Action:** Designer canvas nodes/edges saved to `project.diagram_data` (JSON)
2. **API Call:** `POST /api/terraform/generate/{project_id}`
3. **Factory Pattern:** `TerraformGeneratorFactory` selects generator based on `project.cloud_provider`
4. **Generator:** Parses diagram_data, builds dependency graph, generates HCL
5. **Post-Processing:** Security scan (TFSec), policy check (Terrascan), cost estimate (Infracost)

### Database Schema

**Key relationships:**
- `users` 1:N `projects` (via `owner_id`)
- `projects` 1:N `resources` (via `project_id`)

**Important columns:**
- `projects.diagram_data`: JSON blob storing React Flow nodes/edges
- `projects.tf_config`: Generated Terraform HCL code (TEXT)
- `projects.cloud_provider`: Enum ("aws", "azure", "gcp")

## Critical Implementation Details

### Authentication Flow

1. **Login:** `POST /api/auth/login` (form-urlencoded: username + password)
2. **Response:** `{"access_token": "...", "token_type": "bearer"}`
3. **JWT Storage:** Frontend stores token in Zustand (`authStore`)
4. **API Requests:** Axios interceptor adds `Authorization: Bearer {token}` header
5. **Backend Validation:** `Depends(get_current_user)` dependency validates JWT
6. **Default Admin:** Created on startup (username: `admin`, password: `admin123`)

### Environment Variables

**Backend (docker-compose.yaml):**
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `INFRACOST_API_KEY`: Required for cost estimation
- `ANTHROPIC_API_KEY`: Optional, for AI assistant

**Frontend:**
- `VITE_API_URL`: Backend URL (default: `http://localhost:8000`)

### Service Ports

- Frontend: `3000`
- Backend: `8000`
- PostgreSQL: `5432` (internal only)
- Redis: `6379` (internal only)
- LocalStack: `4566`

### Cloud Service Icons

Icons stored in `Cloud_Services/` directory, mounted read-only at `/app/Cloud_Services` in containers.

## Common Development Patterns

### Adding a New Cloud Resource

1. **Backend:** Add resource config to `backend/app/services/terraform/config.py`
2. **TypeScript Generator:** Add template in `backend/src/terraform/catalog/`
3. **Frontend:** Add resource definition to `frontend/src/lib/resources/`

### Adding a New API Endpoint

1. Create endpoint in `backend/app/api/endpoints/{feature}.py`
2. Add Pydantic schemas in `backend/app/schemas/{feature}.py`
3. Register router in `backend/app/main.py`
4. Add API client method in `frontend/src/lib/api/`

## WSL Development Notes

This project is developed on Windows with WSL2:
- **Project Path:** `/mnt/c/Users/goda/Desktop/CloudForge`
- **Docker:** Docker Desktop for Windows with WSL2 backend
- **Commands:** Use `wsl.exe -d Ubuntu` prefix to run commands from Windows
