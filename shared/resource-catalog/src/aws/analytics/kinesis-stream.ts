/**
 * AWS Kinesis Data Stream Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kinesis_stream
 */

import type { ServiceDefinition } from '../../types';

const ANALYTICS_ICONS = {
  KINESIS: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Kinesis_64.svg',
};

export const awsKinesisStream: ServiceDefinition = {
  id: 'kinesis_stream',
  terraform_resource: 'aws_kinesis_stream',
  name: 'Kinesis Data Stream',
  description: 'Real-time data streaming service for continuous data capture',
  icon: ANALYTICS_ICONS.KINESIS,
  category: 'analytics',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the Kinesis stream',
        validation: { pattern: '^[a-zA-Z0-9_.-]+$', maxLength: 128 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'shard_count',
        type: 'number',
        description: 'Number of shards (required in provisioned mode)',
        validation: { min: 1 },
        group: 'basic',
      },
      {
        name: 'retention_period',
        type: 'number',
        description: 'Data retention period in hours',
        default: 24,
        validation: { min: 24, max: 8760 },
        group: 'basic',
      },
      {
        name: 'encryption_type',
        type: 'string',
        description: 'Encryption type',
        default: 'NONE',
        options: ['NONE', 'KMS'],
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
        name: 'enforce_consumer_deletion',
        type: 'bool',
        description: 'Enforce deletion of consumers before stream',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the stream',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'stream_mode_details',
        description: 'Stream capacity mode configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'stream_mode',
            type: 'string',
            description: 'Capacity mode',
            default: 'PROVISIONED',
            options: ['PROVISIONED', 'ON_DEMAND'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Stream name' },
    { name: 'arn', type: 'string', description: 'ARN of the stream' },
    { name: 'name', type: 'string', description: 'Name of the stream' },
    { name: 'shard_count', type: 'number', description: 'Current number of shards' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_kinesis_stream',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [{ setArg: 'kms_key_id', toTargetAttr: 'id' }],
      },
    ],
  },
};
