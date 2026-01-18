# Quickstart: GCP Service Schema Enhancement

**Date**: 2026-01-17
**Feature**: 010-gcp-schema-enhancement

## Overview

This guide provides step-by-step instructions for enhancing GCP service schemas in CloudForge. Each service data file follows the same pattern, making the process repeatable across all 12 categories.

## Prerequisites

- Access to Terraform Google Provider documentation: https://registry.terraform.io/providers/hashicorp/google/latest/docs
- Understanding of TypeScript interfaces in `frontend/src/lib/gcp/computeServicesData.ts`
- Knowledge of GCP services and their Terraform resource names

## Implementation Steps

### Step 1: Identify the Data File

Each GCP category has a corresponding data file:

| Category | File |
|----------|------|
| Compute | `frontend/src/lib/gcp/computeServicesData.ts` |
| Storage | `frontend/src/lib/gcp/storageServicesData.ts` |
| Database | `frontend/src/lib/gcp/databaseServicesData.ts` |
| Networking | `frontend/src/lib/gcp/networkingServicesData.ts` |
| Security | `frontend/src/lib/gcp/securityServicesData.ts` |
| Analytics | `frontend/src/lib/gcp/analyticsServicesData.ts` |
| Containers | `frontend/src/lib/gcp/containersServicesData.ts` |
| Developer Tools | `frontend/src/lib/gcp/developerToolsServicesData.ts` |
| Machine Learning | `frontend/src/lib/gcp/machineLearningServicesData.ts` |
| Management | `frontend/src/lib/gcp/managementServicesData.ts` |
| Messaging | `frontend/src/lib/gcp/messagingServicesData.ts` |
| Serverless | `frontend/src/lib/gcp/serverlessServicesData.ts` |

### Step 2: Update Icon Mapping

Ensure the icon mapping at the top of each file uses the correct category icon:

```typescript
export const GCP_[CATEGORY]_ICONS: Record<string, string> = {
  'google_[resource]': '/cloud_icons/GCP/Category Icons/[Category Name]/SVG/[Category]-512-color.svg',
  // Add all resources in the category
};
```

### Step 3: Verify/Add Each Service

For each Terraform resource in the category:

1. **Open Terraform Registry Documentation**
   - Navigate to: `https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/[resource_name]`
   - Example: `https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance`

2. **Extract Required Arguments**
   - Look for arguments marked as "Required" in the documentation
   - Add to the `inputs.required` array:
   ```typescript
   {
     name: "argument_name",
     type: "string", // or number, bool, list(string), etc.
     description: "Description from docs",
     example: "example_value"
   }
   ```

3. **Extract Optional Arguments**
   - Look for arguments marked as "Optional"
   - Add to the `inputs.optional` array:
   ```typescript
   {
     name: "argument_name",
     type: "string",
     description: "Description from docs",
     default: "default_value", // if specified
     options: ["OPTION_1", "OPTION_2"] // for enum-like fields
   }
   ```

4. **Extract Nested Blocks**
   - Look for block-type arguments (documented with sub-arguments)
   - Add to the `inputs.blocks` array:
   ```typescript
   {
     name: "block_name",
     description: "Block description",
     multiple: true, // if multiple instances allowed
     attributes: [
       { name: "attr1", type: "string", required: true },
       { name: "attr2", type: "number" }
     ],
     nested_blocks: [
       // If the block contains other blocks
     ]
   }
   ```

5. **Extract Outputs/Attributes**
   - Look for "Attributes Reference" section in docs
   - Add to the `outputs` array:
   ```typescript
   {
     name: "attribute_name",
     type: "string",
     description: "Attribute description"
   }
   ```

6. **Add Timeouts Block (if supported)**
   - Check if resource supports custom timeouts
   - Add standard timeout block:
   ```typescript
   {
     name: "timeouts",
     description: "Timeout configuration",
     attributes: [
       { name: "create", type: "string", description: "Create timeout", default: "20m" },
       { name: "update", type: "string", description: "Update timeout", default: "20m" },
       { name: "delete", type: "string", description: "Delete timeout", default: "20m" }
     ]
   }
   ```

### Step 4: Add Helper Functions

Ensure each file exports these helper functions:

```typescript
// List of all terraform resource types in this category
export const [CATEGORY]_TERRAFORM_RESOURCES = GCP_[CATEGORY]_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function get[Category]ServiceByTerraformResource(terraformResource: string): [Category]ServiceDefinition | undefined {
  return GCP_[CATEGORY]_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function get[Category]ServiceById(id: string): [Category]ServiceDefinition | undefined {
  return GCP_[CATEGORY]_SERVICES.find(s => s.id === id);
}

export function is[Category]Resource(terraformResource: string): boolean {
  return [CATEGORY]_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function get[Category]Icon(terraformResource: string): string {
  return GCP_[CATEGORY]_ICONS[terraformResource] || GCP_[CATEGORY]_ICONS['google_default'];
}
```

### Step 5: Verify TypeScript Compilation

After updating each file, verify it compiles without errors:

```bash
cd frontend
npx tsc --noEmit
```

## Common Data Types

| Terraform Type | TypeScript Type String |
|----------------|----------------------|
| string | `"string"` |
| number | `"number"` |
| bool | `"bool"` |
| list(string) | `"list(string)"` |
| list(number) | `"list(number)"` |
| map(string) | `"map(string)"` |
| set(string) | `"set(string)"` |
| object | `"object"` |
| list(object) | `"list(object)"` |

## Verification Checklist

For each service, verify:

- [ ] All required arguments are in `inputs.required`
- [ ] All optional arguments are in `inputs.optional`
- [ ] All nested blocks are in `inputs.blocks`
- [ ] Nested blocks have proper `attributes` and `nested_blocks`
- [ ] All outputs are in the `outputs` array
- [ ] Icon path is correct for the category
- [ ] Types match Terraform documentation
- [ ] Descriptions are accurate
- [ ] Default values match documentation
- [ ] Enum options match documentation values
- [ ] Timeouts block included (if resource supports it)
