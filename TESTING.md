# Testing Guide

CloudForge's test strategy covers **unit**, **integration**, **contract**, **E2E**, **accessibility**, **load**, and **security** layers — all drivable from one-line scripts in `scripts/`. This guide shows how to run each locally, what CI enforces, and how to write new tests.

> **Coverage gate:** 80% minimum on both backend and frontend. CI blocks PRs that drop below.

---

## Table of Contents

- [Quick Commands](#quick-commands)
- [Test Layers](#test-layers)
  - [Unit](#unit-tests)
  - [Integration](#integration-tests)
  - [Contract](#contract-tests)
  - [End-to-End (Playwright)](#e2e-tests-playwright)
  - [Load (Locust)](#load-tests-locust)
  - [Security](#security-scans)
  - [Accessibility](#accessibility-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Fixtures & Test Data](#fixtures--test-data)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)
- [Script Reference](#script-reference)

---

## Quick Commands

```bash
./scripts/test-all.sh                # everything (unit + integration + contract)
./scripts/test-all.sh --coverage     # with coverage report
./scripts/test-backend.sh --unit     # backend unit only
./scripts/test-frontend.sh           # frontend unit only
./scripts/test-e2e.sh                # full browser E2E (slow)
./scripts/test-a11y.sh               # accessibility
./scripts/load-test.sh               # Locust load test
./scripts/security-scan.sh           # pip-audit + npm audit + TFSec
./scripts/smoke-test.sh              # post-deploy smoke
```

---

## Test Layers

### Unit Tests

Fast, isolated tests — no I/O, no DB, no network. These run on every keystroke in watch mode.

**Backend (pytest)**
```bash
cd backend
pytest tests/unit -v                          # all unit tests
pytest tests/unit -v --cov=app --cov-report=html --cov-fail-under=80
pytest tests/unit/test_file.py::TestClass::test_method -v  # single test
pytest -m "not slow" -v                       # skip slow-marked tests
```

**Frontend (Vitest)**
```bash
cd frontend
npm run test                                  # watch mode
npm run test:run                              # single run
npm run test:coverage                         # with c8 coverage
```

### Integration Tests

Verify API endpoints against a real Postgres + Redis (not mocks).

```bash
cd backend
export DATABASE_URL=postgresql://cloudforge:cloudforge_dev_password@localhost:5432/cloudforge
pytest tests/integration -v
```

> For fully-isolated runs, start the stack first: `docker compose up -d postgres redis`.

### Contract Tests

Verify the Terraform generator's HCL output matches known-good fixtures. These guard against accidental changes to the emitted Terraform format.

```bash
cd backend
pytest tests/contract -v
```

### E2E Tests (Playwright)

Complete user journeys in a real browser — login → create project → drag resources → generate Terraform.

```bash
cd frontend
npx playwright test                           # all browsers, headless
npx playwright test --project=chromium        # one browser
npx playwright test --headed                  # watch it click
npx playwright test --debug                   # step-through
npx playwright show-report                    # HTML results
```

**First run only:** `npx playwright install --with-deps` to pull browser binaries.

### Load Tests (Locust)

Stress the backend under concurrent users — useful for capacity planning.

```bash
cd backend

# Headless, scripted
locust -f tests/load/locustfile.py --host http://localhost:8000 \
  --users 100 --spawn-rate 10 --run-time 60s --headless

# Interactive UI at http://localhost:8089
locust -f tests/load/locustfile.py --host http://localhost:8000
```

### Security Scans

Third-party dependency CVEs + Terraform misconfigurations.

```bash
./scripts/security-scan.sh                    # all layers
./scripts/security-scan.sh --backend-only     # pip-audit
./scripts/security-scan.sh --frontend-only    # npm audit
./scripts/security-scan.sh --fix              # best-effort auto-fix
```

### Accessibility Tests

WCAG compliance check via pa11y-ci.

```bash
cd frontend
npm run test:a11y
# or
./scripts/test-a11y.sh
```

---

## CI/CD Pipeline

### On every pull request

1. **Lint + typecheck** — `black`, `flake8`, `mypy`, `eslint`, `tsc --noEmit`
2. **Unit tests** — backend + frontend with coverage
3. **Integration tests** — against a real Postgres spun up by GitHub Actions
4. **Security scans** — dependency CVEs, secret detection
5. **Build verification** — `npm run build` must succeed

PRs are blocked until all required checks pass.

### On merge to `main`

1. Full CI re-run
2. Docker images built
3. Auto-deploy to staging
4. Smoke tests against staging
5. Production deploy **requires manual approval**

---

## Writing Tests

### Backend — pytest

```python
# backend/tests/unit/test_example.py
import pytest
from app.services.example import ExampleService


class TestExampleService:
    def test_process_data(self):
        service = ExampleService()
        result = service.process_data({"key": "value"})
        assert result["processed"] is True

    def test_process_data_invalid(self):
        service = ExampleService()
        with pytest.raises(ValueError):
            service.process_data(None)
```

Markers defined in `pytest.ini`: `unit`, `integration`, `contract`, `load`, `slow`. Use them:

```python
@pytest.mark.integration
def test_db_round_trip(db_session):
    ...
```

### Frontend — Vitest

```typescript
// frontend/src/lib/__tests__/example.test.ts
import { describe, it, expect } from 'vitest';
import { processData } from '../example';

describe('processData', () => {
  it('processes valid data', () => {
    const result = processData({ key: 'value' });
    expect(result.processed).toBe(true);
  });

  it('throws on invalid data', () => {
    expect(() => processData(null)).toThrow();
  });
});
```

### E2E — Playwright

```typescript
// frontend/tests/e2e/designer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Designer', () => {
  test('creates a project and generates Terraform', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=username]', 'admin');
    await page.fill('[name=password]', 'admin123');
    await page.click('button[type=submit]');

    await page.goto('/designer');
    await page.click('button[data-testid="new-project"]');
    // ... drag resources, click generate ...
    await expect(page.locator('[data-testid="hcl-output"]')).toContainText('resource "aws_vpc"');
  });
});
```

---

## Fixtures & Test Data

### Backend — `backend/tests/conftest.py`

| Fixture | Purpose |
|---|---|
| `client` | `TestClient` without auth |
| `authenticated_client` | `TestClient` with a valid JWT |
| `db_session` | Per-test SQLAlchemy session on an in-memory SQLite |
| `test_user` | Pre-created user (`testuser` / `testpass`) |
| `test_project` | Pre-created empty project owned by `test_user` |

### Frontend — `frontend/tests/setup.ts`

Global DOM shims, mock handlers, and `@testing-library/jest-dom` matchers.

---

## Troubleshooting

### Tests fail with database errors

Unit tests should use SQLite in memory:

```bash
export DATABASE_URL=sqlite:///:memory:
```

If you need Postgres locally: `docker compose up -d postgres` and point `DATABASE_URL` at it.

### Playwright browsers not installed

```bash
cd frontend
npx playwright install --with-deps
```

### Coverage below threshold

See exactly which lines are uncovered:

```bash
pytest tests/ --cov=app --cov-report=term-missing
```

Front-end:
```bash
npm run test:coverage -- --reporter=verbose
```

### Security scan fails

Update the vulnerable dependency:

```bash
pip-audit --fix                    # backend
npm audit fix                      # frontend
```

If `--fix` can't resolve it, pin a safe version manually in `requirements.txt` / `package.json` and rerun.

---

## Environment Variables

| Variable | Purpose | Default (tests) |
|---|---|---|
| `DATABASE_URL` | DB connection string | `sqlite:///:memory:` |
| `SECRET_KEY` | JWT signing key | `test-secret-key` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `CI` | CI environment flag | `false` |
| `HEADLESS` | Force headless browsers | `true` in CI |

---

## Script Reference

| Script | Purpose |
|---|---|
| `scripts/test-all.sh` | Backend + frontend + contract |
| `scripts/test-backend.sh` | Backend only (`--unit`, `--integration`, `--contract` flags) |
| `scripts/test-frontend.sh` | Frontend Vitest |
| `scripts/test-e2e.sh` | Playwright E2E |
| `scripts/test-a11y.sh` | Accessibility (pa11y-ci) |
| `scripts/load-test.sh` | Locust load test |
| `scripts/security-scan.sh` | `pip-audit`, `npm audit`, `TFSec` |
| `scripts/smoke-test.sh` | Post-deploy smoke checks |
| `scripts/first-run.sh` | New-contributor bootstrap (env + build + compose up) |
