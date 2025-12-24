/**
 * Main Terraform Generator - Orchestrates the entire generation pipeline
 *
 * This is the main entry point that:
 * 1. Builds the graph from diagram input
 * 2. Applies inference rules
 * 3. Renders HCL output
 * 4. Returns diagnostics
 *
 * ZERO cloud-specific logic - fully data-driven by service catalog
 */

import type { Diagram, TerraformOutput } from "./types";
import type { ServiceRegistry } from "./registry";
import { GraphBuilder } from "./graph";
import { InferenceEngine } from "./infer";
import { HCLRenderer } from "./render";

export class TerraformGenerator {
  private graphBuilder: GraphBuilder;
  private inferenceEngine: InferenceEngine;
  private renderer: HCLRenderer;

  constructor(private registry: ServiceRegistry) {
    this.graphBuilder = new GraphBuilder(registry);
    this.inferenceEngine = new InferenceEngine(this.graphBuilder);
    this.renderer = new HCLRenderer();
  }

  /**
   * Generate Terraform code from diagram
   *
   * @param diagram - Input diagram with nodes and edges
   * @returns Terraform output with HCL code and diagnostics
   */
  generate(diagram: Diagram): TerraformOutput {
    // Step 1: Build graph
    const graphResult = this.graphBuilder.build(diagram);

    // Step 2: Apply inference rules
    const inferenceResult = this.inferenceEngine.infer(
      graphResult.nodes,
      graphResult.edges,
      graphResult.diagnostics
    );

    // Step 3: Render HCL
    const mainTf = this.renderer.renderMainTf(inferenceResult.nodes);

    // Step 4: Determine providers (for future providers.tf generation)
    const providers = this.detectProviders(diagram);

    return {
      mainTf,
      providersTf: this.renderer.renderProvidersTf(providers),
      variablesTf: this.renderer.renderVariablesTf(providers),
      diagnostics: inferenceResult.diagnostics,
    };
  }

  /**
   * Detect which cloud providers are used in the diagram
   */
  private detectProviders(diagram: Diagram): Set<string> {
    const providers = new Set<string>();

    for (const node of diagram.nodes) {
      providers.add(node.provider);
    }

    return providers;
  }

  /**
   * Validate diagram before generation
   * Returns validation errors without generating code
   */
  validate(diagram: Diagram): TerraformOutput {
    const graphResult = this.graphBuilder.build(diagram);

    return {
      mainTf: "",
      diagnostics: graphResult.diagnostics,
    };
  }

  /**
   * Get statistics about the diagram
   */
  getStats(diagram: Diagram): {
    nodeCount: number;
    edgeCount: number;
    providers: string[];
    resourceTypes: Map<string, number>;
  } {
    const resourceTypes = new Map<string, number>();
    const providers = new Set<string>();

    for (const node of diagram.nodes) {
      providers.add(node.provider);
      const count = resourceTypes.get(node.type) || 0;
      resourceTypes.set(node.type, count + 1);
    }

    return {
      nodeCount: diagram.nodes.length,
      edgeCount: diagram.edges.length,
      providers: Array.from(providers),
      resourceTypes,
    };
  }
}

/**
 * Convenience function for one-shot generation
 */
export function generateTerraform(
  diagram: Diagram,
  registry: ServiceRegistry
): TerraformOutput {
  const generator = new TerraformGenerator(registry);
  return generator.generate(diagram);
}
