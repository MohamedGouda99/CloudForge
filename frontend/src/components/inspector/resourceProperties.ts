import { PropertyDefinition } from './types';

// Default properties for unknown resource types
export const DEFAULT_PROPERTIES: PropertyDefinition[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Resource name', required: true },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
];

// Resource property definitions for common AWS/Azure/GCP resources
export const RESOURCE_PROPERTIES: Record<string, PropertyDefinition[]> = {
  aws_instance: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'my-instance', required: true },
    { name: 'instance_type', label: 'Instance Type', type: 'select', options: [
      { value: 't2.micro', label: 't2.micro (1 vCPU, 1 GiB)' },
      { value: 't2.small', label: 't2.small (1 vCPU, 2 GiB)' },
      { value: 't2.medium', label: 't2.medium (2 vCPU, 4 GiB)' },
      { value: 't3.micro', label: 't3.micro (2 vCPU, 1 GiB)' },
      { value: 't3.small', label: 't3.small (2 vCPU, 2 GiB)' },
      { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GiB)' },
      { value: 'm5.large', label: 'm5.large (2 vCPU, 8 GiB)' },
      { value: 'm5.xlarge', label: 'm5.xlarge (4 vCPU, 16 GiB)' },
    ]},
    { name: 'ami', label: 'AMI ID', type: 'text', placeholder: 'ami-xxxxxxxxx' },
    { name: 'key_name', label: 'Key Pair', type: 'text', placeholder: 'my-key-pair' },
    { name: 'associate_public_ip', label: 'Associate Public IP', type: 'checkbox' },
  ],
  aws_s3_bucket: [
    { name: 'name', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
    { name: 'acl', label: 'ACL', type: 'select', options: [
      { value: 'private', label: 'Private' },
      { value: 'public-read', label: 'Public Read' },
      { value: 'public-read-write', label: 'Public Read/Write' },
    ]},
    { name: 'versioning', label: 'Enable Versioning', type: 'checkbox' },
    { name: 'encryption', label: 'Enable Encryption', type: 'checkbox' },
  ],
  aws_vpc: [
    { name: 'name', label: 'VPC Name', type: 'text', placeholder: 'my-vpc', required: true },
    { name: 'cidr_block', label: 'CIDR Block', type: 'text', placeholder: '10.0.0.0/16', required: true },
    { name: 'enable_dns_hostnames', label: 'Enable DNS Hostnames', type: 'checkbox' },
    { name: 'enable_dns_support', label: 'Enable DNS Support', type: 'checkbox' },
  ],
  aws_subnet: [
    { name: 'name', label: 'Subnet Name', type: 'text', placeholder: 'my-subnet', required: true },
    { name: 'cidr_block', label: 'CIDR Block', type: 'text', placeholder: '10.0.1.0/24', required: true },
    { name: 'availability_zone', label: 'Availability Zone', type: 'text', placeholder: 'us-east-1a' },
    { name: 'map_public_ip_on_launch', label: 'Map Public IP on Launch', type: 'checkbox' },
  ],
  aws_security_group: [
    { name: 'name', label: 'Security Group Name', type: 'text', placeholder: 'my-sg', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Security group description' },
  ],
  aws_rds_instance: [
    { name: 'name', label: 'DB Identifier', type: 'text', placeholder: 'my-database', required: true },
    { name: 'engine', label: 'Engine', type: 'select', options: [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgres', label: 'PostgreSQL' },
      { value: 'mariadb', label: 'MariaDB' },
      { value: 'sqlserver-ex', label: 'SQL Server Express' },
    ]},
    { name: 'instance_class', label: 'Instance Class', type: 'select', options: [
      { value: 'db.t3.micro', label: 'db.t3.micro' },
      { value: 'db.t3.small', label: 'db.t3.small' },
      { value: 'db.t3.medium', label: 'db.t3.medium' },
      { value: 'db.r5.large', label: 'db.r5.large' },
    ]},
    { name: 'allocated_storage', label: 'Storage (GB)', type: 'number', placeholder: '20' },
    { name: 'multi_az', label: 'Multi-AZ Deployment', type: 'checkbox' },
  ],
  aws_lambda_function: [
    { name: 'name', label: 'Function Name', type: 'text', placeholder: 'my-function', required: true },
    { name: 'runtime', label: 'Runtime', type: 'select', options: [
      { value: 'nodejs18.x', label: 'Node.js 18.x' },
      { value: 'nodejs20.x', label: 'Node.js 20.x' },
      { value: 'python3.11', label: 'Python 3.11' },
      { value: 'python3.12', label: 'Python 3.12' },
      { value: 'java17', label: 'Java 17' },
      { value: 'go1.x', label: 'Go 1.x' },
    ]},
    { name: 'memory_size', label: 'Memory (MB)', type: 'number', placeholder: '128' },
    { name: 'timeout', label: 'Timeout (seconds)', type: 'number', placeholder: '30' },
  ],
};
