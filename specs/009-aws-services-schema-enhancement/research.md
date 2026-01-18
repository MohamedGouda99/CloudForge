# Research: AWS Services Schema Enhancement

**Feature**: 009-aws-services-schema-enhancement
**Date**: 2026-01-17
**Source**: Terraform Registry (registry.terraform.io/providers/hashicorp/aws/latest/docs)

## Overview

This document consolidates Terraform Registry documentation research for 140 AWS services across 9 categories. The research establishes patterns for schema enhancement including required/optional arguments, nested blocks, timeouts, and outputs.

---

## P1 - Priority 1 Categories

### 1. Networking (28 services)

#### aws_vpc

**Required Arguments**: None strictly required (either `cidr_block` OR `ipv4_ipam_pool_id`)

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `cidr_block` | string | - | IPv4 CIDR block (/16 to /28) |
| `enable_dns_support` | bool | `true` | Enable DNS support |
| `enable_dns_hostnames` | bool | `false` | Enable DNS hostnames |
| `instance_tenancy` | string | `default` | `default`, `dedicated`, `host` |
| `assign_generated_ipv6_cidr_block` | bool | `false` | Request Amazon IPv6 CIDR |
| `tags` | map(string) | - | Resource tags |

**Timeouts**: create: 5m, delete: 5m

**Outputs**: id, arn, main_route_table_id, default_network_acl_id, default_security_group_id, default_route_table_id, owner_id, ipv6_association_id, ipv6_cidr_block

---

#### aws_security_group

