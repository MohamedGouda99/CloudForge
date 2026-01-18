/**
 * AWS IAM Instance Profile Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_instance_profile
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsIamInstanceProfile: ServiceDefinition = {
  id: 'iam_instance_profile',
  terraform_resource: 'aws_iam_instance_profile',
  name: 'IAM Instance Profile',
  description: 'Instance profile that allows EC2 instances to assume an IAM role',
  icon: SECURITY_ICONS.IAM,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the instance profile',
        validation: { pattern: '^[a-zA-Z][a-zA-Z0-9_+=,.@-]*$', maxLength: 128 },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name',
        group: 'basic',
      },
      {
        name: 'role',
        type: 'string',
        description: 'Name of the IAM role to add to the instance profile',
        reference: 'aws_iam_role.name',
        group: 'basic',
      },
      {
        name: 'path',
        type: 'string',
        description: 'Path for the instance profile',
        default: '/',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the instance profile',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Instance profile name' },
    { name: 'arn', type: 'string', description: 'ARN of the instance profile' },
    { name: 'name', type: 'string', description: 'Name of the instance profile' },
    { name: 'unique_id', type: 'string', description: 'Unique ID of the instance profile' },
    { name: 'create_date', type: 'string', description: 'Creation date' },
  ],

  terraform: {
    resourceType: 'aws_iam_instance_profile',
    requiredArgs: [],
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
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role', toTargetAttr: 'name' }],
      },
    ],
  },
};
