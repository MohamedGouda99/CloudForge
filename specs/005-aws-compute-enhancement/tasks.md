# Tasks: AWS Compute Resource Enhancement

**Input**: Design documents from `/specs/005-aws-compute-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests ARE requested (FR-020, FR-021, FR-022 mandate testing baseline with 90% coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/`, `shared/resource-catalog/`
- Based on plan.md structure with new unified resource catalog

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the unified resource catalog package and project structure

- [X] T001 Create shared/resource-catalog/ directory structure per plan.md
- [X] T002 Initialize shared/resource-catalog/package.json with TypeScript dependencies
- [X] T003 [P] Create shared/resource-catalog/tsconfig.json with strict mode enabled
- [X] T004 [P] Create shared/resource-catalog/src/types.ts with ServiceDefinition, InputAttribute, OutputAttribute, TerraformMetadata, RelationshipRules interfaces from data-model.md
- [X] T005 [P] Create shared/resource-catalog/src/validation.ts with schema validation utilities
- [X] T006 Create shared/resource-catalog/scripts/generate-json.ts build script (TS → JSON for Python)
- [ ] T007 Link shared package to frontend via npm link in frontend/package.json
- [ ] T008 Link shared package to backend TypeScript via npm link in backend/src/terraform/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create shared/resource-catalog/src/aws/index.ts with re-exports for all AWS services
- [X] T010 Create shared/resource-catalog/src/aws/icons.ts with unified icon path constants (/cloud_icons/AWS/Architecture-Service-Icons_07312025/)
- [X] T011 Create backend/app/services/terraform/schema_loader.py to load JSON schemas at startup
- [X] T012 Create backend/app/api/endpoints/catalog.py with GET /api/catalog endpoint
- [X] T013 Register catalog router in backend/app/main.py
- [X] T014 Create frontend/src/lib/catalog/index.ts to import from backend API
- [X] T015 Create frontend/src/features/designer/utils/nodeClassifier.ts with isContainerNode() and isIconNode() functions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - EC2 Infrastructure (Priority: P1) 🎯 MVP

**Goal**: Complete EC2 Instance schema with all valid Terraform attributes, correct icon, and valid HCL generation

**Independent Test**: Drag EC2 instance onto canvas, configure all fields, generate Terraform, run `terraform validate`

### Tests for User Story 1

- [ ] T016 [P] [US1] Create backend/tests/contract/test_hcl_generation.py with terraform validate test for aws_instance
- [ ] T017 [P] [US1] Create backend/tests/unit/test_resource_schemas.py with schema validation for EC2 (type, label, icon, inputs)
- [ ] T018 [P] [US1] Create frontend/tests/unit/catalog.test.ts with EC2 schema import and validation test

### Implementation for User Story 1

- [X] T019 [US1] Create shared/resource-catalog/src/aws/compute/ec2.ts with complete aws_instance ServiceDefinition (ami, instance_type, subnet_id, vpc_security_group_ids, key_name, iam_instance_profile, user_data, associate_public_ip_address, monitoring, tags, root_block_device block)
- [X] T020 [US1] Add EC2 outputs (id, arn, public_ip, private_ip, public_dns, private_dns) to ec2.ts
- [X] T021 [US1] Add EC2 relationship rules (containment in subnet, edge to security group, attach to IAM profile) to ec2.ts
- [ ] T022 [US1] Run npm run build in shared/resource-catalog to generate compute.schema.json
- [ ] T023 [US1] Update backend/app/services/terraform/generators/aws.py to load EC2 schema from schema_loader
- [ ] T024 [US1] Update frontend/src/components/InspectorPanel.tsx to render EC2 fields from unified catalog
- [ ] T025 [US1] Verify EC2 icon renders correctly at /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg
- [ ] T026 [US1] Run backend/tests/contract/test_hcl_generation.py to verify terraform validate passes for EC2

**Checkpoint**: EC2 Instance fully functional and testable independently

---

## Phase 4: User Story 2 - Lambda Functions (Priority: P1)

**Goal**: Complete Lambda Function schema with all runtimes, memory, timeout, and proper IAM role generation

