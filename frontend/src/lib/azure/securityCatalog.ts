/**
 * Azure Security Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { SECURITY_SERVICES, SECURITY_ICONS } from './securityServicesData';

export interface SecurityCatalogEntry {
  type: string;
  label: string;
  provider: 'azure';
  category: 'security';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert security services to catalog entries
export const SECURITY_CATALOG: SecurityCatalogEntry[] = SECURITY_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'azure' as const,
  category: 'security' as const,
  originalCategory: 'Security & Identity',
  description: service.description,
  icon: service.icon,
}));

// All security resource types
export const SECURITY_RESOURCE_TYPES = SECURITY_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a security resource
export function isSecurityType(resourceType: string): boolean {
  return SECURITY_RESOURCE_TYPES.includes(resourceType);
}

// Get security catalog entry by resource type
export function getSecurityCatalogEntry(resourceType: string): SecurityCatalogEntry | undefined {
  return SECURITY_CATALOG.find(entry => entry.type === resourceType);
}

// Get security service icon
export function getSecurityServiceIcon(resourceType: string): string {
  return SECURITY_ICONS[resourceType] || SECURITY_ICONS['azurerm_key_vault'];
}

// List all security services
export function listSecurityServices(): SecurityCatalogEntry[] {
  return SECURITY_CATALOG;
}


