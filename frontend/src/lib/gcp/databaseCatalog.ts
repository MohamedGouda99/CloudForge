/**
 * GCP Database Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { DATABASE_SERVICES, DATABASE_ICONS } from './databaseServicesData';

export interface DatabaseCatalogEntry {
  type: string;
  label: string;
  provider: 'gcp';
  category: 'database';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert database services to catalog entries
export const DATABASE_CATALOG: DatabaseCatalogEntry[] = DATABASE_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'gcp' as const,
  category: 'database' as const,
  originalCategory: 'Databases',
  description: service.description,
  icon: service.icon,
}));

// All database resource types
export const DATABASE_RESOURCE_TYPES = DATABASE_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a database resource
export function isDatabaseType(resourceType: string): boolean {
  return DATABASE_RESOURCE_TYPES.includes(resourceType);
}

// Get database catalog entry by resource type
export function getDatabaseCatalogEntry(resourceType: string): DatabaseCatalogEntry | undefined {
  return DATABASE_CATALOG.find(entry => entry.type === resourceType);
}

// Get database service icon
export function getDatabaseServiceIcon(resourceType: string): string {
  return DATABASE_ICONS[resourceType] || DATABASE_ICONS['google_sql_database_instance'];
}

// List all database services
export function listDatabaseServices(): DatabaseCatalogEntry[] {
  return DATABASE_CATALOG;
}





