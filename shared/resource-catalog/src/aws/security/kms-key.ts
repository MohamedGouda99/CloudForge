/**
 * AWS KMS Key Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsKmsKey: ServiceDefinition = {
  id: 'kms_key',
  terraform_resource: 'aws_kms_key',
  name: 'KMS Key',
  description: 'Customer managed encryption key for encrypting data across AWS services',
  icon: SECURITY_ICONS.KMS,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the key',
        group: 'basic',
      },
      {
        name: 'key_usage',
        type: 'string',
        description: 'Intended use of the key',
        default: 'ENCRYPT_DECRYPT',
        options: ['ENCRYPT_DECRYPT', 'SIGN_VERIFY', 'GENERATE_VERIFY_MAC', 'KEY_AGREEMENT'],
        group: 'basic',
      },
      {
        name: 'customer_master_key_spec',
        type: 'string',
        description: 'Key spec (determines cryptographic capability)',
        default: 'SYMMETRIC_DEFAULT',
        options: [
          'SYMMETRIC_DEFAULT',
          'RSA_2048', 'RSA_3072', 'RSA_4096',
          'ECC_NIST_P256', 'ECC_NIST_P384', 'ECC_NIST_P521',
          'ECC_SECG_P256K1',
          'HMAC_224', 'HMAC_256', 'HMAC_384', 'HMAC_512',
          'SM2',
        ],
        group: 'advanced',
      },
      {
        name: 'policy',
        type: 'string',
        description: 'Key policy JSON document defining access control',
        group: 'security',
      },
      {
        name: 'bypass_policy_lockout_safety_check',
        type: 'bool',
        description: 'Bypass policy lockout safety check (use with caution)',
        default: false,
        group: 'security',
      },
      {
        name: 'deletion_window_in_days',
        type: 'number',
        description: 'Waiting period (days) before key deletion',
        default: 30,
        validation: { min: 7, max: 30 },
        group: 'advanced',
      },
      {
        name: 'is_enabled',
        type: 'bool',
        description: 'Whether the key is enabled',
        default: true,
        group: 'basic',
      },
      {
        name: 'enable_key_rotation',
        type: 'bool',
        description: 'Enable automatic annual key rotation (symmetric keys only)',
        default: false,
        group: 'security',
      },
      {
        name: 'rotation_period_in_days',
        type: 'number',
        description: 'Custom rotation period in days (90-2560)',
        validation: { min: 90, max: 2560 },
        group: 'advanced',
      },
      {
        name: 'multi_region',
        type: 'bool',
        description: 'Create a multi-Region primary key',
        default: false,
        group: 'advanced',
      },
      {
        name: 'custom_key_store_id',
        type: 'string',
        description: 'ID of the CloudHSM cluster or external key store',
        group: 'advanced',
      },
      {
        name: 'xks_key_id',
        type: 'string',
        description: 'External key ID for external key store',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the key',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Key ID' },
    { name: 'arn', type: 'string', description: 'ARN of the key' },
    { name: 'key_id', type: 'string', description: 'Globally unique key identifier' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_kms_key',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      key_id: 'key_id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
