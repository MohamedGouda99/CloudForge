<!--
SYNC IMPACT REPORT
==================
Version Change: N/A (Initial) → 1.0.0
Change Type: MINOR (Initial constitution creation)

Principles Created:
- I. Code Quality & Maintainability (NEW)
- II. Testing Standards (NON-NEGOTIABLE) (NEW)
- III. User Experience Consistency (NEW)
- IV. Performance & Scalability Requirements (NEW)
- V. Security & Compliance (NEW)

Sections Added:
- Development Workflow & Review Process (NEW)
- Architecture Constraints (NEW)

Template Status:
- ✅ plan-template.md: Reviewed - Constitution Check section aligns with new principles
- ✅ spec-template.md: Reviewed - Requirements sections support UX and performance standards
- ✅ tasks-template.md: Reviewed - Testing discipline and phase organization align with principles

Follow-up Items:
- None - All placeholders filled with concrete values

Ratification Date: 2026-01-08 (initial adoption)
-->

# CloudForge Constitution

## Core Principles

### I. Code Quality & Maintainability

**MUST Requirements:**
- All code MUST pass linting and type checking before commit (backend: `black`, `flake8`, `mypy`; frontend: `eslint`, TypeScript strict mode)
- Python code MUST maintain >80% test coverage measured by pytest-cov
- TypeScript code MUST have no `any` types except in explicitly documented cases with justification
- All public APIs MUST have Pydantic schemas with complete field documentation
- Database models MUST use SQLAlchemy type hints and include docstrings
- React components MUST be functional components with TypeScript interfaces for props
- State management MUST follow single source of truth pattern (Zustand stores for frontend, database for backend)

**SHOULD Requirements:**
- Functions longer than 50 lines SHOULD be refactored into smaller, composable units
- Cyclomatic complexity SHOULD not exceed 10 per function
- Files longer than 500 lines SHOULD be split into multiple modules

**Rationale:** CloudForge generates critical infrastructure code. Poor code quality directly impacts security, reliability, and maintainability of both the platform and user-generated infrastructure.

### II. Testing Standards (NON-NEGOTIABLE)

**Test Categories:**
- **Unit Tests:** Required for all service layer functions, utility functions, and state management logic
- **Integration Tests:** Required for all API endpoints, database operations, and Terraform generation flows
- **Contract Tests:** Required for external service integrations (Infracost, Anthropic Claude, cloud providers)
- **E2E Tests:** Required for critical user journeys (project creation, Terraform generation, security scans)

**Test-Driven Development (TDD) MUST be followed:**
1. Write failing tests that verify acceptance criteria
2. User/Product Owner approves test scenarios
3. Implement minimum code to pass tests
4. Refactor while keeping tests green
5. No feature merges without corresponding passing tests

**Backend Testing Requirements:**
- pytest with pytest-asyncio for async tests
- pytest-cov for coverage reporting (minimum 80%)
- Mock external services (LocalStack for AWS, mocks for Infracost/Anthropic)
- Database tests MUST use transaction rollback or test database isolation

**Frontend Testing Requirements:**
- Component tests for all reusable components
- Integration tests for feature modules (Dashboard, Designer, Analytics)
- Mock API responses using MSW (Mock Service Worker) or similar
- Visual regression tests for critical UI flows (Designer canvas, cost analytics)

**Rationale:** Infrastructure-as-code errors can lead to costly cloud deployments, security vulnerabilities, or data loss. Comprehensive testing is the only reliable safeguard.

### III. User Experience Consistency

**Design System Requirements:**
- All UI components MUST use TailwindCSS utility classes (no inline styles)
- Color palette MUST adhere to Vodafone brand colors defined in `frontend/src/lib/theme/`
- Typography MUST follow established scale: headings (text-2xl, text-xl, text-lg), body (text-base), small (text-sm)
- Spacing MUST use Tailwind spacing scale (4px increments: p-2, p-4, p-6, etc.)
- Icons MUST use Lucide React icon set for consistency

**Interaction Patterns:**
- Loading states MUST show skeleton loaders or spinners with descriptive text
- Error states MUST display user-friendly messages with actionable guidance (not raw error dumps)
- Success states MUST show toast notifications (using Sonner library)
- Forms MUST use react-hook-form with zod validation
- Confirmation dialogs MUST be used for destructive actions (delete project, delete resources)

