/**
 * AWS ECR Repository Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEcrRepository: ServiceDefinition = {
  id: 'ecr_repository',
  terraform_resource: 'aws_ecr_repository',
  name: 'ECR Repository',
  description: 'Elastic Container Registry repository for storing Docker images',
  icon: CONTAINER_ICONS.ECR,
  category: 'containers',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the repository',
        example: 'my-app',
        validation: {
          pattern: '^[a-z0-9][a-z0-9._/-]*$',
          maxLength: 256,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'image_tag_mutability',
        type: 'string',
        description: 'Tag mutability setting for the repository',
        default: 'MUTABLE',
        options: ['MUTABLE', 'IMMUTABLE'],
        group: 'basic',
      },
      {
        name: 'force_delete',
        type: 'bool',
        description: 'Delete repository even if it contains images',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the repository',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'image_scanning_configuration',
        description: 'Image scanning configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'scan_on_push',
            type: 'bool',
            description: 'Scan images on push',
            default: false,
          },
        ],
      },
      {
        name: 'encryption_configuration',
        description: 'Encryption configuration for the repository',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'encryption_type',
            type: 'string',
            description: 'Encryption type',
            default: 'AES256',
            options: ['AES256', 'KMS'],
          },
          {
            name: 'kms_key',
            type: 'string',
            description: 'KMS key ARN (KMS encryption only)',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the repository' },
    { name: 'registry_id', type: 'string', description: 'Registry ID' },
    { name: 'repository_url', type: 'string', description: 'URL of the repository' },
  ],

  terraform: {
    resourceType: 'aws_ecr_repository',
    requiredArgs: ['name'],
    referenceableAttrs: {
      arn: 'arn',
      repository_url: 'repository_url',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
