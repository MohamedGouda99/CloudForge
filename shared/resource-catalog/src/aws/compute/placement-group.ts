/**
 * AWS Placement Group Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/placement_group
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsPlacementGroup: ServiceDefinition = {
  id: 'placement_group',
  terraform_resource: 'aws_placement_group',
  name: 'Placement Group',
  description: 'Logical grouping of instances for placement strategy',
  icon: COMPUTE_ICONS.EC2,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the placement group',
        example: 'my-placement-group',
        validation: {
          pattern: '^[a-zA-Z0-9._-]+$',
          maxLength: 255,
        },
        group: 'basic',
      },
      {
        name: 'strategy',
        type: 'string',
        description: 'Placement strategy',
        options: ['cluster', 'partition', 'spread'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'partition_count',
        type: 'number',
        description: 'Number of partitions (partition strategy only)',
        validation: { min: 1, max: 7 },
        group: 'basic',
      },
      {
        name: 'spread_level',
        type: 'string',
        description: 'Spread level (spread strategy only)',
        options: ['host', 'rack'],
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the placement group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Placement group name' },
    { name: 'arn', type: 'string', description: 'ARN of the placement group' },
    { name: 'placement_group_id', type: 'string', description: 'Placement group ID' },
  ],

  terraform: {
    resourceType: 'aws_placement_group',
    requiredArgs: ['name', 'strategy'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
