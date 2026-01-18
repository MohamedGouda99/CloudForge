/**
 * AWS EKS Addon Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_addon
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEksAddon: ServiceDefinition = {
  id: 'eks_addon',
  terraform_resource: 'aws_eks_addon',
  name: 'EKS Addon',
  description: 'Manages EKS cluster add-ons like CoreDNS, kube-proxy, and VPC CNI',
  icon: CONTAINER_ICONS.EKS,
  category: 'containers',
  classification: 'icon',

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
        name: 'addon_name',
        type: 'string',
        description: 'Name of the EKS add-on',
        example: 'vpc-cni',
        options: ['vpc-cni', 'coredns', 'kube-proxy', 'aws-ebs-csi-driver', 'aws-efs-csi-driver', 'adot', 'aws-guardduty-agent'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'addon_version',
        type: 'string',
        description: 'Version of the EKS add-on',
        example: 'v1.15.0-eksbuild.2',
        group: 'basic',
      },
      {
        name: 'resolve_conflicts_on_create',
        type: 'string',
        description: 'How to resolve field value conflicts when creating',
        options: ['NONE', 'OVERWRITE'],
        group: 'advanced',
      },
      {
        name: 'resolve_conflicts_on_update',
        type: 'string',
        description: 'How to resolve field value conflicts when updating',
        options: ['NONE', 'OVERWRITE', 'PRESERVE'],
        group: 'advanced',
      },
      {
        name: 'service_account_role_arn',
        type: 'string',
        description: 'IAM role ARN for the service account',
        reference: 'aws_iam_role.arn',
        group: 'advanced',
      },
      {
        name: 'configuration_values',
        type: 'string',
        description: 'Configuration values as JSON string',
        group: 'advanced',
      },
      {
        name: 'preserve',
        type: 'bool',
        description: 'Preserve the add-on on cluster deletion',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the add-on',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'EKS cluster name and add-on name separated by colon' },
    { name: 'arn', type: 'string', description: 'ARN of the EKS add-on' },
    { name: 'created_at', type: 'string', description: 'Date and time the add-on was created' },
    { name: 'modified_at', type: 'string', description: 'Date and time the add-on was modified' },
  ],

  terraform: {
    resourceType: 'aws_eks_addon',
    requiredArgs: ['cluster_name', 'addon_name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
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
        apply: [{ setArg: 'service_account_role_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