**Independent Test**: Create Lambda on canvas, configure runtime/memory/timeout, connect IAM role, generate Terraform with valid HCL

### Tests for User Story 2

- [ ] T027 [P] [US2] Add aws_lambda_function to backend/tests/contract/test_hcl_generation.py parametrized tests
- [ ] T028 [P] [US2] Add Lambda schema validation to backend/tests/unit/test_resource_schemas.py
- [ ] T029 [P] [US2] Add Lambda schema test to frontend/tests/unit/catalog.test.ts

### Implementation for User Story 2

- [X] T030 [US2] Create shared/resource-catalog/src/aws/compute/lambda.ts with complete aws_lambda_function ServiceDefinition (function_name, role, runtime with all options, handler, memory_size 128-10240, timeout 1-900, architectures, environment, tags)
- [X] T031 [US2] Add Lambda outputs (arn, invoke_arn, qualified_arn, version) to lambda.ts
- [X] T032 [US2] Add Lambda relationship rules (attach to IAM role creates role policy attachment) to lambda.ts
- [X] T033 [US2] Add validation rules for memory_size (min: 128, max: 10240) and timeout (min: 1, max: 900) to lambda.ts
- [ ] T034 [US2] Rebuild shared package: npm run build in shared/resource-catalog
- [ ] T035 [US2] Update InspectorPanel.tsx to render Lambda fields with runtime dropdown (nodejs20.x, python3.12, java21, etc.)
- [ ] T036 [US2] Verify Lambda icon renders at /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg
- [ ] T037 [US2] Run terraform validate test for Lambda

**Checkpoint**: Lambda Function fully functional and testable independently

---

## Phase 5: User Story 3 - ECS/EKS Container Workloads (Priority: P2)

**Goal**: Complete ECS Cluster, ECS Service, ECS Task Definition, EKS Cluster, EKS Node Group with container node behavior

**Independent Test**: Create ECS cluster with service inside it, verify containment behavior, generate valid Terraform

### Tests for User Story 3

- [ ] T038 [P] [US3] Add aws_ecs_cluster, aws_ecs_service, aws_ecs_task_definition to backend/tests/contract/test_hcl_generation.py
- [ ] T039 [P] [US3] Add aws_eks_cluster, aws_eks_node_group to backend/tests/contract/test_hcl_generation.py
- [ ] T040 [P] [US3] Add ECS/EKS schema validation to backend/tests/unit/test_resource_schemas.py

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create shared/resource-catalog/src/aws/containers/ecs-cluster.ts with aws_ecs_cluster ServiceDefinition (name, capacity_providers, setting block, classification: "container")
- [ ] T042 [P] [US3] Create shared/resource-catalog/src/aws/containers/ecs-service.ts with aws_ecs_service ServiceDefinition (name, cluster, task_definition, desired_count, launch_type, network_configuration block, load_balancer block)
- [ ] T043 [P] [US3] Create shared/resource-catalog/src/aws/containers/ecs-task-definition.ts with aws_ecs_task_definition ServiceDefinition (family, container_definitions, cpu, memory, network_mode, requires_compatibilities)
- [ ] T044 [P] [US3] Create shared/resource-catalog/src/aws/containers/eks-cluster.ts with aws_eks_cluster ServiceDefinition (name, role_arn, version, vpc_config block, classification: "container")
- [ ] T045 [P] [US3] Create shared/resource-catalog/src/aws/containers/eks-node-group.ts with aws_eks_node_group ServiceDefinition (cluster_name, node_group_name, node_role_arn, subnet_ids, scaling_config block)
- [ ] T046 [US3] Create shared/resource-catalog/src/aws/containers/index.ts to re-export all container services
- [ ] T047 [US3] Add containment rules to ECS cluster (can contain ECS services) in ecs-cluster.ts
- [ ] T048 [US3] Add containment rules to EKS cluster (can contain node groups) in eks-cluster.ts
- [ ] T049 [US3] Rebuild shared package and regenerate JSON
- [ ] T050 [US3] Verify ECS Cluster icon at /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg
- [ ] T051 [US3] Verify EKS Cluster icon at /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg

**Checkpoint**: ECS/EKS container resources fully functional and testable independently

---

