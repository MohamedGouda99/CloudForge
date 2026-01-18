# Data Model: AWS Resource Classification

**Feature**: 006-aws-resource-classification
**Date**: 2026-01-15

## Entities

### ServiceDefinition (Extended)

The core entity for resource catalog entries, extended with classification and containment fields.

```typescript
interface ServiceDefinition {
  // Identity
  id: string;                           // Unique identifier (e.g., "ec2_instance")
  terraform_resource: string;           // Terraform resource type (e.g., "aws_instance")

  // Display
  name: string;                         // Human-readable name (e.g., "EC2 Instance")
  description: string;                  // Brief description
  icon: string;                         // Path to AWS icon SVG
  category: ServiceCategory;            // Category enum

  // Classification (NEW)
  classification: 'container' | 'icon'; // Visual node type

  // Schema
  inputs: InputSchema;                  // Required/optional/block inputs
  outputs: OutputAttribute[];           // Terraform outputs
  terraform: TerraformMetadata;         // Provider version, docs URL

  // Relationships (EXTENDED)
  relations?: RelationshipRules;        // Containment and edge rules
}
```

### ServiceCategory

Enum of AWS service categories.

```typescript
type ServiceCategory =
  | 'compute'
  | 'networking'
  | 'storage'
  | 'database'
  | 'containers'
  | 'serverless'
  | 'security'
  | 'analytics'
  | 'developer-tools'
  | 'management'
  | 'messaging'
  | 'machine-learning';
```

### RelationshipRules (Extended)

Rules for containment and connections between resources.

```typescript
interface RelationshipRules {
  // Which resources can be visually nested inside this container
  containmentRules?: ContainmentRule[];

  // Which resources can connect via edges
  edgeRules?: EdgeRule[];

  // Auto-resolution for Terraform references
  autoResolveRules?: AutoResolveRule[];
}

interface ContainmentRule {
  // Terraform resource types that can be children
  childTypes: string[];

  // Maximum number of children (optional)
  maxChildren?: number;

  // Description for validation messages
  description?: string;
}

interface EdgeRule {
  // Target resource type
  targetType: string;

  // Attribute that references this resource
  sourceAttribute: string;

  // Attribute on target that receives reference
  targetAttribute: string;

  // Whether connection is required
  required: boolean;
}
```

### CatalogCacheEntry

Frontend cache structure for offline support.

```typescript
interface CatalogCacheEntry {
  // Cached data
  resources: ServiceDefinition[];
  containerTypes: Set<string>;

  // Cache metadata
  timestamp: number;           // Unix timestamp
  version: string;             // Catalog version
  isStale: boolean;            // Computed from TTL
}
```

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     ServiceDefinition                        │
├─────────────────────────────────────────────────────────────┤
│ classification: 'container' | 'icon'                        │
│ category: ServiceCategory                                    │
│ relations?: RelationshipRules                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ has
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RelationshipRules                         │
├─────────────────────────────────────────────────────────────┤
│ containmentRules?: ContainmentRule[]                        │
│ edgeRules?: EdgeRule[]                                       │
│ autoResolveRules?: AutoResolveRule[]                        │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌─────────────────┐
│  ContainmentRule  │ │   EdgeRule    │ │ AutoResolveRule │
├───────────────────┤ ├───────────────┤ ├─────────────────┤
│ childTypes: []    │ │ targetType    │ │ pattern         │
│ maxChildren?      │ │ sourceAttr    │ │ resolution      │
│ description?      │ │ targetAttr    │ │                 │
└───────────────────┘ │ required      │ └─────────────────┘
                      └───────────────┘
```

## Validation Rules

### Classification Validation

| Field | Rule |
|-------|------|
| classification | Must be exactly "container" or "icon" |
| containmentRules | Required if classification is "container" |
| containmentRules.childTypes | Must reference valid terraform_resource values |

### Containment Validation (Runtime)

| Scenario | Validation |
|----------|------------|
| Drop resource into container | Check if resource type is in container's childTypes |
| Unknown resource type | Default to icon, allow any placement with warning |
| Resource already has parent | Prevent nested containment (max 2 levels: Container → Child) |

## State Transitions

### Catalog Loading States

```
┌────────────┐    fetch    ┌─────────────┐   success   ┌────────────┐
│   IDLE     │ ──────────► │   LOADING   │ ──────────► │   READY    │
└────────────┘             └─────────────┘             └────────────┘
                                  │                          │
                                  │ error                    │ stale
                                  ▼                          ▼
                           ┌─────────────┐             ┌────────────┐
                           │    ERROR    │             │   STALE    │
                           └─────────────┘             └────────────┘
                                  │                          │
                                  │ has cache                │ refresh
                                  ▼                          ▼
                           ┌─────────────┐             ┌────────────┐
                           │   CACHED    │ ◄────────── │   READY    │
                           └─────────────┘             └────────────┘
```

### Resource Placement States

```
┌────────────┐   drag    ┌─────────────┐   drop    ┌────────────┐
│  PALETTE   │ ────────► │  DRAGGING   │ ────────► │  PLACED    │
└────────────┘           └─────────────┘           └────────────┘
                                │                        │
                                │ invalid drop           │ validate
                                ▼                        ▼
                         ┌─────────────┐          ┌────────────┐
                         │  CANCELLED  │          │  WARNING   │
                         └─────────────┘          └────────────┘
```

## Index Strategy

### Backend (SchemaLoader)

```python
# Primary indexes for O(1) lookups
_resources_by_type: Dict[str, ServiceDefinition]    # terraform_resource → definition
_resources_by_id: Dict[str, ServiceDefinition]      # id → definition
_container_types: Set[str]                          # Quick container check
_containment_map: Dict[str, List[str]]              # container → valid children
```

### Frontend (CatalogCache)

```typescript
// Indexes populated on catalog fetch
const resourceMap = new Map<string, ServiceDefinition>();      // terraform_resource → definition
const containerTypes = new Set<string>();                      // Quick container check
const containmentMap = new Map<string, string[]>();            // container → valid children
```

## Data Volume Estimates

| Entity | Count | Size |
|--------|-------|------|
| ServiceDefinition (AWS) | ~150 | ~500KB JSON |
| ContainmentRule entries | ~80 | Included above |
| Frontend cache | 1 | ~500KB localStorage |
| Backend in-memory | 1 | ~1MB Python objects |
