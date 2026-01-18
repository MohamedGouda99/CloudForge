/**
 * AWS ElastiCache Replication Group Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/elasticache_replication_group
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsElasticacheReplicationGroup: ServiceDefinition = {
  id: 'elasticache_replication_group',
  terraform_resource: 'aws_elasticache_replication_group',
  name: 'ElastiCache Replication Group',
  description: 'Redis replication group with automatic failover',
  icon: DATABASE_ICONS.ELASTICACHE,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'replication_group_id',
        type: 'string',
        description: 'Replication group identifier',
        validation: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 40 },
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'User-created description for the replication group',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'node_type',
        type: 'string',
        description: 'Instance type for the cache nodes',
        example: 'cache.t3.micro',
        options: [
          'cache.t3.micro', 'cache.t3.small', 'cache.t3.medium',
          'cache.m6g.large', 'cache.m6g.xlarge', 'cache.m6g.2xlarge',
          'cache.r6g.large', 'cache.r6g.xlarge', 'cache.r6g.2xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'num_cache_clusters',
        type: 'number',
        description: 'Number of cache clusters (primary + replicas)',
        default: 1,
        validation: { min: 1, max: 6 },
        group: 'basic',
      },
      {
        name: 'automatic_failover_enabled',
        type: 'bool',
        description: 'Enable automatic failover',
        default: false,
        group: 'basic',
      },
      {
        name: 'multi_az_enabled',
        type: 'bool',
        description: 'Enable Multi-AZ support',
        default: false,
        group: 'basic',
      },
      {
        name: 'engine',
        type: 'string',
        description: 'Cache engine',
        default: 'redis',
        options: ['redis'],
        group: 'basic',
      },
      {
        name: 'engine_version',
        type: 'string',
        description: 'Engine version',
        example: '7.0',
        group: 'basic',
      },
      {
        name: 'port',
        type: 'number',
        description: 'Port number for cache cluster',
        default: 6379,
        group: 'networking',
      },
      {
        name: 'parameter_group_name',
        type: 'string',
        description: 'Name of the parameter group',
        group: 'advanced',
      },
      {
        name: 'subnet_group_name',
        type: 'string',
        description: 'Name of the subnet group',
        reference: 'aws_elasticache_subnet_group.name',
        group: 'networking',
      },
      {
        name: 'security_group_ids',
        type: 'set(string)',
        description: 'Security group IDs',
        reference: 'aws_security_group.id',
        group: 'networking',
      },
      {
        name: 'at_rest_encryption_enabled',
        type: 'bool',
        description: 'Enable encryption at rest',
        default: false,
        group: 'security',
      },
      {
        name: 'transit_encryption_enabled',
        type: 'bool',
        description: 'Enable in-transit encryption',
        default: false,
        group: 'security',
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS key ID for encryption',
        reference: 'aws_kms_key.id',
        group: 'security',
      },
      {
        name: 'auth_token',
        type: 'string',
        description: 'Password for AUTH command',
        sensitive: true,
        group: 'security',
      },
      {
        name: 'snapshot_retention_limit',
        type: 'number',
        description: 'Number of days to retain snapshots',
        default: 0,
        validation: { min: 0, max: 35 },
        group: 'advanced',
      },
      {
        name: 'snapshot_window',
        type: 'string',
        description: 'Daily time range for snapshots (UTC)',
        example: '05:00-09:00',
        group: 'advanced',
      },
      {
        name: 'maintenance_window',
        type: 'string',
        description: 'Weekly maintenance window',
        example: 'sun:05:00-sun:06:00',
        group: 'advanced',
      },
      {
        name: 'apply_immediately',
        type: 'bool',
        description: 'Apply changes immediately',
        default: false,
        group: 'advanced',
      },
      {
        name: 'auto_minor_version_upgrade',
        type: 'bool',
        description: 'Enable auto minor version upgrades',
        default: true,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the replication group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'log_delivery_configuration',
        description: 'Log delivery configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'destination',
            type: 'string',
            description: 'Name of CloudWatch Logs group or Kinesis Data Firehose stream',
          },
          {
            name: 'destination_type',
            type: 'string',
            description: 'Destination type',
            options: ['cloudwatch-logs', 'kinesis-firehose'],
          },
          {
            name: 'log_format',
            type: 'string',
            description: 'Log format',
            options: ['text', 'json'],
          },
          {
            name: 'log_type',
            type: 'string',
            description: 'Log type',
            options: ['slow-log', 'engine-log'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Replication group ID' },
    { name: 'arn', type: 'string', description: 'ARN of the replication group' },
    { name: 'primary_endpoint_address', type: 'string', description: 'Primary endpoint address' },
    { name: 'reader_endpoint_address', type: 'string', description: 'Reader endpoint address' },
    { name: 'configuration_endpoint_address', type: 'string', description: 'Configuration endpoint address' },
    { name: 'cluster_enabled', type: 'bool', description: 'Whether cluster mode is enabled' },
    { name: 'member_clusters', type: 'set(string)', description: 'Member cache cluster IDs' },
  ],

  terraform: {
    resourceType: 'aws_elasticache_replication_group',
    requiredArgs: ['replication_group_id', 'description'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      primary_endpoint_address: 'primary_endpoint_address',
      reader_endpoint_address: 'reader_endpoint_address',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_group_ids', toTargetAttr: 'id' }],
      },
    ],
  },
};
