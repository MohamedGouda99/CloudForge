# Feature Specification: AWS Services Schema Enhancement

**Feature Branch**: `009-aws-services-schema-enhancement`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Enhance AWS Database, Network, Security, Analytics, Containers, Application, Developer-tools, Machine-learning, Management, Messaging, Serverless services schemas by fetching accurate Terraform Registry documentation and updating *Data.ts with correct arguments, attributes, nested blocks, outputs, data types, and timeouts."

## Overview

This feature enhances all remaining AWS service category schemas in CloudForge to match accurate Terraform Registry documentation. Building on the patterns established in 005-aws-compute-enhancement, 007-aws-storage-enhancement, and 008-aws-database-enhancement, this feature completes the comprehensive schema update across 9 remaining categories totaling 139+ services.

### Scope Summary

| Category | File | Services | Priority |
|----------|------|----------|----------|
| Networking | networkingServicesData.ts | 27 | P1 |
| Security | securityServicesData.ts | 25 | P1 |
| Containers | containersServicesData.ts | 12 | P1 |
| Serverless | serverlessServicesData.ts | 11 | P2 |
| Messaging | messagingServicesData.ts | 10 | P2 |
| Developer Tools | developerToolsServicesData.ts | 13 | P2 |
| Analytics | analyticsServicesData.ts | 11 | P3 |
| Machine Learning | machineLearningServicesData.ts | 11 | P3 |
| Management | managementServicesData.ts | 19 | P3 |

**Total**: 139 services across 9 categories

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Networking Configuration (Priority: P1)

As an infrastructure architect, I want complete and accurate VPC, Subnet, Route Table, Security Group, and Load Balancer schemas so that I can design production-grade network topologies with all configuration options available in the Inspector Panel.

**Why this priority**: Networking resources (VPC, Subnet, Security Groups, Load Balancers) are foundational to every AWS deployment. Incomplete schemas block users from configuring essential infrastructure.

**Independent Test**: Place VPC, Subnet, and ALB on canvas. Verify all blocks (e.g., ingress/egress for security groups, listener/action for ALB) appear with correct attributes and timeouts.

**Acceptance Scenarios**:

1. **Given** a user places aws_vpc on canvas, **When** they open Inspector Panel, **Then** all VPC arguments (cidr_block, enable_dns_hostnames, enable_dns_support, tags) and outputs (id, arn, default_security_group_id, main_route_table_id) are displayed with correct types.

2. **Given** a user places aws_security_group on canvas, **When** they configure it, **Then** ingress and egress blocks appear with all attributes (from_port, to_port, protocol, cidr_blocks, security_groups, self, description).

3. **Given** a user places aws_lb (ALB) on canvas, **When** they configure it, **Then** access_logs, subnet_mapping, and timeouts blocks are available with accurate Terraform Registry attributes.

---

### User Story 2 - Accurate Security & IAM Configuration (Priority: P1)

As a security engineer, I want complete IAM Role, Policy, and Cognito schemas with all policy attachment options, assume role policies, and identity provider configurations so that I can implement least-privilege access patterns.

**Why this priority**: IAM misconfiguration is a leading cause of security incidents. Complete schemas ensure users can properly configure roles, policies, and trust relationships.

**Independent Test**: Place aws_iam_role and aws_iam_policy on canvas. Verify inline_policy blocks, assume_role_policy, and all outputs (arn, unique_id, create_date) are correctly displayed.

**Acceptance Scenarios**:

1. **Given** a user places aws_iam_role on canvas, **When** they configure it, **Then** assume_role_policy (required), inline_policy blocks (multiple), and managed_policy_arns appear with correct validation.

2. **Given** a user places aws_cognito_user_pool on canvas, **When** they configure it, **Then** all complex blocks (password_policy, lambda_config, schema, admin_create_user_config) are available.

3. **Given** a user attaches policies to a role, **When** they view outputs, **Then** arn, unique_id, and name outputs are available for reference.

---

### User Story 3 - Accurate Container Orchestration Configuration (Priority: P1)

As a DevOps engineer, I want complete ECS and EKS schemas with all capacity provider, task definition, and cluster configurations so that I can deploy containerized workloads with proper resource allocation.

**Why this priority**: Containers are the modern deployment pattern. ECS task definitions and EKS configurations require complex nested blocks that must be complete.

**Independent Test**: Place aws_ecs_cluster and aws_ecs_task_definition on canvas. Verify container_definitions, volume, and placement_constraints blocks render correctly.

**Acceptance Scenarios**:

1. **Given** a user places aws_ecs_task_definition on canvas, **When** they configure it, **Then** container_definitions accepts JSON, and volume, placement_constraints, runtime_platform blocks are available.

2. **Given** a user places aws_ecs_service on canvas, **When** they configure deployment, **Then** deployment_controller, deployment_circuit_breaker, load_balancer, and service_registries blocks appear.

