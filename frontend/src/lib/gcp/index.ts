/**
 * GCP Services Index - Central export for all GCP services
 */

// Analytics services
export {
  ANALYTICS_SERVICES,
  ANALYTICS_ICONS,
  getAnalyticsServiceByTerraformResource,
  getAnalyticsServiceById,
  isAnalyticsResource,
  getAnalyticsIcon,
  ANALYTICS_TERRAFORM_RESOURCES,
} from './analyticsServicesData';

export type {
  AnalyticsServiceDefinition,
} from './analyticsServicesData';

// Analytics catalog
export {
  ANALYTICS_CATALOG,
  ANALYTICS_RESOURCE_TYPES,
  isAnalyticsType,
  getAnalyticsCatalogEntry,
  getAnalyticsServiceIcon,
  listAnalyticsServices,
} from './analyticsCatalog';

export type { AnalyticsCatalogEntry } from './analyticsCatalog';

// Compute services
export {
  COMPUTE_SERVICES,
  COMPUTE_ICONS,
  getComputeServiceByTerraformResource,
  getComputeServiceById,
  isComputeResource,
  getComputeIcon,
  COMPUTE_TERRAFORM_RESOURCES,
} from './computeServicesData';

export type {
  ComputeServiceDefinition,
} from './computeServicesData';

// Compute catalog
export {
  COMPUTE_CATALOG,
  COMPUTE_RESOURCE_TYPES,
  isComputeType,
  getComputeCatalogEntry,
  getComputeServiceIcon,
  listComputeServices,
} from './computeCatalog';

export type { ComputeCatalogEntry } from './computeCatalog';

// Helper function to get GCP service icon
export function getGCPServiceIcon(terraformResource: string): string | undefined {
  const { ANALYTICS_ICONS } = require('./analyticsServicesData');
  if (ANALYTICS_ICONS[terraformResource]) return ANALYTICS_ICONS[terraformResource];
  const { COMPUTE_ICONS } = require('./computeServicesData');
  if (COMPUTE_ICONS[terraformResource]) return COMPUTE_ICONS[terraformResource];
  return undefined;
}

// Helper function to check if resource has GCP service definition
export function hasGCPServiceDefinition(terraformResource: string): boolean {
  const { isAnalyticsResource } = require('./analyticsServicesData');
  const { isComputeResource } = require('./computeServicesData');
  return isAnalyticsResource(terraformResource) || isComputeResource(terraformResource);
}

// GCP categories
export const GCP_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'server' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
];

