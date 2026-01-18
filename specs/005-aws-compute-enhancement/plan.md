# Implementation Plan: AWS Compute Resource Enhancement

**Branch**: `005-aws-compute-enhancement` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-aws-compute-enhancement/spec.md`

## Summary

Enhance AWS compute resource definitions with complete Terraform Registry-accurate schemas, correct AWS icons, visual node classification (icon vs container), valid HCL generation, and comprehensive test baseline. **Critical architectural decision**: Eliminate the current 3-way duplication between frontend, backend Python config, and backend TypeScript catalog by establishing a single source of truth for resource definitions.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.6+ (frontend & TS catalog)
**Primary Dependencies**: FastAPI, React 18, React Flow, Zustand, SQLAlchemy 2.0
**Storage**: PostgreSQL 15 (project diagram_data JSON), Static JSON/TypeScript for schemas
**Testing**: pytest (backend 80%+), vitest (frontend), terraform validate (contract tests)
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: Web application (frontend + backend + TypeScript subprocess)
**Performance Goals**: HCL generation < 3 seconds for 50 resources (SC-009), React Flow 60 FPS with 100 nodes
**Constraints**: Terraform AWS provider 5.x only, offline-capable (static schemas with optional refresh)
**Scale/Scope**: 12 compute resources, ~50 attributes per resource, container/icon visual classification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Code Quality First** | ✓ PASS | TypeScript strict mode for schemas, DRY principle drives single source of truth decision |
| **II. Testing Standards** | ✓ PASS | FR-020/21/22 mandate 90% test coverage, contract tests for HCL output |
| **III. User Experience Consistency** | ✓ PASS | AWS official icons, loading states for schema refresh, error handling for validation |
| **IV. Performance Requirements** | ✓ PASS | SC-009 < 3s generation aligns with Constitution's < 2s for ≤50 resources |
| **Technology Standards** | ✓ PASS | Uses established stack (FastAPI, React 18, TypeScript 5.6+) |

**Constitution Compliance Notes:**
- DRY Principle (I): Current codebase has 3-way duplication—this plan MUST eliminate it
- Test Coverage (II): 90% for HCL generation required per FR-020
- Single Responsibility (I): Unified resource catalog serves one purpose (resource definitions)

## Project Structure

### Documentation (this feature)

```text
specs/005-aws-compute-enhancement/
├── plan.md              # This file
├── research.md          # Phase 0 output - architecture decisions
├── data-model.md        # Phase 1 output - unified schema model
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API schemas
│   ├── resource-catalog.schema.json
│   └── terraform-generation.schema.json
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# UNIFIED RESOURCE CATALOG (Single Source of Truth - NEW)
shared/
└── resource-catalog/
    ├── package.json                    # Shared TypeScript package
    ├── tsconfig.json
    ├── src/
    │   ├── types.ts                    # ServiceDefinition, InputAttribute, etc.
    │   ├── aws/
    │   │   ├── index.ts                # Re-exports all AWS services
    │   │   ├── compute.ts              # EC2, Lambda, ECS, EKS, ASG, etc.
    │   │   ├── compute.schema.json     # Generated JSON for Python consumption
    │   │   └── icons.ts                # Icon path mappings
    │   └── validation.ts               # Schema validation utilities
    └── scripts/
        └── generate-json.ts            # Build step: TS → JSON for Python

# BACKEND MODIFICATIONS
backend/
├── app/
│   ├── api/endpoints/
│   │   └── resources.py                # NEW: /api/resources/catalog endpoint
│   └── services/
│       └── terraform/
│           ├── config.py               # REMOVE: Scattered defaults → use catalog
│           ├── generators/
│           │   └── aws.py              # MODIFY: Load from unified catalog JSON
│           └── schema_loader.py        # NEW: Load JSON schemas at startup
├── src/terraform/
│   └── catalog/                        # REMOVE: Migrate to shared/resource-catalog
└── tests/
    ├── contract/
    │   └── test_hcl_generation.py      # NEW: Terraform validate tests
    └── unit/
        └── test_resource_schemas.py    # NEW: Schema consistency tests

# FRONTEND MODIFICATIONS
frontend/
├── src/
│   ├── lib/
│   │   ├── resources/
│   │   │   ├── awsResources.ts         # REMOVE: Use unified catalog
│   │   │   └── awsResourcesExpanded.ts # REMOVE: Use unified catalog
│   │   └── catalog/
│   │       └── index.ts                # NEW: Import from shared/resource-catalog
│   ├── components/
│   │   └── InspectorPanel.tsx          # MODIFY: Consume unified schemas
│   └── features/
│       └── designer/
│           ├── nodes/
│           │   ├── IconNode.tsx        # Existing (verify icon rendering)
│           │   └── ContainerNode.tsx   # Existing (verify container behavior)
│           └── utils/
│               └── nodeClassifier.ts   # NEW: Icon vs container classification
└── tests/
    ├── unit/
    │   └── catalog.test.ts             # NEW: Schema validation tests
    └── e2e/
        └── compute-resources.spec.ts   # NEW: Visual regression tests
