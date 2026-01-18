# Tasks: AWS Services Schema Enhancement

**Input**: Design documents from `/specs/009-aws-services-schema-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required), research.md (complete)

**Tests**: Not explicitly requested - verification via TypeScript check and Docker compose rebuild.

**Organization**: Tasks are grouped by user story (category) to enable independent implementation and testing of each category.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1 = Networking, US2 = Security, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/lib/aws/` for all *ServicesData.ts files
- **Target files**: 9 category files with 140 total services

## User Story to Category Mapping

| Story | Category | File | Services | Priority |
|-------|----------|------|----------|----------|
| US1 | Networking | networkingServicesData.ts | 28 | P1 |
| US2 | Security | securityServicesData.ts | 25 | P1 |
| US3 | Containers | containersServicesData.ts | 12 | P1 |
| US4 | Serverless | serverlessServicesData.ts | 11 | P2 |
| US5 | Messaging | messagingServicesData.ts | 10 | P2 |
| US6 | Developer Tools | developerToolsServicesData.ts | 13 | P2 |
| US7 | Analytics | analyticsServicesData.ts | 11 | P3 |
| US8 | Machine Learning | machineLearningServicesData.ts | 11 | P3 |
| US9 | Management | managementServicesData.ts | 19 | P3 |

---

## Phase 1: Setup (Preparation)

**Purpose**: Read existing files and verify structure before modifications

- [ ] T001 Read current networkingServicesData.ts to understand existing structure in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T002 [P] Read current securityServicesData.ts in frontend/src/lib/aws/securityServicesData.ts
- [ ] T003 [P] Read current containersServicesData.ts in frontend/src/lib/aws/containersServicesData.ts
- [ ] T004 [P] Read computeServicesData.ts to understand type interfaces in frontend/src/lib/aws/computeServicesData.ts
- [ ] T005 Verify existing pattern matches 008-aws-database-enhancement approach

**Checkpoint**: Ready to begin schema enhancements

---

## Phase 2: Foundational (Type Reference)

**Purpose**: Ensure type definitions are understood before modifications

- [ ] T006 Document ServiceInput, ServiceBlock, ServiceOutput interface patterns from frontend/src/lib/aws/computeServicesData.ts
- [ ] T007 Document timeouts block pattern from frontend/src/lib/aws/databaseServicesData.ts (reference implementation)

**Checkpoint**: Type patterns documented, ready for category enhancements

---

## Phase 3: User Story 1 - Networking Configuration (Priority: P1) MVP

**Goal**: Enhance all 28 networking services with complete timeouts, blocks, and outputs

**Independent Test**: Place aws_vpc, aws_security_group, aws_lb on canvas, verify all blocks and outputs display in Inspector Panel

### Implementation for User Story 1

- [ ] T008 [US1] Enhance aws_vpc with timeouts (create: 5m, delete: 5m) and additional outputs in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T009 [US1] Enhance aws_subnet with timeouts and availability_zone output in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T010 [US1] Enhance aws_internet_gateway with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T011 [US1] Enhance aws_nat_gateway with timeouts (create: 10m, delete: 30m) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T012 [US1] Enhance aws_route_table with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T013 [US1] Enhance aws_route with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T014 [US1] Enhance aws_security_group with ingress/egress blocks (from_port, to_port, protocol, cidr_blocks, security_groups, self, description) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T015 [US1] Add timeouts to aws_security_group (create: 10m, delete: 15m) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T016 [US1] Enhance aws_network_acl with ingress/egress blocks in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T017 [US1] Enhance aws_vpc_peering_connection with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T018 [US1] Enhance aws_ec2_transit_gateway with timeouts (create: 10m, update: 10m, delete: 10m) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T019 [US1] Enhance aws_lb with access_logs and subnet_mapping blocks in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T020 [US1] Add timeouts to aws_lb (create: 10m, update: 10m, delete: 10m) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T021 [US1] Enhance aws_lb_listener with default_action block in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T022 [US1] Enhance aws_lb_target_group with health_check block in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T023 [US1] Enhance aws_vpc_endpoint with timeouts (create: 10m, update: 10m, delete: 10m) in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T024 [US1] Enhance aws_eip with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T025 [US1] Enhance aws_flow_log with timeouts in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T026 [US1] Add outputs (arn, owner_id, tags_all) to all networking services in frontend/src/lib/aws/networkingServicesData.ts
- [ ] T027 [US1] Run TypeScript check for networkingServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Networking services enhanced with full schema - verify VPC, Security Group, ALB in Inspector Panel

