/**
 * AWS Launch Template Resource Definition
 *
 * Complete schema for aws_launch_template based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsLaunchTemplate: ServiceDefinition = {
  id: 'launch_template',
  terraform_resource: 'aws_launch_template',
  name: 'Launch Template',
  description: 'Template for launching EC2 instances with pre-configured settings',
  icon: COMPUTE_ICONS.LAUNCH_TEMPLATE,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the launch template',
        validation: { pattern: '^[a-zA-Z0-9\\-_.]+$' },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Creates a unique name beginning with the specified prefix',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the launch template',
        group: 'basic',
      },
      {
        name: 'image_id',
        type: 'string',
        description: 'AMI ID to use for instances',
        example: 'ami-0c55b159cbfafe1f0',
        group: 'basic',
      },
      {
        name: 'instance_type',
        type: 'string',
        description: 'Type of instance to launch',
        default: 't3.micro',
        options: [
          't3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large',
          'm5.large', 'm5.xlarge', 'm5.2xlarge',
          'c5.large', 'c5.xlarge', 'c5.2xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'key_name',
        type: 'string',
        description: 'Key pair name for SSH access',
        reference: 'aws_key_pair.key_name',
        group: 'basic',
      },
      {
        name: 'user_data',
        type: 'string',
        description: 'Base64-encoded user data script',
        group: 'advanced',
      },
      {
        name: 'ebs_optimized',
        type: 'string',
        description: 'Enable EBS optimization (true/false)',
        options: ['true', 'false'],
        group: 'advanced',
      },
      {
        name: 'disable_api_termination',
        type: 'bool',
        description: 'Enable termination protection',
        default: false,
        group: 'advanced',
      },
      {
        name: 'default_version',
        type: 'number',
        description: 'Default version of the launch template',
        group: 'advanced',
      },
      {
        name: 'update_default_version',
        type: 'bool',
        description: 'Update the default version on each update',
        default: true,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the launch template',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'network_interfaces',
        description: 'Network interface configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'associate_public_ip_address',
            type: 'string',
            description: 'Associate a public IP address',
            options: ['true', 'false'],
          },
          {
            name: 'delete_on_termination',
            type: 'string',
            description: 'Delete interface on termination',
            options: ['true', 'false'],
          },
          {
            name: 'device_index',
            type: 'number',
            description: 'Index of the network interface',
            default: 0,
          },
          {
            name: 'security_groups',
            type: 'list(string)',
            description: 'List of security group IDs',
          },
          {
            name: 'subnet_id',
            type: 'string',
            description: 'Subnet ID to launch in',
          },
        ],
      },
      {
        name: 'block_device_mappings',
        description: 'Block device mappings',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'device_name',
            type: 'string',
            description: 'Device name (e.g., /dev/xvda)',
            example: '/dev/xvda',
          },
          {
            name: 'no_device',
            type: 'string',
            description: 'Suppress the specified device',
          },
          {
            name: 'virtual_name',
            type: 'string',
            description: 'Virtual device name for ephemeral volumes',
          },
        ],
      },
      {
        name: 'iam_instance_profile',
        description: 'IAM instance profile',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'arn',
            type: 'string',
            description: 'ARN of the instance profile',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Name of the instance profile',
          },
        ],
      },
      {
        name: 'monitoring',
        description: 'Monitoring configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable detailed monitoring',
            default: false,
          },
        ],
      },
      {
        name: 'tag_specifications',
        description: 'Tag specifications for launched instances',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'resource_type',
            type: 'string',
            description: 'Resource type to tag',
            options: ['instance', 'volume', 'spot-instances-request'],
          },
          {
            name: 'tags',
            type: 'map(string)',
            description: 'Tags to apply',
          },
        ],
      },
      {
        name: 'metadata_options',
        description: 'Instance metadata options',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'http_endpoint',
            type: 'string',
            description: 'Enable metadata endpoint',
            default: 'enabled',
            options: ['enabled', 'disabled'],
          },
          {
            name: 'http_tokens',
            type: 'string',
            description: 'Require IMDSv2 tokens',
            default: 'optional',
            options: ['optional', 'required'],
          },
          {
            name: 'http_put_response_hop_limit',
            type: 'number',
            description: 'HTTP PUT response hop limit',
            default: 1,
            validation: { min: 1, max: 64 },
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Launch template ID' },
    { name: 'arn', type: 'string', description: 'ARN of the launch template' },
    { name: 'latest_version', type: 'number', description: 'Latest version number' },
    { name: 'default_version', type: 'number', description: 'Default version number' },
  ],

  terraform: {
    resourceType: 'aws_launch_template',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      latest_version: 'latest_version',
      default_version: 'default_version',
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'network_interfaces.security_groups', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_instance_profile',
        apply: [{ setArg: 'iam_instance_profile.arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