```

**Structure Decision**: Web application with new `shared/resource-catalog` package as single source of truth. This package is consumed by:
1. Frontend via npm import
2. Backend TypeScript generators via npm import
3. Backend Python via generated JSON (build-time artifact)

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New shared package | Eliminates 3-way duplication | Keeping duplication violates Constitution DRY principle |
| JSON generation step | Python can't import TypeScript directly | Build-time generation has negligible overhead |

## Architecture Decision: Single Source of Truth

### Problem Statement

Current codebase has severe duplication:
- **Frontend**: `awsResources.ts`, `awsResourcesExpanded.ts`, `computeServicesData.ts`
- **Backend Python**: `config.py` (defaults), `generators/aws.py` (resource list)
- **Backend TypeScript**: `awsComputeWithRules.ts`, `awsComputeComplete.ts`

This causes:
- Inconsistent defaults (e.g., instance_type: frontend omits, Python says "t3.micro")
- Missing fields (Lambda has no fields in frontend expanded)
- Different icon paths (/api/icons vs /cloud_icons)
- Maintenance burden (3x updates for each new resource)

### Solution: Unified TypeScript Catalog

```
shared/resource-catalog/src/aws/compute.ts
        │
        ├──────────────────────────┬────────────────────────────┐
        ▼                          ▼                            ▼
   Frontend                  Backend TS Generator         Backend Python
   (npm import)              (npm import)                 (JSON import)
```

**Key Benefits:**
1. **Single update point** for all resource metadata
2. **Type safety** across frontend and TypeScript backend
3. **Build-time JSON** for Python consumption (no runtime overhead)
4. **Relationship rules** available to frontend (currently isolated)
5. **Icon paths** unified across all consumers

### Migration Strategy

1. Create `shared/resource-catalog` package with complete compute service definitions
2. Frontend imports directly from shared package
3. Backend TypeScript imports directly from shared package
4. Build script generates `compute.schema.json` for Python
5. Python `schema_loader.py` loads JSON at startup
6. Remove deprecated files:
   - `frontend/src/lib/resources/awsResources.ts`
   - `frontend/src/lib/resources/awsResourcesExpanded.ts`
   - `backend/app/services/terraform/config.py` (defaults only)
   - `backend/src/terraform/catalog/awsComputeWithRules.ts`
   - `backend/src/terraform/catalog/awsComputeComplete.ts`

## Resource Classification: Icon vs Container

| Resource | Classification | Behavior |
|----------|---------------|----------|
| aws_instance | Icon | Fixed size, connection points for edges |
| aws_lambda_function | Icon | Fixed size, connection points for edges |
| aws_launch_template | Icon | Fixed size, referenced by ASG |
| aws_autoscaling_group | Icon | Fixed size, connects to launch template |
| aws_ecs_cluster | **Container** | Can contain ECS services |
| aws_ecs_service | Icon | Must be inside ECS cluster |
| aws_ecs_task_definition | Icon | Referenced by ECS service |
| aws_eks_cluster | **Container** | Can contain node groups |
| aws_eks_node_group | Icon | Must be inside EKS cluster |
| aws_elastic_beanstalk_application | Icon | Fixed size |
| aws_apprunner_service | Icon | Fixed size |
| aws_batch_job_definition | Icon | Fixed size |

## API Contract: Resource Catalog Endpoint

```yaml
GET /api/resources/catalog?provider=aws&category=compute

Response:
{
  "version": "5.x",
  "lastUpdated": "2026-01-15T00:00:00Z",
  "provider": "aws",
  "category": "compute",
  "resources": [
    {
      "type": "aws_instance",
      "label": "EC2 Instance",
      "description": "Virtual server in the cloud",
      "icon": "/cloud_icons/AWS/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
      "classification": "icon",
      "inputs": {
        "required": [
          {"name": "ami", "type": "string", "description": "AMI ID"}
        ],
        "optional": [...],
        "blocks": [...]
      },
      "outputs": [
        {"name": "id", "type": "string"},
        {"name": "public_ip", "type": "string"}
      ],
      "relations": {
        "containment": [],
        "edges": [...]
      }
    }
  ]
}
```

## Test Strategy

### Contract Tests (HCL Validation)
```python
# backend/tests/contract/test_hcl_generation.py
@pytest.mark.parametrize("resource_type", COMPUTE_RESOURCES)
def test_hcl_validates(resource_type, minimal_config):
    """Generated HCL passes terraform validate"""
    hcl = generator.generate(resource_type, minimal_config)
    result = subprocess.run(["terraform", "validate"], cwd=temp_dir)
    assert result.returncode == 0
```

### Schema Consistency Tests
```python
# backend/tests/unit/test_resource_schemas.py
def test_schema_has_all_required_fields():
    """Every resource has type, label, icon, inputs"""
    for resource in catalog.resources:
        assert resource.type.startswith("aws_")
        assert resource.label
        assert resource.icon
        assert resource.inputs.required is not None
```

### Visual Regression Tests
```typescript
// frontend/tests/e2e/compute-resources.spec.ts
test('EC2 instance renders with correct icon', async ({ page }) => {
  await page.dragAndDrop('[data-resource="aws_instance"]', 'canvas');
  await expect(page.locator('[data-node-type="aws_instance"] img'))
    .toHaveAttribute('src', /Arch_Amazon-EC2_64\.svg/);
});
```

## Phase Summary

| Phase | Output | Key Deliverables |
|-------|--------|------------------|
| Phase 0 | research.md | Architecture decisions, duplication elimination strategy |
| Phase 1 | data-model.md, contracts/ | Unified schema types, API contracts |
| Phase 2 | tasks.md | Implementation tasks (via /speckit.tasks) |
