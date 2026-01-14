<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 (initial ratification)
Principles:
  - I. Code Quality First (NEW)
  - II. Testing Standards (NEW)
  - III. User Experience Consistency (NEW)
  - IV. Performance Requirements (NEW)
Added sections:
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: None (initial constitution)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
  - .specify/templates/spec-template.md ✅ (Requirements align with principles)
  - .specify/templates/tasks-template.md ✅ (Phase structure supports testing principles)
Follow-up TODOs: None
-->

# CloudForge Constitution

## Core Principles

### I. Code Quality First

All code committed to CloudForge MUST meet the following quality standards:

- **Type Safety**: TypeScript strict mode MUST be enabled for frontend code. Python code MUST include type hints for all function signatures and public interfaces.
- **Linting Compliance**: All code MUST pass ESLint (frontend) and flake8/mypy (backend) with zero errors before merge.
- **DRY Principle**: Duplicate logic MUST be extracted into shared utilities or services. Maximum allowed duplication is 3 occurrences before refactoring is required.
- **Clear Naming**: Variables, functions, and classes MUST use descriptive names that convey intent. Abbreviations MUST be avoided except for industry-standard terms (e.g., `API`, `URL`, `ID`).
- **Single Responsibility**: Each function MUST perform one logical operation. Each module MUST have a single, well-defined purpose.

**Rationale**: High code quality reduces debugging time, improves maintainability, and enables safe refactoring. CloudForge's multi-cloud complexity demands rigorous standards.

### II. Testing Standards

Testing is NON-NEGOTIABLE for production-bound code:

- **Coverage Threshold**: Backend code MUST maintain minimum 80% test coverage. Critical paths (auth, Terraform generation, API endpoints) MUST have 90%+ coverage.
- **Test Types Required**:
  - Unit tests for all services and utility functions
  - Integration tests for API endpoints
  - Contract tests for Terraform generator output
- **Test-Driven Development**: For bug fixes, a failing test MUST be written first that reproduces the bug, then fixed.
- **Test Isolation**: Tests MUST NOT depend on external services or shared state. Use mocks, fixtures, and test databases.
- **CI Gate**: All tests MUST pass in CI before merge. Flaky tests MUST be fixed or quarantined within 24 hours.

**Rationale**: CloudForge generates infrastructure code that deploys real cloud resources. Untested code risks incorrect Terraform output, security vulnerabilities, or cost overruns.

### III. User Experience Consistency

The user interface MUST provide a cohesive, predictable experience:

- **Design System Adherence**: All UI components MUST use the established TailwindCSS classes and component patterns. No inline styles except for dynamic values.
- **Loading States**: Every async operation MUST display a loading indicator. Skeleton loaders preferred over spinners for content areas.
- **Error Handling**: All errors MUST be caught and displayed to users with actionable messages. Technical details MUST be logged but not shown to users.
- **Responsive Design**: All pages MUST function correctly on viewports from 1024px to 2560px width. The designer canvas MUST support zoom and pan.
- **Accessibility Baseline**: Interactive elements MUST be keyboard navigable. Color MUST NOT be the sole indicator of state.
- **Toast Notifications**: System feedback MUST use the Sonner toast library with consistent positioning (bottom-right) and duration (3s info, 5s error).

**Rationale**: CloudForge users are infrastructure engineers making critical decisions. A consistent, reliable UI reduces cognitive load and prevents errors.

### IV. Performance Requirements

Performance standards MUST be met for all features:

- **API Response Times**:
  - Simple CRUD operations: < 200ms p95
  - Terraform generation: < 2s for projects with ≤50 resources
  - Security scans (TFSec/Terrascan): < 10s
- **Frontend Performance**:
  - Initial page load (LCP): < 2.5s
  - React Flow canvas: 60 FPS with up to 100 nodes
  - No memory leaks from unmounted components
- **Database Queries**: No N+1 queries. Use SQLAlchemy relationship loading strategies explicitly.
- **Bundle Size**: Frontend production bundle MUST stay under 500KB gzipped (excluding node_modules chunks).
- **Background Tasks**: Long-running operations (cost estimation, drift detection) MUST use Celery tasks, not block API threads.

**Rationale**: Infrastructure engineers often work under time pressure. Slow tools break flow state and reduce productivity.

## Technology Standards

The following technology constraints ensure consistency and maintainability:

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Celery
- **Frontend**: React 18, TypeScript 5.6+, Zustand for state, React Flow for canvas, TailwindCSS
- **Database**: PostgreSQL 15. No raw SQL except in migrations—use SQLAlchemy ORM.
- **API Design**: RESTful endpoints. JSON request/response bodies. JWT authentication via Bearer token.
- **Terraform Generator**: TypeScript module at `backend/src/terraform/`. Changes require updating both TypeScript and Python integration.
- **New Dependencies**: Adding new npm/pip packages MUST be justified in PR description. Prefer established libraries with active maintenance.

## Development Workflow

All changes MUST follow this workflow:

1. **Branch Naming**: `feature/description`, `fix/description`, or `refactor/description`
2. **Commit Messages**: Use conventional commits format: `type(scope): description`
3. **Pull Requests**:
   - MUST include description of changes and testing performed
   - MUST pass all CI checks (lint, type-check, tests)
   - MUST be reviewed by at least one team member for non-trivial changes
4. **Documentation**: API changes MUST update OpenAPI schemas. UI changes MUST update component documentation if patterns change.
5. **Database Migrations**: Schema changes MUST include Alembic migration. Migrations MUST be reversible.

## Governance

This constitution is the authoritative source for CloudForge development standards:

- **Supersedes**: This constitution supersedes conflicting guidance in READMEs, comments, or ad-hoc decisions.
- **Amendments**: Proposed changes MUST be documented with rationale, reviewed by the team, and versioned according to semantic versioning:
  - MAJOR: Removing or fundamentally changing a principle
  - MINOR: Adding new principles or expanding existing guidance
  - PATCH: Clarifications, typo fixes, non-semantic refinements
- **Compliance**: All pull requests MUST verify adherence to these principles. The plan-template.md Constitution Check section enforces this gate.
- **Exceptions**: Deviations MUST be documented in the Complexity Tracking section of plan.md with justification for why the simpler, compliant approach was insufficient.
- **Guidance File**: For runtime development guidance (commands, project structure, recent changes), see CLAUDE.md at repository root.

**Version**: 1.0.0 | **Ratified**: 2026-01-14 | **Last Amended**: 2026-01-14
