/**
 * Resources Module
 *
 * Unified resource management using the catalog API.
 * This module provides both synchronous (cached) and asynchronous (API) access to resources.
 */

// Re-export API-based catalog functions
export {
  getResourcesFromAPI,
  getCategoriesFromAPI,
  getContainerTypesFromAPI,
  searchResourcesFromAPI,
  clearAPICache,
  hasAPICache,
} from './catalogBridge';

// Re-export schema API functions
export {
  getResourceSchema,
  getResourceSchemaAsync,
  hasRichSchema,
  hasRichSchemaAsync,
  getSchemaFieldsByGroup,
  validateField,
  validateSchema,
  getDefaultValues,
  getServiceIcon,
  hasServiceIcon,
  initializeSchemaCache,
  clearSchemaCache,
  isSchemaCacheLoaded,
  getAllSchemas,
  getSchemaCount,
  isComputeResource,
  isStorageResource,
  isDatabaseResource,
  isNetworkingResource,
  isSecurityResource,
  isAnalyticsResource,
  isContainersResource,
  isDeveloperToolsResource,
  isMachineLearningResource,
  isManagementResource,
  isMessagingResource,
  isServerlessResource,
  getComputeIcon,
  getStorageIcon,
  getDatabaseIcon,
  getNetworkingIcon,
  getSecurityIcon,
  getAnalyticsIcon,
  getContainersIcon,
  getDeveloperToolsIcon,
  getMachineLearningIcon,
  getManagementIcon,
  getMessagingIcon,
  getServerlessIcon,
  type SchemaField,
  type SchemaBlock,
  type SchemaOutput,
  type ResourceSchema,
} from './resourceSchemaAPI';

// Re-export catalog types
export type { CatalogResource } from '../api/catalogApi';

// Re-export other utilities
export { getCloudIconPath, getCategoryIcon, getProviderLogo, isIconPath } from './cloudIconsComplete';
export { resolveResourceIcon, getIconUrl } from './iconResolver';

export type { ResourceDefinition } from './resourceDefinitions';
export {
  isContainerType,
  canPlaceResourceIn,
  getContainerLevel,
  getResourceDefinition,
  CONTAINER_TYPES,
  CONTAINER_LEVELS
} from './resourceDefinitions';

// ============================================================================
// Types
// ============================================================================

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudResource {
  type: string;
  label: string;
  provider: CloudProvider;
  category: string;
  originalCategory: string;
  description: string;
  icon: string;
  isContainer?: boolean;
}

// ============================================================================
// Container Resource Types (unified across all providers)
// ============================================================================

export const CONTAINER_RESOURCE_TYPES = new Set([
  // AWS Networking - only true containers (not security_group)
  'aws_vpc',
  'aws_subnet',
  'aws_route_table',
  'aws_network_acl',
  'aws_lb',
  'aws_route53_zone',
  'aws_api_gateway_rest_api',
  'aws_apigatewayv2_api',
  // AWS Containers
  'aws_ecs_cluster',
  'aws_eks_cluster',
  // AWS Storage
  'aws_s3_bucket',
  'aws_efs_file_system',
  // AWS Database
  'aws_rds_cluster',
  // AWS Messaging
  'aws_sns_topic',
  // GCP Compute
  'google_compute_instance_group_manager',
  // GCP Networking
  'google_compute_network',
  'google_compute_subnetwork',
  'google_dns_managed_zone',
  // GCP Containers
  'google_container_cluster',
  // GCP Storage
  'google_storage_bucket',
  // GCP Database
  'google_sql_database_instance',
  'google_spanner_instance',
  'google_bigtable_instance',
  // GCP Security
  'google_kms_key_ring',
  'google_secret_manager_secret',
  // GCP Messaging
  'google_pubsub_topic',
  // GCP Analytics
  'google_bigquery_dataset',
  'google_dataproc_cluster',
  // Azure Networking
  'azurerm_virtual_network',
  'azurerm_subnet',
  'azurerm_network_security_group',
  // Azure Storage
  'azurerm_storage_account',
  // Azure Database
  'azurerm_sql_server',
  'azurerm_cosmosdb_account',
  // Azure Security
  'azurerm_resource_group',
  'azurerm_key_vault',
]);

