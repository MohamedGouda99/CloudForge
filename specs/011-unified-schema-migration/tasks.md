# Implementation Tasks: Unified Cloud Provider Schema Migration

**Feature**: 011-unified-schema-migration
**Created**: 2026-01-18
**Status**: Ready for Implementation

---

## User Story Mapping

| Story | Priority | Description |
|-------|----------|-------------|
| US1 | P1 | Backend Serves All Provider Schemas via API |
| US2 | P1 | Unified ServiceDefinition Interface Across Providers |
| US3 | P1 | GCP Schemas Migrated to Shared Catalog |
| US4 | P2 | Azure Schemas Added to Shared Catalog |
| US5 | P2 | Frontend Fetches Schemas from Backend API |
| US6 | P3 | Remove Duplicate Frontend Schema Files |

---

## Phase 1: Setup

**Goal**: Initialize project structure for multi-provider schema support

- [ ] T001 Create GCP directory structure in shared/resource-catalog/src/gcp/
- [ ] T002 [P] Create GCP icons.ts with icon path constants in shared/resource-catalog/src/gcp/icons.ts
- [ ] T003 [P] Create GCP index.ts as main export file in shared/resource-catalog/src/gcp/index.ts
- [ ] T004 Create Azure directory structure in shared/resource-catalog/src/azure/
- [ ] T005 [P] Create Azure icons.ts with icon path constants in shared/resource-catalog/src/azure/icons.ts
- [ ] T006 [P] Create Azure index.ts as main export file in shared/resource-catalog/src/azure/index.ts
- [ ] T007 Create GCP category subdirectories (compute, networking, storage, database, security, containers, serverless, analytics, messaging, management, developer-tools, machine-learning) in shared/resource-catalog/src/gcp/
- [ ] T008 [P] Create Azure category subdirectories (compute, storage, database, networking, security) in shared/resource-catalog/src/azure/

---

## Phase 2: Foundational - Backend Multi-Provider Support

**Goal**: Enable backend to serve schemas for multiple providers (blocking for all user stories)

**Independent Test**: Call `GET /api/catalog/?provider=aws` and verify provider parameter is accepted

- [ ] T009 [US1] Add provider parameter to _get_schema_paths() in backend/app/services/terraform/schema_loader.py
- [ ] T010 [US1] Add provider prefix mapping (aws_, google_, azurerm_) to schema_loader.py in backend/app/services/terraform/schema_loader.py
- [ ] T011 [US1] Update get_all_resources() to filter by provider in backend/app/services/terraform/schema_loader.py
- [ ] T012 [US1] Add ?provider= query parameter to get_resource_catalog() in backend/app/api/endpoints/catalog.py
- [ ] T013 [US1] Add provider validation with 400 error for unsupported providers in backend/app/api/endpoints/catalog.py
- [ ] T014 [US1] Update container/icon list endpoints for provider filtering in backend/app/api/endpoints/catalog.py
- [ ] T015 [US1] Update CatalogResponse to include dynamic provider field in backend/app/api/endpoints/catalog.py

---

## Phase 3: User Story 2 - Unified ServiceDefinition Interface (P1)

**Goal**: Ensure all providers use consistent ServiceDefinition interface

**Independent Test**: Run `npx tsc --noEmit` in shared/resource-catalog/ and verify zero errors

- [ ] T016 [US2] Verify ServiceDefinition interface in shared/resource-catalog/src/types.ts matches all required fields
- [ ] T017 [US2] Create GCP compute index.ts with category exports in shared/resource-catalog/src/gcp/compute/index.ts
- [ ] T018 [US2] [P] Create GCP networking index.ts in shared/resource-catalog/src/gcp/networking/index.ts
- [ ] T019 [US2] [P] Create GCP storage index.ts in shared/resource-catalog/src/gcp/storage/index.ts
- [ ] T020 [US2] [P] Create GCP database index.ts in shared/resource-catalog/src/gcp/database/index.ts
- [ ] T021 [US2] [P] Create GCP security index.ts in shared/resource-catalog/src/gcp/security/index.ts

---

## Phase 4: User Story 3 - GCP Schemas Migrated (P1)

**Goal**: Migrate all 12 GCP service categories to shared catalog

**Independent Test**: Call `GET /api/catalog/?provider=gcp` and verify 40+ resources returned with proper structure

