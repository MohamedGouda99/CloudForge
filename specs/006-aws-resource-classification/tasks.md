# Tasks: AWS Resource Classification Audit

**Input**: Design documents from `/specs/006-aws-resource-classification/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/catalog-api.yaml

**Tests**: Not explicitly requested in spec - tests are optional but recommended for critical paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing catalog package structure and add missing categories

- [ ] T001 Verify shared/resource-catalog package exists with types.ts containing ServiceDefinition
- [ ] T002 [P] Create shared/resource-catalog/src/aws/networking/ directory for VPC, Subnet, etc.
- [ ] T003 [P] Create shared/resource-catalog/src/aws/storage/ directory for S3, EFS
- [ ] T004 [P] Create shared/resource-catalog/src/aws/database/ directory for RDS, DynamoDB
- [ ] T005 [P] Create shared/resource-catalog/src/aws/security/ directory for IAM, Cognito
- [ ] T006 [P] Create shared/resource-catalog/src/aws/messaging/ directory for SNS, SQS
- [ ] T007 [P] Create shared/resource-catalog/src/aws/management/ directory for CloudWatch
- [ ] T008 [P] Create shared/resource-catalog/src/aws/developer-tools/ directory for CodePipeline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend types.ts with classification and containmentRules, update exports

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Update shared/resource-catalog/src/types.ts to add classification field to ServiceDefinition
- [ ] T010 Update shared/resource-catalog/src/types.ts to add RelationshipRules with containmentRules
- [ ] T011 Update shared/resource-catalog/src/types.ts to add ContainmentRule interface
- [ ] T012 Create shared/resource-catalog/src/aws/index.ts to re-export all category modules
- [ ] T013 Update backend/app/services/terraform/schema_loader.py to expose is_container_resource() method
- [ ] T014 Update backend/app/services/terraform/schema_loader.py to expose get_containment_rules() method
- [ ] T015 Update backend/app/api/endpoints/catalog.py to include classification in response schema
- [ ] T016 Add /api/catalog/containers/list endpoint to backend/app/api/endpoints/catalog.py
- [ ] T017 Add /api/catalog/containment/{terraform_resource} endpoint to backend/app/api/endpoints/catalog.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visual Container Classification (Priority: P1) 🎯 MVP

**Goal**: AWS resources correctly classified as containers or icons for React Flow rendering

**Independent Test**: Drag VPC onto canvas → expands as container. Drag EC2 → renders as icon.

### Implementation for User Story 1

#### Networking Category (Containers)

- [ ] T018 [P] [US1] Create aws_vpc ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/vpc.ts
- [ ] T019 [P] [US1] Create aws_subnet ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/subnet.ts
- [ ] T020 [P] [US1] Create aws_security_group ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/security-group.ts
- [ ] T021 [P] [US1] Create aws_route_table ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/route-table.ts
- [ ] T022 [P] [US1] Create aws_network_acl ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/network-acl.ts
- [ ] T023 [P] [US1] Create aws_lb ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/load-balancer.ts
- [ ] T024 [P] [US1] Create aws_lb_listener ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/lb-listener.ts
- [ ] T025 [P] [US1] Create aws_lb_target_group ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/target-group.ts
- [ ] T026 [P] [US1] Create aws_route53_zone ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/route53-zone.ts
- [ ] T027 [P] [US1] Create aws_api_gateway_rest_api ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/api-gateway.ts
- [ ] T028 [P] [US1] Create aws_apigatewayv2_api ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/api-gateway-v2.ts
- [ ] T029 [P] [US1] Create aws_ec2_transit_gateway ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/networking/transit-gateway.ts

#### Networking Category (Icons)

- [ ] T030 [P] [US1] Create aws_internet_gateway ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/networking/internet-gateway.ts
- [ ] T031 [P] [US1] Create aws_nat_gateway ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/networking/nat-gateway.ts
- [ ] T032 [P] [US1] Create aws_eip ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/networking/eip.ts
- [ ] T033 [P] [US1] Create aws_route ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/networking/route.ts
- [ ] T034 [P] [US1] Create aws_security_group_rule ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/networking/security-group-rule.ts
- [ ] T035 [US1] Create shared/resource-catalog/src/aws/networking/index.ts to export all networking resources

#### Storage Category

- [ ] T036 [P] [US1] Create aws_s3_bucket ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/storage/s3-bucket.ts
- [ ] T037 [P] [US1] Create aws_efs_file_system ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/storage/efs.ts
- [ ] T038 [P] [US1] Create aws_s3_object ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/storage/s3-object.ts
- [ ] T039 [P] [US1] Create aws_ebs_volume ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/storage/ebs-volume.ts
- [ ] T040 [US1] Create shared/resource-catalog/src/aws/storage/index.ts to export all storage resources

#### Database Category

- [ ] T041 [P] [US1] Create aws_rds_cluster ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/database/rds-cluster.ts
- [ ] T042 [P] [US1] Create aws_dynamodb_table ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/database/dynamodb-table.ts
- [ ] T043 [P] [US1] Create aws_db_instance ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/database/rds-instance.ts
- [ ] T044 [P] [US1] Create aws_elasticache_cluster ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/database/elasticache.ts
- [ ] T045 [US1] Create shared/resource-catalog/src/aws/database/index.ts to export all database resources

#### Security Category

- [ ] T046 [P] [US1] Create aws_iam_role ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/security/iam-role.ts
- [ ] T047 [P] [US1] Create aws_iam_user ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/security/iam-user.ts
- [ ] T048 [P] [US1] Create aws_iam_group ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/security/iam-group.ts
- [ ] T049 [P] [US1] Create aws_cognito_user_pool ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/security/cognito-user-pool.ts
- [ ] T050 [P] [US1] Create aws_kms_key ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/security/kms-key.ts
- [ ] T051 [P] [US1] Create aws_secretsmanager_secret ServiceDefinition with classification:'icon' in shared/resource-catalog/src/aws/security/secrets-manager.ts
- [ ] T052 [US1] Create shared/resource-catalog/src/aws/security/index.ts to export all security resources

#### Messaging Category

- [ ] T053 [P] [US1] Create aws_sns_topic ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/messaging/sns-topic.ts
- [ ] T054 [P] [US1] Create aws_sqs_queue ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/messaging/sqs-queue.ts
- [ ] T055 [US1] Create shared/resource-catalog/src/aws/messaging/index.ts to export all messaging resources

#### Management Category

- [ ] T056 [P] [US1] Create aws_cloudwatch_log_group ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/management/cloudwatch-log-group.ts
- [ ] T057 [P] [US1] Create aws_cloudwatch_event_rule ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/management/eventbridge-rule.ts
- [ ] T058 [US1] Create shared/resource-catalog/src/aws/management/index.ts to export all management resources

#### Developer Tools Category

- [ ] T059 [P] [US1] Create aws_codepipeline ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/developer-tools/codepipeline.ts
- [ ] T060 [P] [US1] Create aws_codebuild_project ServiceDefinition with classification:'container' in shared/resource-catalog/src/aws/developer-tools/codebuild.ts
- [ ] T061 [US1] Create shared/resource-catalog/src/aws/developer-tools/index.ts to export all developer-tools resources

#### Update Existing Compute/Containers

- [ ] T062 [US1] Update shared/resource-catalog/src/aws/compute/ec2.ts to add classification:'icon'
- [ ] T063 [US1] Update shared/resource-catalog/src/aws/compute/lambda.ts to add classification:'container' (holds permissions)
- [ ] T064 [US1] Update shared/resource-catalog/src/aws/compute/autoscaling-group.ts to add classification:'container'
- [ ] T065 [US1] Update shared/resource-catalog/src/aws/compute/launch-template.ts to add classification:'container'
- [ ] T066 [US1] Update shared/resource-catalog/src/aws/compute/elastic-beanstalk.ts to add classification:'container'
- [ ] T067 [US1] Update shared/resource-catalog/src/aws/containers/ecs-cluster.ts to add classification:'container'
- [ ] T068 [US1] Update shared/resource-catalog/src/aws/containers/eks-cluster.ts to add classification:'container'
- [ ] T069 [US1] Update shared/resource-catalog/src/aws/containers/ecs-service.ts to add classification:'icon'
- [ ] T070 [US1] Update shared/resource-catalog/src/aws/containers/ecs-task-definition.ts to add classification:'icon'

#### Catalog Index Updates

- [ ] T071 [US1] Update shared/resource-catalog/src/aws/index.ts to export all new category modules
- [ ] T072 [US1] Run npm run build in shared/resource-catalog to verify TypeScript compilation

**Checkpoint**: All resources have classification field. US1 frontend integration can proceed.

---

## Phase 4: User Story 2 - Containment Relationship Documentation (Priority: P2)

**Goal**: Each container resource has containmentRules defining valid child types

**Independent Test**: Inspect aws_vpc.relations.containmentRules → shows aws_subnet, aws_security_group, etc.

### Implementation for User Story 2

#### Networking Containment Rules

- [ ] T073 [P] [US2] Add containmentRules to aws_vpc: [aws_subnet, aws_security_group, aws_internet_gateway, aws_nat_gateway, aws_route_table, aws_network_acl, aws_vpn_gateway, aws_vpc_endpoint]
- [ ] T074 [P] [US2] Add containmentRules to aws_subnet: [aws_instance, aws_nat_gateway, aws_network_interface, aws_db_instance, aws_elasticache_cluster, aws_efs_mount_target]
- [ ] T075 [P] [US2] Add containmentRules to aws_security_group: [aws_security_group_rule]
- [ ] T076 [P] [US2] Add containmentRules to aws_route_table: [aws_route]
- [ ] T077 [P] [US2] Add containmentRules to aws_network_acl: [aws_network_acl_rule]
- [ ] T078 [P] [US2] Add containmentRules to aws_lb: [aws_lb_listener]
- [ ] T079 [P] [US2] Add containmentRules to aws_lb_listener: [aws_lb_listener_rule]
- [ ] T080 [P] [US2] Add containmentRules to aws_lb_target_group: [aws_lb_target_group_attachment]
- [ ] T081 [P] [US2] Add containmentRules to aws_route53_zone: [aws_route53_record]
- [ ] T082 [P] [US2] Add containmentRules to aws_api_gateway_rest_api: [aws_api_gateway_resource, aws_api_gateway_method, aws_api_gateway_deployment]
- [ ] T083 [P] [US2] Add containmentRules to aws_apigatewayv2_api: [aws_apigatewayv2_route, aws_apigatewayv2_integration, aws_apigatewayv2_stage]
- [ ] T084 [P] [US2] Add containmentRules to aws_ec2_transit_gateway: [aws_ec2_transit_gateway_vpc_attachment, aws_ec2_transit_gateway_route_table]

#### Containers Containment Rules

- [ ] T085 [P] [US2] Add containmentRules to aws_ecs_cluster: [aws_ecs_service, aws_ecs_capacity_provider]
- [ ] T086 [P] [US2] Add containmentRules to aws_eks_cluster: [aws_eks_node_group, aws_eks_fargate_profile, aws_eks_addon]

#### Storage Containment Rules

- [ ] T087 [P] [US2] Add containmentRules to aws_s3_bucket: [aws_s3_object, aws_s3_bucket_policy, aws_s3_bucket_versioning, aws_s3_bucket_lifecycle_configuration]
- [ ] T088 [P] [US2] Add containmentRules to aws_efs_file_system: [aws_efs_mount_target, aws_efs_access_point]

#### Database Containment Rules

- [ ] T089 [P] [US2] Add containmentRules to aws_dynamodb_table: [aws_dynamodb_table_item]
- [ ] T090 [P] [US2] Add containmentRules to aws_rds_cluster: [aws_rds_cluster_instance]

#### Security Containment Rules

- [ ] T091 [P] [US2] Add containmentRules to aws_iam_role: [aws_iam_role_policy, aws_iam_role_policy_attachment, aws_iam_instance_profile]
- [ ] T092 [P] [US2] Add containmentRules to aws_iam_user: [aws_iam_user_policy, aws_iam_user_policy_attachment, aws_iam_access_key]
- [ ] T093 [P] [US2] Add containmentRules to aws_iam_group: [aws_iam_group_policy, aws_iam_group_policy_attachment]
- [ ] T094 [P] [US2] Add containmentRules to aws_cognito_user_pool: [aws_cognito_user_pool_client]

#### Serverless Containment Rules

- [ ] T095 [P] [US2] Add containmentRules to aws_lambda_function: [aws_lambda_permission, aws_lambda_alias, aws_lambda_event_source_mapping]

#### Compute Containment Rules

- [ ] T096 [P] [US2] Add containmentRules to aws_autoscaling_group: [aws_autoscaling_policy, aws_autoscaling_schedule, aws_autoscaling_lifecycle_hook]
- [ ] T097 [P] [US2] Add containmentRules to aws_launch_template: [aws_autoscaling_group]
- [ ] T098 [P] [US2] Add containmentRules to aws_elastic_beanstalk_application: [aws_elastic_beanstalk_environment]

#### Messaging Containment Rules

- [ ] T099 [P] [US2] Add containmentRules to aws_sns_topic: [aws_sns_topic_subscription]
- [ ] T100 [P] [US2] Add containmentRules to aws_sqs_queue: [aws_sqs_queue_policy]

#### Management Containment Rules

- [ ] T101 [P] [US2] Add containmentRules to aws_cloudwatch_log_group: [aws_cloudwatch_log_stream, aws_cloudwatch_log_metric_filter]
- [ ] T102 [P] [US2] Add containmentRules to aws_cloudwatch_event_rule: [aws_cloudwatch_event_target]

#### Developer Tools Containment Rules

- [ ] T103 [P] [US2] Add containmentRules to aws_codepipeline: [aws_codepipeline_webhook]
- [ ] T104 [P] [US2] Add containmentRules to aws_codebuild_project: [aws_codebuild_webhook]

#### Backend Integration

- [ ] T105 [US2] Update backend/app/services/terraform/schema_loader.py to load containmentRules from catalog
- [ ] T106 [US2] Refactor backend/app/api/endpoints/projects.py to remove hardcoded VPC containment rules (~lines 312-322)
- [ ] T107 [US2] Refactor backend/app/api/endpoints/projects.py to remove hardcoded Subnet containment rules (~lines 327-343)
- [ ] T108 [US2] Refactor backend/app/api/endpoints/projects.py to remove hardcoded Security Group containment rules
- [ ] T109 [US2] Refactor backend/app/api/endpoints/projects.py to remove hardcoded ECS/EKS containment rules
- [ ] T110 [US2] Refactor backend/app/api/endpoints/projects.py to use SchemaLoader.get_containment_rules() for all auto-wiring
- [ ] T111 [US2] Run npm run build:all in shared/resource-catalog to generate updated catalog.json

**Checkpoint**: All container resources have containmentRules. Backend uses dynamic lookups.

---

## Phase 5: User Story 3 - Catalog API Integration (Priority: P3)

**Goal**: Frontend receives classification and containmentRules from API for dynamic node behavior

**Independent Test**: GET /api/catalog returns classification field for every resource.

### Implementation for User Story 3

#### Backend API Updates

- [ ] T112 [P] [US3] Update /api/catalog response schema to include relations.containmentRules in backend/app/api/endpoints/catalog.py
- [ ] T113 [P] [US3] Add /api/catalog/validate-containment endpoint for real-time validation in backend/app/api/endpoints/catalog.py
- [ ] T114 [US3] Verify /api/catalog/containers/list returns correct list of 30+ container types

#### Frontend Catalog Client

- [ ] T115 [US3] Update frontend/src/lib/catalog/index.ts to parse classification from API response
- [ ] T116 [US3] Add getContainerTypes() function to frontend/src/lib/catalog/index.ts
- [ ] T117 [US3] Add validateContainment() function to frontend/src/lib/catalog/index.ts
- [ ] T118 [US3] Implement localStorage cache with 24-hour TTL in frontend/src/lib/catalog/index.ts
- [ ] T119 [US3] Add isStale flag and stale data indicator logic to frontend/src/lib/catalog/index.ts

#### Frontend Node Classifier

- [ ] T120 [US3] Update frontend/src/features/designer/utils/nodeClassifier.ts to use catalog classification
- [ ] T121 [US3] Add isContainerNode() function using catalog data in frontend/src/features/designer/utils/nodeClassifier.ts
- [ ] T122 [US3] Add getValidChildren() function for containment lookup in frontend/src/features/designer/utils/nodeClassifier.ts
- [ ] T123 [US3] Add default-to-icon fallback for unknown resources in frontend/src/features/designer/utils/nodeClassifier.ts

#### Warning Indicator Component

- [ ] T124 [P] [US3] Create frontend/src/features/designer/components/WarningIndicator.tsx for invalid containment
- [ ] T125 [US3] Add warning indicator for unknown resource types in frontend/src/features/designer/components/WarningIndicator.tsx
- [ ] T126 [US3] Add stale cache indicator component in frontend/src/features/designer/components/WarningIndicator.tsx
- [ ] T127 [US3] Integrate WarningIndicator into React Flow node rendering

**Checkpoint**: Frontend dynamically determines node behavior from catalog API.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and integration testing

- [ ] T128 [P] Verify all 12 AWS categories have resources with classification field
- [ ] T129 [P] Verify all container resources (30+) have containmentRules defined
- [ ] T130 [P] Run TypeScript build to verify no type errors in shared/resource-catalog
- [ ] T131 [P] Run backend pytest to verify catalog API tests pass
- [ ] T132 [P] Run frontend vitest to verify nodeClassifier tests pass
- [ ] T133 Verify React Flow canvas renders VPC as container with expandable boundaries
- [ ] T134 Verify React Flow canvas renders EC2 as icon with fixed size
- [ ] T135 Verify drag-drop into container shows warning for invalid containment
- [ ] T136 Verify unknown resource type defaults to icon with warning indicator
- [ ] T137 Clean up any remaining hardcoded resource lists in backend/app/api/endpoints/projects.py
- [ ] T138 Update CLAUDE.md with new catalog classification architecture notes
- [ ] T139 Run quickstart.md validation - verify all steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs classification field first)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (needs containmentRules for validation)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Classification field must exist before containmentRules
- **User Story 2 (P2)**: Can start after US1 completes - adds containmentRules to classified resources
- **User Story 3 (P3)**: Can start after US2 completes - frontend consumes fully-defined catalog

### Within Each User Story

- Category directories before individual resources
- ServiceDefinition files before index.ts exports
- Catalog build before backend/frontend integration
- Backend API before frontend consumption

### Parallel Opportunities

- All Setup tasks (T002-T008) can run in parallel
- All US1 resource creation tasks within each category can run in parallel
- All US2 containmentRules additions can run in parallel
- Backend and frontend US3 work can partially overlap

---

## Parallel Example: User Story 1 - Networking Category

```bash
# Launch all networking containers in parallel:
Task: "Create aws_vpc ServiceDefinition in shared/resource-catalog/src/aws/networking/vpc.ts"
Task: "Create aws_subnet ServiceDefinition in shared/resource-catalog/src/aws/networking/subnet.ts"
Task: "Create aws_security_group ServiceDefinition in shared/resource-catalog/src/aws/networking/security-group.ts"
Task: "Create aws_route_table ServiceDefinition in shared/resource-catalog/src/aws/networking/route-table.ts"
# ... (12 parallel tasks)

