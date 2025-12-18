/**
 * AWS Containers Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import { CONTAINERS_SERVICES, CONTAINERS_ICONS, ContainersServiceDefinition } from './containersServicesData';

export interface ContainersCatalogEntry {
  type: string;
  label: string;
  provider: 'aws';
  category: 'containers';
  originalCategory: string;
  description: string;
  icon: string;
}

// Convert containers services to catalog entries
export const CONTAINERS_CATALOG: ContainersCatalogEntry[] = CONTAINERS_SERVICES.map(service => ({
  type: service.terraform_resource,
  label: service.name,
  provider: 'aws' as const,
  category: 'containers' as const,
  originalCategory: 'Containers',
  description: service.description,
  icon: service.icon,
}));

// All containers resource types
export const CONTAINERS_RESOURCE_TYPES = CONTAINERS_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a containers resource
export function isContainersType(resourceType: string): boolean {
  return CONTAINERS_RESOURCE_TYPES.includes(resourceType);
}

// Get containers catalog entry by resource type
export function getContainersCatalogEntry(resourceType: string): ContainersCatalogEntry | undefined {
  return CONTAINERS_CATALOG.find(entry => entry.type === resourceType);
}

// Get containers service icon
export function getContainersServiceIcon(resourceType: string): string {
  return CONTAINERS_ICONS[resourceType] || CONTAINERS_ICONS['aws_ecs_cluster'];
}

// List all containers services
export function listContainersServices(): ContainersCatalogEntry[] {
  return CONTAINERS_CATALOG;
}