### GCP Compute Resources (10 resources)
- [ ] T022 [US3] Create compute-instance.ts (google_compute_instance) in shared/resource-catalog/src/gcp/compute/compute-instance.ts
- [ ] T023 [US3] [P] Create instance-template.ts (google_compute_instance_template) in shared/resource-catalog/src/gcp/compute/instance-template.ts
- [ ] T024 [US3] [P] Create instance-group-manager.ts (google_compute_instance_group_manager) in shared/resource-catalog/src/gcp/compute/instance-group-manager.ts
- [ ] T025 [US3] [P] Create autoscaler.ts (google_compute_autoscaler) in shared/resource-catalog/src/gcp/compute/autoscaler.ts
- [ ] T026 [US3] [P] Create disk.ts (google_compute_disk) in shared/resource-catalog/src/gcp/compute/disk.ts
- [ ] T027 [US3] [P] Create image.ts (google_compute_image) in shared/resource-catalog/src/gcp/compute/image.ts
- [ ] T028 [US3] [P] Create snapshot.ts (google_compute_snapshot) in shared/resource-catalog/src/gcp/compute/snapshot.ts

### GCP Networking Resources (8 resources)
- [ ] T029 [US3] Create vpc.ts (google_compute_network) in shared/resource-catalog/src/gcp/networking/vpc.ts
- [ ] T030 [US3] [P] Create subnet.ts (google_compute_subnetwork) in shared/resource-catalog/src/gcp/networking/subnet.ts
- [ ] T031 [US3] [P] Create firewall.ts (google_compute_firewall) in shared/resource-catalog/src/gcp/networking/firewall.ts
- [ ] T032 [US3] [P] Create router.ts (google_compute_router) in shared/resource-catalog/src/gcp/networking/router.ts
- [ ] T033 [US3] [P] Create dns-zone.ts (google_dns_managed_zone) in shared/resource-catalog/src/gcp/networking/dns-zone.ts
- [ ] T034 [US3] [P] Create load-balancer.ts (google_compute_forwarding_rule) in shared/resource-catalog/src/gcp/networking/load-balancer.ts
- [ ] T035 [US3] [P] Create security-policy.ts (google_compute_security_policy) in shared/resource-catalog/src/gcp/networking/security-policy.ts
- [ ] T036 [US3] [P] Create address.ts (google_compute_address) in shared/resource-catalog/src/gcp/networking/address.ts

### GCP Storage Resources (4 resources)
- [ ] T037 [US3] Create storage-bucket.ts (google_storage_bucket) in shared/resource-catalog/src/gcp/storage/storage-bucket.ts
- [ ] T038 [US3] [P] Create storage-object.ts (google_storage_bucket_object) in shared/resource-catalog/src/gcp/storage/storage-object.ts
- [ ] T039 [US3] [P] Create filestore.ts (google_filestore_instance) in shared/resource-catalog/src/gcp/storage/filestore.ts

### GCP Database Resources (5 resources)
- [ ] T040 [US3] Create cloud-sql.ts (google_sql_database_instance) in shared/resource-catalog/src/gcp/database/cloud-sql.ts
- [ ] T041 [US3] [P] Create spanner.ts (google_spanner_instance) in shared/resource-catalog/src/gcp/database/spanner.ts
- [ ] T042 [US3] [P] Create firestore.ts (google_firestore_database) in shared/resource-catalog/src/gcp/database/firestore.ts
- [ ] T043 [US3] [P] Create bigtable.ts (google_bigtable_instance) in shared/resource-catalog/src/gcp/database/bigtable.ts
- [ ] T044 [US3] [P] Create memorystore.ts (google_redis_instance) in shared/resource-catalog/src/gcp/database/memorystore.ts

### GCP Security Resources (6 resources)
- [ ] T045 [US3] Create iam-role.ts (google_project_iam_member) in shared/resource-catalog/src/gcp/security/iam-role.ts
- [ ] T046 [US3] [P] Create service-account.ts (google_service_account) in shared/resource-catalog/src/gcp/security/service-account.ts
- [ ] T047 [US3] [P] Create kms-key.ts (google_kms_crypto_key) in shared/resource-catalog/src/gcp/security/kms-key.ts
- [ ] T048 [US3] [P] Create kms-keyring.ts (google_kms_key_ring) in shared/resource-catalog/src/gcp/security/kms-keyring.ts
- [ ] T049 [US3] [P] Create secret-manager.ts (google_secret_manager_secret) in shared/resource-catalog/src/gcp/security/secret-manager.ts

