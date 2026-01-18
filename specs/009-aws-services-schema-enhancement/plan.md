# Implementation Plan: AWS Services Schema Enhancement

**Branch**: `009-aws-services-schema-enhancement` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-aws-services-schema-enhancement/spec.md`

## Summary

Enhance all remaining AWS service category schemas (140 services across 9 categories) to match accurate Terraform Registry documentation. This is a frontend-only schema data enhancement following the established pattern from 008-aws-database-enhancement. Each *ServicesData.ts file will be updated with complete arguments, attributes, nested blocks, outputs, data types, and timeouts.

## Technical Context

**Language/Version**: TypeScript 5.6+
**Primary Dependencies**: React 18, existing ServiceInput/ServiceBlock/ServiceOutput interfaces from computeServicesData.ts
**Storage**: N/A (frontend schema data only)
**Testing**: TypeScript compilation check (`npx tsc --noEmit`), Docker compose rebuild
**Target Platform**: Web browser (React frontend)
**Project Type**: Web application (frontend-only for this feature)
**Performance Goals**: N/A (static schema data, no runtime performance impact)
**Constraints**: Must maintain TypeScript type safety, no compilation errors
**Scale/Scope**: 140 services across 9 *ServicesData.ts files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode, descriptive naming, single responsibility per service definition |
| II. Testing Standards | ✅ PASS | TypeScript compilation check serves as contract test for schema validity |
| III. User Experience Consistency | ✅ PASS | Consistent schema structure enables reliable Inspector Panel rendering |
| IV. Performance Requirements | ✅ PASS | Static data, no runtime performance impact |

**Gate Result**: ✅ PASSED - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/009-aws-services-schema-enhancement/
├── spec.md              # Feature specification
├── clarifications.md    # Clarification analysis
├── plan.md              # This file
├── research.md          # Phase 0 output (Terraform Registry research)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/src/lib/aws/
├── computeServicesData.ts      # Type definitions (ServiceInput, ServiceBlock, ServiceOutput)
├── networkingServicesData.ts   # 28 services - P1 target
├── securityServicesData.ts     # 25 services - P1 target
├── containersServicesData.ts   # 12 services - P1 target
├── serverlessServicesData.ts   # 11 services - P2 target
├── messagingServicesData.ts    # 10 services - P2 target
├── developerToolsServicesData.ts # 13 services - P2 target
├── analyticsServicesData.ts    # 11 services - P3 target
├── machineLearningServicesData.ts # 11 services - P3 target
└── managementServicesData.ts   # 19 services - P3 target
```

**Structure Decision**: Frontend-only modification. All changes are additive enhancements to existing *ServicesData.ts files. No new files required.

## Complexity Tracking

> No violations to justify - feature follows established patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Approach

### Pattern Reference (from 008-aws-database-enhancement)

Each service definition follows this structure:

```typescript
{
  id: "service_id",
  name: "Service Name",
  description: "Service description",
  terraform_resource: "aws_resource_type",
  icon: CATEGORY_ICONS['aws_resource_type'],
  inputs: {
    required: [
      { name: "arg_name", type: "string", description: "Description" }
    ],
    optional: [
      { name: "arg_name", type: "string", description: "Description", default: "value" }
    ],
    blocks: [
      {
        name: "block_name",
        multiple: true,
        attributes: [
          { name: "attr_name", type: "string", description: "Description" }
        ],
        nested_blocks: [
          { name: "nested_name", attributes: [...] }
        ]
      },
      {
        name: "timeouts",
        attributes: [
          { name: "create", type: "string", description: "Create timeout", default: "30m" },
          { name: "update", type: "string", description: "Update timeout", default: "60m" },
          { name: "delete", type: "string", description: "Delete timeout", default: "30m" }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Resource ID" },
    { name: "arn", type: "string", description: "Resource ARN" }
  ]
}
```

### Enhancement Categories

| Priority | Category | File | Services | Focus Areas |
|----------|----------|------|----------|-------------|
| P1 | Networking | networkingServicesData.ts | 28 | VPC, Subnet, Security Group blocks, ALB/NLB listener blocks |
| P1 | Security | securityServicesData.ts | 25 | IAM inline_policy blocks, Cognito complex blocks |
| P1 | Containers | containersServicesData.ts | 12 | ECS container_definitions, EKS vpc_config |
| P2 | Serverless | serverlessServicesData.ts | 11 | Lambda vpc_config, environment, tracing_config |
| P2 | Messaging | messagingServicesData.ts | 10 | SQS redrive_policy, SNS delivery_policy |
| P2 | Developer Tools | developerToolsServicesData.ts | 13 | CodePipeline stage/action blocks, CodeBuild environment |
| P3 | Analytics | analyticsServicesData.ts | 11 | Glue crawler targets, Athena workgroup configuration |
| P3 | Machine Learning | machineLearningServicesData.ts | 11 | SageMaker domain/endpoint configurations |
| P3 | Management | managementServicesData.ts | 19 | CloudWatch metric_query, Config source blocks |

### Verification Strategy

1. **Per-Category Verification**:
   - TypeScript compilation: `cd frontend && npx tsc --noEmit`
   - Visual inspection: Review file for consistent structure

