/**
 * GCP Cloud Storage Bucket Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const gcpStorageBucket: ServiceDefinition = {
  id: 'storage_bucket',
  terraform_resource: 'google_storage_bucket',
  name: 'Cloud Storage Bucket',
  description: 'Creates a new bucket in Google cloud storage service (GCS)',
  icon: STORAGE_ICONS.CLOUD_STORAGE,
  category: 'storage',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the bucket',
        example: 'my-bucket',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The GCS location',
        example: 'US',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'storage_class',
        type: 'string',
        description: 'The Storage Class of the new bucket',
        options: ['STANDARD', 'MULTI_REGIONAL', 'REGIONAL', 'NEARLINE', 'COLDLINE', 'ARCHIVE'],
        default: 'STANDARD',
        group: 'basic',
      },
      {
        name: 'force_destroy',
        type: 'bool',
        description: 'When deleting a bucket, this boolean option will delete all contained objects',
        default: false,
        group: 'advanced',
      },
      {
        name: 'uniform_bucket_level_access',
        type: 'bool',
        description: 'Enables Uniform bucket-level access access to a bucket',
        default: false,
        group: 'advanced',
      },
      {
        name: 'public_access_prevention',
        type: 'string',
        description: 'Prevents public access to a bucket',
        options: ['inherited', 'enforced'],
        group: 'advanced',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'A map of key/value label pairs to assign to the bucket',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'versioning',
        description: 'The bucket versioning configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enabled',
            type: 'bool',
            description: 'While set to true, versioning is fully enabled for this bucket',
          },
        ],
      },
      {
        name: 'lifecycle_rule',
        description: 'The bucket lifecycle rule configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'action',
            type: 'string',
            description: 'The Lifecycle Rule action block',
          },
          {
            name: 'condition',
            type: 'string',
            description: 'The Lifecycle Rule condition block',
          },
        ],
      },
      {
        name: 'encryption',
        description: 'The bucket encryption configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'default_kms_key_name',
            type: 'string',
            description: 'A Cloud KMS key that will be used to encrypt objects inserted into this bucket',
          },
        ],
      },
      {
        name: 'cors',
        description: 'The bucket CORS configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'origin',
            type: 'list(string)',
            description: 'The list of Origins eligible to receive CORS response headers',
          },
          {
            name: 'method',
            type: 'list(string)',
            description: 'The list of HTTP methods on which to include CORS response headers',
          },
          {
            name: 'response_header',
            type: 'list(string)',
            description: 'The list of HTTP headers other than the simple response headers',
          },
          {
            name: 'max_age_seconds',
            type: 'number',
            description: 'The value, in seconds, to return in the Access-Control-Max-Age header',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'url', type: 'string', description: 'The base URL of the bucket, in the format gs://<bucket-name>' },
  ],

  terraform: {
    resourceType: 'google_storage_bucket',
    requiredArgs: ['name', 'location'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      name: 'name',
      url: 'url',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['google_storage_bucket_object'],
        description: 'Storage bucket can contain objects',
      },
    ],
  },
};
