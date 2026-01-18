# Research: Production Readiness & Comprehensive Testing

**Feature**: 002-production-readiness-testing
**Date**: 2026-01-14
**Status**: Complete

## Research Areas

### 1. Backend Testing Framework

**Decision**: pytest + pytest-asyncio + pytest-cov + httpx

**Rationale**:
- pytest is the de facto standard for Python testing with excellent async support
- pytest-asyncio integrates seamlessly with FastAPI's async endpoints
- pytest-cov provides coverage reporting compatible with CI systems
- httpx provides async HTTP client for testing FastAPI applications (recommended by FastAPI docs)

**Alternatives Considered**:
- unittest: Built-in but verbose, lacks async support, fewer plugins
- nose2: Less active development, smaller ecosystem
- ward: Newer, less community adoption

### 2. Frontend Testing Framework

**Decision**: Vitest + React Testing Library + Playwright

**Rationale**:
- Vitest: Native ESM support, Vite integration, faster than Jest for Vite projects
- React Testing Library: Testing library that encourages testing behavior over implementation
- Playwright: Cross-browser E2E testing with better reliability than Selenium for modern SPAs

**Alternatives Considered**:
- Jest: Slower with Vite, requires additional configuration
- Cypress: Good but Playwright has better cross-browser support and is faster
- Selenium: Older, slower, more flaky for modern React applications

### 3. Load Testing Tool

**Decision**: Locust

**Rationale**:
- Python-based (matches backend stack for team familiarity)
- Distributed load testing capability for scale testing
- Real-time web UI for monitoring test progress
- Scriptable in Python for complex user scenarios
- Can test WebSocket connections (needed for CloudForge real-time features)

**Alternatives Considered**:
- k6: JavaScript-based, excellent performance, but different language from backend
- JMeter: Heavy, GUI-based, steeper learning curve
- Artillery: Good but less mature distributed testing

### 4. Accessibility Testing Tools

**Decision**: axe-core (automated) + pa11y (CLI reporting)

**Rationale**:
- axe-core: Industry standard, integrates with Playwright for automated testing
- pa11y: CLI tool for CI integration, generates reports
- Both support WCAG 2.1 AA compliance checking (per spec requirement)

**Alternatives Considered**:
- WAVE: Browser extension only, not automatable
- Lighthouse: Good but axe-core has deeper accessibility focus
- Tenon: Commercial, unnecessary cost for this scope

### 5. Security Scanning Tools

**Decision**: npm audit + pip-audit + safety

**Rationale**:
- npm audit: Built into npm, scans frontend dependencies
- pip-audit: Google-maintained, scans Python dependencies against vulnerability databases
- safety: Alternative Python scanner, good for CI pipelines
- All free and integrate easily with CI/CD

**Alternatives Considered**:
- Snyk: Excellent but commercial for full features
- Dependabot: GitHub-specific, good for PR automation but not local scanning
- OWASP Dependency-Check: Heavier, Java-based

### 6. Database Migration Tool

**Decision**: Alembic

**Rationale**:
- Native SQLAlchemy integration (already using SQLAlchemy 2.0)
- Supports auto-generation of migrations from model changes
- Reversible migrations (up/down)
- Well-documented, widely used in FastAPI projects

**Alternatives Considered**:
- Django migrations: Requires Django, not applicable
- Flyway: Java-based, language mismatch
- Manual SQL scripts: Error-prone, no versioning

### 7. Component Splitting Strategy

**Decision**: Feature-based extraction with shared component library

**Rationale**:
- Extract DesignerPageFinal.tsx (2,710 LOC) into:
  - `components/designer/DesignerCanvas.tsx` - React Flow management
  - `components/designer/DesignerToolbar.tsx` - Tool palette (already exists, refine)
  - `components/designer/DeploymentPanel.tsx` - Deploy/plan UI
  - `components/designer/CredentialsManager.tsx` - Cloud credentials
- Extract InspectorPanel.tsx (1,799 LOC) into:
  - `components/inspector/PropertyEditor.tsx` - Resource property forms
  - `components/inspector/TerraformPreview.tsx` - Code preview
  - `components/inspector/IssuesList.tsx` - Validation issues
  - `components/inspector/DeploymentModes.tsx` - Mode selector
