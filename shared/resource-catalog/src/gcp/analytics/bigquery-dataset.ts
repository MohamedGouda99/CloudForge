/**
 * GCP BigQuery Dataset Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { ANALYTICS_ICONS } from '../icons';

export const gcpBigQueryDataset: ServiceDefinition = {
  id: 'bigquery_dataset',
  terraform_resource: 'google_bigquery_dataset',
  name: 'BigQuery Dataset',
  description: 'Datasets are top-level containers that are used to organize and control access to your tables and views',
  icon: ANALYTICS_ICONS.BIGQUERY,
  category: 'analytics',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'dataset_id',
        type: 'string',
        description: 'A unique ID for this dataset',
        example: 'my_dataset',
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
        name: 'friendly_name',
        type: 'string',
        description: 'A descriptive name for the dataset',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'A user-friendly description of the dataset',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The geographic location where the dataset should reside',
        default: 'US',
        group: 'basic',
      },
      {
        name: 'default_table_expiration_ms',
        type: 'number',
        description: 'The default lifetime of all tables in the dataset, in milliseconds',
        group: 'advanced',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'The labels associated with this dataset',
        group: 'basic',
      },
      {
        name: 'delete_contents_on_destroy',
        type: 'bool',
        description: 'If set to true, delete all the tables in the dataset when destroying the resource',
        default: false,
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'access',
        description: 'An array of objects that define dataset access for one or more entities',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'role',
            type: 'string',
            description: 'Describes the rights granted to the user specified by the other member of the access object',
            options: ['READER', 'WRITER', 'OWNER'],
          },
          {
            name: 'user_by_email',
            type: 'string',
            description: 'An email address of a user to grant access to',
          },
          {
            name: 'group_by_email',
            type: 'string',
            description: 'An email address of a Google Group to grant access to',
          },
          {
            name: 'special_group',
            type: 'string',
            description: 'A special group to grant access to',
            options: ['projectOwners', 'projectReaders', 'projectWriters', 'allAuthenticatedUsers'],
          },
        ],
      },
      {
        name: 'default_encryption_configuration',
        description: 'The default encryption key for all tables in the dataset',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'kms_key_name',
            type: 'string',
            description: 'Describes the Cloud KMS encryption key that will be used to protect destination BigQuery table',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'creation_time', type: 'number', description: 'The time when this dataset was created, in milliseconds since the epoch' },
    { name: 'last_modified_time', type: 'number', description: 'The date when this dataset or any of its tables was last modified' },
    { name: 'etag', type: 'string', description: 'A hash of the resource' },
  ],

  terraform: {
    resourceType: 'google_bigquery_dataset',
    requiredArgs: ['dataset_id'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      dataset_id: 'dataset_id',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['google_bigquery_table'],
        description: 'BigQuery dataset can contain tables',
      },
    ],
  },
};
