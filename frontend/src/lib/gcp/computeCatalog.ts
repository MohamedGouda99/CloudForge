/**
 * GCP Compute Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { COMPUTE_SERVICES, COMPUTE_ICONS } from './computeServicesData';

export interface ComputeCatalogEntry {
  type: string;
  label: string;
  provider: 'gcp';
  category: 'compute';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert compute services to catalog entries
export const COMPUTE_CATALOG: ComputeCatalogEntry[] = COMPUTE_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'gcp' as const,
  category: 'compute' as const,
  originalCategory: 'Compute',
  description: service.description,
  icon: service.icon,
}));

// All compute resource types
export const COMPUTE_RESOURCE_TYPES = COMPUTE_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a compute resource
export function isComputeType(resourceType: string): boolean {
  return COMPUTE_RESOURCE_TYPES.includes(resourceType);
}

// Get compute catalog entry by resource type
export function getComputeCatalogEntry(resourceType: string): ComputeCatalogEntry | undefined {
  return COMPUTE_CATALOG.find(entry => entry.type === resourceType);
}

// Get compute service icon
export function getComputeServiceIcon(resourceType: string): string {
  return COMPUTE_ICONS[resourceType] || COMPUTE_ICONS['google_compute_instance'];
}

// List all compute services
export function listComputeServices(): ComputeCatalogEntry[] {
  return COMPUTE_CATALOG;
}

