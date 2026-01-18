#!/bin/bash
#
# CloudForge E2E Test Runner
#
# Usage: ./scripts/test-e2e.sh [--browser chromium|firefox|webkit] [--headed] [--debug]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
BROWSER="chromium"
HEADED=false
DEBUG=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test-e2e.sh [--browser chromium|firefox|webkit] [--headed] [--debug]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/frontend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge E2E Tests${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if the app is running
echo -e "${YELLOW}Checking if application is available...${NC}"
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}Application not running on localhost:5173${NC}"
    echo -e "${YELLOW}Start the application first:${NC}"
    echo -e "  docker compose up -d"
    echo -e "  # or"
    echo -e "  cd frontend && npm run dev"
    exit 1
fi
echo -e "${GREEN}Application is running${NC}"
echo ""

# Build playwright command
PLAYWRIGHT_CMD="npx playwright test --project=$BROWSER"

if $HEADED; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
fi

if $DEBUG; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --debug"
fi

echo -e "${BLUE}Running: $PLAYWRIGHT_CMD${NC}"
echo ""

# Run tests
$PLAYWRIGHT_CMD

echo ""
echo -e "${GREEN}E2E tests completed!${NC}"
echo ""
echo -e "${BLUE}View report: npx playwright show-report${NC}"
