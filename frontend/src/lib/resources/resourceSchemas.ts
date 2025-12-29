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

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'checkbox' | 'tags' | 'reference' | 'textarea' | 'list';
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
    case 'boolean': return 'checkbox';
    case 'string': return 'text';
    case 'list(string)': return 'list';
    case 'set(string)': return 'list';
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
 * Generic function to convert a service definition to schema
 */
function convertServiceToSchema<T extends {
  name: string;
  terraform_resource: string;
  icon?: string;
  inputs: {
    required: Array<{
      name: string;
      type: string;
      description?: string;
      example?: string;
      default?: unknown;
      options?: string[];
      reference?: string;
    }>;
    optional: Array<{
      name: string;
      type: string;
      description?: string;
      example?: string;
      default?: unknown;
      options?: string[];
      reference?: string;
    }>;
    blocks?: ServiceBlock[];
  };
  outputs?: SchemaOutput[];
}>(service: T, category: string, provider: string = 'aws'): ResourceSchema {
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
    category,
    provider,
    icon: service.icon,
    fields,
    blocks,
    outputs: service.outputs,
  };
}

// AWS Service converters
function convertComputeServiceToSchema(service: ComputeServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'compute', 'aws');
}

function convertStorageServiceToSchema(service: StorageServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'storage', 'aws');
}

function convertDatabaseServiceToSchema(service: DatabaseServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'database', 'aws');
}

function convertNetworkingServiceToSchema(service: NetworkingServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'networking', 'aws');
}

function convertSecurityServiceToSchema(service: SecurityServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'security', 'aws');
}

function convertAnalyticsServiceToSchema(service: AnalyticsServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'analytics', 'aws');
}

function convertContainersServiceToSchema(service: ContainersServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'containers', 'aws');
}

function convertDeveloperToolsServiceToSchema(service: DeveloperToolsServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'developer-tools', 'aws');
}

function convertMachineLearningServiceToSchema(service: MachineLearningServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'machine-learning', 'aws');
}

function convertManagementServiceToSchema(service: ManagementServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'management', 'aws');
}

function convertMessagingServiceToSchema(service: MessagingServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'messaging', 'aws');
}

function convertServerlessServiceToSchema(service: ServerlessServiceDefinition): ResourceSchema {
  return convertServiceToSchema(service, 'serverless', 'aws');
}

/**
 * Get icon for a resource type (AWS only)
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
  return undefined;
}

/**
 * Check if a resource has an icon (AWS only)
 */
export function hasServiceIcon(resourceType: string): boolean {
  return !!(
    COMPUTE_ICONS[resourceType] ||
    STORAGE_ICONS[resourceType] ||
    DATABASE_ICONS[resourceType] ||
    NETWORKING_ICONS[resourceType] ||
    SECURITY_ICONS[resourceType] ||
    ANALYTICS_ICONS[resourceType] ||
    CONTAINERS_ICONS[resourceType] ||
    DEVELOPER_TOOLS_ICONS[resourceType] ||
    MACHINE_LEARNING_ICONS[resourceType] ||
    MANAGEMENT_ICONS[resourceType] ||
    MESSAGING_ICONS[resourceType] ||
    SERVERLESS_ICONS[resourceType]
  );
}

/**
 * Get schema for a resource type (AWS only)
 */
export function getResourceSchema(resourceType: string): ResourceSchema {
  // Check AWS compute service
  if (isComputeResource(resourceType)) {
    const service = getComputeServiceByTerraformResource(resourceType);
    if (service) return convertComputeServiceToSchema(service);
  }

  // Check AWS storage service
  if (isStorageResource(resourceType)) {
    const service = getStorageServiceByTerraformResource(resourceType);
    if (service) return convertStorageServiceToSchema(service);
  }

  // Check AWS database service
  if (isDatabaseResource(resourceType)) {
    const service = getDatabaseServiceByTerraformResource(resourceType);
    if (service) return convertDatabaseServiceToSchema(service);
  }

  // Check AWS networking service
  if (isNetworkingResource(resourceType)) {
    const service = getNetworkingServiceByTerraformResource(resourceType);
    if (service) return convertNetworkingServiceToSchema(service);
  }

  // Check AWS security service
  if (isSecurityResource(resourceType)) {
    const service = getSecurityServiceByTerraformResource(resourceType);
    if (service) return convertSecurityServiceToSchema(service);
  }

  // Check AWS analytics service
  if (isAnalyticsResource(resourceType)) {
    const service = getAnalyticsServiceByTerraformResource(resourceType);
    if (service) return convertAnalyticsServiceToSchema(service);
  }

  // Check AWS containers service
  if (isContainersResource(resourceType)) {
    const service = getContainersServiceByTerraformResource(resourceType);
    if (service) return convertContainersServiceToSchema(service);
  }

  // Check AWS developer tools service
  if (isDeveloperToolsResource(resourceType)) {
    const service = getDeveloperToolsServiceByTerraformResource(resourceType);
    if (service) return convertDeveloperToolsServiceToSchema(service);
  }

  // Check AWS machine learning service
  if (isMachineLearningResource(resourceType)) {
    const service = getMachineLearningServiceByTerraformResource(resourceType);
    if (service) return convertMachineLearningServiceToSchema(service);
  }

  // Check AWS management service
  if (isManagementResource(resourceType)) {
    const service = getManagementServiceByTerraformResource(resourceType);
    if (service) return convertManagementServiceToSchema(service);
  }

  // Check AWS messaging service
  if (isMessagingResource(resourceType)) {
    const service = getMessagingServiceByTerraformResource(resourceType);
    if (service) return convertMessagingServiceToSchema(service);
  }

  // Check AWS serverless service
  if (isServerlessResource(resourceType)) {
    const service = getServerlessServiceByTerraformResource(resourceType);
    if (service) return convertServerlessServiceToSchema(service);
  }

  // Determine category from resource type
  let category = 'general';
  if (resourceType.includes('compute') || resourceType.includes('instance') || resourceType.includes('ec2')) {
    category = 'compute';
  } else if (resourceType.includes('storage') || resourceType.includes('s3') || resourceType.includes('bucket')) {
    category = 'storage';
  } else if (resourceType.includes('database') || resourceType.includes('rds') || resourceType.includes('dynamodb')) {
    category = 'database';
  } else if (resourceType.includes('network') || resourceType.includes('vpc') || resourceType.includes('subnet')) {
    category = 'networking';
  }

  // Get icon if available
  const icon = getServiceIcon(resourceType);

  // Return default schema
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
 * Check if a resource type has a rich schema definition (AWS only)
 */
export function hasRichSchema(resourceType: string): boolean {
  return (
    isComputeResource(resourceType) ||
    isStorageResource(resourceType) ||
    isDatabaseResource(resourceType) ||
    isNetworkingResource(resourceType) ||
    isSecurityResource(resourceType) ||
    isAnalyticsResource(resourceType) ||
    isContainersResource(resourceType) ||
    isDeveloperToolsResource(resourceType) ||
    isMachineLearningResource(resourceType) ||
    isManagementResource(resourceType) ||
    isMessagingResource(resourceType) ||
    isServerlessResource(resourceType)
  );
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

// Re-export AWS service utilities
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
