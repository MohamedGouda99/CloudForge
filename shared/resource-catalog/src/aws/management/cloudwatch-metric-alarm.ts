/**
 * AWS CloudWatch Metric Alarm Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm
 */

import type { ServiceDefinition } from '../../types';
import { MANAGEMENT_ICONS } from '../icons';

export const awsCloudwatchMetricAlarm: ServiceDefinition = {
  id: 'cloudwatch_metric_alarm',
  terraform_resource: 'aws_cloudwatch_metric_alarm',
  name: 'CloudWatch Alarm',
  description: 'CloudWatch metric alarm for monitoring and notifications',
  icon: MANAGEMENT_ICONS.CLOUDWATCH,
  category: 'management',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'alarm_name',
        type: 'string',
        description: 'Descriptive name for the alarm',
        validation: { maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'comparison_operator',
        type: 'string',
        description: 'Arithmetic operation to use for the comparison',
        options: [
          'GreaterThanOrEqualToThreshold',
          'GreaterThanThreshold',
          'LessThanThreshold',
          'LessThanOrEqualToThreshold',
          'LessThanLowerOrGreaterThanUpperThreshold',
          'LessThanLowerThreshold',
          'GreaterThanUpperThreshold',
        ],
        group: 'basic',
      },
      {
        name: 'evaluation_periods',
        type: 'number',
        description: 'Number of periods over which data is compared',
        validation: { min: 1 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'metric_name',
        type: 'string',
        description: 'Name of the metric',
        example: 'CPUUtilization',
        group: 'basic',
      },
      {
        name: 'namespace',
        type: 'string',
        description: 'Namespace for the metric',
        example: 'AWS/EC2',
        group: 'basic',
      },
      {
        name: 'period',
        type: 'number',
        description: 'Period in seconds over which the statistic is applied',
        default: 60,
        validation: { min: 10 },
        group: 'basic',
      },
      {
        name: 'statistic',
        type: 'string',
        description: 'Statistic to apply to the metric',
        options: ['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum'],
        group: 'basic',
      },
      {
        name: 'threshold',
        type: 'number',
        description: 'Value to compare against',
        group: 'basic',
      },
      {
        name: 'threshold_metric_id',
        type: 'string',
        description: 'Metric ID for anomaly detection threshold',
        group: 'advanced',
      },
      {
        name: 'actions_enabled',
        type: 'bool',
        description: 'Enable actions for state transitions',
        default: true,
        group: 'basic',
      },
      {
        name: 'alarm_actions',
        type: 'list(string)',
        description: 'Actions to take on ALARM state',
        reference: 'aws_sns_topic.arn',
        group: 'basic',
      },
      {
        name: 'ok_actions',
        type: 'list(string)',
        description: 'Actions to take on OK state',
        reference: 'aws_sns_topic.arn',
        group: 'basic',
      },
      {
        name: 'insufficient_data_actions',
        type: 'list(string)',
        description: 'Actions to take on INSUFFICIENT_DATA state',
        reference: 'aws_sns_topic.arn',
        group: 'basic',
      },
      {
        name: 'alarm_description',
        type: 'string',
        description: 'Description for the alarm',
        group: 'basic',
      },
      {
        name: 'datapoints_to_alarm',
        type: 'number',
        description: 'Number of datapoints that must breach threshold',
        validation: { min: 1 },
        group: 'advanced',
      },
      {
        name: 'dimensions',
        type: 'map(string)',
        description: 'Dimensions for the metric',
        group: 'advanced',
      },
      {
        name: 'extended_statistic',
        type: 'string',
        description: 'Percentile statistic (e.g., p90)',
        example: 'p99.9',
        group: 'advanced',
      },
      {
        name: 'treat_missing_data',
        type: 'string',
        description: 'How to treat missing data',
        default: 'missing',
        options: ['missing', 'ignore', 'breaching', 'notBreaching'],
        group: 'advanced',
      },
      {
        name: 'unit',
        type: 'string',
        description: 'Unit for the metric',
        options: [
          'Seconds', 'Microseconds', 'Milliseconds', 'Bytes', 'Kilobytes',
          'Megabytes', 'Gigabytes', 'Terabytes', 'Bits', 'Kilobits',
          'Megabits', 'Gigabits', 'Terabits', 'Percent', 'Count',
          'Bytes/Second', 'Kilobytes/Second', 'Megabytes/Second',
          'Gigabytes/Second', 'Terabytes/Second', 'Bits/Second',
          'Kilobits/Second', 'Megabits/Second', 'Gigabits/Second',
          'Terabits/Second', 'Count/Second', 'None',
        ],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the alarm',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'metric_query',
        description: 'Metric query for metric math expressions',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'id',
            type: 'string',
            description: 'Short name for the metric',
          },
          {
            name: 'expression',
            type: 'string',
            description: 'Math expression to compute',
          },
          {
            name: 'label',
            type: 'string',
            description: 'Human-readable label for the metric',
          },
          {
            name: 'return_data',
            type: 'bool',
            description: 'Return data for this metric query',
            default: true,
          },
          {
            name: 'period',
            type: 'number',
            description: 'Granularity in seconds',
          },
          {
            name: 'account_id',
            type: 'string',
            description: 'AWS account ID for cross-account metrics',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Alarm name' },
    { name: 'arn', type: 'string', description: 'ARN of the alarm' },
  ],

  terraform: {
    resourceType: 'aws_cloudwatch_metric_alarm',
    requiredArgs: ['alarm_name', 'comparison_operator', 'evaluation_periods'],
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
        apply: [{ pushToListArg: 'alarm_actions', toTargetAttr: 'arn' }],
      },
    ],
  },
};
