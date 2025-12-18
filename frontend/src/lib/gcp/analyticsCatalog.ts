/**
 * GCP Analytics Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { ANALYTICS_SERVICES, ANALYTICS_ICONS } from './analyticsServicesData';

export interface AnalyticsCatalogEntry {
  type: string;
  label: string;
  provider: 'gcp';
  category: 'analytics';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert analytics services to catalog entries
export const ANALYTICS_CATALOG: AnalyticsCatalogEntry[] = ANALYTICS_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'gcp' as const,
  category: 'analytics' as const,
  originalCategory: 'Analytics',
  description: service.description,
  icon: service.icon,
}));

// All analytics resource types
export const ANALYTICS_RESOURCE_TYPES = ANALYTICS_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is an analytics resource
export function isAnalyticsType(resourceType: string): boolean {
  return ANALYTICS_RESOURCE_TYPES.includes(resourceType);
}

// Get analytics catalog entry by resource type
export function getAnalyticsCatalogEntry(resourceType: string): AnalyticsCatalogEntry | undefined {
  return ANALYTICS_CATALOG.find(entry => entry.type === resourceType);
}

// Get analytics service icon
export function getAnalyticsServiceIcon(resourceType: string): string {
  return ANALYTICS_ICONS[resourceType] || ANALYTICS_ICONS['google_bigquery_dataset'];
}

// List all analytics services
export function listAnalyticsServices(): AnalyticsCatalogEntry[] {
  return ANALYTICS_CATALOG;
}


