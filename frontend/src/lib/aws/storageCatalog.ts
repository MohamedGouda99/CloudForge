/**
 * AWS Storage Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { STORAGE_SERVICES, STORAGE_ICONS, StorageServiceDefinition } from './storageServicesData';
import { CloudResource } from '../resources';

export interface StorageCatalogEntry {
  type: string;
  label: string;
  provider: 'aws';
  category: 'storage';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert storage services to catalog entries
export const STORAGE_CATALOG: StorageCatalogEntry[] = STORAGE_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'aws' as const,
  category: 'storage' as const,
  originalCategory: 'Storage',
  description: service.description,
  icon: service.icon,
}));

// All storage resource types
export const STORAGE_RESOURCE_TYPES = STORAGE_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a storage resource
export function isStorageType(resourceType: string): boolean {
  return STORAGE_RESOURCE_TYPES.includes(resourceType);
}

// Get storage catalog entry by resource type
export function getStorageCatalogEntry(resourceType: string): StorageCatalogEntry | undefined {
  return STORAGE_CATALOG.find(entry => entry.type === resourceType);
}

// Get storage service icon
export function getStorageServiceIcon(resourceType: string): string {
  return STORAGE_ICONS[resourceType] || STORAGE_ICONS['aws_s3_bucket'];
}

// List all storage services
export function listStorageServices(): StorageCatalogEntry[] {
  return STORAGE_CATALOG;
}










