/**
 * AWS EFS Mount Target Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/efs_mount_target
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsEfsMountTarget: ServiceDefinition = {
  id: 'efs_mount_target',
  terraform_resource: 'aws_efs_mount_target',
  name: 'EFS Mount Target',
  description: 'Mount target for an EFS file system in a specific subnet',
  icon: STORAGE_ICONS.EFS,
  category: 'storage',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'file_system_id',
        type: 'string',
        description: 'ID of the EFS file system',
        reference: 'aws_efs_file_system.id',
        group: 'basic',
      },
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID for the mount target',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'ip_address',
        type: 'string',
        description: 'IP address within the subnet for the mount target',
        group: 'advanced',
      },
      {
        name: 'security_groups',
        type: 'set(string)',
        description: 'Security group IDs for the mount target',
        reference: 'aws_security_group.id',
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Mount target ID' },
    { name: 'dns_name', type: 'string', description: 'DNS name for the mount target' },
    { name: 'mount_target_dns_name', type: 'string', description: 'DNS name for the given mount target' },
    { name: 'file_system_arn', type: 'string', description: 'ARN of the EFS file system' },
    { name: 'network_interface_id', type: 'string', description: 'Network interface ID' },
    { name: 'availability_zone_name', type: 'string', description: 'Availability zone name' },
    { name: 'availability_zone_id', type: 'string', description: 'Availability zone ID' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
  ],

  terraform: {
    resourceType: 'aws_efs_mount_target',
    requiredArgs: ['file_system_id', 'subnet_id'],
    referenceableAttrs: {
      id: 'id',
      dns_name: 'dns_name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_efs_file_system',
        apply: [{ setArg: 'file_system_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_subnet',
        apply: [{ setArg: 'subnet_id', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_groups', toTargetAttr: 'id' }],
      },
    ],
  },
};
