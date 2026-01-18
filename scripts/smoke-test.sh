#!/bin/bash
#
# CloudForge Smoke Test Script
#
# Runs basic health checks and API tests to verify deployment
#
# Usage: ./scripts/smoke-test.sh [--host URL]
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
HOST="${CLOUDFORGE_HOST:-http://localhost:8000}"
FRONTEND_HOST="${CLOUDFORGE_FRONTEND:-http://localhost:5173}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            HOST="$2"
            shift 2
            ;;
        --frontend)
            FRONTEND_HOST="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CloudForge Smoke Tests              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

FAILED=0

# Health Check
echo -e "${YELLOW}▶ Testing Backend Health...${NC}"
if curl -sf "$HOST/api/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Health endpoint OK${NC}"
else
    echo -e "  ${RED}✗ Health endpoint FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

# Readiness Check (if available)
if curl -sf "$HOST/api/health/ready" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Readiness endpoint OK${NC}"
else
    echo -e "  ${YELLOW}⚠ Readiness endpoint not available${NC}"
fi

# API Response
echo ""
echo -e "${YELLOW}▶ Testing API Endpoints...${NC}"

# Login test
RESPONSE=$(curl -sf -X POST "$HOST/api/auth/login" \
    -d "username=admin&password=admin123" \
    -H "Content-Type: application/x-www-form-urlencoded" 2>/dev/null || echo "")

if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q "access_token"; then
    echo -e "  ${GREEN}✓ Authentication working${NC}"
    TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || echo "")
else
    echo -e "  ${RED}✗ Authentication FAILED${NC}"
    FAILED=$((FAILED + 1))
    TOKEN=""
fi

# Projects endpoint (if authenticated)
if [ -n "$TOKEN" ]; then
    if curl -sf "$HOST/api/projects/" -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Projects endpoint OK${NC}"
    else
        echo -e "  ${RED}✗ Projects endpoint FAILED${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

# Frontend check
echo ""
echo -e "${YELLOW}▶ Testing Frontend...${NC}"
if curl -sf "$FRONTEND_HOST" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend serving${NC}"
else
    echo -e "  ${RED}✗ Frontend not available${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED smoke test(s) failed!${NC}"
    exit 1
fi
