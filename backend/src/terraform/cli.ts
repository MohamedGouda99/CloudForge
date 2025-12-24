#!/usr/bin/env node
/**
 * CLI wrapper for Terraform Generator
 *
 * This allows the Python backend to call the TypeScript generator via subprocess.
 *
 * Usage:
 *   node cli.ts <input.json>
 *   node --loader tsx cli.ts <input.json>
 *
 * Input JSON format:
 * {
 *   "nodes": [...],
 *   "edges": [...]
 * }
 *
 * Output JSON format:
 * {
 *   "mainTf": "...",
 *   "providersTf": "...",
 *   "variablesTf": "...",
 *   "diagnostics": [...]
 * }
 */

import { readFileSync } from "fs";
import { generateTerraform } from "./generate";
import { globalRegistry } from "./registry";
import { awsComputeServicesWithRules } from "./catalog/awsComputeWithRules";
import type { Diagram } from "./types";

function main() {
  try {
    // Check arguments
    if (process.argv.length < 3) {
      console.error("Usage: node cli.ts <input.json>");
      process.exit(1);
    }

    const inputFile = process.argv[2];

    // Read input
    const inputData = readFileSync(inputFile, "utf-8");
    const diagram: Diagram = JSON.parse(inputData);

    // Validate input
    if (!diagram.nodes || !Array.isArray(diagram.nodes)) {
      throw new Error("Invalid input: missing or invalid 'nodes' array");
    }
    if (!diagram.edges || !Array.isArray(diagram.edges)) {
      throw new Error("Invalid input: missing or invalid 'edges' array");
    }

    // Register services
    globalRegistry.registerBulk(awsComputeServicesWithRules);

    // TODO: Load additional services from catalog files
    // This would scan frontend/src/lib/{aws,azure,gcp}/ for service definitions
    // and automatically register them with relationship rules

    // Generate Terraform
    const result = generateTerraform(diagram, globalRegistry);

    // Output result as JSON
    console.log(JSON.stringify(result, null, 2));

    // Exit with error code if there are errors
    const hasErrors = result.diagnostics.some((d) => d.level === "error");
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }));
    process.exit(1);
  }
}

main();
