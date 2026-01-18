# Feature Specification: AWS Resource Classification Audit

**Feature Branch**: `006-aws-resource-classification`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Audit all AWS services across all categories (Compute, Networking, Storage, Database, Security, Containers, Serverless, Analytics, etc.) in the CloudForge project. Classify each resource as either 'container' (can visually hold child resources, like aws_vpc, aws_ecs_cluster, aws_s3_bucket) or 'icon' (standalone resource). Update the shared/resource-catalog with correct classifications and document the parent-child containment relationships for each container type."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Container Classification (Priority: P1)

As a CloudForge designer, I want AWS resources to be correctly classified as containers or icons so that when I drag resources onto the canvas, container resources visually expand to hold child resources while icon resources remain as standalone nodes.

**Why this priority**: This is the core functionality - incorrect classification breaks the visual designer experience and confuses users about resource relationships.

**Independent Test**: Can be fully tested by dragging a VPC onto the canvas and verifying it visually expands, then dragging an EC2 instance and verifying it remains as an icon node.

**Acceptance Scenarios**:

1. **Given** a VPC resource is on the canvas, **When** I drag an EC2 instance into it, **Then** the EC2 instance should be visually contained within the VPC boundary
2. **Given** an ECS Cluster resource is on the canvas, **When** I drag an ECS Service into it, **Then** the service should be visually contained within the cluster
3. **Given** an EC2 instance resource, **When** I attempt to drag another resource into it, **Then** it should not accept child resources (icon behavior)

---

### User Story 2 - Containment Relationship Documentation (Priority: P2)

As a CloudForge developer, I want each container resource to have documented parent-child relationships so that the auto-wiring logic in projects.py can be replaced with dynamic lookups from the catalog.

**Why this priority**: This enables removing hardcoded resource lists from the backend, improving maintainability.

**Independent Test**: Can be tested by verifying each container type in the catalog has `containmentRules` defined with valid child resource types.

**Acceptance Scenarios**:

1. **Given** the aws_vpc ServiceDefinition, **When** I inspect its relations.containmentRules, **Then** I should see aws_subnet, aws_security_group, aws_internet_gateway, etc. listed as valid children
2. **Given** the aws_ecs_cluster ServiceDefinition, **When** I inspect its relations.containmentRules, **Then** I should see aws_ecs_service, aws_ecs_capacity_provider listed as valid children

---

### User Story 3 - Catalog API Integration (Priority: P3)

As a CloudForge frontend developer, I want the catalog API to return classification and containment data so that the React Flow canvas can dynamically determine node behavior.

**Why this priority**: This enables the frontend to use the catalog as the single source of truth instead of hardcoded mappings.

**Independent Test**: Can be tested by calling GET /api/catalog and verifying each resource includes classification and relations fields.

**Acceptance Scenarios**:

1. **Given** a GET request to /api/catalog, **When** the response is received, **Then** each resource should include a `classification` field with value "container" or "icon"
2. **Given** a GET request to /api/catalog/containers/list, **When** the response is received, **Then** only resources with classification="container" should be returned

---

### Edge Cases

- What happens when a resource could logically be both (e.g., aws_subnet can contain EC2 but is also contained by VPC)?
  - **Resolution**: Classification is based on primary visual behavior - if it commonly contains other resources, it's a container
- How does the system handle resources that only exist in Terraform but have no visual representation?
  - **Resolution**: Mark as icon by default; these are typically utility resources like policies
- What happens when a user drags a resource into an invalid container (e.g., RDS directly into VPC instead of Subnet)?
  - **Resolution**: Warn but Allow - show a visual warning indicator but permit the placement to support non-standard architectures
- What happens when the catalog API is unavailable?
  - **Resolution**: Use cached classification data with a "stale data" indicator to allow continued operation
