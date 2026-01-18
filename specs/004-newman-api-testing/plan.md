# Implementation Plan: Newman API Testing Suite

**Branch**: `004-newman-api-testing` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-newman-api-testing/spec.md`

## Summary

Implement comprehensive API testing for CloudForge using Postman collections executed via Newman CLI. The solution will cover all 50+ API endpoints with schema validation, automated authentication token handling, response time assertions, and multi-environment support. Tests integrate with GitHub Actions CI pipeline for automated PR validation.

## Technical Context

**Language/Version**: JavaScript/Node.js 20 (Newman CLI), JSON (Postman collections)
**Primary Dependencies**: Newman (Postman CLI runner), newman-reporter-htmlextra, ajv (JSON schema validation)
**Storage**: N/A (test artifacts stored in CI)
**Testing**: Newman CLI with Postman test scripts
**Target Platform**: GitHub Actions CI (ubuntu-latest), local development (cross-platform)
**Project Type**: Testing infrastructure (extends existing web application)
**Performance Goals**: Full test suite completes in <5 minutes, individual endpoint tests <2s response time
**Constraints**: Must integrate with existing CI workflows, no modifications to production API code
**Scale/Scope**: 50+ API endpoints across 9 endpoint groups

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Compliance | Notes |
|-----------|-------------|------------|-------|
| I. Code Quality First | Type safety, linting, DRY | PASS | Postman collection JSON follows schema, test scripts use consistent patterns |
| II. Testing Standards | 80% coverage, test types, CI gate | PASS | This feature implements API testing per constitution requirement |
| III. User Experience Consistency | N/A | N/A | No UI components |
| IV. Performance Requirements | API <200ms CRUD, <2s Terraform | PASS | Test assertions validate these thresholds |
| Technology Standards | Python/FastAPI backend, React frontend | PASS | Testing layer only, no changes to stack |
| Development Workflow | Branch naming, conventional commits, CI | PASS | Tests integrate with existing CI workflow |

**Gate Status**: PASS - All applicable principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/004-newman-api-testing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── newman-workflow.yml      # GitHub Actions workflow contract
│   └── collection-schema.json   # Postman collection structure
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# API Testing Infrastructure
postman/
├── collections/
│   ├── cloudforge-api.postman_collection.json    # Main collection
│   └── schemas/                                   # JSON schemas for validation
│       ├── auth.schema.json
│       ├── projects.schema.json
│       ├── resources.schema.json
│       ├── terraform.schema.json
│       └── common.schema.json
├── environments/
│   ├── local.postman_environment.json
│   ├── staging.postman_environment.json
│   └── production.postman_environment.json
└── scripts/
    └── run-tests.sh                               # Local test runner

.github/workflows/
└── api-tests.yml                                  # Newman CI workflow (new)
```

**Structure Decision**: Dedicated `postman/` directory at repository root for all API testing assets. This keeps test infrastructure separate from application code while remaining easily discoverable. Collections organized by purpose, environments by target.

## Complexity Tracking

No constitution violations - implementation follows established patterns.
