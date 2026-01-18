/**
 * AWS SNS Topic Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sns_topic
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const awsSnsTopic: ServiceDefinition = {
  id: 'sns_topic',
  terraform_resource: 'aws_sns_topic',
  name: 'SNS Topic',
  description: 'Simple Notification Service topic for pub/sub messaging with fan-out support',
  icon: MESSAGING_ICONS.SNS,
  category: 'messaging',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the topic (conflicts with name_prefix)',
        validation: { pattern: '^[a-zA-Z0-9_-]+(\\.fifo)?$', maxLength: 256 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name (conflicts with name)',
        group: 'basic',
      },
      {
        name: 'display_name',
        type: 'string',
        description: 'Display name for SMS subscriptions (max 100 chars)',
        validation: { maxLength: 100 },
        group: 'basic',
      },
      {
        name: 'policy',
        type: 'string',
        description: 'Access policy document (JSON)',
        group: 'security',
      },
      {
        name: 'delivery_policy',
        type: 'string',
        description: 'HTTP/S endpoint retry policy (JSON)',
        group: 'advanced',
      },
      {
        name: 'application_success_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for successful application delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'application_success_feedback_sample_rate',
        type: 'number',
        description: 'Success sample rate for application feedback (0-100)',
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'application_failure_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for failed application delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'http_success_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for successful HTTP delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'http_success_feedback_sample_rate',
        type: 'number',
        description: 'Success sample rate for HTTP feedback (0-100)',
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'http_failure_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for failed HTTP delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'lambda_success_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for successful Lambda delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'lambda_success_feedback_sample_rate',
        type: 'number',
        description: 'Success sample rate for Lambda feedback (0-100)',
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'lambda_failure_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for failed Lambda delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'sqs_success_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for successful SQS delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'sqs_success_feedback_sample_rate',
        type: 'number',
        description: 'Success sample rate for SQS feedback (0-100)',
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'sqs_failure_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for failed SQS delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'firehose_success_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for successful Firehose delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'firehose_success_feedback_sample_rate',
        type: 'number',
        description: 'Success sample rate for Firehose feedback (0-100)',
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'firehose_failure_feedback_role_arn',
        type: 'string',
        description: 'IAM role ARN for failed Firehose delivery feedback',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'kms_master_key_id',
        type: 'string',
        description: 'KMS key ID for encryption at rest',
        reference: 'aws_kms_key.id',
        group: 'security',
      },
      {
        name: 'signature_version',
        type: 'string',
        description: 'Message signature version',
        options: ['1', '2'],
        group: 'advanced',
      },
      {
        name: 'tracing_config',
        type: 'string',
        description: 'Tracing mode for X-Ray',
        options: ['Active', 'PassThrough'],
        group: 'advanced',
      },
      {
        name: 'fifo_topic',
        type: 'bool',
        description: 'Enable FIFO topic (name must end in .fifo)',
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
        name: 'archive_policy',
        type: 'string',
        description: 'Message archive policy (JSON) for message archive and replay',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the topic',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Topic ARN' },
    { name: 'arn', type: 'string', description: 'ARN of the topic' },
    { name: 'name', type: 'string', description: 'Name of the topic' },
    { name: 'owner', type: 'string', description: 'AWS account ID of owner' },
    { name: 'beginning_archive_time', type: 'string', description: 'Oldest archived message timestamp' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_sns_topic',
    requiredArgs: [],
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
        apply: [{ setArg: 'kms_master_key_id', toTargetAttr: 'key_id' }],
      },
    ],
    validChildren: [
      {
        childTypes: ['aws_sns_topic_subscription', 'aws_sns_topic_policy'],
        description: 'SNS subscriptions and policies',
      },
    ],
  },
};
