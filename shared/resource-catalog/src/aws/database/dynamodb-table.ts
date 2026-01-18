/**
 * AWS DynamoDB Table Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsDynamodbTable: ServiceDefinition = {
  id: 'dynamodb_table',
  terraform_resource: 'aws_dynamodb_table',
  name: 'DynamoDB Table',
  description: 'Fully managed NoSQL database table with single-digit millisecond performance at any scale',
  icon: DATABASE_ICONS.DYNAMODB,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the table (must be unique within a region)',
        validation: { pattern: '^[a-zA-Z0-9_.-]+$', minLength: 3, maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'hash_key',
        type: 'string',
        description: 'The attribute to use as the partition key (must be defined as an attribute)',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'range_key',
        type: 'string',
        description: 'The attribute to use as the sort key (must be defined as an attribute)',
        group: 'basic',
      },
      {
        name: 'billing_mode',
        type: 'string',
        description: 'Billing mode for the table',
        default: 'PROVISIONED',
        options: ['PROVISIONED', 'PAY_PER_REQUEST'],
        group: 'basic',
      },
      {
        name: 'read_capacity',
        type: 'number',
        description: 'Number of read capacity units (required for PROVISIONED billing mode)',
        validation: { min: 1 },
        group: 'basic',
      },
      {
        name: 'write_capacity',
        type: 'number',
        description: 'Number of write capacity units (required for PROVISIONED billing mode)',
        validation: { min: 1 },
        group: 'basic',
      },
      {
        name: 'table_class',
        type: 'string',
        description: 'Storage class of the table',
        default: 'STANDARD',
        options: ['STANDARD', 'STANDARD_INFREQUENT_ACCESS'],
        group: 'advanced',
      },
      {
        name: 'deletion_protection_enabled',
        type: 'bool',
        description: 'Enable deletion protection for the table',
        default: false,
        group: 'security',
      },
      {
        name: 'stream_enabled',
        type: 'bool',
        description: 'Enable DynamoDB Streams for the table',
        default: false,
        group: 'advanced',
      },
      {
        name: 'stream_view_type',
        type: 'string',
        description: 'Type of information written to the stream when an item is modified',
        options: ['KEYS_ONLY', 'NEW_IMAGE', 'OLD_IMAGE', 'NEW_AND_OLD_IMAGES'],
        group: 'advanced',
      },
      {
        name: 'restore_source_name',
        type: 'string',
        description: 'Name of the source table to restore from',
        group: 'advanced',
      },
      {
        name: 'restore_source_table_arn',
        type: 'string',
        description: 'ARN of the source table for cross-region restore',
        group: 'advanced',
      },
      {
        name: 'restore_date_time',
        type: 'string',
        description: 'Point-in-time recovery timestamp (ISO 8601 format)',
        group: 'advanced',
      },
      {
        name: 'restore_to_latest_time',
        type: 'bool',
        description: 'Restore to the most recent recovery point',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the table',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'attribute',
        description: 'Attribute definitions for the table (required for hash_key, range_key, and index keys)',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the attribute',
          },
          {
            name: 'type',
            type: 'string',
            description: 'Attribute data type: S (String), N (Number), B (Binary)',
            options: ['S', 'N', 'B'],
          },
        ],
      },
      {
        name: 'global_secondary_index',
        description: 'Global secondary index configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the index',
          },
          {
            name: 'hash_key',
            type: 'string',
            description: 'Partition key for the index',
          },
          {
            name: 'range_key',
            type: 'string',
            description: 'Sort key for the index',
          },
          {
            name: 'projection_type',
            type: 'string',
            description: 'Projection type for the index',
            options: ['ALL', 'INCLUDE', 'KEYS_ONLY'],
          },
          {
            name: 'non_key_attributes',
            type: 'list(string)',
            description: 'Attributes to project into the index (for INCLUDE projection type)',
          },
          {
            name: 'read_capacity',
            type: 'number',
            description: 'Read capacity units for the index (PROVISIONED billing mode only)',
          },
          {
            name: 'write_capacity',
            type: 'number',
            description: 'Write capacity units for the index (PROVISIONED billing mode only)',
          },
        ],
      },
      {
        name: 'local_secondary_index',
        description: 'Local secondary index configuration (can only be defined at table creation)',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the index',
          },
          {
            name: 'range_key',
            type: 'string',
            description: 'Sort key for the index',
          },
          {
            name: 'projection_type',
            type: 'string',
            description: 'Projection type for the index',
            options: ['ALL', 'INCLUDE', 'KEYS_ONLY'],
          },
          {
            name: 'non_key_attributes',
            type: 'list(string)',
            description: 'Attributes to project into the index (for INCLUDE projection type)',
          },
        ],
      },
      {
        name: 'ttl',
        description: 'Time-to-live configuration for automatic item expiration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'attribute_name',
            type: 'string',
            description: 'Name of the table attribute to store TTL timestamp',
          },
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable TTL',
            default: false,
          },
        ],
      },
      {
        name: 'server_side_encryption',
        description: 'Server-side encryption configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable server-side encryption using KMS',
          },
          {
            name: 'kms_key_arn',
            type: 'string',
            description: 'ARN of the KMS key to use for encryption',
          },
        ],
      },
      {
        name: 'point_in_time_recovery',
        description: 'Point-in-time recovery configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable point-in-time recovery',
          },
          {
            name: 'recovery_period_in_days',
            type: 'number',
            description: 'Number of days for continuous backup retention (default: 35)',
            default: 35,
          },
        ],
      },
      {
        name: 'replica',
        description: 'Global Tables replication configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'region_name',
            type: 'string',
            description: 'Region name for the replica',
          },
          {
            name: 'kms_key_arn',
            type: 'string',
            description: 'ARN of KMS key for the replica encryption',
          },
          {
            name: 'point_in_time_recovery',
            type: 'bool',
            description: 'Enable point-in-time recovery for replica',
            default: false,
          },
          {
            name: 'propagate_tags',
            type: 'bool',
            description: 'Propagate tags from global table to replica',
            default: false,
          },
        ],
      },
      {
        name: 'on_demand_throughput',
        description: 'On-demand throughput configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'max_read_request_units',
            type: 'number',
            description: 'Maximum read request units (minimum 1, set -1 to remove)',
          },
          {
            name: 'max_write_request_units',
            type: 'number',
            description: 'Maximum write request units (minimum 1, set -1 to remove)',
          },
        ],
      },
      {
        name: 'import_table',
        description: 'Import data from S3 to create the table',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'input_format',
            type: 'string',
            description: 'Input file format (CSV, DYNAMODB_JSON, ION)',
            options: ['CSV', 'DYNAMODB_JSON', 'ION'],
          },
          {
            name: 'input_compression_type',
            type: 'string',
            description: 'Compression type for input files',
            options: ['GZIP', 'ZSTD', 'NONE'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Table name (same as name attribute)' },
    { name: 'arn', type: 'string', description: 'ARN of the DynamoDB table' },
    { name: 'stream_arn', type: 'string', description: 'ARN of the DynamoDB Table Stream (when stream_enabled is true)' },
    { name: 'stream_label', type: 'string', description: 'ISO 8601 timestamp of the stream creation' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_dynamodb_table',
    requiredArgs: ['name', 'hash_key'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
      stream_arn: 'stream_arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [],
      },
    ],
    autoResolveRules: [],
  },
};
