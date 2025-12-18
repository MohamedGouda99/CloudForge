/**
 * GCP Machine Learning Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { MACHINE_LEARNING_SERVICES, MACHINE_LEARNING_ICONS } from './machineLearningServicesData';

export interface MachineLearningCatalogEntry {
  type: string;
  label: string;
  provider: 'gcp';
  category: 'machine-learning';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert machine learning services to catalog entries
export const MACHINE_LEARNING_CATALOG: MachineLearningCatalogEntry[] = MACHINE_LEARNING_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'gcp' as const,
  category: 'machine-learning' as const,
  originalCategory: 'Machine Learning',
  description: service.description,
  icon: service.icon,
}));

// All machine learning resource types
export const MACHINE_LEARNING_RESOURCE_TYPES = MACHINE_LEARNING_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a machine learning resource
export function isMachineLearningType(resourceType: string): boolean {
  return MACHINE_LEARNING_RESOURCE_TYPES.includes(resourceType);
}

// Get machine learning catalog entry by resource type
export function getMachineLearningCatalogEntry(resourceType: string): MachineLearningCatalogEntry | undefined {
  return MACHINE_LEARNING_CATALOG.find(entry => entry.type === resourceType);
}

// Get machine learning service icon
export function getMachineLearningServiceIcon(resourceType: string): string {
  return MACHINE_LEARNING_ICONS[resourceType] || MACHINE_LEARNING_ICONS['google_vertex_ai_dataset'];
}

// List all machine learning services
export function listMachineLearningServices(): MachineLearningCatalogEntry[] {
  return MACHINE_LEARNING_CATALOG;
}

