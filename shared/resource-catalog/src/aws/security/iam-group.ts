/**
 * AWS IAM Group Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamGroup: ServiceDefinition = {
  id: 'iam_group',
  terraform_resource: 'aws_iam_group',
  name: 'IAM Group',
  description: 'Group of IAM users for collective permission management',
  icon: SECURITY_ICONS.IAM_GROUP,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the IAM group',
        validation: { pattern: '^[a-zA-Z][a-zA-Z0-9_+=,.@-]*$', maxLength: 128 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'path',
        type: 'string',
        description: 'Path for the group',
        default: '/',
        group: 'advanced',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Group name' },
    { name: 'arn', type: 'string', description: 'ARN of the group' },
    { name: 'unique_id', type: 'string', description: 'Unique ID of the group' },
  ],

  terraform: {
    resourceType: 'aws_iam_group',
    requiredArgs: ['name'],
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