---

## Phase 4: User Story 2 - Security & IAM Configuration (Priority: P1)

**Goal**: Enhance all 25 security services with complete IAM policy blocks, Cognito configurations

**Independent Test**: Place aws_iam_role, aws_cognito_user_pool on canvas, verify inline_policy and password_policy blocks display

### Implementation for User Story 2

- [ ] T028 [P] [US2] Enhance aws_iam_user with timeouts and outputs (arn, unique_id) in frontend/src/lib/aws/securityServicesData.ts
- [ ] T029 [P] [US2] Enhance aws_iam_group with outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T030 [US2] Enhance aws_iam_role with inline_policy block (name, policy) in frontend/src/lib/aws/securityServicesData.ts
- [ ] T031 [US2] Add outputs to aws_iam_role (arn, create_date, unique_id, tags_all) in frontend/src/lib/aws/securityServicesData.ts
- [ ] T032 [P] [US2] Enhance aws_iam_policy with outputs (arn, policy_id, tags_all) in frontend/src/lib/aws/securityServicesData.ts
- [ ] T033 [P] [US2] Enhance aws_iam_instance_profile with outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T034 [US2] Enhance aws_cognito_user_pool with password_policy block in frontend/src/lib/aws/securityServicesData.ts
- [ ] T035 [US2] Add lambda_config block to aws_cognito_user_pool in frontend/src/lib/aws/securityServicesData.ts
- [ ] T036 [US2] Add schema block (multiple) to aws_cognito_user_pool in frontend/src/lib/aws/securityServicesData.ts
- [ ] T037 [US2] Add admin_create_user_config block to aws_cognito_user_pool in frontend/src/lib/aws/securityServicesData.ts
- [ ] T038 [US2] Add outputs to aws_cognito_user_pool (arn, endpoint, creation_date) in frontend/src/lib/aws/securityServicesData.ts
- [ ] T039 [P] [US2] Enhance aws_cognito_user_pool_client with outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T040 [P] [US2] Enhance aws_cognito_identity_pool with outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T041 [US2] Enhance aws_kms_key with policy, rotation settings, and timeouts in frontend/src/lib/aws/securityServicesData.ts
- [ ] T042 [P] [US2] Enhance aws_kms_alias with outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T043 [P] [US2] Enhance aws_secretsmanager_secret with timeouts and outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T044 [P] [US2] Enhance aws_acm_certificate with validation_option block and outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T045 [P] [US2] Enhance aws_wafv2_web_acl with rule block and outputs in frontend/src/lib/aws/securityServicesData.ts
- [ ] T046 [US2] Run TypeScript check for securityServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Security services enhanced - verify IAM Role and Cognito User Pool in Inspector Panel

---

## Phase 5: User Story 3 - Container Orchestration Configuration (Priority: P1)

**Goal**: Enhance all 12 container services with ECS/EKS complex blocks

**Independent Test**: Place aws_ecs_task_definition, aws_eks_cluster on canvas, verify container_definitions and vpc_config blocks display

### Implementation for User Story 3

