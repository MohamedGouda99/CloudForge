/**
 * Azure Messaging Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { MESSAGING_SERVICES, MESSAGING_ICONS } from './messagingServicesData';

export interface MessagingCatalogEntry {
  type: string;
  label: string;
  provider: 'azure';
  category: 'messaging';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert messaging services to catalog entries
export const MESSAGING_CATALOG: MessagingCatalogEntry[] = MESSAGING_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'azure' as const,
  category: 'messaging' as const,
  originalCategory: 'Messaging & Integration',
  description: service.description,
  icon: service.icon,
}));

// All messaging resource types
export const MESSAGING_RESOURCE_TYPES = MESSAGING_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a messaging resource
export function isMessagingType(resourceType: string): boolean {
  return MESSAGING_RESOURCE_TYPES.includes(resourceType);
}

// Get messaging catalog entry by resource type
export function getMessagingCatalogEntry(resourceType: string): MessagingCatalogEntry | undefined {
  return MESSAGING_CATALOG.find(entry => entry.type === resourceType);
}

// Get messaging service icon
export function getMessagingServiceIcon(resourceType: string): string {
  return MESSAGING_ICONS[resourceType] || MESSAGING_ICONS['azurerm_servicebus_namespace'];
}

// List all messaging services
export function listMessagingServices(): MessagingCatalogEntry[] {
  return MESSAGING_CATALOG;
}







