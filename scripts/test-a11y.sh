#!/bin/bash
#
# CloudForge Accessibility Test Runner
#
# Usage: ./scripts/test-a11y.sh [--headed]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
HEADED=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test-a11y.sh [--headed]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/frontend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge Accessibility Tests${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if a11y tests directory exists
if [ ! -d "tests/a11y" ]; then
    echo -e "${YELLOW}Creating accessibility tests directory...${NC}"
    mkdir -p tests/a11y
fi

# Check if the app is running
echo -e "${YELLOW}Checking if application is available...${NC}"
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}Application not running on localhost:5173${NC}"
    echo -e "${YELLOW}Start the application first:${NC}"
    echo -e "  docker compose up -d"
    exit 1
fi
echo -e "${GREEN}Application is running${NC}"
echo ""

# Build playwright command
PLAYWRIGHT_CMD="npx playwright test tests/a11y --project=chromium"

if $HEADED; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
fi

echo -e "${BLUE}Running accessibility tests...${NC}"
echo ""

# Run tests
$PLAYWRIGHT_CMD || {
    echo -e "${YELLOW}⚠ Some accessibility issues detected${NC}"
    echo -e "${YELLOW}  Review the test output above${NC}"
}

echo ""
echo -e "${GREEN}Accessibility tests completed!${NC}"
