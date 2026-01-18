/**
 * AWS IAM Role Policy Attachment Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamRolePolicyAttachment: ServiceDefinition = {
  id: 'iam_role_policy_attachment',
  terraform_resource: 'aws_iam_role_policy_attachment',
  name: 'IAM Role Policy Attachment',
  description: 'Attaches a managed IAM policy to an IAM role',
  icon: SECURITY_ICONS.IAM,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'role',
        type: 'string',
        description: 'Name of the IAM role to attach the policy to',
        reference: 'aws_iam_role.name',
        group: 'basic',
      },
      {
        name: 'policy_arn',
        type: 'string',
        description: 'ARN of the IAM policy to attach',
        reference: 'aws_iam_policy.arn',
        example: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
        group: 'basic',
      },
    ],

    optional: [],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Combination of role and policy_arn' },
  ],

  terraform: {
    resourceType: 'aws_iam_role_policy_attachment',
    requiredArgs: ['role', 'policy_arn'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role', toTargetAttr: 'name' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_iam_policy',
        apply: [{ setArg: 'policy_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
