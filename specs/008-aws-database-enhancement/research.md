# Research: AWS Database Schema Enhancement

**Feature**: 008-aws-database-enhancement
**Date**: 2026-01-17
**Sources**: Terraform Registry, terraform-aws-modules, AWS documentation

## Research Tasks

### 1. aws_db_instance Missing Attributes

**Decision**: Add timeouts block, and additional outputs (resource_id, status, availability_zone, hosted_zone_id, engine_version_actual)

**Rationale**: The Terraform Registry shows these as standard attributes. The hosted_zone_id is essential for Route 53 integration. The resource_id is the DBI resource identifier.

**Terraform Registry Data**:

#### Timeouts Block
```typescript
{
  name: "timeouts",
  attributes: [
    { name: "create", type: "string", description: "Timeout for create operations", default: "40m" },
    { name: "update", type: "string", description: "Timeout for update operations", default: "80m" },
    { name: "delete", type: "string", description: "Timeout for delete operations", default: "60m" }
  ]
}
```

#### Additional Outputs
- `resource_id` (string) - The RDS Resource ID of this instance
- `status` (string) - The RDS instance status
- `availability_zone` (string) - The availability zone of the instance
- `hosted_zone_id` (string) - The canonical hosted zone ID for Route 53 Alias records
- `engine_version_actual` (string) - The running version of the database

**Alternatives Considered**: None - these are standard Terraform attributes

---

### 2. aws_db_option_group Schema

**Decision**: Add new service with complete schema per Terraform Registry

**Rationale**: Listed in file header but not implemented. Required for Oracle/SQL Server features (TDE, APEX, etc.)

**Terraform Registry Data**:

```typescript
{
  id: "db_option_group",
  name: "DB Option Group",
  description: "Database options for RDS (Oracle/SQL Server features)",
  terraform_resource: "aws_db_option_group",
  icon: DATABASE_ICONS['aws_db_option_group'],
  inputs: {
    required: [
      { name: "engine_name", type: "string", description: "Database engine (e.g., oracle-ee, sqlserver-ee)" },
      { name: "major_engine_version", type: "string", description: "Major engine version (e.g., 19, 15.00)" }
    ],
    optional: [
      { name: "name", type: "string", description: "Option group name" },
      { name: "name_prefix", type: "string", description: "Option group name prefix" },
      { name: "option_group_description", type: "string", description: "Description", default: "Managed by Terraform" },
      { name: "skip_destroy", type: "bool", description: "Skip destruction on delete" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ],
    blocks: [
      {
        name: "option",
        multiple: true,
        attributes: [
          { name: "option_name", type: "string", required: true, description: "Option name (e.g., APEX, TDE)" },
          { name: "version", type: "string", description: "Option version" },
          { name: "port", type: "number", description: "Port for the option" },
          { name: "db_security_group_memberships", type: "set(string)", description: "DB security groups" },
          { name: "vpc_security_group_memberships", type: "set(string)", description: "VPC security groups" }
        ],
        nested_blocks: [
          {
            name: "option_settings",
            multiple: true,
            attributes: [
              { name: "name", type: "string", required: true, description: "Setting name" },
              { name: "value", type: "string", required: true, description: "Setting value" }
            ]
          }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Option group name" },
    { name: "arn", type: "string", description: "Option group ARN" },
    { name: "tags_all", type: "map(string)", description: "All tags" }
  ]
}
```

---

### 3. aws_db_proxy Schema

**Decision**: Add new service with complete schema per Terraform Registry

**Rationale**: Listed in file header but not implemented. Essential for serverless connection pooling.

**Terraform Registry Data**:

