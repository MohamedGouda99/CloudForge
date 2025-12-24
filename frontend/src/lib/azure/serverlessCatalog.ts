/**
 * Azure Serverless Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { SERVERLESS_SERVICES, SERVERLESS_ICONS } from './serverlessServicesData';

export interface ServerlessCatalogEntry {
  type: string;
  label: string;
  provider: 'azure';
  category: 'serverless';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert serverless services to catalog entries
export const SERVERLESS_CATALOG: ServerlessCatalogEntry[] = SERVERLESS_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'azure' as const,
  category: 'serverless' as const,
  originalCategory: 'Serverless',
  description: service.description,
  icon: service.icon,
}));

// All serverless resource types
export const SERVERLESS_RESOURCE_TYPES = SERVERLESS_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a serverless resource
export function isServerlessType(resourceType: string): boolean {
  return SERVERLESS_RESOURCE_TYPES.includes(resourceType);
}

// Get serverless catalog entry by resource type
export function getServerlessCatalogEntry(resourceType: string): ServerlessCatalogEntry | undefined {
  return SERVERLESS_CATALOG.find(entry => entry.type === resourceType);
}

// Get serverless service icon
export function getServerlessServiceIcon(resourceType: string): string {
  return SERVERLESS_ICONS[resourceType] || SERVERLESS_ICONS['azurerm_linux_function_app'];
}

// List all serverless services
export function listServerlessServices(): ServerlessCatalogEntry[] {
  return SERVERLESS_CATALOG;
}