## Phase 6: User Story 4 - Visual Node Classification (Priority: P2)

**Goal**: Container nodes (ECS Cluster, EKS Cluster) render with expandable boundaries, icon nodes render as fixed-size elements

**Independent Test**: Place ECS Cluster on canvas, drag ECS Service into it, verify visual containment and automatic cluster reference

### Tests for User Story 4

- [ ] T052 [P] [US4] Create frontend/tests/e2e/compute-resources.spec.ts with Playwright test for icon node rendering
- [ ] T053 [P] [US4] Add Playwright test for container node rendering (ECS Cluster accepts drops)
- [ ] T054 [P] [US4] Add Playwright test for visual containment (service inside cluster)

### Implementation for User Story 4

- [ ] T055 [US4] Update frontend/src/features/designer/nodes/ContainerNode.tsx to use classification from catalog
- [ ] T056 [US4] Update frontend/src/features/designer/nodes/IconNode.tsx to use classification from catalog
- [ ] T057 [US4] Update nodeClassifier.ts to read classification field from ServiceDefinition
- [ ] T058 [US4] Implement drop handling in ContainerNode.tsx to accept child nodes and set parent reference
- [ ] T059 [US4] Add distinct visual indicator for container vs icon in resource palette (frontend/src/components/DesignerToolbar.tsx)
- [ ] T060 [US4] Test ECS Service dropped into ECS Cluster automatically sets cluster ARN reference

**Checkpoint**: Visual node classification fully functional - containers contain children, icons are standalone

---

## Phase 7: User Story 5 - Auto Scaling Configuration (Priority: P3)

**Goal**: Launch Template and Auto Scaling Group with scaling policies and target tracking

**Independent Test**: Create Launch Template, connect to ASG, configure scaling policy, generate valid Terraform

### Tests for User Story 5

- [ ] T061 [P] [US5] Add aws_launch_template, aws_autoscaling_group to backend/tests/contract/test_hcl_generation.py
- [ ] T062 [P] [US5] Add aws_autoscaling_policy to backend/tests/contract/test_hcl_generation.py

### Implementation for User Story 5

- [ ] T063 [P] [US5] Create shared/resource-catalog/src/aws/compute/launch-template.ts with aws_launch_template ServiceDefinition (name, image_id, instance_type, key_name, user_data, network_interfaces block, block_device_mappings block)
- [ ] T064 [P] [US5] Create shared/resource-catalog/src/aws/compute/autoscaling-group.ts with aws_autoscaling_group ServiceDefinition (name, min_size, max_size, desired_capacity, vpc_zone_identifier, launch_template block, mixed_instances_policy block)
- [ ] T065 [P] [US5] Create shared/resource-catalog/src/aws/compute/autoscaling-policy.ts with aws_autoscaling_policy ServiceDefinition (name, autoscaling_group_name, policy_type, target_tracking_configuration block)
- [ ] T066 [US5] Add relationship rules for ASG → Launch Template connection in autoscaling-group.ts
- [ ] T067 [US5] Rebuild shared package and regenerate JSON
- [ ] T068 [US5] Verify Launch Template and ASG icons render correctly
- [ ] T069 [US5] Test ASG connected to Launch Template generates correct launch_template block with version reference

**Checkpoint**: Auto Scaling resources fully functional and testable independently

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, remaining resources, deprecation handling, and final validation

### Remaining Compute Resources

- [ ] T070 [P] Create shared/resource-catalog/src/aws/compute/elastic-beanstalk.ts with aws_elastic_beanstalk_application ServiceDefinition
- [ ] T071 [P] Create shared/resource-catalog/src/aws/compute/apprunner.ts with aws_apprunner_service ServiceDefinition
- [ ] T072 [P] Create shared/resource-catalog/src/aws/compute/batch.ts with aws_batch_job_definition ServiceDefinition
- [ ] T073 Rebuild shared package with all compute resources
- [ ] T074 Add all remaining resources to contract tests

### Cleanup & Migration

