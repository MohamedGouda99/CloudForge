# Migration Guide: Python to TypeScript Terraform Generator

## Overview

This document outlines the migration from the Python-based Terraform generator to the new TypeScript data-driven generator.

## Current State (Python Backend)

### Files to be Deprecated

```
backend/app/services/terraform/
├── generator.py                  # OLD: 1,200+ lines with hardcoded logic
├── schema_driven_generator.py    # OLD: Partial attempt at generic generator
├── schema_loader.py              # OLD: Schema loading utilities
├── value_detector.py             # OLD: Value type detection
└── __init__.py
```

### Current Dependencies

```python
# backend/app/api/endpoints/terraform.py
from app.services.terraform.generator import TerraformGenerator

# backend/app/services/ai/tasks.py
from app.services.terraform.generator import TerraformGenerator

# backend/app/api/endpoints/security.py
from app.api.endpoints.terraform import ensure_terraform_files
```

## New State (TypeScript Backend)

### New File Structure

```
backend/src/terraform/
├── types.ts                      # ALL type definitions
├── registry.ts                   # Service catalog registry
├── graph.ts                      # Graph builder
├── infer.ts                      # Inference engine
├── render.ts                     # HCL renderer
├── generate.ts                   # Main orchestrator
├── index.ts                      # Public API
├── catalog/
│   └── awsComputeWithRules.ts    # Example with relationship rules
├── __tests__/
│   └── generator.test.ts         # Comprehensive tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Migration Strategy

### Option 1: Hybrid Approach (Recommended for MVP)

Keep Python FastAPI backend, call TypeScript generator via subprocess.

**Pros**:
- Minimal disruption to existing API
- Can migrate incrementally
- Both generators can coexist during transition

**Cons**:
- Slight overhead from subprocess calls
- More complex deployment

**Implementation**:

```python
# backend/app/services/terraform/ts_generator.py
import subprocess
import json
from pathlib import Path

class TypeScriptTerraformGenerator:
    """Wrapper to call TypeScript generator from Python"""

    def __init__(self):
        self.ts_generator_path = Path(__file__).parent.parent.parent.parent / "src" / "terraform"

    def generate(self, diagram: dict) -> dict:
        """
        Generate Terraform code using TypeScript generator

        Args:
            diagram: Dictionary with nodes and edges

        Returns:
            Dictionary with mainTf, diagnostics, etc.
        """
        # Write diagram to temp file
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(diagram, f)
            input_file = f.name

        try:
            # Call TypeScript generator
            result = subprocess.run(
                ['node', '--loader', 'tsx', 'cli.ts', input_file],
                cwd=self.ts_generator_path,
                capture_output=True,
                text=True,
                check=True
            )

            # Parse output
            output = json.loads(result.stdout)
            return output

        finally:
            # Cleanup temp file
            Path(input_file).unlink(missing_ok=True)
```

**Update FastAPI endpoint**:

```python
# backend/app/api/endpoints/terraform.py
from app.services.terraform.ts_generator import TypeScriptTerraformGenerator

# ... existing code ...

@router.post("/generate")
async def generate_terraform(request: TerraformGenerateRequest):
    """Generate Terraform code from diagram"""

    # Use TypeScript generator
    ts_generator = TypeScriptTerraformGenerator()

    diagram = {
        "nodes": [node.dict() for node in request.nodes],
        "edges": [edge.dict() for edge in request.edges],
    }

    result = ts_generator.generate(diagram)

    return {
        "mainTf": result["mainTf"],
        "diagnostics": result["diagnostics"],
    }
```

### Option 2: Full Rewrite to Node.js/Express

Replace FastAPI with Express.js backend.

**Pros**:
- Single language stack
- Better performance (no subprocess overhead)
- Easier to maintain

**Cons**:
- Major rewrite required
- Need to migrate all endpoints
- Database ORM changes (SQLAlchemy → TypeORM/Prisma)

**Implementation**: (Outline only)

```typescript
// backend/src/api/routes/terraform.ts
import express from "express";
import { TerraformGenerator } from "../terraform";
import { globalRegistry } from "../terraform";

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { nodes, edges } = req.body;

  const generator = new TerraformGenerator(globalRegistry);
  const result = generator.generate({ nodes, edges });

  res.json({
    mainTf: result.mainTf,
    diagnostics: result.diagnostics,
  });
});

export default router;
```

### Option 3: Microservice Architecture

Run TypeScript generator as a separate microservice.

**Pros**:
- Clear separation of concerns
- Can scale independently
- Multiple backends can use same generator

**Cons**:
- Network overhead
- More complex deployment
- Need to handle service discovery

**Implementation**:

```typescript
// backend/src/terraform/server.ts
import express from "express";
import { TerraformGenerator } from "./generate";
import { globalRegistry } from "./registry";
import { awsComputeServicesWithRules } from "./catalog/awsComputeWithRules";

const app = express();
app.use(express.json());

// Initialize registry
globalRegistry.registerBulk(awsComputeServicesWithRules);

const generator = new TerraformGenerator(globalRegistry);

