# Quickstart: AWS Compute Resource Enhancement

**Feature**: 005-aws-compute-enhancement
**Date**: 2026-01-15
**Purpose**: Developer guide for implementing the unified resource catalog

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- Docker and Docker Compose
- Terraform CLI (for contract tests)

## Project Setup

### 1. Create Shared Resource Catalog Package

```bash
# From repository root
mkdir -p shared/resource-catalog/src/aws
cd shared/resource-catalog

# Initialize package
npm init -y
npm install typescript --save-dev
```

**package.json**:
```json
{
  "name": "@cloudforge/resource-catalog",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:json": "ts-node scripts/generate-json.ts",
    "test": "vitest"
  }
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

### 2. Link Package to Frontend and Backend

```bash
# From shared/resource-catalog
npm link

# From frontend
npm link @cloudforge/resource-catalog

# From backend/src/terraform
npm link @cloudforge/resource-catalog
```

### 3. Generate JSON for Python Backend

```bash
cd shared/resource-catalog
npm run build:json
# Creates: dist/aws/compute.schema.json
```

---

## Key Implementation Files

### Shared Package Structure

```
shared/resource-catalog/
├── src/
│   ├── index.ts              # Re-exports
│   ├── types.ts              # ServiceDefinition, InputAttribute, etc.
│   └── aws/
│       ├── index.ts          # Re-exports all AWS services
│       ├── compute.ts        # EC2, Lambda, ECS, EKS, ASG definitions
│       └── icons.ts          # Icon path constants
├── scripts/
│   └── generate-json.ts      # TS → JSON converter
└── dist/
    └── aws/
        └── compute.schema.json  # Generated for Python
```

### Backend Modifications

```python
# backend/app/services/terraform/schema_loader.py
import json
from pathlib import Path

class SchemaLoader:
    _instance = None
    _schemas = {}

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance._load_schemas()
        return cls._instance

    def _load_schemas(self):
        schema_path = Path(__file__).parent.parent.parent.parent / "shared" / "resource-catalog" / "dist" / "aws"
        for file in schema_path.glob("*.schema.json"):
            with open(file) as f:
                category = file.stem.replace(".schema", "")
                self._schemas[category] = json.load(f)

    def get_resource(self, resource_type: str) -> dict | None:
        for schemas in self._schemas.values():
            for resource in schemas.get("resources", []):
                if resource["terraform_resource"] == resource_type:
                    return resource
        return None
```

### Frontend Modifications

```typescript
// frontend/src/lib/catalog/index.ts
import { awsComputeServices } from '@cloudforge/resource-catalog/aws/compute';
import type { ServiceDefinition } from '@cloudforge/resource-catalog/types';

export function getResourceSchema(resourceType: string): ServiceDefinition | undefined {
  return awsComputeServices.find(s => s.terraform_resource === resourceType);
}

export function getResourcesByCategory(category: string): ServiceDefinition[] {
  return awsComputeServices.filter(s => s.category === category);
}

export function isContainerNode(resourceType: string): boolean {
  const schema = getResourceSchema(resourceType);
  return schema?.classification === 'container';
}
```

---

## Adding a New Compute Resource

### Step 1: Add to Shared Catalog

```typescript
// shared/resource-catalog/src/aws/compute.ts
import type { ServiceDefinition } from '../types';

export const awsAppRunnerService: ServiceDefinition = {
  id: "apprunner_service",
  terraform_resource: "aws_apprunner_service",
  name: "App Runner Service",
  description: "Fully managed container service",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-App-Runner_64.svg",
  category: "compute",
  classification: "icon",
  inputs: {
    required: [
      { name: "service_name", type: "string", description: "Service name" }
    ],
    optional: [
      { name: "auto_deployments_enabled", type: "bool", description: "Auto deploy on push", default: true }
    ],
    blocks: [
      {
        name: "source_configuration",
        description: "Source code or image configuration",
        required: true,
        multiple: false,
        attributes: [
          { name: "auto_deployments_enabled", type: "bool", description: "Auto deploy" }
        ]
      }
    ]
  },
  outputs: [
    { name: "arn", type: "string", description: "Service ARN" },
    { name: "service_url", type: "string", description: "Service URL" }
  ],
  terraform: {
    resourceType: "aws_apprunner_service",
    requiredArgs: ["service_name", "source_configuration"],
    referenceableAttrs: { arn: "arn", service_url: "service_url" }
  }
};

// Export in index
export const awsComputeServices: ServiceDefinition[] = [
  // ... existing services
  awsAppRunnerService,
];
```

### Step 2: Rebuild and Link

```bash
cd shared/resource-catalog
npm run build
npm run build:json
```

### Step 3: Add Tests

```typescript
// shared/resource-catalog/src/aws/__tests__/compute.test.ts
import { describe, it, expect } from 'vitest';
import { awsAppRunnerService, awsComputeServices } from '../compute';

describe('App Runner Service', () => {
  it('has required fields', () => {
    expect(awsAppRunnerService.terraform_resource).toBe('aws_apprunner_service');
    expect(awsAppRunnerService.classification).toBe('icon');
    expect(awsAppRunnerService.inputs.required.length).toBeGreaterThan(0);
  });

  it('is included in compute services', () => {
    expect(awsComputeServices).toContain(awsAppRunnerService);
  });
});
```

---

## Running Tests

### Unit Tests (Schema Validation)

```bash
# Shared package tests
cd shared/resource-catalog
npm test

# Backend tests
cd backend
pytest tests/unit/test_resource_schemas.py -v

# Frontend tests
cd frontend
npm run test -- --filter catalog
```

### Contract Tests (HCL Validation)

```bash
cd backend
pytest tests/contract/test_hcl_generation.py -v --slow
```

This runs `terraform validate` on generated HCL for each resource type.

### Visual Regression Tests

```bash
cd frontend
npx playwright test tests/e2e/compute-resources.spec.ts
```

---

## Common Tasks

### Update Resource Defaults

Edit `shared/resource-catalog/src/aws/compute.ts`:

```typescript
// Change Lambda default memory
{
  name: "memory_size",
  type: "number",
  description: "Memory in MB",
  default: 256,  // Changed from 128
  validation: { min: 128, max: 10240 }
}
```

Then rebuild: `npm run build && npm run build:json`

### Add Relationship Rule

```typescript
// In service definition
relations: {
  edgeRules: [
    {
      whenEdgeKind: "attach",
      direction: "outbound",
      toResourceType: "aws_iam_role",
      apply: [
        { setArg: "role", toTargetAttr: "arn" }
      ]
    }
  ]
}
```

### Verify Icon Path

Icons should follow this pattern:
```
/cloud_icons/AWS/Architecture-Service-Icons_07312025/{Category}/64/{IconFile}
```

Check Cloud_Services directory for available icons.

---

## Troubleshooting

### "Module not found: @cloudforge/resource-catalog"

```bash
# Rebuild and relink
cd shared/resource-catalog
npm run build
npm link

cd frontend
npm link @cloudforge/resource-catalog
```

### "Schema not found for resource type"

1. Check resource is exported in `shared/resource-catalog/src/aws/compute.ts`
2. Verify JSON was regenerated: `npm run build:json`
3. Check Python loaded schemas: `SchemaLoader.get_instance()._schemas`

### "Terraform validate fails"

1. Check required arguments are provided
2. Verify attribute names match Terraform provider 5.x
3. Check nested blocks have correct structure

---

## References

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- [React Flow Documentation](https://reactflow.dev/docs/)
- [Constitution](../../.specify/memory/constitution.md)
