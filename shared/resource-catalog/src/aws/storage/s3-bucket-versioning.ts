/**
 * AWS S3 Bucket Versioning Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_versioning
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsS3BucketVersioning: ServiceDefinition = {
  id: 's3_bucket_versioning',
  terraform_resource: 'aws_s3_bucket_versioning',
  name: 'S3 Bucket Versioning',
  description: 'Versioning configuration for an S3 bucket',
  icon: STORAGE_ICONS.S3,
  category: 'storage',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'bucket',
        type: 'string',
        description: 'ID (name) of the S3 bucket',
        reference: 'aws_s3_bucket.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'expected_bucket_owner',
        type: 'string',
        description: 'Account ID of the expected bucket owner',
        group: 'advanced',
      },
      {
        name: 'mfa',
        type: 'string',
        description: 'MFA device serial number and token for MFA Delete',
        group: 'advanced',
        sensitive: true,
      },
    ],

    blocks: [
      {
        name: 'versioning_configuration',
        description: 'Versioning configuration settings',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'status',
            type: 'string',
            description: 'Versioning status',
            default: 'Enabled',
            options: ['Enabled', 'Suspended', 'Disabled'],
          },
          {
            name: 'mfa_delete',
            type: 'string',
            description: 'MFA Delete requirement',
            options: ['Enabled', 'Disabled'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Bucket name and account ID' },
  ],

  terraform: {
    resourceType: 'aws_s3_bucket_versioning',
    requiredArgs: ['bucket', 'versioning_configuration'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_s3_bucket',
        apply: [{ setArg: 'bucket', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [],
  },
};
