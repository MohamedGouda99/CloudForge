#!/bin/bash
#
# CloudForge Frontend Test Runner
#
# Usage: ./scripts/test-frontend.sh [--coverage] [--watch] [--ui]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
RUN_COVERAGE=false
WATCH_MODE=false
UI_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            RUN_COVERAGE=true
            shift
            ;;
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --ui)
            UI_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test-frontend.sh [--coverage] [--watch] [--ui]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/frontend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge Frontend Tests${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Build npm command
if $UI_MODE; then
    echo -e "${YELLOW}Starting Vitest UI...${NC}"
    npm run test:ui
elif $WATCH_MODE; then
    echo -e "${YELLOW}Starting tests in watch mode...${NC}"
    npm run test:watch
elif $RUN_COVERAGE; then
    echo -e "${YELLOW}Running tests with coverage...${NC}"
    npm run test:coverage
else
    echo -e "${YELLOW}Running unit tests...${NC}"
    npm run test
fi

echo ""
echo -e "${GREEN}Frontend tests completed!${NC}"
