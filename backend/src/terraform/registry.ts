/**
 * Service Registry - Centralized catalog of all cloud services with relationship rules
 *
 * This registry:
 * - Stores service definitions with relationship rules
 * - Provides lookup by terraform resource type or ID
 * - Supports AWS, Azure, GCP (extensible)
 * - Contains ZERO cloud-specific logic (purely data-driven)
 */

import type { ServiceDefinition, ServiceRegistry as IServiceRegistry } from "./types";

export class ServiceRegistry implements IServiceRegistry {
  private servicesByType = new Map<string, ServiceDefinition>();
  private servicesById = new Map<string, ServiceDefinition>();

  registerService(service: ServiceDefinition): void {
    this.servicesByType.set(service.terraform_resource, service);
    this.servicesById.set(service.id, service);
  }

  registerBulk(services: ServiceDefinition[]): void {
    for (const service of services) {
      this.registerService(service);
    }
  }

  getService(terraformResourceType: string): ServiceDefinition | undefined {
    return this.servicesByType.get(terraformResourceType);
  }

  getServiceById(id: string): ServiceDefinition | undefined {
    return this.servicesById.get(id);
  }

  getAllServices(): ServiceDefinition[] {
    return Array.from(this.servicesByType.values());
  }

  getServicesByProvider(provider: "aws" | "azure" | "gcp"): ServiceDefinition[] {
    const prefix = provider === "aws" ? "aws_" : provider === "azure" ? "azurerm_" : "google_";
    return Array.from(this.servicesByType.values()).filter((s) =>
      s.terraform_resource.startsWith(prefix)
    );
  }

  hasService(terraformResourceType: string): boolean {
    return this.servicesByType.has(terraformResourceType);
  }

  size(): number {
    return this.servicesByType.size;
  }

  clear(): void {
    this.servicesByType.clear();
    this.servicesById.clear();
  }
}

/**
 * Global singleton registry instance
 * Import and use this across the application
 */
export const globalRegistry = new ServiceRegistry();
