/**
 * AWS EKS Cluster Resource Definition
 *
 * Complete schema for aws_eks_cluster based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEksCluster: ServiceDefinition = {
  id: 'eks_cluster',
  terraform_resource: 'aws_eks_cluster',
  name: 'EKS Cluster',
  description: 'Managed Kubernetes cluster on Amazon EKS',
  icon: CONTAINER_ICONS.EKS_CLUSTER,
  category: 'containers',
  classification: 'container', // Can contain EKS Node Groups

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the cluster',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9-]*$',
          minLength: 1,
          maxLength: 100,
        },
        group: 'basic',
      },
      {
        name: 'role_arn',
        type: 'string',
        description: 'ARN of the IAM role for the cluster',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'version',
        type: 'string',
        description: 'Kubernetes version',
        example: '1.29',
        group: 'basic',
      },
      {
        name: 'enabled_cluster_log_types',
        type: 'list(string)',
        description: 'Control plane logging types',
        options: ['api', 'audit', 'authenticator', 'controllerManager', 'scheduler'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the cluster',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'vpc_config',
        description: 'VPC configuration for the cluster',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'subnet_ids',
            type: 'set(string)',
            description: 'Subnet IDs for the cluster',
          },
          {
            name: 'security_group_ids',
            type: 'set(string)',
            description: 'Security group IDs for the cluster',
          },
          {
            name: 'endpoint_private_access',
            type: 'bool',
            description: 'Enable private API server endpoint',
            default: false,
          },
          {
            name: 'endpoint_public_access',
            type: 'bool',
            description: 'Enable public API server endpoint',
            default: true,
          },
          {
            name: 'public_access_cidrs',
            type: 'set(string)',
            description: 'CIDR blocks for public endpoint access',
          },
        ],
      },
      {
        name: 'kubernetes_network_config',
        description: 'Kubernetes network configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'service_ipv4_cidr',
            type: 'string',
            description: 'CIDR block for Kubernetes service addresses',
            validation: {
              pattern: '^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$',
            },
          },
          {
            name: 'ip_family',
            type: 'string',
            description: 'IP family for the cluster',
            default: 'ipv4',
            options: ['ipv4', 'ipv6'],
          },
        ],
      },
      {
        name: 'encryption_config',
        description: 'Encryption configuration for secrets',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'resources',
            type: 'set(string)',
            description: 'Resources to encrypt',
            options: ['secrets'],
          },
        ],
      },
      {
        name: 'outpost_config',
        description: 'Outposts configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'outpost_arns',
            type: 'set(string)',
            description: 'ARNs of Outposts',
          },
          {
            name: 'control_plane_instance_type',
            type: 'string',
            description: 'Instance type for control plane',
          },
          {
            name: 'control_plane_placement',
            type: 'string',
            description: 'Placement group for control plane',
          },
        ],
      },
      {
        name: 'access_config',
        description: 'Cluster access configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'authentication_mode',
            type: 'string',
            description: 'Authentication mode',
            options: ['CONFIG_MAP', 'API', 'API_AND_CONFIG_MAP'],
          },
          {
            name: 'bootstrap_cluster_creator_admin_permissions',
            type: 'bool',
            description: 'Bootstrap cluster creator admin permissions',
            default: true,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Cluster ID' },
    { name: 'arn', type: 'string', description: 'ARN of the cluster' },
    { name: 'name', type: 'string', description: 'Cluster name' },
    { name: 'endpoint', type: 'string', description: 'Kubernetes API server endpoint' },
    { name: 'certificate_authority', type: 'list(object)', description: 'Certificate authority data' },
    { name: 'cluster_id', type: 'string', description: 'Unique cluster ID' },
    { name: 'cluster_security_group_id', type: 'string', description: 'EKS-created security group ID' },
    { name: 'created_at', type: 'string', description: 'Creation timestamp' },
    { name: 'platform_version', type: 'string', description: 'EKS platform version' },
    { name: 'status', type: 'string', description: 'Cluster status' },
    { name: 'vpc_config', type: 'list(object)', description: 'VPC configuration including vpc_id' },
    { name: 'identity', type: 'list(object)', description: 'OIDC identity provider information' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_eks_cluster',
    requiredArgs: ['name', 'role_arn', 'vpc_config'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      endpoint: 'endpoint',
      name: 'name',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['aws_eks_node_group', 'aws_eks_fargate_profile', 'aws_eks_addon'],
        description: 'EKS node groups, Fargate profiles, and addons',
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'vpc_config.security_group_ids', toTargetAttr: 'id' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'role_arn',
        acceptsResourceTypes: ['aws_iam_role'],
        search: [{ type: 'connected_edges', edgeKind: 'attach' }],
        onMissing: {
          level: 'error',
          message: 'EKS cluster requires an IAM role',
          fixHint: 'Connect an IAM role to the EKS cluster',
        },
      },
    ],
  },
};
