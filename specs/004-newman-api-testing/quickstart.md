# Quickstart: Newman API Testing Suite

**Feature**: 004-newman-api-testing
**Time to First Test**: ~5 minutes

## Prerequisites

- Node.js 20+ installed
- CloudForge backend running locally (Docker Compose recommended)
- npm or yarn available

## Quick Setup

### 1. Install Newman Globally

```bash
npm install -g newman newman-reporter-htmlextra newman-reporter-junitfull
```

### 2. Start Backend (if not running)

```bash
# From CloudForge root directory
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d"
```

### 3. Verify Backend Health

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","environment":"development"}
```

### 4. Run All API Tests

```bash
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/local.postman_environment.json
```

## Common Workflows

### Run Tests with HTML Report

```bash
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./reports/api-test-report.html
```

Then open `reports/api-test-report.html` in your browser.

### Run Specific Folder (Endpoint Group)

```bash
# Test only authentication endpoints
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/local.postman_environment.json \
  --folder "Auth"

# Test only project endpoints
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/local.postman_environment.json \
  --folder "Projects"
```

### Run Tests Against Staging

```bash
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/staging.postman_environment.json
```

### Run with CI-Compatible Output

```bash
newman run postman/collections/cloudforge-api.postman_collection.json \
  --environment postman/environments/local.postman_environment.json \
  --reporters cli,junitfull \
  --reporter-junitfull-export ./reports/api-test-results.xml
```

## Using the Test Runner Script

```bash
# Run all tests (local environment)
./postman/scripts/run-tests.sh

# Run with specific environment
./postman/scripts/run-tests.sh --env staging

# Run specific folder
./postman/scripts/run-tests.sh --folder Auth

# Generate HTML report
./postman/scripts/run-tests.sh --report
```

## Environment Variables

| Variable | Local Default | Description |
|----------|---------------|-------------|
| baseUrl | http://localhost:8000 | API base URL |
| testUsername | admin | Test account username |
| testPassword | admin123 | Test account password |

To override for staging/production, either:
1. Use the appropriate environment file
2. Pass `--env-var` to Newman:

```bash
newman run collection.json \
  --env-var "baseUrl=https://staging.example.com" \
  --env-var "testUsername=ci-user"
```

## Integration Scenarios

### Scenario 1: Pre-Commit Check

Before committing API changes, run the relevant test folder:

```bash
# If you modified auth endpoints
newman run postman/collections/cloudforge-api.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --folder "Auth"

# If you modified project endpoints
newman run postman/collections/cloudforge-api.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --folder "Projects"
```

### Scenario 2: Full Regression Before PR

```bash
newman run postman/collections/cloudforge-api.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./reports/pre-pr-report.html
```

Review the HTML report, then include a summary in your PR description.

### Scenario 3: Debugging Failed CI Tests

1. Download the test report artifact from GitHub Actions
2. Open `api-test-report.html` in browser
3. Find the failed request and examine:
   - Request details (URL, headers, body)
   - Response details (status, body, timing)
   - Failed assertion with error message

### Scenario 4: Adding Tests for New Endpoint

1. Open Postman desktop app
2. Import the collection: `postman/collections/cloudforge-api.postman_collection.json`
3. Navigate to the appropriate folder
4. Add new request with:
   - Descriptive name
   - URL using `{{baseUrl}}` variable
   - Required headers (Authorization: Bearer {{accessToken}})
   - Test scripts from `contracts/test-assertions.md`
5. Export updated collection back to file
6. Run tests to verify

## Troubleshooting

### "Connection refused" errors

Backend is not running. Start it with:
```bash
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d"
```

### "401 Unauthorized" on all requests

Authentication failed. Check:
1. testUsername and testPassword are correct in environment file
2. Backend has admin user created (default: admin/admin123)
3. Login endpoint is working: `curl -X POST http://localhost:8000/api/auth/login -d "username=admin&password=admin123"`

### Tests timeout

Increase request timeout:
```bash
newman run collection.json -e env.json --timeout-request 60000
```

### Response time assertions failing locally

Local development is slower than production. Set responseTimeMultiplier:
```bash
newman run collection.json -e env.json --env-var "responseTimeMultiplier=2"
```

## File Locations

```
postman/
├── collections/
│   └── cloudforge-api.postman_collection.json    # Main test collection
├── environments/
│   ├── local.postman_environment.json            # Local development
│   ├── staging.postman_environment.json          # Staging environment
│   └── production.postman_environment.json       # Production (read-only)
└── scripts/
    └── run-tests.sh                               # Convenience wrapper
```
