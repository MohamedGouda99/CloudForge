/**
 * Node Classification Utilities
 *
 * Provides functions to determine node types and visual classification
 * based on the unified resource catalog.
 */

import { getResourceSchema, type ServiceDefinition } from '../../../lib/catalog';

// ============================================================================
// Classification Types
// ============================================================================

export type NodeClassification = 'icon' | 'container';

// ============================================================================
// Local Cache for Sync Operations
// ============================================================================

// Default container types for synchronous lookups before catalog loads
const DEFAULT_CONTAINER_TYPES = [
  // Networking - only true containers
  'aws_vpc',
  'aws_subnet',
  'aws_route_table',
  'aws_network_acl',
  'aws_lb',
  'aws_route53_zone',
  'aws_api_gateway_rest_api',
  'aws_apigatewayv2_api',
  // Containers
  'aws_ecs_cluster',
  'aws_ecs_service',
  'aws_ecs_task_definition',
  'aws_eks_cluster',
  'aws_eks_node_group',
  // Storage
  'aws_s3_bucket',
  'aws_efs_file_system',
  // Database
  'aws_rds_cluster',
  // Messaging
  'aws_sns_topic',
];

let containerTypesCache: Set<string> = new Set(DEFAULT_CONTAINER_TYPES);

// Resource definitions cache
let resourceCache: Map<string, ServiceDefinition> = new Map();

/**
 * Initialize the classifier cache with catalog data
 */
export async function initializeClassifierCache(): Promise<void> {
  try {
    const { fetchCatalog } = await import('../../../lib/catalog');
    const resources = await fetchCatalog();

    containerTypesCache.clear();
    resourceCache.clear();

    for (const resource of resources) {
      resourceCache.set(resource.terraform_resource, resource);
      if (resource.classification === 'container') {
        containerTypesCache.add(resource.terraform_resource);
      }
    }
  } catch (error) {
    console.warn('Failed to initialize classifier cache:', error);
    // Keep default values
  }
}

// ============================================================================
// Classification Functions
// ============================================================================

/**
 * Check if a resource type is a container (synchronous, uses cache)
 */
export function isContainerNode(terraformResource: string): boolean {
  // Check cache first
  const cached = resourceCache.get(terraformResource);
  if (cached) {
    return cached.classification === 'container';
  }

  // Fall back to known container types
  return containerTypesCache.has(terraformResource);
}

/**
 * Check if a resource type is an icon node (synchronous, uses cache)
 */
export function isIconNode(terraformResource: string): boolean {
  return !isContainerNode(terraformResource);
}

/**
 * Get the classification for a resource type (synchronous)
 */
export function getNodeClassification(terraformResource: string): NodeClassification {
  return isContainerNode(terraformResource) ? 'container' : 'icon';
}

/**
 * Get the classification for a resource type (async, fetches from API if needed)
 */
export async function getNodeClassificationAsync(terraformResource: string): Promise<NodeClassification> {
  // Check cache first
  const cached = resourceCache.get(terraformResource);
  if (cached) {
    return cached.classification;
  }

  // Fetch from API
  const resource = await getResourceSchema(terraformResource);
  if (resource) {
    resourceCache.set(terraformResource, resource);
    if (resource.classification === 'container') {
      containerTypesCache.add(terraformResource);
    }
    return resource.classification;
  }

  // Default to icon if not found
  return 'icon';
}

// ============================================================================
// Node Type Helpers
// ============================================================================

/**
 * Get the React Flow node type based on resource classification
 */
export function getReactFlowNodeType(terraformResource: string): 'containerNode' | 'iconNode' {
  return isContainerNode(terraformResource) ? 'containerNode' : 'iconNode';
}

/**
 * Check if a child resource can be contained by a parent resource
 * Primary: Checks parent's validChildren
 * Fallback: Checks child's containmentRules (legacy)
 */
export function canBeContainedBy(
  childTerraformResource: string,
  parentTerraformResource: string
): boolean {
  // Primary: Check parent's validChildren
  const parent = resourceCache.get(parentTerraformResource);
  if (parent?.relations?.validChildren) {
    for (const rule of parent.relations.validChildren) {
      if (rule.childTypes.includes(childTerraformResource)) {
        return true;
      }
    }
  }

  // Fallback: Check child's containmentRules (legacy)
  const child = resourceCache.get(childTerraformResource);
  if (child?.relations?.containmentRules) {
    return child.relations.containmentRules.some(
      rule => rule.whenParentResourceType === parentTerraformResource
    );
  }

  return false;
}

/**
 * Get valid parent container types for a resource
 */
