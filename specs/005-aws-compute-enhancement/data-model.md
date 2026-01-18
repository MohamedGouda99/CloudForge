# Data Model: AWS Compute Resource Enhancement

**Feature**: 005-aws-compute-enhancement
**Date**: 2026-01-15
**Purpose**: Define unified schema types for the shared resource catalog

## Overview

This document defines the data model for the unified resource catalog that eliminates duplication between frontend and backend. All resource definitions will conform to these types.

---

## Core Types

### ServiceDefinition

The primary entity representing a cloud resource type.

```typescript
interface ServiceDefinition {
  // Identity
  id: string;                      // Unique ID: "ec2_instance"
  terraform_resource: string;      // Terraform type: "aws_instance"

  // Display
  name: string;                    // Human label: "EC2 Instance"
  description: string;             // Brief description
  icon: string;                    // Icon path
  category: ServiceCategory;       // Grouping: "compute"

  // Visual Classification
  classification: "icon" | "container";

  // Schema
  inputs: InputSchema;
  outputs: OutputAttribute[];

  // Terraform Metadata
  terraform: TerraformMetadata;

  // Relationship Intelligence
  relations?: RelationshipRules;
}

type ServiceCategory =
  | "compute"
  | "containers"
  | "storage"
  | "database"
  | "networking"
  | "security"
  | "analytics"
  | "application";
```

### InputSchema

Defines configurable properties for a resource.

```typescript
interface InputSchema {
  required: InputAttribute[];
  optional: InputAttribute[];
  blocks?: BlockAttribute[];
}

interface InputAttribute {
  name: string;                    // Terraform argument name
  type: AttributeType;             // Data type
  description: string;             // Help text
  example?: string;                // Example value
  default?: unknown;               // Default value
  options?: string[];              // For enum/select types
  reference?: string;              // Reference format: "aws_subnet.id"
  validation?: ValidationRule;     // Input validation
  group?: "basic" | "advanced";    // UI grouping
}

type AttributeType =
  | "string"
  | "number"
  | "bool"
  | "list(string)"
  | "list(number)"
  | "map(string)"
  | "set(string)";

interface ValidationRule {
  pattern?: string;                // Regex pattern
  min?: number;                    // Minimum value
  max?: number;                    // Maximum value
  minLength?: number;              // Minimum string length
  maxLength?: number;              // Maximum string length
}
```

### BlockAttribute

Defines nested block structures (e.g., root_block_device).

```typescript
interface BlockAttribute {
  name: string;                    // Block name
  description: string;
  required: boolean;
  multiple: boolean;               // Can have multiple instances
  attributes: InputAttribute[];    // Nested attributes
}
```

### OutputAttribute

Defines exported values from a resource.

```typescript
interface OutputAttribute {
  name: string;                    // Attribute name: "id"
  type: AttributeType;             // Data type
  description: string;             // What this value represents
}
```

### TerraformMetadata

Metadata for HCL generation.

```typescript
interface TerraformMetadata {
  resourceType: string;            // "aws_instance"
  requiredArgs: string[];          // ["ami", "instance_type"]
  referenceableAttrs: Record<string, string>;  // { id: "id", arn: "arn" }
}
```

### RelationshipRules

Defines how resources can connect and interact.

```typescript
interface RelationshipRules {
  containmentRules?: ContainmentRule[];
  edgeRules?: EdgeRule[];
  autoResolveRules?: AutoResolveRule[];
}

interface ContainmentRule {
  whenParentResourceType: string;
  apply: AttributeMapping[];
}

interface EdgeRule {
  whenEdgeKind: "connect" | "attach" | "associate" | "route";
  direction: "inbound" | "outbound";
  toResourceType: string;
  apply: AttributeMapping[] | AssociationResource;
}

interface AttributeMapping {
  setArg?: string;
  pushToListArg?: string;
  toParentAttr?: string;
  toTargetAttr?: string;
}

interface AssociationResource {
  createAssociationResource: {
    type: string;
    nameTemplate: string;
    args: Record<string, string>;
  };
}

interface AutoResolveRule {
  requiredArg: string;
  acceptsResourceTypes: string[];
  search: SearchStrategy[];
  onMissing: {
    level: "error" | "warning";
    message: string;
    fixHint: string;
  };
}

type SearchStrategy =
  | { type: "containment_ancestors" }
  | { type: "connected_edges"; edgeKind: string };
```

