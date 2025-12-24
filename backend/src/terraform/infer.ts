/**
 * Inference Engine - Applies relationship rules to resolve Terraform arguments
 *
 * This module:
 * - Applies rules in correct order: containment > edge > autoResolve > defaults
 * - Matches edge rules with scoring for disambiguation
 * - Creates association resources when needed
 * - Handles conflicts with proper precedence
 * - Emits diagnostics for unresolved dependencies
 */

import type {
  GraphNode,
  GraphEdge,
  Diagnostic,
  ContainmentRule,
  EdgeRule,
  AutoResolveRule,
  ApplyAction,
  ResolvedValue,
  AssociatedResource,
  RuleMatch,
  EdgeKind,
  TemplateContext,
} from "./types";
import { GraphBuilder } from "./graph";

export interface InferenceResult {
  nodes: Map<string, GraphNode>;
  diagnostics: Diagnostic[];
}

export class InferenceEngine {
  private diagnostics: Diagnostic[] = [];

  constructor(private graphBuilder: GraphBuilder) {}

  infer(
    nodes: Map<string, GraphNode>,
    edges: GraphEdge[],
    existingDiagnostics: Diagnostic[]
  ): InferenceResult {
    this.diagnostics = [...existingDiagnostics];

    // Apply rules in strict order (MANDATORY)
    // 1. Containment rules
    this.applyContainmentRules(nodes);

    // 2. Explicit edge rules
    this.applyEdgeRules(edges);

    // 3. AutoResolve rules (only for missing required args)
    this.applyAutoResolveRules(nodes);

    // 4. Apply defaults
    this.applyDefaults(nodes);

    // 5. Validate all required args are present
    this.validateRequiredArgs(nodes);

    return {
      nodes,
      diagnostics: this.diagnostics,
    };
  }

  /**
   * Step 1: Apply containment rules (parent-child relationships)
   */
  private applyContainmentRules(nodes: Map<string, GraphNode>): void {
    for (const node of nodes.values()) {
      if (!node.parent) {
        continue; // skip root nodes
      }

      const rules = node.serviceDefinition.relations?.containmentRules || [];

      for (const rule of rules) {
        // Check if parent matches rule
        if (rule.whenParentResourceType !== node.parent.serviceDefinition.terraform_resource) {
          continue;
        }

        // Apply all actions in this rule
        for (const action of rule.apply) {
          this.applyAction(action, node, {
            this: node,
            parent: node.parent,
            allNodes: nodes,
          }, "containment");
        }
      }
    }
  }

  /**
   * Step 2: Apply edge rules (explicit connections)
   */
  private applyEdgeRules(edges: GraphEdge[]): void {
    for (const edge of edges) {
      const matches = this.matchEdgeRules(edge);

      if (matches.length === 0) {
        this.diagnostics.push({
          level: "error",
          message: `Unsupported connection: ${edge.from.serviceDefinition.terraform_resource} cannot connect to ${edge.to.serviceDefinition.terraform_resource} with edge kind '${edge.diagramEdge.kind}'`,
          edgeId: edge.id,
          fixHint: `Remove this edge or connect to a compatible resource type`,
        });
        continue;
      }

      if (matches.length > 1 && matches[0].score === matches[1].score) {
        this.diagnostics.push({
          level: "error",
          message: `Ambiguous edge rule match for edge ${edge.id}. Multiple rules have same score.`,
          edgeId: edge.id,
          fixHint: "Make edge rules more specific with ports or different edge kinds",
        });
        continue;
      }

      // Use best match
      const bestMatch = matches[0];
      edge.matchedRule = bestMatch.rule;

      // Apply actions based on direction
      const context = this.createEdgeContext(edge, bestMatch.rule.direction);
      const actions = Array.isArray(bestMatch.rule.apply)
        ? bestMatch.rule.apply
        : [bestMatch.rule.apply];

      for (const action of actions) {
        this.applyAction(action, context.source, context.ctx, "edge");
      }
    }
  }

