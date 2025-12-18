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

// Containers services
export {
  CONTAINERS_SERVICES,
  CONTAINERS_ICONS,
  getContainersServiceByTerraformResource,
  getContainersServiceById,
  isContainersResource,
  getContainersIcon,
  CONTAINERS_TERRAFORM_RESOURCES,
} from './containersServicesData';

export type {
  ContainersServiceDefinition,
} from './containersServicesData';

// Containers catalog
export {
  CONTAINERS_CATALOG,
  CONTAINERS_RESOURCE_TYPES,
  isContainersType,
  getContainersCatalogEntry,
  getContainersServiceIcon,
  listContainersServices,
} from './containersCatalog';

export type { ContainersCatalogEntry } from './containersCatalog';

// Database services
export {
  DATABASE_SERVICES,
  DATABASE_ICONS,
  getDatabaseServiceByTerraformResource,
  getDatabaseServiceById,
  isDatabaseResource,
  getDatabaseIcon,
  DATABASE_TERRAFORM_RESOURCES,
} from './databaseServicesData';

export type {
  DatabaseServiceDefinition,
} from './databaseServicesData';

// Database catalog
export {
  DATABASE_CATALOG,
  DATABASE_RESOURCE_TYPES,
  isDatabaseType,
  getDatabaseCatalogEntry,
  getDatabaseServiceIcon,
  listDatabaseServices,
} from './databaseCatalog';

export type { DatabaseCatalogEntry } from './databaseCatalog';

// Developer Tools services
export {
  DEVELOPER_TOOLS_SERVICES,
  DEVELOPER_TOOLS_ICONS,
  getDeveloperToolsServiceByTerraformResource,
  getDeveloperToolsServiceById,
  isDeveloperToolsResource,
  getDeveloperToolsIcon,
  DEVELOPER_TOOLS_TERRAFORM_RESOURCES,
} from './developerToolsServicesData';

export type {
  DeveloperToolsServiceDefinition,
} from './developerToolsServicesData';

// Developer Tools catalog
export {
  DEVELOPER_TOOLS_CATALOG,
  DEVELOPER_TOOLS_RESOURCE_TYPES,
  isDeveloperToolsType,
  getDeveloperToolsCatalogEntry,
  getDeveloperToolsServiceIcon,
  listDeveloperToolsServices,
} from './developerToolsCatalog';

export type { DeveloperToolsCatalogEntry } from './developerToolsCatalog';

// Machine Learning services
export {
  MACHINE_LEARNING_SERVICES,
  MACHINE_LEARNING_ICONS,
  getMachineLearningServiceByTerraformResource,
  getMachineLearningServiceById,
  isMachineLearningResource,
  getMachineLearningIcon,
  MACHINE_LEARNING_TERRAFORM_RESOURCES,
} from './machineLearningServicesData';

export type {
  MachineLearningServiceDefinition,
} from './machineLearningServicesData';

// Machine Learning catalog
export {
  MACHINE_LEARNING_CATALOG,
  MACHINE_LEARNING_RESOURCE_TYPES,
  isMachineLearningType,
  getMachineLearningCatalogEntry,
  getMachineLearningServiceIcon,
  listMachineLearningServices,
} from './machineLearningCatalog';

export type { MachineLearningCatalogEntry } from './machineLearningCatalog';

// Management services
export {
  MANAGEMENT_SERVICES,
  MANAGEMENT_ICONS,
  getManagementServiceByTerraformResource,
  getManagementServiceById,
  isManagementResource,
  getManagementIcon,
  MANAGEMENT_TERRAFORM_RESOURCES,
} from './managementServicesData';

export type {
  ManagementServiceDefinition,
} from './managementServicesData';

// Management catalog
export {
  MANAGEMENT_CATALOG,
  MANAGEMENT_RESOURCE_TYPES,
  isManagementType,
  getManagementCatalogEntry,
  getManagementServiceIcon,
  listManagementServices,
} from './managementCatalog';

