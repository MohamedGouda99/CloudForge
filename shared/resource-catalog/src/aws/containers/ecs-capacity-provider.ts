/**
 * AWS ECS Capacity Provider Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_capacity_provider
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEcsCapacityProvider: ServiceDefinition = {
  id: 'ecs_capacity_provider',
  terraform_resource: 'aws_ecs_capacity_provider',
  name: 'ECS Capacity Provider',
  description: 'Manages infrastructure scaling for ECS tasks',
  icon: CONTAINER_ICONS.ECS,
  category: 'containers',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the capacity provider',
        example: 'my-capacity-provider',
        validation: {
          pattern: '^[a-zA-Z0-9_-]+$',
          maxLength: 255,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the capacity provider',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'auto_scaling_group_provider',
        description: 'Auto Scaling group provider configuration',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'auto_scaling_group_arn',
            type: 'string',
            description: 'ARN of the Auto Scaling group',
          },
          {
            name: 'managed_termination_protection',
            type: 'string',
            description: 'Termination protection setting',
            default: 'DISABLED',
            options: ['ENABLED', 'DISABLED'],
          },
        ],
      },
      {
        name: 'managed_scaling',
        description: 'Managed scaling configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'status',
            type: 'string',
            description: 'Enable or disable managed scaling',
            default: 'DISABLED',
            options: ['ENABLED', 'DISABLED'],
          },
          {
            name: 'target_capacity',
            type: 'number',
            description: 'Target capacity percentage (1-100)',
            validation: { min: 1, max: 100 },
          },
          {
            name: 'minimum_scaling_step_size',
            type: 'number',
            description: 'Minimum number of instances to scale',
            validation: { min: 1, max: 10000 },
          },
          {
            name: 'maximum_scaling_step_size',
            type: 'number',
            description: 'Maximum number of instances to scale',
            validation: { min: 1, max: 10000 },
          },
          {
            name: 'instance_warmup_period',
            type: 'number',
            description: 'Instance warmup period in seconds',
            validation: { min: 0, max: 10000 },
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Capacity provider name' },
    { name: 'arn', type: 'string', description: 'ARN of the capacity provider' },
  ],

  terraform: {
    resourceType: 'aws_ecs_capacity_provider',
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
        toResourceType: 'aws_autoscaling_group',
        apply: [{ setArg: 'auto_scaling_group_provider.auto_scaling_group_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