**Accessibility Requirements:**
- All interactive elements MUST be keyboard navigable
- Form inputs MUST have associated labels
- Error messages MUST be announced to screen readers
- Color contrast MUST meet WCAG AA standards (4.5:1 for normal text)

**Performance UX:**
- API responses >500ms MUST show loading indicators
- Large lists (>50 items) MUST use virtualization (React Window)
- Images MUST have loading="lazy" attribute
- Code editors MUST debounce input (300ms minimum)

**Rationale:** CloudForge is an enterprise platform. Inconsistent UX erodes trust and increases training costs. Predictable patterns improve productivity.

### IV. Performance & Scalability Requirements

**Backend Performance Targets:**
- API response time: p95 <200ms for CRUD operations, <1s for Terraform generation
- Database query count: N+1 queries MUST be eliminated (use `joinedload` or `selectinload`)
- Background tasks: Long-running operations (>2s) MUST use Celery async tasks
- Rate limiting: 100 requests/minute per user (enforced by SlowAPI middleware)
- Memory: Backend container MUST not exceed 1GB under normal load

**Frontend Performance Targets:**
- Initial page load: <3s on 3G connection (Lighthouse performance score >85)
- Time to Interactive (TTI): <5s
- First Contentful Paint (FCP): <1.5s
- React Flow canvas: Handle 100+ nodes without frame drops (<16ms per frame for 60fps)
- Code editor rendering: Monaco editor MUST load incrementally for files >1000 lines

**Database Performance:**
- Queries MUST use indexes for frequently filtered columns (project.owner_id, resource.project_id)
- Full table scans MUST be avoided (review EXPLAIN ANALYZE output)
- Connection pooling MUST be configured (SQLAlchemy pool_size=10, max_overflow=20)
- Long transactions MUST be avoided (commit or rollback within 5s)

**Caching Strategy:**
- Redis MUST cache frequently accessed data (user sessions, project lists)
- Static assets MUST have cache headers (max-age=31536000 for immutable assets)
- API responses MUST include ETag headers for conditional requests

**Scalability Targets:**
- Platform MUST support 100 concurrent users per backend instance
- PostgreSQL MUST handle 1000+ projects without degradation
- React Flow designer MUST support projects with 200+ cloud resources

**Rationale:** Performance is a feature. Slow tools hinder developer productivity. Enterprise users expect responsiveness at scale.

### V. Security & Compliance

**Authentication & Authorization:**
- JWT tokens MUST expire within 24 hours (configurable via ACCESS_TOKEN_EXPIRE_MINUTES)
- Passwords MUST be hashed with bcrypt (salt rounds = 12)
- API endpoints MUST validate JWT on every request (except public routes)
- User data access MUST be scoped by ownership (row-level security: `project.owner_id == current_user.id`)

**Input Validation:**
- All API inputs MUST be validated with Pydantic schemas
- SQL injection MUST be prevented (use SQLAlchemy ORM, no raw SQL)
- XSS attacks MUST be mitigated (React escapes by default, validate user-provided Terraform)
- CSRF protection MUST be enabled (FastAPI CORS middleware configured)

**Infrastructure Security:**
- Terraform code MUST pass TFSec scan (block deployment on CRITICAL severity)
- Terraform code MUST pass Terrascan policy checks (warn on MEDIUM, block on HIGH)
- Generated Terraform MUST follow least-privilege principle (no `*` wildcards in IAM policies)
- Secrets MUST NOT be stored in plaintext (use environment variables, never commit to Git)

**Compliance:**
- Audit logs MUST record user actions (project creation, Terraform generation, deployment)
- Data retention MUST follow GDPR requirements (user data deletion on request)
- Security headers MUST be set (X-Content-Type-Options, X-Frame-Options, CSP)

**Rationale:** CloudForge manages cloud infrastructure credentials and generates code that controls production systems. Security is paramount.

## Development Workflow & Review Process

### Code Review Requirements

