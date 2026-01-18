# Tasks: Newman API Testing Suite

**Input**: Design documents from `/specs/004-newman-api-testing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Postman assets**: `postman/collections/`, `postman/environments/`, `postman/scripts/`
- **CI workflows**: `.github/workflows/`
- **JSON schemas**: `postman/collections/schemas/`

---

## Phase 1: Setup (Directory Structure)

**Purpose**: Initialize project structure and install dependencies

- [ ] T001 Create postman directory structure: `postman/collections/`, `postman/environments/`, `postman/scripts/`, `postman/collections/schemas/`
- [ ] T002 [P] Create .gitignore entries for sensitive environment files in `postman/.gitignore`
- [ ] T003 [P] Add Newman dependencies to package.json or create standalone package.json in `postman/package.json`

---

## Phase 2: Foundational (Collection Infrastructure)

**Purpose**: Core collection structure and authentication that ALL endpoint tests depend on

**CRITICAL**: No endpoint tests can work until this phase is complete

- [ ] T004 Create base Postman collection with metadata in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T005 Implement collection-level pre-request authentication script with token caching in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T006 [P] Create common JSON schema definitions (error responses, pagination) in `postman/collections/schemas/common.schema.json`
- [ ] T007 [P] Create local environment configuration in `postman/environments/local.postman_environment.json`
- [ ] T008 [P] Create staging environment configuration in `postman/environments/staging.postman_environment.json`
- [ ] T009 [P] Create production environment configuration (read-only) in `postman/environments/production.postman_environment.json`
- [ ] T010 Create test runner shell script in `postman/scripts/run-tests.sh`

**Checkpoint**: Foundation ready - endpoint tests can now be added

---

## Phase 3: User Story 1 - CI Pipeline Integration (Priority: P1) MVP

**Goal**: API tests run automatically on every PR with pass/fail reporting

**Independent Test**: Trigger CI build and verify Newman executes and reports results in pipeline output

### Implementation for User Story 1

- [ ] T011 [US1] Create GitHub Actions workflow for Newman tests in `.github/workflows/api-tests.yml`
- [ ] T012 [US1] Configure workflow to spin up backend service using Docker Compose in `.github/workflows/api-tests.yml`
- [ ] T013 [US1] Add JUnit XML reporter configuration for CI integration in `.github/workflows/api-tests.yml`
- [ ] T014 [US1] Add HTML report artifact upload to workflow in `.github/workflows/api-tests.yml`
- [ ] T015 [US1] Add health check wait step before running tests in `.github/workflows/api-tests.yml`

**Checkpoint**: CI pipeline runs Newman tests and reports results

---

## Phase 4: User Story 2 - Schema Validation (Priority: P1)

**Goal**: All API responses validated against JSON schemas to catch breaking changes

**Independent Test**: Run test suite and verify schema validation errors are reported for malformed responses

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create auth response schema in `postman/collections/schemas/auth.schema.json`
- [ ] T017 [P] [US2] Create project response schema in `postman/collections/schemas/projects.schema.json`
- [ ] T018 [P] [US2] Create resource response schema in `postman/collections/schemas/resources.schema.json`
- [ ] T019 [P] [US2] Create terraform response schema in `postman/collections/schemas/terraform.schema.json`
- [ ] T020 [P] [US2] Create health response schema in `postman/collections/schemas/health.schema.json`
- [ ] T021 [US2] Add schema loading to collection variables in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T022 [US2] Add schema validation test scripts to all requests in `postman/collections/cloudforge-api.postman_collection.json`

**Checkpoint**: All endpoint responses validated against schemas

---

## Phase 5: User Story 3 - Authentication Testing (Priority: P1)

**Goal**: Protected endpoints tested with automatic token handling

**Independent Test**: Run tests against authenticated endpoints and verify successful auth and response validation

### Implementation for User Story 3

- [ ] T023 [US3] Create Auth folder with Register request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T024 [P] [US3] Create Auth folder with Login request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T025 [P] [US3] Create Auth folder with Get Current User request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T026 [P] [US3] Create Auth folder with Google OAuth request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T027 [US3] Add test assertions for authentication endpoints (status codes, token format, no password leak) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T028 [US3] Add error scenario tests (invalid credentials, expired token) in `postman/collections/cloudforge-api.postman_collection.json`

**Checkpoint**: Authentication endpoints fully tested with token handling

---

## Phase 6: User Story 4 - Performance Monitoring (Priority: P2)

**Goal**: Response time validation catches performance regressions

**Independent Test**: Run test suite and verify response time assertions are evaluated and reported

### Implementation for User Story 4

- [ ] T029 [US4] Define response time threshold variables in collection (200ms, 500ms, 2000ms, 5000ms tiers) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T030 [US4] Add response time assertions to Health endpoints (200ms threshold) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T031 [US4] Add response time assertions to CRUD endpoints (500ms threshold) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T032 [US4] Add response time assertions to Terraform endpoints (2000ms threshold) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T033 [US4] Add response time assertions to Security scan endpoints (5000ms threshold) in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T034 [US4] Add responseTimeMultiplier environment variable support for local testing in `postman/environments/local.postman_environment.json`

**Checkpoint**: All endpoints have performance assertions

---

## Phase 7: User Story 5 - Multi-Environment Support (Priority: P2)

**Goal**: Same tests run against local, staging, and production with environment-specific configs

**Independent Test**: Run test suite with different environment files and verify correct URL targeting

### Implementation for User Story 5

- [ ] T035 [US5] Configure environment-specific base URLs in all environment files in `postman/environments/`
- [ ] T036 [US5] Configure environment-specific credentials handling (env vars for secrets) in `postman/environments/staging.postman_environment.json`
- [ ] T037 [US5] Add environment selection to test runner script in `postman/scripts/run-tests.sh`
- [ ] T038 [US5] Add environment selection to CI workflow (default: local) in `.github/workflows/api-tests.yml`
- [ ] T039 [US5] Document environment setup in README or quickstart in `postman/README.md`

**Checkpoint**: Tests runnable against any configured environment

---

## Phase 8: User Story 6 - Local Development Testing (Priority: P3)

**Goal**: Developers can run API tests locally during development

**Independent Test**: Run test suite from developer workstation against localhost

### Implementation for User Story 6

- [ ] T040 [US6] Add local development instructions to test runner script in `postman/scripts/run-tests.sh`
- [ ] T041 [US6] Add folder-specific test execution support to runner script in `postman/scripts/run-tests.sh`
- [ ] T042 [US6] Add verbose output mode for debugging in `postman/scripts/run-tests.sh`
- [ ] T043 [US6] Create developer quickstart documentation in `postman/README.md`

**Checkpoint**: Developers can run tests locally with ease

---

## Phase 9: Endpoint Coverage (All 9 API Groups)

**Purpose**: Complete test coverage for all 50+ CloudForge API endpoints

### Projects Folder

- [ ] T044 [P] Create Projects folder with Create Project request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T045 [P] Create Projects folder with List Projects request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T046 [P] Create Projects folder with Get Project request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T047 [P] Create Projects folder with Update Project request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T048 [P] Create Projects folder with Delete Project request in `postman/collections/cloudforge-api.postman_collection.json`

### Resources Folder

- [ ] T049 [P] Create Resources folder with Create Resource request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T050 [P] Create Resources folder with List Project Resources request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T051 [P] Create Resources folder with Update Resource request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T052 [P] Create Resources folder with Delete Resource request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T053 [P] Create Resources folder with Create Connection request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T054 [P] Create Resources folder with List Connections request in `postman/collections/cloudforge-api.postman_collection.json`

### Terraform Folder

- [ ] T055 [P] Create Terraform folder with Generate request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T056 [P] Create Terraform folder with Validate request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T057 [P] Create Terraform folder with Plan request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T058 [P] Create Terraform folder with Deploy request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T059 [P] Create Terraform folder with Destroy request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T060 [P] Create Terraform folder with Latest Output request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T061 [P] Create Terraform folder with Download request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T062 [P] Create Terraform folder with Files request in `postman/collections/cloudforge-api.postman_collection.json`

### Security Folder

- [ ] T063 [P] Create Security folder with TFSec Scan request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T064 [P] Create Security folder with Terrascan Scan request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T065 [P] Create Security folder with Infracost Estimate request in `postman/collections/cloudforge-api.postman_collection.json`

### Dashboard Folder

- [ ] T066 [P] Create Dashboard folder with Stats request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T067 [P] Create Dashboard folder with Analytics request in `postman/collections/cloudforge-api.postman_collection.json`

### Health Folder

- [ ] T068 [P] Create Health folder with Health Check request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T069 [P] Create Health folder with Ready Check request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T070 [P] Create Health folder with Metrics request in `postman/collections/cloudforge-api.postman_collection.json`

### Drift Folder

- [ ] T071 [P] Create Drift folder with Start Scan request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T072 [P] Create Drift folder with Get Scan request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T073 [P] Create Drift folder with List Project Scans request in `postman/collections/cloudforge-api.postman_collection.json`

### Config Folder

- [ ] T074 [P] Create Config folder with Icons Catalog request in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T075 [P] Create Config folder with Resources Catalog request in `postman/collections/cloudforge-api.postman_collection.json`

**Checkpoint**: All 50+ API endpoints have test coverage

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Finalization, documentation, and validation

- [ ] T076 [P] Add test assertions (status, schema, timing) to all endpoint requests in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T077 [P] Add error scenario tests (401, 404, 422) across all endpoint groups in `postman/collections/cloudforge-api.postman_collection.json`
- [ ] T078 Update TESTING.md with Newman API testing documentation in `TESTING.md`
- [ ] T079 Run full test suite against local environment and verify all pass
- [ ] T080 Run quickstart.md validation scenarios from `specs/004-newman-api-testing/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Endpoint Coverage (Phase 9)**: Can proceed in parallel with User Stories after Phase 2
- **Polish (Phase 10)**: Depends on all phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: CI Pipeline - Can start after Phase 2
- **User Story 2 (P1)**: Schema Validation - Can start after Phase 2, parallel with US1
- **User Story 3 (P1)**: Authentication - Can start after Phase 2, parallel with US1/US2
- **User Story 4 (P2)**: Performance - Requires some endpoints to exist (after Phase 9 partial)
- **User Story 5 (P2)**: Multi-Environment - Can start after Phase 2
- **User Story 6 (P3)**: Local Testing - Can start after Phase 2

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# All can run in parallel:
T002: Create .gitignore entries
T003: Add Newman dependencies
```

**Phase 2 (Foundational)**:
```bash
# After T004-T005, these can run in parallel:
T006: Create common schemas
T007: Create local environment
T008: Create staging environment
T009: Create production environment
```

**Phase 4 (Schema Validation)**:
```bash
# All schema files can be created in parallel:
T016: auth.schema.json
T017: projects.schema.json
T018: resources.schema.json
T019: terraform.schema.json
T020: health.schema.json
```

**Phase 9 (Endpoint Coverage)**:
```bash
# All endpoint requests can be created in parallel (different folders):
T044-T048: Projects folder
T049-T054: Resources folder
T055-T062: Terraform folder
T063-T065: Security folder
T066-T067: Dashboard folder
T068-T070: Health folder
T071-T073: Drift folder
T074-T075: Config folder
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - CI Pipeline Integration
4. **STOP and VALIDATE**: Verify CI runs Newman and reports results
5. Complete Phase 4: US2 - Schema Validation
6. Complete Phase 5: US3 - Authentication Testing
7. Deploy MVP: CI pipeline with auth and schema validation

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (CI Pipeline) → Test in PR → Working CI
3. Add US2 (Schemas) → Validate schema detection
4. Add US3 (Auth) → Complete auth coverage
5. Add Phase 9 (Endpoints) → Full coverage
6. Add US4-US6 → Performance, environments, local dev
7. Polish → Documentation, final validation

### Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 3 | 2 |
| Phase 2: Foundational | 7 | 4 |
| Phase 3: US1 CI Pipeline | 5 | 0 |
| Phase 4: US2 Schema Validation | 7 | 5 |
| Phase 5: US3 Authentication | 6 | 3 |
| Phase 6: US4 Performance | 6 | 0 |
| Phase 7: US5 Multi-Environment | 5 | 0 |
| Phase 8: US6 Local Testing | 4 | 0 |
| Phase 9: Endpoint Coverage | 32 | 32 |
| Phase 10: Polish | 5 | 2 |
| **Total** | **80** | **48** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Most endpoint creation tasks (Phase 9) are parallelizable as they modify different folders
- Collection file will be edited multiple times - ensure atomic saves
- Environment files contain sensitive placeholders - document secrets handling
