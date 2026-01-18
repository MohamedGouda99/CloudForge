/**
 * AWS EFS File System Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/efs_file_system
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsEfsFileSystem: ServiceDefinition = {
  id: 'efs_file_system',
  terraform_resource: 'aws_efs_file_system',
  name: 'EFS File System',
  description: 'Scalable, elastic, cloud-native NFS file system for Linux workloads',
  icon: STORAGE_ICONS.EFS,
  category: 'storage',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'creation_token',
        type: 'string',
        description: 'Unique token for idempotent file system creation',
        validation: { maxLength: 64 },
        group: 'basic',
      },
      {
        name: 'availability_zone_name',
        type: 'string',
        description: 'AZ for One Zone storage class (creates One Zone file system)',
        example: 'us-east-1a',
        group: 'basic',
      },
      {
        name: 'encrypted',
        type: 'bool',
        description: 'Enable encryption at rest',
        default: false,
        group: 'security',
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS key ARN for encryption (requires encrypted=true)',
        reference: 'aws_kms_key.arn',
        group: 'security',
      },
      {
        name: 'performance_mode',
        type: 'string',
        description: 'Performance mode (cannot be changed after creation)',
        default: 'generalPurpose',
        options: ['generalPurpose', 'maxIO'],
        group: 'basic',
      },
      {
        name: 'throughput_mode',
        type: 'string',
        description: 'Throughput mode',
        default: 'bursting',
        options: ['bursting', 'provisioned', 'elastic'],
        group: 'basic',
      },
      {
        name: 'provisioned_throughput_in_mibps',
        type: 'number',
        description: 'Provisioned throughput in MiB/s (required when throughput_mode=provisioned)',
        validation: { min: 1, max: 3414 },
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the file system',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'lifecycle_policy',
        description: 'Lifecycle policy for storage class transitions (up to 3 blocks)',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'transition_to_ia',
            type: 'string',
            description: 'Days before transition to Infrequent Access',
            options: ['AFTER_1_DAY', 'AFTER_7_DAYS', 'AFTER_14_DAYS', 'AFTER_30_DAYS', 'AFTER_60_DAYS', 'AFTER_90_DAYS', 'AFTER_180_DAYS', 'AFTER_270_DAYS', 'AFTER_365_DAYS'],
          },
          {
            name: 'transition_to_primary_storage_class',
            type: 'string',
            description: 'Policy to transition back to primary storage',
            options: ['AFTER_1_ACCESS'],
          },
          {
            name: 'transition_to_archive',
            type: 'string',
            description: 'Days before transition to Archive',
            options: ['AFTER_1_DAY', 'AFTER_7_DAYS', 'AFTER_14_DAYS', 'AFTER_30_DAYS', 'AFTER_60_DAYS', 'AFTER_90_DAYS', 'AFTER_180_DAYS', 'AFTER_270_DAYS', 'AFTER_365_DAYS'],
          },
        ],
      },
      {
        name: 'protection',
        description: 'File system protection settings',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'replication_overwrite',
            type: 'string',
            description: 'Protection against accidental replication overwrite',
            options: ['ENABLED', 'DISABLED', 'REPLICATING'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'File system ID' },
    { name: 'arn', type: 'string', description: 'ARN of the file system' },
    { name: 'dns_name', type: 'string', description: 'DNS name for mounting' },
    { name: 'name', type: 'string', description: 'File system name from Name tag' },
    { name: 'availability_zone_id', type: 'string', description: 'AZ ID for One Zone file systems' },
    { name: 'number_of_mount_targets', type: 'number', description: 'Current number of mount targets' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of owner' },
    { name: 'size_in_bytes', type: 'list(object)', description: 'Latest metered size information' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_efs_file_system',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      dns_name: 'dns_name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [{ setArg: 'kms_key_id', toTargetAttr: 'arn' }],
      },
    ],
    validChildren: [
      {
        childTypes: ['aws_efs_mount_target', 'aws_efs_access_point', 'aws_efs_file_system_policy', 'aws_efs_backup_policy', 'aws_efs_replication_configuration'],
        description: 'EFS mount targets, access points, and policies',
      },
    ],
  },
};
