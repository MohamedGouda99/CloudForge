/**
 * AWS DB Parameter Group Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_parameter_group
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsDbParameterGroup: ServiceDefinition = {
  id: 'db_parameter_group',
  terraform_resource: 'aws_db_parameter_group',
  name: 'DB Parameter Group',
  description: 'Custom parameter group for RDS database engines',
  icon: DATABASE_ICONS.RDS,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the DB parameter group',
        validation: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'family',
        type: 'string',
        description: 'DB parameter group family (e.g., mysql8.0, postgres15)',
        example: 'mysql8.0',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the parameter group',
        default: 'Managed by Terraform',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the parameter group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'parameter',
        description: 'Parameter configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the parameter',
          },
          {
            name: 'value',
            type: 'string',
            description: 'Value of the parameter',
          },
          {
            name: 'apply_method',
            type: 'string',
            description: 'When to apply the parameter',
            default: 'immediate',
            options: ['immediate', 'pending-reboot'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'DB parameter group name' },
    { name: 'arn', type: 'string', description: 'ARN of the DB parameter group' },
    { name: 'name', type: 'string', description: 'Name of the DB parameter group' },
  ],

  terraform: {
    resourceType: 'aws_db_parameter_group',
    requiredArgs: ['name', 'family'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