  /**
   * Match edge rules with scoring for disambiguation
   */
  private matchEdgeRules(edge: GraphEdge): RuleMatch<EdgeRule>[] {
    const fromRules = edge.from.serviceDefinition.relations?.edgeRules || [];
    const matches: RuleMatch<EdgeRule>[] = [];

    for (const rule of fromRules) {
      // Check if rule matches edge
      if (rule.whenEdgeKind !== edge.diagramEdge.kind) {
        continue;
      }

      if (rule.toResourceType !== edge.to.serviceDefinition.terraform_resource) {
        continue;
      }

      // Calculate match score
      let score = 0;
      const matchDetails = {
        exactPortMatch: false,
        edgeKindMatch: true,
        exactTypeMatch: true,
        categoryMatch: false,
      };

      // Port matching (highest priority)
      if (rule.fromPort && rule.toPort) {
        if (
          edge.diagramEdge.fromPort === rule.fromPort &&
          edge.diagramEdge.toPort === rule.toPort
        ) {
          score += 1000;
          matchDetails.exactPortMatch = true;
        } else {
          continue; // rule specifies ports but they don't match - skip
        }
      }

      // Edge kind match (already checked above)
      score += 100;

      // Exact type match (already checked above)
      score += 10;

      matches.push({ rule, score, matchDetails });
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Create context for edge rule application
   */
  private createEdgeContext(
    edge: GraphEdge,
    direction: "outbound" | "inbound" | "bidirectional"
  ): { source: GraphNode; ctx: TemplateContext } {
    let source: GraphNode;
    let target: GraphNode;

    if (direction === "outbound") {
      source = edge.from;
      target = edge.to;
    } else if (direction === "inbound") {
      source = edge.to;
      target = edge.from;
    } else {
      // bidirectional - apply to both (handled by caller)
      source = edge.from;
      target = edge.to;
    }

    return {
      source,
      ctx: {
        this: source,
        target,
        source: edge.from,
        allNodes: new Map(), // filled by caller
      },
    };
  }

  /**
   * Step 3: Apply autoResolve rules (only for missing required args)
   */
  private applyAutoResolveRules(nodes: Map<string, GraphNode>): void {
    for (const node of nodes.values()) {
      const rules = node.serviceDefinition.relations?.autoResolveRules || [];

      for (const rule of rules) {
        // Skip if arg already resolved
        if (node.resolvedArgs.has(rule.requiredArg)) {
          continue;
        }

        // Try each search strategy in order
        let resolved = false;
        let resolvedCandidate: GraphNode | null = null;

        for (const strategy of rule.search) {
          const candidate = this.searchForCandidate(node, rule, strategy, nodes);

          if (candidate) {
            // Resolve the arg
            const targetAttr = rule.targetAttribute || "id";
            node.resolvedArgs.set(rule.requiredArg, {
              value: this.getTerraformRef(candidate, targetAttr),
              source: "autoResolve",
              sourceRuleId: `autoResolve:${rule.requiredArg}`,
            });
            resolved = true;
            resolvedCandidate = candidate;
            break;
          }
        }

        // Emit diagnostic based on result
        if (resolved && resolvedCandidate) {
          // Success - emit warning to inform user of auto-resolution
          this.diagnostics.push({
            level: "warn",
            message: `Auto-resolved ${rule.requiredArg} to ${resolvedCandidate.terraformName}`,
            nodeId: node.id,
            fieldName: rule.requiredArg,
            fixHint: "Draw an explicit edge to make this relationship clearer",
          });
        } else {
          // Failure - emit error
          this.diagnostics.push({
            level: rule.onMissing.level,
            message: rule.onMissing.message,
            nodeId: node.id,
            fieldName: rule.requiredArg,
            fixHint: rule.onMissing.fixHint,
          });
        }
      }
    }
  }

  /**
   * Search for candidate node using strategy
   */
  private searchForCandidate(
    node: GraphNode,
    rule: AutoResolveRule,
    strategy: any,
    nodes: Map<string, GraphNode>
  ): GraphNode | null {
    if (strategy.type === "containment_ancestors") {
      const ancestors = this.graphBuilder.getAncestors(node);
      return (
        ancestors.find((ancestor) =>
          rule.acceptsResourceTypes.includes(ancestor.serviceDefinition.terraform_resource)
        ) || null
      );
    }

    if (strategy.type === "connected_edges") {
      const edgeKind = strategy.edgeKind;
      const edges = edgeKind
        ? node.inboundEdges.filter((e) => e.diagramEdge.kind === edgeKind)
        : node.inboundEdges;

      for (const edge of edges) {
        if (rule.acceptsResourceTypes.includes(edge.from.serviceDefinition.terraform_resource)) {
          return edge.from;
        }
      }
    }

    if (strategy.type === "nearby_in_same_scope") {
      const nearby = this.graphBuilder.getNodesInSameScope(node, nodes, strategy.scopeResourceTypes);
      return (
        nearby.find((n) =>
          rule.acceptsResourceTypes.includes(n.serviceDefinition.terraform_resource)
        ) || null
      );
    }

    return null;
  }

  /**
   * Step 4: Apply default values
   */
  private applyDefaults(nodes: Map<string, GraphNode>): void {
    for (const node of nodes.values()) {
      const defaults = node.serviceDefinition.terraform?.defaultArgs || {};

      for (const [argName, defaultValue] of Object.entries(defaults)) {
        if (!node.resolvedArgs.has(argName)) {
          node.resolvedArgs.set(argName, {
            value: defaultValue,
            source: "default",
          });
        }
      }
    }
  }

  /**
   * Step 5: Validate all required args are present
   */
  private validateRequiredArgs(nodes: Map<string, GraphNode>): void {
    for (const node of nodes.values()) {
      const requiredArgs = node.serviceDefinition.terraform?.requiredArgs || [];

      for (const argName of requiredArgs) {
        const hasInResolvedArgs = node.resolvedArgs.has(argName);
        const hasInProperties = node.diagramNode.properties && argName in node.diagramNode.properties;

        if (!hasInResolvedArgs && !hasInProperties) {
          this.diagnostics.push({
            level: "error",
            message: `Missing required argument: ${argName}`,
            nodeId: node.id,
            fieldName: argName,
            fixHint: `Add ${argName} to node properties or configure a relationship rule`,
          });
        }
      }
    }
  }

  /**
   * Apply a single action to a node
   */
  private applyAction(
    action: ApplyAction,
    node: GraphNode,
    context: TemplateContext,
    source: "containment" | "edge" | "autoResolve"
  ): void {
    if ("setArg" in action && "toParentAttr" in action) {
      // setArg with parent
      const value = this.getTerraformRef(context.parent!, action.toParentAttr);
      this.setArg(node, action.setArg, value, source);
    } else if ("setArg" in action && "toTargetAttr" in action) {
      // setArg with target
      const value = this.getTerraformRef(context.target!, action.toTargetAttr);
      this.setArg(node, action.setArg, value, source);
    } else if ("setArg" in action && "toLiteral" in action) {
      // setArg with literal value
      this.setArg(node, action.setArg, action.toLiteral, source);
    } else if ("pushToListArg" in action && "toParentAttr" in action) {
      // pushToListArg with parent
      const value = this.getTerraformRef(context.parent!, action.toParentAttr);
      this.pushToListArg(node, action.pushToListArg, value, source);
    } else if ("pushToListArg" in action && "toTargetAttr" in action) {
      // pushToListArg with target
      const value = this.getTerraformRef(context.target!, action.toTargetAttr);
      this.pushToListArg(node, action.pushToListArg, value, source);
    } else if ("createAssociationResource" in action) {
      // Create intermediate resource
      this.createAssociationResource(node, action.createAssociationResource, context, source);
    }
  }

  /**
   * Set argument with conflict detection
   */
  private setArg(node: GraphNode, argName: string, value: string, source: "containment" | "edge" | "autoResolve"): void {
    const existing = node.resolvedArgs.get(argName);

    if (existing) {
      // Conflict - check precedence: explicit edge > containment > autoResolve > default
      const precedence = { edge: 3, containment: 2, autoResolve: 1, default: 0, explicit: 4 };
      const newPrecedence = precedence[source];
      const existingPrecedence = precedence[existing.source];

      if (newPrecedence < existingPrecedence) {
        // Skip - existing has higher precedence
        return;
      }

      if (newPrecedence === existingPrecedence && existing.value !== value) {
        this.diagnostics.push({
          level: "warn",
          message: `Conflicting values for ${argName}: ${existing.value} vs ${value}`,
          nodeId: node.id,
          fieldName: argName,
          fixHint: "Remove ambiguous rules or make precedence clearer",
        });
        return;
      }
    }

    node.resolvedArgs.set(argName, {
      value,
      source,
    });
  }

  /**
   * Push value to list argument
   */
  private pushToListArg(node: GraphNode, argName: string, value: string, source: "containment" | "edge" | "autoResolve"): void {
    const existing = node.resolvedArgs.get(argName);

    if (existing) {
      if (Array.isArray(existing.value)) {
        existing.value.push(value);
      } else {
        // Convert to array
        node.resolvedArgs.set(argName, {
          value: [existing.value, value],
          source,
        });
      }
    } else {
      node.resolvedArgs.set(argName, {
        value: [value],
        source,
      });
    }
  }

  /**
   * Create association resource (e.g., aws_eip_association, aws_iam_role_policy_attachment)
   */
  private createAssociationResource(
    node: GraphNode,
    config: { type: string; nameTemplate: string; args: Record<string, string> },
    context: TemplateContext,
    source: "containment" | "edge"
  ): void {
    const name = this.resolveTemplate(config.nameTemplate, context, true); // true = literalNames
    const args: Record<string, string> = {};

    for (const [argName, template] of Object.entries(config.args)) {
      args[argName] = this.resolveTemplate(template, context, false); // false = use Terraform refs
    }

    const associatedResource: AssociatedResource = {
      type: config.type,
      name,
      args,
      createdBy: source,
      sourceNodeId: context.source?.id,
      targetNodeId: context.target?.id,
    };

    node.associatedResources.push(associatedResource);
  }

  /**
   * Resolve template string with context
   * Supports: ${this.id}, ${parent.arn}, ${target.id}, etc.
   * @param template - Template string with ${...} placeholders
   * @param context - Template context with node references
   * @param literalNames - If true, ${*.name} returns literal name; if false, returns Terraform reference
   */
  private resolveTemplate(template: string, context: TemplateContext, literalNames: boolean = false): string {
    return template.replace(/\$\{(\w+)\.(\w+)\}/g, (match, ref, attr) => {
      if (ref === "this" && context.this) {
        return this.getNodeAttribute(context.this, attr, literalNames);
      }
      if (ref === "parent" && context.parent) {
        return this.getNodeAttribute(context.parent, attr, literalNames);
      }
      if (ref === "target" && context.target) {
        return this.getNodeAttribute(context.target, attr, literalNames);
      }
      if (ref === "source" && context.source) {
        return this.getNodeAttribute(context.source, attr, literalNames);
      }
      return match; // unresolved
    });
  }

  /**
   * Get node attribute - either Terraform reference or direct value
   * @param node - The graph node
   * @param attr - The attribute name
   * @param literalNames - If true, "name" returns literal; if false, returns Terraform reference
   */
  private getNodeAttribute(node: GraphNode, attr: string, literalNames: boolean = false): string {
    // Special case: "name" can be literal or reference depending on context
    if (attr === "name") {
      if (literalNames) {
        return node.terraformName; // literal name for nameTemplate
      } else {
        return this.getTerraformRef(node, attr); // Terraform ref for args
      }
    }

    // Otherwise, create a Terraform reference
    return this.getTerraformRef(node, attr);
  }

  /**
   * Get Terraform reference string for a node attribute
   * e.g., aws_vpc.main.id
   */
  private getTerraformRef(node: GraphNode, attr: string): string {
    return `${node.serviceDefinition.terraform_resource}.${node.terraformName}.${attr}`;
  }
}