### GCP Containers Resources (3 resources)
- [ ] T050 [US3] Create gke-cluster.ts (google_container_cluster) in shared/resource-catalog/src/gcp/containers/gke-cluster.ts
- [ ] T051 [US3] [P] Create gke-node-pool.ts (google_container_node_pool) in shared/resource-catalog/src/gcp/containers/gke-node-pool.ts
- [ ] T052 [US3] [P] Create artifact-registry.ts (google_artifact_registry_repository) in shared/resource-catalog/src/gcp/containers/artifact-registry.ts

### GCP Serverless Resources (5 resources)
- [ ] T053 [US3] Create cloud-run.ts (google_cloud_run_service) in shared/resource-catalog/src/gcp/serverless/cloud-run.ts
- [ ] T054 [US3] [P] Create cloud-functions.ts (google_cloudfunctions_function) in shared/resource-catalog/src/gcp/serverless/cloud-functions.ts
- [ ] T055 [US3] [P] Create app-engine.ts (google_app_engine_application) in shared/resource-catalog/src/gcp/serverless/app-engine.ts
- [ ] T056 [US3] [P] Create cloud-scheduler.ts (google_cloud_scheduler_job) in shared/resource-catalog/src/gcp/serverless/cloud-scheduler.ts
- [ ] T057 [US3] [P] Create workflows.ts (google_workflows_workflow) in shared/resource-catalog/src/gcp/serverless/workflows.ts

### GCP Analytics Resources (4 resources)
- [ ] T058 [US3] Create bigquery-dataset.ts (google_bigquery_dataset) in shared/resource-catalog/src/gcp/analytics/bigquery-dataset.ts
- [ ] T059 [US3] [P] Create bigquery-table.ts (google_bigquery_table) in shared/resource-catalog/src/gcp/analytics/bigquery-table.ts
- [ ] T060 [US3] [P] Create dataflow-job.ts (google_dataflow_job) in shared/resource-catalog/src/gcp/analytics/dataflow-job.ts
- [ ] T061 [US3] [P] Create dataproc-cluster.ts (google_dataproc_cluster) in shared/resource-catalog/src/gcp/analytics/dataproc-cluster.ts

### GCP Messaging Resources (3 resources)
- [ ] T062 [US3] Create pubsub-topic.ts (google_pubsub_topic) in shared/resource-catalog/src/gcp/messaging/pubsub-topic.ts
- [ ] T063 [US3] [P] Create pubsub-subscription.ts (google_pubsub_subscription) in shared/resource-catalog/src/gcp/messaging/pubsub-subscription.ts
- [ ] T064 [US3] [P] Create pubsub-schema.ts (google_pubsub_schema) in shared/resource-catalog/src/gcp/messaging/pubsub-schema.ts

### GCP Management Resources (4 resources)
- [ ] T065 [US3] Create monitoring-alert.ts (google_monitoring_alert_policy) in shared/resource-catalog/src/gcp/management/monitoring-alert.ts
- [ ] T066 [US3] [P] Create logging-metric.ts (google_logging_metric) in shared/resource-catalog/src/gcp/management/logging-metric.ts
- [ ] T067 [US3] [P] Create monitoring-dashboard.ts (google_monitoring_dashboard) in shared/resource-catalog/src/gcp/management/monitoring-dashboard.ts
- [ ] T068 [US3] [P] Create logging-sink.ts (google_logging_project_sink) in shared/resource-catalog/src/gcp/management/logging-sink.ts

### GCP Developer Tools Resources (3 resources)
- [ ] T069 [US3] Create cloud-build-trigger.ts (google_cloudbuild_trigger) in shared/resource-catalog/src/gcp/developer-tools/cloud-build-trigger.ts
- [ ] T070 [US3] [P] Create source-repo.ts (google_sourcerepo_repository) in shared/resource-catalog/src/gcp/developer-tools/source-repo.ts
- [ ] T071 [US3] [P] Create cloud-deploy.ts (google_clouddeploy_target) in shared/resource-catalog/src/gcp/developer-tools/cloud-deploy.ts

