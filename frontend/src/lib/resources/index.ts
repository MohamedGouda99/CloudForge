// Main resources module - exports all resource-related utilities

import { GENERATED_RESOURCE_CATALOG as _CATALOG, GENERATED_ICON_MAP as _ICON_MAP } from './generatedCatalog';
import {
  COMPUTE_CATALOG,
  NON_COMPUTE_SERVICES,
  isComputeType
} from '../aws/computeCatalog';
import {
  STORAGE_CATALOG,
  isStorageType
} from '../aws/storageCatalog';
import {
  DATABASE_CATALOG,
  isDatabaseType
} from '../aws/databaseCatalog';
import {
  NETWORKING_CATALOG,
  isNetworkingType
} from '../aws/networkingCatalog';
import {
  SECURITY_CATALOG,
  isSecurityType
} from '../aws/securityCatalog';
import {
  ANALYTICS_CATALOG,
  isAnalyticsType
} from '../aws/analyticsCatalog';
import {
  CONTAINERS_CATALOG,
  isContainersType
} from '../aws/containersCatalog';
import {
  DEVELOPER_TOOLS_CATALOG,
  isDeveloperToolsType
} from '../aws/developerToolsCatalog';
import {
  MACHINE_LEARNING_CATALOG,
  isMachineLearningType
} from '../aws/machineLearningCatalog';
import {
  MANAGEMENT_CATALOG,
  isManagementType
} from '../aws/managementCatalog';
import {
  MESSAGING_CATALOG,
  isMessagingType
} from '../aws/messagingCatalog';
import {
  SERVERLESS_CATALOG,
  isServerlessType
} from '../aws/serverlessCatalog';
import { COMPUTE_ICONS } from '../aws/computeServicesData';
import { STORAGE_ICONS } from '../aws/storageServicesData';
import { DATABASE_ICONS } from '../aws/databaseServicesData';
import { NETWORKING_ICONS } from '../aws/networkingServicesData';
import { SECURITY_ICONS } from '../aws/securityServicesData';
import { ANALYTICS_ICONS } from '../aws/analyticsServicesData';
import { CONTAINERS_ICONS } from '../aws/containersServicesData';
import { DEVELOPER_TOOLS_ICONS } from '../aws/developerToolsServicesData';
import { MACHINE_LEARNING_ICONS } from '../aws/machineLearningServicesData';
import { MANAGEMENT_ICONS } from '../aws/managementServicesData';
import { MESSAGING_ICONS } from '../aws/messagingServicesData';
import { SERVERLESS_ICONS } from '../aws/serverlessServicesData';

export type { ProviderId, GeneratedResourceDefinition } from './generatedCatalog';
export { GENERATED_RESOURCE_CATALOG, GENERATED_ICON_MAP } from './generatedCatalog';

// Local reference for use in this module
const GENERATED_RESOURCE_CATALOG = _CATALOG;

export { getCloudIconPath, getCategoryIcon, getProviderLogo, isIconPath } from './cloudIconsComplete';
export { resolveResourceIcon, getIconUrl } from './iconResolver';
export { getManualIcon, getResourceIcon, MANUAL_ICON_MAP } from './iconMapping';

export type { ResourceDefinition } from './resourceDefinitions';
export {
  isContainerType,
  canPlaceResourceIn,
  getContainerLevel,
  getResourceDefinition,
  CONTAINER_TYPES,
  CONTAINER_LEVELS
} from './resourceDefinitions';

export type { SchemaField, ResourceSchema, SchemaBlock, SchemaOutput } from './resourceSchemas';
export {
  getResourceSchema,
  getSchemaFieldsByGroup,
  validateField,
  validateSchema,
  getDefaultValues,
  hasRichSchema,
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
  getServiceIcon,
  hasServiceIcon
} from './resourceSchemas';

// Cloud provider type
export type CloudProvider = 'aws' | 'azure' | 'gcp';

// Cloud resource interface
export interface CloudResource {
  type: string;
  label: string;
  provider: CloudProvider;
  category: string;
  originalCategory: string;
  description: string;
  icon: string;
}

// Combined service icons (AWS only for now)
const ALL_SERVICE_ICONS: Record<string, string> = {
  ...COMPUTE_ICONS,
  ...STORAGE_ICONS,
  ...DATABASE_ICONS,
  ...NETWORKING_ICONS,
  ...SECURITY_ICONS,
  ...ANALYTICS_ICONS,
  ...CONTAINERS_ICONS,
  ...DEVELOPER_TOOLS_ICONS,
  ...MACHINE_LEARNING_ICONS,
  ...MANAGEMENT_ICONS,
  ...MESSAGING_ICONS,
  ...SERVERLESS_ICONS,
};

