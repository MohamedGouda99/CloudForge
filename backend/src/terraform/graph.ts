/**
 * Graph Builder - Constructs internal graph from diagram input
 *
 * This module:
 * - Builds containment tree from parentId relationships
 * - Builds edge graph from drawn connections
 * - Generates stable Terraform identifiers
 * - Validates nodes against service registry
 */

import type {
  Diagram,
  DiagramNode,
  DiagramEdge,
  GraphNode,
  GraphEdge,
  ServiceDefinition,
  Diagnostic,
} from "./types";
import type { ServiceRegistry } from "./registry";

export interface GraphBuildResult {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  roots: GraphNode[]; // nodes with no parent
  diagnostics: Diagnostic[];
}

export class GraphBuilder {
  constructor(private registry: ServiceRegistry) {}

  build(diagram: Diagram): GraphBuildResult {
    const diagnostics: Diagnostic[] = [];
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    // Step 1: Create all nodes with service lookups
    for (const diagramNode of diagram.nodes) {
      const serviceDefinition = this.registry.getService(diagramNode.type);

      if (!serviceDefinition) {
        diagnostics.push({
          level: "error",
          message: `Unknown resource type: ${diagramNode.type}`,
          nodeId: diagramNode.id,
          fixHint: `Check that ${diagramNode.type} is registered in the service catalog`,
        });
        continue;
      }

      const graphNode: GraphNode = {
        id: diagramNode.id,
        diagramNode,
        serviceDefinition,
        children: [],
        inboundEdges: [],
        outboundEdges: [],
        terraformName: this.generateTerraformName(diagramNode, serviceDefinition),
        resolvedArgs: new Map(),
        associatedResources: [],
      };

      nodes.set(diagramNode.id, graphNode);
    }

    // Step 2: Build containment tree (parent-child relationships)
    const roots: GraphNode[] = [];
    for (const node of nodes.values()) {
      if (node.diagramNode.parentId) {
        const parent = nodes.get(node.diagramNode.parentId);
        if (parent) {
          node.parent = parent;
          parent.children.push(node);
        } else {
          diagnostics.push({
            level: "error",
            message: `Parent node not found: ${node.diagramNode.parentId}`,
            nodeId: node.id,
            fixHint: "Check that the parent node exists in the diagram",
          });
          roots.push(node); // treat as root if parent missing
        }
      } else {
        roots.push(node);
      }
    }

    // Step 3: Build edge graph
    for (const diagramEdge of diagram.edges) {
      const from = nodes.get(diagramEdge.from);
      const to = nodes.get(diagramEdge.to);

      if (!from) {
        diagnostics.push({
          level: "error",
          message: `Edge source node not found: ${diagramEdge.from}`,
          edgeId: diagramEdge.id,
        });
        continue;
      }

      if (!to) {
        diagnostics.push({
          level: "error",
          message: `Edge target node not found: ${diagramEdge.to}`,
          edgeId: diagramEdge.id,
        });
        continue;
      }

      const graphEdge: GraphEdge = {
        id: diagramEdge.id,
        diagramEdge,
        from,
        to,
      };

      edges.push(graphEdge);
      from.outboundEdges.push(graphEdge);
      to.inboundEdges.push(graphEdge);
    }

    return { nodes, edges, roots, diagnostics };
  }

  /**
   * Generate stable Terraform resource identifier from node
   * Priority: user-provided name > sanitized type + short ID
   */
  private generateTerraformName(node: DiagramNode, service: ServiceDefinition): string {
    if (node.name) {
      return this.sanitizeIdentifier(node.name);
    }

    // Generate from type + short ID
    const baseType = service.terraform_resource.replace(/^(aws|azurerm|google)_/, "");
    const shortId = node.id.slice(0, 8);
    return this.sanitizeIdentifier(`${baseType}_${shortId}`);
  }

  /**
   * Sanitize string to valid Terraform identifier
   * Rules: alphanumeric + underscore, must start with letter or underscore
   */
  private sanitizeIdentifier(input: string): string {
    // Replace invalid chars with underscore
    let sanitized = input.replace(/[^a-zA-Z0-9_]/g, "_");

    // Ensure starts with letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
      sanitized = `_${sanitized}`;
    }

    // Remove consecutive underscores
    sanitized = sanitized.replace(/_+/g, "_");

    // Remove trailing underscores
    sanitized = sanitized.replace(/_+$/, "");

    return sanitized.toLowerCase();
  }

  /**
   * Get all ancestors of a node (parent, parent's parent, etc.)
   */
  getAncestors(node: GraphNode): GraphNode[] {
    const ancestors: GraphNode[] = [];
    let current = node.parent;

    while (current) {
      ancestors.push(current);
      current = current.parent;
    }

    return ancestors;
  }

  /**
   * Get all descendants of a node (children, children's children, etc.)
   */
  getDescendants(node: GraphNode): GraphNode[] {
    const descendants: GraphNode[] = [];
    const queue = [...node.children];

    while (queue.length > 0) {
      const current = queue.shift()!;
      descendants.push(current);
      queue.push(...current.children);
    }

    return descendants;
  }

  /**
   * Get siblings of a node (other children of same parent)
   */
  getSiblings(node: GraphNode, allNodes: Map<string, GraphNode>): GraphNode[] {
    if (!node.parent) {
      // Root-level nodes: return all other root-level nodes
      return Array.from(allNodes.values()).filter((n) => !n.parent && n.id !== node.id);
    }

    return node.parent.children.filter((child) => child.id !== node.id);
  }

  /**
   * Find nodes in same containment scope
   */
  getNodesInSameScope(node: GraphNode, allNodes: Map<string, GraphNode>, scopeResourceTypes?: string[]): GraphNode[] {
    const siblings = this.getSiblings(node, allNodes);

    if (!scopeResourceTypes || scopeResourceTypes.length === 0) {
      return siblings;
    }

    return siblings.filter((sibling) =>
      scopeResourceTypes.includes(sibling.serviceDefinition.terraform_resource)
    );
  }

  /**
   * Get depth of node in containment tree (root = 0)
   */
  getDepth(node: GraphNode): number {
    let depth = 0;
    let current = node.parent;

    while (current) {
      depth++;
      current = current.parent;
    }

    return depth;
  }

  /**
   * Check if node1 is ancestor of node2
   */
  isAncestorOf(node1: GraphNode, node2: GraphNode): boolean {
    let current = node2.parent;

    while (current) {
      if (current.id === node1.id) {
        return true;
      }
      current = current.parent;
    }

    return false;
  }
}