### GCP Machine Learning Resources (4 resources)
- [ ] T072 [US3] Create vertex-ai-dataset.ts (google_vertex_ai_dataset) in shared/resource-catalog/src/gcp/machine-learning/vertex-ai-dataset.ts
- [ ] T073 [US3] [P] Create vertex-ai-endpoint.ts (google_vertex_ai_endpoint) in shared/resource-catalog/src/gcp/machine-learning/vertex-ai-endpoint.ts
- [ ] T074 [US3] [P] Create vertex-ai-model.ts (google_vertex_ai_model) in shared/resource-catalog/src/gcp/machine-learning/vertex-ai-model.ts
- [ ] T075 [US3] [P] Create ai-platform-job.ts (google_ml_engine_model) in shared/resource-catalog/src/gcp/machine-learning/ai-platform-job.ts

### GCP Build & Export
- [ ] T076 [US3] Update GCP index.ts to export all categories in shared/resource-catalog/src/gcp/index.ts
- [ ] T077 [US3] Add GCP to schema generation script in shared/resource-catalog/package.json
- [ ] T078 [US3] Build GCP schemas and verify JSON output in shared/resource-catalog/dist/schemas/gcp/

---

## Phase 5: User Story 4 - Azure Schemas Added (P2)

**Goal**: Create 21 Azure resources across 5 core categories

**Independent Test**: Call `GET /api/catalog/?provider=azure` and verify 21 resources returned

### Azure Compute Resources (5 resources)
- [ ] T079 [US4] Create virtual-machine.ts (azurerm_virtual_machine) in shared/resource-catalog/src/azure/compute/virtual-machine.ts
- [ ] T080 [US4] [P] Create vm-scale-set.ts (azurerm_virtual_machine_scale_set) in shared/resource-catalog/src/azure/compute/vm-scale-set.ts
- [ ] T081 [US4] [P] Create function-app.ts (azurerm_function_app) in shared/resource-catalog/src/azure/compute/function-app.ts
- [ ] T082 [US4] [P] Create app-service.ts (azurerm_app_service) in shared/resource-catalog/src/azure/compute/app-service.ts
- [ ] T083 [US4] [P] Create container-instance.ts (azurerm_container_instance) in shared/resource-catalog/src/azure/compute/container-instance.ts

### Azure Storage Resources (4 resources)
- [ ] T084 [US4] Create storage-account.ts (azurerm_storage_account) in shared/resource-catalog/src/azure/storage/storage-account.ts
- [ ] T085 [US4] [P] Create storage-container.ts (azurerm_storage_container) in shared/resource-catalog/src/azure/storage/storage-container.ts
- [ ] T086 [US4] [P] Create storage-blob.ts (azurerm_storage_blob) in shared/resource-catalog/src/azure/storage/storage-blob.ts
- [ ] T087 [US4] [P] Create managed-disk.ts (azurerm_managed_disk) in shared/resource-catalog/src/azure/storage/managed-disk.ts

### Azure Database Resources (4 resources)
- [ ] T088 [US4] Create sql-server.ts (azurerm_sql_server) in shared/resource-catalog/src/azure/database/sql-server.ts
- [ ] T089 [US4] [P] Create sql-database.ts (azurerm_sql_database) in shared/resource-catalog/src/azure/database/sql-database.ts
- [ ] T090 [US4] [P] Create cosmosdb-account.ts (azurerm_cosmosdb_account) in shared/resource-catalog/src/azure/database/cosmosdb-account.ts
- [ ] T091 [US4] [P] Create redis-cache.ts (azurerm_redis_cache) in shared/resource-catalog/src/azure/database/redis-cache.ts

### Azure Networking Resources (5 resources)
- [ ] T092 [US4] Create virtual-network.ts (azurerm_virtual_network) in shared/resource-catalog/src/azure/networking/virtual-network.ts
- [ ] T093 [US4] [P] Create subnet.ts (azurerm_subnet) in shared/resource-catalog/src/azure/networking/subnet.ts
- [ ] T094 [US4] [P] Create network-security-group.ts (azurerm_network_security_group) in shared/resource-catalog/src/azure/networking/network-security-group.ts
- [ ] T095 [US4] [P] Create public-ip.ts (azurerm_public_ip) in shared/resource-catalog/src/azure/networking/public-ip.ts
- [ ] T096 [US4] [P] Create load-balancer.ts (azurerm_lb) in shared/resource-catalog/src/azure/networking/load-balancer.ts

