/**
 * Azure Management Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { MANAGEMENT_SERVICES, MANAGEMENT_ICONS } from './managementServicesData';

export interface ManagementCatalogEntry {
  type: string;
  label: string;
  provider: 'azure';
  category: 'management';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert management services to catalog entries
export const MANAGEMENT_CATALOG: ManagementCatalogEntry[] = MANAGEMENT_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'azure' as const,
  category: 'management' as const,
  originalCategory: 'Management & Monitoring',
  description: service.description,
  icon: service.icon,
}));

// All management resource types
export const MANAGEMENT_RESOURCE_TYPES = MANAGEMENT_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a management resource
export function isManagementType(resourceType: string): boolean {
  return MANAGEMENT_RESOURCE_TYPES.includes(resourceType);
}

// Get management catalog entry by resource type
export function getManagementCatalogEntry(resourceType: string): ManagementCatalogEntry | undefined {
  return MANAGEMENT_CATALOG.find(entry => entry.type === resourceType);
}

// Get management service icon
export function getManagementServiceIcon(resourceType: string): string {
  return MANAGEMENT_ICONS[resourceType] || MANAGEMENT_ICONS['azurerm_resource_group'];
}

// List all management services
export function listManagementServices(): ManagementCatalogEntry[] {
  return MANAGEMENT_CATALOG;
}