2. **Full Integration Verification**:
   - Docker rebuild: `wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down && docker compose up -d --build"`
   - Frontend accessibility: Verify http://localhost:3000 loads
   - Inspector Panel: Place resources on canvas, verify all inputs/blocks/outputs display

## Research Requirements (Phase 0)

The following Terraform Registry documentation must be researched for each category:

### P1 - Networking (28 services)
- aws_vpc, aws_subnet, aws_internet_gateway, aws_nat_gateway
- aws_route_table, aws_route, aws_route_table_association
- aws_security_group, aws_security_group_rule, aws_network_acl
- aws_vpc_peering_connection, aws_ec2_transit_gateway, aws_ec2_transit_gateway_vpc_attachment
- aws_vpn_gateway, aws_customer_gateway, aws_vpn_connection
- aws_lb, aws_lb_listener, aws_lb_target_group, aws_lb_listener_rule
- aws_vpc_endpoint, aws_vpc_endpoint_service
- aws_network_interface, aws_eip, aws_eip_association
- aws_vpc_dhcp_options, aws_dx_gateway, aws_flow_log

### P1 - Security (25 services)
- aws_iam_user, aws_iam_group, aws_iam_role, aws_iam_policy
- aws_iam_role_policy_attachment, aws_iam_user_policy_attachment, aws_iam_group_policy_attachment
- aws_iam_instance_profile, aws_iam_access_key
- aws_iam_openid_connect_provider, aws_iam_saml_provider
- aws_cognito_user_pool, aws_cognito_user_pool_client, aws_cognito_identity_pool
- aws_kms_key, aws_kms_alias
- aws_secretsmanager_secret, aws_secretsmanager_secret_version
- aws_acm_certificate, aws_acm_certificate_validation
- aws_waf_web_acl, aws_wafv2_web_acl, aws_guardduty_detector
- aws_security_hub_account, aws_inspector2_enabler

### P1 - Containers (12 services)
- aws_ecr_repository, aws_ecr_lifecycle_policy
- aws_ecs_cluster, aws_ecs_cluster_capacity_providers, aws_ecs_capacity_provider
- aws_ecs_task_definition, aws_ecs_service
- aws_eks_cluster, aws_eks_node_group, aws_eks_fargate_profile, aws_eks_addon
- aws_apprunner_service

### P2 - Serverless (11 services)
- aws_lambda_function, aws_lambda_alias, aws_lambda_layer_version
- aws_lambda_permission, aws_lambda_event_source_mapping, aws_lambda_function_url
- aws_sfn_state_machine
- aws_cloudwatch_event_rule, aws_cloudwatch_event_target, aws_cloudwatch_event_bus
- aws_scheduler_schedule

### P2 - Messaging (10 services)
- aws_sqs_queue, aws_sqs_queue_policy, aws_sqs_queue_redrive_policy
- aws_sns_topic, aws_sns_topic_subscription, aws_sns_topic_policy
- aws_kinesis_stream, aws_kinesis_firehose_delivery_stream
- aws_mq_broker, aws_pipes_pipe

### P2 - Developer Tools (13 services)
- aws_codecommit_repository
- aws_codebuild_project
- aws_codepipeline
- aws_codedeploy_app, aws_codedeploy_deployment_group
- aws_codeartifact_domain, aws_codeartifact_repository
- aws_codestarconnections_connection
- aws_amplify_app, aws_amplify_branch
- aws_xray_sampling_rule, aws_xray_group
- aws_cloud9_environment_ec2

### P3 - Analytics (11 services)
- aws_athena_database, aws_athena_workgroup, aws_athena_named_query
- aws_glue_catalog_database, aws_glue_catalog_table, aws_glue_crawler, aws_glue_job, aws_glue_trigger
- aws_emr_cluster
- aws_opensearch_domain
- aws_quicksight_data_source

### P3 - Machine Learning (11 services)
- aws_sagemaker_domain, aws_sagemaker_user_profile, aws_sagemaker_notebook_instance
- aws_sagemaker_model, aws_sagemaker_endpoint_configuration, aws_sagemaker_endpoint
- aws_bedrock_custom_model
- aws_comprehend_entity_recognizer
- aws_lexv2models_bot
- aws_transcribe_vocabulary
- aws_rekognition_collection

### P3 - Management (19 services)
- aws_cloudwatch_log_group, aws_cloudwatch_log_stream
- aws_cloudwatch_metric_alarm, aws_cloudwatch_dashboard
- aws_cloudwatch_log_metric_filter, aws_cloudwatch_log_subscription_filter
- aws_cloudtrail
- aws_config_configuration_recorder, aws_config_configuration_recorder_status
- aws_config_delivery_channel, aws_config_config_rule
- aws_ssm_parameter, aws_ssm_document, aws_ssm_maintenance_window
- aws_organizations_organization, aws_organizations_account
- aws_servicecatalog_portfolio, aws_budgets_budget
- aws_health_event_organization

## Next Steps

1. **Phase 0**: Generate research.md with Terraform Registry documentation for all 140 services
2. **Phase 1**: No data-model.md or contracts needed (frontend-only schema data)
3. **Phase 2**: Generate tasks.md via `/speckit.tasks`
4. **Implementation**: Execute tasks via `/speckit.implement`
