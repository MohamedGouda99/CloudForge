# Test Command Reference

This document defines the CLI commands for running tests locally and in CI.

## Backend Commands

### Unit Tests

```bash
# Run all backend unit tests
cd backend
pytest tests/unit -v

# Run with coverage
pytest tests/unit -v --cov=app --cov-report=html --cov-fail-under=80

# Run specific test file
pytest tests/unit/test_projects.py -v

# Run specific test function
pytest tests/unit/test_projects.py::TestProjectsCRUD::test_create_project -v

# Run tests matching pattern
pytest tests/unit -k "test_create" -v
```

### Integration Tests

```bash
# Run all integration tests (requires PostgreSQL and Redis)
cd backend
pytest tests/integration -v

# Run with specific database
DATABASE_URL=postgresql://user:pass@localhost/test pytest tests/integration -v

# Run specific integration test
pytest tests/integration/test_api_projects.py -v
```

### Contract Tests

```bash
# Run Terraform contract tests
cd backend
pytest tests/contract -v

# Run with verbose output
pytest tests/contract -v --tb=long
```

### All Backend Tests

```bash
# Run complete backend test suite
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Run in parallel (requires pytest-xdist)
pytest tests/ -v -n auto
```

## Frontend Commands

### Unit Tests

```bash
# Run all frontend unit tests
cd frontend
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run specific test file
npm run test -- tests/unit/authStore.test.ts

# Run tests matching pattern
npm run test -- -t "should login"
```

### Component Tests

```bash
# Run component tests
cd frontend
npm run test -- tests/unit/*.test.tsx

# Run with UI (interactive mode)
npm run test:ui
```

### E2E Tests

```bash
# Install Playwright browsers
cd frontend
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### Accessibility Tests

```bash
# Run accessibility tests (part of E2E suite)
cd frontend
npx playwright test tests/e2e/accessibility.spec.ts

# Run with verbose output
npx playwright test tests/e2e/accessibility.spec.ts --reporter=list
```

## Security Scanning Commands

### Backend Security

```bash
# Scan Python dependencies
cd backend
pip-audit -r requirements.txt

# Output as JSON
pip-audit -r requirements.txt --format json --output pip-audit.json

# Fix vulnerabilities (where possible)
pip-audit -r requirements.txt --fix
```

### Frontend Security

```bash
# Scan npm dependencies
cd frontend
npm audit

# Output as JSON
npm audit --json > npm-audit.json

# Fix vulnerabilities (where possible)
npm audit fix

# Force fix (may break dependencies)
npm audit fix --force
```

### Terraform Security

```bash
# Run TFSec
tfsec . --format json --out tfsec-results.json

# Run Terrascan
terrascan scan -i terraform -d . -o json > terrascan-results.json

# Run both (via script)
./scripts/security-scan.sh
```

## Performance Testing Commands

### Load Tests

```bash
# Run Locust load tests (headless)
cd backend
locust -f locust/locustfile.py \
  --host=http://localhost:8000 \
  --users=100 \
  --spawn-rate=10 \
  --run-time=5m \
  --headless \
  --html=load-test-report.html

# Run with web UI
locust -f locust/locustfile.py --host=http://localhost:8000

# Run against staging
locust -f locust/locustfile.py \
  --host=https://staging.cloudforge.example.com \
  --users=500 \
  --spawn-rate=50 \
  --run-time=10m
```

## Combined Test Scripts

### Run All Tests Locally

```bash
# Run everything (script)
./scripts/test-all.sh

# Or manually:
cd backend && pytest tests/ -v --cov=app
cd ../frontend && npm run test:coverage
cd ../frontend && npx playwright test --project=chromium
```

### Pre-Commit Check

```bash
# Quick validation before commit
cd backend && flake8 app && black --check app && mypy app && pytest tests/unit -v
cd frontend && npm run lint && npx tsc --noEmit && npm run test
```

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | Database connection | `sqlite:///:memory:` (tests) |
| `SECRET_KEY` | JWT signing | `test-secret-key` (tests) |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `CI` | CI environment flag | `false` |
| `HEADLESS` | Run browsers headless | `true` in CI |

## CI Pipeline Stage Mapping

| Stage | Commands |
|-------|----------|
| lint-backend | `flake8`, `black --check`, `mypy` |
| lint-frontend | `npm run lint`, `npx tsc --noEmit` |
| test-backend-unit | `pytest tests/unit --cov` |
| test-frontend-unit | `npm run test:coverage` |
| test-integration | `pytest tests/integration` |
| security-backend | `pip-audit` |
| security-frontend | `npm audit` |
| security-terraform | `tfsec` |
| test-e2e | `npx playwright test` |
| build | `npm run build` |
