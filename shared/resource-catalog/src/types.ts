/**
 * Unified Resource Catalog Type Definitions
 *
 * This module defines the core types for the CloudForge resource catalog.
 * All resource definitions conform to these interfaces for consistency
 * across frontend, backend TypeScript, and backend Python (via JSON).
 */

// ============================================================================
// Service Categories
// ============================================================================

export type ServiceCategory =
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

// ============================================================================
// Attribute Types (Terraform-compatible)
// ============================================================================

export type AttributeType =
  | 'string'
  | 'number'
  | 'bool'
  | 'object'
  | 'list(string)'
  | 'list(number)'
  | 'map(string)'
  | 'set(string)';

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
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

// ============================================================================
// Input Attributes
// ============================================================================

export interface InputAttribute {
  /** Terraform argument name */
  name: string;
  /** Data type */
  type: AttributeType;
  /** Help text for UI */
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
  /** UI grouping for inspector panel */
  group?: 'basic' | 'advanced' | 'security' | 'networking';
  /** Whether this field contains sensitive data */
  sensitive?: boolean;
}

// ============================================================================
// Block Attributes (nested structures)
// ============================================================================

export interface BlockAttribute {
  /** Block name (e.g., "root_block_device") */
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

// ============================================================================
// Input Schema
// ============================================================================

export interface InputSchema {
  /** Required arguments */
  required: InputAttribute[];
  /** Optional arguments */
  optional: InputAttribute[];
  /** Nested block configurations */
  blocks?: BlockAttribute[];
}

// ============================================================================
// Output Attributes
// ============================================================================

export interface OutputAttribute {
  /** Attribute name (e.g., "id", "arn") */
  name: string;
  /** Data type */
  type: string;
  /** Description of what this value represents */
  description: string;
}

// ============================================================================
// Terraform Metadata
// ============================================================================

export interface TerraformMetadata {
  /** Terraform resource type (e.g., "aws_instance") */
  resourceType: string;
  /** Required arguments for minimal valid HCL */
  requiredArgs: string[];
  /** Attributes that can be referenced by other resources */
  referenceableAttrs: Record<string, string>;
}

// ============================================================================
// Relationship Rules
// ============================================================================

export interface AttributeMapping {
  /** Set a specific argument */
  setArg?: string;
  /** Push to a list argument */
  pushToListArg?: string;
  /** Reference parent attribute */
  toParentAttr?: string;
  /** Reference target attribute */
  toTargetAttr?: string;
}

export interface ContainmentRule {
  /** Parent resource type that triggers this rule */
  whenParentResourceType: string;
  /** Attribute mappings to apply */
  apply: AttributeMapping[];
}

export type EdgeKind = 'connect' | 'attach' | 'associate' | 'route';

export interface AssociationResource {
  createAssociationResource: {
    type: string;
    nameTemplate: string;
    args: Record<string, string>;
  };
}

export interface EdgeRule {
  /** Edge type that triggers this rule */
  whenEdgeKind: EdgeKind;
  /** Edge direction */
  direction: 'inbound' | 'outbound';
  /** Target resource type */
  toResourceType: string;
  /** Actions to apply */
  apply: AttributeMapping[] | AssociationResource;
}

export type SearchStrategyType = 'containment_ancestors' | 'connected_edges';

export interface SearchStrategy {
  type: SearchStrategyType;
  edgeKind?: EdgeKind;
}

export interface AutoResolveRule {
  /** Required argument to auto-resolve */
  requiredArg: string;
  /** Resource types that can satisfy this requirement */
  acceptsResourceTypes: string[];
  /** Search strategies to find a match */
  search: SearchStrategy[];
  /** Action when no match is found */
  onMissing: {
    level: 'error' | 'warning';
    message: string;
    fixHint?: string;
  };
}

/**
 * Valid child rule for containers to define what children they can accept.
 * Used for visual containment validation in the canvas.
 */
export interface ValidChildRule {
  /** Terraform resource types that can be children of this container */
  childTypes: string[];
  /** Maximum number of children (optional) */
  maxChildren?: number;
  /** Description for validation messages */
  description?: string;
}

export interface RelationshipRules {
  /** Rules for when this resource is contained in a parent (auto-wiring) */
  containmentRules?: ContainmentRule[];
  /** Rules for edge connections */
  edgeRules?: EdgeRule[];
  /** Auto-resolution rules for required arguments */
  autoResolveRules?: AutoResolveRule[];
  /** Valid children for container resources (visual containment) */
  validChildren?: ValidChildRule[];
}

// ============================================================================
// Service Definition (Main Type)
// ============================================================================

export interface ServiceDefinition {
  /** Unique identifier (e.g., "ec2_instance") */
  id: string;
  /** Terraform resource type (e.g., "aws_instance") */
  terraform_resource: string;
  /** Human-readable name (e.g., "EC2 Instance") */
  name: string;
  /** Brief description */
  description: string;
  /** Icon path for visual designer */
  icon: string;
  /** Service category for grouping */
  category: ServiceCategory;
  /** Visual classification: icon (fixed size) or container (can contain children) */
  classification: 'icon' | 'container';
  /** Input schema (required, optional, blocks) */
  inputs: InputSchema;
  /** Output attributes */
  outputs: OutputAttribute[];
  /** Terraform generation metadata */
  terraform: TerraformMetadata;
  /** Relationship rules for connections and containment */
  relations?: RelationshipRules;
}

// ============================================================================
// Catalog Types
// ============================================================================

export interface ResourceCatalog {
  /** Terraform provider version */
  version: string;
  /** Last update timestamp */
  lastUpdated: string;
  /** Cloud provider */
  provider: 'aws' | 'azure' | 'gcp';
  /** Optional category filter */
  category?: ServiceCategory;
  /** Resource definitions */
  resources: ServiceDefinition[];
}
