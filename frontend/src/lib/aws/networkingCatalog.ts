/**
 * AWS Networking Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { NETWORKING_SERVICES, NETWORKING_ICONS, NetworkingServiceDefinition } from './networkingServicesData';

export interface NetworkingCatalogEntry {
  type: string;
  label: string;
  provider: 'aws';
  category: 'networking';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert networking services to catalog entries
export const NETWORKING_CATALOG: NetworkingCatalogEntry[] = NETWORKING_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'aws' as const,
  category: 'networking' as const,
  originalCategory: 'Networking & Content Delivery',
  description: service.description,
  icon: service.icon,
}));

// All networking resource types
export const NETWORKING_RESOURCE_TYPES = NETWORKING_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a networking resource
export function isNetworkingType(resourceType: string): boolean {
  return NETWORKING_RESOURCE_TYPES.includes(resourceType);
}

// Get networking catalog entry by resource type
export function getNetworkingCatalogEntry(resourceType: string): NetworkingCatalogEntry | undefined {
  return NETWORKING_CATALOG.find(entry => entry.type === resourceType);
}

// Get networking service icon
export function getNetworkingServiceIcon(resourceType: string): string {
  return NETWORKING_ICONS[resourceType] || NETWORKING_ICONS['aws_vpc'];
}

// List all networking services
export function listNetworkingServices(): NetworkingCatalogEntry[] {
  return NETWORKING_CATALOG;
}











