/**
 * AWS S3 Bucket Lifecycle Configuration Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_lifecycle_configuration
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsS3BucketLifecycleConfiguration: ServiceDefinition = {
  id: 's3_bucket_lifecycle_configuration',
  terraform_resource: 'aws_s3_bucket_lifecycle_configuration',
  name: 'S3 Lifecycle Configuration',
  description: 'Lifecycle configuration for S3 bucket objects',
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
    ],

    blocks: [
      {
        name: 'rule',
        description: 'Lifecycle rule configuration',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'id',
            type: 'string',
            description: 'Unique identifier for the rule',
          },
          {
            name: 'status',
            type: 'string',
            description: 'Rule status',
            default: 'Enabled',
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
    resourceType: 'aws_s3_bucket_lifecycle_configuration',
    requiredArgs: ['bucket', 'rule'],
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
