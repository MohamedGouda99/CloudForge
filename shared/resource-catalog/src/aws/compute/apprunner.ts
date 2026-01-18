/**
 * AWS App Runner Service Resource Definition
 *
 * Complete schema for aws_apprunner_service based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsAppRunnerService: ServiceDefinition = {
  id: 'apprunner_service',
  terraform_resource: 'aws_apprunner_service',
  name: 'App Runner Service',
  description: 'Fully managed container service for running web applications and APIs',
  icon: COMPUTE_ICONS.APP_RUNNER,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'service_name',
        type: 'string',
        description: 'Name of the App Runner service',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
          minLength: 4,
          maxLength: 40,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'auto_scaling_configuration_arn',
        type: 'string',
        description: 'ARN of App Runner auto scaling configuration',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the service',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'source_configuration',
        description: 'Source code or image configuration',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'auto_deployments_enabled',
            type: 'bool',
            description: 'Enable automatic deployments on source changes',
            default: true,
          },
        ],
      },
      {
        name: 'image_repository',
        description: 'Container image repository configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'image_identifier',
            type: 'string',
            description: 'Identifier of the container image (URI)',
            example: '123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo:latest',
          },
          {
            name: 'image_repository_type',
            type: 'string',
            description: 'Type of image repository',
            options: ['ECR', 'ECR_PUBLIC'],
          },
        ],
      },
      {
        name: 'code_repository',
        description: 'Source code repository configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'repository_url',
            type: 'string',
            description: 'URL of the source code repository',
          },
          {
            name: 'source_code_version',
            type: 'string',
            description: 'Version of source code to deploy',
          },
        ],
      },
      {
        name: 'instance_configuration',
        description: 'Instance runtime configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'cpu',
            type: 'string',
            description: 'Number of CPU units (256, 512, 1024, 2048, 4096)',
            default: '1024',
            options: ['256', '512', '1024', '2048', '4096'],
          },
          {
            name: 'memory',
            type: 'string',
            description: 'Memory in MB (512, 1024, 2048, 3072, 4096, etc.)',
            default: '2048',
            options: ['512', '1024', '2048', '3072', '4096', '6144', '8192', '10240', '12288'],
          },
          {
            name: 'instance_role_arn',
            type: 'string',
            description: 'ARN of IAM role for the instance',
          },
        ],
      },
      {
        name: 'health_check_configuration',
        description: 'Health check configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'protocol',
            type: 'string',
            description: 'Health check protocol',
            default: 'TCP',
            options: ['TCP', 'HTTP'],
          },
          {
            name: 'path',
            type: 'string',
            description: 'Health check path (for HTTP)',
            default: '/',
          },
          {
            name: 'interval',
            type: 'number',
            description: 'Interval between health checks (seconds)',
            default: 5,
            validation: { min: 1, max: 20 },
          },
          {
            name: 'timeout',
            type: 'number',
            description: 'Health check timeout (seconds)',
            default: 2,
            validation: { min: 1, max: 20 },
          },
          {
            name: 'healthy_threshold',
            type: 'number',
            description: 'Consecutive successful checks for healthy status',
            default: 1,
            validation: { min: 1, max: 20 },
          },
          {
            name: 'unhealthy_threshold',
            type: 'number',
            description: 'Consecutive failed checks for unhealthy status',
            default: 5,
            validation: { min: 1, max: 20 },
          },
        ],
      },
      {
        name: 'network_configuration',
        description: 'Network configuration for VPC access',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'ingress_configuration',
            type: 'string',
            description: 'JSON configuration for incoming traffic',
          },
          {
            name: 'egress_configuration',
            type: 'string',
            description: 'JSON configuration for outgoing traffic',
          },
        ],
      },
      {
        name: 'observability_configuration',
        description: 'Observability configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'observability_enabled',
            type: 'bool',
            description: 'Enable observability (X-Ray tracing)',
            default: false,
          },
          {
            name: 'observability_configuration_arn',
            type: 'string',
            description: 'ARN of the observability configuration',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the App Runner service' },
    { name: 'service_id', type: 'string', description: 'Service ID' },
    { name: 'service_url', type: 'string', description: 'URL of the App Runner service' },
    { name: 'status', type: 'string', description: 'Current status of the service' },
  ],

  terraform: {
    resourceType: 'aws_apprunner_service',
    requiredArgs: ['service_name', 'source_configuration'],
    referenceableAttrs: {
      arn: 'arn',
      service_id: 'service_id',
      service_url: 'service_url',
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'instance_configuration.instance_role_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_ecr_repository',
        apply: [{ setArg: 'image_repository.image_identifier', toTargetAttr: 'repository_url' }],
      },
    ],
  },
};
