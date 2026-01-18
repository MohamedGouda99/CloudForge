/**
 * AWS Auto Scaling Policy Resource Definition
 *
 * Complete schema for aws_autoscaling_policy based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsAutoscalingPolicy: ServiceDefinition = {
  id: 'autoscaling_policy',
  terraform_resource: 'aws_autoscaling_policy',
  name: 'Auto Scaling Policy',
  description: 'Scaling policy for Auto Scaling groups',
  icon: COMPUTE_ICONS.AUTO_SCALING,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the scaling policy',
        group: 'basic',
      },
      {
        name: 'autoscaling_group_name',
        type: 'string',
        description: 'Name of the Auto Scaling group',
        reference: 'aws_autoscaling_group.name',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'policy_type',
        type: 'string',
        description: 'Type of scaling policy',
        default: 'SimpleScaling',
        options: ['SimpleScaling', 'StepScaling', 'TargetTrackingScaling', 'PredictiveScaling'],
        group: 'basic',
      },
      {
        name: 'adjustment_type',
        type: 'string',
        description: 'Type of adjustment for SimpleScaling and StepScaling',
        options: ['ChangeInCapacity', 'ExactCapacity', 'PercentChangeInCapacity'],
        group: 'basic',
      },
      {
        name: 'scaling_adjustment',
        type: 'number',
        description: 'Number of instances to add/remove for SimpleScaling',
        group: 'basic',
      },
      {
        name: 'cooldown',
        type: 'number',
        description: 'Cooldown period in seconds for SimpleScaling',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'min_adjustment_magnitude',
        type: 'number',
        description: 'Minimum adjustment magnitude for PercentChangeInCapacity',
        validation: { min: 1 },
        group: 'advanced',
      },
      {
        name: 'metric_aggregation_type',
        type: 'string',
        description: 'Aggregation type for StepScaling metrics',
        options: ['Minimum', 'Maximum', 'Average'],
        group: 'advanced',
      },
      {
        name: 'estimated_instance_warmup',
        type: 'number',
        description: 'Estimated time until instance is fully active',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'enabled',
        type: 'bool',
        description: 'Whether the scaling policy is enabled',
        default: true,
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'target_tracking_configuration',
        description: 'Target tracking scaling policy configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'target_value',
            type: 'number',
            description: 'Target value for the metric',
          },
          {
            name: 'disable_scale_in',
            type: 'bool',
            description: 'Disable scale-in actions',
            default: false,
          },
        ],
      },
      {
        name: 'predefined_metric_specification',
        description: 'Predefined metric for target tracking',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'predefined_metric_type',
            type: 'string',
            description: 'Predefined metric type',
            options: [
              'ASGAverageCPUUtilization',
              'ASGAverageNetworkIn',
              'ASGAverageNetworkOut',
              'ALBRequestCountPerTarget',
            ],
          },
          {
            name: 'resource_label',
            type: 'string',
            description: 'Resource label for ALB metrics',
          },
        ],
      },
      {
        name: 'customized_metric_specification',
        description: 'Customized metric for target tracking',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'metric_name',
            type: 'string',
            description: 'CloudWatch metric name',
          },
          {
            name: 'namespace',
            type: 'string',
            description: 'CloudWatch metric namespace',
          },
          {
            name: 'statistic',
            type: 'string',
            description: 'Statistic to use',
            options: ['Average', 'Minimum', 'Maximum', 'SampleCount', 'Sum'],
          },
          {
            name: 'unit',
            type: 'string',
            description: 'Unit of the metric',
          },
        ],
      },
      {
        name: 'step_adjustment',
        description: 'Step adjustments for StepScaling',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'scaling_adjustment',
            type: 'number',
            description: 'Number of instances to adjust',
          },
          {
            name: 'metric_interval_lower_bound',
            type: 'string',
            description: 'Lower bound of metric interval',
          },
          {
            name: 'metric_interval_upper_bound',
            type: 'string',
            description: 'Upper bound of metric interval',
          },
        ],
      },
      {
        name: 'predictive_scaling_configuration',
        description: 'Predictive scaling configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'mode',
            type: 'string',
            description: 'Predictive scaling mode',
            options: ['ForecastAndScale', 'ForecastOnly'],
          },
          {
            name: 'scheduling_buffer_time',
            type: 'string',
            description: 'Buffer time before predicted scaling action',
          },
          {
            name: 'max_capacity_breach_behavior',
            type: 'string',
            description: 'Behavior when max capacity is breached',
            options: ['HonorMaxCapacity', 'IncreaseMaxCapacity'],
          },
          {
            name: 'max_capacity_buffer',
            type: 'string',
            description: 'Capacity buffer percentage',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the scaling policy' },
    { name: 'name', type: 'string', description: 'Name of the scaling policy' },
    { name: 'policy_type', type: 'string', description: 'Type of the scaling policy' },
    { name: 'autoscaling_group_name', type: 'string', description: 'ASG name' },
  ],

  terraform: {
    resourceType: 'aws_autoscaling_policy',
    requiredArgs: ['name', 'autoscaling_group_name'],
    referenceableAttrs: {
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_autoscaling_group',
        apply: [{ setArg: 'autoscaling_group_name', toTargetAttr: 'name' }],
      },
    ],
  },
};
