/**
 * AWS EBS Volume Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ebs_volume
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsEbsVolume: ServiceDefinition = {
  id: 'ebs_volume',
  terraform_resource: 'aws_ebs_volume',
  name: 'EBS Volume',
  description: 'Persistent block storage for EC2 instances with encryption and snapshot support',
  icon: STORAGE_ICONS.EBS,
  category: 'storage',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'availability_zone',
        type: 'string',
        description: 'Availability zone for the volume (must match attached EC2 instance)',
        example: 'us-east-1a',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'size',
        type: 'number',
        description: 'Size of the volume in GiB',
        validation: { min: 1, max: 16384 },
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'Volume type',
        default: 'gp3',
        options: ['gp2', 'gp3', 'io1', 'io2', 'sc1', 'st1', 'standard'],
        group: 'basic',
      },
      {
        name: 'iops',
        type: 'number',
        description: 'Provisioned IOPS (io1: 100-64000, io2: 100-256000, gp3: 3000-16000)',
        validation: { min: 100, max: 256000 },
        group: 'advanced',
      },
      {
        name: 'throughput',
        type: 'number',
        description: 'Throughput in MiB/s (gp3 only, 125-1000)',
        validation: { min: 125, max: 1000 },
        group: 'advanced',
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
        description: 'KMS key ARN for encryption',
        reference: 'aws_kms_key.arn',
        group: 'security',
      },
      {
        name: 'snapshot_id',
        type: 'string',
        description: 'EBS snapshot ID to create volume from',
        reference: 'aws_ebs_snapshot.id',
        group: 'advanced',
      },
      {
        name: 'outpost_arn',
        type: 'string',
        description: 'ARN of the Outpost for volume creation',
        group: 'advanced',
      },
      {
        name: 'multi_attach_enabled',
        type: 'bool',
        description: 'Enable Multi-Attach (io1/io2 only, Nitro instances)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'final_snapshot',
        type: 'bool',
        description: 'Create snapshot before volume deletion',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the volume',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Volume ID' },
    { name: 'arn', type: 'string', description: 'ARN of the volume' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_ebs_volume',
    requiredArgs: ['availability_zone'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_instance',
        apply: [],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [{ setArg: 'kms_key_id', toTargetAttr: 'arn' }],
      },
    ],
  },
};
