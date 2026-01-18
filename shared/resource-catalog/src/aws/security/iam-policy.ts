/**
 * AWS IAM Policy Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamPolicy: ServiceDefinition = {
  id: 'iam_policy',
  terraform_resource: 'aws_iam_policy',
  name: 'IAM Policy',
  description: 'Customer-managed IAM policy for defining permissions',
  icon: SECURITY_ICONS.IAM_POLICY,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'policy',
        type: 'string',
        description: 'Policy document as JSON string',
        example: '{"Version":"2012-10-17","Statement":[]}',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the policy',
        validation: { pattern: '^[a-zA-Z][a-zA-Z0-9_+=,.@-]*$', maxLength: 128 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated policy name',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the policy',
        validation: { maxLength: 1000 },
        group: 'basic',
      },
      {
        name: 'path',
        type: 'string',
        description: 'Path for the policy',
        default: '/',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the policy',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Policy ARN' },
    { name: 'arn', type: 'string', description: 'ARN of the policy' },
    { name: 'name', type: 'string', description: 'Name of the policy' },
    { name: 'path', type: 'string', description: 'Path of the policy' },
    { name: 'policy_id', type: 'string', description: 'Policy ID' },
    { name: 'attachment_count', type: 'number', description: 'Number of entities attached to' },
  ],

  terraform: {
    resourceType: 'aws_iam_policy',
    requiredArgs: ['policy'],
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
