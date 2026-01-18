# Tasks: Full Testing Infrastructure & CI/CD Pipeline

**Input**: Design documents from `/specs/003-testing-infrastructure-cicd/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are integral to this feature (it IS the testing infrastructure). Each user story phase includes the test implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (Python/FastAPI)
- **Frontend**: `frontend/` (React/TypeScript)
- **CI/CD**: `.github/workflows/`
- **Scripts**: `scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test infrastructure foundation

- [ ] T001 Create backend test directory structure: `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/contract/`
- [ ] T002 Create frontend test directory structure: `frontend/tests/unit/`, `frontend/tests/e2e/`, `frontend/tests/a11y/`
- [ ] T003 [P] Create backend test configuration in `backend/tests/pytest.ini`
- [ ] T004 [P] Create shared pytest fixtures in `backend/tests/conftest.py`
- [ ] T005 [P] Update `backend/requirements.txt` with test dependencies (pytest-asyncio, pytest-cov, faker)
- [ ] T006 [P] Update `frontend/package.json` with test scripts (test, test:coverage, test:watch, test:ui)
- [ ] T007 Create scripts directory structure: `scripts/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Configure Vitest in `frontend/vitest.config.ts` with coverage settings and 80% threshold
- [ ] T009 [P] Configure Playwright in `frontend/playwright.config.ts` with browser targets (chromium, firefox, webkit)
- [ ] T010 [P] Create `.github/workflows/` directory structure
- [ ] T011 [P] Create backend test environment configuration in `backend/tests/.env.test`
- [ ] T012 Verify SQLite test database configuration in `backend/app/core/database.py` (already implemented)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Runs Local Test Suite (Priority: P1) 🎯 MVP

**Goal**: Developers can run comprehensive tests locally before committing code with clear feedback within 5 minutes

**Independent Test**: Run `pytest backend/tests/unit -v` and `npm run test` in frontend - both complete within 2 minutes each with clear pass/fail output

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create backend unit test runner script in `scripts/test-backend.sh`
- [ ] T014 [P] [US1] Create frontend unit test runner script in `scripts/test-frontend.sh`
- [ ] T015 [P] [US1] Implement auth store tests in `frontend/tests/unit/authStore.test.ts`
- [ ] T016 [P] [US1] Implement theme store tests in `frontend/tests/unit/themeStore.test.ts`
- [ ] T017 [P] [US1] Implement project store tests in `frontend/tests/unit/projectStore.test.ts`
- [ ] T018 [P] [US1] Implement designer store tests in `frontend/tests/unit/designerStore.test.ts`
- [ ] T019 [P] [US1] Implement projects API unit tests in `backend/tests/unit/test_projects.py`
- [ ] T020 [P] [US1] Implement terraform generator unit tests in `backend/tests/unit/test_terraform_generator.py`
- [ ] T021 [P] [US1] Implement auth service unit tests in `backend/tests/unit/test_auth.py`
- [ ] T022 [P] [US1] Implement resource service unit tests in `backend/tests/unit/test_resources.py`
- [ ] T023 [US1] Create combined test runner script in `scripts/test-all.sh`
- [ ] T024 [US1] Add coverage reporting to backend tests with 80% threshold enforcement
- [ ] T025 [US1] Add coverage reporting to frontend tests with 80% threshold enforcement

**Checkpoint**: At this point, developers can run full local test suite and receive results within 5 minutes

---

## Phase 4: User Story 2 - Automated CI Pipeline Validates Pull Requests (Priority: P1)

**Goal**: PRs automatically trigger CI validation with lint, typecheck, unit tests, integration tests, and security scans blocking merge on failure

**Independent Test**: Create a PR and verify all pipeline stages execute in correct order within 15 minutes, with merge blocked on failures

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create CI workflow file `.github/workflows/ci.yml` with lint stage
- [ ] T027 [US2] Add backend lint job to `.github/workflows/ci.yml` (flake8, black, mypy)
- [ ] T028 [US2] Add frontend lint job to `.github/workflows/ci.yml` (eslint, tsc)
- [ ] T029 [US2] Add backend unit test job to `.github/workflows/ci.yml` with coverage upload
- [ ] T030 [US2] Add frontend unit test job to `.github/workflows/ci.yml` with coverage upload
- [ ] T031 [US2] Add integration test job to `.github/workflows/ci.yml` with PostgreSQL/Redis services
- [ ] T032 [P] [US2] Create backend integration tests in `backend/tests/integration/test_api_projects.py`
- [ ] T033 [P] [US2] Create backend integration tests in `backend/tests/integration/test_api_terraform.py`
- [ ] T034 [P] [US2] Create backend integration tests in `backend/tests/integration/test_api_auth.py`
- [ ] T035 [US2] Add build verification job to `.github/workflows/ci.yml`
- [ ] T036 [US2] Add CI completion gate job to `.github/workflows/ci.yml` for merge blocking
- [ ] T037 [US2] Configure concurrency and cancel-in-progress settings in CI workflow
- [ ] T038 [US2] Add artifact upload steps for coverage reports (30-day retention)

**Checkpoint**: At this point, all PRs are validated automatically with clear status indicators

---

## Phase 5: User Story 3 - QA Engineer Runs E2E Tests (Priority: P2)

**Goal**: QA can run end-to-end browser tests validating complete user workflows across Chrome, Firefox, and Safari with screenshot/trace capture on failure

**Independent Test**: Run `npx playwright test` against running application - tests execute browser automation for critical workflows within 20 minutes

### Implementation for User Story 3

- [ ] T039 [P] [US3] Create E2E test for authentication flow in `frontend/tests/e2e/auth.spec.ts`
- [ ] T040 [P] [US3] Create E2E test for project creation flow in `frontend/tests/e2e/project.spec.ts`
- [ ] T041 [P] [US3] Create E2E test for designer workflow in `frontend/tests/e2e/designer.spec.ts`
- [ ] T042 [P] [US3] Create E2E test for terraform generation in `frontend/tests/e2e/terraform.spec.ts`
- [ ] T043 [US3] Create E2E test runner script in `scripts/test-e2e.sh`
- [ ] T044 [US3] Add E2E test job to `.github/workflows/ci.yml` with Docker Compose setup
- [ ] T045 [US3] Configure screenshot and trace capture on test failure in `frontend/playwright.config.ts`
- [ ] T046 [US3] Add E2E artifact upload step for debugging (screenshots, traces, reports)
- [ ] T047 [US3] Configure multi-browser testing in Playwright (chromium, firefox, webkit)

**Checkpoint**: At this point, complete user workflows are validated via browser automation

---

## Phase 6: User Story 4 - Performance Engineer Validates System Capacity (Priority: P2)

**Goal**: Engineers can run load tests simulating 500+ concurrent users with real-time metrics (response times, throughput, error rates) and percentile reporting

**Independent Test**: Run Locust against staging - virtual users hit endpoints, dashboard shows real-time metrics, report shows p50/p95/p99 response times

### Implementation for User Story 4

- [ ] T048 [P] [US4] Create Locust configuration in `backend/locust/config.py`
- [ ] T049 [US4] Create Locust test scenarios in `backend/locust/locustfile.py` (auth, projects, terraform)
- [ ] T050 [US4] Add API endpoint scenarios for authentication in `backend/locust/locustfile.py`
- [ ] T051 [US4] Add API endpoint scenarios for project CRUD in `backend/locust/locustfile.py`
- [ ] T052 [US4] Add API endpoint scenarios for terraform generation in `backend/locust/locustfile.py`
- [ ] T053 [US4] Create load test runner script in `scripts/load-test.sh`
- [ ] T054 [US4] Configure response time thresholds (p95 < 200ms for CRUD, p95 < 2s for terraform)
- [ ] T055 [US4] Add load test job to CD workflow in `.github/workflows/cd.yml` (on-demand)

**Checkpoint**: At this point, system capacity can be validated with 500+ concurrent user simulation

---

## Phase 7: User Story 5 - Security Engineer Runs Vulnerability Scans (Priority: P2)

**Goal**: Automated security scans identify vulnerabilities in dependencies and Terraform configurations with severity-based pipeline blocking (CRITICAL/HIGH block)

**Independent Test**: Run security scans - pip-audit, npm audit, TFSec produce reports with severity levels and remediation guidance

### Implementation for User Story 5

- [ ] T056 [P] [US5] Create security scan script in `scripts/security-scan.sh`
- [ ] T057 [US5] Add pip-audit scan step to security script for Python dependencies
- [ ] T058 [US5] Add npm audit scan step to security script for Node.js dependencies
- [ ] T059 [US5] Add TFSec scan step for Terraform configuration security
- [ ] T060 [US5] Add Terrascan scan step for policy compliance
- [ ] T061 [US5] Add backend security scan job to `.github/workflows/ci.yml`
- [ ] T062 [US5] Add frontend security scan job to `.github/workflows/ci.yml`
- [ ] T063 [US5] Add Terraform security scan job to `.github/workflows/ci.yml`
- [ ] T064 [US5] Configure CRITICAL/HIGH severity blocking in CI workflow
- [ ] T065 [US5] Configure MEDIUM/LOW severity as warnings (non-blocking)
- [ ] T066 [US5] Add security report artifact upload (30-day retention)

**Checkpoint**: At this point, security vulnerabilities are automatically detected with appropriate blocking

---

## Phase 8: User Story 6 - Accessibility Tester Validates WCAG Compliance (Priority: P3)

**Goal**: Automated accessibility tests scan all pages for WCAG 2.1 AA violations with element-specific reports and impact levels

**Independent Test**: Run accessibility tests - axe-core analyzes pages, violations reported with element selectors, impact levels, and remediation guidance

### Implementation for User Story 6

- [ ] T067 [P] [US6] Install @axe-core/playwright in frontend dependencies
- [ ] T068 [P] [US6] Create accessibility test for login page in `frontend/tests/a11y/login.spec.ts`
- [ ] T069 [P] [US6] Create accessibility test for dashboard in `frontend/tests/a11y/dashboard.spec.ts`
- [ ] T070 [P] [US6] Create accessibility test for designer in `frontend/tests/a11y/designer.spec.ts`
- [ ] T071 [US6] Create accessibility test runner script in `scripts/test-a11y.sh`
- [ ] T072 [US6] Add accessibility test helper function for axe-core integration in `frontend/tests/a11y/helpers.ts`
- [ ] T073 [US6] Add accessibility test job to CI workflow (warning, non-blocking)
- [ ] T074 [US6] Configure WCAG 2.1 AA rule set in accessibility tests

**Checkpoint**: At this point, accessibility violations are automatically detected and reported

---

## Phase 9: User Story 7 - Release Manager Deploys to Production (Priority: P3)

**Goal**: Controlled deployment to production with staging validation, smoke tests, approval gates, and automatic rollback on health check failure

**Independent Test**: Merge to main triggers staging deploy → smoke tests pass → production approval gate appears → approval triggers production deploy with health checks

### Implementation for User Story 7

- [ ] T075 [P] [US7] Create CD workflow file `.github/workflows/cd.yml` with CI validation
- [ ] T076 [US7] Add Docker image build job to CD workflow
- [ ] T077 [US7] Add staging deployment job to CD workflow (automatic trigger)
- [ ] T078 [US7] Create smoke test script in `scripts/smoke-test.sh`
- [ ] T079 [US7] Add smoke test job to CD workflow (health check, API test, frontend test)
- [ ] T080 [US7] Add production deployment job with environment protection rules
- [ ] T081 [US7] Configure maintainer/admin approval requirement for production environment
- [ ] T082 [US7] Add production health check step with rollback on failure
- [ ] T083 [US7] Add rollback job to CD workflow (manual trigger)
- [ ] T084 [US7] Configure 24-hour approval gate expiration
- [ ] T085 [US7] Add deployment notification job (success/failure status)

**Checkpoint**: At this point, full CI/CD pipeline with approval gates is operational

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T086 [P] Update `specs/003-testing-infrastructure-cicd/quickstart.md` with actual command examples
- [ ] T087 [P] Create test data fixtures in `backend/tests/fixtures/`
- [ ] T088 Verify all test scripts are executable and cross-platform compatible
- [ ] T089 Run full test suite and verify < 15 minute CI completion target
- [ ] T090 Validate 80% coverage threshold is enforced in CI
- [ ] T091 Create TESTING.md documentation at repository root
- [ ] T092 Verify artifact retention (30 days) is configured correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 & US2 (P1): Should complete first (MVP)
  - US3, US4, US5 (P2): Can proceed in parallel after MVP
  - US6, US7 (P3): Can proceed after P2 priorities
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Benefits from US1 tests but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Uses CI workflow from US2
- **User Story 4 (P2)**: Can start after Foundational - Independent of other stories
- **User Story 5 (P2)**: Can start after Foundational - Adds to CI workflow from US2
- **User Story 6 (P3)**: Can start after Foundational - Independent of other stories
- **User Story 7 (P3)**: Depends on US2 CI workflow - Builds on CI for CD pipeline

### Within Each User Story

- Configuration before tests
- Tests before CI/CD integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes, multiple user stories can start in parallel
- Within each story, tasks marked [P] can run in parallel
- US1 & US2 can largely proceed in parallel (both P1)
- US3, US4, US5, US6 can all proceed in parallel (after US2 CI baseline)

---

## Parallel Example: User Story 1

```bash
# Launch all unit test file implementations in parallel:
Task: "Implement auth store tests in frontend/tests/unit/authStore.test.ts"
Task: "Implement theme store tests in frontend/tests/unit/themeStore.test.ts"
Task: "Implement project store tests in frontend/tests/unit/projectStore.test.ts"
Task: "Implement designer store tests in frontend/tests/unit/designerStore.test.ts"
Task: "Implement projects API unit tests in backend/tests/unit/test_projects.py"
Task: "Implement terraform generator unit tests in backend/tests/unit/test_terraform_generator.py"
```

## Parallel Example: User Story 5

```bash
# Launch all security scan jobs in parallel:
Task: "Add backend security scan job to .github/workflows/ci.yml"
Task: "Add frontend security scan job to .github/workflows/ci.yml"
Task: "Add Terraform security scan job to .github/workflows/ci.yml"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Local Testing)
4. Complete Phase 4: User Story 2 (CI Pipeline)
5. **STOP and VALIDATE**: Test CI pipeline with a real PR
6. Deploy/demo if ready - developers can now test locally and PRs are validated

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Local Tests) → Developers can test locally (MVP Part 1)
3. Add US2 (CI Pipeline) → PRs are validated (MVP Part 2)
4. Add US3 (E2E Tests) → Complete user workflows validated
5. Add US4 (Load Tests) → Performance validation available
6. Add US5 (Security) → Vulnerability scanning active
7. Add US6 (Accessibility) → WCAG compliance verified
8. Add US7 (CD Pipeline) → Full deployment automation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Local Tests)
   - Developer B: User Story 2 (CI Pipeline)
3. After US1 & US2 complete:
   - Developer A: User Story 3 (E2E) + User Story 6 (A11y)
   - Developer B: User Story 5 (Security) + User Story 7 (CD)
   - Developer C: User Story 4 (Performance)
4. Stories complete and integrate independently

---

## Summary

| Phase | User Story | Priority | Tasks | Parallel Tasks |
|-------|------------|----------|-------|----------------|
| 1 | Setup | - | 7 | 4 |
| 2 | Foundational | - | 5 | 3 |
| 3 | US1: Local Testing | P1 | 13 | 10 |
| 4 | US2: CI Pipeline | P1 | 13 | 3 |
| 5 | US3: E2E Tests | P2 | 9 | 4 |
| 6 | US4: Performance | P2 | 8 | 1 |
| 7 | US5: Security | P2 | 11 | 1 |
| 8 | US6: Accessibility | P3 | 8 | 4 |
| 9 | US7: CD Pipeline | P3 | 11 | 1 |
| 10 | Polish | - | 7 | 2 |
| **Total** | | | **92** | **33** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- MVP scope: US1 + US2 = 38 tasks (41% of total) delivering core testing + CI
