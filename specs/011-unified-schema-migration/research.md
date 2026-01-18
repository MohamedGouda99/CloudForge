# Research: Unified Cloud Provider Schema Migration

**Feature**: 011-unified-schema-migration
**Created**: 2026-01-18

## Technical Investigation Summary

This document resolves technical unknowns identified during specification analysis.

---

## 1. Existing Schema Architecture

### 1.1 AWS Schemas (Source of Truth Pattern)

**Location**: `shared/resource-catalog/src/aws/`

**Structure**:
- Individual TypeScript files per resource (e.g., `compute/ec2.ts`, `networking/vpc.ts`)
- Category-level index files that aggregate resources
- Main `aws/index.ts` that exports all resources
- Compiled to JSON schemas in `dist/schemas/*.schema.json`

**Key Findings**:
- 9 categories currently implemented: compute, containers, networking, storage, database, security, messaging, management, developer-tools
- ~50+ AWS resources defined with full ServiceDefinition compliance
- Uses `icons.ts` for centralized icon path management
- Includes `relations` field with containmentRules, edgeRules, autoResolveRules, validChildren

### 1.2 GCP Schemas (Frontend Location)

**Location**: `frontend/src/lib/gcp/`

**Files** (12 categories):
- computeServicesData.ts (10 resources)
- storageServicesData.ts
- databaseServicesData.ts
- networkingServicesData.ts
- securityServicesData.ts
- analyticsServicesData.ts
- containersServicesData.ts
- developerToolsServicesData.ts
- machineLearningServicesData.ts
- managementServicesData.ts
- messagingServicesData.ts
- serverlessServicesData.ts

**Current Interface** (GCPComputeServiceDefinition):
```typescript
{
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}
```

**Gap Analysis vs ServiceDefinition**:
- Missing: `category` field
- Missing: `classification` field ('icon' | 'container')
- Missing: `terraform` metadata block
- Missing: `relations` field (containmentRules, edgeRules, etc.)
- Has: All input/output fields (compatible structure)

### 1.3 Azure Schemas

**Current State**: No Azure schemas exist in codebase. Must be created from scratch.

**Reference**: Terraform AzureRM Provider documentation

---

## 2. Backend Schema Loader Analysis

**File**: `backend/app/services/terraform/schema_loader.py`

**Current Behavior**:
- Loads JSON schemas from `shared/resource-catalog/dist/schemas/*.schema.json`
- Singleton pattern with lazy initialization
- Indexes resources by `terraform_resource` for O(1) lookup
- Only supports AWS provider (hardcoded check at line 139)

**Required Changes for Multi-Provider**:
1. Add provider parameter to schema loading
2. Create separate schema directories per provider: `dist/schemas/aws/`, `dist/schemas/gcp/`, `dist/schemas/azure/`
3. Update indexing to include provider prefix or nested structure
4. Update `get_all_resources()` to filter by provider

---

## 3. Catalog API Analysis

**File**: `backend/app/api/endpoints/catalog.py`

**Current Endpoints**:
- `GET /api/catalog/` - List all resources (supports `?category=`, `?classification=`)
- `GET /api/catalog/{terraform_resource}` - Single resource lookup
- `GET /api/catalog/containers/list` - List container types
- `GET /api/catalog/icons/list` - List icon types
- `GET /api/catalog/categories/list` - List categories
- `GET /api/catalog/containment/{terraform_resource}` - Containment rules
- `POST /api/catalog/validate-containment` - Validate containment

**Required Changes**:
1. Add `?provider=aws|gcp|azure` query parameter to all list endpoints
2. Update CatalogResponse model to include provider field dynamically
3. Handle unsupported provider with 400 error

---

## 4. Icon Path Strategy

### 4.1 AWS Icons
**Path Pattern**: `/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_{Category}/64/Arch_{Service}_64.svg`
**Status**: Already configured in `shared/resource-catalog/src/aws/icons.ts`

### 4.2 GCP Icons
**Path Patterns**:
- Legacy: `/cloud_icons/GCP/google-cloud-legacy-icons/{service}/{service}.svg`
- Core Products: `/cloud_icons/GCP/core-products-icons/Unique Icons/{Service}/SVG/{Service}-512-color-rgb.svg`
**Status**: Already updated in frontend GCP service files with individual icons

### 4.3 Azure Icons
**Path Pattern**: `/cloud_icons/Azure/{Category}/{Service}.svg` (to be verified)
**Status**: Icons exist at `Cloud_Services/Azure/` but need path verification

---

## 5. ServiceDefinition Interface Requirements

