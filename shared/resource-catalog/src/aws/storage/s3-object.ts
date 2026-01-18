/**
 * AWS S3 Object Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsS3Object: ServiceDefinition = {
  id: 's3_object',
  terraform_resource: 'aws_s3_object',
  name: 'S3 Object',
  description: 'Object stored in an S3 bucket',
  icon: STORAGE_ICONS.S3,
  category: 'storage',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'bucket',
        type: 'string',
        description: 'Name of the bucket',
        reference: 'aws_s3_bucket.id',
        group: 'basic',
      },
      {
        name: 'key',
        type: 'string',
        description: 'Object key (path in bucket)',
        example: 'path/to/file.txt',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'source',
        type: 'string',
        description: 'Path to local file to upload',
        group: 'basic',
      },
      {
        name: 'content',
        type: 'string',
        description: 'Inline content for the object',
        group: 'basic',
      },
      {
        name: 'content_type',
        type: 'string',
        description: 'MIME type of the object',
        group: 'basic',
      },
      {
        name: 'storage_class',
        type: 'string',
        description: 'Storage class',
        default: 'STANDARD',
        options: ['STANDARD', 'REDUCED_REDUNDANCY', 'STANDARD_IA', 'ONEZONE_IA', 'INTELLIGENT_TIERING', 'GLACIER', 'DEEP_ARCHIVE'],
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
    { name: 'id', type: 'string', description: 'Object key' },
    { name: 'etag', type: 'string', description: 'ETag of the object' },
    { name: 'version_id', type: 'string', description: 'Version ID (if versioning enabled)' },
  ],

  terraform: {
    resourceType: 'aws_s3_object',
    requiredArgs: ['bucket', 'key'],
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
