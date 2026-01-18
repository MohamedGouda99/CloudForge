# Tasks: GCP Service Schema Enhancement

**Input**: Design documents from `/specs/010-gcp-schema-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not required for this feature (data file updates with TypeScript compilation validation)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/lib/gcp/` for all GCP service data files
- Icons at: `frontend/public/cloud_icons/GCP/Category Icons/`

---

## Phase 1: Setup

**Purpose**: Verify existing structure and interfaces

- [x] T001 Review existing TypeScript interfaces in `frontend/src/lib/gcp/computeServicesData.ts`
- [x] T002 Verify GCP category icons exist at `frontend/public/cloud_icons/GCP/Category Icons/`
- [x] T003 Document icon path mapping for all 12 categories per research.md

---

## Phase 2: Foundational (Icon Path Standardization)

**Purpose**: Ensure all icon paths are correct before updating service schemas

**⚠️ CRITICAL**: Icon paths must be validated before updating services

- [ ] T004 [P] Update icon paths in `frontend/src/lib/gcp/computeServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg`
- [ ] T005 [P] Update icon paths in `frontend/src/lib/gcp/storageServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg`
- [ ] T006 [P] Update icon paths in `frontend/src/lib/gcp/databaseServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg`
- [ ] T007 [P] Update icon paths in `frontend/src/lib/gcp/networkingServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg`
- [ ] T008 [P] Update icon paths in `frontend/src/lib/gcp/securityServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg`
- [ ] T009 [P] Update icon paths in `frontend/src/lib/gcp/analyticsServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg`
- [ ] T010 [P] Update icon paths in `frontend/src/lib/gcp/containersServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg`
- [ ] T011 [P] Update icon paths in `frontend/src/lib/gcp/developerToolsServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Developer Tools/SVG/Developer_Tools-512-color.svg`
- [ ] T012 [P] Update icon paths in `frontend/src/lib/gcp/machineLearningServicesData.ts` to use `/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg`
- [ ] T013 [P] Update icon paths in `frontend/src/lib/gcp/managementServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Management Tools/SVG/ManagementTools-512-color.svg`
- [ ] T014 [P] Update icon paths in `frontend/src/lib/gcp/messagingServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Integration Services/SVG/IntegrationServices-512-color.svg`
- [ ] T015 [P] Update icon paths in `frontend/src/lib/gcp/serverlessServicesData.ts` to use `/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg`

**Checkpoint**: All icon paths standardized - schema updates can begin

---

## Phase 3: User Story 1 - Accurate GCP Resource Properties (Priority: P1) 🎯 MVP

**Goal**: All GCP resources display accurate configuration options matching Terraform Google Provider 6.x documentation

**Independent Test**: Drag any GCP resource onto canvas, verify Inspector Panel fields match Terraform Registry docs

### Implementation for User Story 1

#### Database Services (3 new services + verify existing)

- [ ] T016 [P] [US1] Add google_memcache_instance service definition in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T017 [P] [US1] Add google_alloydb_cluster service definition in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T018 [P] [US1] Add google_alloydb_instance service definition in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T019 [US1] Verify and update google_sql_database_instance schema against Terraform Registry in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T020 [US1] Verify and update google_spanner_instance schema against Terraform Registry in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T021 [US1] Verify and update google_redis_instance schema against Terraform Registry in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T022 [US1] Verify and update remaining database services (sql_database, sql_user, spanner_database, firestore_database, bigtable_instance, bigtable_table) in `frontend/src/lib/gcp/databaseServicesData.ts`

#### Compute Services

- [ ] T023 [US1] Verify and update google_compute_instance schema against Terraform Registry in `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T024 [US1] Verify and update google_compute_instance_template schema against Terraform Registry in `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T025 [US1] Verify and update remaining compute services (instance_group_manager, autoscaler, disk, snapshot, image) in `frontend/src/lib/gcp/computeServicesData.ts`

#### Networking Services

