/**
 * Azure Resource Catalog
 *
 * Unified resource definitions for Microsoft Azure services.
 * All resources conform to the ServiceDefinition interface.
 */

// Export all category resources
export * from './compute';
export * from './storage';
export * from './database';
export * from './networking';
export * from './security';

// Import all resource arrays
import { computeResources } from './compute';
import { storageResources } from './storage';
import { databaseResources } from './database';
import { networkingResources } from './networking';
import { securityResources } from './security';

// Combined export of all Azure resources
export const azureResources = [
  ...computeResources,
  ...storageResources,
  ...databaseResources,
  ...networkingResources,
  ...securityResources,
];

// Export resource arrays by category
export const azureResourcesByCategory = {
  compute: computeResources,
  storage: storageResources,
  database: databaseResources,
  networking: networkingResources,
  security: securityResources,
};

// Provider metadata
export const azureProvider = {
  id: 'azure',
  name: 'Microsoft Azure',
  shortName: 'Azure',
  resourceCount: azureResources.length,
  categories: Object.keys(azureResourcesByCategory),
};
