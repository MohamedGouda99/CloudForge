# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CloudForge is a multi-cloud Infrastructure as Code (IaC) platform that enables visual design of cloud infrastructure and generates Terraform configurations. The platform supports AWS, Azure, and GCP with security scanning, cost estimation, and AI assistance.

**Tech Stack:**
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0, PostgreSQL 15, Celery, Redis
- **Frontend:** React 18, TypeScript 5.6, Zustand, React Flow, TailwindCSS, Vite
- **Infrastructure:** Docker Compose, LocalStack, Nginx
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

# Install dependencies
pip install -r requirements.txt

# Run development server (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v --cov=app

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head

# Code formatting and linting
black app/
flake8 app/
mypy app/
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server (with HMR)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npx tsc --noEmit
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

### Backend Architecture (Layered)

```
backend/app/
├── api/endpoints/          # FastAPI route handlers
│   ├── auth.py            # JWT authentication (/api/auth/*)
│   ├── projects.py        # Project CRUD (/api/projects/*)
│   ├── resources.py       # Resource management (/api/resources/*)
│   ├── terraform.py       # Terraform generation (/api/terraform/*)
│   ├── security.py        # TFSec/Terrascan scans
│   ├── drift.py           # Drift detection
│   ├── dashboard.py       # Analytics/stats
│   └── assistant.py       # AI assistant (Claude)
├── core/
│   ├── config.py          # Settings (loaded from .env)
│   ├── database.py        # SQLAlchemy setup
│   ├── security.py        # JWT utilities, password hashing
│   ├── celery.py          # Async task configuration
│   └── logging.py         # Structured logging
├── models/                # SQLAlchemy ORM models
│   ├── user.py           # User model with authentication
│   ├── project.py        # Project model (stores diagram_data, tf_config)
│   └── terraform.py      # Resource and CostEstimate models
├── schemas/              # Pydantic models for request/response validation
├── services/             # Business logic layer
│   ├── terraform/
│   │   ├── factory.py    # TerraformGeneratorFactory (multi-cloud)
│   │   ├── generators/   # Cloud-specific generators
│   │   │   ├── aws.py
│   │   │   ├── azure.py
│   │   │   └── gcp.py
│   │   ├── formatters.py # HCL code formatting
│   │   └── config.py     # Resource mapping configs
│   ├── claude_assistant.py  # Anthropic Claude integration
│   └── drift/            # Infrastructure drift detection
├── middleware/           # Request/response middleware
└── main.py              # Application entry point, router registration
```

### Frontend Architecture (Feature-Based)

```
frontend/src/
├── features/             # Feature modules (pages)
│   ├── dashboard/       # Main dashboard view
│   ├── designer/        # Visual infrastructure designer (React Flow)
│   ├── analytics/       # Cost analytics and charts
│   └── auth/           # Login/register pages
├── components/          # Reusable UI components
│   ├── DesignerToolbar.tsx   # Drag-drop resource palette
│   ├── InspectorPanel.tsx    # Resource property editor
│   └── MetricsCard.tsx       # Dashboard stat cards
├── lib/
│   ├── api/            # Axios API client with interceptors
│   ├── store/          # Zustand state management
│   │   ├── authStore.ts      # Authentication state
│   │   ├── projectStore.ts   # Project data
│   │   └── designerStore.ts  # Canvas nodes/edges
│   ├── resources/      # Cloud resource definitions and icons
│   ├── terraform/      # HCL parsing utilities
│   └── utils/          # Helper functions
└── App.tsx             # Router and main layout
```

### Multi-Cloud Terraform Generation Flow

The Terraform generation is cloud-agnostic at the API level but provider-specific in implementation:

1. **User Action:** Designer canvas nodes/edges saved to `project.diagram_data` (JSON)
2. **API Call:** `POST /api/terraform/generate/{project_id}`
3. **Factory Pattern:** `TerraformGeneratorFactory` selects generator based on `project.cloud_provider`
4. **Generator Execution:**
   - Parses `diagram_data` to extract nodes and edges
   - Builds dependency graph (e.g., VPC → Subnet → EC2 → Security Group)
   - Maps visual nodes to Terraform resource types (e.g., "vpc" → "aws_vpc")
   - Generates HCL using Jinja2 templates in `backend/src/terraform/catalog/`
5. **Post-Processing:**
   - Formats HCL code
   - Stores result in `project.tf_config`
   - Returns generated code to frontend
6. **Security/Cost Analysis (background):**
   - TFSec scan: `POST /api/terraform/tfsec/{project_id}`
   - Terrascan policy check: `POST /api/terraform/terrascan/{project_id}`
   - Infracost estimation: `POST /api/terraform/infracost/{project_id}`

### Database Schema

**Key relationships:**
- `users` 1:N `projects` (via `owner_id`)
- `projects` 1:N `resources` (via `project_id`)
- `projects` 1:N `cost_estimates` (via `project_id`)

**Important columns:**
- `projects.diagram_data`: JSON blob storing React Flow nodes/edges
- `projects.tf_config`: Generated Terraform HCL code (TEXT)
- `projects.cloud_provider`: Enum ("aws", "azure", "gcp")

### Real-time Collaboration

Socket.IO is integrated for collaborative editing:
- Room-based architecture: `project_{project_id}`
- Events: `diagram_update`, `cursor_position`, `user_joined`, `user_left`
- WebSocket endpoint: Uses same FastAPI server with `socketio.ASGIApp` wrapper