### Azure Security Resources (3 resources)
- [ ] T097 [US4] Create key-vault.ts (azurerm_key_vault) in shared/resource-catalog/src/azure/security/key-vault.ts
- [ ] T098 [US4] [P] Create key-vault-secret.ts (azurerm_key_vault_secret) in shared/resource-catalog/src/azure/security/key-vault-secret.ts
- [ ] T099 [US4] [P] Create user-assigned-identity.ts (azurerm_user_assigned_identity) in shared/resource-catalog/src/azure/security/user-assigned-identity.ts

### Azure Icons & Build
- [ ] T100 [US4] Copy Azure icons from Cloud_Services/Azure/ to frontend/public/cloud_icons/Azure/
- [ ] T101 [US4] Update Azure icons.ts with correct icon paths in shared/resource-catalog/src/azure/icons.ts
- [ ] T102 [US4] Update Azure index.ts to export all categories in shared/resource-catalog/src/azure/index.ts
- [ ] T103 [US4] Add Azure to schema generation script in shared/resource-catalog/package.json
- [ ] T104 [US4] Build Azure schemas and verify JSON output in shared/resource-catalog/dist/schemas/azure/

---

## Phase 6: User Story 5 - Frontend Dynamic Loading (P2)

**Goal**: Replace bundled schemas with API fetching using React Query

**Independent Test**: Remove frontend schema imports and verify Resource Palette displays resources from API

### Catalog API Client
- [ ] T105 [US5] Create catalog API client in frontend/src/lib/catalog/index.ts
- [ ] T106 [US5] Create useCatalog hook with React Query in frontend/src/lib/catalog/hooks.ts
- [ ] T107 [US5] Create useResource hook for single resource lookup in frontend/src/lib/catalog/hooks.ts
- [ ] T108 [US5] Add error handling with 3 retries and exponential backoff in frontend/src/lib/catalog/hooks.ts

### React Query Setup
- [ ] T109 [US5] Add TanStack Query provider to App.tsx (if not present) in frontend/src/App.tsx
- [ ] T110 [US5] Configure stale-while-revalidate with 5-minute stale time in frontend/src/lib/catalog/hooks.ts
- [ ] T111 [US5] Configure 30-minute cache time in frontend/src/lib/catalog/hooks.ts

### Component Updates
- [ ] T112 [US5] Update ResourcePalette to use useCatalog hook in frontend/src/components/ResourcePalette.tsx
- [ ] T113 [US5] Add loading state handling to ResourcePalette in frontend/src/components/ResourcePalette.tsx
- [ ] T114 [US5] Add error state with manual retry to ResourcePalette in frontend/src/components/ResourcePalette.tsx
- [ ] T115 [US5] Update InspectorPanel to use useResource hook in frontend/src/components/InspectorPanel.tsx
- [ ] T116 [US5] Add loading/error handling to InspectorPanel in frontend/src/components/InspectorPanel.tsx
- [ ] T117 [US5] Update DesignerPageFinal to use catalog hooks in frontend/src/features/designer/DesignerPageFinal.tsx

---

## Phase 7: User Story 6 - Cleanup (P3)

**Goal**: Remove duplicate frontend schema files

**Independent Test**: Delete GCP schema files and verify frontend works correctly

- [ ] T118 [US6] Remove computeServicesData.ts in frontend/src/lib/gcp/computeServicesData.ts
- [ ] T119 [US6] [P] Remove storageServicesData.ts in frontend/src/lib/gcp/storageServicesData.ts
- [ ] T120 [US6] [P] Remove databaseServicesData.ts in frontend/src/lib/gcp/databaseServicesData.ts
- [ ] T121 [US6] [P] Remove networkingServicesData.ts in frontend/src/lib/gcp/networkingServicesData.ts
- [ ] T122 [US6] [P] Remove securityServicesData.ts in frontend/src/lib/gcp/securityServicesData.ts
- [ ] T123 [US6] [P] Remove analyticsServicesData.ts in frontend/src/lib/gcp/analyticsServicesData.ts
- [ ] T124 [US6] [P] Remove containersServicesData.ts in frontend/src/lib/gcp/containersServicesData.ts
- [ ] T125 [US6] [P] Remove developerToolsServicesData.ts in frontend/src/lib/gcp/developerToolsServicesData.ts
- [ ] T126 [US6] [P] Remove machineLearningServicesData.ts in frontend/src/lib/gcp/machineLearningServicesData.ts
- [ ] T127 [US6] [P] Remove managementServicesData.ts in frontend/src/lib/gcp/managementServicesData.ts
- [ ] T128 [US6] [P] Remove messagingServicesData.ts in frontend/src/lib/gcp/messagingServicesData.ts
- [ ] T129 [US6] [P] Remove serverlessServicesData.ts in frontend/src/lib/gcp/serverlessServicesData.ts
- [ ] T130 [US6] Remove GCP index.ts in frontend/src/lib/gcp/index.ts
- [ ] T131 [US6] Update remaining imports to use catalog hooks in frontend/src/lib/resources/index.ts

