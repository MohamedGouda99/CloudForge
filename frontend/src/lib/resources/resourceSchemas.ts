/**
 * Resource Schema Definitions
 * Integrates with AWS services for rich schema support
 */

import { 
  getComputeServiceByTerraformResource, 
  isComputeResource, 
  ComputeServiceDefinition,
  ServiceBlock,
  getComputeIcon,
  COMPUTE_ICONS,
  getStorageServiceByTerraformResource,
  isStorageResource,
  StorageServiceDefinition,
  getStorageIcon,
  STORAGE_ICONS,
  getDatabaseServiceByTerraformResource,
  isDatabaseResource,
  DatabaseServiceDefinition,
  getDatabaseIcon,
  DATABASE_ICONS,
  getNetworkingServiceByTerraformResource,
  isNetworkingResource,
  NetworkingServiceDefinition,
  getNetworkingIcon,
  NETWORKING_ICONS,
  getSecurityServiceByTerraformResource,
  isSecurityResource,
  SecurityServiceDefinition,
  getSecurityIcon,
  SECURITY_ICONS,
  getAnalyticsServiceByTerraformResource,
  isAnalyticsResource,
  AnalyticsServiceDefinition,
  getAnalyticsIcon,
  ANALYTICS_ICONS,
  getContainersServiceByTerraformResource,
  isContainersResource,
  ContainersServiceDefinition,
  getContainersIcon,
  CONTAINERS_ICONS,
  getDeveloperToolsServiceByTerraformResource,
  isDeveloperToolsResource,
  DeveloperToolsServiceDefinition,
  getDeveloperToolsIcon,
  DEVELOPER_TOOLS_ICONS,
  getMachineLearningServiceByTerraformResource,
  isMachineLearningResource,
  MachineLearningServiceDefinition,
  getMachineLearningIcon,
  MACHINE_LEARNING_ICONS,
  getManagementServiceByTerraformResource,
  isManagementResource,
  ManagementServiceDefinition,
  getManagementIcon,
  MANAGEMENT_ICONS,
  getMessagingServiceByTerraformResource,
  isMessagingResource,
  MessagingServiceDefinition,
  getMessagingIcon,
  MESSAGING_ICONS,
  getServerlessServiceByTerraformResource,
  isServerlessResource,
  ServerlessServiceDefinition,
  getServerlessIcon,
  SERVERLESS_ICONS,
} from '../aws';