## Critical Implementation Details

### TypeScript Terraform Generator (backend/src/terraform/)

The backend contains a **TypeScript-based Terraform generator** separate from the Python codebase. This is called via subprocess from Python:

- **Location:** `backend/src/terraform/`
- **Entry point:** `generate.ts`
- **Package manager:** npm (has its own `package.json`)
- **Usage from Python:** Executed via `subprocess` with JSON input/output
- **Installation:** Run `npm install` in `backend/src/terraform/` directory

When modifying Terraform generation:
1. Changes to resource types go in `catalog/` directory
2. Type definitions in `types.ts`
3. Graph inference logic in `infer.ts`
4. HCL rendering in `render.ts`

### Authentication Flow

1. **Login:** `POST /api/auth/login` (form-urlencoded: username + password)
2. **Response:** `{"access_token": "...", "token_type": "bearer"}`
3. **JWT Storage:** Frontend stores token in Zustand (`authStore`)
4. **API Requests:** Axios interceptor adds `Authorization: Bearer {token}` header
5. **Backend Validation:** `Depends(get_current_user)` dependency validates JWT
6. **Default Admin:** Created on startup (username: `admin`, password: `admin123`)

### Environment Variables

**Backend (.env):**
- `DATABASE_URL`: PostgreSQL connection string (must point to container name in Docker)
- `SECRET_KEY`: JWT signing key (MUST change in production)
- `INFRACOST_API_KEY`: Required for cost estimation
- `ANTHROPIC_API_KEY`: Optional, for AI assistant features

**Frontend (.env):**
- `VITE_API_URL`: Backend URL (use `http://localhost:8000` for local dev)

### Cloud Service Icons

Icons are stored in `Cloud_Services/` directory:
- **AWS:** `Cloud_Services/AWS/Architecture-Service-Icons_07312025/`
- **Structure:** Organized by service category, multiple sizes (16, 32, 48, 64 pixels)
- **API:** `GET /api/icons/{provider}` returns available icons
- **Volume Mount:** Read-only mount in Docker (`/app/Cloud_Services:ro`)

### LocalStack Integration

LocalStack Pro is used for AWS testing without real credentials:
- **Endpoint:** `http://localstack:4566`
- **Services:** S3, DynamoDB, Lambda, EC2, etc.
- **Configuration:** Set `AWS_ENDPOINT_URL` environment variable
- **Persistence:** Enabled via `PERSISTENCE=1` and volume mount

## Common Development Patterns

### Adding a New Cloud Resource

1. **Backend:** Add resource config to `backend/app/services/terraform/config.py`
2. **TypeScript Generator:** Add template in `backend/src/terraform/catalog/{provider}/{resource}.ts`
3. **Frontend:** Add resource definition to `frontend/src/lib/resources/{provider}.ts`
4. **Icon:** Add icon path to resource config

### Adding a New API Endpoint

1. Create endpoint in `backend/app/api/endpoints/{feature}.py`
2. Add Pydantic schemas in `backend/app/schemas/{feature}.py` (if needed)
3. Register router in `backend/app/main.py`
4. Add API client method in `frontend/src/lib/api/client.ts`
5. Update Zustand store if state management needed

### Database Changes

1. Modify SQLAlchemy model in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Update Pydantic schemas to match new model structure

## Testing

### Backend Tests

Located in `backend/tests/`:
- Use `pytest` with `pytest-asyncio` for async tests
- Database tests use in-memory SQLite or test PostgreSQL instance
- Mock external services (Infracost, Anthropic) in unit tests

### Frontend Tests

Not currently configured but package.json has placeholders.

## WSL Development Notes

This project is developed on Windows with WSL2:
- **Project Path:** `/mnt/c/Users/goda/Desktop/CloudForge`
- **Docker:** Docker Desktop for Windows with WSL2 backend
- **Commands:** Use `wsl.exe -d Ubuntu` prefix to run commands from Windows
- **File Watching:** May need to configure file watchers for hot reload across WSL boundary

## Security Scanning

### TFSec

Static security analysis for Terraform code:
- **Binary:** Installed in backend container
- **Execution:** Called via subprocess in `backend/app/api/endpoints/security.py`
- **Output:** JSON with severity levels (CRITICAL, HIGH, MEDIUM, LOW)

### Terrascan

Policy-as-code validation:
- **Binary:** Installed in backend container
- **Policies:** Supports CIS, SOC2, HIPAA, PCI-DSS benchmarks
- **Format:** OPA Rego policies

### Infracost

Cloud cost estimation:
- **API Key:** Required in environment variables
- **Execution:** Background Celery task
- **Storage:** Results saved to `cost_estimates` table

## AI Assistant Integration

Claude (Anthropic) integration for infrastructure questions:
- **Endpoint:** `/api/assistant/chat`
- **Model:** Configured in `services/claude_assistant.py`
- **Context:** Can include project diagram data for context-aware suggestions
- **API Key:** Set `ANTHROPIC_API_KEY` environment variable

## Deployment Considerations

- Change `SECRET_KEY` to cryptographically secure random value
- Set `ENVIRONMENT=production` to disable debug features and OpenAPI docs
- Configure proper CORS origins in production
- Use proper PostgreSQL instance (not Docker container for production)
- Set up SSL/TLS termination at load balancer or reverse proxy
- Configure Celery workers for background tasks
- Set up monitoring and log aggregation
- Regular database backups of PostgreSQL