- What happens when a resource type is not found in the catalog (new AWS service or typo)?
  - **Resolution**: Default to icon classification with an "unknown resource" warning indicator

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST classify each AWS resource type as either "container" or "icon"
- **FR-002**: System MUST define containmentRules for each container resource specifying which resource types can be visual children
- **FR-003**: System MUST expose classification data through the /api/catalog endpoint
- **FR-004**: System MUST provide a /api/catalog/containers/list endpoint returning only container-type resources
- **FR-005**: System MUST store classifications in the shared/resource-catalog package as the single source of truth
- **FR-006**: System MUST include all 12 AWS service categories: Compute, Networking, Storage, Database, Security, Containers, Serverless, Analytics, Developer Tools, Management, Messaging, Machine Learning
- **FR-007**: Each ServiceDefinition MUST include a `classification` field with valid values "container" or "icon"
- **FR-008**: Container ServiceDefinitions MUST include `relations.containmentRules` array listing valid child resource types
- **FR-009**: System MUST remove all hardcoded containment rules from projects.py and replace with dynamic catalog lookups
- **FR-010**: Frontend MUST cache catalog classification data locally and use cached data with stale indicator when API is unavailable
- **FR-011**: System MUST default unknown resource types to "icon" classification and display an "unknown resource" warning indicator

### Key Entities

- **ServiceDefinition**: Resource schema including id, terraform_resource, name, classification, inputs, outputs, relations
- **ContainmentRule**: Defines which resource types can be visual children of a container
- **Classification**: Enum value ("container" | "icon") determining React Flow node behavior

## Resource Classification Matrix

### Container Resources (Can hold child resources visually)

| Category | Resource Type | Terraform Resource | Valid Children |
|----------|--------------|-------------------|----------------|
| Networking | VPC | aws_vpc | aws_subnet, aws_security_group, aws_internet_gateway, aws_nat_gateway, aws_route_table, aws_network_acl, aws_vpn_gateway, aws_vpc_endpoint |
| Networking | Subnet | aws_subnet | aws_instance, aws_nat_gateway, aws_network_interface, aws_db_instance, aws_elasticache_cluster, aws_efs_mount_target |
| Networking | Availability Zone | aws_availability_zone | aws_subnet (visual grouping only) |
| Networking | Security Group | aws_security_group | aws_security_group_rule |
| Networking | Route Table | aws_route_table | aws_route |
| Networking | Network ACL | aws_network_acl | aws_network_acl_rule |
| Networking | Transit Gateway | aws_ec2_transit_gateway | aws_ec2_transit_gateway_vpc_attachment, aws_ec2_transit_gateway_route_table |
| Networking | Route53 Zone | aws_route53_zone | aws_route53_record |
| Networking | Load Balancer | aws_lb | aws_lb_listener |
| Networking | LB Listener | aws_lb_listener | aws_lb_listener_rule |
| Networking | Target Group | aws_lb_target_group | aws_lb_target_group_attachment |
| Networking | API Gateway REST | aws_api_gateway_rest_api | aws_api_gateway_resource, aws_api_gateway_method, aws_api_gateway_deployment |
| Networking | API Gateway V2 | aws_apigatewayv2_api | aws_apigatewayv2_route, aws_apigatewayv2_integration, aws_apigatewayv2_stage |
| Containers | ECS Cluster | aws_ecs_cluster | aws_ecs_service, aws_ecs_capacity_provider |
| Containers | EKS Cluster | aws_eks_cluster | aws_eks_node_group, aws_eks_fargate_profile, aws_eks_addon |
| Storage | S3 Bucket | aws_s3_bucket | aws_s3_object, aws_s3_bucket_policy, aws_s3_bucket_versioning, aws_s3_bucket_lifecycle_configuration |
| Storage | EFS File System | aws_efs_file_system | aws_efs_mount_target, aws_efs_access_point |
| Database | DynamoDB Table | aws_dynamodb_table | aws_dynamodb_table_item |
| Database | RDS Cluster | aws_rds_cluster | aws_rds_cluster_instance |
| Security | IAM Role | aws_iam_role | aws_iam_role_policy, aws_iam_role_policy_attachment, aws_iam_instance_profile |
| Security | IAM User | aws_iam_user | aws_iam_user_policy, aws_iam_user_policy_attachment, aws_iam_access_key |
| Security | IAM Group | aws_iam_group | aws_iam_group_policy, aws_iam_group_policy_attachment |
| Security | Cognito User Pool | aws_cognito_user_pool | aws_cognito_user_pool_client |
| Serverless | Lambda Function | aws_lambda_function | aws_lambda_permission, aws_lambda_alias, aws_lambda_event_source_mapping |
| Compute | Auto Scaling Group | aws_autoscaling_group | aws_autoscaling_policy, aws_autoscaling_schedule, aws_autoscaling_lifecycle_hook |
| Compute | Launch Template | aws_launch_template | aws_autoscaling_group (when nested) |
| Compute | Elastic Beanstalk App | aws_elastic_beanstalk_application | aws_elastic_beanstalk_environment |
| Messaging | SNS Topic | aws_sns_topic | aws_sns_topic_subscription |
| Messaging | SQS Queue | aws_sqs_queue | aws_sqs_queue_policy |
| Management | CloudWatch Log Group | aws_cloudwatch_log_group | aws_cloudwatch_log_stream, aws_cloudwatch_log_metric_filter |
| Management | EventBridge Rule | aws_cloudwatch_event_rule | aws_cloudwatch_event_target |
| Developer Tools | CodePipeline | aws_codepipeline | aws_codepipeline_webhook |
| Developer Tools | CodeBuild Project | aws_codebuild_project | aws_codebuild_webhook |