// Azure services
import {
  getAnalyticsServiceByTerraformResource as getAzureAnalyticsServiceByTerraformResource,
  isAnalyticsResource as isAzureAnalyticsResource,
  AnalyticsServiceDefinition as AzureAnalyticsServiceDefinition,
  getAnalyticsIcon as getAzureAnalyticsIcon,
  ANALYTICS_ICONS as AZURE_ANALYTICS_ICONS,
} from '../azure/analyticsServicesData';
import {
  getComputeServiceByTerraformResource as getAzureComputeServiceByTerraformResource,
  isComputeResource as isAzureComputeResource,
  ComputeServiceDefinition as AzureComputeServiceDefinition,
  getComputeIcon as getAzureComputeIcon,
  COMPUTE_ICONS as AZURE_COMPUTE_ICONS,
} from '../azure/computeServicesData';
import {
  getContainersServiceByTerraformResource as getAzureContainersServiceByTerraformResource,
  isContainersResource as isAzureContainersResource,
  ContainersServiceDefinition as AzureContainersServiceDefinition,
  getContainersIcon as getAzureContainersIcon,
  CONTAINERS_ICONS as AZURE_CONTAINERS_ICONS,
} from '../azure/containersServicesData';
import {
  getDatabaseServiceByTerraformResource as getAzureDatabaseServiceByTerraformResource,
  isDatabaseResource as isAzureDatabaseResource,
  DatabaseServiceDefinition as AzureDatabaseServiceDefinition,
  getDatabaseIcon as getAzureDatabaseIcon,
  DATABASE_ICONS as AZURE_DATABASE_ICONS,
} from '../azure/databaseServicesData';
import {
  getDeveloperToolsServiceByTerraformResource as getAzureDeveloperToolsServiceByTerraformResource,
  isDeveloperToolsResource as isAzureDeveloperToolsResource,
  DeveloperToolsServiceDefinition as AzureDeveloperToolsServiceDefinition,
  getDeveloperToolsIcon as getAzureDeveloperToolsIcon,
  DEVELOPER_TOOLS_ICONS as AZURE_DEVELOPER_TOOLS_ICONS,
} from '../azure/developerToolsServicesData';
import {
  getMachineLearningServiceByTerraformResource as getAzureMachineLearningServiceByTerraformResource,
  isMachineLearningResource as isAzureMachineLearningResource,
  MachineLearningServiceDefinition as AzureMachineLearningServiceDefinition,
  getMachineLearningIcon as getAzureMachineLearningIcon,
  MACHINE_LEARNING_ICONS as AZURE_MACHINE_LEARNING_ICONS,
} from '../azure/machineLearningServicesData';
import {
  getManagementServiceByTerraformResource as getAzureManagementServiceByTerraformResource,
  isManagementResource as isAzureManagementResource,
  ManagementServiceDefinition as AzureManagementServiceDefinition,
  getManagementIcon as getAzureManagementIcon,
  MANAGEMENT_ICONS as AZURE_MANAGEMENT_ICONS,
} from '../azure/managementServicesData';
import {
  getNetworkingServiceByTerraformResource as getAzureNetworkingServiceByTerraformResource,
  isNetworkingResource as isAzureNetworkingResource,
  NetworkingServiceDefinition as AzureNetworkingServiceDefinition,
  getNetworkingIcon as getAzureNetworkingIcon,
  NETWORKING_ICONS as AZURE_NETWORKING_ICONS,
} from '../azure/networkingServicesData';
import {
  getSecurityServiceByTerraformResource as getAzureSecurityServiceByTerraformResource,
  isSecurityResource as isAzureSecurityResource,
  SecurityServiceDefinition as AzureSecurityServiceDefinition,
  getSecurityIcon as getAzureSecurityIcon,
  SECURITY_ICONS as AZURE_SECURITY_ICONS,
} from '../azure/securityServicesData';
import {
  getServerlessServiceByTerraformResource as getAzureServerlessServiceByTerraformResource,
  isServerlessResource as isAzureServerlessResource,
  ServerlessServiceDefinition as AzureServerlessServiceDefinition,
  getServerlessIcon as getAzureServerlessIcon,
  SERVERLESS_ICONS as AZURE_SERVERLESS_ICONS,
} from '../azure/serverlessServicesData';
import {
  getStorageServiceByTerraformResource as getAzureStorageServiceByTerraformResource,
  isStorageResource as isAzureStorageResource,
  StorageServiceDefinition as AzureStorageServiceDefinition,
  getStorageIcon as getAzureStorageIcon,
  STORAGE_ICONS as AZURE_STORAGE_ICONS,
} from '../azure/storageServicesData';
import {
  getAnalyticsServiceByTerraformResource as getGCPAnalyticsServiceByTerraformResource,
  isAnalyticsResource as isGCPAnalyticsResource,
  AnalyticsServiceDefinition as GCPAnalyticsServiceDefinition,
  getAnalyticsIcon as getGCPAnalyticsIcon,
  ANALYTICS_ICONS as GCP_ANALYTICS_ICONS,
} from '../gcp/analyticsServicesData';
import {
  getComputeServiceByTerraformResource as getGCPComputeServiceByTerraformResource,
  isComputeResource as isGCPComputeResource,
  ComputeServiceDefinition as GCPComputeServiceDefinition,
  getComputeIcon as getGCPComputeIcon,
  COMPUTE_ICONS as GCP_COMPUTE_ICONS,
} from '../gcp/computeServicesData';
import {
  getContainersServiceByTerraformResource as getGCPContainersServiceByTerraformResource,
  isContainersResource as isGCPContainersResource,
  ContainersServiceDefinition as GCPContainersServiceDefinition,
  getContainersIcon as getGCPContainersIcon,
  CONTAINERS_ICONS as GCP_CONTAINERS_ICONS,
} from '../gcp/containersServicesData';
import {
  getDatabaseServiceByTerraformResource as getGCPDatabaseServiceByTerraformResource,
  isDatabaseResource as isGCPDatabaseResource,
  DatabaseServiceDefinition as GCPDatabaseServiceDefinition,
  getDatabaseIcon as getGCPDatabaseIcon,
  DATABASE_ICONS as GCP_DATABASE_ICONS,
} from '../gcp/databaseServicesData';
import {
  getDeveloperToolsServiceByTerraformResource as getGCPDeveloperToolsServiceByTerraformResource,
  isDeveloperToolsResource as isGCPDeveloperToolsResource,
  DeveloperToolsServiceDefinition as GCPDeveloperToolsServiceDefinition,
  getDeveloperToolsIcon as getGCPDeveloperToolsIcon,
  DEVELOPER_TOOLS_ICONS as GCP_DEVELOPER_TOOLS_ICONS,
} from '../gcp/developerToolsServicesData';
import {
  getMachineLearningServiceByTerraformResource as getGCPMachineLearningServiceByTerraformResource,
  isMachineLearningResource as isGCPMachineLearningResource,
  MachineLearningServiceDefinition as GCPMachineLearningServiceDefinition,
  getMachineLearningIcon as getGCPMachineLearningIcon,
  MACHINE_LEARNING_ICONS as GCP_MACHINE_LEARNING_ICONS,
} from '../gcp/machineLearningServicesData';
import {
  getManagementServiceByTerraformResource as getGCPManagementServiceByTerraformResource,
  isManagementResource as isGCPManagementResource,
  ManagementServiceDefinition as GCPManagementServiceDefinition,
  getManagementIcon as getGCPManagementIcon,
  MANAGEMENT_ICONS as GCP_MANAGEMENT_ICONS,
} from '../gcp/managementServicesData';
import {
  getMessagingServiceByTerraformResource as getGCPMessagingServiceByTerraformResource,
  isMessagingResource as isGCPMessagingResource,
  MessagingServiceDefinition as GCPMessagingServiceDefinition,
  getMessagingIcon as getGCPMessagingIcon,
  MESSAGING_ICONS as GCP_MESSAGING_ICONS,
} from '../gcp/messagingServicesData';
import {
  getNetworkingServiceByTerraformResource as getGCPNetworkingServiceByTerraformResource,
  isNetworkingResource as isGCPNetworkingResource,
  NetworkingServiceDefinition as GCPNetworkingServiceDefinition,
  getNetworkingIcon as getGCPNetworkingIcon,
  NETWORKING_ICONS as GCP_NETWORKING_ICONS,
} from '../gcp/networkingServicesData';
import {
  getSecurityServiceByTerraformResource as getGCPSecurityServiceByTerraformResource,
  isSecurityResource as isGCPSecurityResource,
  SecurityServiceDefinition as GCPSecurityServiceDefinition,
  getSecurityIcon as getGCPSecurityIcon,
  SECURITY_ICONS as GCP_SECURITY_ICONS,
} from '../gcp/securityServicesData';
import {
  getServerlessServiceByTerraformResource as getGCPServerlessServiceByTerraformResource,
  isServerlessResource as isGCPServerlessResource,
  ServerlessServiceDefinition as GCPServerlessServiceDefinition,
  getServerlessIcon as getGCPServerlessIcon,
  SERVERLESS_ICONS as GCP_SERVERLESS_ICONS,
} from '../gcp/serverlessServicesData';
import {
  getStorageServiceByTerraformResource as getGCPStorageServiceByTerraformResource,
  isStorageResource as isGCPStorageResource,
  StorageServiceDefinition as GCPStorageServiceDefinition,
  getStorageIcon as getGCPStorageIcon,
  STORAGE_ICONS as GCP_STORAGE_ICONS,
} from '../gcp/storageServicesData';
import {
  getMessagingServiceByTerraformResource as getAzureMessagingServiceByTerraformResource,
  isMessagingResource as isAzureMessagingResource,
  MessagingServiceDefinition as AzureMessagingServiceDefinition,
  getMessagingIcon as getAzureMessagingIcon,
  MESSAGING_ICONS as AZURE_MESSAGING_ICONS,
} from '../azure/messagingServicesData';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'checkbox' | 'tags' | 'reference' | 'textarea';
  label: string;
  required?: boolean;
  default?: unknown;
  description?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  reference?: {
    resourceType: string;
    outputName: string;
  };
  group: 'required' | 'optional';
}