// ============================================================================
// Resource Loading Functions
// ============================================================================

import { GENERATED_RESOURCE_CATALOG } from './generatedCatalog';

/**
 * Get resources for a provider (synchronous, uses generated catalog as fallback)
 */
export function getResourcesForProvider(provider: CloudProvider): CloudResource[] {
  // Use generated catalog for immediate sync access
  const resources = (GENERATED_RESOURCE_CATALOG[provider] || []) as CloudResource[];

  // Add isContainer flag based on container types set
  return resources.map(r => ({
    ...r,
    isContainer: CONTAINER_RESOURCE_TYPES.has(r.type),
  }));
}

/**
 * Get categories for a provider (synchronous)
 */
export function getCategoriesForProvider(provider: CloudProvider): string[] {
  const resources = getResourcesForProvider(provider);
  const categories = new Set(resources.map(r => r.category));
  return Array.from(categories).sort();
}

/**
 * Search resources by query (synchronous)
 */
export function searchResources(provider: CloudProvider, query: string): CloudResource[] {
  const resources = getResourcesForProvider(provider);
  const q = query.toLowerCase();
  return resources.filter(r =>
    r.label.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q)
  );
}

/**
 * Get provider icon URL
 */
export function getProviderIcon(provider: CloudProvider): string {
  const icons: Record<CloudProvider, string> = {
    aws: '/icons/providers/aws.svg',
    azure: '/icons/providers/azure.svg',
    gcp: '/icons/providers/gcp.svg',
  };
  return icons[provider] || icons.aws;
}

/**
 * Get provider display label
 */
export function getProviderLabel(provider: CloudProvider): string {
  const labels: Record<CloudProvider, string> = {
    aws: 'Amazon Web Services',
    azure: 'Microsoft Azure',
    gcp: 'Google Cloud Platform',
  };
  return labels[provider] || provider.toUpperCase();
}

// ============================================================================
// Categories
// ============================================================================

export const AWS_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'cpu' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
  { id: 'networking', name: 'Networking', icon: 'network' },
  { id: 'database', name: 'Database', icon: 'database' },
  { id: 'containers', name: 'Containers', icon: 'box' },
  { id: 'serverless', name: 'Serverless', icon: 'zap' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'messaging', name: 'Messaging', icon: 'message-square' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain' },
  { id: 'management', name: 'Management', icon: 'settings' },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code' },
];

export const AZURE_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'server' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
  { id: 'networking', name: 'Networking', icon: 'network' },
  { id: 'database', name: 'Database', icon: 'database' },
  { id: 'containers', name: 'Containers', icon: 'box' },
  { id: 'serverless', name: 'Serverless', icon: 'zap' },
  { id: 'security', name: 'Security & Identity', icon: 'shield' },
  { id: 'messaging', name: 'Messaging & Integration', icon: 'message-square' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain' },
  { id: 'management', name: 'Management & Monitoring', icon: 'settings' },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code' },
];

export const GCP_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'cpu' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
  { id: 'networking', name: 'Networking', icon: 'network' },
  { id: 'database', name: 'Database', icon: 'database' },
  { id: 'containers', name: 'Containers', icon: 'box' },
  { id: 'serverless', name: 'Serverless', icon: 'zap' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'messaging', name: 'Messaging', icon: 'message-square' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain' },
  { id: 'management', name: 'Management', icon: 'settings' },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code' },
];

// ============================================================================
// Category Icons (using AWS Architecture icons)
// ============================================================================

export const CATEGORY_ICONS: Record<string, string> = {
  compute: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Compute_64.svg',
  storage: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Storage_64.svg',
  networking: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Networking-Content-Delivery_64.svg',
  database: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Database_64.svg',
  containers: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Containers_64.svg',
  serverless: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Serverless_64.svg',
  security: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Security-Identity-Compliance_64.svg',
  messaging: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Application-Integration_64.svg',
  analytics: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Analytics_64.svg',
  'machine-learning': '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Machine-Learning_64.svg',
  management: '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Management-Governance_64.svg',
  'developer-tools': '/cloud_icons/AWS/Category-Icons_07312025/Arch-Category_Developer-Tools_64.svg',
};
