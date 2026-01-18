/**
 * AWS S3 Bucket Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
 *
 * Note: In Terraform AWS Provider 4.0+, many settings were moved to separate resources.
 * This definition focuses on aws_s3_bucket core arguments.
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsS3Bucket: ServiceDefinition = {
  id: 's3_bucket',
  terraform_resource: 'aws_s3_bucket',
  name: 'S3 Bucket',
  description: 'Highly scalable object storage with lifecycle management and versioning',
  icon: STORAGE_ICONS.S3,
  category: 'storage',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'bucket',
        type: 'string',
        description: 'Name of the bucket (globally unique, conflicts with bucket_prefix)',
        validation: {
          pattern: '^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$',
          minLength: 3,
          maxLength: 63,
        },
        group: 'basic',
      },
      {
        name: 'bucket_prefix',
        type: 'string',
        description: 'Prefix for auto-generated bucket name (conflicts with bucket)',
        validation: { maxLength: 37 },
        group: 'basic',
      },
      {
        name: 'force_destroy',
        type: 'bool',
        description: 'Allow bucket destruction even with non-empty objects',
        default: false,
        group: 'advanced',
      },
      {
        name: 'object_lock_enabled',
        type: 'bool',
        description: 'Enable S3 Object Lock (cannot be disabled once enabled)',
        default: false,
        group: 'security',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the bucket',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Bucket name' },
    { name: 'arn', type: 'string', description: 'ARN of the bucket' },
    { name: 'bucket', type: 'string', description: 'Bucket name' },
    { name: 'bucket_domain_name', type: 'string', description: 'Bucket domain name (bucket.s3.amazonaws.com)' },
    { name: 'bucket_regional_domain_name', type: 'string', description: 'Regional domain name (bucket.s3.region.amazonaws.com)' },
    { name: 'hosted_zone_id', type: 'string', description: 'Route 53 Hosted Zone ID for this region' },
    { name: 'region', type: 'string', description: 'AWS region of the bucket' },
    { name: 'website_endpoint', type: 'string', description: 'Website endpoint (if configured)' },
    { name: 'website_domain', type: 'string', description: 'Domain of the website endpoint' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_s3_bucket',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      bucket: 'bucket',
      bucket_domain_name: 'bucket_domain_name',
      bucket_regional_domain_name: 'bucket_regional_domain_name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [],
      },
    ],
    validChildren: [
      {
        childTypes: [
          'aws_s3_object',
          'aws_s3_bucket_policy',
          'aws_s3_bucket_versioning',
          'aws_s3_bucket_lifecycle_configuration',
          'aws_s3_bucket_cors_configuration',
          'aws_s3_bucket_website_configuration',
          'aws_s3_bucket_public_access_block',
          'aws_s3_bucket_server_side_encryption_configuration',
          'aws_s3_bucket_logging',
          'aws_s3_bucket_notification',
          'aws_s3_bucket_replication_configuration',
          'aws_s3_bucket_accelerate_configuration',
          'aws_s3_bucket_intelligent_tiering_configuration',
          'aws_s3_bucket_inventory',
          'aws_s3_bucket_metric',
          'aws_s3_bucket_ownership_controls',
          'aws_s3_bucket_request_payment_configuration',
          'aws_s3_bucket_object_lock_configuration',
        ],
        description: 'S3 bucket configurations, objects, and policies',
      },
    ],
  },
};
