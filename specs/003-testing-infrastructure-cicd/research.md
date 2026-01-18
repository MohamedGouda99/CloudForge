# Research: Full Testing Infrastructure & CI/CD Pipeline

**Feature**: 003-testing-infrastructure-cicd
**Date**: 2026-01-14
**Status**: Complete

## Research Topics

### 1. Backend Testing Framework Selection

**Decision**: pytest with pytest-asyncio, pytest-cov

**Rationale**:
- pytest is already in CloudForge's requirements.txt and used in existing tests
- pytest-asyncio handles FastAPI's async endpoints natively
- pytest-cov provides coverage reporting compatible with CI systems
- Mature ecosystem with extensive plugin support
- Clear, readable test syntax with fixtures

**Alternatives Considered**:
- unittest: Python standard library but verbose syntax, less flexible fixtures
- nose2: Less active development, smaller ecosystem
- hypothesis: Great for property-based testing but adds complexity for standard cases

### 2. Frontend Testing Framework Selection

**Decision**: Vitest with React Testing Library

**Rationale**:
- Vitest already configured in CloudForge frontend (vitest.config.ts exists)
- Native ESM support, faster than Jest
- Compatible with Vite build system used by CloudForge
- React Testing Library encourages testing user behavior, not implementation

**Alternatives Considered**:
- Jest: Industry standard but slower, requires additional configuration for ESM
- Cypress Component Testing: Good but heavier, better suited for E2E
- Testing Library alone: Needs a test runner

### 3. E2E Testing Framework Selection

**Decision**: Playwright

**Rationale**:
- Cross-browser support (Chromium, Firefox, WebKit) in single API
- Built-in auto-wait eliminates flaky tests
- Trace viewer for debugging failures
- Native TypeScript support
- Parallel execution out of the box
- Screenshot and video capture on failure

**Alternatives Considered**:
- Cypress: Excellent DX but single browser per run, no Safari support
- Selenium: Mature but slower, more boilerplate, flakier
- Puppeteer: Chrome-only, lower-level API

### 4. Load Testing Framework Selection

**Decision**: Locust

**Rationale**:
- Already in CloudForge's requirements.txt
- Python-based, consistent with backend language
- Real-time web UI for monitoring tests
- Distributed testing support for high load
- Simple, code-based test scenarios

**Alternatives Considered**:
- k6: Modern, efficient but JavaScript-based (language switch)
- JMeter: Feature-rich but XML config, steep learning curve
- Artillery: Good but Node.js-based, less Python ecosystem integration
- Gatling: Scala-based, adds language complexity

### 5. Security Scanning Tools Selection

**Decision**: pip-audit (Python), npm audit (Node.js), TFSec, Terrascan

**Rationale**:
- pip-audit: Official PyPA tool, uses Advisory Database, already in requirements.txt
- npm audit: Built into npm, no additional installation
- TFSec: Already integrated in CloudForge backend
- Terrascan: Already integrated, provides policy-as-code compliance

**Alternatives Considered**:
- Snyk: Excellent but requires paid plan for full features
- Dependabot: Good for PRs but not CI blocking
- OWASP Dependency-Check: More comprehensive but slower
- Trivy: Good all-in-one but adds another tool

### 6. Accessibility Testing Tool Selection

**Decision**: axe-core via @axe-core/playwright

**Rationale**:
- Industry standard accessibility engine
- Playwright integration is seamless
- Detects WCAG 2.1 AA violations automatically
- Provides specific element selectors and remediation guidance
- Can run as part of E2E test suite

**Alternatives Considered**:
- Pa11y: Good but separate tool, not integrated with test framework
- Lighthouse CI: Good for audits but not test assertions
- WAVE: Browser extension, not automatable
- jest-axe: Jest-specific, not compatible with Vitest

### 7. CI/CD Platform Best Practices

**Decision**: GitHub Actions with matrix builds and environment protection

**Rationale**:
- Already CloudForge's CI/CD platform
- Native integration with GitHub PRs
- Matrix builds enable parallel testing
- Environment protection rules enable approval gates
- Artifact retention for debugging
- Reusable workflows reduce duplication

**Best Practices Adopted**:
1. **Staged Pipeline**: lint → typecheck → unit → integration → E2E → security → build → deploy
2. **Fail Fast**: Cancel running jobs on first failure
3. **Caching**: Cache pip/npm dependencies between runs
4. **Artifacts**: Upload test reports, screenshots, coverage
5. **Concurrency**: Cancel in-progress runs on new push
6. **Branch Protection**: Require CI pass before merge
7. **Environment Approval**: Manual approval for production deploy

### 8. Test Container Strategy

**Decision**: Use SQLite for unit tests, PostgreSQL testcontainers for integration

**Rationale**:
- SQLite provides fast, isolated unit tests without external dependencies
- PostgreSQL testcontainers ensure integration tests match production behavior
- Database.py already handles SQLite vs PostgreSQL detection
- Testcontainers provide ephemeral, reproducible database instances

**Configuration**:
- Unit tests: `DATABASE_URL=sqlite:///:memory:`
- Integration tests: `DATABASE_URL=postgresql://testcontainers:5432/test`

### 9. Test Organization Best Practices

**Decision**: Mirror source structure, use fixtures for shared setup

**Rationale**:
- Mirroring source structure makes test location predictable
- Shared fixtures in conftest.py prevent duplication
- Clear test naming: `test_{function}_{scenario}_{expected}`
- Separate unit/integration/contract directories for different execution profiles

**Directory Structure**:
```
tests/
├── unit/           # Fast, isolated, mocked dependencies
├── integration/    # Real database, external services mocked
├── contract/       # Verify API contracts and output formats
├── e2e/            # Full system tests via browser
└── conftest.py     # Shared fixtures and configuration
```

### 10. CI Pipeline Timing Optimization

**Decision**: Parallel stages, cached dependencies, incremental testing

**Rationale**:
- Target: CI feedback < 15 minutes
- Parallel matrix builds reduce wall clock time
- Dependency caching eliminates reinstallation
- Fail-fast prevents wasted compute

**Timing Budget**:
| Stage | Target | Approach |
|-------|--------|----------|
| Checkout + Setup | 30s | Cached actions |
| Lint + Typecheck | 2min | Parallel execution |
| Backend Unit | 2min | SQLite, no I/O |
| Frontend Unit | 2min | Vitest parallel |
| Integration | 4min | Testcontainers |
| E2E (smoke) | 3min | Critical paths only in CI |
| Security | 2min | Parallel scans |
| **Total** | **<15min** | |

## Resolved Clarifications

All technical decisions are resolved. No NEEDS CLARIFICATION items remain.

## References

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [Playwright documentation](https://playwright.dev/)
- [Locust documentation](https://docs.locust.io/)
- [axe-core documentation](https://www.deque.com/axe/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [TFSec documentation](https://aquasecurity.github.io/tfsec/)