export function getValidParentTypes(terraformResource: string): string[] {
  const resource = resourceCache.get(terraformResource);
  if (!resource?.relations?.containmentRules) {
    return [];
  }

  return resource.relations.containmentRules.map(rule => rule.whenParentResourceType);
}

/**
 * Get valid child types for a container resource
 * Primary: Returns validChildren from container definition
 * Fallback: Scans resources for matching containmentRules (legacy)
 */
export function getValidChildTypes(containerTerraformResource: string): string[] {
  const container = resourceCache.get(containerTerraformResource);

  // Primary: Read directly from container's validChildren
  if (container?.relations?.validChildren) {
    const childTypes: string[] = [];
    for (const rule of container.relations.validChildren) {
      childTypes.push(...rule.childTypes);
    }
    return [...new Set(childTypes)]; // Deduplicate
  }

  // Fallback: Scan for legacy containmentRules
  const validChildren: string[] = [];
  for (const [type, resource] of resourceCache.entries()) {
    if (resource.relations?.containmentRules) {
      const canContain = resource.relations.containmentRules.some(
        rule => rule.whenParentResourceType === containerTerraformResource
      );
      if (canContain) {
        validChildren.push(type);
      }
    }
  }

  return validChildren;
}

// ============================================================================
// Containment Validation
// ============================================================================

export interface ContainmentValidation {
  valid: boolean;
  allowed: boolean; // True if the action should be allowed (warn but allow pattern)
  reason?: string;
  warning?: string;
  suggestedParents?: string[];
  suggestedChildren?: string[];
}

/**
 * Validate if a node can be placed inside a parent container
 * Uses "warn but allow" pattern - returns warning for invalid containments but allows action
 */
export function validateContainment(
  childTerraformResource: string,
  parentTerraformResource: string | null
): ContainmentValidation {
  // If no parent, always valid (top-level placement)
  if (!parentTerraformResource) {
    return { valid: true, allowed: true };
  }

  // Check if parent is actually a container
  if (!isContainerNode(parentTerraformResource)) {
    return {
      valid: false,
      allowed: false, // Block: can't place inside non-container
      reason: `${parentTerraformResource} is not a container and cannot hold child nodes`,
    };
  }

  // Check if this child can be contained by this parent
  if (!canBeContainedBy(childTerraformResource, parentTerraformResource)) {
    const validParents = getValidParentTypes(childTerraformResource);
    const validChildren = getValidChildTypes(parentTerraformResource);

    return {
      valid: false,
      allowed: true, // Allow but warn
      warning: `${childTerraformResource} is not typically placed inside ${parentTerraformResource}`,
      reason: `This containment relationship is not defined in the resource catalog`,
      suggestedParents: validParents.length > 0 ? validParents : undefined,
      suggestedChildren: validChildren.length > 0 ? validChildren : undefined,
    };
  }

  return { valid: true, allowed: true };
}

/**
 * Check containment with async API validation (for more detailed feedback)
 */
export async function validateContainmentAsync(
  childTerraformResource: string,
  parentTerraformResource: string | null
): Promise<ContainmentValidation> {
  // First do synchronous validation
  const syncResult = validateContainment(childTerraformResource, parentTerraformResource);

  // If already valid or blocked, return sync result
  if (syncResult.valid || !syncResult.allowed) {
    return syncResult;
  }

  // For warn cases, try to get more info from API
  try {
    const { validateContainmentAPI } = await import('../../../lib/catalog');
    const apiResult = await validateContainmentAPI(parentTerraformResource!, childTerraformResource);

    return {
      valid: apiResult.valid,
      allowed: true,
      warning: apiResult.warning || syncResult.warning,
      suggestedParents: syncResult.suggestedParents,
      suggestedChildren: syncResult.suggestedChildren,
    };
  } catch {
    return syncResult;
  }
}

// ============================================================================
// Export Container Types for Quick Access
// ============================================================================

/**
 * Get all known container types (synchronous)
 */
export function getKnownContainerTypes(): string[] {
  return Array.from(containerTypesCache);
}

/**
 * Update container types cache (for testing or manual updates)
 */
export function updateContainerTypesCache(types: string[]): void {
  containerTypesCache = new Set(types);
}

/**
 * Update resource cache entry
 */
export function updateResourceCache(resource: ServiceDefinition): void {
  resourceCache.set(resource.terraform_resource, resource);
  if (resource.classification === 'container') {
    containerTypesCache.add(resource.terraform_resource);
  } else {
    containerTypesCache.delete(resource.terraform_resource);
  }
}

/**
 * Clear all caches (resets to default container types)
 */
export function clearClassifierCaches(): void {
  containerTypesCache = new Set(DEFAULT_CONTAINER_TYPES);
  resourceCache.clear();
}
