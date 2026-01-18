# Testing Infrastructure Quickstart

Get started with CloudForge's testing infrastructure in under 10 minutes.

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker and Docker Compose
- Git

## 1. Install Dependencies

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
npx playwright install chromium  # For E2E tests
```

## 2. Run Your First Tests

### Backend Unit Tests

```bash
cd backend
pytest tests/unit -v
```

Expected output:
```
tests/unit/test_projects.py::TestProjectsCRUD::test_create_project PASSED
tests/unit/test_terraform_generator.py::TestAWSGenerator::test_aws_generator_initialization PASSED
...
64 passed in 12.34s
```

### Frontend Unit Tests

```bash
cd frontend
npm run test
```

Expected output:
```
✓ tests/unit/authStore.test.ts (12 tests)
✓ tests/unit/themeStore.test.ts (10 tests)
...
103 tests passed
```

## 3. Run Tests with Coverage

### Backend Coverage

```bash
cd backend
pytest tests/unit -v --cov=app --cov-report=html
```

Open `htmlcov/index.html` in your browser to view the coverage report.

### Frontend Coverage

```bash
cd frontend
npm run test:coverage
```

Coverage report is generated in `frontend/coverage/`.

## 4. Run Integration Tests

Integration tests require a running database. Use Docker Compose:

```bash
# Start services
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d postgres redis"

# Run tests
cd backend
DATABASE_URL=postgresql://cloudforge:cloudforge@localhost:5432/cloudforge pytest tests/integration -v

# Stop services
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down"
```

## 5. Run E2E Tests

E2E tests require the full application running:

```bash
# Start all services
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d"

# Wait for services to be ready
sleep 30

# Run E2E tests
cd frontend
npx playwright test --project=chromium

# View report
npx playwright show-report
```

## 6. Run Security Scans

```bash
# Backend dependencies
cd backend
pip-audit -r requirements.txt

# Frontend dependencies
cd frontend
npm audit

# Terraform code (if TFSec installed)
tfsec .
```

## 7. Run Load Tests

```bash
cd backend

# With web UI (opens http://localhost:8089)
locust -f locust/locustfile.py --host=http://localhost:8000

# Headless mode
locust -f locust/locustfile.py \
  --host=http://localhost:8000 \
  --users=50 \
  --spawn-rate=5 \
  --run-time=2m \
  --headless
```

## Quick Reference

| Task | Command |
|------|---------|
| Backend unit tests | `pytest backend/tests/unit -v` |
| Frontend unit tests | `npm run test` (in frontend/) |
| All backend tests | `pytest backend/tests/ -v` |
| E2E tests | `npx playwright test` (in frontend/) |
| Backend coverage | `pytest --cov=app --cov-report=html` |
| Frontend coverage | `npm run test:coverage` |
| Security scan | `pip-audit` / `npm audit` |
| Load test | `locust -f locust/locustfile.py` |

## Troubleshooting

### Tests fail with database errors

Ensure you're using SQLite for unit tests:
```bash
DATABASE_URL=sqlite:///:memory: pytest tests/unit -v
```

### Playwright browsers not installed

```bash
cd frontend
npx playwright install --with-deps
```

### Docker services won't start

Check Docker is running:
```bash
wsl.exe -d Ubuntu docker ps
```

### Coverage below threshold

The constitution requires 80% coverage. Run coverage report to find gaps:
```bash
pytest tests/ --cov=app --cov-report=term-missing
```

## Next Steps

1. Read the [Test Command Reference](./contracts/test-commands.md) for all available commands
2. Review [CI Workflow](./contracts/ci-workflow.yml) to understand pipeline stages
3. Check [Data Model](./data-model.md) for test entity definitions
4. See [Research](./research.md) for tool selection rationale
