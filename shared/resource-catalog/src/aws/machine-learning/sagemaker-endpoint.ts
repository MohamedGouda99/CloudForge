/**
 * AWS SageMaker Endpoint Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sagemaker_endpoint
 */

import type { ServiceDefinition } from '../../types';

const ML_ICONS = {
  SAGEMAKER: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Machine-Learning/64/Arch_Amazon-SageMaker_64.svg',
};

export const awsSagemakerEndpoint: ServiceDefinition = {
  id: 'sagemaker_endpoint',
  terraform_resource: 'aws_sagemaker_endpoint',
  name: 'SageMaker Endpoint',
  description: 'Endpoint for deploying ML models for real-time inference',
  icon: ML_ICONS.SAGEMAKER,
  category: 'machine-learning',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'endpoint_config_name',
        type: 'string',
        description: 'Name of the endpoint configuration',
        reference: 'aws_sagemaker_endpoint_configuration.name',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the endpoint',
        validation: { pattern: '^[a-zA-Z0-9-]+$', maxLength: 63 },
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the endpoint',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'deployment_config',
        description: 'Deployment configuration for blue/green deployment',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'auto_rollback_configuration',
            type: 'object',
            description: 'Auto rollback configuration',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Endpoint name' },
    { name: 'arn', type: 'string', description: 'ARN of the endpoint' },
    { name: 'name', type: 'string', description: 'Name of the endpoint' },
  ],

  terraform: {
    resourceType: 'aws_sagemaker_endpoint',
    requiredArgs: ['endpoint_config_name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
