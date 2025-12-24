/**
 * Main entry point for the Terraform Generator
 *
 * Export everything needed by the application:
 * - Generator class
 * - Registry
 * - Type definitions
 * - Example catalog with rules
 */

// Core generator
export { TerraformGenerator, generateTerraform } from "./generate";

// Registry
export { ServiceRegistry, globalRegistry } from "./registry";

// Graph builder
export { GraphBuilder } from "./graph";

// Inference engine
export { InferenceEngine } from "./infer";

// HCL renderer
export { HCLRenderer } from "./render";

// Type definitions
export type {
  // Input types
  Diagram,
  DiagramNode,
  DiagramEdge,
  EdgeKind,

  // Service catalog types
  ServiceDefinition,
  ServiceInput,
  ServiceOutput,
  ServiceBlock,
  BlockAttribute,

  // Terraform metadata
  TerraformMetadata,

  // Relationship rules
  RelationshipRules,
  ContainmentRule,
  EdgeRule,
  AutoResolveRule,
  ApplyAction,
  EdgeDirection,
  SearchStrategy,

  // Graph types
  GraphNode,
  GraphEdge,
  AssociatedResource,
  ResolvedValue,

  // Output types
  TerraformOutput,
  Diagnostic,
  DiagnosticLevel,

  // Internal types
  RuleMatch,
  TemplateContext,
  ServiceRegistry as IServiceRegistry,
} from "./types";

// Example catalogs with rules
export { awsComputeServicesWithRules } from "./catalog/awsComputeWithRules";