**Required Arguments**: None strictly required

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | Random | Security group name |
| `description` | string | `Managed by Terraform` | Description |
| `vpc_id` | string | Default VPC | VPC ID |
| `revoke_rules_on_delete` | bool | `false` | Revoke rules before delete |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`ingress` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_port` | number | Yes | Start port |
| `to_port` | number | Yes | End port |
| `protocol` | string | Yes | `tcp`, `udp`, `icmp`, `-1` |
| `cidr_blocks` | list(string) | No* | IPv4 CIDR blocks |
| `ipv6_cidr_blocks` | list(string) | No* | IPv6 CIDR blocks |
| `security_groups` | list(string) | No* | Security group IDs |
| `self` | bool | No | Reference self |
| `description` | string | No | Rule description |

`egress` (multiple): Same attributes as ingress

**Timeouts**: create: 10m, delete: 10m (recommend 45m for Lambda ENIs)

**Outputs**: id, arn, vpc_id, owner_id, name, description

---

#### aws_lb (Application/Network Load Balancer)

**Required Arguments**: Either `subnets` OR `subnet_mapping`

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | Auto | Name (max 32 chars) |
| `internal` | bool | `false` | Internal LB |
| `load_balancer_type` | string | `application` | `application`, `network`, `gateway` |
| `security_groups` | list(string) | - | Security groups (ALB only) |
| `subnets` | list(string) | - | Subnet IDs |
| `enable_deletion_protection` | bool | `false` | Prevent deletion |
| `enable_http2` | bool | `true` | HTTP/2 (ALB only) |
| `idle_timeout` | number | 60 | Idle timeout (ALB only) |
| `ip_address_type` | string | `ipv4` | `ipv4` or `dualstack` |

**Nested Blocks**:

`access_logs`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | Yes (if enabled) | S3 bucket name |
| `prefix` | string | No | S3 prefix |
| `enabled` | bool | No | Enable logging |

`subnet_mapping` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `subnet_id` | string | Yes | Subnet ID |
| `allocation_id` | string | No | EIP allocation (NLB) |
| `private_ipv4_address` | string | No | Private IP |
| `ipv6_address` | string | No | IPv6 address |

**Timeouts**: create: 10m, update: 10m, delete: 10m

**Outputs**: id, arn, arn_suffix, dns_name, zone_id

---

### 2. Security (25 services)

#### aws_iam_role

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `assume_role_policy` | string (JSON) | Trust policy document |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | Auto | Role name |
| `description` | string | - | Description |
| `path` | string | `/` | IAM path |
| `max_session_duration` | number | 3600 | Session duration (3600-43200) |
| `permissions_boundary` | string | - | Permissions boundary ARN |
| `force_detach_policies` | bool | `false` | Force detach on delete |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`inline_policy` (DEPRECATED - use aws_iam_role_policy):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Policy name |
| `policy` | string (JSON) | Yes | Policy document |

**Timeouts**: None (IAM operations are near-instantaneous)

**Outputs**: id (name), arn, create_date, unique_id, name, tags_all

---

#### aws_cognito_user_pool

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `name` | string | User pool name |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `alias_attributes` | set(string) | - | `phone_number`, `email`, `preferred_username` |
| `auto_verified_attributes` | set(string) | - | Attributes to auto-verify |
| `deletion_protection` | string | `INACTIVE` | `ACTIVE`/`INACTIVE` |
| `mfa_configuration` | string | `OFF` | `OFF`, `ON`, `OPTIONAL` |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`password_policy`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `minimum_length` | number | 8 | Min length (6-99) |
| `require_lowercase` | bool | `true` | Require lowercase |
| `require_numbers` | bool | `true` | Require numbers |
| `require_symbols` | bool | `true` | Require symbols |
| `require_uppercase` | bool | `true` | Require uppercase |
| `temporary_password_validity_days` | number | 7 | Temp password expiry |

`lambda_config`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `create_auth_challenge` | string | Lambda ARN |
| `custom_message` | string | Lambda ARN |
| `define_auth_challenge` | string | Lambda ARN |
| `post_authentication` | string | Lambda ARN |
| `post_confirmation` | string | Lambda ARN |
| `pre_authentication` | string | Lambda ARN |
| `pre_sign_up` | string | Lambda ARN |
| `pre_token_generation` | string | Lambda ARN |
| `user_migration` | string | Lambda ARN |
| `verify_auth_challenge_response` | string | Lambda ARN |

`schema` (multiple, max 50):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `attribute_data_type` | string | Yes | `Boolean`, `Number`, `String`, `DateTime` |
| `name` | string | Yes | Attribute name |
| `mutable` | bool | No | Can be changed |
| `required` | bool | No | Required attribute |

`admin_create_user_config`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `allow_admin_create_user_only` | bool | Only admins create users |
| `invite_message_template` | block | Invitation messages |

**Timeouts**: None documented

**Outputs**: id, arn, endpoint, creation_date, last_modified_date, domain, custom_domain, estimated_number_of_users, tags_all

---

#### aws_kms_key

**Required Arguments**: None (all optional)

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `description` | string | `KMS key` | Key description |
| `key_usage` | string | `ENCRYPT_DECRYPT` | `ENCRYPT_DECRYPT`, `SIGN_VERIFY`, `GENERATE_VERIFY_MAC` |
| `customer_master_key_spec` | string | `SYMMETRIC_DEFAULT` | Key type |
| `policy` | string (JSON) | AWS default | Key policy |
| `is_enabled` | bool | `true` | Key enabled |
| `enable_key_rotation` | bool | `false` | Auto rotation |
| `rotation_period_in_days` | number | 365 | Rotation period (90-2560) |
| `deletion_window_in_days` | number | 30 | Deletion window (7-30) |
| `multi_region` | bool | `false` | Multi-region key |
| `tags` | map(string) | - | Resource tags |

**Timeouts**: None documented

**Outputs**: id, arn, key_id, tags_all

---

### 3. Containers (12 services)

#### aws_ecs_task_definition

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `family` | string | Task definition family name |
| `container_definitions` | string (JSON) | Container definitions |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `cpu` | string | - | CPU units (required for Fargate) |
| `memory` | string | - | Memory MiB (required for Fargate) |
| `network_mode` | string | - | `awsvpc`, `bridge`, `host`, `none` |
| `task_role_arn` | string | - | Task IAM role |
| `execution_role_arn` | string | - | Execution IAM role |
| `requires_compatibilities` | set(string) | - | `EC2`, `FARGATE`, `EXTERNAL` |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`volume` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Volume name |
| `host_path` | string | No | Host path |
| `docker_volume_configuration` | block | No | Docker volume config |
| `efs_volume_configuration` | block | No | EFS config |

`placement_constraints` (max 10):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `memberOf` |
| `expression` | string | No | Cluster query expression |

`runtime_platform`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `operating_system_family` | string | `LINUX`, `WINDOWS_SERVER_2019_CORE`, etc. |
| `cpu_architecture` | string | `X86_64` or `ARM64` |

`ephemeral_storage`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `size_in_gib` | number | 21-200 GiB |

**Timeouts**: None documented

**Outputs**: arn, arn_without_revision, revision, tags_all

---

#### aws_ecs_service

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `name` | string | Service name |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `cluster` | string | - | ECS cluster ARN |
| `task_definition` | string | - | Task definition ARN |
| `desired_count` | number | 0 | Task count |
| `launch_type` | string | `EC2` | `EC2`, `FARGATE`, `EXTERNAL` |
| `scheduling_strategy` | string | `REPLICA` | `REPLICA` or `DAEMON` |
| `platform_version` | string | `LATEST` | Fargate version |
| `enable_execute_command` | bool | - | Enable ECS Exec |
| `health_check_grace_period_seconds` | number | - | LB health check grace |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`deployment_controller`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `ECS` | `CODE_DEPLOY`, `ECS`, `EXTERNAL` |

`load_balancer` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `container_name` | string | Yes | Container name |
| `container_port` | number | Yes | Container port |
| `target_group_arn` | string | Required for ALB/NLB | Target group ARN |
| `elb_name` | string | Required for Classic | ELB name |

`network_configuration` (required for awsvpc):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `subnets` | set(string) | Yes | Subnet IDs |
| `security_groups` | set(string) | No | Security group IDs |
| `assign_public_ip` | bool | No | Assign public IP |

`deployment_circuit_breaker`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `enable` | bool | Yes | Enable circuit breaker |
| `rollback` | bool | Yes | Enable rollback |

`service_registries`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `registry_arn` | string | Yes | Service registry ARN |
| `container_name` | string | No | Container name |
| `container_port` | number | No | Container port |

**Timeouts**: create: 20m, update: 20m, delete: 20m

**Outputs**: arn, id, tags_all

---

#### aws_eks_cluster

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `name` | string | Cluster name |
| `role_arn` | string | IAM role ARN |
| `vpc_config` | block | VPC configuration |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `version` | string | Latest | Kubernetes version |
| `enabled_cluster_log_types` | set(string) | - | Log types to enable |
| `deletion_protection` | bool | `false` | Prevent deletion |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`vpc_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `subnet_ids` | set(string) | Yes | Subnet IDs (min 2 AZs) |
| `security_group_ids` | set(string) | No | Security groups |
| `endpoint_private_access` | bool | No | Private endpoint |
| `endpoint_public_access` | bool | No | Public endpoint (default true) |
| `public_access_cidrs` | set(string) | No | Public access CIDRs |