3. **Given** a user configures aws_eks_cluster, **When** they view outputs, **Then** endpoint, certificate_authority, identity, and kubernetes_network_config are available.

---

### User Story 4 - Accurate Serverless Configuration (Priority: P2)

As a developer, I want complete Lambda, API Gateway, and Step Functions schemas with all event source mappings, layers, and state machine definitions so that I can build event-driven architectures.

**Why this priority**: Serverless is widely adopted. Lambda configurations (VPC, environment, layers) must be complete for production deployments.

**Independent Test**: Place aws_lambda_function on canvas. Verify vpc_config, environment, file_system_config, tracing_config, and dead_letter_config blocks are present with all attributes.

**Acceptance Scenarios**:

1. **Given** a user places aws_lambda_function on canvas, **When** they configure it, **Then** vpc_config (subnet_ids, security_group_ids), environment (variables), tracing_config, and timeouts blocks appear.

2. **Given** a user places aws_api_gateway_rest_api on canvas, **When** they configure it, **Then** endpoint_configuration, body, and all outputs (execution_arn, root_resource_id) are available.

3. **Given** a user places aws_sfn_state_machine on canvas, **When** they configure it, **Then** definition (JSON), logging_configuration, and tracing_configuration blocks appear.

---

### User Story 5 - Accurate Messaging Configuration (Priority: P2)

As a solution architect, I want complete SQS, SNS, and EventBridge schemas with all delivery policies, dead-letter queues, and filter configurations so that I can build reliable event-driven systems.

**Why this priority**: Messaging services are critical for decoupled architectures. DLQ configurations and delivery policies must be accurate.

**Independent Test**: Place aws_sqs_queue on canvas. Verify redrive_policy, redrive_allow_policy blocks and all encryption/visibility attributes are present.

**Acceptance Scenarios**:

1. **Given** a user places aws_sqs_queue on canvas, **When** they configure it, **Then** redrive_policy (deadLetterTargetArn, maxReceiveCount), visibility_timeout, kms_master_key_id appear with correct types.

2. **Given** a user places aws_sns_topic on canvas, **When** they configure it, **Then** delivery_policy, kms_master_key_id, and fifo_topic options are available.

3. **Given** a user places aws_cloudwatch_event_rule on canvas, **When** they configure it, **Then** event_pattern (JSON), schedule_expression, and state options appear.

---

### User Story 6 - Accurate Developer Tools Configuration (Priority: P2)

As a DevOps engineer, I want complete CodePipeline, CodeBuild, and CodeDeploy schemas with all stage, action, and buildspec configurations so that I can implement CI/CD pipelines.

**Why this priority**: CI/CD automation is essential. CodePipeline stages and CodeBuild configurations require complex nested structures.

**Independent Test**: Place aws_codepipeline on canvas. Verify artifact_store, stage blocks with nested action blocks render correctly.

**Acceptance Scenarios**:

1. **Given** a user places aws_codepipeline on canvas, **When** they configure it, **Then** artifact_store, stage (multiple), and stage.action blocks appear with all configuration attributes.

2. **Given** a user places aws_codebuild_project on canvas, **When** they configure it, **Then** source, environment (with environment_variable), artifacts, and vpc_config blocks are available.

3. **Given** a user configures aws_codedeploy_deployment_group, **When** they configure deployment, **Then** auto_rollback_configuration, deployment_style, and ec2_tag_set/ecs_service blocks appear.

---

### User Story 7 - Accurate Analytics Configuration (Priority: P3)

As a data engineer, I want complete Athena, Glue, and Kinesis schemas with all workgroup, crawler, and stream configurations so that I can build data processing pipelines.

**Why this priority**: Analytics services have complex configurations. Glue crawlers and Kinesis streams require accurate schemas for data pipeline design.

**Independent Test**: Place aws_glue_crawler on canvas. Verify s3_target, jdbc_target, schema_change_policy, and recrawl_policy blocks are present.

**Acceptance Scenarios**:

1. **Given** a user places aws_glue_crawler on canvas, **When** they configure it, **Then** s3_target, jdbc_target, catalog_target, delta_target blocks appear with all attributes.

2. **Given** a user places aws_kinesis_stream on canvas, **When** they configure it, **Then** shard_count, retention_period, stream_mode_details, and encryption_type appear.

3. **Given** a user places aws_athena_workgroup on canvas, **When** they configure it, **Then** configuration block with result_configuration, enforce_workgroup_configuration options appear.

---

### User Story 8 - Accurate Machine Learning Configuration (Priority: P3)

As a ML engineer, I want complete SageMaker schemas with all domain, endpoint, and training configurations so that I can deploy ML models with proper resource settings.

**Why this priority**: ML workloads have specific resource requirements. SageMaker configurations need accurate instance types and scaling policies.