export type { ManagementCatalogEntry } from './managementCatalog';

// Messaging services
export {
  MESSAGING_SERVICES,
  MESSAGING_ICONS,
  getMessagingServiceByTerraformResource,
  getMessagingServiceById,
  isMessagingResource,
  getMessagingIcon,
  MESSAGING_TERRAFORM_RESOURCES,
} from './messagingServicesData';

export type {
  MessagingServiceDefinition,
} from './messagingServicesData';

// Messaging catalog
export {
  MESSAGING_CATALOG,
  MESSAGING_RESOURCE_TYPES,
  isMessagingType,
  getMessagingCatalogEntry,
  getMessagingServiceIcon,
  listMessagingServices,
} from './messagingCatalog';

export type { MessagingCatalogEntry } from './messagingCatalog';

// Networking services
export {
  NETWORKING_SERVICES,
  NETWORKING_ICONS,
  getNetworkingServiceByTerraformResource,
  getNetworkingServiceById,
  isNetworkingResource,
  getNetworkingIcon,
  NETWORKING_TERRAFORM_RESOURCES,
} from './networkingServicesData';

export type {
  NetworkingServiceDefinition,
} from './networkingServicesData';

// Networking catalog
export {
  NETWORKING_CATALOG,
  NETWORKING_RESOURCE_TYPES,
  isNetworkingType,
  getNetworkingCatalogEntry,
  getNetworkingServiceIcon,
  listNetworkingServices,
} from './networkingCatalog';

export type { NetworkingCatalogEntry } from './networkingCatalog';

// Security services
export {
  SECURITY_SERVICES,
  SECURITY_ICONS,
  getSecurityServiceByTerraformResource,
  getSecurityServiceById,
  isSecurityResource,
  getSecurityIcon,
  SECURITY_TERRAFORM_RESOURCES,
} from './securityServicesData';

export type {
  SecurityServiceDefinition,
} from './securityServicesData';

// Security catalog
export {
  SECURITY_CATALOG,
  SECURITY_RESOURCE_TYPES,
  isSecurityType,
  getSecurityCatalogEntry,
  getSecurityServiceIcon,
  listSecurityServices,
} from './securityCatalog';

export type { SecurityCatalogEntry } from './securityCatalog';

// Serverless services
export {
  SERVERLESS_SERVICES,
  SERVERLESS_ICONS,
  getServerlessServiceByTerraformResource,
  getServerlessServiceById,
  isServerlessResource,
  getServerlessIcon,
  SERVERLESS_TERRAFORM_RESOURCES,
} from './serverlessServicesData';

export type {
  ServerlessServiceDefinition,
} from './serverlessServicesData';

// Serverless catalog
export {
  SERVERLESS_CATALOG,
  SERVERLESS_RESOURCE_TYPES,
  isServerlessType,
  getServerlessCatalogEntry,
  getServerlessServiceIcon,
  listServerlessServices,
} from './serverlessCatalog';

export type { ServerlessCatalogEntry } from './serverlessCatalog';

// Storage services
export {
  STORAGE_SERVICES,
  STORAGE_ICONS,
  getStorageServiceByTerraformResource,
  getStorageServiceById,
  isStorageResource,
  getStorageIcon,
  STORAGE_TERRAFORM_RESOURCES,
} from './storageServicesData';

export type {
  StorageServiceDefinition,
} from './storageServicesData';

// Storage catalog
export {
  STORAGE_CATALOG,
  STORAGE_RESOURCE_TYPES,
  isStorageType,
  getStorageCatalogEntry,
  getStorageServiceIcon,
  listStorageServices,
} from './storageCatalog';

export type { StorageCatalogEntry } from './storageCatalog';

