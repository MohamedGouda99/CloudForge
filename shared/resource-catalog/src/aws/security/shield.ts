/**
 * AWS Shield Protection Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/shield_protection
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsShieldProtection: ServiceDefinition = {
  id: 'shield_protection',
  terraform_resource: 'aws_shield_protection',
  name: 'Shield Protection',
  description: 'AWS Shield Advanced protection for resources against DDoS attacks',
  icon: SECURITY_ICONS.SHIELD,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Friendly name for the Shield protection',
        group: 'basic',
      },
      {
        name: 'resource_arn',
        type: 'string',
        description: 'ARN of the resource to protect (CloudFront, ALB, EIP, Route53, Global Accelerator)',
        example: 'arn:aws:ec2:us-east-1:123456789012:eip-allocation/eipalloc-xxxx',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the protection',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Shield protection ID' },
    { name: 'arn', type: 'string', description: 'ARN of the Shield protection' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_shield_protection',
    requiredArgs: ['name', 'resource_arn'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
