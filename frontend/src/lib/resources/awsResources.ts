// AWS-specific resource definitions

export interface AWSResourceField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select';
  required?: boolean;
  default?: unknown;
  description?: string;
  options?: string[];
}

export interface AWSResourceSchema {
  type: string;
  label: string;
  category: string;
  fields: AWSResourceField[];
}

// Common AWS resource schemas
export const AWS_RESOURCE_SCHEMAS: Record<string, AWSResourceSchema> = {
  aws_instance: {
    type: 'aws_instance',
    label: 'EC2 Instance',
    category: 'Compute',
    fields: [
      { name: 'ami', type: 'string', required: true, description: 'AMI ID' },
      { name: 'instance_type', type: 'select', required: true, options: ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 't3.medium', 'm5.large', 'm5.xlarge'], default: 't3.micro' },
      { name: 'key_name', type: 'string', description: 'SSH key pair name' },
      { name: 'vpc_security_group_ids', type: 'array', description: 'Security group IDs' },
      { name: 'subnet_id', type: 'string', description: 'Subnet ID' },
      { name: 'associate_public_ip_address', type: 'boolean', default: false },
      { name: 'tags', type: 'object', description: 'Resource tags' },
    ],
  },
  aws_vpc: {
    type: 'aws_vpc',
    label: 'VPC',
    category: 'Networking',
    fields: [
      { name: 'cidr_block', type: 'string', required: true, default: '10.0.0.0/16', description: 'VPC CIDR block' },
      { name: 'enable_dns_hostnames', type: 'boolean', default: true },
      { name: 'enable_dns_support', type: 'boolean', default: true },
      { name: 'tags', type: 'object', description: 'Resource tags' },
    ],
  },
  aws_subnet: {
    type: 'aws_subnet',
    label: 'Subnet',
    category: 'Networking',
    fields: [
      { name: 'vpc_id', type: 'string', required: true, description: 'VPC ID' },
      { name: 'cidr_block', type: 'string', required: true, description: 'Subnet CIDR block' },
      { name: 'availability_zone', type: 'string', description: 'Availability zone' },
      { name: 'map_public_ip_on_launch', type: 'boolean', default: false },
      { name: 'tags', type: 'object', description: 'Resource tags' },
    ],
  },
  aws_s3_bucket: {
    type: 'aws_s3_bucket',
    label: 'S3 Bucket',
    category: 'Storage',
    fields: [
      { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
      { name: 'acl', type: 'select', options: ['private', 'public-read', 'public-read-write'], default: 'private' },
      { name: 'tags', type: 'object', description: 'Resource tags' },
    ],
  },
  aws_lambda_function: {
    type: 'aws_lambda_function',
    label: 'Lambda Function',
    category: 'Serverless',
    fields: [
      { name: 'function_name', type: 'string', required: true, description: 'Function name' },
      { name: 'runtime', type: 'select', required: true, options: ['nodejs18.x', 'nodejs16.x', 'python3.11', 'python3.10', 'python3.9', 'java17', 'java11', 'go1.x'], default: 'nodejs18.x' },
      { name: 'handler', type: 'string', required: true, default: 'index.handler', description: 'Function handler' },
      { name: 'memory_size', type: 'number', default: 128, description: 'Memory in MB' },
      { name: 'timeout', type: 'number', default: 3, description: 'Timeout in seconds' },
      { name: 'role', type: 'string', required: true, description: 'IAM role ARN' },
      { name: 'tags', type: 'object', description: 'Resource tags' },
    ],
  },
};

/**
 * Get AWS resource schema by type
 */
export function getAWSResourceSchema(resourceType: string): AWSResourceSchema | undefined {
  return AWS_RESOURCE_SCHEMAS[resourceType];
}

/**
 * Get all AWS resource types
 */
export function getAWSResourceTypes(): string[] {
  return Object.keys(AWS_RESOURCE_SCHEMAS);
}

