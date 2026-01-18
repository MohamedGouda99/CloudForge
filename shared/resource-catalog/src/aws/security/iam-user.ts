/**
 * AWS IAM User Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamUser: ServiceDefinition = {
  id: 'iam_user',
  terraform_resource: 'aws_iam_user',
  name: 'IAM User',
  description: 'IAM user for programmatic or console access',
  icon: SECURITY_ICONS.IAM_USER,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the IAM user',
        validation: { pattern: '^[a-zA-Z][a-zA-Z0-9_+=,.@-]*$', maxLength: 64 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'path',
        type: 'string',
        description: 'Path for the user',
        default: '/',
        group: 'advanced',
      },
      {
        name: 'permissions_boundary',
        type: 'string',
        description: 'ARN of the permissions boundary policy',
        group: 'advanced',
      },
      {
        name: 'force_destroy',
        type: 'bool',
        description: 'Delete user even if it has non-Terraform-managed resources',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'User name' },
    { name: 'arn', type: 'string', description: 'ARN of the user' },
    { name: 'unique_id', type: 'string', description: 'Unique ID of the user' },
  ],

  terraform: {
    resourceType: 'aws_iam_user',
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