---

## AWS Compute Resources Schema

### aws_instance (EC2 Instance)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| ami | required | string | Yes | - | AMI ID to use for the instance |
| instance_type | required | string | Yes | "t3.micro" | Instance type |
| availability_zone | optional | string | No | - | AZ to start the instance in |
| subnet_id | optional | string | No | - | VPC Subnet ID to launch in |
| vpc_security_group_ids | optional | list(string) | No | - | List of security group IDs |
| key_name | optional | string | No | - | Key pair name for SSH access |
| iam_instance_profile | optional | string | No | - | IAM Instance Profile |
| user_data | optional | string | No | - | User data script |
| associate_public_ip_address | optional | bool | No | false | Associate a public IP address |
| private_ip | optional | string | No | - | Private IP address |
| monitoring | optional | bool | No | false | Enable detailed monitoring |
| tags | optional | map(string) | No | {} | Tags for the instance |

**Blocks:**
- `root_block_device`: volume_type, volume_size, encrypted, delete_on_termination

**Outputs:** id, arn, public_ip, private_ip, public_dns, private_dns

**Classification:** icon

---

### aws_lambda_function (Lambda Function)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| function_name | required | string | Yes | - | Function name |
| role | required | string | Yes | - | IAM role ARN |
| runtime | optional | string | No | "python3.12" | Runtime environment |
| handler | optional | string | No | "index.handler" | Function handler |
| memory_size | optional | number | No | 128 | Memory in MB (128-10240) |
| timeout | optional | number | No | 3 | Timeout in seconds (1-900) |
| architectures | optional | list(string) | No | ["x86_64"] | CPU architecture |
| environment | optional | map(string) | No | {} | Environment variables |
| tags | optional | map(string) | No | {} | Tags |

**Outputs:** arn, invoke_arn, qualified_arn, version

**Classification:** icon

---

### aws_ecs_cluster (ECS Cluster)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| name | required | string | Yes | - | Cluster name |
| capacity_providers | optional | list(string) | No | - | Capacity providers |
| tags | optional | map(string) | No | {} | Tags |

**Blocks:**
- `setting`: Container Insights configuration

**Outputs:** id, arn, name

**Classification:** container (can contain ECS services)

---

### aws_ecs_service (ECS Service)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| name | required | string | Yes | - | Service name |
| cluster | required | string | Yes | - | Cluster ARN |
| task_definition | required | string | Yes | - | Task definition ARN |
| desired_count | optional | number | No | 1 | Number of tasks |
| launch_type | optional | string | No | "FARGATE" | Launch type |
| scheduling_strategy | optional | string | No | "REPLICA" | Scheduling strategy |
| tags | optional | map(string) | No | {} | Tags |

**Blocks:**
- `network_configuration`: subnets, security_groups, assign_public_ip
- `load_balancer`: target_group_arn, container_name, container_port

**Outputs:** id, name, cluster

**Classification:** icon (must be inside ECS cluster container)

---

### aws_ecs_task_definition (ECS Task Definition)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| family | required | string | Yes | - | Task family name |
| container_definitions | required | string | Yes | - | JSON container definitions |
| cpu | optional | string | No | "256" | CPU units |
| memory | optional | string | No | "512" | Memory in MB |
| network_mode | optional | string | No | "awsvpc" | Network mode |
| requires_compatibilities | optional | list(string) | No | ["FARGATE"] | Compatibility |
| execution_role_arn | optional | string | No | - | Execution role ARN |
| task_role_arn | optional | string | No | - | Task role ARN |
| tags | optional | map(string) | No | {} | Tags |

**Outputs:** arn, revision, family

**Classification:** icon

---

### aws_eks_cluster (EKS Cluster)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| name | required | string | Yes | - | Cluster name |
| role_arn | required | string | Yes | - | IAM role ARN |
| version | optional | string | No | - | Kubernetes version |
| enabled_cluster_log_types | optional | list(string) | No | - | Log types |
| tags | optional | map(string) | No | {} | Tags |

**Blocks:**
- `vpc_config`: subnet_ids, security_group_ids, endpoint_private_access, endpoint_public_access

**Outputs:** id, arn, endpoint, certificate_authority

**Classification:** container (can contain node groups)

---

