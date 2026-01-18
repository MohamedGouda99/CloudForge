#!/bin/bash
#
# CloudForge Backend Test Runner
#
# Usage: ./scripts/test-backend.sh [--coverage] [--unit] [--integration] [--contract]
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
RUN_UNIT=true
RUN_INTEGRATION=false
RUN_CONTRACT=false
RUN_ALL=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            RUN_COVERAGE=true
            shift
            ;;
        --unit)
            RUN_UNIT=true
            RUN_ALL=false
            shift
            ;;
        --integration)
            RUN_INTEGRATION=true
            RUN_ALL=false
            shift
            ;;
        --contract)
            RUN_CONTRACT=true
            RUN_ALL=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test-backend.sh [--coverage] [--unit] [--integration] [--contract]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge Backend Tests${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Set test environment
export DATABASE_URL="sqlite:///:memory:"
export SECRET_KEY="test-secret-key-for-testing"
export ENVIRONMENT="test"

# Build pytest command
PYTEST_CMD="pytest"

if $RUN_COVERAGE; then
    PYTEST_CMD="$PYTEST_CMD --cov=app --cov-report=html --cov-report=term --cov-fail-under=80"
fi

# Add verbosity
PYTEST_CMD="$PYTEST_CMD -v"

# Determine test paths
if $RUN_ALL; then
    echo -e "${YELLOW}Running all backend tests...${NC}"
    PYTEST_CMD="$PYTEST_CMD tests/"
else
    PATHS=""
    if $RUN_UNIT; then
        PATHS="$PATHS tests/unit/"
    fi
    if $RUN_INTEGRATION; then
        PATHS="$PATHS tests/integration/"
    fi
    if $RUN_CONTRACT; then
        PATHS="$PATHS tests/contract/"
    fi
    PYTEST_CMD="$PYTEST_CMD $PATHS"
fi

echo -e "${BLUE}Command: $PYTEST_CMD${NC}"
echo ""

# Run tests
$PYTEST_CMD

echo ""
echo -e "${GREEN}Backend tests completed!${NC}"