---

## Phase 8: Polish & Validation

**Goal**: Final validation and performance checks

- [ ] T132 Verify TypeScript compilation with zero errors: npx tsc --noEmit
- [ ] T133 Test GET /api/catalog/?provider=aws returns 50+ resources
- [ ] T134 [P] Test GET /api/catalog/?provider=gcp returns 40+ resources
- [ ] T135 [P] Test GET /api/catalog/?provider=azure returns 21 resources
- [ ] T136 Test category filtering for each provider
- [ ] T137 Test single resource lookup for each provider
- [ ] T138 Verify API response time < 200ms for full catalog
- [ ] T139 Verify Resource Palette load time < 500ms after API response
- [ ] T140 Analyze frontend bundle size reduction (target: 50-100KB)
- [ ] T141 Verify React Query caching reduces repeated requests
- [ ] T142 Rebuild Docker containers and run full integration test

---

## Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────┐
                                                      │
Phase 2 (Backend Multi-Provider) ◄───────────────────┘
        │
        ├──────► Phase 3 (US2: Unified Interface)
        │               │
        │               ▼
        ├──────► Phase 4 (US3: GCP Schemas) ──────────┐
        │                                              │
        └──────► Phase 5 (US4: Azure Schemas) ────────┤
                                                       │
                                                       ▼
                               Phase 6 (US5: Frontend Dynamic Loading)
                                                       │
                                                       ▼
                               Phase 7 (US6: Cleanup)
                                                       │
                                                       ▼
                               Phase 8 (Polish & Validation)
```

---

## Parallel Execution Opportunities

### Within Phase 4 (GCP Schemas):
All resource files within each category can be created in parallel:
- T023-T028 (Compute resources after T022)
- T030-T036 (Networking resources after T029)
- T038-T039 (Storage resources after T037)
- T041-T044 (Database resources after T040)
- T046-T049 (Security resources after T045)
- etc.

### Within Phase 5 (Azure Schemas):
All resource files within each category can be created in parallel:
- T080-T083 (Compute resources after T079)
- T085-T087 (Storage resources after T084)
- etc.

### Within Phase 7 (Cleanup):
All GCP file deletions can be done in parallel (T119-T130).

### Cross-Phase Parallelization:
- Phase 4 (GCP) and Phase 5 (Azure) can run in parallel after Phase 2 completes
- US3 and US4 are independent and can be implemented concurrently

---

## Implementation Strategy

### MVP Scope (User Story 1 + 3)
1. Complete Phase 1-2 (Setup + Backend Multi-Provider)
2. Complete Phase 4 (GCP Schema Migration)
3. Verify API serves GCP resources correctly

### Incremental Delivery
1. **Increment 1**: Backend multi-provider support + GCP schemas (US1, US2, US3)
2. **Increment 2**: Azure schemas (US4)
3. **Increment 3**: Frontend dynamic loading (US5)
4. **Increment 4**: Cleanup (US6)

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 142 |
| Phase 1 (Setup) | 8 |
| Phase 2 (Backend) | 7 |
| Phase 3 (US2) | 6 |
| Phase 4 (US3 - GCP) | 57 |
| Phase 5 (US4 - Azure) | 26 |
| Phase 6 (US5 - Frontend) | 13 |
| Phase 7 (US6 - Cleanup) | 14 |
| Phase 8 (Polish) | 11 |
| Parallel Opportunities | 85 tasks marked [P] |

**Suggested MVP**: Phases 1-4 (US1, US2, US3) - 78 tasks
