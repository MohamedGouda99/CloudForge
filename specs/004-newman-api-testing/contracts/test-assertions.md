# Test Assertion Contracts

This document defines the required test assertions for each endpoint category.

## Standard Assertions (All Requests)

Every request MUST include these baseline assertions:

```javascript
// 1. Status code validation
pm.test("Status code is expected", function() {
    pm.expect(pm.response.code).to.be.oneOf([expectedCodes]);
});

// 2. Response time validation
pm.test("Response time is acceptable", function() {
    const threshold = pm.collectionVariables.get("responseTimeThreshold") || 500;
    const multiplier = pm.environment.get("responseTimeMultiplier") || 1;
    pm.expect(pm.response.responseTime).to.be.below(threshold * multiplier);
});

// 3. Content-Type header validation
pm.test("Content-Type is JSON", function() {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

## Authentication Endpoints

### POST /api/auth/login

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response contains access_token", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("access_token");
    pm.expect(json).to.have.property("token_type", "bearer");
});

pm.test("Token is valid JWT format", function() {
    const json = pm.response.json();
    const parts = json.access_token.split(".");
    pm.expect(parts).to.have.lengthOf(3);
});

// Store token for subsequent requests
const json = pm.response.json();
pm.environment.set("accessToken", json.access_token);
```

### POST /api/auth/register

```javascript
pm.test("Status code is 200 or 201", function() {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response contains user data", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("username");
    pm.expect(json).to.have.property("email");
});

pm.test("Password not returned in response", function() {
    const json = pm.response.json();
    pm.expect(json).to.not.have.property("password");
    pm.expect(json).to.not.have.property("hashed_password");
});
```

### GET /api/auth/me

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response matches user schema", function() {
    const schema = JSON.parse(pm.collectionVariables.get("userSchema"));
    pm.response.to.have.jsonSchema(schema);
});
```

## Project Endpoints

### POST /api/projects/

```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Response contains project with ID", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json.id).to.be.a("number");
});

pm.test("Response matches project schema", function() {
    const schema = JSON.parse(pm.collectionVariables.get("projectSchema"));
    pm.response.to.have.jsonSchema(schema);
});

// Store project ID for subsequent tests
pm.environment.set("testProjectId", pm.response.json().id);
```

### GET /api/projects/

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function() {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
});

pm.test("Each project matches schema", function() {
    const schema = JSON.parse(pm.collectionVariables.get("projectSchema"));
    const json = pm.response.json();
    json.forEach(project => {
        pm.expect(tv4.validate(project, schema)).to.be.true;
    });
});
```

### DELETE /api/projects/{id}

```javascript
pm.test("Status code is 204", function() {
    pm.response.to.have.status(204);
});

pm.test("Response body is empty", function() {
    pm.expect(pm.response.text()).to.be.empty;
});
```

## Terraform Endpoints

### POST /api/terraform/generate/{project_id}

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response time under 2 seconds", function() {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response contains terraform code", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("terraform");
    pm.expect(json.terraform).to.include("terraform");
});
```

### POST /api/terraform/validate/{project_id}

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response contains validation result", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("valid");
    pm.expect(json.valid).to.be.a("boolean");
});
```

## Security Scan Endpoints

### POST /api/terraform/tfsec/{project_id}

```javascript
pm.test("Status code is 200 or 202", function() {
    pm.expect(pm.response.code).to.be.oneOf([200, 202]);
});

pm.test("Response time under 10 seconds", function() {
    pm.expect(pm.response.responseTime).to.be.below(10000);
});

pm.test("Response contains scan results", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("results");
});
```

## Health Endpoints

### GET /health

```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response time under 200ms", function() {
    pm.expect(pm.response.responseTime).to.be.below(200);
});

pm.test("Status is healthy", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("status", "healthy");
});
```

## Error Response Assertions

### 401 Unauthorized

```javascript
pm.test("Status code is 401", function() {
    pm.response.to.have.status(401);
});

pm.test("Error message is present", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("detail");
});
```

### 404 Not Found

```javascript
pm.test("Status code is 404", function() {
    pm.response.to.have.status(404);
});

pm.test("Error message indicates not found", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("detail");
});
```

### 422 Validation Error

```javascript
pm.test("Status code is 422", function() {
    pm.response.to.have.status(422);
});

pm.test("Validation errors are detailed", function() {
    const json = pm.response.json();
    pm.expect(json).to.have.property("detail");
    pm.expect(json.detail).to.be.an("array");
});
```

## Response Time Thresholds by Endpoint Category

| Category | Threshold | Notes |
|----------|-----------|-------|
| Health checks | 200ms | Must be fast for load balancers |
| Authentication | 500ms | Includes password hashing |
| CRUD operations | 500ms | Standard database operations |
| List operations | 1000ms | May involve pagination |
| Terraform generation | 2000ms | Complex processing |
| Security scans | 10000ms | External tool execution |
| Cost estimation | 5000ms | API call to Infracost |
