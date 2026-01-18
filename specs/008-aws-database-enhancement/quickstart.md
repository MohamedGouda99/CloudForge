# Quickstart: AWS Database Schema Enhancement

**Feature**: 008-aws-database-enhancement
**Date**: 2026-01-17

## Prerequisites

- Node.js and npm installed
- Access to `frontend/` directory
- Understanding of TypeScript interfaces
- Terraform Registry documentation for reference

## Target File

```
frontend/src/lib/aws/databaseServicesData.ts
```

## Implementation Steps

### Step 1: Add New Icon Mappings

Add to `DATABASE_ICONS` object (around line 30):

```typescript
'aws_db_option_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
'aws_db_proxy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS-Proxy_64.svg',
```

### Step 2: Add aws_db_option_group Service

Insert new service definition in `DATABASE_SERVICES` array:

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

### Step 3: Add aws_db_proxy Service

Insert new service definition (see research.md for complete schema).

### Step 4: Enhance aws_db_instance

Add timeouts block to existing aws_db_instance definition:

```typescript
blocks: [
  // ... existing blocks ...
  {
    name: "timeouts",
    attributes: [
      { name: "create", type: "string", description: "Create timeout", default: "40m" },
      { name: "update", type: "string", description: "Update timeout", default: "80m" },
      { name: "delete", type: "string", description: "Delete timeout", default: "60m" }
    ]
  }
]
```

Add new outputs:

```typescript
outputs: [
  // ... existing outputs ...
  { name: "resource_id", type: "string", description: "RDS Resource ID" },
  { name: "status", type: "string", description: "Instance status" },
  { name: "availability_zone", type: "string", description: "Availability zone" },
  { name: "hosted_zone_id", type: "string", description: "Route 53 Hosted Zone ID" },
  { name: "engine_version_actual", type: "string", description: "Running engine version" }
]
```

### Step 5: Enhance aws_rds_cluster

Update serverlessv2_scaling_configuration:

```typescript
{
  name: "serverlessv2_scaling_configuration",
  attributes: [
    { name: "max_capacity", type: "number", required: true, description: "Maximum ACUs (0.5-128)" },
    { name: "min_capacity", type: "number", required: true, description: "Minimum ACUs (0-128, 0 enables auto-pause)" },
    { name: "seconds_until_auto_pause", type: "number", description: "Seconds before auto-pause (300-86400)" }
  ]
}
```

### Step 6: Enhance aws_dynamodb_table

Add replica, import_table, and on_demand_throughput blocks (see research.md).

### Step 7: Enhance aws_elasticache_replication_group

Add log_delivery_configuration block and new outputs.

### Step 8: Add Timeouts to All Services

Add timeouts blocks to remaining services per research.md timeout values.

### Step 9: Update File Header

Update the service count in the file header comment:

```typescript
/**
 * AWS Database Services Data - Complete definitions from database.json
 * This file contains ALL 21 database services with ALL their properties
 * ...
 */
```

## Verification

### TypeScript Check

```bash
cd frontend
npx tsc --noEmit
```

Expected: No errors

### Docker Rebuild

```bash
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose down && docker compose up -d --build"
```

### Manual Testing

1. Open http://localhost:3000
2. Browse Database category in Resource Palette
3. Verify DB Option Group and RDS Proxy appear
4. Place each on canvas
5. Open Inspector Panel
6. Verify all inputs/blocks/outputs display correctly

## Common Issues

### TypeScript Error: Missing 'attributes' in ServiceBlock

**Symptom**: `Property 'attributes' is missing in type`

**Fix**: Ensure all blocks have an `attributes` array, even if empty:

```typescript
{
  name: "source_selection_criteria",
  attributes: [],  // Required even if empty
  nested_blocks: [...]
}
```

### TypeScript Error: 'reference' on BlockAttribute

**Symptom**: `Property 'reference' does not exist in type 'BlockAttribute'`

**Fix**: Move reference info to description:

```typescript
// Wrong
{ name: "secret_arn", type: "string", reference: "aws_secretsmanager_secret.arn" }

// Correct
{ name: "secret_arn", type: "string", description: "Secrets Manager ARN (reference: aws_secretsmanager_secret.arn)" }
```

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/lib/aws/databaseServicesData.ts` | Add services, enhance schemas, add timeouts |

## Related Files (auto-updated)

| File | Impact |
|------|--------|
| `frontend/src/lib/aws/databaseCatalog.ts` | Derives from DATABASE_SERVICES |
| `frontend/src/lib/resources/resourceSchemas.ts` | Converts to ResourceSchema |
| `frontend/src/components/InspectorPanel.tsx` | Displays schema in property editor |
