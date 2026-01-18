/**
 * AWS Macie2 Account Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/macie2_account
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsMacie2Account: ServiceDefinition = {
  id: 'macie2_account',
  terraform_resource: 'aws_macie2_account',
  name: 'Macie',
  description: 'Amazon Macie data security and privacy service for discovering sensitive data in S3',
  icon: SECURITY_ICONS.MACIE,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'finding_publishing_frequency',
        type: 'string',
        description: 'Frequency of publishing findings to Security Hub and EventBridge',
        default: 'SIX_HOURS',
        options: ['FIFTEEN_MINUTES', 'ONE_HOUR', 'SIX_HOURS'],
        group: 'basic',
      },
      {
        name: 'status',
        type: 'string',
        description: 'Status of the Macie account (ENABLED or PAUSED)',
        default: 'ENABLED',
        options: ['ENABLED', 'PAUSED'],
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Macie account ID' },
    { name: 'created_at', type: 'string', description: 'Date and time when the account was created' },
    { name: 'service_role', type: 'string', description: 'ARN of the service-linked role for Macie' },
  ],

  terraform: {
    resourceType: 'aws_macie2_account',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      service_role: 'service_role',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
