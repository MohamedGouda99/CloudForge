/**
 * AWS IAM Role Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamRole: ServiceDefinition = {
  id: 'iam_role',
  terraform_resource: 'aws_iam_role',
  name: 'IAM Role',
  description: 'Identity with permissions that can be assumed by AWS services or users',
  icon: SECURITY_ICONS.IAM_ROLE,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'assume_role_policy',
        type: 'string',
        description: 'Trust policy document (JSON) defining who can assume the role',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Friendly name of the role (conflicts with name_prefix)',
        validation: { pattern: '^[a-zA-Z][a-zA-Z0-9_+=,.@-]*$', maxLength: 64 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated role name (conflicts with name)',
        validation: { maxLength: 38 },
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the role',
        group: 'basic',
      },
      {
        name: 'path',
        type: 'string',
        description: 'Path to the role (for organizational hierarchy)',
        default: '/',
        group: 'advanced',
      },
      {
        name: 'max_session_duration',
        type: 'number',
        description: 'Maximum session duration in seconds',
        default: 3600,
        validation: { min: 3600, max: 43200 },
        group: 'advanced',
      },
      {
        name: 'permissions_boundary',
        type: 'string',
        description: 'ARN of the permissions boundary policy to attach',
        reference: 'aws_iam_policy.arn',
        group: 'security',
      },
      {
        name: 'force_detach_policies',
        type: 'bool',
        description: 'Force detaching any policies attached to the role before destroying',
        default: false,
        group: 'advanced',
      },
      {
        name: 'managed_policy_arns',
        type: 'set(string)',
        description: 'Set of exclusive IAM managed policy ARNs to attach',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the role',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'inline_policy',
        description: 'Inline IAM policy configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the inline policy',
          },
          {
            name: 'policy',
            type: 'string',
            description: 'Policy document (JSON)',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Role name' },
    { name: 'arn', type: 'string', description: 'ARN of the role' },
    { name: 'name', type: 'string', description: 'Name of the role' },
    { name: 'unique_id', type: 'string', description: 'Unique ID assigned by AWS' },
    { name: 'create_date', type: 'string', description: 'Creation date of the role' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_iam_role',
    requiredArgs: ['assume_role_policy'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
      unique_id: 'unique_id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_policy',
        apply: [{ pushToListArg: 'managed_policy_arns', toTargetAttr: 'arn' }],
      },
    ],
  },
};
