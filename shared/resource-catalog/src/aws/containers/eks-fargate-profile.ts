/**
 * AWS EKS Fargate Profile Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_fargate_profile
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEksFargateProfile: ServiceDefinition = {
  id: 'eks_fargate_profile',
  terraform_resource: 'aws_eks_fargate_profile',
  name: 'EKS Fargate Profile',
  description: 'Defines which pods run on AWS Fargate in an EKS cluster',
  icon: CONTAINER_ICONS.FARGATE,
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
        name: 'fargate_profile_name',
        type: 'string',
        description: 'Name of the Fargate profile',
        example: 'my-fargate-profile',
        validation: {
          pattern: '^[a-zA-Z0-9_-]+$',
          maxLength: 63,
        },
        group: 'basic',
      },
      {
        name: 'pod_execution_role_arn',
        type: 'string',
        description: 'IAM role ARN for pod execution',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'subnet_ids',
        type: 'set(string)',
        description: 'Subnet IDs for running Fargate pods',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the Fargate profile',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'selector',
        description: 'Selectors for pods to run on Fargate',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'namespace',
            type: 'string',
            description: 'Kubernetes namespace for selector',
          },
          {
            name: 'labels',
            type: 'map(string)',
            description: 'Key-value label pairs for matching pods',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'EKS cluster name and Fargate profile name separated by colon' },
    { name: 'arn', type: 'string', description: 'ARN of the Fargate profile' },
    { name: 'status', type: 'string', description: 'Status of the Fargate profile' },
  ],

  terraform: {
    resourceType: 'aws_eks_fargate_profile',
    requiredArgs: ['cluster_name', 'fargate_profile_name', 'pod_execution_role_arn', 'subnet_ids'],
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
        apply: [{ setArg: 'pod_execution_role_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_subnet',
        apply: [{ pushToListArg: 'subnet_ids', toTargetAttr: 'id' }],
      },
    ],
  },
};
