// Resource definitions and utilities

import { GENERATED_RESOURCE_CATALOG } from './generatedCatalog';

export interface ResourceDefinition {
  type: string;
  label: string;
  provider: string;
  category: string;
  originalCategory: string;
  description: string;
  icon: string;
  isContainer?: boolean;
}

// Container types that can hold other resources
const CONTAINER_TYPES = ['region', 'vpc', 'subnet', 'availability_zone', 'resource_group'];

// Container hierarchy levels
const CONTAINER_LEVELS: Record<string, number> = {
  region: 0,
  availability_zone: 1,
  vpc: 2,
  subnet: 3,
  resource_group: 1,
};

/**
 * Check if a resource type is a container
 */
export function isContainerType(resourceType: string): boolean {
  const type = resourceType.toLowerCase();
  return CONTAINER_TYPES.some(ct => type.includes(ct));
}

/**
 * Check if a resource can be placed inside a container
 */
export function canPlaceResourceIn(resourceType: string, containerType: string): boolean {
  // VPCs can only be in regions
  if (resourceType.includes('vpc')) {
    return containerType.includes('region');
  }
  
  // Subnets can only be in VPCs
  if (resourceType.includes('subnet')) {
    return containerType.includes('vpc');
  }
  
  // Most resources can be in subnets or VPCs
  return containerType.includes('subnet') || containerType.includes('vpc');
}

/**
 * Get the hierarchy level of a container
 */
export function getContainerLevel(containerType: string): number {
  for (const [type, level] of Object.entries(CONTAINER_LEVELS)) {
    if (containerType.toLowerCase().includes(type)) {
      return level;
    }
  }
  return 999; // Non-containers get highest level
}

/**
 * Get a resource definition by type
 */
export function getResourceDefinition(resourceType: string): ResourceDefinition | undefined {
  for (const provider of ['aws', 'azure', 'gcp'] as const) {
    const resources = GENERATED_RESOURCE_CATALOG[provider] || [];
    const found = resources.find((r: { type: string }) => r.type === resourceType);
    if (found) {
      return {
        ...found,
        isContainer: isContainerType(resourceType),
      } as ResourceDefinition;
    }
  }
  return undefined;
}

export { CONTAINER_TYPES, CONTAINER_LEVELS };

