# Implementation Plan: Unified Cloud Provider Schema Migration

**Feature**: 011-unified-schema-migration
**Created**: 2026-01-18
**Status**: Ready for Implementation

## Executive Summary

This plan migrates all cloud provider schemas (AWS, GCP, Azure) to a unified `shared/resource-catalog` structure, enabling the backend API to serve schemas for all providers via `/api/catalog/?provider=`. The frontend will fetch schemas dynamically instead of bundling them.

---

## Implementation Phases

### Phase 1: GCP Schema Migration to Shared Catalog

**Objective**: Migrate 12 GCP service categories from `frontend/src/lib/gcp/` to `shared/resource-catalog/src/gcp/`

#### Step 1.1: Create GCP Directory Structure
- Create `shared/resource-catalog/src/gcp/` directory
- Create subdirectories for each category (compute, networking, storage, database, security, containers, serverless, analytics, messaging, management, developer-tools, machine-learning)
- Create `icons.ts` with GCP icon path constants
- Create `index.ts` as main export file

#### Step 1.2: Migrate GCP Compute Services
- Transform `frontend/src/lib/gcp/computeServicesData.ts` to ServiceDefinition format
- Add missing fields: `category`, `classification`, `terraform` metadata
- Create individual resource files (compute-instance.ts, instance-template.ts, etc.)
- Preserve all inputs, blocks, and outputs

#### Step 1.3: Migrate GCP Networking Services
- Transform `networkingServicesData.ts` to ServiceDefinition format
- Resources: VPC, Subnet, Firewall, Router, DNS Zone, etc.
- Add containment rules for VPC/Subnet hierarchy

#### Step 1.4: Migrate GCP Storage Services
- Transform `storageServicesData.ts` to ServiceDefinition format
- Mark GCS Bucket as container type

#### Step 1.5: Migrate GCP Database Services
- Transform `databaseServicesData.ts` to ServiceDefinition format
- Resources: Cloud SQL, Spanner, Firestore, Bigtable, Memorystore

#### Step 1.6: Migrate GCP Security Services
- Transform `securityServicesData.ts` to ServiceDefinition format
- Resources: IAM, KMS, Secret Manager

#### Step 1.7: Migrate Remaining GCP Categories
- Containers: GKE Cluster, Node Pool, Artifact Registry
- Serverless: Cloud Run, Cloud Functions, App Engine
- Analytics: BigQuery, Dataflow, Dataproc
- Messaging: Pub/Sub Topic, Subscription, Schema
- Management: Cloud Monitoring, Cloud Logging
- Developer Tools: Cloud Build, Source Repositories
- Machine Learning: Vertex AI, AI Platform

#### Step 1.8: Update GCP Build Configuration
- Add GCP to schema generation script in `package.json`
- Ensure JSON schemas output to `dist/schemas/gcp/`
- Verify TypeScript compilation passes

---

### Phase 2: Azure Schema Creation

**Objective**: Create 21 Azure resources across 5 core categories

#### Step 2.1: Create Azure Directory Structure
- Create `shared/resource-catalog/src/azure/` directory
- Create subdirectories: compute, storage, database, networking, security
- Create `icons.ts` with Azure icon paths
- Create `index.ts` as main export

#### Step 2.2: Create Azure Compute Resources (5)
- `azurerm_virtual_machine`: Virtual machine instance
- `azurerm_virtual_machine_scale_set`: Auto-scaling VM group
- `azurerm_function_app`: Serverless functions
- `azurerm_app_service`: Web application hosting
- `azurerm_container_instance`: Container hosting

#### Step 2.3: Create Azure Storage Resources (4)
- `azurerm_storage_account`: Storage account (container type)
- `azurerm_storage_container`: Blob container
- `azurerm_storage_blob`: Blob storage object
- `azurerm_managed_disk`: Managed disk

#### Step 2.4: Create Azure Database Resources (4)
- `azurerm_sql_server`: SQL Server instance
- `azurerm_sql_database`: SQL Database
- `azurerm_cosmosdb_account`: Cosmos DB account
- `azurerm_redis_cache`: Redis cache instance

#### Step 2.5: Create Azure Networking Resources (5)
- `azurerm_virtual_network`: Virtual network (container type)
- `azurerm_subnet`: Subnet
- `azurerm_network_security_group`: Security group
- `azurerm_public_ip`: Public IP address
- `azurerm_load_balancer`: Load balancer

#### Step 2.6: Create Azure Security Resources (3)
- `azurerm_key_vault`: Key vault (container type)
- `azurerm_key_vault_secret`: Secret
- `azurerm_user_assigned_identity`: Managed identity

#### Step 2.7: Copy Azure Icons
- Copy icons from `Cloud_Services/Azure/` to `frontend/public/cloud_icons/Azure/`
- Update icon paths in Azure schema files

---

### Phase 3: Backend Multi-Provider Support

**Objective**: Update backend to serve schemas for all providers

#### Step 3.1: Update Schema Loader
- Modify `_get_schema_paths()` to accept provider parameter
- Update schema directory structure to `dist/schemas/{provider}/`
- Add provider prefix mapping: aws_ → aws, google_ → gcp, azurerm_ → azure
- Update resource indexing to support multi-provider lookup

