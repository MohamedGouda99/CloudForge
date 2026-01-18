/**
 * AWS EKS Node Group Resource Definition
 *
 * Complete schema for aws_eks_node_group based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEksNodeGroup: ServiceDefinition = {
  id: 'eks_node_group',
  terraform_resource: 'aws_eks_node_group',
  name: 'EKS Node Group',
  description: 'Managed node group for Amazon EKS cluster',
  icon: CONTAINER_ICONS.EKS_NODE_GROUP,
  category: 'containers',
  classification: 'icon', // Placed inside EKS Cluster

  inputs: {
    required: [
      {
        name: 'cluster_name',
        type: 'string',
        description: 'Name of the EKS cluster',
        reference: 'aws_eks_cluster.name',
        group: 'basic',
      },
      {
        name: 'node_group_name',
        type: 'string',
        description: 'Name of the node group',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9-_]*$',
          minLength: 1,
          maxLength: 63,
        },
        group: 'basic',
      },
      {
        name: 'node_role_arn',
        type: 'string',
        description: 'ARN of the IAM role for the nodes',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'subnet_ids',
        type: 'set(string)',
        description: 'Subnet IDs for the nodes',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'node_group_name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated node group name',
        group: 'basic',
      },
      {
        name: 'instance_types',
        type: 'list(string)',
        description: 'Instance types for the nodes',
        default: ['t3.medium'],
        options: [
          't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge',
          'm5.large', 'm5.xlarge', 'm5.2xlarge',
          'c5.large', 'c5.xlarge', 'c5.2xlarge',
          'r5.large', 'r5.xlarge', 'r5.2xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'disk_size',
        type: 'number',
        description: 'Disk size in GiB for nodes',
        default: 20,
        validation: { min: 1, max: 16384 },
        group: 'basic',
      },
      {
        name: 'ami_type',
        type: 'string',
        description: 'AMI type for the nodes',
        default: 'AL2_x86_64',
        options: [
          'AL2_x86_64', 'AL2_x86_64_GPU', 'AL2_ARM_64',
          'AL2023_x86_64_STANDARD', 'AL2023_ARM_64_STANDARD',
          'BOTTLEROCKET_ARM_64', 'BOTTLEROCKET_x86_64', 'BOTTLEROCKET_ARM_64_NVIDIA', 'BOTTLEROCKET_x86_64_NVIDIA',
          'WINDOWS_CORE_2019_x86_64', 'WINDOWS_FULL_2019_x86_64',
          'WINDOWS_CORE_2022_x86_64', 'WINDOWS_FULL_2022_x86_64',
          'CUSTOM',
        ],
        group: 'basic',
      },
      {
        name: 'release_version',
        type: 'string',
        description: 'AMI release version',
        group: 'advanced',
      },
      {
        name: 'version',
        type: 'string',
        description: 'Kubernetes version for the nodes',
        group: 'basic',
      },
      {
        name: 'capacity_type',
        type: 'string',
        description: 'Capacity type for the nodes',
        default: 'ON_DEMAND',
        options: ['ON_DEMAND', 'SPOT'],
        group: 'basic',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'Kubernetes labels to apply to nodes',
        default: {},
        group: 'advanced',
      },
      {
        name: 'force_update_version',
        type: 'bool',
        description: 'Force version update if pods cannot be drained',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the node group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'scaling_config',
        description: 'Scaling configuration for the node group',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'desired_size',
            type: 'number',
            description: 'Desired number of nodes',
            default: 2,
            validation: { min: 0, max: 100 },
          },
          {
            name: 'min_size',
            type: 'number',
            description: 'Minimum number of nodes',
            default: 1,
            validation: { min: 0, max: 100 },
          },
          {
            name: 'max_size',
            type: 'number',
            description: 'Maximum number of nodes',
            default: 3,
            validation: { min: 1, max: 100 },
          },
        ],
      },
      {
        name: 'update_config',
        description: 'Node group update configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'max_unavailable',
            type: 'number',
            description: 'Max nodes unavailable during update',
            validation: { min: 1 },
          },
          {
            name: 'max_unavailable_percentage',
            type: 'number',
            description: 'Max percentage unavailable during update',
            validation: { min: 1, max: 100 },
          },
        ],
      },
      {
        name: 'remote_access',
        description: 'Remote access configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'ec2_ssh_key',
            type: 'string',
            description: 'EC2 key pair name for SSH access',
          },
          {
            name: 'source_security_group_ids',
            type: 'set(string)',
            description: 'Security group IDs for remote access',
          },
        ],
      },
      {
        name: 'taint',
        description: 'Kubernetes taints to apply to nodes',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'key',
            type: 'string',
            description: 'Taint key',
          },
          {
            name: 'value',
            type: 'string',
            description: 'Taint value',
          },
          {
            name: 'effect',
            type: 'string',
            description: 'Taint effect',
            options: ['NO_SCHEDULE', 'NO_EXECUTE', 'PREFER_NO_SCHEDULE'],
          },
        ],
      },
      {
        name: 'launch_template',
        description: 'Launch template configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'id',
            type: 'string',
            description: 'Launch template ID',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Launch template name',
          },
          {
            name: 'version',
            type: 'string',
            description: 'Launch template version',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Node group ID' },
    { name: 'arn', type: 'string', description: 'ARN of the node group' },
    { name: 'status', type: 'string', description: 'Node group status' },
    { name: 'resources', type: 'list', description: 'Node group resources' },
  ],

  terraform: {
    resourceType: 'aws_eks_node_group',
    requiredArgs: ['cluster_name', 'node_group_name', 'node_role_arn', 'subnet_ids', 'scaling_config'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      status: 'status',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_eks_cluster',
        apply: [{ setArg: 'cluster_name', toParentAttr: 'name' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'node_role_arn', toTargetAttr: 'arn' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'cluster_name',
        acceptsResourceTypes: ['aws_eks_cluster'],
        search: [{ type: 'containment_ancestors' }],
        onMissing: {
          level: 'error',
          message: 'EKS Node Group must be inside an EKS Cluster',
          fixHint: 'Place the node group inside an EKS Cluster container',
        },
      },
      {
        requiredArg: 'node_role_arn',
        acceptsResourceTypes: ['aws_iam_role'],
        search: [{ type: 'connected_edges', edgeKind: 'attach' }],
        onMissing: {
          level: 'error',
          message: 'EKS Node Group requires an IAM role',
          fixHint: 'Connect an IAM role to the node group',
        },
      },
    ],
  },
};