### Icon Resources (Standalone, cannot contain children)

All other resources not listed above are classified as "icon", including but not limited to:
- aws_instance (EC2)
- aws_nat_gateway
- aws_eip
- aws_db_instance (RDS)
- aws_elasticache_cluster
- aws_kms_key
- aws_secretsmanager_secret
- aws_acm_certificate
- aws_cloudfront_distribution
- aws_lambda_layer_version
- aws_sqs_queue (child of nothing, has policy child)
- etc.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of AWS resources across all 12 categories have a valid classification assigned
- **SC-002**: All container resources have at least one containmentRule defined
- **SC-003**: /api/catalog endpoint returns classification for every resource
- **SC-004**: /api/catalog/containers/list returns exactly the resources marked as containers
- **SC-005**: Visual designer correctly renders container resources with expandable boundaries
- **SC-006**: Visual designer correctly renders icon resources as fixed-size nodes
- **SC-007**: Drag-and-drop of child resources into containers works for all defined containment rules

## Assumptions

- The existing shared/resource-catalog package structure will be used
- Container classification is based on AWS architectural best practices (VPC contains subnets, etc.)
- Some resources may be containers in one context but icons in another - we use the most common use case
- The frontend React Flow implementation supports dynamic node types based on classification

## Dependencies

- shared/resource-catalog package must exist (created in previous feature)
- Backend /api/catalog endpoint must be functional
- Frontend catalog integration must be in place

## Clarifications

### Session 2026-01-15

- Q: When a user drags a resource into a container that doesn't match containmentRules, what should happen? → A: Warn but Allow - show a warning indicator but permit the placement
- Q: How should migration from hardcoded rules in projects.py be handled? → A: Replace Completely - remove all hardcoded rules, use catalog as sole source of truth
- Q: How should the system behave if catalog API is unavailable? → A: Cached Fallback - use last cached classification data, show "stale data" indicator
- Q: How should unknown resource types (not in catalog) be handled? → A: Default Icon + Warning - treat as icon, show "unknown resource" indicator

## Out of Scope

- Azure and GCP resource classification (future feature)
- Custom user-defined container relationships
- Nested container depth limits (e.g., VPC > Subnet > EC2 is 2 levels deep)
