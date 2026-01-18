/**
 * AWS Athena Workgroup Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/athena_workgroup
 */

import type { ServiceDefinition } from '../../types';

const ANALYTICS_ICONS = {
  ATHENA: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Athena_64.svg',
};

export const awsAthenaWorkgroup: ServiceDefinition = {
  id: 'athena_workgroup',
  terraform_resource: 'aws_athena_workgroup',
  name: 'Athena Workgroup',
  description: 'Workgroup for running SQL queries against data in S3',
  icon: ANALYTICS_ICONS.ATHENA,
  category: 'analytics',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the workgroup',
        validation: { pattern: '^[a-zA-Z0-9._-]+$', maxLength: 128 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the workgroup',
        group: 'basic',
      },
      {
        name: 'state',
        type: 'string',
        description: 'State of the workgroup',
        default: 'ENABLED',
        options: ['ENABLED', 'DISABLED'],
        group: 'basic',
      },
      {
        name: 'force_destroy',
        type: 'bool',
        description: 'Force destroy even if queries exist',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the workgroup',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'configuration',
        description: 'Workgroup configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'bytes_scanned_cutoff_per_query',
            type: 'number',
            description: 'Maximum bytes scanned per query',
          },
          {
            name: 'enforce_workgroup_configuration',
            type: 'bool',
            description: 'Enforce workgroup settings for queries',
            default: true,
          },
          {
            name: 'publish_cloudwatch_metrics_enabled',
            type: 'bool',
            description: 'Publish query metrics to CloudWatch',
            default: true,
          },
          {
            name: 'requester_pays_enabled',
            type: 'bool',
            description: 'Requester pays for S3 access',
            default: false,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Workgroup name' },
    { name: 'arn', type: 'string', description: 'ARN of the workgroup' },
  ],

  terraform: {
    resourceType: 'aws_athena_workgroup',
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
