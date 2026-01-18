/**
 * AWS SNS Topic Subscription Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sns_topic_subscription
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const awsSnsTopicSubscription: ServiceDefinition = {
  id: 'sns_topic_subscription',
  terraform_resource: 'aws_sns_topic_subscription',
  name: 'SNS Subscription',
  description: 'Subscription to an SNS topic for delivering messages',
  icon: MESSAGING_ICONS.SNS,
  category: 'messaging',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'topic_arn',
        type: 'string',
        description: 'ARN of the SNS topic to subscribe to',
        reference: 'aws_sns_topic.arn',
        group: 'basic',
      },
      {
        name: 'protocol',
        type: 'string',
        description: 'Protocol to use for the subscription',
        options: [
          'http', 'https', 'email', 'email-json', 'sms',
          'sqs', 'application', 'lambda', 'firehose',
        ],
        group: 'basic',
      },
      {
        name: 'endpoint',
        type: 'string',
        description: 'Endpoint for the subscription',
        example: 'arn:aws:sqs:us-east-1:123456789012:my-queue',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'confirmation_timeout_in_minutes',
        type: 'number',
        description: 'Timeout for confirmation (HTTP/HTTPS/Email)',
        default: 1,
        validation: { min: 1, max: 10080 },
        group: 'advanced',
      },
      {
        name: 'endpoint_auto_confirms',
        type: 'bool',
        description: 'Endpoint can auto-confirm the subscription',
        default: false,
        group: 'advanced',
      },
      {
        name: 'filter_policy',
        type: 'string',
        description: 'JSON filter policy for message filtering',
        group: 'advanced',
      },
      {
        name: 'filter_policy_scope',
        type: 'string',
        description: 'Scope of the filter policy',
        default: 'MessageAttributes',
        options: ['MessageAttributes', 'MessageBody'],
        group: 'advanced',
      },
      {
        name: 'raw_message_delivery',
        type: 'bool',
        description: 'Enable raw message delivery (SQS/HTTP/HTTPS)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'redrive_policy',
        type: 'string',
        description: 'JSON redrive policy for dead-letter queue',
        group: 'advanced',
      },
      {
        name: 'delivery_policy',
        type: 'string',
        description: 'JSON delivery retry policy',
        group: 'advanced',
      },
      {
        name: 'subscription_role_arn',
        type: 'string',
        description: 'IAM role ARN for Kinesis Data Firehose subscriptions',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'replay_policy',
        type: 'string',
        description: 'JSON replay policy for archived messages',
        group: 'advanced',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Subscription ARN' },
    { name: 'arn', type: 'string', description: 'ARN of the subscription' },
    { name: 'confirmation_was_authenticated', type: 'bool', description: 'Whether confirmation was authenticated' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the subscription owner' },
    { name: 'pending_confirmation', type: 'bool', description: 'Whether confirmation is pending' },
  ],

  terraform: {
    resourceType: 'aws_sns_topic_subscription',
    requiredArgs: ['topic_arn', 'protocol', 'endpoint'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_sns_topic',
        apply: [{ setArg: 'topic_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_sqs_queue',
        apply: [{ setArg: 'endpoint', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_lambda_function',
        apply: [{ setArg: 'endpoint', toTargetAttr: 'arn' }],
      },
    ],
  },
};
