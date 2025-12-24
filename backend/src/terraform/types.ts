/**
 * Core type definitions for the data-driven Terraform generator
 *
 * This file contains ALL type definitions for:
 * - Diagram input model (nodes, edges, containment)
 * - Service catalog schema extensions
 * - Relationship rules (containment, edge, auto-resolve)
 * - Diagnostics and generation output
 */

// ============================================================================
// DIAGRAM INPUT MODEL
// ============================================================================

export type EdgeKind =
  | "connect"
  | "attach"
  | "associate"
  | "allow"
  | "route"
  | "trigger"
  | "peer"
  | "depends";

export interface DiagramNode {
  id: string;
  provider: "aws" | "azure" | "gcp";
  category: string;
  type: string; // maps to catalog entry terraform_resource
  name?: string;
  parentId?: string; // containment: dragged inside another node
  properties?: Record<string, any>;
  tags?: Record<string, string>;
}

export interface DiagramEdge {
  id: string;
  from: string; // node ID
  to: string; // node ID
  kind: EdgeKind;
  fromPort?: string; // optional but recommended
  toPort?: string;
  metadata?: Record<string, any>;
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// ============================================================================
// SERVICE CATALOG SCHEMA (existing structure from frontend)
// ============================================================================

export interface ServiceInput {
  name: string;
  type: string;
  description?: string;
  example?: string;
  default?: unknown;
  options?: string[];
  reference?: string;
  required?: boolean;
}

export interface BlockAttribute {
  name: string;
  type: string;
  description?: string;
  options?: string[];
  default?: unknown;
  required?: boolean;
}

export interface ServiceBlock {
  name: string;
  description?: string;
  multiple?: boolean;
  attributes: BlockAttribute[];
  nested_blocks?: ServiceBlock[];
}

export interface ServiceOutput {
  name: string;
  type: string;
  description: string;
}

// ============================================================================
// TERRAFORM METADATA (NEW - extends catalog)
// ============================================================================

export interface TerraformMetadata {
  resourceType: string; // e.g., "aws_instance"
  requiredArgs?: string[]; // e.g., ["ami", "instance_type"]
  defaultArgs?: Record<string, any>; // default values
  referenceableAttrs?: Record<string, string>; // { id: "id", arn: "arn" }
}

// ============================================================================
// RELATIONSHIP RULES (NEW - data-driven intelligence)
// ============================================================================

export type ApplyAction =
  | { setArg: string; toParentAttr: string } // child.arg = parent.attr
  | { setArg: string; toTargetAttr: string } // source.arg = target.attr
  | { setArg: string; toLiteral: any } // set to literal value
  | { pushToListArg: string; toParentAttr: string } // push parent.attr to child.listArg
  | { pushToListArg: string; toTargetAttr: string } // push target.attr to source.listArg
  | {
      createAssociationResource: {
        type: string; // terraform resource type
        nameTemplate: string; // e.g., "${source.name}_to_${target.name}"
        args: Record<string, string>; // terraform ref templates
      };
    };

export interface ContainmentRule {
  whenParentResourceType: string; // e.g., "aws_vpc"
  apply: ApplyAction[];
}

export type EdgeDirection = "outbound" | "inbound" | "bidirectional";

export interface EdgeRule {
  whenEdgeKind: EdgeKind;
  direction: EdgeDirection;
  toResourceType: string; // target resource type
  fromPort?: string; // optional port matching
  toPort?: string;
  apply: ApplyAction[] | ApplyAction;
}

export type SearchStrategy =
  | { type: "containment_ancestors" }
  | { type: "connected_edges"; edgeKind?: EdgeKind }
  | { type: "nearby_in_same_scope"; scopeResourceTypes: string[] };

export interface AutoResolveRule {
  requiredArg: string; // e.g., "subnet_id"
  acceptsResourceTypes: string[]; // e.g., ["aws_subnet"]
  targetAttribute?: string; // default is "id"
  search: SearchStrategy[];
  onMissing: {
    level: "error" | "warn";
    message: string;
    fixHint?: string;
  };
}

export interface RelationshipRules {
  containmentRules?: ContainmentRule[];
  edgeRules?: EdgeRule[];
  autoResolveRules?: AutoResolveRule[];
}

// ============================================================================
// EXTENDED SERVICE DEFINITION (combines existing + new)
// ============================================================================

export interface ServiceDefinition {
  // Existing fields from frontend catalog
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];

  // NEW: Terraform metadata
  terraform?: TerraformMetadata;

  // NEW: Relationship rules (data-driven intelligence)
  relations?: RelationshipRules;
}

// ============================================================================
// INTERNAL GRAPH REPRESENTATION
// ============================================================================

export interface GraphNode {
  id: string;
  diagramNode: DiagramNode;
  serviceDefinition: ServiceDefinition;
  parent?: GraphNode;
  children: GraphNode[];
  inboundEdges: GraphEdge[];
  outboundEdges: GraphEdge[];
  terraformName: string; // stable HCL identifier
  resolvedArgs: Map<string, ResolvedValue>;
  associatedResources: AssociatedResource[]; // intermediate resources created by rules
}

export interface GraphEdge {
  id: string;
  diagramEdge: DiagramEdge;
  from: GraphNode;
  to: GraphNode;
  matchedRule?: EdgeRule;
}

export interface ResolvedValue {
  value: any;
  source: "explicit" | "containment" | "edge" | "autoResolve" | "default";
  sourceRuleId?: string;
}

export interface AssociatedResource {
  type: string; // terraform resource type
  name: string; // HCL identifier
  args: Record<string, string>; // terraform references
  createdBy: "containment" | "edge" | "autoResolve"; // which rule created it
  sourceNodeId?: string;
  targetNodeId?: string;
}

// ============================================================================
// DIAGNOSTICS
// ============================================================================

export type DiagnosticLevel = "error" | "warn" | "info";

export interface Diagnostic {
  level: DiagnosticLevel;
  message: string;
  nodeId?: string;
  edgeId?: string;
  fieldName?: string;
  fixHint?: string;
}

// ============================================================================
// GENERATION OUTPUT
// ============================================================================

export interface TerraformOutput {
  mainTf: string; // HCL content for main.tf
  providersTf?: string; // HCL content for providers.tf (future)
  variablesTf?: string; // HCL content for variables.tf (future)
  diagnostics: Diagnostic[];
}

// ============================================================================
// RULE MATCHING
// ============================================================================

export interface RuleMatch<T> {
  rule: T;
  score: number; // for disambiguation
  matchDetails: {
    exactPortMatch?: boolean;
    edgeKindMatch?: boolean;
    exactTypeMatch?: boolean;
    categoryMatch?: boolean;
  };
}

// ============================================================================
// TEMPLATE CONTEXT (for resolving ${...} in templates)
// ============================================================================

export interface TemplateContext {
  this: GraphNode; // current resource
  parent?: GraphNode; // parent in containment tree
  target?: GraphNode; // target of edge relation
  source?: GraphNode; // source of edge relation
  allNodes: Map<string, GraphNode>; // for advanced lookups
}

// ============================================================================
// REGISTRY INTERFACE
// ============================================================================

export interface ServiceRegistry {
  registerService(service: ServiceDefinition): void;
  getService(terraformResourceType: string): ServiceDefinition | undefined;
  getServiceById(id: string): ServiceDefinition | undefined;
  getAllServices(): ServiceDefinition[];
  getServicesByProvider(provider: "aws" | "azure" | "gcp"): ServiceDefinition[];
}