- [ ] T026 [US1] Verify and update google_compute_network schema against Terraform Registry in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T027 [US1] Verify and update google_compute_subnetwork schema against Terraform Registry in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T028 [US1] Verify and update google_compute_firewall schema against Terraform Registry in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T029 [US1] Verify and update load balancer resources (backend_service, health_check, url_map, forwarding_rule) in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T030 [US1] Verify and update VPN/NAT resources (router, router_nat, vpn_gateway, vpn_tunnel) in `frontend/src/lib/gcp/networkingServicesData.ts`

#### Containers Services

- [ ] T031 [US1] Verify and update google_container_cluster schema against Terraform Registry in `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T032 [US1] Verify and update google_container_node_pool schema against Terraform Registry in `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T033 [US1] Verify and update remaining container services (artifact_registry_repository, cloud_run_service, cloud_run_v2_service) in `frontend/src/lib/gcp/containersServicesData.ts`

#### Security Services

- [ ] T034 [US1] Verify and update google_service_account schema against Terraform Registry in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T035 [US1] Verify and update IAM resources (project_iam_policy, project_iam_binding, project_iam_member) in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T036 [US1] Verify and update KMS resources (kms_key_ring, kms_crypto_key) in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T037 [US1] Verify and update Secret Manager resources (secret_manager_secret, secret_manager_secret_version) in `frontend/src/lib/gcp/securityServicesData.ts`

#### Storage Services

- [ ] T038 [US1] Verify and update google_storage_bucket schema against Terraform Registry in `frontend/src/lib/gcp/storageServicesData.ts`
- [ ] T039 [US1] Verify and update remaining storage services (storage_bucket_object, filestore_instance, storage_transfer_job) in `frontend/src/lib/gcp/storageServicesData.ts`

#### Analytics Services

- [ ] T040 [US1] Verify and update google_bigquery_dataset schema against Terraform Registry in `frontend/src/lib/gcp/analyticsServicesData.ts`
- [ ] T041 [US1] Verify and update google_bigquery_table schema against Terraform Registry in `frontend/src/lib/gcp/analyticsServicesData.ts`
- [ ] T042 [US1] Verify and update remaining analytics services (bigquery_job, dataflow_job, dataproc_cluster, dataproc_job) in `frontend/src/lib/gcp/analyticsServicesData.ts`

#### Serverless Services

- [ ] T043 [US1] Verify and update google_cloudfunctions_function schema against Terraform Registry in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T044 [US1] Verify and update google_cloudfunctions2_function schema against Terraform Registry in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T045 [US1] Verify and update App Engine resources (app_engine_application, app_engine_standard_app_version, app_engine_flexible_app_version) in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T046 [US1] Verify and update API Gateway resources (api_gateway_gateway, api_gateway_api, endpoints_service) in `frontend/src/lib/gcp/serverlessServicesData.ts`

#### Management Services

- [ ] T047 [US1] Verify and update google_monitoring_alert_policy schema against Terraform Registry in `frontend/src/lib/gcp/managementServicesData.ts`
- [ ] T048 [US1] Verify and update logging resources (logging_project_sink, logging_metric) in `frontend/src/lib/gcp/managementServicesData.ts`
- [ ] T049 [US1] Verify and update remaining management services (monitoring_dashboard, monitoring_notification_channel, monitoring_uptime_check_config, cloud_scheduler_job, cloud_tasks_queue) in `frontend/src/lib/gcp/managementServicesData.ts`

#### Developer Tools Services

- [ ] T050 [US1] Verify and update google_cloudbuild_trigger schema against Terraform Registry in `frontend/src/lib/gcp/developerToolsServicesData.ts`
- [ ] T051 [US1] Verify and update remaining developer tools services (sourcerepo_repository, clouddeploy_delivery_pipeline, clouddeploy_target) in `frontend/src/lib/gcp/developerToolsServicesData.ts`

#### Machine Learning Services

- [ ] T052 [US1] Verify and update Vertex AI resources (vertex_ai_dataset, vertex_ai_endpoint, vertex_ai_model, vertex_ai_featurestore) in `frontend/src/lib/gcp/machineLearningServicesData.ts`
- [ ] T053 [US1] Verify and update remaining ML services (ml_engine_model, notebooks_instance) in `frontend/src/lib/gcp/machineLearningServicesData.ts`

#### Messaging Services

