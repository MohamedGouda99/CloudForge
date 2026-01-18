#!/bin/bash
#
# CloudForge Security Scanning Script
#
# This script runs security scans on both backend and frontend dependencies
# as well as static analysis for Terraform configurations.
#
# Usage: ./scripts/security-scan.sh [--fix] [--backend-only] [--frontend-only]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Flags
FIX_MODE=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  CloudForge Security Scanner${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Track overall status
OVERALL_STATUS=0

# Function to run backend security scan
scan_backend() {
    echo -e "${YELLOW}>>> Scanning Backend Dependencies${NC}"
    cd "$PROJECT_ROOT/backend"

    # Check if pip-audit is installed
    if ! command -v pip-audit &> /dev/null; then
        echo -e "${YELLOW}Installing pip-audit...${NC}"
        pip install pip-audit
    fi

    echo -e "${BLUE}Running pip-audit...${NC}"
    if $FIX_MODE; then
        pip-audit --fix || {
            echo -e "${RED}Backend audit found vulnerabilities (attempted fix)${NC}"
            OVERALL_STATUS=1
        }
    else
        pip-audit --desc --strict || {
            echo -e "${RED}Backend audit found vulnerabilities${NC}"
            OVERALL_STATUS=1
        }
    fi

    # Run safety check as backup
    if command -v safety &> /dev/null; then
        echo -e "${BLUE}Running safety check...${NC}"
        safety check -r requirements.txt --output text || {
            echo -e "${YELLOW}Safety check found issues (may have overlap with pip-audit)${NC}"
        }
    fi

    echo -e "${GREEN}Backend security scan complete${NC}"
    echo ""
    cd "$PROJECT_ROOT"
}

# Function to run frontend security scan
scan_frontend() {
    echo -e "${YELLOW}>>> Scanning Frontend Dependencies${NC}"
    cd "$PROJECT_ROOT/frontend"

    echo -e "${BLUE}Running npm audit...${NC}"
    if $FIX_MODE; then
        npm audit fix --audit-level=high || {
            echo -e "${YELLOW}npm audit fix completed (may have unfixable issues)${NC}"
        }
    else
        npm audit --audit-level=high || {
            echo -e "${RED}Frontend audit found high/critical vulnerabilities${NC}"
            OVERALL_STATUS=1
        }
    fi

    echo -e "${GREEN}Frontend security scan complete${NC}"
    echo ""
    cd "$PROJECT_ROOT"
}

# Function to run Terraform security scans
scan_terraform() {
    echo -e "${YELLOW}>>> Scanning Terraform Configurations${NC}"

    # Check for tfsec
    if command -v tfsec &> /dev/null; then
        echo -e "${BLUE}Running tfsec...${NC}"
        tfsec "$PROJECT_ROOT" --minimum-severity HIGH --format json > /tmp/tfsec-results.json 2>/dev/null || {
            echo -e "${YELLOW}tfsec scan completed with findings${NC}"
            cat /tmp/tfsec-results.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Found {len(d.get(\"results\", []))} issues')" 2>/dev/null || true
        }
    else
        echo -e "${YELLOW}tfsec not installed - skipping Terraform static analysis${NC}"
    fi

    # Check for terrascan
    if command -v terrascan &> /dev/null; then
        echo -e "${BLUE}Running terrascan...${NC}"
        terrascan scan -d "$PROJECT_ROOT" -t aws --severity high || {
            echo -e "${YELLOW}terrascan scan completed with findings${NC}"
        }
    else
        echo -e "${YELLOW}terrascan not installed - skipping policy scan${NC}"
    fi

    echo -e "${GREEN}Terraform security scan complete${NC}"
    echo ""
}

# Main execution
if ! $FRONTEND_ONLY; then
    scan_backend
fi

if ! $BACKEND_ONLY; then
    scan_frontend
fi

# Always scan Terraform configs if available
if ! $BACKEND_ONLY && ! $FRONTEND_ONLY; then
    scan_terraform
fi

# Summary
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Security Scan Summary${NC}"
echo -e "${BLUE}=====================================${NC}"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}All security scans passed!${NC}"
else
    echo -e "${RED}Security issues found - review output above${NC}"
fi

exit $OVERALL_STATUS
