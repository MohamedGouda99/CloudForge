# Data Model: AWS Database Schema Enhancement

**Feature**: 008-aws-database-enhancement
**Date**: 2026-01-17

## Entity Overview

This feature modifies TypeScript schema definitions that describe AWS database resources. No database tables are affected - this is purely frontend schema data.

## Core Interfaces

### DatabaseServiceDefinition

The primary interface for all database services (already exists in `databaseServicesData.ts`):

```typescript
interface DatabaseServiceDefinition {
  id: string;                    // Internal identifier (e.g., "rds_instance")
  name: string;                  // Display name (e.g., "RDS Database Instance")
  description: string;           // Brief description
  terraform_resource: string;    // Terraform resource type (e.g., "aws_db_instance")
  icon: string;                  // Path to icon file
  inputs: {
    required: ServiceInput[];    // Required arguments
    optional: ServiceInput[];    // Optional arguments
    blocks?: ServiceBlock[];     // Nested configuration blocks
  };
  outputs: ServiceOutput[];      // Output attributes
}
```

### ServiceInput (from computeServicesData.ts)

```typescript
interface ServiceInput {
  name: string;                  // Attribute name
  type: string;                  // Terraform type (string, number, bool, list, map)
  description: string;           // Help text
  required?: boolean;            // Is this required?
  default?: any;                 // Default value
  options?: string[];            // Valid options (for dropdowns)
  reference?: string;            // Reference to another resource (e.g., "aws_iam_role.arn")
}
```

### ServiceBlock (from computeServicesData.ts)

```typescript
interface ServiceBlock {
  name: string;                  // Block name (e.g., "timeouts")
  multiple?: boolean;            // Can have multiple instances?
  attributes: BlockAttribute[];  // Direct attributes
  nested_blocks?: ServiceBlock[]; // Nested sub-blocks
}

interface BlockAttribute {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: any;
  options?: string[];
}
```

### ServiceOutput

```typescript
interface ServiceOutput {
  name: string;                  // Output name
  type: string;                  // Output type
  description: string;           // Description
}
```

## Services to Add

### 1. aws_db_option_group

| Field | Value |
|-------|-------|
| id | "db_option_group" |
| terraform_resource | "aws_db_option_group" |
| Required inputs | engine_name, major_engine_version |
| Key blocks | option (multiple), option.option_settings |
| Outputs | id, arn, tags_all |

### 2. aws_db_proxy

| Field | Value |
|-------|-------|
| id | "db_proxy" |
| terraform_resource | "aws_db_proxy" |
| Required inputs | name, engine_family, role_arn, vpc_subnet_ids |
| Key blocks | auth (multiple), timeouts |
| Outputs | id, arn, endpoint |

## Services to Enhance

### 1. aws_db_instance

| Enhancement | Details |
|-------------|---------|
| New block | timeouts (create: 40m, update: 80m, delete: 60m) |
| New outputs | resource_id, status, availability_zone, hosted_zone_id, engine_version_actual |

### 2. aws_rds_cluster

| Enhancement | Details |
|-------------|---------|
| Enhanced block | serverlessv2_scaling_configuration + seconds_until_auto_pause |
| New outputs | cluster_resource_id, hosted_zone_id, cluster_members |
| New block | timeouts (create: 120m, update: 120m, delete: 120m) |

### 3. aws_dynamodb_table

| Enhancement | Details |
|-------------|---------|
| New blocks | replica, import_table, on_demand_throughput |
| New outputs | stream_label, tags_all |
| New block | timeouts (create: 30m, update: 60m, delete: 10m) |

### 4. aws_elasticache_replication_group

| Enhancement | Details |
|-------------|---------|
| New block | log_delivery_configuration (multiple, max 2) |
| New outputs | member_clusters, engine_version_actual, cluster_enabled |

### 5. aws_rds_cluster_instance

| Enhancement | Details |
|-------------|---------|
| New block | timeouts (create: 90m, update: 90m, delete: 90m) |

### 6. Other Services (timeouts only)

| Service | Create | Update | Delete |
|---------|--------|--------|--------|
| aws_elasticache_cluster | 40m | 80m | 40m |
| aws_redshift_cluster | 75m | 75m | 40m |
| aws_docdb_cluster | 120m | 120m | 120m |
| aws_neptune_cluster | 120m | 120m | 120m |
| aws_memorydb_cluster | 120m | 120m | 120m |

## Icon Mappings

New entries for DATABASE_ICONS:

```typescript
'aws_db_option_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
'aws_db_proxy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS-Proxy_64.svg',
```

## Relationships

```
DatabaseServiceDefinition
├── inputs
│   ├── required: ServiceInput[]
│   ├── optional: ServiceInput[]
│   └── blocks: ServiceBlock[]
│       └── attributes: BlockAttribute[]
│       └── nested_blocks: ServiceBlock[] (recursive)
└── outputs: ServiceOutput[]
```

## Validation Rules

1. **terraform_resource** must be unique across all services
2. **id** must be unique and use snake_case
3. **icon** path must exist in the cloud_icons directory
4. All **required** inputs must have non-empty descriptions
5. **blocks** with `multiple: true` allow array configurations
6. **reference** values must follow format: `resource_type.attribute`

## State Transitions

Not applicable - schema definitions are static data with no state transitions.

## File Changes Summary

| File | Action | Count |
|------|--------|-------|
| databaseServicesData.ts | Add services | 2 |
| databaseServicesData.ts | Enhance services | 6 |
| databaseServicesData.ts | Add timeouts | 10 |
| databaseServicesData.ts | Update header | 1 |
| DATABASE_ICONS | Add mappings | 2 |