#### Step 3.2: Update Catalog API Endpoints
- Add `?provider=` query parameter to all list endpoints
- Update `CatalogResponse` to include dynamic provider field
- Add provider validation with 400 error for unsupported providers
- Update container/icon list endpoints for provider filtering

#### Step 3.3: Update Catalog Response Models
- Ensure response includes `provider` field
- Add `version` per provider (AWS 5.x, GCP ~5.x, Azure ~4.x)

---

### Phase 4: Frontend Dynamic Schema Loading

**Objective**: Replace bundled schemas with API fetching

#### Step 4.1: Create Catalog API Client
- Create `frontend/src/lib/catalog/index.ts` with fetch functions
- Create `frontend/src/lib/catalog/hooks.ts` with React Query hooks
- Implement `useCatalog(provider, category?)` hook
- Implement `useResource(terraformResource)` hook

#### Step 4.2: Configure React Query
- Add TanStack Query provider to App.tsx (if not present)
- Configure stale-while-revalidate with 5-minute stale time
- Configure 30-minute cache time

#### Step 4.3: Update ResourcePalette Component
- Replace static imports with `useCatalog(project.cloud_provider)` hook
- Add loading state handling
- Add error state with retry

#### Step 4.4: Update InspectorPanel Component
- Replace static schema imports with `useResource(node.terraform_resource)`
- Ensure proper loading/error handling

#### Step 4.5: Update DesignerPageFinal
- Use catalog hooks for node creation
- Ensure provider switching updates catalog

---

### Phase 5: Cleanup and Validation

**Objective**: Remove deprecated files and validate migration

#### Step 5.1: Remove Deprecated Frontend Schema Files
- Delete `frontend/src/lib/gcp/*ServicesData.ts` files (12 files)
- Delete `frontend/src/lib/gcp/index.ts`
- Update any remaining imports to use catalog hooks

#### Step 5.2: Update Frontend Bundle Analysis
- Verify bundle size reduction (target: 50-100KB)
- Ensure no schema data in frontend bundle

#### Step 5.3: Add Integration Tests
- Test `GET /api/catalog/?provider=aws` returns 50+ resources
- Test `GET /api/catalog/?provider=gcp` returns 40+ resources
- Test `GET /api/catalog/?provider=azure` returns 21 resources
- Test category filtering for each provider
- Test single resource lookup for each provider

#### Step 5.4: Performance Validation
- Verify API response time < 200ms for full catalog
- Verify Resource Palette load time < 500ms after API response
- Verify React Query caching reduces repeated requests

---

## Dependencies Between Steps

```
Phase 1.1 → Phase 1.2 → ... → Phase 1.8
                                   ↓
Phase 2.1 → Phase 2.2 → ... → Phase 2.7 → Phase 3.1 → Phase 3.2 → Phase 3.3
                                                                      ↓
Phase 4.1 → Phase 4.2 → Phase 4.3 → Phase 4.4 → Phase 4.5 → Phase 5.1 → Phase 5.2 → Phase 5.3 → Phase 5.4
```

---

## Critical Files

### New Files to Create
- `shared/resource-catalog/src/gcp/` (entire directory, ~20 files)
- `shared/resource-catalog/src/azure/` (entire directory, ~10 files)
- `frontend/src/lib/catalog/index.ts`
- `frontend/src/lib/catalog/hooks.ts`

### Files to Modify
- `backend/app/services/terraform/schema_loader.py`
- `backend/app/api/endpoints/catalog.py`
- `frontend/src/components/ResourcePalette.tsx`
- `frontend/src/components/InspectorPanel.tsx`
- `frontend/src/features/designer/DesignerPageFinal.tsx`
- `shared/resource-catalog/package.json` (build scripts)

### Files to Delete
- `frontend/src/lib/gcp/*.ts` (12 files)

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Breaking frontend during migration | Feature flag to switch between bundled and API schemas |
| Schema format inconsistencies | TypeScript compilation catches issues at build time |
| API performance degradation | React Query caching + pagination for large responses |
| Missing GCP/Azure attributes | Reference Terraform Registry documentation |

---

## Success Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| GCP resources in catalog | 40+ | `GET /api/catalog/?provider=gcp` |
| Azure resources in catalog | 21 | `GET /api/catalog/?provider=azure` |
| AWS resources unchanged | 50+ | `GET /api/catalog/?provider=aws` |
| Bundle size reduction | 50-100KB | Webpack bundle analyzer |
| API response time | < 200ms | Load testing |
| TypeScript errors | 0 | `npx tsc --noEmit` |

---

## Appendix: Resource Counts by Provider

### AWS (Existing)
- compute: 7
- containers: 5
- networking: 17
- storage: 4
- database: 4
- security: 6
- messaging: 2
- management: 2
- developer-tools: 2
- **Total: ~49**

### GCP (Migration)
- compute: 10
- containers: 3
- networking: 8
- storage: 4
- database: 5
- security: 6
- serverless: 5
- analytics: 4
- messaging: 3
- management: 4
- developer-tools: 3
- machine-learning: 4
- **Total: ~59**

### Azure (New)
- compute: 5
- storage: 4
- database: 4
- networking: 5
- security: 3
- **Total: 21**