All pull requests MUST:
- Pass CI/CD pipeline (linting, type checking, tests, security scans)
- Have descriptive title and description linking to issue/spec
- Include test coverage for new functionality
- Be reviewed and approved by at least one team member
- Have no merge conflicts with target branch

### Quality Gates

Before merging, code MUST pass:
- Backend: `black app/`, `flake8 app/`, `mypy app/`, `pytest tests/ --cov=app --cov-fail-under=80`
- Frontend: `npm run lint`, `npx tsc --noEmit`, `npm run test`
- Security: TFSec and Terrascan scans on generated Terraform samples
- Docker: `docker-compose up` succeeds without errors

### Branch Strategy

- **main**: Production-ready code, protected branch
- **Feature branches**: `###-feature-name` format (e.g., `042-drift-detection`)
- **Hotfix branches**: `hotfix-###-description` for urgent production fixes
- Commits MUST follow Conventional Commits format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`

### Deployment Process

- Development: Continuous deployment on merge to `main` (Docker Compose staging environment)
- Production: Manual approval required, tagged releases (v2.0.0, v2.1.0, etc.)
- Database migrations: MUST be tested in staging before production deployment
- Rollback plan: MUST be documented for breaking changes

## Architecture Constraints

### Technology Stack (Non-Negotiable)

**Backend:**
- Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL 15, Celery, Redis
- Terraform generation via TypeScript (backend/src/terraform/)
- Security tools: TFSec, Terrascan (installed in Docker container)

**Frontend:**
- React 18+, TypeScript 5.6+, Zustand (state), React Flow (canvas), TailwindCSS (styling), Vite (build)
- No Redux, MobX, or alternative state libraries (Zustand is standardized)
- No CSS-in-JS libraries (TailwindCSS enforces consistency)

**Infrastructure:**
- Docker Compose for development and staging
- PostgreSQL for persistent data (no NoSQL databases)
- Redis for caching and Celery task queue

### Structural Patterns

**Backend Layering (Mandatory):**
```
API Endpoints (FastAPI routes)
    ↓
Business Logic (Services layer)
    ↓
Data Access (SQLAlchemy models)
    ↓
Database (PostgreSQL)
```

**Frontend Modularity (Mandatory):**
```
Features (pages/feature modules)
    ↓
Components (reusable UI)
    ↓
State Management (Zustand stores)
    ↓
API Client (Axios with interceptors)
```

### Forbidden Patterns

- **Backend:** No direct database access from endpoints (must go through service layer)
- **Frontend:** No prop drilling beyond 2 levels (use Zustand or context)
- **Both:** No God objects/classes >500 lines (refactor into smaller modules)
- **Both:** No circular dependencies (enforce with linters)

## Governance

### Amendment Process

1. Propose changes via pull request to `.specify/memory/constitution.md`
2. Document rationale and impact on existing codebase
3. Update affected templates (plan, spec, tasks) for consistency
4. Increment version following semantic versioning:
   - **MAJOR**: Backward-incompatible changes (remove principles, change architecture constraints)
   - **MINOR**: Add new principles or expand guidance
   - **PATCH**: Clarifications, typos, non-semantic fixes
5. Require approval from at least 2 team members
6. Update `LAST_AMENDED_DATE` to amendment date

### Compliance Verification

- All PR reviews MUST verify compliance with Core Principles
- CI/CD pipeline MUST enforce automated checks (linting, testing, security)
- Quarterly architecture reviews MUST assess adherence to constraints
- Technical debt MUST be tracked and prioritized (violations require justification)

### Complexity Justification

If a feature requires violating a principle:
1. Document in `Complexity Tracking` section of `plan.md`
2. Explain why simpler alternative was rejected
3. Get explicit approval from tech lead/architect
4. Add TODO to refactor once constraints are resolved

### Constitution Supersedes

This constitution supersedes:
- Individual preferences for code style (enforced by linters)
- Ad-hoc architectural decisions (must align with constraints)
- Undocumented "tribal knowledge" (all guidance MUST be written here)

### Runtime Development Guidance

For day-to-day development guidance, refer to:
- **CLAUDE.md**: Commands, architecture details, and development workflows for AI assistants
- **README.md**: Project overview, quick start, and API reference
- **docs/**: Detailed technical documentation and runbooks

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
