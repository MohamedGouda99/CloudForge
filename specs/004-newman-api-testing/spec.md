# Feature Specification: Newman API Testing Suite

**Feature Branch**: `004-newman-api-testing`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Add Postman/Newman API testing: collection for all CloudForge endpoints, environment configs, Newman in GitHub Actions, auth token handling, schema validation, response time assertions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Automated API Tests in CI Pipeline (Priority: P1)

As a developer, I want automated API tests to run on every pull request so that API regressions are caught before code is merged.

**Why this priority**: This is the core value proposition - ensuring API quality through automated testing in the CI pipeline. Without this, the feature provides no automated validation.

**Independent Test**: Can be fully tested by triggering a CI build and verifying that API test results are reported in the pipeline output.

**Acceptance Scenarios**:

1. **Given** a pull request is opened, **When** the CI pipeline runs, **Then** the API test suite executes automatically and reports pass/fail status
2. **Given** an API endpoint returns an error, **When** tests run, **Then** the specific failing endpoint and error details are clearly reported
3. **Given** all tests pass, **When** the pipeline completes, **Then** the PR shows a green check for API tests

---

### User Story 2 - Validate API Response Structure (Priority: P1)

As a QA engineer, I want API responses validated against expected schemas so that breaking changes to response formats are detected immediately.

**Why this priority**: Schema validation is essential for catching breaking changes that could affect frontend consumers. This runs alongside story 1 as a core testing capability.

**Independent Test**: Can be tested by running the test suite against the API and verifying schema validation errors are reported for malformed responses.

**Acceptance Scenarios**:

1. **Given** an API endpoint response, **When** schema validation runs, **Then** the response structure is validated against the expected format
2. **Given** a response is missing required fields, **When** validation runs, **Then** the test fails with details about missing fields
3. **Given** a response contains unexpected field types, **When** validation runs, **Then** the test fails with type mismatch details

---

### User Story 3 - Test Authenticated Endpoints (Priority: P1)

As a developer, I want API tests to handle authentication automatically so that protected endpoints can be tested without manual token management.

**Why this priority**: Most CloudForge endpoints require authentication. Without automatic token handling, the majority of endpoints cannot be tested.

**Independent Test**: Can be tested by running tests against authenticated endpoints and verifying successful authentication and response validation.

**Acceptance Scenarios**:

1. **Given** test credentials are configured, **When** tests run against protected endpoints, **Then** authentication tokens are obtained automatically
2. **Given** a valid token exists, **When** testing protected endpoints, **Then** the token is included in requests automatically
3. **Given** a token expires during test execution, **When** a subsequent request is made, **Then** a new token is obtained automatically

---

### User Story 4 - Monitor API Performance (Priority: P2)

As a developer, I want API response times validated against thresholds so that performance regressions are detected.

**Why this priority**: Performance testing is valuable but secondary to functional correctness. The system should work correctly before we optimize for speed.

**Independent Test**: Can be tested by running the test suite and verifying that response time assertions are evaluated and reported.

**Acceptance Scenarios**:

1. **Given** performance thresholds are defined, **When** an API responds, **Then** the response time is compared against the threshold
2. **Given** an endpoint exceeds its time threshold, **When** tests complete, **Then** a warning or failure is reported with actual vs expected timing
3. **Given** all endpoints meet performance targets, **When** tests complete, **Then** performance metrics are included in the test report

---

### User Story 5 - Run Tests Against Multiple Environments (Priority: P2)

As a DevOps engineer, I want to run the same API tests against different environments (local, staging, production) so that environment-specific issues are detected.

**Why this priority**: Multi-environment testing extends the value of the test suite but requires the core testing capability (P1 stories) to be functional first.

**Independent Test**: Can be tested by running the test suite with different environment configurations and verifying correct endpoint targeting.

**Acceptance Scenarios**:

1. **Given** environment configurations exist, **When** tests are run with a specific environment, **Then** requests target the correct base URL
2. **Given** environment-specific credentials exist, **When** tests run, **Then** the appropriate credentials are used for authentication
3. **Given** an environment is unavailable, **When** tests run against it, **Then** clear error messages indicate connectivity issues

---

### User Story 6 - Run Tests Locally for Development (Priority: P3)

