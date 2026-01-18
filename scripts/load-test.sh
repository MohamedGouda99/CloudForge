#!/bin/bash
#
# CloudForge Load Test Runner
#
# Usage: ./scripts/load-test.sh [--users 100] [--spawn-rate 10] [--duration 60s] [--host URL]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
USERS=100
SPAWN_RATE=10
DURATION="60s"
HOST="http://localhost:8000"
HEADLESS=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --users|-u)
            USERS="$2"
            shift 2
            ;;
        --spawn-rate|-r)
            SPAWN_RATE="$2"
            shift 2
            ;;
        --duration|-t)
            DURATION="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --ui)
            HEADLESS=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/load-test.sh [--users 100] [--spawn-rate 10] [--duration 60s] [--host URL] [--ui]"
            exit 1
            ;;
    esac
done

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge Load Tests${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if the app is running
echo -e "${YELLOW}Checking if application is available at $HOST...${NC}"
if ! curl -s "$HOST/api/health" > /dev/null 2>&1; then
    echo -e "${RED}Application not responding at $HOST/api/health${NC}"
    echo -e "${YELLOW}Start the application first:${NC}"
    echo -e "  docker compose up -d"
    exit 1
fi
echo -e "${GREEN}Application is running${NC}"
echo ""

# Build locust command
LOCUST_CMD="locust -f tests/load/locustfile.py --host $HOST -u $USERS -r $SPAWN_RATE -t $DURATION"

if $HEADLESS; then
    LOCUST_CMD="$LOCUST_CMD --headless --html=locust-report.html"
    echo -e "${YELLOW}Running load test (headless mode)...${NC}"
else
    echo -e "${YELLOW}Starting Locust web UI at http://localhost:8089${NC}"
fi

echo -e "${BLUE}Configuration:${NC}"
echo "  Users: $USERS"
echo "  Spawn rate: $SPAWN_RATE users/sec"
echo "  Duration: $DURATION"
echo "  Target: $HOST"
echo ""
echo -e "${BLUE}Command: $LOCUST_CMD${NC}"
echo ""

# Run load tests
$LOCUST_CMD

if $HEADLESS; then
    echo ""
    echo -e "${GREEN}Load test completed!${NC}"
    echo -e "${BLUE}Report generated: backend/locust-report.html${NC}"
fi
