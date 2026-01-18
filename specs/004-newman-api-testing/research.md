# Research: Newman API Testing Suite

**Feature**: 004-newman-api-testing
**Date**: 2026-01-14
**Status**: Complete

## Research Questions

### 1. API Testing Tool Selection

**Decision**: Newman (Postman CLI runner)

**Rationale**:
- Industry standard for API testing with large ecosystem
- Postman collections can be created via GUI or code, lowering barrier to entry
- Newman CLI provides headless execution perfect for CI/CD
- Built-in support for environment variables, pre-request scripts, and test assertions
- Rich reporting options (JUnit XML, HTML, JSON)
- Active maintenance and widespread adoption

**Alternatives Considered**:

| Tool | Pros | Cons | Why Not Selected |
|------|------|------|------------------|
| REST Client (VS Code) | Lightweight, dev-friendly | No CI integration, no programmatic assertions | Lacks automation capabilities |
| Hurl | Fast, simple syntax | Smaller ecosystem, less schema validation support | Less mature tooling |
| k6 | Excellent load testing | Primary focus is performance, not functional testing | Different purpose |
| pytest + requests | Python-native, familiar | More code to maintain, less visual collection management | Higher maintenance burden |
| Karate | BDD-style, Java ecosystem | Requires Java runtime, steeper learning curve | Tech stack mismatch |

### 2. Schema Validation Approach

**Decision**: JSON Schema validation via Postman's tv4/ajv integration with external schema files

**Rationale**:
- Postman supports JSON Schema validation natively in test scripts
- External schema files enable reuse across tests and version control
- ajv is the fastest JSON Schema validator
- Schema-first approach documents API contract alongside tests

**Implementation Pattern**:
```javascript
// In Postman test script
const schema = pm.collectionVariables.get("projectSchema");
pm.test("Response matches schema", function() {
    pm.response.to.have.jsonSchema(JSON.parse(schema));
});
```

**Alternatives Considered**:
- Inline schema definitions: Rejected due to duplication and maintenance overhead
- OpenAPI-based validation: More complex setup, better suited for contract-first APIs
- Custom JavaScript validation: Reinvents the wheel, error-prone

### 3. Authentication Token Handling

**Decision**: Pre-request script at collection level with token caching in environment variables

**Rationale**:
- Single authentication flow handles all protected endpoints
- Token cached in environment variable avoids repeated auth calls
- Token expiry check with automatic refresh
- Credentials stored securely in environment files (gitignored for production)

**Implementation Pattern**:
```javascript
// Collection-level pre-request script
const tokenExpiry = pm.environment.get("tokenExpiry");
const now = Date.now();

if (!pm.environment.get("accessToken") || now > tokenExpiry) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/login",
        method: "POST",
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        body: {
            mode: "urlencoded",
            urlencoded: [
                { key: "username", value: pm.environment.get("testUsername") },
                { key: "password", value: pm.environment.get("testPassword") }
            ]
        }
    }, function(err, res) {
        const json = res.json();
        pm.environment.set("accessToken", json.access_token);
        pm.environment.set("tokenExpiry", now + 3600000); // 1 hour
    });
}
```

### 4. Response Time Assertions

**Decision**: Per-endpoint thresholds with tiered defaults based on endpoint complexity

**Rationale**:
- Constitution requires <200ms for CRUD, <2s for Terraform generation
- Tiered thresholds prevent false failures on legitimately slower operations
- Assertions provide immediate feedback on performance regressions

**Threshold Tiers**:

| Tier | Threshold | Endpoint Types |
|------|-----------|----------------|
| Fast | 200ms | Health checks, simple GETs |
| Standard | 500ms | CRUD operations, authentication |
| Complex | 2000ms | Terraform generation, list operations |
| Long-running | 5000ms | Security scans, cost estimation |

**Implementation Pattern**:
```javascript
pm.test("Response time is acceptable", function() {
    const threshold = pm.collectionVariables.get("responseTimeThreshold") || 500;
    pm.expect(pm.response.responseTime).to.be.below(threshold);
});
```

### 5. CI/CD Integration Strategy

**Decision**: Dedicated GitHub Actions workflow with Newman, separate from main CI pipeline

**Rationale**:
- Separation of concerns: unit/integration tests vs API contract tests
- API tests require running backend service (different setup)
- Can run in parallel with other CI jobs for faster feedback
- Dedicated workflow allows environment-specific configurations

**Integration Points**:
- Triggered on PR and push to main/develop
- Uses Docker Compose to spin up backend for testing
- Reports results via JUnit XML for GitHub integration
- HTML report uploaded as artifact for debugging

### 6. Environment Configuration Strategy

**Decision**: Separate environment files per target with shared collection

**Rationale**:
- Single collection works across all environments
- Environment files contain only variables (URLs, credentials)
- Local environment uses localhost, staging/production use actual URLs
- Credentials for staging/production stored as GitHub Secrets

**Environment Variables**:

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| baseUrl | http://localhost:8000 | https://staging.cloudforge.example.com | https://cloudforge.example.com |
| testUsername | admin | ci-test-user | (read-only test account) |
| testPassword | admin123 | (from secrets) | (from secrets) |
| responseTimeMultiplier | 2.0 | 1.0 | 1.0 |

### 7. Test Organization Strategy

**Decision**: Folder-based organization matching API endpoint groups

**Rationale**:
- Mirrors API structure for easy navigation
- Enables running specific endpoint groups via folder selection
- Tags provide cross-cutting categorization (smoke, regression, performance)

**Collection Structure**:
```
CloudForge API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Get Current User
│   └── Google OAuth
├── Projects
│   ├── Create Project
│   ├── List Projects
│   ├── Get Project
│   ├── Update Project
│   └── Delete Project
├── Resources
│   ├── Create Resource
│   ├── List Project Resources
│   ├── Update Resource
│   ├── Delete Resource
│   ├── Create Connection
│   └── List Connections
├── Terraform
│   ├── Generate
│   ├── Validate
│   ├── Plan
│   ├── Deploy
│   ├── Destroy
│   ├── Latest Output
│   ├── Download
│   └── Files
├── Security
│   ├── TFSec Scan
│   ├── Terrascan Scan
│   └── Infracost Estimate
├── Dashboard
│   ├── Stats
│   └── Analytics
├── Health
│   ├── Health Check
│   ├── Ready Check
│   └── Metrics
├── Drift
│   ├── Start Scan
│   ├── Get Scan
│   └── List Project Scans
└── Config
    ├── Icons Catalog
    └── Resources Catalog
```

## Technology Decisions Summary

| Area | Decision | Confidence |
|------|----------|------------|
| Test Runner | Newman CLI | High |
| Collection Format | Postman v2.1 | High |
| Schema Validation | JSON Schema with ajv | High |
| Auth Handling | Collection pre-request with caching | High |
| CI Integration | Dedicated GitHub Actions workflow | High |
| Environment Mgmt | Separate env files, shared collection | High |
| Reporting | JUnit XML + HTML (htmlextra) | High |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| newman | ^6.x | CLI test runner |
| newman-reporter-htmlextra | ^1.x | Enhanced HTML reports |
| newman-reporter-junitfull | ^1.x | JUnit XML for CI |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flaky tests from timing issues | Medium | Use responseTimeMultiplier for local dev, retry logic in CI |
| Token expiry during long runs | Low | Pre-request script handles refresh automatically |
| Schema drift from API changes | Medium | Include schema validation in PR review process |
| Environment URL misconfiguration | Low | Health check as first test, fail fast |