# Then launch networking icons in parallel:
Task: "Create aws_internet_gateway ServiceDefinition in shared/resource-catalog/src/aws/networking/internet-gateway.ts"
Task: "Create aws_nat_gateway ServiceDefinition in shared/resource-catalog/src/aws/networking/nat-gateway.ts"
# ... (5 parallel tasks)

# Then create index.ts (depends on all above):
Task: "Create shared/resource-catalog/src/aws/networking/index.ts to export all networking resources"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T017)
3. Complete Phase 3: User Story 1 (T018-T072)
4. **STOP and VALIDATE**: Verify all resources have classification field
5. Build catalog and verify TypeScript compiles

### Incremental Delivery

1. Setup + Foundational → Types ready
2. Add User Story 1 → All resources classified → Build catalog
3. Add User Story 2 → All containers have rules → Refactor projects.py
4. Add User Story 3 → Frontend integration → Full feature complete
5. Polish → Validation and cleanup

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Phase 1: Setup | 8 | 7 parallel |
| Phase 2: Foundational | 9 | 0 (sequential) |
| Phase 3: US1 - Classification | 55 | ~45 parallel |
| Phase 4: US2 - ContainmentRules | 39 | ~32 parallel |
| Phase 5: US3 - API Integration | 16 | ~4 parallel |
| Phase 6: Polish | 12 | ~5 parallel |
| **Total** | **139** | ~93 parallel |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
