/**
 * CloudForge Resource Catalog
 *
 * Unified resource definitions for cloud infrastructure.
 * Single source of truth for frontend, backend TypeScript, and backend Python.
 */

// Re-export all types
export * from './types';

// Re-export validation utilities
export * from './validation';

// Re-export AWS services under namespace
import * as aws from './aws';
export { aws };

// Re-export GCP services under namespace
import * as gcp from './gcp';
export { gcp };

// Re-export Azure services under namespace
import * as azure from './azure';
export { azure };

// Import provider resources
import { allAwsResources } from './aws';
import { gcpResources, gcpProvider } from './gcp';
import { azureResources, azureProvider } from './azure';

// Combined catalog of all resources from all providers
export const allResources = {
  aws: allAwsResources,
  gcp: gcpResources,
  azure: azureResources,
};

// Get all resources as a flat array
export const getAllResources = () => [
  ...allAwsResources,
  ...gcpResources,
  ...azureResources,
];

// Get resources by provider
export const getResourcesByProvider = (provider: 'aws' | 'gcp' | 'azure') => {
  return allResources[provider] || [];
};

// Provider metadata for API
export const providers = {
  aws: {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS',
    resourceCount: allAwsResources.length,
  },
  gcp: gcpProvider,
  azure: azureProvider,
};