- [ ] T047 [P] [US3] Enhance aws_ecr_repository with timeouts and image_scanning_configuration block in frontend/src/lib/aws/containersServicesData.ts
- [ ] T048 [P] [US3] Enhance aws_ecr_lifecycle_policy with outputs in frontend/src/lib/aws/containersServicesData.ts
- [ ] T049 [US3] Enhance aws_ecs_cluster with setting block and configuration block in frontend/src/lib/aws/containersServicesData.ts
- [ ] T050 [US3] Add outputs to aws_ecs_cluster (arn, id, tags_all) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T051 [US3] Enhance aws_ecs_task_definition with volume block (host_path, docker_volume_configuration, efs_volume_configuration) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T052 [US3] Add placement_constraints block to aws_ecs_task_definition in frontend/src/lib/aws/containersServicesData.ts
- [ ] T053 [US3] Add runtime_platform block to aws_ecs_task_definition in frontend/src/lib/aws/containersServicesData.ts
- [ ] T054 [US3] Add ephemeral_storage block to aws_ecs_task_definition in frontend/src/lib/aws/containersServicesData.ts
- [ ] T055 [US3] Add outputs to aws_ecs_task_definition (arn, arn_without_revision, revision) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T056 [US3] Enhance aws_ecs_service with deployment_controller block in frontend/src/lib/aws/containersServicesData.ts
- [ ] T057 [US3] Add load_balancer block to aws_ecs_service in frontend/src/lib/aws/containersServicesData.ts
- [ ] T058 [US3] Add network_configuration block to aws_ecs_service in frontend/src/lib/aws/containersServicesData.ts
- [ ] T059 [US3] Add deployment_circuit_breaker block to aws_ecs_service in frontend/src/lib/aws/containersServicesData.ts
- [ ] T060 [US3] Add service_registries block to aws_ecs_service in frontend/src/lib/aws/containersServicesData.ts
- [ ] T061 [US3] Add timeouts to aws_ecs_service (create: 20m, update: 20m, delete: 20m) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T062 [US3] Enhance aws_eks_cluster with vpc_config block (subnet_ids, security_group_ids, endpoint_private_access, endpoint_public_access) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T063 [US3] Add kubernetes_network_config block to aws_eks_cluster in frontend/src/lib/aws/containersServicesData.ts
- [ ] T064 [US3] Add encryption_config block to aws_eks_cluster in frontend/src/lib/aws/containersServicesData.ts
- [ ] T065 [US3] Add access_config block to aws_eks_cluster in frontend/src/lib/aws/containersServicesData.ts
- [ ] T066 [US3] Add timeouts to aws_eks_cluster (create: 30m, update: 60m, delete: 15m) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T067 [US3] Add outputs to aws_eks_cluster (arn, endpoint, certificate_authority, identity, platform_version) in frontend/src/lib/aws/containersServicesData.ts
- [ ] T068 [P] [US3] Enhance aws_eks_node_group with timeouts and outputs in frontend/src/lib/aws/containersServicesData.ts
- [ ] T069 [P] [US3] Enhance aws_eks_fargate_profile with timeouts and outputs in frontend/src/lib/aws/containersServicesData.ts
- [ ] T070 [P] [US3] Enhance aws_apprunner_service with health_check_configuration and instance_configuration blocks in frontend/src/lib/aws/containersServicesData.ts
- [ ] T071 [US3] Run TypeScript check for containersServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Container services enhanced - verify ECS Task Definition and EKS Cluster in Inspector Panel

---

## Phase 6: User Story 4 - Serverless Configuration (Priority: P2)

**Goal**: Enhance all 11 serverless services with Lambda and Step Functions blocks

**Independent Test**: Place aws_lambda_function on canvas, verify vpc_config, environment, tracing_config blocks display

### Implementation for User Story 4

- [ ] T072 [US4] Enhance aws_lambda_function with vpc_config block (subnet_ids, security_group_ids) in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T073 [US4] Add environment block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T074 [US4] Add tracing_config block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T075 [US4] Add dead_letter_config block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T076 [US4] Add file_system_config block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T077 [US4] Add ephemeral_storage block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T078 [US4] Add logging_config block to aws_lambda_function in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T079 [US4] Add timeouts to aws_lambda_function (create: 10m, update: 10m, delete: 10m) in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T080 [US4] Add outputs to aws_lambda_function (arn, invoke_arn, qualified_arn, version) in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T081 [P] [US4] Enhance aws_lambda_alias with outputs in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T082 [P] [US4] Enhance aws_lambda_layer_version with outputs in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T083 [P] [US4] Enhance aws_lambda_event_source_mapping with filter_criteria block in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T084 [US4] Enhance aws_sfn_state_machine with logging_configuration block in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T085 [US4] Add tracing_configuration block to aws_sfn_state_machine in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T086 [US4] Add timeouts to aws_sfn_state_machine (create: 5m, update: 1m, delete: 5m) in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T087 [US4] Add outputs to aws_sfn_state_machine (arn, creation_date, status) in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T088 [P] [US4] Enhance aws_cloudwatch_event_rule with outputs in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T089 [P] [US4] Enhance aws_scheduler_schedule with flexible_time_window block in frontend/src/lib/aws/serverlessServicesData.ts
- [ ] T090 [US4] Run TypeScript check for serverlessServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Serverless services enhanced - verify Lambda Function and Step Functions in Inspector Panel

---

## Phase 7: User Story 5 - Messaging Configuration (Priority: P2)

**Goal**: Enhance all 10 messaging services with redrive policies and delivery configurations

**Independent Test**: Place aws_sqs_queue on canvas, verify redrive_policy attributes display

### Implementation for User Story 5

