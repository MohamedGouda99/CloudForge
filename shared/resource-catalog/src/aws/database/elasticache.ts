/**
 * AWS ElastiCache Cluster Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/elasticache_cluster
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsElasticacheCluster: ServiceDefinition = {
  id: 'elasticache_cluster',
  terraform_resource: 'aws_elasticache_cluster',
  name: 'ElastiCache Cluster',
  description: 'Managed in-memory data store supporting Redis, Valkey, and Memcached',
  icon: DATABASE_ICONS.ELASTICACHE,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'cluster_id',
        type: 'string',
        description: 'Group identifier for the cluster (ElastiCache converts to lowercase)',
        validation: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 50 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'engine',
        type: 'string',
        description: 'Cache engine to use (required if not using replication_group_id)',
        options: ['memcached', 'redis', 'valkey'],
        group: 'basic',
      },
      {
        name: 'engine_version',
        type: 'string',
        description: 'Version of the cache engine',
        group: 'basic',
      },
      {
        name: 'node_type',
        type: 'string',
        description: 'Instance class for cache nodes',
        example: 'cache.t3.micro',
        options: [
          'cache.t3.micro', 'cache.t3.small', 'cache.t3.medium',
          'cache.t4g.micro', 'cache.t4g.small', 'cache.t4g.medium',
          'cache.m5.large', 'cache.m5.xlarge', 'cache.m5.2xlarge', 'cache.m5.4xlarge',
          'cache.m6g.large', 'cache.m6g.xlarge', 'cache.m6g.2xlarge', 'cache.m6g.4xlarge',
          'cache.r5.large', 'cache.r5.xlarge', 'cache.r5.2xlarge', 'cache.r5.4xlarge',
          'cache.r6g.large', 'cache.r6g.xlarge', 'cache.r6g.2xlarge', 'cache.r6g.4xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'num_cache_nodes',
        type: 'number',
        description: 'Number of cache nodes (Redis: must be 1, Memcached: 1-40)',
        default: 1,
        validation: { min: 1, max: 40 },
        group: 'basic',
      },
      {
        name: 'parameter_group_name',
        type: 'string',
        description: 'Name of the parameter group to associate with this cluster',
        reference: 'aws_elasticache_parameter_group.name',
        group: 'basic',
      },
      {
        name: 'subnet_group_name',
        type: 'string',
        description: 'Name of the subnet group to associate (for VPC deployment)',
        reference: 'aws_elasticache_subnet_group.name',
        group: 'networking',
      },
      {
        name: 'security_group_ids',
        type: 'list(string)',
        description: 'Security group IDs to associate (VPC only)',
        reference: 'aws_security_group.id',
        group: 'networking',
      },
      {
        name: 'replication_group_id',
        type: 'string',
        description: 'Replication group ID for Redis read replicas',
        reference: 'aws_elasticache_replication_group.id',
        group: 'advanced',
      },
      {
        name: 'availability_zone',
        type: 'string',
        description: 'Availability Zone for the cache cluster',
        group: 'basic',
      },
      {
        name: 'az_mode',
        type: 'string',
        description: 'AZ mode for Memcached clusters',
        options: ['single-az', 'cross-az'],
        group: 'advanced',
      },
      {
        name: 'preferred_availability_zones',
        type: 'list(string)',
        description: 'Preferred AZs for Memcached nodes',
        group: 'advanced',
      },
      {
        name: 'port',
        type: 'number',
        description: 'Port number for cache connections',
        group: 'networking',
      },
      {
        name: 'maintenance_window',
        type: 'string',
        description: 'Weekly maintenance window (UTC)',
        example: 'sun:05:00-sun:09:00',
        group: 'advanced',
      },
      {
        name: 'notification_topic_arn',
        type: 'string',
        description: 'SNS topic ARN for cache cluster notifications',
        reference: 'aws_sns_topic.arn',
        group: 'advanced',
      },
      {
        name: 'snapshot_window',
        type: 'string',
        description: 'Daily snapshot window for Redis (UTC)',
        example: '05:00-09:00',
        group: 'advanced',
      },
      {
        name: 'snapshot_retention_limit',
        type: 'number',
        description: 'Days to retain automatic snapshots (Redis only)',
        validation: { min: 0, max: 35 },
        group: 'advanced',
      },
      {
        name: 'snapshot_name',
        type: 'string',
        description: 'Snapshot name for data restoration (Redis only)',
        group: 'advanced',
      },
      {
        name: 'snapshot_arns',
        type: 'list(string)',
        description: 'S3 RDB snapshot ARNs for restoration (Redis only)',
        group: 'advanced',
      },
      {
        name: 'final_snapshot_identifier',
        type: 'string',
        description: 'Final snapshot name when cluster is deleted (Redis only)',
        group: 'advanced',
      },
      {
        name: 'apply_immediately',
        type: 'bool',
        description: 'Apply modifications immediately instead of during maintenance window',
        default: false,
        group: 'advanced',
      },
      {
        name: 'auto_minor_version_upgrade',
        type: 'bool',
        description: 'Enable automatic minor version upgrades (Redis 6+ only)',
        default: true,
        group: 'advanced',
      },
      {
        name: 'transit_encryption_enabled',
        type: 'bool',
        description: 'Enable encryption in-transit',
        default: false,
        group: 'security',
      },
      {
        name: 'network_type',
        type: 'string',
        description: 'IP version for network connections',
        options: ['ipv4', 'ipv6', 'dual_stack'],
        group: 'networking',
      },
      {
        name: 'ip_discovery',
        type: 'string',
        description: 'IP version to advertise in the discovery protocol',
        options: ['ipv4', 'ipv6'],
        group: 'networking',
      },
      {
        name: 'outpost_mode',
        type: 'string',
        description: 'Outpost deployment mode',
        options: ['single-outpost', 'cross-outpost'],
        group: 'advanced',
      },
      {
        name: 'preferred_outpost_arn',
        type: 'string',
        description: 'Outpost ARN for cluster creation',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the cluster',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'log_delivery_configuration',
        description: 'Log delivery configuration (up to 2 blocks)',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'destination',
            type: 'string',
            description: 'CloudWatch Logs group name or Kinesis Firehose stream name',
          },
          {
            name: 'destination_type',
            type: 'string',
            description: 'Type of log destination',
            options: ['cloudwatch-logs', 'kinesis-firehose'],
          },
          {
            name: 'log_format',
            type: 'string',
            description: 'Log format',
            options: ['json', 'text'],
          },
          {
            name: 'log_type',
            type: 'string',
            description: 'Type of log to deliver',
            options: ['slow-log', 'engine-log'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Cluster ID' },
    { name: 'arn', type: 'string', description: 'ARN of the ElastiCache cluster' },
    { name: 'cache_nodes', type: 'list(object)', description: 'List of cache node objects with id, address, port, availability_zone' },
    { name: 'cluster_address', type: 'string', description: 'Memcached DNS name without port' },
    { name: 'configuration_endpoint', type: 'string', description: 'Memcached configuration endpoint (host:port)' },
    { name: 'engine_version_actual', type: 'string', description: 'Running cache engine version' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_elasticache_cluster',
    requiredArgs: ['cluster_id'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      cluster_address: 'cluster_address',
      configuration_endpoint: 'configuration_endpoint',
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
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_elasticache_subnet_group',
        apply: [{ setArg: 'subnet_group_name', toTargetAttr: 'name' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_sns_topic',
        apply: [{ setArg: 'notification_topic_arn', toTargetAttr: 'arn' }],
      },
    ],
    autoResolveRules: [],
  },
};
