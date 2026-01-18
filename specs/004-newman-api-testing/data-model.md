# Data Model: Newman API Testing Suite

**Feature**: 004-newman-api-testing
**Date**: 2026-01-14

## Entity Overview

This feature introduces testing infrastructure entities, not application data entities. The data model describes the structure of test artifacts.

## Entities

### 1. Postman Collection

The main test collection containing all API tests.

**Structure** (Postman Collection v2.1 format):

```json
{
  "info": {
    "name": "CloudForge API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [/* folders and requests */],
  "event": [/* collection-level scripts */],
  "variable": [/* collection variables */]
}
```

**Key Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| info.name | string | Collection identifier |
| item | array | Folders containing requests |
| event | array | Pre-request and test scripts at collection level |
| variable | array | Shared variables (schemas, thresholds) |

### 2. Test Request

Individual API test definition within a collection folder.

**Structure**:

```json
{
  "name": "Create Project",
  "request": {
    "method": "POST",
    "header": [],
    "body": {},
    "url": {}
  },
  "event": [
    {
      "listen": "test",
      "script": { "exec": [] }
    },
    {
      "listen": "prerequest",
      "script": { "exec": [] }
    }
  ]
}
```

**Key Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Human-readable test name |
| request.method | string | HTTP method (GET, POST, PUT, DELETE) |
| request.url | object | Endpoint URL with path and query params |
| request.header | array | Request headers including Authorization |
| request.body | object | Request body for POST/PUT |
| event[listen=test] | object | Test assertions script |
| event[listen=prerequest] | object | Pre-request setup script |

### 3. Environment Configuration

Environment-specific variables for targeting different deployments.

**Structure**:

```json
{
  "name": "Local",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:8000", "enabled": true },
    { "key": "testUsername", "value": "admin", "enabled": true },
    { "key": "testPassword", "value": "admin123", "enabled": true },
    { "key": "accessToken", "value": "", "enabled": true },
    { "key": "tokenExpiry", "value": "0", "enabled": true }
  ]
}
```

**Key Variables**:

| Variable | Type | Description |
|----------|------|-------------|
| baseUrl | string | API base URL for target environment |
| testUsername | string | Test account username |
| testPassword | string | Test account password (sensitive) |
| accessToken | string | Cached JWT token (populated at runtime) |
| tokenExpiry | number | Token expiration timestamp (ms) |
| responseTimeMultiplier | number | Threshold adjustment for environment |

### 4. JSON Schema Definition

Response validation schema following JSON Schema draft-07.

**Structure**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 }
  }
}
```

**Key Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| $schema | string | JSON Schema version |
| type | string | Root type (object, array) |
| required | array | Mandatory field names |
| properties | object | Field definitions with types and constraints |

### 5. Test Result Report

Output from Newman execution.

**JUnit XML Structure**:

```xml
<testsuites>
  <testsuite name="CloudForge API" tests="50" failures="0" time="45.2">
    <testcase name="Auth / Login" time="0.234" />
    <testcase name="Projects / Create Project" time="0.456" />
  </testsuite>
</testsuites>
```

**HTML Report Sections**:
- Summary (pass/fail counts, duration)
- Request details (URL, headers, body)
- Response details (status, body, timing)
- Test assertions (pass/fail with messages)

## Relationships

```
Collection (1)
    │
    ├── contains → Folders (N)
    │                  │
    │                  └── contains → Requests (N)
    │                                     │
    │                                     └── validates against → Schema (1)
    │
    └── uses → Environment (1)
                   │
                   └── provides → Variables (N)
```

## Validation Rules

### Collection Validation

- Collection MUST have unique name
- Collection MUST include collection-level auth script
- All requests MUST have at least one test assertion
- Request names MUST be unique within folder

### Environment Validation

- baseUrl MUST be valid URL format
- testUsername and testPassword MUST be non-empty
- accessToken populated only at runtime (empty in file)

### Schema Validation

- All schemas MUST specify $schema version
- Required fields MUST exist in properties
- Type constraints MUST match actual API responses

## State Transitions

### Token Lifecycle

```
[No Token] --login--> [Valid Token] --expire--> [Expired Token] --refresh--> [Valid Token]
     │                      │                         │
     │                      │                         │
     └── auth fails ───────└── request succeeds ─────└── pre-request refresh
```

### Test Execution Flow

```
[Pending] --start--> [Running] --complete--> [Passed]
                         │                      │
                         │                      └── all assertions pass
                         │
                         └── assertion fails --> [Failed]
```