- [ ] T075 Remove deprecated frontend/src/lib/resources/awsResources.ts (replaced by unified catalog)
- [ ] T076 Remove deprecated frontend/src/lib/resources/awsResourcesExpanded.ts (replaced by unified catalog)
- [ ] T077 Remove deprecated backend/src/terraform/catalog/awsComputeWithRules.ts (migrated to shared/)
- [ ] T078 Remove deprecated backend/src/terraform/catalog/awsComputeComplete.ts (migrated to shared/)
- [ ] T079 Clean up backend/app/services/terraform/config.py to remove scattered defaults (now in unified catalog)

### Validation & Documentation

- [ ] T080 Run all backend tests: pytest backend/tests/ -v --cov=app
- [ ] T081 Run all frontend tests: npm test in frontend/
- [ ] T082 Run all contract tests with terraform validate
- [ ] T083 Verify 90% test coverage for HCL generation (SC-005)
- [ ] T084 Run quickstart.md validation (manual test with fresh setup)
- [ ] T085 Performance test: Verify HCL generation < 3 seconds for 50 resources (SC-009)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (EC2) and US2 (Lambda) are both P1 - can run in parallel
  - US3 (ECS/EKS) and US4 (Visual Classification) are both P2 - can run in parallel
  - US5 (Auto Scaling) is P3 - can run after P1 complete
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├── Phase 3: US1 (EC2) ←──────────┐
    │       ↓                         │ Can run
    ├── Phase 4: US2 (Lambda) ←───────┤ in parallel
    │       ↓                         │
    ├── Phase 5: US3 (ECS/EKS) ←──────┤
    │       ↓                         │
    ├── Phase 6: US4 (Visual) ←───────┘
    │       ↓
    └── Phase 7: US5 (Auto Scaling)
            ↓
        Phase 8: Polish
```

### Within Each User Story

1. Tests written FIRST (must FAIL before implementation)
2. Schema definitions (shared/resource-catalog)
3. Rebuild shared package
4. Backend integration (schema_loader, generators)
5. Frontend integration (InspectorPanel, nodeClassifier)
6. Icon verification
7. Contract test execution

### Parallel Opportunities

**Phase 1 - All [P] tasks:**
```
T003: tsconfig.json
T004: types.ts
T005: validation.ts
```

**Phase 3 (US1) - Tests in parallel:**
```
T016: contract test
T017: schema test
T018: frontend test
```

**Phase 5 (US3) - All container schemas in parallel:**
```
T041: ecs-cluster.ts
T042: ecs-service.ts
T043: ecs-task-definition.ts
T044: eks-cluster.ts
T045: eks-node-group.ts
```

**Phase 8 - Remaining resources in parallel:**
```
T070: elastic-beanstalk.ts
T071: apprunner.ts
T072: batch.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (EC2)
4. **STOP and VALIDATE**:
   - Drag EC2 onto canvas
   - Configure all fields
   - Generate Terraform
   - Run `terraform validate`
5. Deploy/demo if ready - this is your MVP!

### Incremental Delivery

1. **Setup + Foundational** → Unified catalog structure ready
2. **Add US1 (EC2)** → Test independently → Deploy/Demo (MVP!)
3. **Add US2 (Lambda)** → Test independently → Deploy/Demo
4. **Add US3 (ECS/EKS)** → Test independently → Deploy/Demo
5. **Add US4 (Visual)** → Test independently → Deploy/Demo
6. **Add US5 (ASG)** → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (EC2) + US2 (Lambda) - both P1
   - Developer B: US3 (ECS/EKS) + US4 (Visual) - both P2
   - Developer C: US5 (Auto Scaling) - P3
3. Stories complete and integrate independently

---

## Summary

| Phase | Story | Tasks | Parallel Tasks |
|-------|-------|-------|----------------|
| 1 | Setup | 8 | 3 |
| 2 | Foundational | 7 | 0 |
| 3 | US1 (EC2) | 11 | 3 |
| 4 | US2 (Lambda) | 11 | 3 |
| 5 | US3 (ECS/EKS) | 14 | 8 |
| 6 | US4 (Visual) | 9 | 3 |
| 7 | US5 (ASG) | 9 | 5 |
| 8 | Polish | 16 | 4 |
| **Total** | | **85** | **29** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = Complete through Phase 3 (EC2 only) for minimal viable product
