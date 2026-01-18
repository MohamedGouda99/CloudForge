# Data Model: GCP Service Schema Enhancement

**Date**: 2026-01-17
**Feature**: 010-gcp-schema-enhancement

## Entity Definitions

### ServiceDefinition

The core entity representing a GCP service in the Resource Palette.

```typescript
interface GCPServiceDefinition {
  // Unique identifier for the service (e.g., "sql_database_instance")
  id: string;

  // Display name (e.g., "Cloud SQL Instance")
  name: string;

  // Brief description of the service
  description: string;

  // Terraform resource type (e.g., "google_sql_database_instance")
  terraform_resource: string;

  // Path to the service icon
  icon: string;

  // Input configuration
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };

  // Output/computed attributes
  outputs: ServiceOutput[];
}
```

**Identity**: Uniquely identified by `terraform_resource` (primary) and `id` (secondary).

**Relationships**:
- One ServiceDefinition has many ServiceInputs (required + optional)
- One ServiceDefinition has many ServiceBlocks
- One ServiceDefinition has many ServiceOutputs

### ServiceInput

Represents an input argument for a Terraform resource.

```typescript
interface ServiceInput {
  // Argument name as in Terraform (e.g., "name", "region")
  name: string;

  // Data type (e.g., "string", "number", "bool", "list(string)", "map(string)")
  type: string;

  // Human-readable description
  description?: string;

  // Example value for the UI
  example?: string;

  // Default value if not specified
  default?: unknown;

  // Valid options for enum-like fields
  options?: string[];

  // Reference to another resource's output (e.g., "google_compute_network.id")
  reference?: string;

  // Whether the field is required (for inputs in required array, always true)
  required?: boolean;
}
```

**Validation Rules**:
- `name` must match Terraform argument name exactly
- `type` must be valid Terraform type
- `options` only present for enum-like fields
- `reference` only present for fields that reference other resources

### ServiceBlock

Represents a nested configuration block within a Terraform resource.

```typescript
interface ServiceBlock {
  // Block name as in Terraform (e.g., "settings", "node_config")
  name: string;

  // Human-readable description
  description?: string;

  // Whether multiple instances of this block are allowed
  multiple?: boolean;

  // Attributes within the block
  attributes: BlockAttribute[];

  // Nested blocks within this block (recursive structure)
  nested_blocks?: ServiceBlock[];
}
```

**Relationships**:
- One ServiceBlock has many BlockAttributes
- One ServiceBlock can have many nested ServiceBlocks (recursive)

**State Transitions**: N/A (static configuration data)

### BlockAttribute

Represents an attribute within a nested block.

```typescript
interface BlockAttribute {
  // Attribute name
  name: string;

  // Data type
  type: string;

  // Human-readable description
  description?: string;

  // Whether required within the block
  required?: boolean;

  // Default value
  default?: unknown;

  // Valid options for enum-like fields
  options?: string[];
}
```

### ServiceOutput

Represents a computed/exported attribute from a Terraform resource.

```typescript
interface ServiceOutput {
  // Output attribute name (e.g., "id", "self_link")
  name: string;

  // Data type
  type: string;

  // Human-readable description
  description: string;
}
```

## Icon Mapping Entity

```typescript
// Record mapping Terraform resource to icon path
type IconMapping = Record<string, string>;

// Example:
const GCP_COMPUTE_ICONS: IconMapping = {
  'google_compute_instance': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  'google_compute_disk': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  // ... all compute resources use the same category icon
};
```

## File Structure

Each category has its own data file with consistent exports:

```typescript
// [category]ServicesData.ts

// Icon mappings
export const GCP_[CATEGORY]_ICONS: Record<string, string>;

// Service definitions
export const GCP_[CATEGORY]_SERVICES: [Category]ServiceDefinition[];

// Terraform resource list for quick lookup
export const [CATEGORY]_TERRAFORM_RESOURCES: string[];

// Helper functions
export function get[Category]ServiceByTerraformResource(resource: string): ServiceDefinition | undefined;
export function get[Category]ServiceById(id: string): ServiceDefinition | undefined;
export function is[Category]Resource(resource: string): boolean;
export function get[Category]Icon(resource: string): string;
```

## Data Volume Estimates

| Category | Estimated Services | Attributes per Service |
|----------|-------------------|----------------------|
| Compute | 10 | 20-50 |
| Storage | 4 | 15-30 |
| Database | 12 | 30-100 |
| Networking | 18 | 10-40 |
| Security | 9 | 10-25 |
| Analytics | 7 | 20-60 |
| Containers | 5 | 40-150 |
| Developer Tools | 4 | 15-40 |
| Machine Learning | 6 | 20-50 |
| Management | 8 | 15-40 |
| Messaging | 3 | 20-60 |
| Serverless | 10 | 20-80 |

**Total**: ~96 services, ~3000+ attributes
