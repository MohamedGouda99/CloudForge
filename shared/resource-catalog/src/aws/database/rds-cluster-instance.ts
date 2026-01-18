/**
 * AWS RDS Cluster Instance Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster_instance
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const awsRdsClusterInstance: ServiceDefinition = {
  id: 'rds_cluster_instance',
  terraform_resource: 'aws_rds_cluster_instance',
  name: 'RDS Cluster Instance',
  description: 'Instance within an Aurora DB cluster',
  icon: DATABASE_ICONS.AURORA,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'cluster_identifier',
        type: 'string',
        description: 'Identifier of the RDS cluster',
        reference: 'aws_rds_cluster.cluster_identifier',
        group: 'basic',
      },
      {
        name: 'instance_class',
        type: 'string',
        description: 'Instance class for the cluster instance',
        example: 'db.r6g.large',
        options: [
          'db.t3.medium', 'db.t3.large',
          'db.r6g.large', 'db.r6g.xlarge', 'db.r6g.2xlarge', 'db.r6g.4xlarge',
          'db.r5.large', 'db.r5.xlarge', 'db.r5.2xlarge', 'db.r5.4xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'engine',
        type: 'string',
        description: 'Database engine (must match cluster)',
        options: ['aurora-mysql', 'aurora-postgresql'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'identifier',
        type: 'string',
        description: 'Identifier for the instance (auto-generated if not set)',
        validation: { pattern: '^[a-z][a-z0-9-]*$', maxLength: 63 },
        group: 'basic',
      },
      {
        name: 'identifier_prefix',
        type: 'string',
        description: 'Prefix for auto-generated identifier',
        group: 'basic',
      },
      {
        name: 'engine_version',
        type: 'string',
        description: 'Database engine version',
        group: 'basic',
      },
      {
        name: 'publicly_accessible',
        type: 'bool',
        description: 'Enable public access',
        default: false,
        group: 'networking',
      },
      {
        name: 'db_subnet_group_name',
        type: 'string',
        description: 'DB subnet group name',
        reference: 'aws_db_subnet_group.name',
        group: 'networking',
      },
      {
        name: 'db_parameter_group_name',
        type: 'string',
        description: 'DB parameter group name',
        reference: 'aws_db_parameter_group.name',
        group: 'advanced',
      },
      {
        name: 'apply_immediately',
        type: 'bool',
        description: 'Apply changes immediately',
        default: false,
        group: 'advanced',
      },
      {
        name: 'auto_minor_version_upgrade',
        type: 'bool',
        description: 'Enable auto minor version upgrades',
        default: true,
        group: 'advanced',
      },
      {
        name: 'availability_zone',
        type: 'string',
        description: 'Availability zone for the instance',
        group: 'networking',
      },
      {
        name: 'monitoring_interval',
        type: 'number',
        description: 'Enhanced monitoring interval (seconds)',
        default: 0,
        options: ['0', '1', '5', '10', '15', '30', '60'],
        group: 'advanced',
      },
      {
        name: 'monitoring_role_arn',
        type: 'string',
        description: 'IAM role ARN for enhanced monitoring',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'performance_insights_enabled',
        type: 'bool',
        description: 'Enable Performance Insights',
        default: false,
        group: 'advanced',
      },
      {
        name: 'performance_insights_kms_key_id',
        type: 'string',
        description: 'KMS key ID for Performance Insights encryption',
        reference: 'aws_kms_key.id',
        group: 'advanced',
      },
      {
        name: 'performance_insights_retention_period',
        type: 'number',
        description: 'Performance Insights retention period (days)',
        default: 7,
        validation: { min: 7, max: 731 },
        group: 'advanced',
      },
      {
        name: 'promotion_tier',
        type: 'number',
        description: 'Failover priority (lower = higher priority)',
        default: 0,
        validation: { min: 0, max: 15 },
        group: 'advanced',
      },
      {
        name: 'copy_tags_to_snapshot',
        type: 'bool',
        description: 'Copy tags to snapshots',
        default: false,
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the instance',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Instance identifier' },
    { name: 'arn', type: 'string', description: 'ARN of the instance' },
    { name: 'endpoint', type: 'string', description: 'Instance endpoint' },
    { name: 'port', type: 'number', description: 'Database port' },
    { name: 'writer', type: 'bool', description: 'Whether this is the writer instance' },
    { name: 'dbi_resource_id', type: 'string', description: 'DBI resource ID' },
    { name: 'storage_encrypted', type: 'bool', description: 'Whether storage is encrypted' },
    { name: 'kms_key_id', type: 'string', description: 'KMS key ID used for encryption' },
  ],

  terraform: {
    resourceType: 'aws_rds_cluster_instance',
    requiredArgs: ['cluster_identifier', 'instance_class', 'engine'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      endpoint: 'endpoint',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_rds_cluster',
        apply: [{ setArg: 'cluster_identifier', toTargetAttr: 'cluster_identifier' }],
      },
    ],
  },
};