// Helper function to check if a service has an icon
function hasIcon(resourceType: string): boolean {
  return !!ALL_SERVICE_ICONS[resourceType];
}

// Helper function to get a service icon
function getIcon(resourceType: string): string {
  return ALL_SERVICE_ICONS[resourceType] || '';
}

/**
 * Get all resources for a provider with CORRECTED categories
 * For AWS, services are taken from respective JSON files (compute.json, storage.json, database.json, networking.json)
 */
export function getResourcesForProvider(provider: CloudProvider): CloudResource[] {
  const baseResources = (GENERATED_RESOURCE_CATALOG[provider] || []) as CloudResource[];

  if (provider === 'aws') {
    // Filter out incorrectly categorized services
    const filteredResources = baseResources.filter(r => {
      // If it's categorized as compute but shouldn't be, skip it
      if (r.category === 'compute' && NON_COMPUTE_SERVICES.includes(r.type)) {
        return false;
      }
      // If it's in compute category but not a real compute service, skip it
      if (r.category === 'compute' && !isComputeType(r.type)) {
        return false;
      }
      // If it's in storage category but not from storage.json, skip it
      if (r.category === 'storage' && !isStorageType(r.type)) {
        return false;
      }
      // If it's in database category but not from database.json, skip it
      if (r.category === 'database' && !isDatabaseType(r.type)) {
        return false;
      }
      // If it's in networking category but not from networking.json, skip it
      if (r.category === 'networking' && !isNetworkingType(r.type)) {
        return false;
      }
      // If it's in security category but not from security.json, skip it
      if (r.category === 'security' && !isSecurityType(r.type)) {
        return false;
      }
      // If it's in analytics category but not from analytics.json, skip it
      if (r.category === 'analytics' && !isAnalyticsType(r.type)) {
        return false;
      }
      // If it's in containers category but not from containers.json, skip it
      if (r.category === 'containers' && !isContainersType(r.type)) {
        return false;
      }
      // If it's in developer-tools category but not from developer-tools.json, skip it
      if (r.category === 'developer-tools' && !isDeveloperToolsType(r.type)) {
        return false;
      }
      // If it's in machine-learning category but not from machine-learning.json, skip it
      if (r.category === 'machine-learning' && !isMachineLearningType(r.type)) {
        return false;
      }
      // If it's in management category but not from management.json, skip it
      if (r.category === 'management' && !isManagementType(r.type)) {
        return false;
      }
      // If it's in messaging category but not from messaging.json, skip it
      if (r.category === 'messaging' && !isMessagingType(r.type)) {
        return false;
      }
      // If it's in serverless category but not from serverless.json, skip it
      if (r.category === 'serverless' && !isServerlessType(r.type)) {
        return false;
      }
      return true;
    });

    // Add all correct services from respective JSON files
    const allResources = [
      ...filteredResources.filter(r => r.category !== 'compute' && r.category !== 'storage' && r.category !== 'database' && r.category !== 'networking' && r.category !== 'security' && r.category !== 'analytics' && r.category !== 'containers' && r.category !== 'developer-tools' && r.category !== 'machine-learning' && r.category !== 'management' && r.category !== 'messaging' && r.category !== 'serverless'),
      ...COMPUTE_CATALOG,
      ...STORAGE_CATALOG,
      ...DATABASE_CATALOG,
      ...NETWORKING_CATALOG,
      ...SECURITY_CATALOG,
      ...ANALYTICS_CATALOG,
      ...CONTAINERS_CATALOG,
      ...DEVELOPER_TOOLS_CATALOG,
      ...MACHINE_LEARNING_CATALOG,
      ...MANAGEMENT_CATALOG,
      ...MESSAGING_CATALOG,
      ...SERVERLESS_CATALOG,
    ];

    // Update icons for all resources using combined service icons
    const resourcesWithIcons = allResources.map(r => {
      if (hasIcon(r.type)) {
        return { ...r, icon: getIcon(r.type) };
      }
      return r;
    });

    // Sort: compute first, then storage, then alphabetically by category
    return resourcesWithIcons.sort((a, b) => {
      const categoryOrder = ['compute', 'storage', 'networking', 'database', 'containers', 'serverless', 'security', 'messaging', 'analytics', 'machine-learning', 'management', 'developer-tools'];
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);

      if (aIndex !== bIndex) {
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }

      return a.label.localeCompare(b.label);
    });
  }

  // For Azure and GCP, return base resources (placeholder - not fully implemented yet)
  return baseResources;
}

/**
 * Get unique categories for a provider
 */