As a developer, I want to run API tests locally during development so that I can verify API changes before committing.

**Why this priority**: Local testing is convenient for developers but not required for the core value of automated CI testing.

**Independent Test**: Can be tested by running the test suite from a developer workstation against a local API instance.

**Acceptance Scenarios**:

1. **Given** a local development environment, **When** a developer runs the test suite, **Then** tests execute against localhost
2. **Given** tests are run locally, **When** tests complete, **Then** results are displayed in a readable format
3. **Given** specific tests are selected, **When** run locally, **Then** only the selected tests execute

---

### Edge Cases

- What happens when the API is completely unavailable? Tests should fail gracefully with clear connectivity error messages.
- How does the system handle rate limiting? Tests should include appropriate delays or skip rate-limited endpoints with warnings.
- What happens when authentication fails? Clear error messages should indicate credential or authentication server issues.
- How are large response payloads handled? Schema validation should work efficiently even for large responses.
- What happens when an endpoint returns a different status code than expected? Tests should fail with expected vs actual status comparison.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a complete collection of test definitions covering all CloudForge API endpoints
- **FR-002**: System MUST validate API response structures against predefined schemas
- **FR-003**: System MUST automatically obtain and manage authentication tokens for protected endpoints
- **FR-004**: System MUST measure and validate response times against configurable thresholds
- **FR-005**: System MUST support multiple environment configurations (local, staging, production)
- **FR-006**: System MUST integrate with CI/CD pipelines to run tests automatically on code changes
- **FR-007**: System MUST report test results in a format compatible with CI/CD platforms
- **FR-008**: System MUST handle token refresh when authentication expires during test runs
- **FR-009**: System MUST provide clear error messages when tests fail, including endpoint, expected vs actual, and relevant context
- **FR-010**: System MUST allow running specific subsets of tests (by endpoint group or tag)
- **FR-011**: System MUST validate required response headers (content-type, etc.)
- **FR-012**: System MUST test error scenarios (invalid input, unauthorized access, not found)

### API Endpoint Coverage Requirements

The test suite MUST cover the following CloudForge API endpoint groups:

- **FR-013**: Authentication endpoints (register, login, current user, OAuth)
- **FR-014**: Project management endpoints (CRUD operations)
- **FR-015**: Resource management endpoints (create, read, update, delete resources and connections)
- **FR-016**: Terraform operations endpoints (generate, validate, plan, deploy, destroy)
- **FR-017**: Security scanning endpoints (tfsec, terrascan, infracost)
- **FR-018**: Dashboard and analytics endpoints
- **FR-019**: Health check endpoints
- **FR-020**: Drift detection endpoints
- **FR-021**: Icon and configuration endpoints

### Key Entities

- **Test Collection**: A complete set of API test definitions organized by endpoint group, containing request definitions, expected responses, and validation rules
- **Environment Configuration**: A set of variables defining API base URL, credentials, and environment-specific settings for local, staging, and production
- **Test Result Report**: Output from test execution containing pass/fail status, timing metrics, and failure details for each test case
- **Authentication Token**: Time-limited credential obtained automatically and used across protected endpoint tests

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of CloudForge API endpoints (50+ endpoints) have corresponding automated tests
- **SC-002**: API tests execute and report results within 5 minutes for the complete test suite
- **SC-003**: Test results are visible in CI/CD pipeline within 30 seconds of test completion
- **SC-004**: Failed tests provide actionable error messages that identify the issue 90% of the time without additional debugging
- **SC-005**: Response time validation catches endpoints exceeding 2-second threshold
- **SC-006**: Schema validation catches missing or incorrectly-typed fields with 100% accuracy
- **SC-007**: Authentication token handling works automatically without manual intervention for all protected endpoints
- **SC-008**: Tests can be run against any configured environment with a single configuration change

## Assumptions

- CloudForge API follows RESTful conventions and returns JSON responses
- Test credentials will be provided via environment variables or secure configuration
- The CI/CD platform supports running command-line test tools
- API endpoints have stable response schemas that can be documented and validated
- Performance thresholds of 2 seconds for standard endpoints and 5 seconds for complex operations are acceptable defaults
- The existing backend health endpoints (/health, /health/ready) can be used to verify API availability before running tests
