#!/bin/bash
#
# CloudForge Complete Test Runner
#
# Runs all tests: backend unit/integration/contract, frontend unit, E2E
#
# Usage: ./scripts/test-all.sh [--coverage] [--skip-e2e]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
RUN_COVERAGE=false
SKIP_E2E=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            RUN_COVERAGE=true
            shift
            ;;
        --skip-e2e)
            SKIP_E2E=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test-all.sh [--coverage] [--skip-e2e]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CloudForge Complete Test Suite      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Track overall status
OVERALL_STATUS=0
START_TIME=$(date +%s)

# Run backend tests
echo -e "${YELLOW}▶ Running Backend Tests...${NC}"
echo ""

cd "$PROJECT_ROOT/backend"
export DATABASE_URL="sqlite:///:memory:"
export SECRET_KEY="test-secret-key-for-testing"
export ENVIRONMENT="test"

if $RUN_COVERAGE; then
    pytest tests/ -v --cov=app --cov-report=html --cov-report=term --cov-fail-under=80 || {
        echo -e "${RED}Backend tests failed!${NC}"
        OVERALL_STATUS=1
    }
else
    pytest tests/ -v || {
        echo -e "${RED}Backend tests failed!${NC}"
        OVERALL_STATUS=1
    }
fi

echo ""
echo -e "${GREEN}✓ Backend tests complete${NC}"
echo ""

# Run frontend tests
echo -e "${YELLOW}▶ Running Frontend Tests...${NC}"
echo ""

cd "$PROJECT_ROOT/frontend"

if $RUN_COVERAGE; then
    npm run test:coverage || {
        echo -e "${RED}Frontend tests failed!${NC}"
        OVERALL_STATUS=1
    }
else
    npm run test || {
        echo -e "${RED}Frontend tests failed!${NC}"
        OVERALL_STATUS=1
    }
fi

echo ""
echo -e "${GREEN}✓ Frontend tests complete${NC}"
echo ""

# Run E2E tests if not skipped
if ! $SKIP_E2E; then
    echo -e "${YELLOW}▶ Running E2E Tests...${NC}"
    echo ""

    # Check if the app is running
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        npx playwright test --project=chromium || {
            echo -e "${RED}E2E tests failed!${NC}"
            OVERALL_STATUS=1
        }
        echo -e "${GREEN}✓ E2E tests complete${NC}"
    else
        echo -e "${YELLOW}⚠ Skipping E2E tests - application not running${NC}"
        echo -e "${YELLOW}  Start the app with 'docker compose up' first${NC}"
    fi
    echo ""
fi

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

# Summary
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Test Summary                ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "  Duration: ${MINUTES}m ${SECONDS}s"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "  Status: ${GREEN}ALL TESTS PASSED${NC}"
else
    echo -e "  Status: ${RED}SOME TESTS FAILED${NC}"
fi

echo ""
exit $OVERALL_STATUS