**Independent Test**: Place aws_sagemaker_endpoint on canvas. Verify endpoint_config_name and all outputs (arn, name) are correctly displayed.

**Acceptance Scenarios**:

1. **Given** a user places aws_sagemaker_domain on canvas, **When** they configure it, **Then** default_user_settings, vpc_config, and app_network_access_type blocks appear.

2. **Given** a user places aws_sagemaker_endpoint_configuration on canvas, **When** they configure it, **Then** production_variants block with instance_type, initial_instance_count appears.

3. **Given** a user places aws_sagemaker_model on canvas, **When** they configure it, **Then** primary_container, vpc_config, and inference_execution_config blocks are available.

---

### User Story 9 - Accurate Management & Monitoring Configuration (Priority: P3)

As an SRE, I want complete CloudWatch, CloudTrail, and Config schemas with all alarm configurations, log subscriptions, and compliance rules so that I can implement comprehensive monitoring and compliance.

**Why this priority**: Observability and compliance are operational requirements. CloudWatch alarms and Config rules need accurate threshold and evaluation configurations.

**Independent Test**: Place aws_cloudwatch_metric_alarm on canvas. Verify all threshold, evaluation_periods, and actions attributes are present.

**Acceptance Scenarios**:

1. **Given** a user places aws_cloudwatch_metric_alarm on canvas, **When** they configure it, **Then** comparison_operator, evaluation_periods, metric_name, metric_query blocks, and actions (alarm_actions, ok_actions) appear.

2. **Given** a user places aws_cloudwatch_log_subscription_filter on canvas, **When** they configure it, **Then** log_group_name, filter_pattern, destination_arn appear with correct references.

3. **Given** a user places aws_config_config_rule on canvas, **When** they configure it, **Then** source block with source_identifier and compliance_resource_types appear.

---

### Edge Cases

- What happens when a service schema has optional-but-commonly-used attributes omitted? → Include all documented attributes with sensible defaults.
- How does the system handle deprecated Terraform attributes? → Exclude deprecated attributes, include only current API.
- What happens with nested blocks that have complex validation? → Preserve validation rules (options arrays, type constraints) from Terraform Registry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all required arguments for each service as defined in Terraform Registry documentation
- **FR-002**: System MUST display all optional arguments with accurate types and default values
- **FR-003**: System MUST support nested configuration blocks with correct attribute hierarchies
- **FR-004**: System MUST include timeouts blocks with default values for all services that support them
- **FR-005**: System MUST display all output attributes available for resource references
- **FR-006**: System MUST validate input types (string, number, bool, list, map) per Terraform specification
- **FR-007**: System MUST support multiple instances of blocks marked with `multiple: true`
- **FR-008**: System MUST include reference hints for cross-resource dependencies (e.g., subnet_id references aws_subnet.id)
- **FR-009**: System MUST maintain TypeScript type safety with no compilation errors

### Key Entities

- **ServiceDefinition**: Core service definition with id, name, terraform_resource, icon, inputs, outputs
- **ServiceInput**: Required/optional argument with name, type, description, default, options, reference
- **ServiceBlock**: Nested configuration block with name, attributes, nested_blocks, multiple flag
- **ServiceOutput**: Output attribute with name, type, description for cross-resource references

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 139 services across 9 categories have complete schema definitions matching Terraform Registry
- **SC-002**: TypeScript compilation passes with no errors in any *ServicesData.ts file
- **SC-003**: Docker compose rebuilds successfully with all enhanced schemas
- **SC-004**: Inspector Panel displays all arguments, blocks, and outputs for each service when placed on canvas
- **SC-005**: Users can configure all nested blocks (e.g., ingress/egress, stage/action) with correct attribute editors
- **SC-006**: All timeouts blocks include create, update, delete with Terraform-documented defaults
- **SC-007**: Reference hints appear for cross-resource dependencies (e.g., vpc_id, subnet_id, role_arn)

## Assumptions

- Terraform Registry documentation (latest provider version) is the source of truth for all schema definitions
- Existing service definitions may need correction rather than just addition
- Pattern established in 008-aws-database-enhancement (timeouts, blocks, outputs) applies to all categories
- No API backend changes required - this is frontend-only schema data
- Icons for all services already exist in the DATABASE_ICONS, NETWORKING_ICONS, etc. constants

## Dependencies

- Terraform AWS Provider documentation (registry.terraform.io)
- Existing *ServicesData.ts file patterns from compute, storage, and database enhancements
- TypeScript interface definitions in computeServicesData.ts (ServiceInput, ServiceBlock, ServiceOutput)

## Out of Scope

- Backend API changes
- New AWS service categories not currently defined
- Terraform resource creation or validation logic
- Data source definitions (aws_* data resources)
- Provider configuration schemas