- [ ] T091 [US5] Enhance aws_sqs_queue with redrive_policy attribute (JSON) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T092 [US5] Add redrive_allow_policy attribute to aws_sqs_queue in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T093 [US5] Add timeouts to aws_sqs_queue (create: 3m, update: 3m, delete: 3m) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T094 [US5] Add outputs to aws_sqs_queue (arn, url, tags_all) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T095 [P] [US5] Enhance aws_sqs_queue_policy with outputs in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T096 [US5] Enhance aws_sns_topic with delivery_policy attribute in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T097 [US5] Add outputs to aws_sns_topic (arn, owner, tags_all) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T098 [P] [US5] Enhance aws_sns_topic_subscription with delivery_policy, filter_policy, redrive_policy in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T099 [US5] Enhance aws_kinesis_stream with stream_mode_details block in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T100 [US5] Add timeouts to aws_kinesis_stream (create: 5m, update: 120m, delete: 120m) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T101 [US5] Add outputs to aws_kinesis_stream (arn, tags_all) in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T102 [P] [US5] Enhance aws_kinesis_firehose_delivery_stream with extended_s3_configuration block in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T103 [P] [US5] Enhance aws_mq_broker with configuration, maintenance_window_start_time blocks in frontend/src/lib/aws/messagingServicesData.ts
- [ ] T104 [US5] Run TypeScript check for messagingServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Messaging services enhanced - verify SQS Queue and SNS Topic in Inspector Panel

---

## Phase 8: User Story 6 - Developer Tools Configuration (Priority: P2)

**Goal**: Enhance all 13 developer tools services with CodePipeline/CodeBuild blocks

**Independent Test**: Place aws_codepipeline on canvas, verify artifact_store and stage/action blocks display

### Implementation for User Story 6

- [ ] T105 [P] [US6] Enhance aws_codecommit_repository with outputs in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T106 [US6] Enhance aws_codebuild_project with source block in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T107 [US6] Add environment block to aws_codebuild_project (compute_type, image, type, environment_variable) in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T108 [US6] Add artifacts block to aws_codebuild_project in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T109 [US6] Add vpc_config block to aws_codebuild_project in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T110 [US6] Add cache block to aws_codebuild_project in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T111 [US6] Add logs_config block to aws_codebuild_project in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T112 [US6] Add outputs to aws_codebuild_project (arn, badge_url, tags_all) in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T113 [US6] Enhance aws_codepipeline with artifact_store block in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T114 [US6] Add stage block (multiple) to aws_codepipeline with nested action block in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T115 [US6] Add outputs to aws_codepipeline (arn, tags_all) in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T116 [P] [US6] Enhance aws_codedeploy_app with outputs in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T117 [US6] Enhance aws_codedeploy_deployment_group with auto_rollback_configuration, deployment_style blocks in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T118 [P] [US6] Enhance aws_codeartifact_domain with outputs in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T119 [P] [US6] Enhance aws_amplify_app with outputs in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T120 [P] [US6] Enhance aws_cloud9_environment_ec2 with outputs in frontend/src/lib/aws/developerToolsServicesData.ts
- [ ] T121 [US6] Run TypeScript check for developerToolsServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Developer Tools services enhanced - verify CodePipeline and CodeBuild in Inspector Panel

---

## Phase 9: User Story 7 - Analytics Configuration (Priority: P3)

**Goal**: Enhance all 11 analytics services with Glue and Athena configurations

**Independent Test**: Place aws_glue_crawler on canvas, verify s3_target, jdbc_target blocks display

### Implementation for User Story 7

- [ ] T122 [P] [US7] Enhance aws_athena_database with outputs in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T123 [US7] Enhance aws_athena_workgroup with configuration block (result_configuration nested) in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T124 [US7] Add outputs to aws_athena_workgroup (arn, tags_all) in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T125 [P] [US7] Enhance aws_glue_catalog_database with outputs in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T126 [P] [US7] Enhance aws_glue_catalog_table with storage_descriptor block in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T127 [US7] Enhance aws_glue_crawler with s3_target block (multiple) in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T128 [US7] Add jdbc_target block to aws_glue_crawler in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T129 [US7] Add catalog_target block to aws_glue_crawler in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T130 [US7] Add dynamodb_target block to aws_glue_crawler in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T131 [US7] Add schema_change_policy block to aws_glue_crawler in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T132 [US7] Add recrawl_policy block to aws_glue_crawler in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T133 [US7] Add outputs to aws_glue_crawler (arn, tags_all) in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T134 [P] [US7] Enhance aws_glue_job with command, execution_property blocks in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T135 [P] [US7] Enhance aws_emr_cluster with ec2_attributes, bootstrap_action blocks in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T136 [US7] Enhance aws_opensearch_domain with cluster_config, ebs_options, vpc_options blocks in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T137 [US7] Add timeouts to aws_opensearch_domain (create: 60m, update: 180m, delete: 90m) in frontend/src/lib/aws/analyticsServicesData.ts
- [ ] T138 [US7] Run TypeScript check for analyticsServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Analytics services enhanced - verify Glue Crawler and OpenSearch Domain in Inspector Panel

