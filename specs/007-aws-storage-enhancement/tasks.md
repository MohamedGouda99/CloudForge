# Tasks: AWS Storage Schema Enhancement

**Input**: Design documents from `/specs/007-aws-storage-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Not explicitly requested - verification via TypeScript check and Docker compose rebuild.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for this feature
- **Target file**: `frontend/src/lib/aws/storageServicesData.ts`

---

## Phase 1: Setup (Preparation)

**Purpose**: Read existing file and verify structure before modifications

- [X] T001 Read current storageServicesData.ts to understand existing structure in frontend/src/lib/aws/storageServicesData.ts
- [X] T002 Verify all icon paths exist in frontend/public/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/

**Checkpoint**: Ready to begin schema updates

---

## Phase 2: User Story 1 - Accurate S3 Bucket Configuration (Priority: P1) MVP

**Goal**: Enhance S3 Bucket schema and add all missing S3-related services with accurate Terraform Registry data

**Independent Test**: Place S3 Bucket on canvas, verify all arguments/outputs match Terraform Registry documentation

### Implementation for User Story 1

- [X] T003 [US1] Enhance aws_s3_bucket schema in frontend/src/lib/aws/storageServicesData.ts
  - Add `region` optional argument
  - Add `timeouts` property (create: 20m, read: 20m, update: 20m, delete: 60m)
  - Add `bucket_region` output
  - Update `tags_all` output

- [X] T004 [P] [US1] Add aws_s3_bucket_cors_configuration service in frontend/src/lib/aws/storageServicesData.ts
  - Required: bucket, cors_rule block
  - Optional: region, expected_bucket_owner
  - cors_rule block: allowed_methods, allowed_origins (required), allowed_headers, expose_headers, id, max_age_seconds (optional)
  - Output: id

- [X] T005 [P] [US1] Add aws_s3_bucket_website_configuration service in frontend/src/lib/aws/storageServicesData.ts
  - Required: bucket
  - Optional: region, expected_bucket_owner, error_document, index_document, redirect_all_requests_to, routing_rule, routing_rules
  - Nested blocks: error_document, index_document, redirect_all_requests_to, routing_rule with condition/redirect
  - Outputs: id, website_domain, website_endpoint

- [X] T006 [P] [US1] Add aws_s3_bucket_notification service in frontend/src/lib/aws/storageServicesData.ts
  - Required: bucket
  - Optional: region, eventbridge, lambda_function block, queue block, topic block
  - lambda_function: events, lambda_function_arn (required), id, filter_prefix, filter_suffix (optional)
  - queue: events, queue_arn (required), id, filter_prefix, filter_suffix (optional)
  - topic: events, topic_arn (required), id, filter_prefix, filter_suffix (optional)

- [X] T007 [P] [US1] Add aws_s3_bucket_replication_configuration service in frontend/src/lib/aws/storageServicesData.ts
  - Required: bucket, role, rule block
  - Optional: region, token
  - rule block: status, destination (required), id, priority, filter, delete_marker_replication, source_selection_criteria
  - destination block: bucket (required), storage_class, account, access_control_translation, encryption_configuration, metrics, replication_time
  - Output: id

- [X] T008 [US1] Add icon mappings for new S3 services in STORAGE_ICONS object in frontend/src/lib/aws/storageServicesData.ts
  - aws_s3_bucket_cors_configuration
  - aws_s3_bucket_website_configuration
  - aws_s3_bucket_notification
  - aws_s3_bucket_replication_configuration

**Checkpoint**: S3 Bucket and all related services should be fully documented with accurate schemas

---

## Phase 3: User Story 2 - Accurate EBS Volume Configuration (Priority: P1)

**Goal**: Enhance EBS Volume schema and add EBS Snapshot Copy service

**Independent Test**: Place EBS Volume on canvas, verify availability_zone required, all optional args (final_snapshot, outpost_arn, etc.), and outputs (create_time)

### Implementation for User Story 2

- [X] T009 [US2] Enhance aws_ebs_volume schema in frontend/src/lib/aws/storageServicesData.ts
  - Add `final_snapshot` (bool) optional argument
  - Add `outpost_arn` (string) optional argument
  - Add `volume_initialization_rate` (number) optional argument
  - Add `create_time` (string) output

- [X] T010 [P] [US2] Add aws_ebs_snapshot_copy service in frontend/src/lib/aws/storageServicesData.ts
  - Required: source_snapshot_id, source_region
  - Optional: region, description, encrypted, kms_key_id, storage_tier (archive/standard), permanent_restore, temporary_restore_days, completion_duration_minutes, tags
  - Outputs: id, arn, owner_id, owner_alias, volume_size, data_encryption_key_id, tags_all
  - Timeouts: create 10m, delete 10m

- [X] T011 [US2] Add icon mapping for aws_ebs_snapshot_copy in STORAGE_ICONS object in frontend/src/lib/aws/storageServicesData.ts

**Checkpoint**: EBS Volume and Snapshot Copy should be fully documented with accurate schemas

---

## Phase 4: User Story 3 - Accurate EFS File System Configuration (Priority: P1)

**Goal**: Enhance EFS File System schema with protection block, transition_to_archive, and additional outputs

**Independent Test**: Place EFS File System on canvas, verify throughput_mode options, lifecycle_policy with transition_to_archive, protection block, and outputs (dns_name, size_in_bytes, availability_zone_id)

### Implementation for User Story 3

- [X] T012 [US3] Enhance aws_efs_file_system lifecycle_policy block in frontend/src/lib/aws/storageServicesData.ts
  - Add `transition_to_archive` option to lifecycle_policy attributes

- [X] T013 [US3] Add protection block to aws_efs_file_system in frontend/src/lib/aws/storageServicesData.ts
  - Attribute: `replication_overwrite` (string) with options ["ENABLED", "DISABLED"]

- [X] T014 [US3] Add additional outputs to aws_efs_file_system in frontend/src/lib/aws/storageServicesData.ts
  - Add `availability_zone_id` (string)
  - Add `name` (string)
  - Add `owner_id` (string)
  - Add `size_in_bytes` (object with value, value_in_ia, value_in_standard)

**Checkpoint**: EFS File System should be fully documented with accurate schema

---

## Phase 5: User Story 4 - Complete Storage Service Coverage (Priority: P2)

**Goal**: Add Glacier Vault Lock service to complete all 25 storage services

**Independent Test**: Browse storage services catalog, verify all 25 services present with complete schemas

### Implementation for User Story 4

- [X] T015 [US4] Add aws_glacier_vault_lock service in frontend/src/lib/aws/storageServicesData.ts
  - Required: complete_lock (bool - WARNING: irreversible), policy (string JSON), vault_name (string)
  - Optional: region, ignore_deletion_error
  - Output: id

- [X] T016 [US4] Add icon mapping for aws_glacier_vault_lock in STORAGE_ICONS object in frontend/src/lib/aws/storageServicesData.ts

- [X] T017 [US4] Update file header comment to reflect accurate count (25 services now complete) in frontend/src/lib/aws/storageServicesData.ts

**Checkpoint**: All 25 storage services should be complete with accurate schemas

---

## Phase 6: Verification & Polish

**Purpose**: Validate all changes and rebuild application

- [X] T018 Run TypeScript type check to verify no type errors (npx tsc --noEmit in frontend/)
- [X] T019 Rebuild Docker compose using WSL (wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down && docker compose up -d --build")
- [X] T020 Verify frontend service is running and accessible at http://localhost:3000
- [X] T021 Verify property editor displays all new S3 services with correct options
- [X] T022 Verify property editor displays enhanced EBS Volume options
- [X] T023 Verify property editor displays enhanced EFS File System options

**Checkpoint**: All schemas validated and application running correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2-5 (User Stories)**: Depend on Phase 1 completion
  - User stories can proceed in parallel (different services, same file but different array entries)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Phase 6 (Verification)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Setup - Completes coverage

### Parallel Opportunities

- T004, T005, T006, T007 (new S3 services) can run in parallel
- T010 (EBS snapshot copy) can run in parallel with S3 tasks
- All user stories (US1-US4) can be worked on in parallel since they modify different service definitions

---

## Parallel Example: User Story 1

```bash
# Launch all new S3 services together:
Task: "Add aws_s3_bucket_cors_configuration service"
Task: "Add aws_s3_bucket_website_configuration service"
Task: "Add aws_s3_bucket_notification service"
Task: "Add aws_s3_bucket_replication_configuration service"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (S3 services)
3. **STOP and VALIDATE**: TypeScript check, verify S3 schemas
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Ready
2. Add User Story 1 → Test S3 schemas → Checkpoint (MVP!)
3. Add User Story 2 → Test EBS schemas → Checkpoint
4. Add User Story 3 → Test EFS schemas → Checkpoint
5. Add User Story 4 → Test complete coverage → Checkpoint
6. Complete verification → Full delivery

### Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 2 | 0 |
| 2 | US1 - S3 | 6 | 4 |
| 3 | US2 - EBS | 3 | 1 |
| 4 | US3 - EFS | 3 | 0 |
| 5 | US4 - Coverage | 3 | 0 |
| 6 | Verification | 6 | 0 |
| **Total** | | **23** | **5** |

---

## Notes

- [P] tasks = different services/entries, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes are additive - no removals of existing schema properties
- Schema data comes from research.md (Terraform Registry documentation)
- Verify each service schema against Terraform Registry after implementation
