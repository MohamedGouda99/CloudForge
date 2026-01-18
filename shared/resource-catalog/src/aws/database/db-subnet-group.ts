/**
 * AWS DB Subnet Group Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_subnet_group
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsDbSubnetGroup: ServiceDefinition = {
  id: 'db_subnet_group',
  terraform_resource: 'aws_db_subnet_group',
  name: 'DB Subnet Group',
  description: 'Subnet group for RDS database instances',
  icon: DATABASE_ICONS.RDS,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the DB subnet group',
        validation: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'subnet_ids',
        type: 'set(string)',
        description: 'List of subnet IDs for the group',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the DB subnet group',
        default: 'Managed by Terraform',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the subnet group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'DB subnet group name' },
    { name: 'arn', type: 'string', description: 'ARN of the DB subnet group' },
    { name: 'name', type: 'string', description: 'Name of the DB subnet group' },
    { name: 'supported_network_types', type: 'list(string)', description: 'Supported network types' },
    { name: 'vpc_id', type: 'string', description: 'VPC ID the subnets belong to' },
  ],

  terraform: {
    resourceType: 'aws_db_subnet_group',
    requiredArgs: ['name', 'subnet_ids'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_subnet',
        apply: [{ pushToListArg: 'subnet_ids', toTargetAttr: 'id' }],
      },
    ],
  },
};