---

## Phase 10: User Story 8 - Machine Learning Configuration (Priority: P3)

**Goal**: Enhance all 11 ML services with SageMaker domain and endpoint configurations

**Independent Test**: Place aws_sagemaker_domain on canvas, verify default_user_settings block displays

### Implementation for User Story 8

- [ ] T139 [US8] Enhance aws_sagemaker_domain with default_user_settings block in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T140 [US8] Add sharing_settings nested block to aws_sagemaker_domain in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T141 [US8] Add kernel_gateway_app_settings block to aws_sagemaker_domain in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T142 [US8] Add domain_settings block to aws_sagemaker_domain in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T143 [US8] Add retention_policy block to aws_sagemaker_domain in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T144 [US8] Add outputs to aws_sagemaker_domain (arn, home_efs_file_system_id, url) in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T145 [P] [US8] Enhance aws_sagemaker_user_profile with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T146 [P] [US8] Enhance aws_sagemaker_notebook_instance with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T147 [US8] Enhance aws_sagemaker_model with primary_container, vpc_config blocks in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T148 [US8] Enhance aws_sagemaker_endpoint_configuration with production_variants block in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T149 [P] [US8] Enhance aws_sagemaker_endpoint with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T150 [P] [US8] Enhance aws_bedrock_custom_model with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T151 [P] [US8] Enhance aws_comprehend_entity_recognizer with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T152 [P] [US8] Enhance aws_lexv2models_bot with outputs in frontend/src/lib/aws/machineLearningServicesData.ts
- [ ] T153 [US8] Run TypeScript check for machineLearningServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Machine Learning services enhanced - verify SageMaker Domain in Inspector Panel

---

## Phase 11: User Story 9 - Management & Monitoring Configuration (Priority: P3)

**Goal**: Enhance all 19 management services with CloudWatch and Config configurations

**Independent Test**: Place aws_cloudwatch_metric_alarm on canvas, verify metric_query block displays

### Implementation for User Story 9

- [ ] T154 [P] [US9] Enhance aws_cloudwatch_log_group with timeouts and outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T155 [US9] Enhance aws_cloudwatch_metric_alarm with metric_query block in frontend/src/lib/aws/managementServicesData.ts
- [ ] T156 [US9] Add nested metric block to metric_query in aws_cloudwatch_metric_alarm in frontend/src/lib/aws/managementServicesData.ts
- [ ] T157 [US9] Add outputs to aws_cloudwatch_metric_alarm (arn, tags_all) in frontend/src/lib/aws/managementServicesData.ts
- [ ] T158 [P] [US9] Enhance aws_cloudwatch_dashboard with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T159 [P] [US9] Enhance aws_cloudwatch_log_metric_filter with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T160 [P] [US9] Enhance aws_cloudwatch_log_subscription_filter with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T161 [US9] Enhance aws_cloudtrail with event_selector, insight_selector blocks in frontend/src/lib/aws/managementServicesData.ts
- [ ] T162 [US9] Add outputs to aws_cloudtrail (arn, home_region, tags_all) in frontend/src/lib/aws/managementServicesData.ts
- [ ] T163 [P] [US9] Enhance aws_config_configuration_recorder with recording_group block in frontend/src/lib/aws/managementServicesData.ts
- [ ] T164 [US9] Enhance aws_config_config_rule with source block in frontend/src/lib/aws/managementServicesData.ts
- [ ] T165 [US9] Add outputs to aws_config_config_rule (arn, rule_id, tags_all) in frontend/src/lib/aws/managementServicesData.ts
- [ ] T166 [P] [US9] Enhance aws_ssm_parameter with timeouts and outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T167 [P] [US9] Enhance aws_ssm_document with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T168 [P] [US9] Enhance aws_ssm_maintenance_window with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T169 [P] [US9] Enhance aws_organizations_organization with outputs in frontend/src/lib/aws/managementServicesData.ts
- [ ] T170 [P] [US9] Enhance aws_budgets_budget with notification, cost_filter blocks in frontend/src/lib/aws/managementServicesData.ts
- [ ] T171 [US9] Run TypeScript check for managementServicesData.ts (cd frontend && npx tsc --noEmit)

