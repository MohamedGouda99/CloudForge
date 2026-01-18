/**
 * AWS CloudWatch Log Group Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group
 */

import type { ServiceDefinition } from '../../types';
import { MANAGEMENT_ICONS } from '../icons';

export const awsCloudwatchLogGroup: ServiceDefinition = {
  id: 'cloudwatch_log_group',
  terraform_resource: 'aws_cloudwatch_log_group',
  name: 'CloudWatch Log Group',
  description: 'Log group for centralized log collection, monitoring, and analysis',
  icon: MANAGEMENT_ICONS.CLOUDWATCH_LOGS,
  category: 'management',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the log group (conflicts with name_prefix)',
        validation: { pattern: '^[\\.\\-_/#A-Za-z0-9]+$', minLength: 1, maxLength: 512 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name (conflicts with name)',
        group: 'basic',
      },
      {
        name: 'retention_in_days',
        type: 'number',
        description: 'Log retention period in days (0 = never expire). Valid values: 0, 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653',
        default: 0,
        validation: { min: 0 },
        group: 'basic',
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS key ARN for encrypting log data',
        reference: 'aws_kms_key.arn',
        group: 'security',
      },
      {
        name: 'log_group_class',
        type: 'string',
        description: 'Log group class (affects storage costs and capabilities)',
        default: 'STANDARD',
        options: ['STANDARD', 'INFREQUENT_ACCESS'],
        group: 'advanced',
      },
      {
        name: 'skip_destroy',
        type: 'bool',
        description: 'Do not delete log group on Terraform destroy',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the log group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Log group name' },
    { name: 'arn', type: 'string', description: 'ARN of the log group' },
    { name: 'name', type: 'string', description: 'Name of the log group' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_cloudwatch_log_group',
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
        apply: [{ setArg: 'kms_key_id', toTargetAttr: 'arn' }],
      },
    ],
    validChildren: [
      {
        childTypes: ['aws_cloudwatch_log_stream', 'aws_cloudwatch_log_metric_filter', 'aws_cloudwatch_log_subscription_filter'],
        description: 'Log streams, metric filters, and subscription filters',
      },
    ],
  },
};
