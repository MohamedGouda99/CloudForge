# Quickstart: Production Readiness & Comprehensive Testing

**Feature**: 002-production-readiness-testing
**Date**: 2026-01-14

## Prerequisites

- Docker Desktop with WSL2 backend
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- Git

## Quick Verification

After implementation is complete, verify the feature works with these commands:

### 1. Start Services

```bash
# From Windows (WSL command)
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d"

# Wait for services to be healthy
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose ps"
```

### 2. Verify Health Endpoints

```bash
# Basic health check
curl http://localhost:8000/api/health

# Expected: {"status": "healthy", "timestamp": "...", "version": "..."}

# Readiness check (all dependencies)
curl http://localhost:8000/api/health/ready

# Expected: {"ready": true, "checks": {"database": {"status": "healthy"}, "redis": {"status": "healthy"}}}

# Liveness check
curl http://localhost:8000/api/health/live

# Expected: {"alive": true, "timestamp": "..."}
```

### 3. Verify Metrics Endpoint

```bash
# Prometheus metrics
curl http://localhost:8000/metrics

# Expected: Prometheus-formatted metrics text
# Look for: http_requests_total, http_request_duration_seconds
```

### 4. Run Backend Tests

```bash
# From backend directory
cd backend

# Run all tests with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Expected: 80%+ coverage, all tests passing

# Run specific test types
pytest tests/unit/ -v                    # Unit tests
pytest tests/integration/ -v             # Integration tests
pytest tests/contract/ -v                # Contract tests
```

### 5. Run Frontend Tests

```bash
# From frontend directory
cd frontend

# Run unit tests
npm run test

# Expected: All tests passing

# Run E2E tests (requires running app)
npm run test:e2e

# Expected: All critical user journeys pass
```

### 6. Run Load Tests

```bash
# From backend directory
cd backend

# Run Locust load test (headless mode)
locust -f tests/load/locustfile.py --headless -u 100 -r 10 -t 60s --host http://localhost:8000

# Expected: p95 response time < 2s with 100 users
```

### 7. Run Accessibility Tests

```bash
# From frontend directory
cd frontend

# Run accessibility scan
npm run test:a11y

# Expected: Zero critical/serious violations
```

### 8. Run Security Scans

```bash
# Backend dependencies
cd backend
pip-audit

# Expected: No high/critical vulnerabilities

# Frontend dependencies
cd frontend
npm audit

# Expected: No high/critical vulnerabilities
```

### 9. Verify Configuration Validation

```bash
# Check config validation endpoint (requires auth)
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/config/validate

# Expected: {"valid": true, "results": [...]}
```

### 10. Verify Database Migrations

```bash
# Check migration status
cd backend
alembic current

# Expected: Shows current migration version

# Run pending migrations (if any)
alembic upgrade head

# Expected: "OK" or specific migration applied
```

## Code Quality Verification

### Check Component Sizes

```bash
# No file should exceed 500 lines
find frontend/src -name "*.tsx" -exec wc -l {} + | sort -n | tail -20

# Expected: All files < 500 lines
```

### Check for Debug Statements

```bash
# Should find zero matches in production code
grep -r "console.log" frontend/src --include="*.tsx" --include="*.ts" | grep -v test | wc -l

# Expected: 0
```

### Check Linting

```bash
# Backend
cd backend
flake8 app/
mypy app/

# Expected: Zero errors

# Frontend
cd frontend
npm run lint

# Expected: Zero errors
```

## Success Criteria Checklist

| Criteria | Command | Expected |
|----------|---------|----------|
| SC-001: Max 500 LOC | `wc -l` on components | All < 500 |
| SC-004: 80% backend coverage | `pytest --cov` | ≥ 80% |
| SC-005: 70% frontend coverage | `npm run test:coverage` | ≥ 70% |
| SC-008: 1000 concurrent users | Locust load test | p95 < 2s |
| SC-011: No hardcoded secrets | `grep` for patterns | 0 matches |
| SC-012: No console.log | `grep console.log` | 0 matches |
| SC-015: Zero a11y violations | `npm run test:a11y` | 0 critical |
| SC-020: No vulnerabilities | `npm audit` + `pip-audit` | 0 high/critical |

## Troubleshooting

### Tests Failing

```bash
# Check if services are running
docker compose ps

# Check backend logs
docker logs cloudforge-backend -f

# Check database connection
docker exec cloudforge-backend python -c "from app.core.database import engine; print(engine.url)"
```

### Metrics Not Available

```bash
# Verify prometheus-client is installed
docker exec cloudforge-backend pip show prometheus-client

# Check /metrics endpoint directly
curl -v http://localhost:8000/metrics
```

### Migrations Failing

```bash
# Check current state
alembic current

# Check migration history
alembic history

# Downgrade if needed
alembic downgrade -1
```