```typescript
{
  id: "db_proxy",
  name: "RDS Proxy",
  description: "RDS Proxy for connection pooling and failover",
  terraform_resource: "aws_db_proxy",
  icon: DATABASE_ICONS['aws_db_proxy'],
  inputs: {
    required: [
      { name: "name", type: "string", description: "Proxy name" },
      { name: "engine_family", type: "string", description: "Engine family", options: ["MYSQL", "POSTGRESQL", "SQLSERVER"] },
      { name: "role_arn", type: "string", description: "IAM role ARN for Secrets Manager access", reference: "aws_iam_role.arn" },
      { name: "vpc_subnet_ids", type: "set(string)", description: "Subnet IDs", reference: "aws_subnet.id" }
    ],
    optional: [
      { name: "debug_logging", type: "bool", description: "Enable debug logging" },
      { name: "idle_client_timeout", type: "number", description: "Idle client timeout in seconds", default: 1800 },
      { name: "require_tls", type: "bool", description: "Require TLS connections" },
      { name: "vpc_security_group_ids", type: "set(string)", description: "Security group IDs" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ],
    blocks: [
      {
        name: "auth",
        multiple: true,
        attributes: [
          { name: "auth_scheme", type: "string", description: "Auth scheme", options: ["SECRETS"] },
          { name: "client_password_auth_type", type: "string", description: "Password auth type", options: ["MYSQL_NATIVE_PASSWORD", "POSTGRES_SCRAM_SHA_256", "POSTGRES_MD5", "SQL_SERVER_AUTHENTICATION"] },
          { name: "description", type: "string", description: "Auth description" },
          { name: "iam_auth", type: "string", description: "IAM auth", options: ["DISABLED", "REQUIRED", "OPTIONAL"] },
          { name: "secret_arn", type: "string", required: true, description: "Secrets Manager secret ARN" },
          { name: "username", type: "string", description: "Database username" }
        ]
      },
      {
        name: "timeouts",
        attributes: [
          { name: "create", type: "string", description: "Create timeout", default: "30m" },
          { name: "update", type: "string", description: "Update timeout", default: "30m" },
          { name: "delete", type: "string", description: "Delete timeout", default: "60m" }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Proxy identifier" },
    { name: "arn", type: "string", description: "Proxy ARN" },
    { name: "endpoint", type: "string", description: "Proxy endpoint" }
  ]
}
```

---

### 4. aws_rds_cluster serverlessv2_scaling_configuration Enhancement

**Decision**: Add seconds_until_auto_pause parameter to existing block

**Rationale**: Aurora Serverless v2 supports auto-pause with this parameter (300-86400 seconds)

**Enhancement**:
```typescript
{
  name: "serverlessv2_scaling_configuration",
  attributes: [
    { name: "max_capacity", type: "number", required: true, description: "Maximum ACUs (0.5-128)" },
    { name: "min_capacity", type: "number", required: true, description: "Minimum ACUs (0-128, 0 enables auto-pause)" },
    { name: "seconds_until_auto_pause", type: "number", description: "Seconds before auto-pause (300-86400, requires min_capacity=0)" }
  ]
}
```

**Additional Outputs for aws_rds_cluster**:
- `cluster_resource_id` (string) - The RDS Cluster Resource ID
- `hosted_zone_id` (string) - Route 53 Hosted Zone ID
- `cluster_members` (set(string)) - List of cluster member identifiers

---

### 5. aws_dynamodb_table Enhancements

**Decision**: Add replica block, import_table block, on_demand_throughput block

**Rationale**: V2 global tables use replica blocks. Import table enables initial data loading.

**New Blocks**:

```typescript
// replica block (for Global Tables V2)
{
  name: "replica",
  multiple: true,
  attributes: [
    { name: "region_name", type: "string", required: true, description: "Replica region" },
    { name: "kms_key_arn", type: "string", description: "KMS key for replica" },
    { name: "point_in_time_recovery", type: "bool", description: "Enable PITR for replica" },
    { name: "propagate_tags", type: "bool", description: "Propagate tags to replica" }
  ]
}

// import_table block
{
  name: "import_table",
  attributes: [
    { name: "input_compression_type", type: "string", description: "Compression type", options: ["GZIP", "ZSTD", "NONE"] },
    { name: "input_format", type: "string", required: true, description: "Input format", options: ["CSV", "DYNAMODB_JSON", "ION"] }
  ],
  nested_blocks: [
    {
      name: "s3_bucket_source",
      attributes: [
        { name: "bucket", type: "string", required: true, description: "S3 bucket name" },
        { name: "bucket_owner", type: "string", description: "Bucket owner account ID" },
        { name: "key_prefix", type: "string", description: "S3 key prefix" }
      ]
    },
    {
      name: "input_format_options",
      attributes: [],
      nested_blocks: [
        {
          name: "csv",
          attributes: [
            { name: "delimiter", type: "string", description: "CSV delimiter" },
            { name: "header_list", type: "list(string)", description: "CSV headers" }
          ]
        }
      ]
    }
  ]
}

// on_demand_throughput block
{
  name: "on_demand_throughput",
  attributes: [
    { name: "max_read_request_units", type: "number", description: "Max read request units" },
    { name: "max_write_request_units", type: "number", description: "Max write request units" }
  ]
}
```

