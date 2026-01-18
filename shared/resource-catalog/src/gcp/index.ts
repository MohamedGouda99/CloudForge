/**
 * GCP Resource Catalog
 *
 * Unified resource definitions for Google Cloud Platform services.
 * All resources conform to the ServiceDefinition interface.
 */

// Export all category resources
export * from './compute';
export * from './networking';
export * from './storage';
export * from './database';
export * from './security';
export * from './containers';
export * from './serverless';
export * from './analytics';
export * from './messaging';
export * from './management';
export * from './developer-tools';
export * from './machine-learning';

// Import all resource arrays
import { computeResources } from './compute';
import { networkingResources } from './networking';
import { storageResources } from './storage';
import { databaseResources } from './database';
import { securityResources } from './security';
import { containersResources } from './containers';
import { serverlessResources } from './serverless';
import { analyticsResources } from './analytics';
import { messagingResources } from './messaging';
import { managementResources } from './management';
import { developerToolsResources } from './developer-tools';
import { machineLearningResources } from './machine-learning';

// Combined export of all GCP resources
export const gcpResources = [
  ...computeResources,
  ...networkingResources,
  ...storageResources,
  ...databaseResources,
  ...securityResources,
  ...containersResources,
  ...serverlessResources,
  ...analyticsResources,
  ...messagingResources,
  ...managementResources,
  ...developerToolsResources,
  ...machineLearningResources,
];

// Export resource arrays by category
export const gcpResourcesByCategory = {
  compute: computeResources,
  networking: networkingResources,
  storage: storageResources,
  database: databaseResources,
  security: securityResources,
  containers: containersResources,
  serverless: serverlessResources,
  analytics: analyticsResources,
  messaging: messagingResources,
  management: managementResources,
  'developer-tools': developerToolsResources,
  'machine-learning': machineLearningResources,
};

// Provider metadata
export const gcpProvider = {
  id: 'gcp',
  name: 'Google Cloud Platform',
  shortName: 'GCP',
  resourceCount: gcpResources.length,
  categories: Object.keys(gcpResourcesByCategory),
};
