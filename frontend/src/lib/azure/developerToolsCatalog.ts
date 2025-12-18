/**
 * Azure Developer Tools Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { DEVELOPER_TOOLS_SERVICES, DEVELOPER_TOOLS_ICONS } from './developerToolsServicesData';

export interface DeveloperToolsCatalogEntry {
  type: string;
  label: string;
  provider: 'azure';
  category: 'developer-tools';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert developer-tools services to catalog entries
export const DEVELOPER_TOOLS_CATALOG: DeveloperToolsCatalogEntry[] = DEVELOPER_TOOLS_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'azure' as const,
  category: 'developer-tools' as const,
  originalCategory: 'Developer Tools',
  description: service.description,
  icon: service.icon,
}));

// All developer-tools resource types
export const DEVELOPER_TOOLS_RESOURCE_TYPES = DEVELOPER_TOOLS_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a developer-tools resource
export function isDeveloperToolsType(resourceType: string): boolean {
  return DEVELOPER_TOOLS_RESOURCE_TYPES.includes(resourceType);
}

// Get developer-tools catalog entry by resource type
export function getDeveloperToolsCatalogEntry(resourceType: string): DeveloperToolsCatalogEntry | undefined {
  return DEVELOPER_TOOLS_CATALOG.find(entry => entry.type === resourceType);
}

// Get developer-tools service icon
export function getDeveloperToolsServiceIcon(resourceType: string): string {
  return DEVELOPER_TOOLS_ICONS[resourceType] || DEVELOPER_TOOLS_ICONS['azurerm_dev_test_lab'];
}

// List all developer-tools services
export function listDeveloperToolsServices(): DeveloperToolsCatalogEntry[] {
  return DEVELOPER_TOOLS_CATALOG;
}


