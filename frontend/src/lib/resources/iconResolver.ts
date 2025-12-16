// Icon resolver utility

import { getCloudIconPath } from './cloudIconsComplete';

// GCP service to category icon mapping for direct resolution
const GCP_ICON_PATHS: Record<string, string> = {
  'compute_engine': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  'cloud_run': '/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg',
  'cloud_functions': '/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg',
  'kubernetes_engine': '/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg',
  'app_engine': '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg',
  'cloud_storage': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  'persistent_disk': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  'filestore': '/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg',
  'cloud_sql': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'spanner': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'firestore': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'bigtable': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'memorystore': '/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg',
  'vpc': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'subnet': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'firewall': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'dns': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'nat': '/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg',
  'iam': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  'kms': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  'secret_manager': '/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg',
  'bigquery': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'dataflow': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'dataproc': '/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg',
  'vertex_ai': '/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg',
  'pubsub': '/cloud_icons/GCP/Category Icons/Integration Services/SVG/IntegrationServices-512-color.svg',
  'cloud_build': '/cloud_icons/GCP/Category Icons/DevOps/SVG/DevOps-512-color.svg',
  'artifact_registry': '/cloud_icons/GCP/Category Icons/DevOps/SVG/DevOps-512-color.svg',
  'monitoring': '/cloud_icons/GCP/Category Icons/Observability/SVG/Observability-512-color.svg',
  'logging': '/cloud_icons/GCP/Category Icons/Observability/SVG/Observability-512-color.svg',
};

/**
 * Resolve GCP icon reference
 */
function resolveGcpIconRef(iconRef: string): string {
  if (iconRef.startsWith('gcp:')) {
    const serviceName = iconRef.substring(4);
    return GCP_ICON_PATHS[serviceName] || '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg';
  }
  return iconRef;
}

/**
 * Resolve resource icon - returns the appropriate icon URL
 */
export function resolveResourceIcon(resourceType: string, iconHint?: string): string {
  // If a valid icon hint is provided (path or URL), use it
  if (iconHint) {
    if (iconHint.startsWith('/') || iconHint.startsWith('http')) {
      return iconHint;
    }
    // Handle gcp: prefixed icons
    if (iconHint.startsWith('gcp:')) {
      return resolveGcpIconRef(iconHint);
    }
  }
  
  // Otherwise, resolve from the catalog
  return getCloudIconPath(resourceType);
}

/**
 * Get icon URL for display
 */
export function getIconUrl(icon: string): string {
  if (!icon) return '/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg';
  
  // Handle gcp: prefixed icons
  if (icon.startsWith('gcp:')) {
    return resolveGcpIconRef(icon);
  }
  
  if (icon.startsWith('http') || icon.startsWith('/')) {
    return icon;
  }
  return `/icons/${icon}`;
}

