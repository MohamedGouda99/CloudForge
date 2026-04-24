# Architecture Import Schema

This reference describes the JSON format CloudForge uses for importing and exporting cloud-architecture diagrams. The format is stable across provider (AWS/Azure/GCP) and is the interchange between the visual designer, the Terraform generator, and external tooling.

## Why this matters

- **Programmatic generation** — produce diagrams from an LLM, a CSV, or a Terraform import
- **Portability** — share an architecture as a single file checked into git
- **Templates** — drop in pre-built stacks (e.g. "VPC + ALB + ECS + RDS") and edit visually
- **Migration** — import from other tools that can emit this format

## Contents

- [Schema Version](#schema-version)
- [JSON Structure](#json-structure)
- [Root Properties](#root-properties)
- [Metadata Object](#metadata-object)
- [Resources Array](#resources-array)
- [Connections Array](#connections-array)
- [Groups Array](#groups-array)
- [Provider-Specific Fields](#provider-specific-fields)
- [Validation](#validation)
- [Examples](#examples)

## Schema Version

Current schema version: `1.0`

## JSON Structure

```json
{
  "version": "1.0",
  "metadata": {
    "name": "My Architecture",
    "description": "Description of the architecture",
    "cloud_provider": "aws",
    "author": "Your Name",
    "created_at": "2026-04-24T10:30:00Z"
  },
  "resources": [...],
  "connections": [...],
  "groups": [...]
}
```

## Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | Yes | Schema version (currently "1.0") |
| `metadata` | object | Yes | Project metadata |
| `resources` | array | Yes | List of cloud resources |
| `connections` | array | No | Connections between resources |
| `groups` | array | No | Resource groupings (for nesting) |

## Metadata Object

```json
{
  "metadata": {
    "name": "Production Infrastructure",
    "description": "AWS production environment with VPC, EC2, and RDS",
    "cloud_provider": "aws",
    "author": "DevOps Team",
    "tags": ["production", "aws", "web-app"],
    "created_at": "2026-04-24T10:30:00Z"
  }
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Architecture name |
| `description` | string | No | Architecture description |
| `cloud_provider` | string | Yes | Cloud provider: `aws`, `azure`, or `gcp` |
| `author` | string | No | Author name |
| `tags` | array | No | Tags for categorization |
| `created_at` | string | No | ISO 8601 timestamp |

## Resources Array

Each resource represents a cloud service/component that will be drawn on the canvas.

```json
{
  "resources": [
    {
      "id": "vpc-main",
      "type": "aws_vpc",
      "name": "Main VPC",
      "properties": {
        "cidr_block": "10.0.0.0/16",
        "enable_dns_hostnames": true,
        "enable_dns_support": true
      },
      "position": {
        "x": 100,
        "y": 100
      }
    }
  ]
}
```

### Resource Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the resource |
| `type` | string | Yes | Terraform resource type (e.g., `aws_vpc`, `aws_instance`) |
| `name` | string | Yes | Display name for the resource |
| `properties` | object | No | Resource configuration properties |
| `position` | object | No | Canvas position (auto-layout if not provided) |
| `parent` | string | No | Parent resource ID (for nesting inside VPC/Subnet) |

### Position Object

```json
{
  "position": {
    "x": 100,
    "y": 200
  }
}
```

If position is not provided, CloudForge will auto-layout the resources.

## Connections Array

Connections define relationships between resources (edges on the canvas).

```json
{
  "connections": [
    {
      "id": "conn-1",
      "from": "ec2-web",
      "to": "vpc-main",
      "label": "deployed in"
    }
  ]
}
```

### Connection Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | No | Unique connection ID (auto-generated if not provided) |
| `from` | string | Yes | Source resource ID |
| `to` | string | Yes | Target resource ID |
| `label` | string | No | Connection label |

## Groups Array (Optional)

Groups allow you to visually group resources together.

```json
{
  "groups": [
    {
      "id": "group-frontend",
      "name": "Frontend Tier",
      "resources": ["ec2-web-1", "ec2-web-2", "alb-main"],
      "color": "#3B82F6"
    }
  ]
}
```

---

## Supported Resource Types

### AWS Resources

#### Compute
| Type | Description |
|------|-------------|
| `aws_instance` | EC2 Instance |
| `aws_launch_template` | Launch Template |
| `aws_autoscaling_group` | Auto Scaling Group |
| `aws_lambda_function` | Lambda Function |
| `aws_ecs_cluster` | ECS Cluster |
| `aws_ecs_service` | ECS Service |
| `aws_ecs_task_definition` | ECS Task Definition |
| `aws_eks_cluster` | EKS Cluster |
| `aws_eks_node_group` | EKS Node Group |

#### Networking
| Type | Description |
|------|-------------|
| `aws_vpc` | Virtual Private Cloud |
| `aws_subnet` | Subnet |
| `aws_security_group` | Security Group |
| `aws_internet_gateway` | Internet Gateway |
| `aws_nat_gateway` | NAT Gateway |
| `aws_route_table` | Route Table |
| `aws_lb` | Load Balancer (ALB/NLB) |
| `aws_lb_target_group` | Target Group |
| `aws_lb_listener` | Load Balancer Listener |
| `aws_eip` | Elastic IP |
| `aws_vpc_endpoint` | VPC Endpoint |

#### Storage
| Type | Description |
|------|-------------|
| `aws_s3_bucket` | S3 Bucket |
| `aws_ebs_volume` | EBS Volume |
| `aws_efs_file_system` | EFS File System |
| `aws_dynamodb_table` | DynamoDB Table |

#### Database
| Type | Description |
|------|-------------|
| `aws_db_instance` | RDS Database Instance |
| `aws_rds_cluster` | RDS Aurora Cluster |
| `aws_elasticache_cluster` | ElastiCache Cluster |
| `aws_redshift_cluster` | Redshift Cluster |

#### Security & Identity
| Type | Description |
|------|-------------|
| `aws_iam_role` | IAM Role |
| `aws_iam_policy` | IAM Policy |
| `aws_iam_user` | IAM User |
| `aws_kms_key` | KMS Key |
| `aws_secretsmanager_secret` | Secrets Manager Secret |

#### Messaging
| Type | Description |
|------|-------------|
| `aws_sqs_queue` | SQS Queue |
| `aws_sns_topic` | SNS Topic |
| `aws_kinesis_stream` | Kinesis Stream |

#### Monitoring
| Type | Description |
|------|-------------|
| `aws_cloudwatch_log_group` | CloudWatch Log Group |
| `aws_cloudwatch_metric_alarm` | CloudWatch Alarm |

### Azure Resources

| Type | Description |
|------|-------------|
| `azurerm_virtual_network` | Virtual Network |
| `azurerm_subnet` | Subnet |
| `azurerm_network_security_group` | Network Security Group |
| `azurerm_virtual_machine` | Virtual Machine |
| `azurerm_storage_account` | Storage Account |
| `azurerm_sql_database` | SQL Database |
| `azurerm_kubernetes_cluster` | AKS Cluster |
| `azurerm_function_app` | Function App |
| `azurerm_app_service` | App Service |
| `azurerm_load_balancer` | Load Balancer |

### GCP Resources

| Type | Description |
|------|-------------|
| `google_compute_network` | VPC Network |
| `google_compute_subnetwork` | Subnetwork |
| `google_compute_firewall` | Firewall Rule |
| `google_compute_instance` | Compute Instance |
| `google_storage_bucket` | Cloud Storage Bucket |
| `google_sql_database_instance` | Cloud SQL Instance |
| `google_container_cluster` | GKE Cluster |
| `google_cloudfunctions_function` | Cloud Function |
| `google_pubsub_topic` | Pub/Sub Topic |

---

## Complete Examples

### Example 1: Basic AWS Web Application

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Basic Web App",
    "description": "Simple web application with VPC, EC2, and RDS",
    "cloud_provider": "aws",
    "author": "CloudForge User"
  },
  "resources": [
    {
      "id": "vpc-main",
      "type": "aws_vpc",
      "name": "Main VPC",
      "properties": {
        "cidr_block": "10.0.0.0/16",
        "enable_dns_hostnames": true,
        "enable_dns_support": true
      }
    },
    {
      "id": "subnet-public",
      "type": "aws_subnet",
      "name": "Public Subnet",
      "parent": "vpc-main",
      "properties": {
        "cidr_block": "10.0.1.0/24",
        "availability_zone": "us-east-1a",
        "map_public_ip_on_launch": true
      }
    },
    {
      "id": "subnet-private",
      "type": "aws_subnet",
      "name": "Private Subnet",
      "parent": "vpc-main",
      "properties": {
        "cidr_block": "10.0.2.0/24",
        "availability_zone": "us-east-1a",
        "map_public_ip_on_launch": false
      }
    },
    {
      "id": "sg-web",
      "type": "aws_security_group",
      "name": "Web Security Group",
      "parent": "vpc-main",
      "properties": {
        "description": "Allow HTTP and HTTPS traffic",
        "ingress": [
          {
            "from_port": 80,
            "to_port": 80,
            "protocol": "tcp",
            "cidr_blocks": ["0.0.0.0/0"]
          },
          {
            "from_port": 443,
            "to_port": 443,
            "protocol": "tcp",
            "cidr_blocks": ["0.0.0.0/0"]
          }
        ]
      }
    },
    {
      "id": "igw-main",
      "type": "aws_internet_gateway",
      "name": "Internet Gateway",
      "parent": "vpc-main",
      "properties": {}
    },
    {
      "id": "ec2-web",
      "type": "aws_instance",
      "name": "Web Server",
      "parent": "subnet-public",
      "properties": {
        "ami": "ami-0c55b159cbfafe1f0",
        "instance_type": "t3.medium",
        "associate_public_ip_address": true
      }
    },
    {
      "id": "rds-main",
      "type": "aws_db_instance",
      "name": "Database",
      "parent": "subnet-private",
      "properties": {
        "engine": "mysql",
        "engine_version": "8.0",
        "instance_class": "db.t3.medium",
        "allocated_storage": 20,
        "storage_type": "gp2",
        "db_name": "webapp",
        "username": "admin",
        "skip_final_snapshot": true
      }
    }
  ],
  "connections": [
    {
      "from": "ec2-web",
      "to": "sg-web"
    },
    {
      "from": "ec2-web",
      "to": "rds-main"
    }
  ]
}
```

### Example 2: Serverless Architecture

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Serverless API",
    "description": "Serverless API with Lambda, API Gateway, and DynamoDB",
    "cloud_provider": "aws"
  },
  "resources": [
    {
      "id": "api-gateway",
      "type": "aws_api_gateway_rest_api",
      "name": "REST API",
      "properties": {
        "description": "Main API Gateway"
      }
    },
    {
      "id": "lambda-api",
      "type": "aws_lambda_function",
      "name": "API Handler",
      "properties": {
        "runtime": "nodejs18.x",
        "handler": "index.handler",
        "memory_size": 256,
        "timeout": 30
      }
    },
    {
      "id": "dynamodb-table",
      "type": "aws_dynamodb_table",
      "name": "Data Table",
      "properties": {
        "billing_mode": "PAY_PER_REQUEST",
        "hash_key": "id",
        "attribute": [
          {
            "name": "id",
            "type": "S"
          }
        ]
      }
    },
    {
      "id": "s3-assets",
      "type": "aws_s3_bucket",
      "name": "Static Assets",
      "properties": {
        "bucket": "my-app-assets"
      }
    },
    {
      "id": "cloudfront",
      "type": "aws_cloudfront_distribution",
      "name": "CDN",
      "properties": {
        "enabled": true
      }
    }
  ],
  "connections": [
    {
      "from": "api-gateway",
      "to": "lambda-api"
    },
    {
      "from": "lambda-api",
      "to": "dynamodb-table"
    },
    {
      "from": "cloudfront",
      "to": "s3-assets"
    }
  ]
}
```

### Example 3: Microservices with EKS

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Microservices Platform",
    "description": "Kubernetes-based microservices architecture",
    "cloud_provider": "aws"
  },
  "resources": [
    {
      "id": "vpc-main",
      "type": "aws_vpc",
      "name": "EKS VPC",
      "properties": {
        "cidr_block": "10.0.0.0/16"
      }
    },
    {
      "id": "eks-cluster",
      "type": "aws_eks_cluster",
      "name": "Production Cluster",
      "parent": "vpc-main",
      "properties": {
        "version": "1.28"
      }
    },
    {
      "id": "eks-nodegroup",
      "type": "aws_eks_node_group",
      "name": "Worker Nodes",
      "parent": "eks-cluster",
      "properties": {
        "instance_types": ["t3.large"],
        "scaling_config": {
          "desired_size": 3,
          "max_size": 5,
          "min_size": 2
        }
      }
    },
    {
      "id": "ecr-repo",
      "type": "aws_ecr_repository",
      "name": "Container Registry",
      "properties": {
        "name": "microservices"
      }
    },
    {
      "id": "alb",
      "type": "aws_lb",
      "name": "Application LB",
      "parent": "vpc-main",
      "properties": {
        "load_balancer_type": "application"
      }
    },
    {
      "id": "rds-postgres",
      "type": "aws_db_instance",
      "name": "PostgreSQL",
      "parent": "vpc-main",
      "properties": {
        "engine": "postgres",
        "instance_class": "db.t3.medium"
      }
    },
    {
      "id": "elasticache",
      "type": "aws_elasticache_cluster",
      "name": "Redis Cache",
      "parent": "vpc-main",
      "properties": {
        "engine": "redis",
        "node_type": "cache.t3.micro"
      }
    }
  ],
  "connections": [
    {
      "from": "alb",
      "to": "eks-cluster"
    },
    {
      "from": "eks-cluster",
      "to": "rds-postgres"
    },
    {
      "from": "eks-cluster",
      "to": "elasticache"
    },
    {
      "from": "eks-cluster",
      "to": "ecr-repo"
    }
  ]
}
```

---

## Validation Rules

1. **Unique IDs**: All resource IDs must be unique within the architecture
2. **Valid Types**: Resource types must be valid Terraform resource types for the specified cloud provider
3. **Valid References**: Connection `from` and `to` must reference existing resource IDs
4. **Parent References**: If `parent` is specified, it must reference an existing container resource (VPC, Subnet)
5. **Required Properties**: Some resources have required properties (e.g., `cidr_block` for VPC)

## Import Process

When you import an architecture JSON:

1. **Validation**: CloudForge validates the JSON structure and references
2. **Resource Creation**: Each resource is created as a node on the canvas
3. **Positioning**: Resources are positioned based on `position` or auto-layout
4. **Nesting**: Resources with `parent` are nested inside their parent containers
5. **Connections**: Edges are drawn between connected resources
6. **Property Binding**: Resource properties are applied and can be edited

## Exporting

CloudForge also supports exporting your visual architecture to this same JSON format, allowing you to:
- Backup your architectures
- Share with team members
- Version control in Git
- Use as templates for new projects

---

## JSON Schema (for validation)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "metadata", "resources"],
  "properties": {
    "version": {
      "type": "string",
      "enum": ["1.0"]
    },
    "metadata": {
      "type": "object",
      "required": ["name", "cloud_provider"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "cloud_provider": { "type": "string", "enum": ["aws", "azure", "gcp"] },
        "author": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "created_at": { "type": "string", "format": "date-time" }
      }
    },
    "resources": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "name"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string" },
          "name": { "type": "string" },
          "properties": { "type": "object" },
          "position": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" }
            }
          },
          "parent": { "type": "string" }
        }
      }
    },
    "connections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["from", "to"],
        "properties": {
          "id": { "type": "string" },
          "from": { "type": "string" },
          "to": { "type": "string" },
          "label": { "type": "string" }
        }
      }
    }
  }
}
```