export function getCategoriesForProvider(provider: CloudProvider): string[] {
  const resources = getResourcesForProvider(provider);
  const categories = new Set(resources.map(r => r.category));
  return Array.from(categories).sort();
}

/**
 * Search resources by query
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

// Re-export AWS compute types and utilities
export {
  COMPUTE_CATALOG,
  isComputeType,
  getComputeCatalogEntry,
  getComputeServiceIcon,
  COMPUTE_RESOURCE_TYPES,
  NON_COMPUTE_SERVICES,
} from '../aws/computeCatalog';

// Re-export AWS storage types and utilities
export {
  STORAGE_CATALOG,
  isStorageType,
  getStorageCatalogEntry,
  getStorageServiceIcon,
  STORAGE_RESOURCE_TYPES,
} from '../aws/storageCatalog';

// Re-export AWS database types and utilities
export {
  DATABASE_CATALOG,
  isDatabaseType,
  getDatabaseCatalogEntry,
  getDatabaseServiceIcon,
  DATABASE_RESOURCE_TYPES,
} from '../aws/databaseCatalog';

// Re-export AWS networking types and utilities
export {
  NETWORKING_CATALOG,
  isNetworkingType,
  getNetworkingCatalogEntry,
  getNetworkingServiceIcon,
  NETWORKING_RESOURCE_TYPES,
} from '../aws/networkingCatalog';

// Re-export AWS security types and utilities
export {
  SECURITY_CATALOG,
  isSecurityType,
  getSecurityCatalogEntry,
  getSecurityServiceIcon,
  SECURITY_RESOURCE_TYPES,
} from '../aws/securityCatalog';

// Re-export AWS analytics types and utilities
export {
  ANALYTICS_CATALOG,
  isAnalyticsType,
  getAnalyticsCatalogEntry,
  getAnalyticsServiceIcon,
  ANALYTICS_RESOURCE_TYPES,
} from '../aws/analyticsCatalog';

// Re-export AWS containers types and utilities
export {
  CONTAINERS_CATALOG,
  isContainersType,
  getContainersCatalogEntry,
  getContainersServiceIcon,
  CONTAINERS_RESOURCE_TYPES,
} from '../aws/containersCatalog';

// Re-export AWS developer tools types and utilities
export {
  DEVELOPER_TOOLS_CATALOG,
  isDeveloperToolsType,
  getDeveloperToolsCatalogEntry,
  getDeveloperToolsServiceIcon,
  DEVELOPER_TOOLS_RESOURCE_TYPES,
} from '../aws/developerToolsCatalog';

// Re-export AWS machine learning types and utilities
export {
  MACHINE_LEARNING_CATALOG,
  isMachineLearningType,
  getMachineLearningCatalogEntry,
  getMachineLearningServiceIcon,
  MACHINE_LEARNING_RESOURCE_TYPES,
} from '../aws/machineLearningCatalog';

// Re-export AWS management types and utilities
export {
  MANAGEMENT_CATALOG,
  isManagementType,
  getManagementCatalogEntry,
  getManagementServiceIcon,
  MANAGEMENT_RESOURCE_TYPES,
} from '../aws/managementCatalog';

// Re-export AWS messaging types and utilities
export {
  MESSAGING_CATALOG,
  isMessagingType,
  getMessagingCatalogEntry,
  getMessagingServiceIcon,
  MESSAGING_RESOURCE_TYPES,
} from '../aws/messagingCatalog';

// Re-export AWS serverless types and utilities
export {
  SERVERLESS_CATALOG,
  isServerlessType,
  getServerlessCatalogEntry,
  getServerlessServiceIcon,
  SERVERLESS_RESOURCE_TYPES,
} from '../aws/serverlessCatalog';

// AWS Categories
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

// Azure Categories (placeholder for future implementation)
export const AZURE_CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: 'server' },
  { id: 'containers', name: 'Containers', icon: 'box' },
  { id: 'database', name: 'Database', icon: 'database' },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code' },
  { id: 'machine-learning', name: 'Machine Learning', icon: 'brain' },
  { id: 'management', name: 'Management & Monitoring', icon: 'settings' },
  { id: 'messaging', name: 'Messaging & Integration', icon: 'message-square' },
  { id: 'networking', name: 'Networking', icon: 'network' },
  { id: 'security', name: 'Security & Identity', icon: 'shield' },
  { id: 'serverless', name: 'Serverless', icon: 'zap' },
  { id: 'storage', name: 'Storage', icon: 'hard-drive' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2' },
];

// GCP Categories (placeholder for future implementation)
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

// Combined service icons export
export const SERVICE_ICONS = ALL_SERVICE_ICONS;

// Category icons (using AWS Architecture icons)
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