// Helper function to get GCP service icon
export function getGCPServiceIcon(terraformResource: string): string | undefined {
  const { ANALYTICS_ICONS } = require('./analyticsServicesData');
  if (ANALYTICS_ICONS[terraformResource]) return ANALYTICS_ICONS[terraformResource];
  const { COMPUTE_ICONS } = require('./computeServicesData');
  if (COMPUTE_ICONS[terraformResource]) return COMPUTE_ICONS[terraformResource];
  const { CONTAINERS_ICONS } = require('./containersServicesData');
  if (CONTAINERS_ICONS[terraformResource]) return CONTAINERS_ICONS[terraformResource];
  const { DATABASE_ICONS } = require('./databaseServicesData');
  if (DATABASE_ICONS[terraformResource]) return DATABASE_ICONS[terraformResource];
  const { DEVELOPER_TOOLS_ICONS } = require('./developerToolsServicesData');
  if (DEVELOPER_TOOLS_ICONS[terraformResource]) return DEVELOPER_TOOLS_ICONS[terraformResource];
  const { MACHINE_LEARNING_ICONS } = require('./machineLearningServicesData');
  if (MACHINE_LEARNING_ICONS[terraformResource]) return MACHINE_LEARNING_ICONS[terraformResource];
  const { MANAGEMENT_ICONS } = require('./managementServicesData');
  if (MANAGEMENT_ICONS[terraformResource]) return MANAGEMENT_ICONS[terraformResource];
  const { MESSAGING_ICONS } = require('./messagingServicesData');
  if (MESSAGING_ICONS[terraformResource]) return MESSAGING_ICONS[terraformResource];
  const { NETWORKING_ICONS } = require('./networkingServicesData');
  if (NETWORKING_ICONS[terraformResource]) return NETWORKING_ICONS[terraformResource];
  const { SECURITY_ICONS } = require('./securityServicesData');
  if (SECURITY_ICONS[terraformResource]) return SECURITY_ICONS[terraformResource];
  const { SERVERLESS_ICONS } = require('./serverlessServicesData');
  if (SERVERLESS_ICONS[terraformResource]) return SERVERLESS_ICONS[terraformResource];
  const { STORAGE_ICONS } = require('./storageServicesData');
  if (STORAGE_ICONS[terraformResource]) return STORAGE_ICONS[terraformResource];
  return undefined;
}

// Helper function to check if resource has GCP service definition
export function hasGCPServiceDefinition(terraformResource: string): boolean {
  const { isAnalyticsResource } = require('./analyticsServicesData');
  const { isComputeResource } = require('./computeServicesData');
  const { isContainersResource } = require('./containersServicesData');
  const { isDatabaseResource } = require('./databaseServicesData');
  const { isDeveloperToolsResource } = require('./developerToolsServicesData');
  const { isMachineLearningResource } = require('./machineLearningServicesData');
  const { isManagementResource } = require('./managementServicesData');
  const { isMessagingResource } = require('./messagingServicesData');
  const { isNetworkingResource } = require('./networkingServicesData');
  const { isSecurityResource } = require('./securityServicesData');
  const { isServerlessResource } = require('./serverlessServicesData');
  const { isStorageResource } = require('./storageServicesData');
  return isAnalyticsResource(terraformResource) || isComputeResource(terraformResource) || isContainersResource(terraformResource) || isDatabaseResource(terraformResource) || isDeveloperToolsResource(terraformResource) || isMachineLearningResource(terraformResource) || isManagementResource(terraformResource) || isMessagingResource(terraformResource) || isNetworkingResource(terraformResource) || isSecurityResource(terraformResource) || isServerlessResource(terraformResource) || isStorageResource(terraformResource);
}

// GCP categories
export const GCP_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'server' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
  { id: 'containers', name: 'Containers', icon: 'box' },
  { id: 'database', name: 'Databases', icon: 'database' },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain' },
  { id: 'management', name: 'Management', icon: 'settings' },
  { id: 'messaging', name: 'Messaging', icon: 'message-square' },
  { id: 'networking', name: 'Networking', icon: 'network' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'serverless', name: 'Serverless', icon: 'zap' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
];
