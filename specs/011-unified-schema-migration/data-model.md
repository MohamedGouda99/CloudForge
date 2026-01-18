# Data Model: Unified Cloud Provider Schema Migration

**Feature**: 011-unified-schema-migration
**Created**: 2026-01-18

## Core Entities

### 1. ServiceDefinition

The primary entity representing a cloud resource schema. This is the unified interface that all providers must conform to.

```typescript
interface ServiceDefinition {
  /** Unique identifier within provider (e.g., "ec2_instance", "compute_instance") */
  id: string;

  /** Terraform resource type (e.g., "aws_instance", "google_compute_instance") */
  terraform_resource: string;

  /** Human-readable name (e.g., "EC2 Instance", "Compute Instance") */
  name: string;

  /** Brief description of the resource */
  description: string;

  /** Icon path for visual designer */
  icon: string;

  /** Service category for grouping */
  category: ServiceCategory;

  /** Visual classification: 'icon' (fixed size) or 'container' (can contain children) */
  classification: 'icon' | 'container';

  /** Input schema (required, optional, blocks) */
  inputs: InputSchema;

  /** Output attributes exported by the resource */
  outputs: OutputAttribute[];

  /** Terraform generation metadata */
  terraform: TerraformMetadata;

  /** Optional relationship rules for auto-wiring */
  relations?: RelationshipRules;
}
```

### 2. ServiceCategory (Enum)

Valid category values for resource classification.

```typescript
type ServiceCategory =
  | 'compute'
  | 'containers'
  | 'storage'
  | 'database'
  | 'networking'
  | 'security'
  | 'analytics'
  | 'serverless'
  | 'developer-tools'
  | 'management'
  | 'messaging'
  | 'machine-learning';
```

### 3. InputSchema

Defines all configurable inputs for a resource.

```typescript
interface InputSchema {
  /** Required arguments that must be provided */
  required: InputAttribute[];

  /** Optional arguments with defaults or user-provided values */
  optional: InputAttribute[];

  /** Nested block configurations (e.g., root_block_device, network_interface) */
  blocks?: BlockAttribute[];
}
```

### 4. InputAttribute

A single input attribute for a resource.

```typescript
interface InputAttribute {
  /** Terraform argument name */
  name: string;

  /** Data type: string, number, bool, list(string), map(string), etc. */
  type: AttributeType;

  /** Help text for UI tooltip */
  description: string;

  /** Example value for documentation */
  example?: string;

  /** Default value if not specified */
  default?: unknown;

  /** Options for enum/select types */
  options?: string[];

  /** Reference format for cross-resource linking (e.g., "aws_subnet.id") */
  reference?: string;

  /** Input validation rules */
  validation?: ValidationRule;

  /** UI grouping: 'basic' (shown by default) or 'advanced' (collapsed) */
  group?: 'basic' | 'advanced';
}
```

### 5. BlockAttribute

A nested block configuration (maps to Terraform block syntax).

```typescript
interface BlockAttribute {
  /** Block name (e.g., "root_block_device", "network_interface") */
  name: string;

  /** Help text */
  description: string;

  /** Whether this block is required */
  required: boolean;

  /** Whether multiple instances are allowed */
  multiple: boolean;

  /** Nested attributes within the block */
  attributes: InputAttribute[];
}
```

### 6. OutputAttribute

An output attribute exported by the resource after creation.

```typescript
interface OutputAttribute {
  /** Attribute name (e.g., "id", "arn", "self_link") */
  name: string;

  /** Data type */
  type: string;

  /** Description of what this value represents */
  description: string;
}
```

### 7. TerraformMetadata

Metadata used for HCL generation.

```typescript
interface TerraformMetadata {
  /** Terraform resource type (redundant but explicit) */
  resourceType: string;

  /** Required arguments for minimal valid HCL */
  requiredArgs: string[];

  /** Attributes that can be referenced by other resources */
  referenceableAttrs: Record<string, string>;
}
```

### 8. ValidationRule

Input validation constraints.

