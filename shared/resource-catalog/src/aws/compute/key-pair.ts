/**
 * AWS Key Pair Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/key_pair
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsKeyPair: ServiceDefinition = {
  id: 'key_pair',
  terraform_resource: 'aws_key_pair',
  name: 'Key Pair',
  description: 'SSH key pair for EC2 instance access',
  icon: COMPUTE_ICONS.EC2,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'key_name',
        type: 'string',
        description: 'Name for the key pair',
        example: 'my-key-pair',
        validation: {
          pattern: '^[a-zA-Z0-9._-]+$',
          maxLength: 255,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'key_name_prefix',
        type: 'string',
        description: 'Creates a unique name beginning with the specified prefix',
        group: 'basic',
      },
      {
        name: 'public_key',
        type: 'string',
        description: 'Public key material (OpenSSH format)',
        example: 'ssh-rsa AAAAB3...',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the key pair',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Key pair name' },
    { name: 'arn', type: 'string', description: 'ARN of the key pair' },
    { name: 'key_pair_id', type: 'string', description: 'Key pair ID' },
    { name: 'key_type', type: 'string', description: 'Key type (rsa or ed25519)' },
    { name: 'fingerprint', type: 'string', description: 'Fingerprint of the public key' },
  ],

  terraform: {
    resourceType: 'aws_key_pair',
    requiredArgs: ['key_name'],
    referenceableAttrs: {
      id: 'id',
      key_name: 'key_name',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
