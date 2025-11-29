# CloudForge - Replit Setup

## Project Overview
CloudForge is a visual Infrastructure as Code (IaC) platform that allows users to design cloud architecture through drag-and-drop diagrams and generate production-ready Terraform code. It supports AWS, Azure, and GCP.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + ReactFlow (Port 5000)
- **Backend**: FastAPI + Python 3.12 + SQLAlchemy + PostgreSQL (Port 8000)
- **Database**: PostgreSQL (Replit-managed)
- **State Management**: Zustand
- **API Communication**: Axios

## Recent Setup (November 29, 2025)
Successfully imported from GitHub and configured for Replit environment:

### Configuration Changes
1. **Vite Config** (`frontend/vite.config.ts`):
   - Changed port from 3000 to 5000 (Replit requirement)
   - Removed specific allowedHosts, allowing all hosts for Replit proxy
   - Added HMR configuration for port 5000

2. **Backend Main** (`main.py`):
   - Created wrapper script to run backend via uvicorn
   - Configured to bind to 0.0.0.0:8000 (required for Replit workflow detection)

3. **Backend Config** (`backend/app/core/config.py`):
   - Updated CORS origins to include port 5000 and Replit domain
   - Uses environment variables from Replit secrets

4. **Environment Variables** (Development):
   - DATABASE_URL: Replit PostgreSQL (auto-configured)
   - SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
   - REDIS_URL: redis://localhost:6379/0 (not required for basic functionality)
   - ALLOWED_ORIGINS: Configured for Replit domain

### Created Files
Generated missing frontend library files that were gitignored:
- `frontend/src/lib/store/authStore.ts` - Authentication state management
- `frontend/src/lib/store/themeStore.ts` - Theme state management
- `frontend/src/lib/api/client.ts` - API client with interceptors
- `frontend/src/lib/resources/*` - Resource definitions and catalogs
- `frontend/src/lib/terraform/codeGenerator.ts` - Terraform code generation stub
- `frontend/src/lib/api/workflowClient.ts` - Workflow API client stub
- `frontend/src/lib/api/pipelineClient.ts` - Pipeline API client stub
- `frontend/src/lib/icons/cloudIcons.ts` - Cloud icons mapping stub

Generated resource catalog from Excel data using `scripts/generate_resource_catalog.py`.

### Workflows
1. **Frontend**: `cd frontend && npm run dev` (Port 5000, webview)
2. **Backend**: `python main.py` (Port 8000, console)

### Deployment
Configured for static frontend deployment:
- Build: `cd frontend && npm run build`
- Public directory: `frontend/dist`

## Default Credentials
- Username: admin
- Password: admin123
- Email: admin@cloudforge.dev

## Icon System (Updated November 29, 2025)
The icon system uses actual cloud provider icons from the Cloud_Services folder:

### Frontend Icon Resolution
- `frontend/src/lib/resources/iconPaths.ts` - Maps resource types to API icon paths
- `frontend/src/lib/resources/iconResolver.ts` - Resolves icons with fallback to Lucide icons
- `frontend/src/components/CloudIcon.tsx` - Renders icons (supports API paths and Lucide icons)

### Backend Icon Endpoint
- `backend/app/api/endpoints/icons.py` - Serves icons from Cloud_Services folder at `/api/icons/{provider}/{path}`

### Icon Path Mapping
- AWS icons: `/api/icons/aws/Architecture-Service-Icons_07312025/{category}/64/{icon}.svg`
- AI/ML icons are in `Arch_Artificial-Intelligence` folder (not Machine-Learning)
- Azure icons: `/api/icons/azure/{category}/{icon}.svg`
- GCP icons: `/api/icons/gcp/Category Icons/{category}/SVG/{icon}.svg`

## API Trailing Slash Convention
FastAPI routes have mixed trailing slash conventions:
- List endpoints use trailing slashes: `/api/projects/`
- Individual resource endpoints do NOT use trailing slashes: `/api/projects/${id}`

## Brainboard-style UI Enhancements (November 29, 2025)
Major UX/UI overhaul to match professional IaC tools like Brainboard:

### New Frontend Components
- **ResourcePalette.tsx** - Collapsible sidebar with:
  - Provider tabs (AWS/Azure/GCP)
  - Category accordions with resource counts
  - Search filtering with debounce
  - Drag-and-drop with ghost preview
  
- **DesignerToolbar.tsx** - Professional top toolbar:
  - File actions (Save, Export, Import)
  - View toggles (Sidebar, Code Panel, Minimap)
  - Terraform actions (Validate, Plan, Apply, Destroy)
  - Zoom controls and keyboard shortcuts
  
- **PropertiesPanel.tsx** - Right sidebar for configuration:
  - Tabbed interface (Properties, Connections, Advanced)
  - Dynamic form fields based on resource type
  - Real-time validation with error messages
  - Auto-save with debounce

- **resourceSchemas.ts** - Schema definitions for 30+ AWS/Azure/GCP resources

### Dashboard Improvements
- Modern header with user greeting and search
- Statistics section (total projects, by provider)
- Filter tabs (All, Recent, AWS, Azure, GCP)
- Redesigned project cards with provider badges and quick actions
- Loading skeletons and error states

### Keyboard Shortcuts
- Cmd/Ctrl+S: Save project
- Cmd/Ctrl+B: Toggle sidebar
- Escape: Deselect and close panels

## Backend Production Hardening
- **Rate Limiting**: slowapi with 100 req/min default, stricter for auth (10/min) and terraform ops (5/min)
- **Input Validation**: Pydantic validators for all schemas
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, CSP (production)
- **Structured Logging**: JSON formatter with request_id tracing
- **Database Pooling**: pool_pre_ping=True, pool_recycle=300 to handle SSL drops
- **Gunicorn Config**: Production-ready with worker optimization

## Deployment Configuration
- **Target**: Autoscale
- **Build**: `cd frontend && npm run build`
- **Run**: `gunicorn --config backend/gunicorn.conf.py backend.app.main:app`

## Known Issues
- Redis is not running (optional - only needed for Celery background tasks)
- Database connection drops are now handled by pool_pre_ping

## File Structure
```
CloudForge/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── features/   # Feature modules
│   │   └── lib/        # Utilities and libraries
│   ├── public/         # Static assets
│   └── package.json
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Core configuration
│   │   ├── models/     # Database models
│   │   ├── services/   # Business logic
│   │   └── schemas/    # Pydantic schemas
│   └── requirements.txt
├── Cloud_Services/     # Cloud provider icons
├── scripts/            # Utility scripts
└── main.py            # Backend entry point
```

## Next Steps
- Add Redis for Celery background task support (terraform operations)
- Implement template gallery with pre-built architecture templates
- Add collaborative editing (WebSocket-based real-time updates)
- Integrate cloud provider APIs for real-time resource validation
