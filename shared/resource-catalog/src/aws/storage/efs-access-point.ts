/**
 * AWS EFS Access Point Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/efs_access_point
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const awsEfsAccessPoint: ServiceDefinition = {
  id: 'efs_access_point',
  terraform_resource: 'aws_efs_access_point',
  name: 'EFS Access Point',
  description: 'Application-specific entry point into an EFS file system',
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
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the access point',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'posix_user',
        description: 'POSIX user configuration for the access point',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'uid',
            type: 'number',
            description: 'POSIX user ID for all file operations',
          },
          {
            name: 'gid',
            type: 'number',
            description: 'POSIX group ID for all file operations',
          },
          {
            name: 'secondary_gids',
            type: 'set(string)',
            description: 'Secondary POSIX group IDs',
          },
        ],
      },
      {
        name: 'root_directory',
        description: 'Root directory configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'path',
            type: 'string',
            description: 'Path on the EFS file system',
            default: '/',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Access point ID' },
    { name: 'arn', type: 'string', description: 'ARN of the access point' },
    { name: 'file_system_arn', type: 'string', description: 'ARN of the EFS file system' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
  ],

  terraform: {
    resourceType: 'aws_efs_access_point',
    requiredArgs: ['file_system_id'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_efs_file_system',
        apply: [{ setArg: 'file_system_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [],
  },
};