`kubernetes_network_config`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `service_ipv4_cidr` | string | Service CIDR (/24 to /12) |
| `ip_family` | string | `ipv4` or `ipv6` |

`encryption_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `resources` | set(string) | Yes | `["secrets"]` |
| `provider.key_arn` | string | Yes | KMS key ARN |

`access_config`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `authentication_mode` | string | `CONFIG_MAP`, `API`, `API_AND_CONFIG_MAP` |
| `bootstrap_cluster_creator_admin_permissions` | bool | Default true |

**Timeouts**: create: 30m, update: 60m, delete: 15m

**Outputs**: arn, id, endpoint, status, platform_version, created_at, certificate_authority.data, identity.oidc.issuer, vpc_config.vpc_id, vpc_config.cluster_security_group_id, tags_all

---

## P2 - Priority 2 Categories

### 4. Serverless (11 services)

#### aws_lambda_function

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `function_name` | string | Function name |
| `role` | string | Execution role ARN |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `handler` | string | - | Required if package_type=Zip |
| `runtime` | string | - | Required if package_type=Zip |
| `architectures` | list(string) | `["x86_64"]` | `["x86_64"]` or `["arm64"]` |
| `memory_size` | number | 128 | 128-10240 MB |
| `timeout` | number | 3 | 1-900 seconds |
| `package_type` | string | `Zip` | `Zip` or `Image` |
| `publish` | bool | `false` | Publish version |
| `reserved_concurrent_executions` | number | -1 | -1 unlimited, 0 disabled |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`vpc_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `subnet_ids` | set(string) | Yes | Subnet IDs |
| `security_group_ids` | set(string) | Yes | Security group IDs |
| `ipv6_allowed_for_dual_stack` | bool | No | Enable IPv6 |