### aws_eks_node_group (EKS Node Group)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| cluster_name | required | string | Yes | - | EKS cluster name |
| node_group_name | required | string | Yes | - | Node group name |
| node_role_arn | required | string | Yes | - | IAM role ARN |
| subnet_ids | required | list(string) | Yes | - | Subnet IDs |
| instance_types | optional | list(string) | No | ["t3.medium"] | Instance types |
| disk_size | optional | number | No | 20 | Disk size in GB |
| ami_type | optional | string | No | "AL2_x86_64" | AMI type |
| tags | optional | map(string) | No | {} | Tags |

**Blocks:**
- `scaling_config`: desired_size, min_size, max_size

**Outputs:** id, arn, status

**Classification:** icon (must be inside EKS cluster container)

---

### aws_launch_template (Launch Template)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| name | optional | string | No | - | Template name |
| image_id | optional | string | No | - | AMI ID |
| instance_type | optional | string | No | - | Instance type |
| key_name | optional | string | No | - | Key pair name |
| user_data | optional | string | No | - | Base64-encoded user data |
| tags | optional | map(string) | No | {} | Tags |

**Blocks:**
- `network_interfaces`: security_groups, subnet_id
- `block_device_mappings`: device_name, ebs configuration

**Outputs:** id, arn, latest_version, default_version

**Classification:** icon

---

### aws_autoscaling_group (Auto Scaling Group)

| Field | Category | Type | Required | Default | Description |
|-------|----------|------|----------|---------|-------------|
| name | optional | string | No | - | ASG name |
| min_size | required | number | Yes | - | Minimum size |
| max_size | required | number | Yes | - | Maximum size |
| desired_capacity | optional | number | No | - | Desired capacity |
| vpc_zone_identifier | optional | list(string) | No | - | Subnet IDs |
| health_check_type | optional | string | No | "EC2" | Health check type |
| health_check_grace_period | optional | number | No | 300 | Grace period |
| tags | optional | list(map) | No | [] | Tags |

**Blocks:**
- `launch_template`: id, version
- `mixed_instances_policy`: for spot/on-demand mix

**Outputs:** id, arn, name

**Classification:** icon

---

## Entity Relationships

```
                    ┌─────────────────┐
                    │   aws_vpc       │
                    │  (container)    │
                    └────────┬────────┘
                             │ contains
                    ┌────────▼────────┐
                    │  aws_subnet     │
                    │  (container)    │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
    │aws_instance │  │aws_ecs_cluster│  │aws_eks_cluster│
    │   (icon)    │  │ (container)   │  │ (container)   │
    └──────┬──────┘  └───────┬───────┘  └──────┬───────┘
           │                 │                  │
           │         ┌───────▼───────┐  ┌──────▼──────┐
           │         │aws_ecs_service│  │aws_eks_node │
           │         │    (icon)     │  │   _group    │
           │         └───────┬───────┘  │   (icon)    │
           │                 │          └─────────────┘
           │         ┌───────▼───────┐
           │         │aws_ecs_task   │
           │         │  _definition  │
           │         │    (icon)     │
           │         └───────────────┘
           │
    ┌──────▼──────────────┐
    │aws_autoscaling_group│──────▶ aws_launch_template
    │       (icon)        │         (icon)
    └─────────────────────┘

    ┌─────────────────┐
    │aws_lambda_func  │──────▶ aws_iam_role
    │     (icon)      │         (icon)
    └─────────────────┘
```

---

## Validation Rules

### Instance Type Validation
```typescript
validation: {
  pattern: "^[a-z][0-9][a-z]?\\.(nano|micro|small|medium|large|xlarge|[0-9]+xlarge)$"
}
```

### Memory Size Validation (Lambda)
```typescript
validation: {
  min: 128,
  max: 10240
}
```

### Timeout Validation (Lambda)
```typescript
validation: {
  min: 1,
  max: 900
}
```

### CIDR Block Validation
```typescript
validation: {
  pattern: "^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$"
}
```

---

## State Transitions

Resources don't have explicit state machines, but their lifecycle is:

1. **Draft** - Created on canvas, not yet saved
2. **Saved** - Persisted in project diagram_data
3. **Validated** - Passed schema validation
4. **Generated** - HCL code generated successfully
5. **Deployed** - Applied via Terraform (out of scope)