```typescript
interface ValidationRule {
  /** Regex pattern for string validation */
  pattern?: string;

  /** Minimum value for numbers */
  min?: number;

  /** Maximum value for numbers */
  max?: number;

  /** Minimum string length */
  minLength?: number;

  /** Maximum string length */
  maxLength?: number;
}
```

### 9. ResourceCatalog

Collection of resources for a provider.

```typescript
interface ResourceCatalog {
  /** Terraform provider version */
  version: string;

  /** Last update timestamp */
  lastUpdated: string;

  /** Cloud provider: 'aws', 'gcp', 'azure' */
  provider: 'aws' | 'gcp' | 'azure';

  /** Optional category filter applied */
  category?: ServiceCategory;

  /** Resource definitions */
  resources: ServiceDefinition[];
}
```

### 10. RelationshipRules (Optional)

Auto-wiring rules for visual designer containment and connections.

```typescript
interface RelationshipRules {
  /** Rules for when this resource is contained in a parent */
  containmentRules?: ContainmentRule[];

  /** Rules for edge connections */
  edgeRules?: EdgeRule[];

  /** Auto-resolution rules for required arguments */
  autoResolveRules?: AutoResolveRule[];

  /** Valid children for container resources */
  validChildren?: ValidChildRule[];
}
```

---

## Entity Relationships

```
ResourceCatalog (1) ─────contains────▶ (N) ServiceDefinition
                                              │
                                              ├── InputSchema (1)
                                              │      ├── InputAttribute (N)
                                              │      └── BlockAttribute (N)
                                              │             └── InputAttribute (N)
                                              │
                                              ├── OutputAttribute (N)
                                              │
                                              ├── TerraformMetadata (1)
                                              │
                                              └── RelationshipRules (0..1)
                                                     ├── ContainmentRule (N)
                                                     ├── EdgeRule (N)
                                                     └── ValidChildRule (N)
```

---

## Provider-Specific Naming Conventions

| Provider | Resource Prefix | Example |
|----------|-----------------|---------|
| AWS | `aws_` | `aws_instance`, `aws_vpc` |
| GCP | `google_` | `google_compute_instance`, `google_compute_network` |
| Azure | `azurerm_` | `azurerm_virtual_machine`, `azurerm_virtual_network` |

---

## Data Flow

1. **Source**: TypeScript ServiceDefinition files in `shared/resource-catalog/src/{provider}/`
2. **Build**: Compiled to JSON schemas in `shared/resource-catalog/dist/schemas/{provider}/`
3. **Load**: Backend `schema_loader.py` loads JSON at startup
4. **Serve**: Catalog API serves resources via REST endpoints
5. **Consume**: Frontend fetches via React Query and renders in designer

---

## Schema Storage Structure

```
shared/resource-catalog/
├── src/
│   ├── types.ts              # Core type definitions
│   ├── aws/
│   │   ├── index.ts
│   │   ├── icons.ts
│   │   ├── compute/
│   │   ├── networking/
│   │   └── ...
│   ├── gcp/                  # NEW
│   │   ├── index.ts
│   │   ├── icons.ts
│   │   ├── compute/
│   │   ├── networking/
│   │   └── ...
│   └── azure/                # NEW
│       ├── index.ts
│       ├── icons.ts
│       ├── compute/
│       └── ...
└── dist/
    └── schemas/
        ├── aws/
        │   ├── compute.schema.json
        │   ├── networking.schema.json
        │   └── ...
        ├── gcp/              # NEW
        │   ├── compute.schema.json
        │   └── ...
        └── azure/            # NEW
            ├── compute.schema.json
            └── ...
```

---

## Validation Rules

1. **Required Fields**: id, terraform_resource, name, description, icon, category, classification, inputs, outputs, terraform
2. **Unique Constraint**: `terraform_resource` must be unique within provider
3. **Category Validation**: Must be one of the 12 valid ServiceCategory values
4. **Classification Validation**: Must be 'icon' or 'container'
5. **Icon Path Validation**: Must start with `/cloud_icons/`
6. **Reference Format**: Must match pattern `{resource_type}.{attribute}`