app.post("/generate", (req, res) => {
  try {
    const diagram = req.body;
    const result = generator.generate(diagram);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Terraform Generator Service listening on port 3001");
});
```

**Python client**:

```python
# backend/app/services/terraform/microservice_client.py
import requests

class TerraformGeneratorClient:
    def __init__(self, service_url="http://localhost:3001"):
        self.service_url = service_url

    def generate(self, diagram: dict) -> dict:
        response = requests.post(
            f"{self.service_url}/generate",
            json=diagram,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
```

## Migration Steps

### Phase 1: Setup TypeScript Generator (COMPLETED ✅)

- [x] Create TypeScript generator in `backend/src/terraform/`
- [x] Implement core engine (graph, infer, render, generate)
- [x] Write comprehensive tests
- [x] Add example service catalog with rules
- [x] Document architecture

### Phase 2: Integration (NEXT)

Choose one of the three options above and implement:

**For Option 1 (Recommended)**:

1. Create CLI wrapper for TypeScript generator:

```typescript
// backend/src/terraform/cli.ts
import { readFileSync } from "fs";
import { generateTerraform } from "./generate";
import { globalRegistry } from "./registry";
import { awsComputeServicesWithRules } from "./catalog/awsComputeWithRules";

const inputFile = process.argv[2];
const diagram = JSON.parse(readFileSync(inputFile, "utf-8"));

globalRegistry.registerBulk(awsComputeServicesWithRules);

const result = generateTerraform(diagram, globalRegistry);

console.log(JSON.stringify(result));
```

2. Create Python wrapper (code above)

3. Update FastAPI endpoint to use wrapper

4. Test with existing frontend

### Phase 3: Extend Service Catalog

1. Add relationship rules to all AWS services:
   - Networking (VPC, Subnet, Route Table, IGW, NAT Gateway)
   - Compute (already done)
   - Security (Security Groups, IAM, KMS)
   - Storage (S3, EBS, EFS)
   - Database (RDS, DynamoDB, ElastiCache)
   - Containers (ECS, EKS, ECR)
   - Serverless (Lambda, API Gateway, Step Functions)
   - Messaging (SQS, SNS, EventBridge)

2. Add Azure services

3. Add GCP services

### Phase 4: Deprecate Old Code

1. Mark old Python generator as deprecated:

```python
# backend/app/services/terraform/generator.py
import warnings

class TerraformGenerator:
    """
    DEPRECATED: This generator is deprecated and will be removed in v2.0.
    Use TypeScriptTerraformGenerator instead.
    """

    def __init__(self):
        warnings.warn(
            "TerraformGenerator is deprecated. Use TypeScriptTerraformGenerator.",
            DeprecationWarning,
            stacklevel=2
        )
```

2. Remove files after full migration:
   - `generator.py`
   - `schema_driven_generator.py`
   - `schema_loader.py`
   - `value_detector.py`

### Phase 5: Production Deployment

1. Update CI/CD pipeline to:
   - Install Node.js dependencies
   - Run TypeScript tests
   - Build TypeScript generator
   - Deploy with Python backend

2. Add monitoring for:
   - Generation success rate
   - Diagnostic distribution
   - Performance metrics

3. Document for ops team

## Files to Remove (After Migration)

```bash
# Deprecated Python generators
rm backend/app/services/terraform/generator.py
rm backend/app/services/terraform/schema_driven_generator.py
rm backend/app/services/terraform/schema_loader.py
rm backend/app/services/terraform/value_detector.py

# Keep only minimal Python wrapper
# backend/app/services/terraform/
# ├── __init__.py
# └── ts_generator.py  # Python wrapper to call TypeScript generator
```

## Performance Comparison

### Old Python Generator

- **Lines of Code**: 1,200+ in generator.py alone
- **Complexity**: O(n²) in some cases due to nested loops
- **Extensibility**: Requires code changes for each new service
- **Test Coverage**: Limited

### New TypeScript Generator

- **Lines of Code**: ~600 total (across all modules)
- **Complexity**: O(n) for most operations
- **Extensibility**: Zero code changes - just add catalog entries
- **Test Coverage**: Comprehensive (6+ scenarios)

## Rollback Plan

If issues arise during migration:

1. Switch FastAPI endpoint back to old Python generator
2. Keep both generators deployed
3. Gradual rollout using feature flags
4. A/B test with subset of users

## Success Metrics

- [ ] All existing frontend tests pass
- [ ] All new test scenarios pass (6+)
- [ ] Performance ≥ old generator
- [ ] 100% feature parity
- [ ] Zero regression in existing functionality
- [ ] Diagnostic quality improved

## Timeline

- **Week 1**: Integration (Option 1 implementation)
- **Week 2-3**: Extend service catalog (all AWS services)
- **Week 4**: Testing and validation
- **Week 5**: Production deployment
- **Week 6**: Deprecate old code

## Support

For questions or issues during migration:

1. Check `backend/src/terraform/README.md`
2. Review test examples in `__tests__/generator.test.ts`
3. Refer to catalog examples in `catalog/awsComputeWithRules.ts`

## Conclusion

The new TypeScript generator is:

- **Generic**: No cloud-specific logic
- **Data-Driven**: All intelligence in catalog
- **Extensible**: Add services without code changes
- **Tested**: Comprehensive test coverage
- **Maintainable**: Clean architecture, well-documented

The migration should be straightforward using Option 1 (Hybrid Approach), with minimal disruption to existing functionality.