`environment`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `variables` | map(string) | Environment variables |

`tracing_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | `Active` or `PassThrough` |

`dead_letter_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_arn` | string | Yes | SNS/SQS ARN |

`file_system_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `arn` | string | Yes | EFS Access Point ARN |
| `local_mount_path` | string | Yes | Mount path (starts with `/mnt/`) |

`ephemeral_storage`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `size` | number | /tmp size 512-10240 MB |

`logging_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `log_format` | string | Yes | `Text` or `JSON` |
| `application_log_level` | string | No | `TRACE`-`FATAL` |
| `system_log_level` | string | No | `DEBUG`, `INFO`, `WARN` |
| `log_group` | string | No | CloudWatch log group |

**Timeouts**: create: 10m, update: 10m, delete: 10m (VPC may need 45m)

**Outputs**: arn, invoke_arn, qualified_arn, version, source_code_size, last_modified, vpc_config.vpc_id

---

#### aws_sfn_state_machine

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `definition` | string | Amazon States Language definition |
| `role_arn` | string | IAM role ARN |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | Random | State machine name |
| `type` | string | `STANDARD` | `STANDARD` or `EXPRESS` |
| `publish` | bool | `false` | Publish version |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`logging_configuration`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `log_destination` | string | CloudWatch log group ARN (end with `:*`) |
| `include_execution_data` | bool | Include execution data |
| `level` | string | `ALL`, `ERROR`, `FATAL`, `OFF` |

`tracing_configuration`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `enabled` | bool | Enable X-Ray tracing |

`encryption_configuration`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `type` | string | `AWS_OWNED_KEY` or `CUSTOMER_MANAGED_KMS_KEY` |
| `kms_key_id` | string | KMS key ID |

**Timeouts**: create: 5m, update: 1m, delete: 5m

**Outputs**: id, arn, creation_date, state_machine_version_arn, status, tags_all

---

### 5. Messaging (10 services)

#### aws_sqs_queue

**Required Arguments**: None (all optional)

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | Random | Queue name |
| `fifo_queue` | bool | `false` | FIFO queue |
| `content_based_deduplication` | bool | - | Content dedup (FIFO) |
| `delay_seconds` | number | 0 | Delivery delay (0-900) |
| `max_message_size` | number | 262144 | Max size (1024-1048576) |
| `message_retention_seconds` | number | 345600 | Retention (60-1209600) |
| `receive_wait_time_seconds` | number | 0 | Long poll wait (0-20) |
| `visibility_timeout_seconds` | number | 30 | Visibility timeout (0-43200) |
| `policy` | string (JSON) | - | Queue policy |
| `kms_master_key_id` | string | - | KMS key ID |
| `sqs_managed_sse_enabled` | bool | - | SQS-managed SSE |
| `tags` | map(string) | - | Resource tags |

**Redrive Policy** (JSON string):
```json
{
  "deadLetterTargetArn": "arn:aws:sqs:region:account:dlq",
  "maxReceiveCount": 5
}
```

**Redrive Allow Policy** (JSON string):
```json
{
  "redrivePermission": "byQueue",
  "sourceQueueArns": ["arn:aws:sqs:region:account:source"]
}
```

**Timeouts**: create: 3m, update: 3m, delete: 3m

**Outputs**: id, arn, url, tags_all

---

### 6. Developer Tools (13 services)

#### aws_codepipeline

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `name` | string | Pipeline name |
| `role_arn` | string | Service role ARN |
| `artifact_store` | block | Artifact store config |
| `stage` | block | Min 2 stages required |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `pipeline_type` | string | `V1` | `V1` or `V2` |
| `execution_mode` | string | `SUPERSEDED` | Execution handling |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`artifact_store`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | string | Yes | S3 bucket |
| `type` | string | Yes | `S3` |
| `region` | string | No | For cross-region |
| `encryption_key` | block | No | KMS encryption |

`stage` (multiple, min 2):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Stage name |
| `action` | block | Yes | Stage actions |

`action` (nested in stage):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Action name |
| `category` | string | Yes | `Source`, `Build`, `Deploy`, `Test`, `Approval`, `Invoke` |
| `owner` | string | Yes | `AWS`, `Custom`, `ThirdParty` |
| `provider` | string | Yes | Service provider |
| `version` | string | Yes | Version |
| `configuration` | map | No | Provider settings |
| `input_artifacts` | list(string) | No | Input artifacts |
| `output_artifacts` | list(string) | No | Output artifacts |
| `role_arn` | string | No | Action role |
| `run_order` | number | No | Execution order |
| `region` | string | No | Action region |

**Timeouts**: None documented

**Outputs**: id, arn, tags_all

---

#### aws_codebuild_project

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `name` | string | Project name |
| `service_role` | string | IAM role ARN |
| `source` | block | Source config |
| `artifacts` | block | Artifacts config |
| `environment` | block | Environment config |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `description` | string | - | Description |
| `build_timeout` | number | 60 | Timeout minutes (5-2160) |
| `queued_timeout` | number | 480 | Queue timeout (5-480) |
| `badge_enabled` | bool | `false` | Build badge |
| `concurrent_build_limit` | number | - | Max concurrent builds |
| `encryption_key` | string | - | KMS key ARN |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`source`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `CODECOMMIT`, `CODEPIPELINE`, `GITHUB`, `S3`, etc. |
| `location` | string | No | Source location |
| `buildspec` | string | No | Buildspec file/content |
| `git_clone_depth` | number | No | Git depth |

`environment`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `compute_type` | string | Yes | `BUILD_GENERAL1_SMALL/MEDIUM/LARGE/XLARGE` |
| `image` | string | Yes | Docker image |
| `type` | string | Yes | `LINUX_CONTAINER`, `ARM_CONTAINER`, etc. |
| `privileged_mode` | bool | No | Docker-in-Docker |
| `environment_variable` | block | No | Environment vars |

`environment_variable` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Variable name |
| `value` | string | Yes | Variable value |
| `type` | string | No | `PLAINTEXT`, `PARAMETER_STORE`, `SECRETS_MANAGER` |

`artifacts`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `CODEPIPELINE`, `NO_ARTIFACTS`, `S3` |
| `location` | string | No | S3 bucket |
| `name` | string | No | Artifact name |
| `packaging` | string | No | `NONE` or `ZIP` |

`vpc_config`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `vpc_id` | string | Yes | VPC ID |
| `subnets` | set(string) | Yes | Subnet IDs |
| `security_group_ids` | set(string) | Yes | Security group IDs |

`cache`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `NO_CACHE` | `NO_CACHE`, `LOCAL`, `S3` |
| `location` | string | - | S3 path (for S3 type) |
| `modes` | list(string) | - | LOCAL modes |

`logs_config`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `cloudwatch_logs` | block | CloudWatch config |
| `s3_logs` | block | S3 logging config |

**Timeouts**: None documented

**Outputs**: arn, id, badge_url, tags_all

---

## P3 - Priority 3 Categories

### 7. Analytics (11 services)

#### aws_glue_crawler

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `database_name` | string | Glue database |
| `name` | string | Crawler name |
| `role` | string | IAM role ARN |

**Note**: Must specify at least one target type

**Key Optional Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `classifiers` | list(string) | Custom classifiers |
| `configuration` | string | JSON config |
| `description` | string | Description |
| `schedule` | string | Cron expression |
| `table_prefix` | string | Table prefix |
| `tags` | map(string) | Resource tags |

**Nested Blocks**:

`s3_target` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | S3 path |
| `connection_name` | string | No | VPC connection |
| `exclusions` | list(string) | No | Glob exclusions |
| `sample_size` | number | No | Files per folder (1-249) |

`jdbc_target` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `connection_name` | string | Yes | Connection name |
| `path` | string | Yes | JDBC path |
| `exclusions` | list(string) | No | Exclusions |

`catalog_target` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `database_name` | string | Yes | Database name |
| `tables` | list(string) | Yes | Tables to sync |
| `connection_name` | string | No | Connection name |

`dynamodb_target` (multiple):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | DynamoDB table |
| `scan_all` | bool | No | Scan all records |
| `scan_rate` | number | No | Read capacity % |

`schema_change_policy`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `delete_behavior` | string | `DEPRECATE_IN_DATABASE` | `LOG`, `DELETE_FROM_DATABASE` |
| `update_behavior` | string | `UPDATE_IN_DATABASE` | `LOG`, `UPDATE_IN_DATABASE` |

`recrawl_policy`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `recrawl_behavior` | string | `CRAWL_EVERYTHING` | `CRAWL_EVENT_MODE`, `CRAWL_NEW_FOLDERS_ONLY` |

`lineage_configuration`:
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `crawler_lineage_settings` | string | `DISABLE` | `ENABLE`, `DISABLE` |

**Timeouts**: None documented

**Outputs**: id, arn, tags_all

---

### 8. Machine Learning (11 services)

#### aws_sagemaker_domain

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `auth_mode` | string | `IAM` or `SSO` |
| `default_space_settings` | block | Default space config |
| `default_user_settings` | block | Default user config |
| `domain_name` | string | Domain name |
| `subnet_ids` | list(string) | VPC subnets |
| `vpc_id` | string | VPC ID |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `app_network_access_type` | string | `PublicInternetOnly` | `PublicInternetOnly`, `VpcOnly` |
| `kms_key_id` | string | - | KMS key for EFS |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`default_user_settings`:
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `execution_role` | string | Yes | Execution role ARN |
| `security_groups` | list(string) | No | Security groups |
| `sharing_settings` | block | No | Notebook sharing |
| `jupyter_server_app_settings` | block | No | Jupyter config |
| `kernel_gateway_app_settings` | block | No | Kernel config |
| `tensor_board_app_settings` | block | No | TensorBoard config |
| `canvas_app_settings` | block | No | Canvas config |

`sharing_settings`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `notebook_output_option` | string | `Allowed`, `Disabled` |
| `s3_kms_key_id` | string | KMS key for output |
| `s3_output_path` | string | S3 output path |

`kernel_gateway_app_settings`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `custom_image` | block | Custom images |
| `default_resource_spec` | block | Default resources |
| `lifecycle_config_arns` | list(string) | Lifecycle configs |

`default_resource_spec`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `instance_type` | string | Instance type |
| `lifecycle_config_arn` | string | Lifecycle config |
| `sagemaker_image_arn` | string | Image ARN |

`domain_settings`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `execution_role_identity_config` | string | `USER_PROFILE_NAME`, `DISABLED` |
| `security_group_ids` | list(string) | Security groups |

`retention_policy`:
| Attribute | Type | Description |
|-----------|------|-------------|
| `home_efs_file_system` | string | `Retain`, `Delete` |

**Timeouts**: None documented

**Outputs**: arn, home_efs_file_system_id, id, security_group_id_for_domain_boundary, single_sign_on_application_arn, url, tags_all

---

### 9. Management (19 services)

#### aws_cloudwatch_metric_alarm

**Required Arguments**:
| Argument | Type | Description |
|----------|------|-------------|
| `alarm_name` | string | Alarm name |
| `comparison_operator` | string | `GreaterThanThreshold`, `LessThanThreshold`, etc. |
| `evaluation_periods` | number | Evaluation periods |

**Key Optional Arguments**:
| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `metric_name` | string | - | Metric name |
| `namespace` | string | - | Metric namespace |
| `period` | number | - | Period seconds (10, 20, 30, or multiples of 60) |
| `statistic` | string | - | `SampleCount`, `Average`, `Sum`, `Minimum`, `Maximum` |
| `threshold` | number | - | Threshold value |
| `actions_enabled` | bool | `true` | Enable actions |
| `alarm_actions` | list(string) | - | ALARM state actions |
| `ok_actions` | list(string) | - | OK state actions |
| `insufficient_data_actions` | list(string) | - | INSUFFICIENT_DATA actions |
| `alarm_description` | string | - | Description |
| `datapoints_to_alarm` | number | - | Datapoints to trigger |
| `dimensions` | map(string) | - | Metric dimensions |
| `treat_missing_data` | string | `missing` | `missing`, `ignore`, `breaching`, `notBreaching` |
| `extended_statistic` | string | - | Percentile (p0.0-p100) |
| `tags` | map(string) | - | Resource tags |

**Nested Blocks**:

`metric_query` (max 20):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Query ID |
| `account_id` | string | No | Cross-account ID |
| `expression` | string | No | Math expression |
| `label` | string | No | Human-readable label |
| `metric` | block | No | Metric specification |
| `period` | number | No | Granularity |
| `return_data` | bool | No | Return result |

`metric` (nested in metric_query):
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `metric_name` | string | Yes | Metric name |
| `namespace` | string | Yes | Namespace |
| `period` | number | Yes | Period |
| `stat` | string | Yes | Statistic |
| `dimensions` | map(string) | No | Dimensions |
| `unit` | string | No | Unit |

**Timeouts**: None documented

**Outputs**: arn, id, tags_all

---

## Standard Timeout Defaults

When timeouts are not explicitly documented, use these standard defaults:

| Resource Type | Create | Update | Delete |
|---------------|--------|--------|--------|
| VPC/Networking | 5m | - | 5m |
| Security Groups | 10m | - | 10m-45m |
| Load Balancers | 10m | 10m | 10m |
| ECS Services | 20m | 20m | 20m |
| EKS Clusters | 30m | 60m | 15m |
| Lambda Functions | 10m | 10m | 10m |
| Step Functions | 5m | 1m | 5m |
| SQS Queues | 3m | 3m | 3m |
| IAM Resources | - | - | - |
| Default | 30m | 60m | 30m |

---

## Implementation Pattern Summary

### Schema Structure

```typescript
{
  id: "service_id",
  name: "Service Name",
  description: "Description",
  terraform_resource: "aws_resource_type",
  icon: CATEGORY_ICONS['aws_resource_type'],
  inputs: {
    required: [
      { name: "arg", type: "string", description: "...", reference: "other_resource.id" }
    ],
    optional: [
      { name: "arg", type: "string", description: "...", default: "value", options: ["a", "b"] }
    ],
    blocks: [
      {
        name: "block_name",
        multiple: true,
        attributes: [
          { name: "attr", type: "string", description: "...", default: "value" }
        ],
        nested_blocks: [
          { name: "nested", attributes: [...] }
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
    { name: "arn", type: "string", description: "Resource ARN" },
    { name: "tags_all", type: "map(string)", description: "All tags" }
  ]
}
```

### Key Decisions

1. **Timeouts**: Include for all services that support them
2. **Outputs**: Always include id, arn, tags_all where applicable
3. **Blocks**: Mark with `multiple: true` where repeatable
4. **References**: Add `reference` hints for cross-resource dependencies
5. **Options**: Include valid values for enum-type attributes
6. **Defaults**: Include Terraform Registry documented defaults
