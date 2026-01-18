/**
 * AWS EC2 Instance Resource Definition
 *
 * Complete schema for aws_instance based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsEc2Instance: ServiceDefinition = {
  id: 'ec2_instance',
  terraform_resource: 'aws_instance',
  name: 'EC2 Instance',
  description: 'Virtual server in the AWS cloud for running applications',
  icon: COMPUTE_ICONS.EC2,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'ami',
        type: 'string',
        description: 'AMI ID to use for the instance',
        example: 'ami-0c55b159cbfafe1f0',
        group: 'basic',
      },
      {
        name: 'instance_type',
        type: 'string',
        description: 'Type of instance to start',
        default: 't3.micro',
        example: 't3.micro',
        options: [
          't3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 't3.2xlarge',
          't2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large', 't2.xlarge', 't2.2xlarge',
          'm5.large', 'm5.xlarge', 'm5.2xlarge', 'm5.4xlarge', 'm5.8xlarge', 'm5.12xlarge',
          'c5.large', 'c5.xlarge', 'c5.2xlarge', 'c5.4xlarge', 'c5.9xlarge',
          'r5.large', 'r5.xlarge', 'r5.2xlarge', 'r5.4xlarge', 'r5.8xlarge',
        ],
        validation: {
          pattern: '^[a-z][0-9][a-z]?\\.(nano|micro|small|medium|large|xlarge|[0-9]+xlarge|metal)$',
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'availability_zone',
        type: 'string',
        description: 'AZ to start the instance in',
        example: 'us-east-1a',
        group: 'basic',
      },
      {
        name: 'subnet_id',
        type: 'string',
        description: 'VPC Subnet ID to launch in',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'vpc_security_group_ids',
        type: 'list(string)',
        description: 'List of security group IDs to associate',
        reference: 'aws_security_group.id',
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
        name: 'iam_instance_profile',
        type: 'string',
        description: 'IAM Instance Profile to attach',
        reference: 'aws_iam_instance_profile.name',
        group: 'advanced',
      },
      {
        name: 'user_data',
        type: 'string',
        description: 'User data script to run at launch',
        example: '#!/bin/bash\\necho "Hello World"',
        group: 'advanced',
      },
      {
        name: 'user_data_base64',
        type: 'string',
        description: 'Base64-encoded user data script',
        group: 'advanced',
      },
      {
        name: 'associate_public_ip_address',
        type: 'bool',
        description: 'Associate a public IP address with the instance',
        default: false,
        group: 'basic',
      },
      {
        name: 'private_ip',
        type: 'string',
        description: 'Private IP address to associate with the instance',
        validation: {
          pattern: '^([0-9]{1,3}\\.){3}[0-9]{1,3}$',
        },
        group: 'advanced',
      },
      {
        name: 'monitoring',
        type: 'bool',
        description: 'Enable detailed CloudWatch monitoring',
        default: false,
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
        name: 'ebs_optimized',
        type: 'bool',
        description: 'Enable EBS optimization',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tenancy',
        type: 'string',
        description: 'Tenancy of the instance',
        default: 'default',
        options: ['default', 'dedicated', 'host'],
        group: 'advanced',
      },
      {
        name: 'placement_group',
        type: 'string',
        description: 'Placement group for the instance',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the instance',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'root_block_device',
        description: 'Configuration for the root block device',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'volume_type',
            type: 'string',
            description: 'Type of volume (gp2, gp3, io1, io2, sc1, st1, standard)',
            default: 'gp3',
            options: ['gp2', 'gp3', 'io1', 'io2', 'sc1', 'st1', 'standard'],
          },
          {
            name: 'volume_size',
            type: 'number',
            description: 'Size of the volume in GiB',
            default: 8,
            validation: { min: 1, max: 16384 },
          },
          {
            name: 'iops',
            type: 'number',
            description: 'Amount of provisioned IOPS (for io1, io2, gp3)',
            validation: { min: 100, max: 64000 },
          },
          {
            name: 'throughput',
            type: 'number',
            description: 'Throughput in MiB/s (for gp3 only)',
            validation: { min: 125, max: 1000 },
          },
          {
            name: 'encrypted',
            type: 'bool',
            description: 'Enable volume encryption',
            default: false,
          },
          {
            name: 'kms_key_id',
            type: 'string',
            description: 'KMS key ID for encryption',
          },
          {
            name: 'delete_on_termination',
            type: 'bool',
            description: 'Delete the volume when the instance is terminated',
            default: true,
          },
        ],
      },
      {
        name: 'ebs_block_device',
        description: 'Additional EBS block devices to attach',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'device_name',
            type: 'string',
            description: 'Device name (e.g., /dev/sdb)',
            example: '/dev/sdb',
          },
          {
            name: 'volume_type',
            type: 'string',
            description: 'Type of volume',
            default: 'gp3',
            options: ['gp2', 'gp3', 'io1', 'io2', 'sc1', 'st1', 'standard'],
          },
          {
            name: 'volume_size',
            type: 'number',
            description: 'Size of the volume in GiB',
            validation: { min: 1, max: 16384 },
          },
          {
            name: 'iops',
            type: 'number',
            description: 'Amount of provisioned IOPS',
            validation: { min: 100, max: 64000 },
          },
          {
            name: 'encrypted',
            type: 'bool',
            description: 'Enable volume encryption',
            default: false,
          },
          {
            name: 'snapshot_id',
            type: 'string',
            description: 'Snapshot ID to create the volume from',
          },
          {
            name: 'delete_on_termination',
            type: 'bool',
            description: 'Delete the volume when the instance is terminated',
            default: true,
          },
        ],
      },
      {
        name: 'network_interface',
        description: 'Attach network interfaces',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'network_interface_id',
            type: 'string',
            description: 'ID of the network interface to attach',
          },
          {
            name: 'device_index',
            type: 'number',
            description: 'Integer index of the network interface attachment',
          },
          {
            name: 'delete_on_termination',
            type: 'bool',
            description: 'Delete the network interface on instance termination',
            default: false,
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
            description: 'Whether the metadata service is available',
            default: 'enabled',
            options: ['enabled', 'disabled'],
          },
          {
            name: 'http_tokens',
            type: 'string',
            description: 'Whether tokens are required for metadata requests (IMDSv2)',
            default: 'optional',
            options: ['optional', 'required'],
          },
          {
            name: 'http_put_response_hop_limit',
            type: 'number',
            description: 'HTTP PUT response hop limit for instance metadata requests',
            default: 1,
            validation: { min: 1, max: 64 },
          },
          {
            name: 'instance_metadata_tags',
            type: 'string',
            description: 'Whether instance tags are accessible from the metadata service',
            default: 'disabled',
            options: ['enabled', 'disabled'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Instance ID' },
    { name: 'arn', type: 'string', description: 'ARN of the instance' },
    { name: 'public_ip', type: 'string', description: 'Public IP address' },
    { name: 'private_ip', type: 'string', description: 'Private IP address' },
    { name: 'public_dns', type: 'string', description: 'Public DNS name' },
    { name: 'private_dns', type: 'string', description: 'Private DNS name' },
    { name: 'availability_zone', type: 'string', description: 'Availability zone' },
    { name: 'subnet_id', type: 'string', description: 'Subnet ID' },
    { name: 'primary_network_interface_id', type: 'string', description: 'Primary network interface ID' },
    { name: 'instance_state', type: 'string', description: 'State of the instance' },
  ],

  terraform: {
    resourceType: 'aws_instance',
    requiredArgs: ['ami', 'instance_type'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      public_ip: 'public_ip',
      private_ip: 'private_ip',
      public_dns: 'public_dns',
      private_dns: 'private_dns',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_subnet',
        apply: [{ setArg: 'subnet_id', toParentAttr: 'id' }],
      },
      {
        whenParentResourceType: 'aws_vpc',
        apply: [], // VPC containment is informational; subnet provides actual network config
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'vpc_security_group_ids', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_instance_profile',
        apply: [{ setArg: 'iam_instance_profile', toTargetAttr: 'name' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_key_pair',
        apply: [{ setArg: 'key_name', toTargetAttr: 'key_name' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'subnet_id',
        acceptsResourceTypes: ['aws_subnet'],
        search: [{ type: 'containment_ancestors' }],
        onMissing: {
          level: 'warning',
          message: 'EC2 instance has no subnet configured',
          fixHint: 'Place instance inside a subnet or connect to a subnet',
        },
      },
    ],
  },
};
