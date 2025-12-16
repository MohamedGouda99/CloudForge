// Cloud icon resolution utilities

import { GENERATED_ICON_MAP } from './generatedCatalog';

// GCP service to category icon mapping - maps service names to GCP category icons
const GCP_SERVICE_ICONS: Record<string, string> = {
  // Compute services
  'compute_engine': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  'cloud_run': '/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg',
  'cloud_functions': '/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg',
  'kubernetes_engine': '/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg',
  'app_engine': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  
  // Storage services
  'cloud_storage': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  'persistent_disk': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  'filestore': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  
  // Database services
  'cloud_sql': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'spanner': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'firestore': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'bigtable': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'memorystore': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  
  // Networking services
  'vpc': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'subnet': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'firewall': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'dns': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'nat': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'load_balancer': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  
  // Security services
  'iam': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  'kms': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  'secret_manager': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  
  // Analytics services
  'bigquery': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'dataflow': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'dataproc': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  
  // AI/ML services
  'vertex_ai': '/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg',
  'ai_platform': '/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg',
  
  // Integration services
  'pubsub': '/cloud_icons/GCP/Category Icons/Integration Services/SVG/IntegrationServices-512-color.svg',
  
  // DevOps services
  'cloud_build': '/cloud_icons/GCP/Category Icons/DevOps/SVG/DevOps-512-color.svg',
  'artifact_registry': '/cloud_icons/GCP/Category Icons/DevOps/SVG/DevOps-512-color.svg',
  
  // Monitoring services
  'monitoring': '/cloud_icons/GCP/Category Icons/Observability/SVG/Observability-512-color.svg',
  'logging': '/cloud_icons/GCP/Category Icons/Observability/SVG/Observability-512-color.svg',
  
  // Containers
  'container_registry': '/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg',
  'gke': '/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg',
};

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  compute: '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  networking: '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  storage: '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  database: '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  security: '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  containers: '/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg',
  serverless: '/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg',
  analytics: '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'machine-learning': '/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg',
  integration: '/cloud_icons/GCP/Category Icons/Integration Services/SVG/IntegrationServices-512-color.svg',
  management: '/cloud_icons/GCP/Category Icons/Management Tools/SVG/ManagementTools-512-color.svg',
  'developer-tools': '/cloud_icons/GCP/Category Icons/Developer Tools/SVG/Developer_Tools-512-color.svg',
  iam: '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  monitoring: '/cloud_icons/GCP/Category Icons/Observability/SVG/Observability-512-color.svg',
  devops: '/cloud_icons/GCP/Category Icons/DevOps/SVG/DevOps-512-color.svg',
};

// Provider logos
const PROVIDER_LOGOS: Record<string, string> = {
  aws: '/cloud_logos/aws.png',
  azure: '/cloud_logos/azure.png',
  gcp: '/cloud_logos/gcp.png',
};

/**
 * Resolve GCP icon reference to actual path
 */
function resolveGcpIcon(iconRef: string): string {
  // Handle gcp: prefixed references
  if (iconRef.startsWith('gcp:')) {
    const serviceName = iconRef.substring(4); // Remove 'gcp:' prefix
    if (GCP_SERVICE_ICONS[serviceName]) {
      return GCP_SERVICE_ICONS[serviceName];
    }
    // Fallback to compute category icon
    return '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg';
  }
  return iconRef;
}

/**
 * Get icon path for a cloud resource
 */
export function getCloudIconPath(resourceType: string): string {
  // Check generated catalog first
  if (GENERATED_ICON_MAP[resourceType]) {
    const iconRef = GENERATED_ICON_MAP[resourceType];
    // Resolve GCP icon references
    if (iconRef.startsWith('gcp:')) {
      return resolveGcpIcon(iconRef);
    }
    return iconRef;
  }
  
  // Default icon based on provider prefix
  if (resourceType.startsWith('google_')) {
    return '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg';
  }
  if (resourceType.startsWith('azurerm_')) {
    return '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/general/10007-icon-service-Resource-Groups.svg';
  }
  
  // Default AWS icon
  return '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_General-Icons/64/Arch_AWS-Cloud_64.svg';
}

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): string {
  const normalized = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICONS[normalized] || '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg';
}

/**
 * Get provider logo
 */
export function getProviderLogo(provider: string): string {
  return PROVIDER_LOGOS[provider.toLowerCase()] || PROVIDER_LOGOS.aws;
}

/**
 * Check if a string is a valid icon path (URL or file path)
 */
export function isIconPath(icon: string): boolean {
  if (!icon) return false;
  return (
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('/') ||
    icon.startsWith('./') ||
    icon.endsWith('.svg') ||
    icon.endsWith('.png') ||
    icon.endsWith('.jpg') ||
    icon.endsWith('.jpeg') ||
    icon.endsWith('.webp') ||
    icon.endsWith('.gif')
  );
}

export { GENERATED_ICON_MAP, GCP_SERVICE_ICONS };

