/**
 * AWS Inspector2 Enabler Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/inspector2_enabler
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsInspector2Enabler: ServiceDefinition = {
  id: 'inspector2_enabler',
  terraform_resource: 'aws_inspector2_enabler',
  name: 'Inspector',
  description: 'Amazon Inspector vulnerability management service for EC2, ECR, Lambda, and code repositories',
  icon: SECURITY_ICONS.INSPECTOR,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'account_ids',
        type: 'set(string)',
        description: 'Set of AWS account IDs to enable Inspector for',
        example: '["123456789012"]',
        group: 'basic',
      },
      {
        name: 'resource_types',
        type: 'set(string)',
        description: 'Types of resources to scan',
        options: ['EC2', 'ECR', 'LAMBDA', 'LAMBDA_CODE', 'CODE_REPOSITORY'],
        example: '["EC2", "ECR"]',
        group: 'basic',
      },
    ],

    optional: [],
    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Inspector enabler ID' },
  ],

  terraform: {
    resourceType: 'aws_inspector2_enabler',
    requiredArgs: ['account_ids', 'resource_types'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
