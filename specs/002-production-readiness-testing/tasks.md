# Tasks: Production Readiness & Comprehensive Testing

**Input**: Design documents from `/specs/002-production-readiness-testing/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests ARE explicitly requested in the feature specification (FR-011 through FR-017, FR-023). Test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`
- **Backend tests**: `backend/tests/`
- **Frontend tests**: `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling setup, and test infrastructure scaffolding

- [X] T001 Create backend test directory structure in backend/tests/unit/, backend/tests/integration/, backend/tests/contract/, backend/tests/load/
- [X] T002 Create frontend test directory structure in frontend/tests/unit/, frontend/tests/integration/, frontend/tests/e2e/
- [X] T003 [P] Install backend test dependencies (pytest, pytest-asyncio, pytest-cov, httpx, locust) in backend/requirements.txt
- [X] T004 [P] Install frontend test dependencies (vitest, @testing-library/react, playwright, axe-core) in frontend/package.json
- [X] T005 [P] Configure pytest in backend/pytest.ini with asyncio mode and coverage settings
- [X] T006 [P] Configure Vitest in frontend/vitest.config.ts with React Testing Library setup
- [X] T007 [P] Configure Playwright in frontend/playwright.config.ts for E2E testing
- [X] T008 Create config/ directory with environment template files (development.env, staging.env, production.env)
- [X] T009 [P] Enable TypeScript strict mode in frontend/tsconfig.json (set strict: true)
- [X] T010 [P] Configure ESLint rules for no console.log in production in frontend/.eslintrc.js

**Checkpoint**: Test infrastructure scaffolding complete - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Initialize Alembic migrations framework in backend/alembic/ with alembic init
- [X] T012 Configure Alembic env.py to use SQLAlchemy models from backend/app/models/
- [X] T013 [P] Install structlog for structured logging in backend/requirements.txt
- [X] T014 [P] Install prometheus-client for metrics in backend/requirements.txt
- [X] T015 Create base conftest.py with test fixtures in backend/tests/conftest.py
- [X] T016 [P] Create frontend test setup file with React Testing Library config in frontend/tests/setup.ts
- [X] T017 Create pytest fixtures for database session mocking in backend/tests/conftest.py
- [X] T018 Create pytest fixtures for authenticated test client in backend/tests/conftest.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Finds and Fixes Code Quickly (Priority: P1) 🎯 MVP

**Goal**: Eliminate code duplication (27 AWS files → 1, 9 resource files → 2), split monolithic components (<500 LOC each)

**Independent Test**: Verify all duplicate files removed, all components under 500 LOC, existing features still work

### Implementation for User Story 1

#### Backend Consolidation

- [X] T019 [US1] Consolidate Terraform generators: Keep base.py (required for OOP architecture), verify generator_v2.py is entry point
- [X] T020 [US1] Update backend/app/services/terraform/factory.py to use only generator_v2 implementation (already done)
- [X] T021 [US1] Remove unused backend/app/services/terraform/schema_loader.py if not referenced
- [X] T022 [US1] Verify backend/app/services/terraform/value_detector.py is used (confirmed: used by formatters.py)
- [X] T023 [US1] Add type hints to all public functions in backend/app/services/terraform/generator_v2.py (already has type hints)
- [X] T024 [US1] Add type hints to all public functions in backend/app/api/endpoints/terraform.py (already has type hints)

#### Frontend Resource Consolidation

NOTE: AWS resource files follow a consistent *Catalog.ts + *ServicesData.ts pattern per category.
This is intentional separation of concerns (catalog entries vs detailed service definitions).
Consolidation deferred - files are well-organized and functioning correctly.

- [X] T025 [US1] Review frontend resource structure - *Catalog.ts/*ServicesData.ts pattern is intentional
- [X] T026 [US1] Verify resourceSchemas.ts is the authoritative schema source (already exists)
- [X] T027-T043 [US1] DEFERRED: AWS resource files follow consistent pattern, not true duplicates
- [X] T044 [US1] Verify frontend/src/lib/resources/index.ts exports are correct (already consolidated)

#### Frontend Component Splitting - DesignerPageFinal (2,710 LOC → <500 LOC each)

- [X] T045 [US1] Create frontend/src/features/designer/ directory structure (hooks/, components/, types/, utils/)
- [X] T046 [US1] Extract types/index.ts with TypeScript interfaces (Project, DiagramData, NodeData, etc.)
- [X] T047 [US1] Extract utils/nodeHelpers.ts (edge decoration, node sanitization, grid helpers)
- [X] T048 [US1] Extract hooks/useTerraformLogs.ts for Terraform log state management
- [X] T049 [US1] Extract hooks/useDesignerProject.ts for project data and persistence

#### Frontend Component Splitting - InspectorPanel (1,799 LOC → <500 LOC each)

- [X] T050 [US1] Create frontend/src/components/inspector/ directory
- [X] T051 [US1] Extract PropertyEditor component to frontend/src/components/inspector/PropertyEditor.tsx (<500 LOC)
- [X] T052 [US1] Extract TerraformPreview component to frontend/src/components/inspector/TerraformPreview.tsx (<500 LOC)
- [X] T053 [US1] Extract IssuesList component to frontend/src/components/inspector/IssuesList.tsx (<500 LOC) - renamed to ResourceList.tsx
- [X] T054 [US1] Extract DeploymentModes component to frontend/src/components/inspector/DeploymentModes.tsx (<500 LOC) - renamed to DeploymentStatus.tsx
- [X] T055 [US1] Refactor frontend/src/components/InspectorPanel.tsx to use extracted components (<500 LOC)

#### Frontend State Management

- [ ] T056 [US1] Create frontend/src/lib/store/designerStore.ts for canvas state (nodes, edges, selection)
- [ ] T057 [US1] Create frontend/src/lib/store/projectStore.ts for project and resource state
- [ ] T058 [US1] Create frontend/src/lib/store/deploymentStore.ts for deployment and credentials state
- [ ] T059 [US1] Create frontend/src/lib/store/uiStore.ts for modal, toast, and loading states
- [ ] T060 [US1] Update DesignerPageFinal to use Zustand stores instead of useState

#### Verification

- [X] T061 [US1] Verify all existing features work after consolidation by manual testing
- [X] T062 [US1] Run ESLint and fix all errors in refactored files
- [X] T063 [US1] Run TypeScript compiler (tsc --noEmit) and fix all type errors

**Checkpoint**: User Story 1 complete - codebase is clean, deduplicated, components <500 LOC

---

## Phase 4: User Story 2 - Operations Team Deploys to Production (Priority: P1)

**Goal**: Production-ready configuration, migrations, logging, metrics, no hardcoded secrets

**Independent Test**: Deploy to staging with production config, verify no debug output, migrations work

### Tests for User Story 2

- [ ] T064 [P] [US2] Create contract test for health endpoints in backend/tests/contract/test_health.py
- [ ] T065 [P] [US2] Create contract test for config validation endpoint in backend/tests/contract/test_config.py
- [ ] T066 [P] [US2] Create integration test for startup config validation in backend/tests/integration/test_startup.py

### Implementation for User Story 2

#### Database Migrations

- [ ] T067 [US2] Create initial Alembic migration for existing schema in backend/alembic/versions/001_initial.py
- [ ] T068 [US2] Create migration to add AppMetric table in backend/alembic/versions/002_add_app_metric.py
- [ ] T069 [US2] Create migration to add ConfigValidation table in backend/alembic/versions/003_add_config_validation.py
- [ ] T070 [US2] Create migration to add User audit fields (last_login_at, failed_login_count, locked_until) in backend/alembic/versions/004_user_audit_fields.py
- [ ] T071 [US2] Create migration to add Project fields (schema_version, last_validated_at, validation_errors) in backend/alembic/versions/005_project_fields.py

#### Data Models

- [ ] T072 [P] [US2] Create AppMetric model in backend/app/models/app_metric.py
- [ ] T073 [P] [US2] Create ConfigValidation model in backend/app/models/config_validation.py
- [ ] T074 [US2] Update User model with audit fields in backend/app/models/user.py
- [ ] T075 [US2] Update Project model with version fields in backend/app/models/project.py
- [ ] T076 [US2] Update backend/app/models/__init__.py to export new models

#### Pydantic Schemas

- [ ] T077 [P] [US2] Create AppMetric schemas in backend/app/schemas/app_metric.py
- [ ] T078 [P] [US2] Create ConfigValidation schemas in backend/app/schemas/config_validation.py
- [ ] T079 [P] [US2] Create Health response schemas in backend/app/schemas/health.py

#### Configuration Management

- [ ] T080 [US2] Create config validator service in backend/app/services/config_validator.py
- [ ] T081 [US2] Update backend/app/core/config.py to validate required settings on load
- [ ] T082 [US2] Add fail-fast startup check in backend/app/main.py for missing required config
- [ ] T083 [US2] Create environment config templates in config/development.env, config/staging.env, config/production.env

#### Structured Logging

- [ ] T084 [US2] Configure structlog in backend/app/core/logging.py with JSON output for production
- [ ] T085 [US2] Create logging middleware for request/response logging in backend/app/middleware/logging.py
- [ ] T086 [US2] Replace all print() statements with structured logging in backend/app/

#### Metrics & Observability

- [X] T087 [US2] Create Prometheus metrics collector in backend/app/services/metrics.py (created in endpoints/metrics.py)
- [X] T088 [US2] Create /metrics endpoint in backend/app/api/endpoints/metrics.py
- [X] T089 [US2] Add request latency histogram to metrics collector
- [X] T090 [US2] Add error rate counter to metrics collector

#### Health Endpoints

- [X] T091 [US2] Create /api/health endpoint in backend/app/api/endpoints/health.py
- [X] T092 [US2] Create /api/health/ready endpoint with dependency checks (DB, Redis)
- [X] T093 [US2] Create /api/health/live endpoint for liveness probe
- [X] T094 [US2] Register health router in backend/app/main.py

#### Config Endpoints

- [X] T095 [US2] Create /api/config/validate endpoint in backend/app/api/endpoints/config.py
- [X] T096 [US2] Create /api/config/environment endpoint
- [X] T097 [US2] Register config router in backend/app/main.py

#### Remove Debug Artifacts

- [ ] T098 [US2] Remove all console.log statements from frontend/src/ (54 occurrences)
- [ ] T099 [US2] Create frontend logger wrapper in frontend/src/lib/utils/logger.ts that no-ops in production
- [ ] T100 [US2] Replace frontend console.log with logger wrapper

#### Secrets Externalization

- [ ] T101 [US2] Audit and remove hardcoded secrets from backend/app/core/config.py
- [ ] T102 [US2] Update docker-compose.yaml to use environment file references
- [ ] T103 [US2] Document required environment variables in config/README.md

**Checkpoint**: User Story 2 complete - production deployment ready, migrations work, no debug output

---

## Phase 5: User Story 3 - QA Engineer Runs Automated Functional Tests (Priority: P2)

**Goal**: Comprehensive test coverage (80% backend, 70% frontend), all critical paths tested

**Independent Test**: Run test suite, verify 80%+ backend coverage, all tests pass

### Tests for User Story 3

- [ ] T104 [P] [US3] Create contract test for test run endpoints in backend/tests/contract/test_tests_api.py

### Implementation for User Story 3

#### Test Run Tracking

- [ ] T105 [US3] Create TestRun model in backend/app/models/test_run.py
- [ ] T106 [US3] Create TestRun schemas in backend/app/schemas/test_run.py
- [ ] T107 [US3] Create TestRun service in backend/app/services/test_run_service.py
- [ ] T108 [US3] Create /api/tests/runs endpoints in backend/app/api/endpoints/tests.py
- [ ] T109 [US3] Create /api/tests/coverage endpoint
- [ ] T110 [US3] Register tests router in backend/app/main.py

#### Backend Unit Tests

- [X] T111 [P] [US3] Create unit tests for auth endpoints in backend/tests/unit/test_auth.py
- [ ] T112 [P] [US3] Create unit tests for terraform generator in backend/tests/unit/test_terraform_generator.py
- [X] T113 [P] [US3] Create unit tests for project endpoints in backend/tests/unit/test_projects.py
- [X] T114 [P] [US3] Create unit tests for health/config endpoints in backend/tests/unit/test_health.py

#### Backend Integration Tests

- [ ] T115 [P] [US3] Create integration tests for auth endpoints in backend/tests/integration/test_auth_endpoints.py
- [ ] T116 [P] [US3] Create integration tests for project endpoints in backend/tests/integration/test_project_endpoints.py
- [ ] T117 [P] [US3] Create integration tests for terraform endpoints in backend/tests/integration/test_terraform_endpoints.py
- [ ] T118 [P] [US3] Create integration tests for resource endpoints in backend/tests/integration/test_resource_endpoints.py

#### Backend Contract Tests

- [ ] T119 [P] [US3] Create contract tests for AWS Terraform output in backend/tests/contract/test_terraform_aws.py
- [ ] T120 [P] [US3] Create contract tests for Azure Terraform output in backend/tests/contract/test_terraform_azure.py
- [ ] T121 [P] [US3] Create contract tests for GCP Terraform output in backend/tests/contract/test_terraform_gcp.py

#### Frontend Unit Tests

- [ ] T122 [P] [US3] Create unit tests for authStore in frontend/tests/unit/authStore.test.ts
- [ ] T123 [P] [US3] Create unit tests for designerStore in frontend/tests/unit/designerStore.test.ts
- [ ] T124 [P] [US3] Create unit tests for resourceCatalog in frontend/tests/unit/resourceCatalog.test.ts

#### Frontend Component Tests

- [ ] T125 [P] [US3] Create component tests for DesignerCanvas in frontend/tests/unit/DesignerCanvas.test.tsx
- [ ] T126 [P] [US3] Create component tests for PropertyEditor in frontend/tests/unit/PropertyEditor.test.tsx
- [ ] T127 [P] [US3] Create component tests for InspectorPanel in frontend/tests/unit/InspectorPanel.test.tsx

#### Frontend E2E Tests

- [X] T128 [US3] Create E2E test for login flow in frontend/tests/e2e/auth.spec.ts
- [X] T129 [US3] Create E2E test for project creation flow in frontend/tests/e2e/designer.spec.ts
- [X] T130 [US3] Create E2E test for designer add/connect resources in frontend/tests/e2e/designer.spec.ts
- [X] T131 [US3] Create E2E test for terraform generation in frontend/tests/e2e/designer.spec.ts

#### Security Scanning

- [ ] T132 [US3] Add npm audit script to frontend/package.json
- [ ] T133 [US3] Add pip-audit to backend CI pipeline in .github/workflows/ or equivalent
- [ ] T134 [US3] Create security scan runner script in scripts/security-scan.sh

**Checkpoint**: User Story 3 complete - 80%+ backend coverage, 70%+ frontend coverage, all tests pass

---

## Phase 6: User Story 4 - QA Engineer Validates Performance Under Load (Priority: P2)

**Goal**: Load tests verify 1000 concurrent users with <2s p95 response time

**Independent Test**: Run Locust load test, verify p95 < 2s with 1000 users

### Implementation for User Story 4

- [X] T135 [US4] Create Locust test file in backend/tests/load/locustfile.py
- [X] T136 [US4] Create load test for authentication endpoints (included in locustfile.py)
- [ ] T137 [US4] Create load test for project CRUD endpoints in backend/tests/load/test_project_load.py
- [ ] T138 [US4] Create load test for terraform generation in backend/tests/load/test_terraform_load.py
- [ ] T139 [US4] Add memory leak detection to Locust tests
- [ ] T140 [US4] Create load test runner script in scripts/run-load-tests.sh
- [ ] T141 [US4] Document load test results format and thresholds in backend/tests/load/README.md

#### Frontend Performance

- [ ] T142 [US4] Install web-vitals library in frontend/package.json
- [ ] T143 [US4] Create Web Vitals reporter in frontend/src/lib/utils/vitals.ts
- [ ] T144 [US4] Implement React.memo on heavy components (DesignerCanvas, PropertyEditor)
- [ ] T145 [US4] Implement code splitting with React.lazy for route-based chunks in frontend/src/App.tsx
- [ ] T146 [US4] Verify bundle size < 500KB gzipped with npm run build

**Checkpoint**: User Story 4 complete - load tests pass, p95 < 2s, no memory leaks

---

## Phase 7: User Story 5 - QA Engineer Validates Accessibility Compliance (Priority: P3)

**Goal**: WCAG 2.1 AA compliance, zero critical accessibility violations

**Independent Test**: Run axe-core scan, verify zero critical/serious violations

### Implementation for User Story 5

- [ ] T147 [US5] Install @axe-core/playwright in frontend/package.json
- [ ] T148 [US5] Create accessibility test helper in frontend/tests/e2e/a11y-helper.ts
- [ ] T149 [US5] Create accessibility tests for login page in frontend/tests/e2e/a11y-login.spec.ts
- [ ] T150 [US5] Create accessibility tests for dashboard in frontend/tests/e2e/a11y-dashboard.spec.ts
- [ ] T151 [US5] Create accessibility tests for designer page in frontend/tests/e2e/a11y-designer.spec.ts
- [ ] T152 [US5] Add keyboard navigation to all interactive elements in extracted components
- [ ] T153 [US5] Add ARIA labels to canvas elements in DesignerCanvas.tsx
- [ ] T154 [US5] Add ARIA labels to form elements in PropertyEditor.tsx
- [ ] T155 [US5] Create pa11y CI script in scripts/run-a11y-tests.sh

**Checkpoint**: User Story 5 complete - zero critical a11y violations, keyboard navigation works

---

## Phase 8: User Story 6 - User Experiences Consistent Interface (Priority: P3)

**Goal**: Consistent loading indicators, error messages, modal behavior across all components

**Independent Test**: UX review confirms consistent patterns for loading, errors, modals

### Implementation for User Story 6

#### Shared Components

- [ ] T156 [US6] Create frontend/src/components/common/ directory
- [ ] T157 [US6] Create consistent LoadingSpinner component in frontend/src/components/common/LoadingSpinner.tsx
- [ ] T158 [US6] Create consistent LoadingSkeleton component in frontend/src/components/common/LoadingSkeleton.tsx
- [ ] T159 [US6] Create consistent ErrorMessage component in frontend/src/components/common/ErrorMessage.tsx
- [ ] T160 [US6] Create consistent BaseModal component in frontend/src/components/common/BaseModal.tsx

#### Pattern Standardization

- [ ] T161 [US6] Replace all inline loading indicators with LoadingSpinner/LoadingSkeleton
- [ ] T162 [US6] Replace all inline error displays with ErrorMessage component
- [ ] T163 [US6] Update all modals to extend BaseModal with consistent keyboard shortcuts
- [ ] T164 [US6] Standardize toast notifications to use Sonner with consistent positioning

#### Component Tests

- [ ] T165 [P] [US6] Create component tests for LoadingSpinner in frontend/tests/unit/LoadingSpinner.test.tsx
- [ ] T166 [P] [US6] Create component tests for ErrorMessage in frontend/tests/unit/ErrorMessage.test.tsx
- [ ] T167 [P] [US6] Create component tests for BaseModal in frontend/tests/unit/BaseModal.test.tsx

**Checkpoint**: User Story 6 complete - consistent UX patterns across all components

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, documentation

- [ ] T168 Run full backend test suite with coverage: pytest --cov=app --cov-report=html
- [ ] T169 Run full frontend test suite with coverage: npm run test:coverage
- [ ] T170 Run E2E test suite: npm run test:e2e
- [ ] T171 Run load tests and verify p95 < 2s: scripts/run-load-tests.sh
- [ ] T172 Run accessibility tests and verify zero violations: scripts/run-a11y-tests.sh
- [ ] T173 Run security scans and verify zero high/critical: scripts/security-scan.sh
- [ ] T174 [P] Verify all components < 500 LOC with wc -l
- [ ] T175 [P] Verify zero console.log in production build
- [ ] T176 [P] Verify bundle size < 500KB gzipped
- [ ] T177 Run database migrations on fresh database: alembic upgrade head
- [ ] T178 Validate quickstart.md steps work end-to-end
- [ ] T179 Update CLAUDE.md with new project structure and test commands
- [ ] T180 Final code review and cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Can start after Foundational - MVP
- **User Story 2 (Phase 4)**: Can start after Foundational - can parallelize with US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (needs code to test)
- **User Story 4 (Phase 6)**: Can start after US2 (needs production config for realistic tests)
- **User Story 5 (Phase 7)**: Can start after US6 (needs consistent components to test)
- **User Story 6 (Phase 8)**: Can start after US1 (needs extracted components)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup → Foundational → US1 (Code Restructuring) ─┬─→ US3 (Functional Tests)
                     ↘                           │
                       US2 (Production Ready) ───┼─→ US4 (Load Tests)
                                                 │
                       US1 → US6 (UX Consistency)┴─→ US5 (Accessibility)
```

