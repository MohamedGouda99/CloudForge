/**
 * AWS SQS Queue Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const awsSqsQueue: ServiceDefinition = {
  id: 'sqs_queue',
  terraform_resource: 'aws_sqs_queue',
  name: 'SQS Queue',
  description: 'Simple Queue Service for reliable, scalable message queuing',
  icon: MESSAGING_ICONS.SQS,
  category: 'messaging',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the queue (conflicts with name_prefix)',
        validation: { pattern: '^[a-zA-Z0-9_-]+(\\.fifo)?$', maxLength: 80 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name (conflicts with name)',
        group: 'basic',
      },
      {
        name: 'visibility_timeout_seconds',
        type: 'number',
        description: 'Visibility timeout in seconds (0-43200)',
        default: 30,
        validation: { min: 0, max: 43200 },
        group: 'basic',
      },
      {
        name: 'message_retention_seconds',
        type: 'number',
        description: 'Message retention period in seconds (60-1209600)',
        default: 345600,
        validation: { min: 60, max: 1209600 },
        group: 'basic',
      },
      {
        name: 'max_message_size',
        type: 'number',
        description: 'Maximum message size in bytes (1024-262144)',
        default: 262144,
        validation: { min: 1024, max: 262144 },
        group: 'advanced',
      },
      {
        name: 'delay_seconds',
        type: 'number',
        description: 'Delivery delay in seconds (0-900)',
        default: 0,
        validation: { min: 0, max: 900 },
        group: 'advanced',
      },
      {
        name: 'receive_wait_time_seconds',
        type: 'number',
        description: 'Long polling wait time in seconds (0-20)',
        default: 0,
        validation: { min: 0, max: 20 },
        group: 'advanced',
      },
      {
        name: 'policy',
        type: 'string',
        description: 'Access policy document (JSON)',
        group: 'security',
      },
      {
        name: 'redrive_policy',
        type: 'string',
        description: 'Dead-letter queue configuration (JSON with deadLetterTargetArn, maxReceiveCount)',
        group: 'advanced',
      },
      {
        name: 'redrive_allow_policy',
        type: 'string',
        description: 'Permissions for dead-letter queue (JSON with redrivePermission, sourceQueueArns)',
        group: 'advanced',
      },
      {
        name: 'fifo_queue',
        type: 'bool',
        description: 'Enable FIFO queue (name must end in .fifo)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'content_based_deduplication',
        type: 'bool',
        description: 'Enable content-based deduplication (FIFO only)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'deduplication_scope',
        type: 'string',
        description: 'Deduplication scope (FIFO only)',
        options: ['messageGroup', 'queue'],
        group: 'advanced',
      },
      {
        name: 'fifo_throughput_limit',
        type: 'string',
        description: 'FIFO throughput limit (FIFO only)',
        options: ['perQueue', 'perMessageGroupId'],
        group: 'advanced',
      },
      {
        name: 'kms_master_key_id',
        type: 'string',
        description: 'KMS key ID for server-side encryption (SSE-KMS)',
        reference: 'aws_kms_key.id',
        group: 'security',
      },
      {
        name: 'kms_data_key_reuse_period_seconds',
        type: 'number',
        description: 'KMS data key reuse period (60-86400 seconds)',
        default: 300,
        validation: { min: 60, max: 86400 },
        group: 'security',
      },
      {
        name: 'sqs_managed_sse_enabled',
        type: 'bool',
        description: 'Enable SQS-managed encryption (SSE-SQS)',
        default: true,
        group: 'security',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the queue',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Queue URL' },
    { name: 'arn', type: 'string', description: 'ARN of the queue' },
    { name: 'url', type: 'string', description: 'Queue URL' },
    { name: 'name', type: 'string', description: 'Name of the queue' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_sqs_queue',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      url: 'url',
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
        apply: [{ setArg: 'kms_master_key_id', toTargetAttr: 'key_id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'inbound',
        toResourceType: 'aws_sns_topic',
        apply: [],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'inbound',
        toResourceType: 'aws_lambda_function',
        apply: [],
      },
    ],
  },
};