export interface SchemaBlock {
  name: string;
  label: string;
  description?: string;
  multiple?: boolean;
  fields: SchemaField[];
}

export interface SchemaOutput {
  name: string;
  type: string;
  description: string;
}

export interface ResourceSchema {
  type: string;
  label: string;
  category: string;
  provider: string;
  icon?: string;
  fields: SchemaField[];
  blocks?: SchemaBlock[];
  outputs?: SchemaOutput[];
}

// Default fields for resources without rich schema
const DEFAULT_FIELDS: SchemaField[] = [
  { name: 'name', type: 'string', label: 'Name', required: true, description: 'Resource name', group: 'required' },
  { name: 'tags', type: 'tags', label: 'Tags', description: 'Resource tags', group: 'optional' },
];

/**
 * Convert service input type to schema field type
 */
function mapInputType(inputType: string, hasOptions: boolean, hasReference: boolean): SchemaField['type'] {
  if (hasReference) return 'reference';
  if (hasOptions) return 'select';
  
  switch (inputType) {
    case 'number': return 'number';
    case 'bool': return 'checkbox';
    case 'string': return 'text';
    case 'list(string)': return 'tags';
    case 'map(string)': return 'tags';
    default: return 'text';
  }
}

/**
 * Parse a reference string like "aws_subnet.id" into components
 */
function parseReference(reference: string): { resourceType: string; outputName: string } | undefined {
  const parts = reference.split('.');
  if (parts.length !== 2) return undefined;
  return {
    resourceType: parts[0],
    outputName: parts[1],
  };
}

/**
 * Convert service block to schema block
 */
function convertBlock(block: ServiceBlock): SchemaBlock {
  return {
    name: block.name,
    label: block.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: block.description,
    multiple: block.multiple,
    fields: (block.attributes || []).map(attr => ({
      name: attr.name,
      type: mapInputType(attr.type, !!attr.options, false),
      label: attr.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: attr.required,
      description: attr.description,
      default: attr.default,
      options: attr.options?.map(o => ({ value: o, label: o })),
      group: 'optional' as const,
    })),
  };
}

/**
 * Convert compute service to resource schema
 */
