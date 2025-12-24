/**
 * AWS Compute Catalog - ONLY services from compute.json
 * This replaces the incorrect compute entries in generatedCatalog.ts
 */

import { COMPUTE_SERVICES, COMPUTE_ICONS } from './computeServicesData';

export interface ComputeCatalogEntry {
  type: string;
  label: string;
  provider: 'aws';
  category: 'compute';
  originalCategory: 'Compute';
  description: string;
  icon: string;
}

// Generate catalog entries from compute services data
export const COMPUTE_CATALOG: ComputeCatalogEntry[] = COMPUTE_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'aws' as const,
  category: 'compute' as const,
  originalCategory: 'Compute' as const,
  description: service.description,
  icon: service.icon,
}));

// List of terraform resource types that are COMPUTE services
export const COMPUTE_RESOURCE_TYPES = COMPUTE_SERVICES.map(s => s.terraform_resource);

// Services that should NOT be in compute category
export const NON_COMPUTE_SERVICES = [
  'aws_lambda_function',      // Should be in serverless
  'aws_lambda_alias',         // Should be in serverless
  'aws_lambda_layer_version', // Should be in serverless
  'aws_apprunner_service',    // Should be in containers
  'aws_ecs_service',          // Should be in containers
  'aws_ecs_cluster',          // Should be in containers
  'aws_ecs_task_definition',  // Should be in containers
  'aws_eks_cluster',          // Should be in containers
  'aws_eks_node_group',       // Should be in containers
];

/**
 * Check if a resource type is a compute service (from compute.json)
 */
export function isComputeType(resourceType: string): boolean {
  return COMPUTE_RESOURCE_TYPES.includes(resourceType);
}

/**
 * Get compute catalog entry by terraform resource type
 */
export function getComputeCatalogEntry(resourceType: string): ComputeCatalogEntry | undefined {
  return COMPUTE_CATALOG.find(entry => entry.type === resourceType);
}

/**
 * Get the correct icon for a compute service
 */
export function getComputeServiceIcon(resourceType: string): string {
  return COMPUTE_ICONS[resourceType] || '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg';
}

// Export for debugging
export function listComputeServices(): string[] {
  return COMPUTE_SERVICES.map(s => `${s.name} (${s.terraform_resource})`);
}