**Checkpoint**: Management services enhanced - verify CloudWatch Metric Alarm in Inspector Panel

---

## Phase 12: Verification & Polish

**Purpose**: Validate all changes and rebuild application

- [ ] T172 Run full TypeScript type check (cd frontend && npx tsc --noEmit)
- [ ] T173 Rebuild Docker compose using WSL (wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down && docker compose up -d --build")
- [ ] T174 Verify frontend service is running at http://localhost:3000
- [ ] T175 Verify backend API health at http://localhost:8000/api/health
- [ ] T176 Test Inspector Panel with P1 services (VPC, Security Group, IAM Role, ECS Task Definition)
- [ ] T177 Test Inspector Panel with P2 services (Lambda, SQS Queue, CodePipeline)
- [ ] T178 Test Inspector Panel with P3 services (Glue Crawler, SageMaker Domain, CloudWatch Alarm)
- [ ] T179 Update file header comments with enhanced service counts

**Checkpoint**: All schemas validated and application running correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion
- **Phases 3-11 (User Stories)**: Depend on Phase 2 completion
  - User stories can proceed in parallel (different files)
  - Or sequentially in priority order (US1 → US2 → ... → US9)
- **Phase 12 (Verification)**: Depends on all user story phases being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Networking) | Phase 2 | US2, US3 |
| US2 (Security) | Phase 2 | US1, US3 |
| US3 (Containers) | Phase 2 | US1, US2 |
| US4 (Serverless) | Phase 2 | US5, US6 |
| US5 (Messaging) | Phase 2 | US4, US6 |
| US6 (Developer Tools) | Phase 2 | US4, US5 |
| US7 (Analytics) | Phase 2 | US8, US9 |
| US8 (Machine Learning) | Phase 2 | US7, US9 |
| US9 (Management) | Phase 2 | US7, US8 |

### Parallel Opportunities

**Within P1 Priority**:
- US1 (Networking), US2 (Security), US3 (Containers) can ALL run in parallel

**Within P2 Priority**:
- US4 (Serverless), US5 (Messaging), US6 (Developer Tools) can ALL run in parallel

**Within P3 Priority**:
- US7 (Analytics), US8 (Machine Learning), US9 (Management) can ALL run in parallel

**Maximum Parallelism**:
- All 9 user stories can run in parallel if resources allow (9 different files)

---

## Parallel Example: P1 Categories

```bash
# Launch all P1 user stories together:
Task: "Enhance networkingServicesData.ts" (US1)
Task: "Enhance securityServicesData.ts" (US2)
Task: "Enhance containersServicesData.ts" (US3)
```

---

## Implementation Strategy

### MVP First (P1 Categories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3-5: User Stories 1-3 (Networking, Security, Containers)
4. **STOP and VALIDATE**: TypeScript check, Docker rebuild, verify schemas
5. Deploy/demo if ready - Core AWS infrastructure services complete

### Incremental Delivery

1. Complete Setup + Foundational → Ready
2. Add US1-3 (P1) → Test → Checkpoint (MVP!)
3. Add US4-6 (P2) → Test → Checkpoint
4. Add US7-9 (P3) → Test → Checkpoint
5. Complete verification → Full delivery

### Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 5 | 3 |
| 2 | Foundational | 2 | 0 |
| 3 | US1 - Networking | 20 | 0 |
| 4 | US2 - Security | 19 | 10 |
| 5 | US3 - Containers | 25 | 5 |
| 6 | US4 - Serverless | 19 | 5 |
| 7 | US5 - Messaging | 14 | 4 |
| 8 | US6 - Developer Tools | 17 | 6 |
| 9 | US7 - Analytics | 17 | 5 |
| 10 | US8 - Machine Learning | 15 | 7 |
| 11 | US9 - Management | 18 | 10 |
| 12 | Verification | 8 | 0 |
| **Total** | | **179** | **55** |

---

## Notes

- [P] tasks = different services within same file, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes are additive - no removals of existing schema properties
- Schema data comes from research.md (Terraform Registry documentation)
- Verify each service schema against Terraform Registry after implementation
- TypeScript check after each user story ensures type safety
