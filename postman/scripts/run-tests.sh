#!/bin/bash
# CloudForge API Test Runner
# Usage: ./run-tests.sh [options]
#
# Options:
#   --env <environment>   Environment to test against: local (default), staging
#   --folder <name>       Run tests only in a specific folder (e.g., Auth, Projects)
#   --report              Generate HTML report
#   --ci                  CI mode: generate JUnit XML report
#   --verbose             Enable verbose output
#   --help                Show this help message

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POSTMAN_DIR="$(dirname "$SCRIPT_DIR")"
COLLECTION_PATH="$POSTMAN_DIR/collections/cloudforge-api.postman_collection.json"

# Defaults
ENVIRONMENT="local"
FOLDER=""
REPORT=false
CI_MODE=false
VERBOSE=false
TIMEOUT=30000

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --folder)
            FOLDER="$2"
            shift 2
            ;;
        --report)
            REPORT=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --help)
            head -20 "$0" | tail -17
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate environment
ENV_FILE="$POSTMAN_DIR/environments/${ENVIRONMENT}.postman_environment.json"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: Environment file not found: $ENV_FILE"
    echo "Available environments: local, staging"
    exit 1
fi

# Validate collection
if [[ ! -f "$COLLECTION_PATH" ]]; then
    echo "Error: Collection file not found: $COLLECTION_PATH"
    exit 1
fi

# Build newman command
NEWMAN_CMD="newman run \"$COLLECTION_PATH\" -e \"$ENV_FILE\" --timeout-request $TIMEOUT"

# Add folder filter if specified
if [[ -n "$FOLDER" ]]; then
    NEWMAN_CMD="$NEWMAN_CMD --folder \"$FOLDER\""
fi

# Add reporters
if [[ "$CI_MODE" == true ]]; then
    mkdir -p "$POSTMAN_DIR/../reports"
    NEWMAN_CMD="$NEWMAN_CMD --reporters cli,junitfull --reporter-junitfull-export \"$POSTMAN_DIR/../reports/api-test-results.xml\""
elif [[ "$REPORT" == true ]]; then
    mkdir -p "$POSTMAN_DIR/../reports"
    NEWMAN_CMD="$NEWMAN_CMD --reporters cli,htmlextra --reporter-htmlextra-export \"$POSTMAN_DIR/../reports/api-test-report.html\""
fi

# Add verbose flag
if [[ "$VERBOSE" == true ]]; then
    NEWMAN_CMD="$NEWMAN_CMD --verbose"
fi

# Print configuration
echo "================================================"
echo "CloudForge API Test Runner"
echo "================================================"
echo "Environment: $ENVIRONMENT"
echo "Collection:  $(basename "$COLLECTION_PATH")"
if [[ -n "$FOLDER" ]]; then
    echo "Folder:      $FOLDER"
fi
if [[ "$REPORT" == true ]]; then
    echo "Report:      HTML (reports/api-test-report.html)"
fi
if [[ "$CI_MODE" == true ]]; then
    echo "Report:      JUnit XML (reports/api-test-results.xml)"
fi
echo "================================================"
echo ""

# Run newman
echo "Running: $NEWMAN_CMD"
echo ""
eval "$NEWMAN_CMD"

# Print report location
if [[ "$REPORT" == true ]]; then
    echo ""
    echo "HTML report generated: $POSTMAN_DIR/../reports/api-test-report.html"
fi
if [[ "$CI_MODE" == true ]]; then
    echo ""
    echo "JUnit report generated: $POSTMAN_DIR/../reports/api-test-results.xml"
fi
