/**
 * AWS Resources Library
 * Exports all AWS service definitions, schemas, and utilities
 */

// Type definitions shared across categories
export type {
  ServiceInput,
  ServiceBlock,
  BlockAttribute,
  ServiceOutput,
} from './computeServicesData';

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
  NON_COMPUTE_SERVICES,
  isComputeType,
  getComputeCatalogEntry,
  getComputeServiceIcon,
  listComputeServices,
} from './computeCatalog';

export type { ComputeCatalogEntry } from './computeCatalog';

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

// Helper to get icon for any AWS resource
export function getAWSServiceIcon(terraformResource: string): string | undefined {
  // Check compute
  const { COMPUTE_ICONS } = require('./computeServicesData');
  if (COMPUTE_ICONS[terraformResource]) return COMPUTE_ICONS[terraformResource];
  
  // Check storage
  const { STORAGE_ICONS } = require('./storageServicesData');
  if (STORAGE_ICONS[terraformResource]) return STORAGE_ICONS[terraformResource];
  
  // Check database
  const { DATABASE_ICONS } = require('./databaseServicesData');
  if (DATABASE_ICONS[terraformResource]) return DATABASE_ICONS[terraformResource];
  
  // Check networking
  const { NETWORKING_ICONS } = require('./networkingServicesData');
  if (NETWORKING_ICONS[terraformResource]) return NETWORKING_ICONS[terraformResource];
  
  // Check security
  const { SECURITY_ICONS } = require('./securityServicesData');
  if (SECURITY_ICONS[terraformResource]) return SECURITY_ICONS[terraformResource];
  
  // Check analytics
  const { ANALYTICS_ICONS } = require('./analyticsServicesData');
  if (ANALYTICS_ICONS[terraformResource]) return ANALYTICS_ICONS[terraformResource];
  
  // Check containers
  const { CONTAINERS_ICONS } = require('./containersServicesData');
  if (CONTAINERS_ICONS[terraformResource]) return CONTAINERS_ICONS[terraformResource];
  
  // Check developer tools
  const { DEVELOPER_TOOLS_ICONS } = require('./developerToolsServicesData');
  if (DEVELOPER_TOOLS_ICONS[terraformResource]) return DEVELOPER_TOOLS_ICONS[terraformResource];
  
  // Check machine learning
  const { MACHINE_LEARNING_ICONS } = require('./machineLearningServicesData');
  if (MACHINE_LEARNING_ICONS[terraformResource]) return MACHINE_LEARNING_ICONS[terraformResource];
  
  // Check management
  const { MANAGEMENT_ICONS } = require('./managementServicesData');
  if (MANAGEMENT_ICONS[terraformResource]) return MANAGEMENT_ICONS[terraformResource];
  
  // Check messaging
  const { MESSAGING_ICONS } = require('./messagingServicesData');
  if (MESSAGING_ICONS[terraformResource]) return MESSAGING_ICONS[terraformResource];
  
  // Check serverless
  const { SERVERLESS_ICONS } = require('./serverlessServicesData');
  if (SERVERLESS_ICONS[terraformResource]) return SERVERLESS_ICONS[terraformResource];
  
  return undefined;
}

// Check if a resource type has a known AWS service definition
export function hasAWSServiceDefinition(terraformResource: string): boolean {
  const { isComputeResource } = require('./computeServicesData');
  const { isStorageResource } = require('./storageServicesData');
  const { isDatabaseResource } = require('./databaseServicesData');
  const { isNetworkingResource } = require('./networkingServicesData');
  const { isSecurityResource } = require('./securityServicesData');
  const { isAnalyticsResource } = require('./analyticsServicesData');
  const { isContainersResource } = require('./containersServicesData');
  const { isDeveloperToolsResource } = require('./developerToolsServicesData');
  const { isMachineLearningResource } = require('./machineLearningServicesData');
  const { isManagementResource } = require('./managementServicesData');
  const { isMessagingResource } = require('./messagingServicesData');
  const { isServerlessResource } = require('./serverlessServicesData');
  
  return isComputeResource(terraformResource) || isStorageResource(terraformResource) || isDatabaseResource(terraformResource) || isNetworkingResource(terraformResource) || isSecurityResource(terraformResource) || isAnalyticsResource(terraformResource) || isContainersResource(terraformResource) || isDeveloperToolsResource(terraformResource) || isMachineLearningResource(terraformResource) || isManagementResource(terraformResource) || isMessagingResource(terraformResource) || isServerlessResource(terraformResource);
}

// Category list for UI
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