**Target Interface** (from `shared/resource-catalog/src/types.ts`):

```typescript
interface ServiceDefinition {
  id: string;                          // ✓ GCP has
  terraform_resource: string;          // ✓ GCP has
  name: string;                        // ✓ GCP has
  description: string;                 // ✓ GCP has
  icon: string;                        // ✓ GCP has
  category: ServiceCategory;           // ✗ GCP needs to add
  classification: 'icon' | 'container'; // ✗ GCP needs to add
  inputs: InputSchema;                 // ✓ GCP has (compatible structure)
  outputs: OutputAttribute[];          // ✓ GCP has
  terraform: TerraformMetadata;        // ✗ GCP needs to add
  relations?: RelationshipRules;       // ✗ GCP can omit initially
}
```

---

## 6. Migration Approach Decision

### Option A: Transform at Build Time
Transform GCP TypeScript to JSON schemas matching AWS pattern during `npm run build`.

**Pros**: Single source of truth, type-safe
**Cons**: Requires updating GCP files to match ServiceDefinition

### Option B: Runtime Transformation
Keep GCP files as-is, transform to ServiceDefinition format when loading.

**Pros**: Minimal file changes
**Cons**: Runtime overhead, dual maintenance

### Decision: **Option A - Build Time Transformation**
Rationale: Ensures type safety, catches schema issues at compile time, consistent with AWS pattern.

---

## 7. Frontend Integration Strategy

### 7.1 Current Frontend Schema Usage
- `ResourcePalette.tsx` imports from `frontend/src/lib/resources/index.ts`
- `InspectorPanel.tsx` uses schema for property editing
- `DesignerPageFinal.tsx` uses schemas for node creation

### 7.2 React Query Integration
**Selected Strategy**: React Query / TanStack Query with stale-while-revalidate

**Implementation Pattern**:
```typescript
// frontend/src/lib/catalog/hooks.ts
export function useCatalog(provider: string) {
  return useQuery({
    queryKey: ['catalog', provider],
    queryFn: () => fetchCatalog(provider),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

---

## 8. Azure Resource Scope

Per clarification: Core 5 categories with 3-5 resources each (15-25 total).

### Proposed Azure Resources:

**Compute (5)**:
- azurerm_virtual_machine
- azurerm_virtual_machine_scale_set
- azurerm_function_app
- azurerm_app_service
- azurerm_container_instance

**Storage (4)**:
- azurerm_storage_account
- azurerm_storage_container
- azurerm_storage_blob
- azurerm_managed_disk

**Database (4)**:
- azurerm_sql_server
- azurerm_sql_database
- azurerm_cosmosdb_account
- azurerm_redis_cache

**Networking (5)**:
- azurerm_virtual_network
- azurerm_subnet
- azurerm_network_security_group
- azurerm_public_ip
- azurerm_load_balancer

**Security (3)**:
- azurerm_key_vault
- azurerm_key_vault_secret
- azurerm_user_assigned_identity

**Total**: 21 resources (within 15-25 target)

---

## 9. Build System Integration

**Current Build Process** (`shared/resource-catalog/package.json`):
- TypeScript compilation: `tsc`
- Schema generation: Custom script to extract JSON from compiled JS

**Required Updates**:
1. Add GCP directory structure mirroring AWS
2. Add Azure directory structure
3. Update schema generation to output per-provider JSON files
4. Update backend schema loader paths

---

## 10. Risk Analysis

| Risk | Mitigation |
|------|------------|
| Schema format incompatibility | Strict TypeScript interfaces + CI validation |
| Frontend breaking changes | Gradual migration with feature flag |
| API response size for large catalogs | Pagination support + client-side caching |
| Icon path mismatches | Automated icon path validation script |
| Missing GCP/Azure blocks or inputs | Reference Terraform Registry for completeness |

---

## Resolved Questions

1. **Q**: How should provider filtering work in the API?
   **A**: Query parameter `?provider=aws|gcp|azure` with default 'aws' for backwards compatibility.

2. **Q**: What is the Azure scope?
   **A**: 5 core categories (compute, storage, database, networking, security) with 3-5 resources each.

3. **Q**: What caching strategy for frontend?
   **A**: React Query with stale-while-revalidate pattern.

4. **Q**: How to handle GCP schema differences?
   **A**: Migrate GCP files to match ServiceDefinition interface in shared catalog.

5. **Q**: Where should Azure icons come from?
   **A**: `Cloud_Services/Azure/` directory, copied to `frontend/public/cloud_icons/Azure/`.