- Create shared component library in `components/common/`

**Alternatives Considered**:
- Atomic design (atoms/molecules/organisms): Over-engineered for this codebase
- Domain-driven folders: Already using features/, components complement this
- Single flat components folder: Doesn't scale, current problem

### 8. Resource Definition Consolidation

**Decision**: Two-file architecture (catalog + schemas)

**Rationale**:
- `resourceCatalog.ts`: Runtime catalog with all AWS/Azure/GCP resources, icons, categories
- `resourceSchemas.ts`: Validation schemas and type definitions
- Single source of truth eliminates 27 AWS files + 9 resource files
- Separation allows catalog to be API-driven in future without changing schemas

**Alternatives Considered**:
- Single mega-file: Too large, hard to maintain
- API-driven only: Requires backend changes, increases latency
- Keep current structure: Explicitly rejected (primary problem to solve)

### 9. State Management Expansion

**Decision**: Expand Zustand stores with slices pattern

**Rationale**:
- Add stores for:
  - `designerStore.ts`: Canvas state (nodes, edges, selection, viewport)
  - `projectStore.ts`: Current project, resources, terraform config
  - `deploymentStore.ts`: Deploy state, credentials, logs
  - `uiStore.ts`: Modals, toasts, loading states
- Keep `authStore.ts` and `themeStore.ts` (existing)
- Use Zustand slices for composability

**Alternatives Considered**:
- Redux: More boilerplate, Zustand already in use
- Jotai: Atomic model less suitable for complex state
- Context only: Current approach, causes prop drilling

### 10. Structured Logging Implementation

**Decision**: Python logging + structlog for backend, custom logger wrapper for frontend

**Rationale**:
- Backend: structlog provides JSON-formatted logs for production, human-readable for dev
- Frontend: Thin wrapper that no-ops console.log in production, sends errors to backend
- Both integrate with observability stack (logs + metrics per clarification)

**Alternatives Considered**:
- Loguru: Good but structlog is more standard for structured JSON
- Winston (frontend): Overkill for browser logging
- Console API only: Current approach, explicitly rejected

### 11. Metrics Collection

**Decision**: Prometheus client (backend) + Web Vitals (frontend)

**Rationale**:
- Backend: prometheus-client exposes `/metrics` endpoint for scraping
- Track: request latency, error rates, active connections, Terraform generation times
- Frontend: Web Vitals library tracks LCP, FID, CLS automatically
- Aligns with observability clarification (logs + metrics)

**Alternatives Considered**:
- StatsD: Requires additional infrastructure
- Application Insights: Azure-specific, adds vendor lock-in
- Custom metrics only: Harder to integrate with monitoring tools

### 12. Session/Cache External Storage

**Decision**: Redis for sessions and cache (already configured)

**Rationale**:
- Already in docker-compose.yaml as `cloudforge-redis`
- FastAPI session middleware can use Redis backend
- Celery already using Redis as broker
- Enables stateless backend for horizontal scaling (per clarification)

**Alternatives Considered**:
- Memcached: Less features than Redis
- Database sessions: Slower, increases DB load
- JWT-only (stateless): Already using JWT, but may need server-side session data

## Summary of Technology Decisions

| Area | Tool/Approach | Key Reason |
|------|---------------|------------|
| Backend Testing | pytest + httpx | FastAPI native, async support |
| Frontend Testing | Vitest + RTL + Playwright | Vite integration, modern tooling |
| Load Testing | Locust | Python-based, distributed capable |
| Accessibility | axe-core + pa11y | WCAG 2.1 AA compliance |
| Security Scanning | npm audit + pip-audit | Free, CI-friendly |
| DB Migrations | Alembic | SQLAlchemy native |
| Component Split | Feature-based extraction | Matches existing architecture |
| Resource Files | 2-file consolidation | Maintainable single source |
| State Management | Zustand slices | Already using Zustand |
| Logging | structlog (BE) + wrapper (FE) | JSON for production |
| Metrics | Prometheus + Web Vitals | Standard observability |
| Sessions/Cache | Redis | Already configured, stateless ready |

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved through this research. No blocking questions remain for Phase 1 design.