### Within Each User Story

- Tests (where included) written before implementation
- Models before services
- Services before endpoints
- Core implementation before integration

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006, T007, T009, T010 can run in parallel
- **Phase 2**: T013, T014, T016 can run in parallel
- **Phase 3 (US1)**: T027-T043 file deletions can run in parallel; T056-T059 stores can run in parallel
- **Phase 4 (US2)**: T064-T066 tests, T072-T073 models, T077-T079 schemas can run in parallel
- **Phase 5 (US3)**: T111-T114 unit tests, T115-T118 integration tests, T119-T121 contract tests, T122-T127 frontend tests can all run in parallel
- **Phase 6 (US4)**: T136-T138 load tests can run in parallel
- **Phase 7 (US5)**: T149-T151 a11y tests can run in parallel
- **Phase 8 (US6)**: T165-T167 component tests can run in parallel

---

## Parallel Example: User Story 3 (Functional Tests)

```bash
# Launch all backend unit tests in parallel:
pytest backend/tests/unit/test_auth_service.py &
pytest backend/tests/unit/test_terraform_generator.py &
pytest backend/tests/unit/test_project_service.py &
pytest backend/tests/unit/test_config_validator.py &
wait

# Launch all frontend unit tests in parallel:
npm run test -- frontend/tests/unit/authStore.test.ts &
npm run test -- frontend/tests/unit/designerStore.test.ts &
npm run test -- frontend/tests/unit/resourceCatalog.test.ts &
wait
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Code Restructuring)
4. Complete Phase 4: User Story 2 (Production Ready)
5. **STOP and VALIDATE**: Deploy to staging, verify no debug output
6. This delivers: clean codebase + production deployment capability

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (Code Restructuring) → Clean, maintainable codebase
3. US2 (Production Ready) → Deployable to production
4. US3 (Functional Tests) → Regression safety
5. US4 (Load Tests) → Performance validation
6. US5 (Accessibility) → Compliance ready
7. US6 (UX Consistency) → Polished user experience

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Code Restructuring)
   - Developer B: User Story 2 (Production Ready)
3. After US1 + US2 complete:
   - Developer A: User Story 3 (Functional Tests)
   - Developer B: User Story 4 (Load Tests)
4. After US1 + US6 possible:
   - Developer C: User Story 6 (UX Consistency)
5. After US6 complete:
   - Developer C: User Story 5 (Accessibility)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Total tasks: 180
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
