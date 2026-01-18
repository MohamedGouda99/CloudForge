/**
 * AWS Glue Catalog Database Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/glue_catalog_database
 */

import type { ServiceDefinition } from '../../types';

const ANALYTICS_ICONS = {
  GLUE: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_AWS-Glue_64.svg',
};

export const awsGlueCatalogDatabase: ServiceDefinition = {
  id: 'glue_catalog_database',
  terraform_resource: 'aws_glue_catalog_database',
  name: 'Glue Database',
  description: 'AWS Glue Data Catalog database for metadata storage',
  icon: ANALYTICS_ICONS.GLUE,
  category: 'analytics',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the database',
        validation: { pattern: '^[a-z0-9_]+$', maxLength: 255 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'catalog_id',
        type: 'string',
        description: 'ID of the Data Catalog (defaults to account ID)',
        group: 'advanced',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the database',
        group: 'basic',
      },
      {
        name: 'location_uri',
        type: 'string',
        description: 'Location of the database (S3 path)',
        example: 's3://my-bucket/my-database/',
        group: 'basic',
      },
      {
        name: 'parameters',
        type: 'map(string)',
        description: 'Properties for the database',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the database',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'create_table_default_permission',
        description: 'Default table creation permissions',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'permissions',
            type: 'list(string)',
            description: 'List of permissions',
            options: ['ALL', 'SELECT', 'ALTER', 'DROP', 'DELETE', 'INSERT', 'CREATE_DATABASE', 'CREATE_TABLE', 'DATA_LOCATION_ACCESS'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Catalog ID and database name' },
    { name: 'arn', type: 'string', description: 'ARN of the Glue catalog database' },
    { name: 'name', type: 'string', description: 'Name of the database' },
  ],

  terraform: {
    resourceType: 'aws_glue_catalog_database',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