**Additional Outputs**:
- `stream_label` (string) - Timestamp of latest stream record
- `tags_all` (map(string)) - All tags including provider defaults

---

### 6. aws_elasticache_replication_group Enhancements

**Decision**: Add log_delivery_configuration block and additional outputs

**Rationale**: Log delivery to CloudWatch/Kinesis is essential for monitoring. Member clusters output needed for operational visibility.

**New Block**:
```typescript
{
  name: "log_delivery_configuration",
  multiple: true,  // max 2 blocks
  attributes: [
    { name: "destination", type: "string", required: true, description: "CloudWatch LogGroup or Kinesis Firehose name" },
    { name: "destination_type", type: "string", required: true, description: "Destination type", options: ["cloudwatch-logs", "kinesis-firehose"] },
    { name: "log_format", type: "string", description: "Log format", options: ["json", "text"] },
    { name: "log_type", type: "string", required: true, description: "Log type", options: ["slow-log", "engine-log"] }
  ]
}
```

**Additional Outputs**:
- `member_clusters` (set(string)) - IDs of all cluster members
- `engine_version_actual` (string) - Running engine version
- `cluster_enabled` (bool) - Whether cluster mode is enabled

---

### 7. Database Service Timeouts (All Services)

**Decision**: Add timeouts blocks to all services that support them

**Rationale**: Database operations are long-running. Default Terraform timeouts may be insufficient.

| Service | Create | Update | Delete |
|---------|--------|--------|--------|
| aws_db_instance | 40m | 80m | 60m |
| aws_rds_cluster | 120m | 120m | 120m |
| aws_rds_cluster_instance | 90m | 90m | 90m |
| aws_dynamodb_table | 30m | 60m | 10m |
| aws_elasticache_cluster | 40m | 80m | 40m |
| aws_elasticache_replication_group | 60m | 40m | 40m |
| aws_redshift_cluster | 75m | 75m | 40m |
| aws_docdb_cluster | 120m | 120m | 120m |
| aws_neptune_cluster | 120m | 120m | 120m |
| aws_memorydb_cluster | 120m | 120m | 120m |

---

## Summary of Changes

| Category | Count | Details |
|----------|-------|---------|
| New Services | 2 | aws_db_option_group, aws_db_proxy |
| Enhanced Services | 6 | aws_db_instance, aws_rds_cluster, aws_dynamodb_table, aws_elasticache_replication_group, aws_rds_cluster_instance |
| Timeouts Added | 10 | All major database services |
| New Outputs | 15+ | resource_id, hosted_zone_id, member_clusters, etc. |
| New Blocks | 6 | timeouts, replica, import_table, on_demand_throughput, log_delivery_configuration, auth |

## Sources

- [Terraform aws_db_instance](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_instance)
- [Terraform aws_db_option_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_option_group)
- [Terraform aws_db_proxy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_proxy)
- [Terraform aws_rds_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster)
- [Terraform aws_dynamodb_table](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table)
- [Terraform aws_elasticache_replication_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/elasticache_replication_group)
- [terraform-aws-modules/terraform-aws-rds](https://github.com/terraform-aws-modules/terraform-aws-rds)
- [AWS ElastiCache Best Practices (2025)](https://aws.amazon.com/blogs/database/managing-amazon-elasticache-with-terraform/)