- [ ] T054 [US1] Verify and update google_pubsub_topic schema against Terraform Registry in `frontend/src/lib/gcp/messagingServicesData.ts`
- [ ] T055 [US1] Verify and update google_pubsub_subscription schema against Terraform Registry in `frontend/src/lib/gcp/messagingServicesData.ts`
- [ ] T056 [US1] Verify and update google_pubsub_schema schema against Terraform Registry in `frontend/src/lib/gcp/messagingServicesData.ts`

**Checkpoint**: All service schemas verified and updated - User Story 1 complete

---

## Phase 4: User Story 2 - Complete GCP Service Coverage (Priority: P1)

**Goal**: All major GCP services available in Resource Palette with valid icons

**Independent Test**: Browse each GCP category in Resource Palette and verify expected services are present

### Implementation for User Story 2

- [ ] T057 [US2] Verify all Database services appear in Resource Palette (12 services total) via `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T058 [US2] Verify all Networking services appear in Resource Palette (18 services total) via `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T059 [US2] Verify all Compute services appear in Resource Palette (10 services total) via `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T060 [US2] Verify all Container services appear in Resource Palette (5 services total) via `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T061 [US2] Verify all Security services appear in Resource Palette (9 services total) via `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T062 [US2] Verify all remaining categories have complete service coverage (Storage, Analytics, Developer Tools, ML, Management, Messaging, Serverless)

**Checkpoint**: All GCP services available in Resource Palette - User Story 2 complete

---

## Phase 5: User Story 3 - Timeout Configuration Support (Priority: P2)

**Goal**: Resources support custom timeout configuration for create/update/delete operations

**Independent Test**: Configure timeouts on a resource, verify generated Terraform includes valid timeouts block

### Implementation for User Story 3

- [ ] T063 [P] [US3] Add timeouts block to all Database services in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T064 [P] [US3] Add timeouts block to all Compute services in `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T065 [P] [US3] Add timeouts block to all Networking services in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T066 [P] [US3] Add timeouts block to all Container services in `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T067 [P] [US3] Add timeouts block to all Security services in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T068 [P] [US3] Add timeouts block to all Storage services in `frontend/src/lib/gcp/storageServicesData.ts`
- [ ] T069 [P] [US3] Add timeouts block to all Analytics services in `frontend/src/lib/gcp/analyticsServicesData.ts`
- [ ] T070 [P] [US3] Add timeouts block to all Serverless services in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T071 [P] [US3] Add timeouts block to all Management services in `frontend/src/lib/gcp/managementServicesData.ts`
- [ ] T072 [P] [US3] Add timeouts block to all Developer Tools services in `frontend/src/lib/gcp/developerToolsServicesData.ts`
- [ ] T073 [P] [US3] Add timeouts block to all ML services in `frontend/src/lib/gcp/machineLearningServicesData.ts`
- [ ] T074 [P] [US3] Add timeouts block to all Messaging services in `frontend/src/lib/gcp/messagingServicesData.ts`

**Checkpoint**: All services support timeout configuration - User Story 3 complete

---

## Phase 6: User Story 4 - Output Attributes for Resource References (Priority: P2)

**Goal**: Resources display all output/computed attributes for creating references

**Independent Test**: View Outputs section for a resource, verify all exported attributes match Terraform docs

### Implementation for User Story 4

- [ ] T075 [P] [US4] Verify and complete outputs for all Database services in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T076 [P] [US4] Verify and complete outputs for all Compute services in `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T077 [P] [US4] Verify and complete outputs for all Networking services in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T078 [P] [US4] Verify and complete outputs for all Container services in `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T079 [P] [US4] Verify and complete outputs for all Security services in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T080 [P] [US4] Verify and complete outputs for all Storage services in `frontend/src/lib/gcp/storageServicesData.ts`
- [ ] T081 [P] [US4] Verify and complete outputs for all Analytics services in `frontend/src/lib/gcp/analyticsServicesData.ts`
- [ ] T082 [P] [US4] Verify and complete outputs for all Serverless services in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T083 [P] [US4] Verify and complete outputs for all Management services in `frontend/src/lib/gcp/managementServicesData.ts`
- [ ] T084 [P] [US4] Verify and complete outputs for all Developer Tools services in `frontend/src/lib/gcp/developerToolsServicesData.ts`
- [ ] T085 [P] [US4] Verify and complete outputs for all ML services in `frontend/src/lib/gcp/machineLearningServicesData.ts`
- [ ] T086 [P] [US4] Verify and complete outputs for all Messaging services in `frontend/src/lib/gcp/messagingServicesData.ts`

**Checkpoint**: All services have complete output attributes - User Story 4 complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and helper functions

- [ ] T087 [P] Add/verify helper functions (getByTerraformResource, getById, isResource, getIcon) in `frontend/src/lib/gcp/databaseServicesData.ts`
- [ ] T088 [P] Add/verify helper functions in `frontend/src/lib/gcp/computeServicesData.ts`
- [ ] T089 [P] Add/verify helper functions in `frontend/src/lib/gcp/networkingServicesData.ts`
- [ ] T090 [P] Add/verify helper functions in `frontend/src/lib/gcp/containersServicesData.ts`
- [ ] T091 [P] Add/verify helper functions in `frontend/src/lib/gcp/securityServicesData.ts`
- [ ] T092 [P] Add/verify helper functions in `frontend/src/lib/gcp/storageServicesData.ts`
- [ ] T093 [P] Add/verify helper functions in `frontend/src/lib/gcp/analyticsServicesData.ts`
- [ ] T094 [P] Add/verify helper functions in `frontend/src/lib/gcp/serverlessServicesData.ts`
- [ ] T095 [P] Add/verify helper functions in `frontend/src/lib/gcp/managementServicesData.ts`
- [ ] T096 [P] Add/verify helper functions in `frontend/src/lib/gcp/developerToolsServicesData.ts`
- [ ] T097 [P] Add/verify helper functions in `frontend/src/lib/gcp/machineLearningServicesData.ts`
- [ ] T098 [P] Add/verify helper functions in `frontend/src/lib/gcp/messagingServicesData.ts`
- [ ] T099 Update GCP index exports in `frontend/src/lib/gcp/index.ts`
- [ ] T100 Run TypeScript compilation check: `cd frontend && npx tsc --noEmit`
- [ ] T101 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - icon paths must be correct first
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1) and User Story 2 (P1) can proceed in parallel
  - User Story 3 (P2) and User Story 4 (P2) can proceed in parallel after US1/US2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Verifies US1 completeness
- **User Story 3 (P2)**: Can start after Foundational - Independent from US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Independent from US1/US2/US3

### Within Each User Story

- All tasks within a category can be parallelized (different files)
- Schema updates should be verified against Terraform Registry documentation
- TypeScript compilation validates type correctness

### Parallel Opportunities

- All icon path updates (T004-T015) can run in parallel
- All timeout additions (T063-T074) can run in parallel
- All output verifications (T075-T086) can run in parallel
- All helper function additions (T087-T098) can run in parallel
- Different categories within US1 can be worked on in parallel

---

## Parallel Example: User Story 1 Categories

```bash
# Launch all category updates in parallel (different files):
Task: "Verify Database services" in frontend/src/lib/gcp/databaseServicesData.ts
Task: "Verify Compute services" in frontend/src/lib/gcp/computeServicesData.ts
Task: "Verify Networking services" in frontend/src/lib/gcp/networkingServicesData.ts
Task: "Verify Container services" in frontend/src/lib/gcp/containersServicesData.ts
# ... etc for all 12 categories
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (icon paths)
3. Complete Phase 3: User Story 1 (schema accuracy)
4. **STOP and VALIDATE**: Run TypeScript compilation, verify fields in Inspector Panel
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Verify completeness → Deploy
4. Add User Story 3 → Timeout support → Deploy
5. Add User Story 4 → Output attributes → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (12 files = up to 12 parallel streams):
1. Team completes Setup + Foundational together
2. Once Foundational is done, each developer takes 1-2 category files
3. Each category file gets all updates (schema, timeouts, outputs, helpers)
4. Final integration and TypeScript validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each category file is independently updatable
- TypeScript compilation is the primary validation mechanism
- Terraform Registry documentation is the authoritative source
- No tests required - manual verification + TypeScript compilation
