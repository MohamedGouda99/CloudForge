# Tasks: AWS Database Schema Enhancement

**Input**: Design documents from `/specs/008-aws-database-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Not explicitly requested - verification via TypeScript check and Docker compose rebuild.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for this feature
- **Target file**: `frontend/src/lib/aws/databaseServicesData.ts`

---

## Phase 1: Setup (Preparation)

**Purpose**: Read existing file and verify structure before modifications

- [X] T001 Read current databaseServicesData.ts to understand existing structure in frontend/src/lib/aws/databaseServicesData.ts
- [X] T002 Verify all icon paths exist in frontend/public/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/

**Checkpoint**: Ready to begin schema updates ✓ COMPLETE

---

## Phase 2: Foundational (Icon Mappings)

**Purpose**: Add icon mappings for new services before adding the services themselves

- [X] T003 Add aws_db_option_group icon mapping to DATABASE_ICONS in frontend/src/lib/aws/databaseServicesData.ts
- [X] T004 [P] Add aws_db_proxy icon mapping to DATABASE_ICONS in frontend/src/lib/aws/databaseServicesData.ts

**Checkpoint**: Icon mappings ready for new services ✓ COMPLETE (already existed)

---

## Phase 3: User Story 1 - Accurate RDS Instance Configuration (Priority: P1) MVP

**Goal**: Enhance aws_db_instance schema with timeouts and additional outputs

**Independent Test**: Place RDS Instance on canvas, verify timeouts block and new outputs (resource_id, status, availability_zone, hosted_zone_id)

### Implementation for User Story 1

- [X] T005 [US1] Add timeouts block to aws_db_instance in frontend/src/lib/aws/databaseServicesData.ts
  - Create timeouts block with create: 40m, update: 80m, delete: 60m
- [X] T006 [US1] Add additional outputs to aws_db_instance in frontend/src/lib/aws/databaseServicesData.ts
  - Add resource_id, status, availability_zone, hosted_zone_id, engine_version_actual
- [X] T007 [US1] Enhance restore_to_point_in_time block in aws_db_instance in frontend/src/lib/aws/databaseServicesData.ts
  - Add source_dbi_resource_id attribute

**Checkpoint**: RDS Instance should display timeouts and all outputs in Inspector Panel ✓ COMPLETE

---

## Phase 4: User Story 2 - Complete RDS Supporting Services (Priority: P1)

**Goal**: Add aws_db_option_group and aws_db_proxy services

**Independent Test**: Browse database catalog, locate and place both services, verify all arguments/outputs

### Implementation for User Story 2

- [X] T008 [P] [US2] Add aws_db_option_group service in frontend/src/lib/aws/databaseServicesData.ts
  - Required: engine_name, major_engine_version
  - Optional: name, name_prefix, option_group_description, skip_destroy, tags
  - Blocks: option (multiple) with option_settings nested block
  - Outputs: id, arn, tags_all

- [X] T009 [P] [US2] Add aws_db_proxy service in frontend/src/lib/aws/databaseServicesData.ts
  - Required: name, engine_family, role_arn, vpc_subnet_ids
  - Optional: debug_logging, idle_client_timeout, require_tls, vpc_security_group_ids, tags
  - Blocks: auth (multiple), timeouts
  - Outputs: id, arn, endpoint

**Checkpoint**: DB Option Group and RDS Proxy appear in database catalog ✓ COMPLETE

---

## Phase 5: User Story 3 - Accurate Aurora Cluster Configuration (Priority: P1)

**Goal**: Enhance aws_rds_cluster with serverlessv2 auto-pause and additional outputs

**Independent Test**: Place Aurora Cluster, verify serverlessv2_scaling_configuration has seconds_until_auto_pause

### Implementation for User Story 3

- [X] T010 [US3] Enhance serverlessv2_scaling_configuration block in aws_rds_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Add seconds_until_auto_pause attribute (300-86400)
- [X] T011 [US3] Add additional outputs to aws_rds_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Add cluster_resource_id, hosted_zone_id, cluster_members
- [X] T012 [US3] Add timeouts block to aws_rds_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Create timeouts block with create: 120m, update: 120m, delete: 120m

**Checkpoint**: Aurora Cluster displays serverlessv2 auto-pause configuration ✓ COMPLETE

---

## Phase 6: User Story 4 - Enhanced DynamoDB Configuration (Priority: P2)

**Goal**: Add replica, import_table, and on_demand_throughput blocks to aws_dynamodb_table

**Independent Test**: Place DynamoDB Table, verify replica block for V2 global tables

### Implementation for User Story 4

- [X] T013 [P] [US4] Add replica block to aws_dynamodb_table in frontend/src/lib/aws/databaseServicesData.ts
  - Attributes: region_name (required), kms_key_arn, point_in_time_recovery, propagate_tags
- [X] T014 [P] [US4] Add import_table block to aws_dynamodb_table in frontend/src/lib/aws/databaseServicesData.ts
  - Attributes: input_compression_type, input_format (required)
  - Nested blocks: s3_bucket_source, input_format_options
- [X] T015 [P] [US4] Add on_demand_throughput block to aws_dynamodb_table in frontend/src/lib/aws/databaseServicesData.ts
  - Attributes: max_read_request_units, max_write_request_units
- [X] T016 [US4] Add additional outputs to aws_dynamodb_table in frontend/src/lib/aws/databaseServicesData.ts
  - Add stream_label, tags_all
- [X] T017 [US4] Add timeouts block to aws_dynamodb_table in frontend/src/lib/aws/databaseServicesData.ts
  - Create timeouts block with create: 30m, update: 60m, delete: 10m

**Checkpoint**: DynamoDB Table displays replica and import_table blocks ✓ COMPLETE

---

## Phase 7: User Story 5 - ElastiCache and Redis Enhancements (Priority: P2)

**Goal**: Add log_delivery_configuration and additional outputs to aws_elasticache_replication_group

**Independent Test**: Place ElastiCache Replication Group, verify log_delivery_configuration block

### Implementation for User Story 5

- [X] T018 [US5] Add log_delivery_configuration block to aws_elasticache_replication_group in frontend/src/lib/aws/databaseServicesData.ts
  - Attributes: destination (required), destination_type (required), log_format, log_type (required)
  - Multiple: true (max 2 blocks)
- [X] T019 [US5] Add additional outputs to aws_elasticache_replication_group in frontend/src/lib/aws/databaseServicesData.ts
  - Add member_clusters, engine_version_actual, cluster_enabled

**Checkpoint**: ElastiCache Replication Group displays log delivery configuration ✓ COMPLETE

---

## Phase 8: User Story 6 - Timeouts for All Database Services (Priority: P2)

**Goal**: Add timeouts blocks to all remaining database services

**Independent Test**: Verify each database service has a timeouts block with defaults

### Implementation for User Story 6

- [X] T020 [P] [US6] Add timeouts block to aws_rds_cluster_instance in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 90m, update: 90m, delete: 90m
- [X] T021 [P] [US6] Add timeouts block to aws_elasticache_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 40m, update: 80m, delete: 40m
- [X] T022 [P] [US6] Add timeouts block to aws_redshift_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 75m, update: 75m, delete: 40m
- [X] T023 [P] [US6] Add timeouts block to aws_docdb_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 120m, update: 120m, delete: 120m
- [X] T024 [P] [US6] Add timeouts block to aws_neptune_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 120m, update: 120m, delete: 120m
- [X] T025 [P] [US6] Add timeouts block to aws_memorydb_cluster in frontend/src/lib/aws/databaseServicesData.ts
  - Timeouts: create: 120m, update: 120m, delete: 120m

**Checkpoint**: All database services have appropriate timeouts ✓ COMPLETE

---

## Phase 9: Verification & Polish

**Purpose**: Validate all changes and rebuild application

- [X] T026 Update file header comment to reflect service count (19→21 services) in frontend/src/lib/aws/databaseServicesData.ts
- [X] T027 Run TypeScript type check (npx tsc --noEmit in frontend/)
- [X] T028 Rebuild Docker compose using WSL (wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down && docker compose up -d --build")
- [X] T029 Verify frontend service is running and accessible at http://localhost:3000
- [X] T030 Verify property editor displays all new services with correct options
- [X] T031 Verify property editor displays enhanced service options

**Checkpoint**: All schemas validated and application running correctly ✓ COMPLETE

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion
- **Phase 3-8 (User Stories)**: Depend on Phase 2 completion
  - User stories can proceed in parallel (different services, same file but different array entries)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Phase 9 (Verification)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 6 (P2)**: Can start after Foundational - No dependencies on other stories

### Parallel Opportunities

- T003, T004 (icon mappings) can run in parallel
- T008, T009 (new services) can run in parallel
- T013, T014, T015 (DynamoDB blocks) can run in parallel
- T020-T025 (timeouts for various services) can ALL run in parallel
- All user stories (US1-US6) can be worked on in parallel since they modify different service definitions

---

## Parallel Example: User Story 6

```bash
# Launch all timeouts tasks together:
Task: "Add timeouts to aws_rds_cluster_instance"
Task: "Add timeouts to aws_elasticache_cluster"
Task: "Add timeouts to aws_redshift_cluster"
Task: "Add timeouts to aws_docdb_cluster"
Task: "Add timeouts to aws_neptune_cluster"
Task: "Add timeouts to aws_memorydb_cluster"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (RDS Instance enhancements)
4. **STOP and VALIDATE**: TypeScript check, verify RDS schemas
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Ready
2. Add User Story 1 (RDS Instance) → Test schema → Checkpoint (MVP!)
3. Add User Story 2 (Option Group + Proxy) → Test new services → Checkpoint
4. Add User Story 3 (Aurora Cluster) → Test schemas → Checkpoint
5. Add User Story 4 (DynamoDB) → Test schemas → Checkpoint
6. Add User Story 5 (ElastiCache) → Test schemas → Checkpoint
7. Add User Story 6 (Timeouts) → Test all timeouts → Checkpoint
8. Complete verification → Full delivery

### Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 2 | 0 |
| 2 | Foundational | 2 | 1 |
| 3 | US1 - RDS Instance | 3 | 0 |
| 4 | US2 - New Services | 2 | 2 |
| 5 | US3 - Aurora | 3 | 0 |
| 6 | US4 - DynamoDB | 5 | 3 |
| 7 | US5 - ElastiCache | 2 | 0 |
| 8 | US6 - Timeouts | 6 | 6 |
| 9 | Verification | 6 | 0 |
| **Total** | | **31** | **12** |

---

## Notes

- [P] tasks = different services/entries, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes are additive - no removals of existing schema properties
- Schema data comes from research.md (Terraform Registry documentation)
- Verify each service schema against Terraform Registry after implementation
