# CloudForge Testing Guide

This document describes the testing infrastructure for CloudForge, including how to run tests locally, understand the CI/CD pipeline, and contribute to test coverage.

## Quick Start

```bash
# Run all tests
./scripts/test-all.sh

# Run with coverage
./scripts/test-all.sh --coverage

# Run specific test types
./scripts/test-backend.sh --unit
./scripts/test-frontend.sh
./scripts/test-e2e.sh
```

## Test Types

### Unit Tests

Unit tests verify individual functions and components in isolation.

**Backend (pytest)**
```bash
cd backend
pytest tests/unit -v

# With coverage
pytest tests/unit -v --cov=app --cov-report=html --cov-fail-under=80
```

**Frontend (Vitest)**
```bash
cd frontend
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests

Integration tests verify API endpoints and database interactions.

```bash
cd backend

# Requires PostgreSQL and Redis running
export DATABASE_URL=postgresql://user:pass@localhost:5432/test
pytest tests/integration -v
```

### Contract Tests

Contract tests verify Terraform generator output format.

```bash
cd backend
pytest tests/contract -v
```

### E2E Tests (Playwright)

End-to-end tests verify complete user workflows in a browser.

```bash
cd frontend

# Run all E2E tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run in headed mode (see the browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# View report
npx playwright show-report
```

### Load Tests (Locust)

Load tests validate system capacity under concurrent users.

```bash
cd backend

# Headless mode
locust -f tests/load/locustfile.py --host http://localhost:8000 \
  --users 100 --spawn-rate 10 --run-time 60s --headless

# With web UI
locust -f tests/load/locustfile.py --host http://localhost:8000
# Open http://localhost:8089
```

### Security Scans

```bash
# All security scans
./scripts/security-scan.sh

# Backend only
./scripts/security-scan.sh --backend-only

# Frontend only
./scripts/security-scan.sh --frontend-only

# With auto-fix attempt
./scripts/security-scan.sh --fix
```

### Accessibility Tests

```bash
cd frontend
npx playwright test tests/a11y

# Or use the script
./scripts/test-a11y.sh
```

## CI/CD Pipeline

### Pull Request Validation

When you open a PR, the CI pipeline automatically runs:

1. **Lint & Typecheck** - Code quality checks
2. **Unit Tests** - Backend and frontend unit tests with coverage
3. **Integration Tests** - API and database tests
4. **Security Scans** - Dependency vulnerability checks
5. **Build Verification** - Frontend build

PRs cannot be merged until all required checks pass.

### Deployment Pipeline

On merge to `main`:

1. CI validation runs
2. Docker images are built
3. Automatic deployment to staging
4. Smoke tests run against staging
5. Production deployment requires approval

## Coverage Requirements

- **Backend**: 80% minimum coverage (enforced in CI)
- **Frontend**: 80% minimum coverage (enforced in CI)

View coverage reports:
- Backend: `backend/htmlcov/index.html`
- Frontend: `frontend/coverage/index.html`

## Writing Tests

### Backend Test Example

```python
# backend/tests/unit/test_example.py
import pytest
from app.services.example import ExampleService

class TestExampleService:
    def test_process_data(self):
        service = ExampleService()
        result = service.process_data({"key": "value"})
        assert result["processed"] == True

    def test_process_data_invalid(self):
        service = ExampleService()
        with pytest.raises(ValueError):
            service.process_data(None)
```

### Frontend Test Example

```typescript
// frontend/tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';
import { processData } from '@/lib/example';

describe('processData', () => {
  it('should process valid data', () => {
    const result = processData({ key: 'value' });
    expect(result.processed).toBe(true);
  });

  it('should throw on invalid data', () => {
    expect(() => processData(null)).toThrow();
  });
});
```

### E2E Test Example

```typescript
// frontend/tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should complete workflow', async ({ page }) => {
    await page.goto('/feature');
    await page.click('button[data-testid="action"]');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## Test Data & Fixtures

### Backend Fixtures

Shared fixtures are in `backend/tests/conftest.py`:

- `client` - Test client without authentication
- `authenticated_client` - Test client with JWT token
- `db_session` - Database session for tests
- `test_user` - Pre-created test user
- `test_project` - Pre-created test project

### Frontend Setup

Test setup is in `frontend/tests/setup.ts`.

## Troubleshooting

### Tests fail with database errors

Ensure you're using SQLite for unit tests:
```bash
export DATABASE_URL=sqlite:///:memory:
```

### Playwright browsers not installed

```bash
cd frontend
npx playwright install --with-deps
```

### Coverage below threshold

Run coverage report to find gaps:
```bash
pytest tests/ --cov=app --cov-report=term-missing
```

### Security scan fails

Update vulnerable dependencies:
```bash
# Backend
pip-audit --fix

# Frontend
npm audit fix
```

## Environment Variables for Testing

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | Database connection | `sqlite:///:memory:` |
| `SECRET_KEY` | JWT signing | `test-secret-key` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `CI` | CI environment flag | `false` |
| `HEADLESS` | Run browsers headless | `true` in CI |

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/test-all.sh` | Run all tests |
| `scripts/test-backend.sh` | Backend tests |
| `scripts/test-frontend.sh` | Frontend tests |
| `scripts/test-e2e.sh` | E2E browser tests |
| `scripts/test-a11y.sh` | Accessibility tests |
| `scripts/load-test.sh` | Load/performance tests |
| `scripts/security-scan.sh` | Security scans |
| `scripts/smoke-test.sh` | Deployment smoke tests |
