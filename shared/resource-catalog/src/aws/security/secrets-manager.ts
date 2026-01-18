/**
 * AWS Secrets Manager Secret Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsSecretsmanagerSecret: ServiceDefinition = {
  id: 'secretsmanager_secret',
  terraform_resource: 'aws_secretsmanager_secret',
  name: 'Secrets Manager Secret',
  description: 'Managed secret for storing sensitive information',
  icon: SECURITY_ICONS.SECRETS_MANAGER,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the secret',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the secret',
        group: 'basic',
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS key ID for encryption',
        reference: 'aws_kms_key.arn',
        group: 'advanced',
      },
      {
        name: 'recovery_window_in_days',
        type: 'number',
        description: 'Days before secret is deleted',
        default: 30,
        validation: { min: 0, max: 30 },
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
    { name: 'id', type: 'string', description: 'Secret ID' },
    { name: 'arn', type: 'string', description: 'ARN of the secret' },
  ],

  terraform: {
    resourceType: 'aws_secretsmanager_secret',
    requiredArgs: ['name'],
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