function convertComputeServiceToSchema(service: ComputeServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'compute',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert storage service to resource schema
 */
function convertStorageServiceToSchema(service: StorageServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'storage',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert database service to resource schema
 */
function convertDatabaseServiceToSchema(service: DatabaseServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'database',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert networking service to resource schema
 */
function convertNetworkingServiceToSchema(service: NetworkingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'networking',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert security service to resource schema
 */
function convertSecurityServiceToSchema(service: SecurityServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'security',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert analytics service to resource schema
 */
function convertAnalyticsServiceToSchema(service: AnalyticsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'analytics',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert containers service to resource schema
 */
function convertContainersServiceToSchema(service: ContainersServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'containers',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert developer tools service to resource schema
 */
function convertDeveloperToolsServiceToSchema(service: DeveloperToolsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'developer-tools',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert machine learning service to resource schema
 */
function convertMachineLearningServiceToSchema(service: MachineLearningServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'machine-learning',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert management service to resource schema
 */
function convertManagementServiceToSchema(service: ManagementServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'management',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert messaging service to resource schema
 */
function convertMessagingServiceToSchema(service: MessagingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'messaging',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert serverless service to resource schema
 */
function convertServerlessServiceToSchema(service: ServerlessServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'serverless',
    provider: 'aws',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure analytics service to resource schema
 */
function convertAzureAnalyticsServiceToSchema(service: AzureAnalyticsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'analytics',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure compute service to resource schema
 */
function convertAzureComputeServiceToSchema(service: AzureComputeServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'compute',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure containers service to resource schema
 */
function convertAzureContainersServiceToSchema(service: AzureContainersServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'containers',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure database service to resource schema
 */
function convertAzureDatabaseServiceToSchema(service: AzureDatabaseServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'database',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure developer-tools service to resource schema
 */
function convertAzureDeveloperToolsServiceToSchema(service: AzureDeveloperToolsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'developer-tools',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure machine-learning service to resource schema
 */
function convertAzureMachineLearningServiceToSchema(service: AzureMachineLearningServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'machine-learning',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure management service to resource schema
 */
function convertAzureManagementServiceToSchema(service: AzureManagementServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'management',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure messaging service to resource schema
 */
function convertAzureMessagingServiceToSchema(service: AzureMessagingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'messaging',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure networking service to resource schema
 */
function convertAzureNetworkingServiceToSchema(service: AzureNetworkingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'networking',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure security service to resource schema
 */
function convertAzureSecurityServiceToSchema(service: AzureSecurityServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'security',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure serverless service to resource schema
 */
function convertAzureServerlessServiceToSchema(service: AzureServerlessServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'serverless',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert Azure storage service to resource schema
 */
function convertAzureStorageServiceToSchema(service: AzureStorageServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'storage',
    provider: 'azure',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP analytics service to resource schema
 */
function convertGCPAnalyticsServiceToSchema(service: GCPAnalyticsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'analytics',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP compute service to resource schema
 */
function convertGCPComputeServiceToSchema(service: GCPComputeServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'compute',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP containers service to resource schema
 */
function convertGCPContainersServiceToSchema(service: GCPContainersServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'containers',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP database service to resource schema
 */
function convertGCPDatabaseServiceToSchema(service: GCPDatabaseServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'database',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP developer tools service to resource schema
 */
function convertGCPDeveloperToolsServiceToSchema(service: GCPDeveloperToolsServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'developer-tools',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP machine learning service to resource schema
 */
function convertGCPMachineLearningServiceToSchema(service: GCPMachineLearningServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  
  // Add required fields
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  
  // Add optional fields
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  
  // Convert blocks
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'machine-learning',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP management service to resource schema
 */
function convertGCPManagementServiceToSchema(service: GCPManagementServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'management',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP messaging service to resource schema
 */
function convertGCPMessagingServiceToSchema(service: GCPMessagingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'messaging',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP networking service to resource schema
 */
function convertGCPNetworkingServiceToSchema(service: GCPNetworkingServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'networking',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP security service to resource schema
 */
function convertGCPSecurityServiceToSchema(service: GCPSecurityServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'security',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP serverless service to resource schema
 */
function convertGCPServerlessServiceToSchema(service: GCPServerlessServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'serverless',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Convert GCP storage service to resource schema
 */
function convertGCPStorageServiceToSchema(service: GCPStorageServiceDefinition): ResourceSchema {
  const fields: SchemaField[] = [];
  for (const input of service.inputs.required) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: true,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'required',
    });
  }
  for (const input of service.inputs.optional) {
    const hasOptions = !!input.options && input.options.length > 0;
    const hasReference = !!input.reference;
    fields.push({
      name: input.name,
      type: mapInputType(input.type, hasOptions, hasReference),
      label: input.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      required: false,
      description: input.description,
      placeholder: input.example,
      default: input.default,
      options: hasOptions ? input.options!.map(o => ({ value: o, label: o })) : undefined,
      reference: hasReference ? parseReference(input.reference!) : undefined,
      group: 'optional',
    });
  }
  const blocks = service.inputs.blocks?.map(convertBlock) || [];
  return {
    type: service.terraform_resource,
    label: service.name,
    category: 'storage',
    provider: 'gcp',
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

/**
 * Get icon for a resource type
 */
export function getServiceIcon(resourceType: string): string | undefined {
  if (COMPUTE_ICONS[resourceType]) return COMPUTE_ICONS[resourceType];
  if (STORAGE_ICONS[resourceType]) return STORAGE_ICONS[resourceType];
  if (DATABASE_ICONS[resourceType]) return DATABASE_ICONS[resourceType];
  if (NETWORKING_ICONS[resourceType]) return NETWORKING_ICONS[resourceType];
  if (SECURITY_ICONS[resourceType]) return SECURITY_ICONS[resourceType];
  if (ANALYTICS_ICONS[resourceType]) return ANALYTICS_ICONS[resourceType];
  if (CONTAINERS_ICONS[resourceType]) return CONTAINERS_ICONS[resourceType];
  if (DEVELOPER_TOOLS_ICONS[resourceType]) return DEVELOPER_TOOLS_ICONS[resourceType];
  if (MACHINE_LEARNING_ICONS[resourceType]) return MACHINE_LEARNING_ICONS[resourceType];
  if (MANAGEMENT_ICONS[resourceType]) return MANAGEMENT_ICONS[resourceType];
  if (MESSAGING_ICONS[resourceType]) return MESSAGING_ICONS[resourceType];
  if (SERVERLESS_ICONS[resourceType]) return SERVERLESS_ICONS[resourceType];
  if (AZURE_ANALYTICS_ICONS[resourceType]) return AZURE_ANALYTICS_ICONS[resourceType];
  if (AZURE_COMPUTE_ICONS[resourceType]) return AZURE_COMPUTE_ICONS[resourceType];
  if (AZURE_CONTAINERS_ICONS[resourceType]) return AZURE_CONTAINERS_ICONS[resourceType];
  if (AZURE_DATABASE_ICONS[resourceType]) return AZURE_DATABASE_ICONS[resourceType];
  if (AZURE_DEVELOPER_TOOLS_ICONS[resourceType]) return AZURE_DEVELOPER_TOOLS_ICONS[resourceType];
  if (AZURE_MACHINE_LEARNING_ICONS[resourceType]) return AZURE_MACHINE_LEARNING_ICONS[resourceType];
  if (AZURE_MANAGEMENT_ICONS[resourceType]) return AZURE_MANAGEMENT_ICONS[resourceType];
  if (AZURE_MESSAGING_ICONS[resourceType]) return AZURE_MESSAGING_ICONS[resourceType];
  if (AZURE_NETWORKING_ICONS[resourceType]) return AZURE_NETWORKING_ICONS[resourceType];
  if (AZURE_SECURITY_ICONS[resourceType]) return AZURE_SECURITY_ICONS[resourceType];
  if (AZURE_SERVERLESS_ICONS[resourceType]) return AZURE_SERVERLESS_ICONS[resourceType];
  if (AZURE_STORAGE_ICONS[resourceType]) return AZURE_STORAGE_ICONS[resourceType];
  if (GCP_ANALYTICS_ICONS[resourceType]) return GCP_ANALYTICS_ICONS[resourceType];
  if (GCP_COMPUTE_ICONS[resourceType]) return GCP_COMPUTE_ICONS[resourceType];
  if (GCP_CONTAINERS_ICONS[resourceType]) return GCP_CONTAINERS_ICONS[resourceType];
  if (GCP_DATABASE_ICONS[resourceType]) return GCP_DATABASE_ICONS[resourceType];
  if (GCP_DEVELOPER_TOOLS_ICONS[resourceType]) return GCP_DEVELOPER_TOOLS_ICONS[resourceType];
  if (GCP_MACHINE_LEARNING_ICONS[resourceType]) return GCP_MACHINE_LEARNING_ICONS[resourceType];
  if (GCP_MANAGEMENT_ICONS[resourceType]) return GCP_MANAGEMENT_ICONS[resourceType];
  if (GCP_MESSAGING_ICONS[resourceType]) return GCP_MESSAGING_ICONS[resourceType];
  if (GCP_NETWORKING_ICONS[resourceType]) return GCP_NETWORKING_ICONS[resourceType];
  if (GCP_SECURITY_ICONS[resourceType]) return GCP_SECURITY_ICONS[resourceType];
  if (GCP_SERVERLESS_ICONS[resourceType]) return GCP_SERVERLESS_ICONS[resourceType];
  if (GCP_STORAGE_ICONS[resourceType]) return GCP_STORAGE_ICONS[resourceType];
  return undefined;
}

/**
 * Check if a resource has an icon
 */
export function hasServiceIcon(resourceType: string): boolean {
  return !!(COMPUTE_ICONS[resourceType] || STORAGE_ICONS[resourceType] || DATABASE_ICONS[resourceType] || NETWORKING_ICONS[resourceType] || SECURITY_ICONS[resourceType] || ANALYTICS_ICONS[resourceType] || CONTAINERS_ICONS[resourceType] || DEVELOPER_TOOLS_ICONS[resourceType] || MACHINE_LEARNING_ICONS[resourceType] || MANAGEMENT_ICONS[resourceType] || MESSAGING_ICONS[resourceType] || SERVERLESS_ICONS[resourceType] || AZURE_ANALYTICS_ICONS[resourceType] || AZURE_COMPUTE_ICONS[resourceType] || AZURE_CONTAINERS_ICONS[resourceType] || AZURE_DATABASE_ICONS[resourceType] || AZURE_DEVELOPER_TOOLS_ICONS[resourceType] || AZURE_MACHINE_LEARNING_ICONS[resourceType] || AZURE_MANAGEMENT_ICONS[resourceType] || AZURE_MESSAGING_ICONS[resourceType] || AZURE_NETWORKING_ICONS[resourceType] || AZURE_SECURITY_ICONS[resourceType] || AZURE_SERVERLESS_ICONS[resourceType] || AZURE_STORAGE_ICONS[resourceType] || GCP_ANALYTICS_ICONS[resourceType] || GCP_COMPUTE_ICONS[resourceType] || GCP_CONTAINERS_ICONS[resourceType] || GCP_DATABASE_ICONS[resourceType] || GCP_DEVELOPER_TOOLS_ICONS[resourceType] || GCP_MACHINE_LEARNING_ICONS[resourceType] || GCP_MANAGEMENT_ICONS[resourceType] || GCP_MESSAGING_ICONS[resourceType] || GCP_NETWORKING_ICONS[resourceType] || GCP_SECURITY_ICONS[resourceType] || GCP_SERVERLESS_ICONS[resourceType] || GCP_STORAGE_ICONS[resourceType]);
}

/**
 * Get schema for a resource type
 */
export function getResourceSchema(resourceType: string): ResourceSchema {
  // Check if it's a compute service with rich schema
  if (isComputeResource(resourceType)) {
    const service = getComputeServiceByTerraformResource(resourceType);
    if (service) {
      return convertComputeServiceToSchema(service);
    }
  }
  
  // Check if it's a storage service with rich schema
  if (isStorageResource(resourceType)) {
    const service = getStorageServiceByTerraformResource(resourceType);
    if (service) {
      return convertStorageServiceToSchema(service);
    }
  }
  
  // Check if it's a database service with rich schema
  if (isDatabaseResource(resourceType)) {
    const service = getDatabaseServiceByTerraformResource(resourceType);
    if (service) {
      return convertDatabaseServiceToSchema(service);
    }
  }
  
  // Check if it's a networking service with rich schema
  if (isNetworkingResource(resourceType)) {
    const service = getNetworkingServiceByTerraformResource(resourceType);
    if (service) {
      return convertNetworkingServiceToSchema(service);
    }
  }
  
  // Check if it's a security service with rich schema
  if (isSecurityResource(resourceType)) {
    const service = getSecurityServiceByTerraformResource(resourceType);
    if (service) {
      return convertSecurityServiceToSchema(service);
    }
  }
  
  // Check if it's an analytics service with rich schema
  if (isAnalyticsResource(resourceType)) {
    const service = getAnalyticsServiceByTerraformResource(resourceType);
    if (service) {
      return convertAnalyticsServiceToSchema(service);
    }
  }
  
  // Check if it's a containers service with rich schema
  if (isContainersResource(resourceType)) {
    const service = getContainersServiceByTerraformResource(resourceType);
    if (service) {
      return convertContainersServiceToSchema(service);
    }
  }
  
  // Check if it's a developer tools service with rich schema
  if (isDeveloperToolsResource(resourceType)) {
    const service = getDeveloperToolsServiceByTerraformResource(resourceType);
    if (service) {
      return convertDeveloperToolsServiceToSchema(service);
    }
  }
  
  // Check if it's a machine learning service with rich schema
  if (isMachineLearningResource(resourceType)) {
    const service = getMachineLearningServiceByTerraformResource(resourceType);
    if (service) {
      return convertMachineLearningServiceToSchema(service);
    }
  }
  
  // Check if it's a management service with rich schema
  if (isManagementResource(resourceType)) {
    const service = getManagementServiceByTerraformResource(resourceType);
    if (service) {
      return convertManagementServiceToSchema(service);
    }
  }
  
  // Check if it's a messaging service with rich schema
  if (isMessagingResource(resourceType)) {
    const service = getMessagingServiceByTerraformResource(resourceType);
    if (service) {
      return convertMessagingServiceToSchema(service);
    }
  }
  
  // Check if it's a serverless service with rich schema
  if (isServerlessResource(resourceType)) {
    const service = getServerlessServiceByTerraformResource(resourceType);
    if (service) {
      return convertServerlessServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure analytics service with rich schema
  if (isAzureAnalyticsResource(resourceType)) {
    const service = getAzureAnalyticsServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureAnalyticsServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure compute service with rich schema
  if (isAzureComputeResource(resourceType)) {
    const service = getAzureComputeServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureComputeServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure containers service with rich schema
  if (isAzureContainersResource(resourceType)) {
    const service = getAzureContainersServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureContainersServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure database service with rich schema
  if (isAzureDatabaseResource(resourceType)) {
    const service = getAzureDatabaseServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureDatabaseServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure developer-tools service with rich schema
  if (isAzureDeveloperToolsResource(resourceType)) {
    const service = getAzureDeveloperToolsServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureDeveloperToolsServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure machine-learning service with rich schema
  if (isAzureMachineLearningResource(resourceType)) {
    const service = getAzureMachineLearningServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureMachineLearningServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure management service with rich schema
  if (isAzureManagementResource(resourceType)) {
    const service = getAzureManagementServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureManagementServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure messaging service with rich schema
  if (isAzureMessagingResource(resourceType)) {
    const service = getAzureMessagingServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureMessagingServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure networking service with rich schema
  if (isAzureNetworkingResource(resourceType)) {
    const service = getAzureNetworkingServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureNetworkingServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure security service with rich schema
  if (isAzureSecurityResource(resourceType)) {
    const service = getAzureSecurityServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureSecurityServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure serverless service with rich schema
  if (isAzureServerlessResource(resourceType)) {
    const service = getAzureServerlessServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureServerlessServiceToSchema(service);
    }
  }
  
  // Check if it's an Azure storage service with rich schema
  if (isAzureStorageResource(resourceType)) {
    const service = getAzureStorageServiceByTerraformResource(resourceType);
    if (service) {
      return convertAzureStorageServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP analytics service with rich schema
  if (isGCPAnalyticsResource(resourceType)) {
    const service = getGCPAnalyticsServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPAnalyticsServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP compute service with rich schema
  if (isGCPComputeResource(resourceType)) {
    const service = getGCPComputeServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPComputeServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP containers service with rich schema
  if (isGCPContainersResource(resourceType)) {
    const service = getGCPContainersServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPContainersServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP database service with rich schema
  if (isGCPDatabaseResource(resourceType)) {
    const service = getGCPDatabaseServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPDatabaseServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP developer tools service with rich schema
  if (isGCPDeveloperToolsResource(resourceType)) {
    const service = getGCPDeveloperToolsServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPDeveloperToolsServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP machine learning service with rich schema
  if (isGCPMachineLearningResource(resourceType)) {
    const service = getGCPMachineLearningServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPMachineLearningServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP management service with rich schema
  if (isGCPManagementResource(resourceType)) {
    const service = getGCPManagementServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPManagementServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP messaging service with rich schema
  if (isGCPMessagingResource(resourceType)) {
    const service = getGCPMessagingServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPMessagingServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP networking service with rich schema
  if (isGCPNetworkingResource(resourceType)) {
    const service = getGCPNetworkingServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPNetworkingServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP security service with rich schema
  if (isGCPSecurityResource(resourceType)) {
    const service = getGCPSecurityServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPSecurityServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP serverless service with rich schema
  if (isGCPServerlessResource(resourceType)) {
    const service = getGCPServerlessServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPServerlessServiceToSchema(service);
    }
  }
  
  // Check if it's a GCP storage service with rich schema
  if (isGCPStorageResource(resourceType)) {
    const service = getGCPStorageServiceByTerraformResource(resourceType);
    if (service) {
      return convertGCPStorageServiceToSchema(service);
    }
  }
  
  // Get icon from service icons
  const icon = getServiceIcon(resourceType);
  
  // Determine category from resource type prefix
  let category = 'General';
  if (resourceType.includes('vpc') || resourceType.includes('subnet') || resourceType.includes('gateway') || 
      resourceType.includes('route') || resourceType.includes('security_group') || resourceType.includes('lb')) {
    category = 'networking';
  } else if (resourceType.includes('db_') || resourceType.includes('rds') || resourceType.includes('dynamodb') ||
             resourceType.includes('elasticache') || resourceType.includes('redshift')) {
    category = 'database';
  } else if (resourceType.includes('s3') || resourceType.includes('ebs') || resourceType.includes('efs') ||
             resourceType.includes('fsx') || resourceType.includes('glacier') || resourceType.includes('backup')) {
    category = 'storage';
  } else if (resourceType.includes('ecs') || resourceType.includes('ecr') || resourceType.includes('eks')) {
    category = 'containers';
  } else if (resourceType.includes('lambda') || resourceType.includes('sfn')) {
    category = 'serverless';
  } else if (resourceType.includes('iam') || resourceType.includes('kms') || resourceType.includes('secret') ||
             resourceType.includes('waf') || resourceType.includes('cognito') || resourceType.includes('acm')) {
    category = 'security';
  } else if (resourceType.includes('sqs') || resourceType.includes('sns') || resourceType.includes('kinesis') ||
             resourceType.includes('eventbridge')) {
    category = 'messaging';
  }
  
  // Return a basic schema for unknown types
  return {
    type: resourceType,
    label: resourceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category,
    provider: resourceType.startsWith('aws_') ? 'aws' : resourceType.startsWith('azurerm_') ? 'azure' : 'gcp',
    icon,
    fields: DEFAULT_FIELDS,
  };
}

/**
 * Check if a resource type has a rich schema definition
 */
export function hasRichSchema(resourceType: string): boolean {
  return isComputeResource(resourceType) || isStorageResource(resourceType) || isDatabaseResource(resourceType) || isNetworkingResource(resourceType) || isSecurityResource(resourceType) || isAnalyticsResource(resourceType) || isContainersResource(resourceType) || isDeveloperToolsResource(resourceType) || isMachineLearningResource(resourceType) || isManagementResource(resourceType) || isMessagingResource(resourceType) || isServerlessResource(resourceType) || isAzureAnalyticsResource(resourceType) || isAzureComputeResource(resourceType) || isAzureContainersResource(resourceType) || isAzureDatabaseResource(resourceType) || isAzureDeveloperToolsResource(resourceType) || isAzureMachineLearningResource(resourceType) || isAzureManagementResource(resourceType) || isAzureMessagingResource(resourceType) || isAzureNetworkingResource(resourceType) || isAzureSecurityResource(resourceType) || isAzureServerlessResource(resourceType) || isAzureStorageResource(resourceType) || isGCPAnalyticsResource(resourceType) || isGCPComputeResource(resourceType);
}

/**
 * Validate a field value against its schema
 */
export function validateField(field: SchemaField, value: unknown): string | null {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }
  return null;
}

/**
 * Validate all fields in a schema
 */
export function validateSchema(schema: ResourceSchema, values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const field of schema.fields) {
    const error = validateField(field, values[field.name]);
    if (error) {
      errors[field.name] = error;
    }
  }
  
  return errors;
}

/**
 * Get default values from schema
 */
export function getDefaultValues(schema: ResourceSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  
  for (const field of schema.fields) {
    if (field.default !== undefined) {
      defaults[field.name] = field.default;
    }
  }
  
  return defaults;
}

/**
 * Get fields by group
 */
export function getSchemaFieldsByGroup(schema: ResourceSchema, group?: string): SchemaField[] {
  if (group) {
    return schema.fields.filter(field => field.group === group);
  }
  return schema.fields;
}

// Re-export for convenience
export { getComputeIcon, isComputeResource, COMPUTE_TERRAFORM_RESOURCES } from '../aws/computeServicesData';
export { getStorageIcon, isStorageResource, STORAGE_TERRAFORM_RESOURCES } from '../aws/storageServicesData';
export { getDatabaseIcon, isDatabaseResource, DATABASE_TERRAFORM_RESOURCES } from '../aws/databaseServicesData';
export { getNetworkingIcon, isNetworkingResource, NETWORKING_TERRAFORM_RESOURCES } from '../aws/networkingServicesData';
export { getSecurityIcon, isSecurityResource, SECURITY_TERRAFORM_RESOURCES } from '../aws/securityServicesData';
export { getAnalyticsIcon, isAnalyticsResource, ANALYTICS_TERRAFORM_RESOURCES } from '../aws/analyticsServicesData';
export { getContainersIcon, isContainersResource, CONTAINERS_TERRAFORM_RESOURCES } from '../aws/containersServicesData';
export { getDeveloperToolsIcon, isDeveloperToolsResource, DEVELOPER_TOOLS_TERRAFORM_RESOURCES } from '../aws/developerToolsServicesData';
export { getMachineLearningIcon, isMachineLearningResource, MACHINE_LEARNING_TERRAFORM_RESOURCES } from '../aws/machineLearningServicesData';
export { getManagementIcon, isManagementResource, MANAGEMENT_TERRAFORM_RESOURCES } from '../aws/managementServicesData';
export { getMessagingIcon, isMessagingResource, MESSAGING_TERRAFORM_RESOURCES } from '../aws/messagingServicesData';
export { getServerlessIcon, isServerlessResource, SERVERLESS_TERRAFORM_RESOURCES } from '../aws/serverlessServicesData';
export { getAnalyticsIcon as getAzureAnalyticsIcon, isAnalyticsResource as isAzureAnalyticsResource, ANALYTICS_TERRAFORM_RESOURCES as AZURE_ANALYTICS_TERRAFORM_RESOURCES } from '../azure/analyticsServicesData';
export { getComputeIcon as getAzureComputeIcon, isComputeResource as isAzureComputeResource, COMPUTE_TERRAFORM_RESOURCES as AZURE_COMPUTE_TERRAFORM_RESOURCES } from '../azure/computeServicesData';
export { getContainersIcon as getAzureContainersIcon, isContainersResource as isAzureContainersResource, CONTAINERS_TERRAFORM_RESOURCES as AZURE_CONTAINERS_TERRAFORM_RESOURCES } from '../azure/containersServicesData';
export { getDatabaseIcon as getAzureDatabaseIcon, isDatabaseResource as isAzureDatabaseResource, DATABASE_TERRAFORM_RESOURCES as AZURE_DATABASE_TERRAFORM_RESOURCES } from '../azure/databaseServicesData';
export { getDeveloperToolsIcon as getAzureDeveloperToolsIcon, isDeveloperToolsResource as isAzureDeveloperToolsResource, DEVELOPER_TOOLS_TERRAFORM_RESOURCES as AZURE_DEVELOPER_TOOLS_TERRAFORM_RESOURCES } from '../azure/developerToolsServicesData';
export { getMachineLearningIcon as getAzureMachineLearningIcon, isMachineLearningResource as isAzureMachineLearningResource, MACHINE_LEARNING_TERRAFORM_RESOURCES as AZURE_MACHINE_LEARNING_TERRAFORM_RESOURCES } from '../azure/machineLearningServicesData';
export { getManagementIcon as getAzureManagementIcon, isManagementResource as isAzureManagementResource, MANAGEMENT_TERRAFORM_RESOURCES as AZURE_MANAGEMENT_TERRAFORM_RESOURCES } from '../azure/managementServicesData';
export { getMessagingIcon as getAzureMessagingIcon, isMessagingResource as isAzureMessagingResource, MESSAGING_TERRAFORM_RESOURCES as AZURE_MESSAGING_TERRAFORM_RESOURCES } from '../azure/messagingServicesData';
export { getNetworkingIcon as getAzureNetworkingIcon, isNetworkingResource as isAzureNetworkingResource, NETWORKING_TERRAFORM_RESOURCES as AZURE_NETWORKING_TERRAFORM_RESOURCES } from '../azure/networkingServicesData';
export { getSecurityIcon as getAzureSecurityIcon, isSecurityResource as isAzureSecurityResource, SECURITY_TERRAFORM_RESOURCES as AZURE_SECURITY_TERRAFORM_RESOURCES } from '../azure/securityServicesData';
export { getServerlessIcon as getAzureServerlessIcon, isServerlessResource as isAzureServerlessResource, SERVERLESS_TERRAFORM_RESOURCES as AZURE_SERVERLESS_TERRAFORM_RESOURCES } from '../azure/serverlessServicesData';
export { getStorageIcon as getAzureStorageIcon, isStorageResource as isAzureStorageResource, STORAGE_TERRAFORM_RESOURCES as AZURE_STORAGE_TERRAFORM_RESOURCES } from '../azure/storageServicesData';
export { getAnalyticsIcon as getGCPAnalyticsIcon, isAnalyticsResource as isGCPAnalyticsResource, ANALYTICS_TERRAFORM_RESOURCES as GCP_ANALYTICS_TERRAFORM_RESOURCES } from '../gcp/analyticsServicesData';
export { getComputeIcon as getGCPComputeIcon, isComputeResource as isGCPComputeResource, COMPUTE_TERRAFORM_RESOURCES as GCP_COMPUTE_TERRAFORM_RESOURCES } from '../gcp/computeServicesData';
export { getContainersIcon as getGCPContainersIcon, isContainersResource as isGCPContainersResource, CONTAINERS_TERRAFORM_RESOURCES as GCP_CONTAINERS_TERRAFORM_RESOURCES } from '../gcp/containersServicesData';
