/**
 * AWS ECS Task Definition Resource Definition
 *
 * Complete schema for aws_ecs_task_definition based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEcsTaskDefinition: ServiceDefinition = {
  id: 'ecs_task_definition',
  terraform_resource: 'aws_ecs_task_definition',
  name: 'ECS Task Definition',
  description: 'Blueprint for running containers on Amazon ECS',
  icon: CONTAINER_ICONS.ECS_TASK,
  category: 'containers',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'family',
        type: 'string',
        description: 'Family name for the task definition',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9-_]*$',
          minLength: 1,
          maxLength: 255,
        },
        group: 'basic',
      },
      {
        name: 'container_definitions',
        type: 'string',
        description: 'JSON document describing container definitions',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'cpu',
        type: 'string',
        description: 'CPU units for the task (required for Fargate)',
        default: '256',
        options: ['256', '512', '1024', '2048', '4096', '8192', '16384'],
        group: 'basic',
      },
      {
        name: 'memory',
        type: 'string',
        description: 'Memory in MB for the task (required for Fargate)',
        default: '512',
        options: ['512', '1024', '2048', '3072', '4096', '5120', '6144', '7168', '8192', '16384', '30720'],
        group: 'basic',
      },
      {
        name: 'network_mode',
        type: 'string',
        description: 'Network mode for containers',
        default: 'awsvpc',
        options: ['bridge', 'host', 'awsvpc', 'none'],
        group: 'basic',
      },
      {
        name: 'requires_compatibilities',
        type: 'list(string)',
        description: 'Launch type compatibility',
        default: ['FARGATE'],
        options: ['EC2', 'FARGATE', 'EXTERNAL'],
        group: 'basic',
      },
      {
        name: 'execution_role_arn',
        type: 'string',
        description: 'ARN of the task execution role',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'task_role_arn',
        type: 'string',
        description: 'ARN of the task role',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'ipc_mode',
        type: 'string',
        description: 'IPC resource namespace',
        options: ['host', 'task', 'none'],
        group: 'advanced',
      },
      {
        name: 'pid_mode',
        type: 'string',
        description: 'Process namespace',
        options: ['host', 'task'],
        group: 'advanced',
      },
      {
        name: 'skip_destroy',
        type: 'bool',
        description: 'Skip deregistration on destroy',
        default: false,
        group: 'advanced',
      },
      {
        name: 'track_latest',
        type: 'bool',
        description: 'Track latest active revision',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the task definition',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'volume',
        description: 'Volume definitions',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Volume name',
          },
          {
            name: 'host_path',
            type: 'string',
            description: 'Host path for bind mounts',
          },
        ],
      },
      {
        name: 'placement_constraints',
        description: 'Placement constraints',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Constraint type',
            options: ['memberOf'],
          },
          {
            name: 'expression',
            type: 'string',
            description: 'Cluster query language expression',
          },
        ],
      },
      {
        name: 'proxy_configuration',
        description: 'App Mesh proxy configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Proxy type',
            default: 'APPMESH',
            options: ['APPMESH'],
          },
          {
            name: 'container_name',
            type: 'string',
            description: 'Container name for the proxy',
          },
          {
            name: 'properties',
            type: 'map(string)',
            description: 'Proxy properties',
          },
        ],
      },
      {
        name: 'inference_accelerator',
        description: 'Elastic Inference accelerator configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'device_name',
            type: 'string',
            description: 'Device name',
          },
          {
            name: 'device_type',
            type: 'string',
            description: 'Elastic Inference accelerator type',
          },
        ],
      },
      {
        name: 'ephemeral_storage',
        description: 'Ephemeral storage configuration (Fargate)',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'size_in_gib',
            type: 'number',
            description: 'Ephemeral storage size in GiB (21-200)',
            default: 21,
            validation: { min: 21, max: 200 },
          },
        ],
      },
      {
        name: 'runtime_platform',
        description: 'Runtime platform configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'operating_system_family',
            type: 'string',
            description: 'Operating system family',
            options: ['LINUX', 'WINDOWS_SERVER_2019_FULL', 'WINDOWS_SERVER_2019_CORE', 'WINDOWS_SERVER_2022_FULL', 'WINDOWS_SERVER_2022_CORE'],
          },
          {
            name: 'cpu_architecture',
            type: 'string',
            description: 'CPU architecture',
            options: ['X86_64', 'ARM64'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the task definition' },
    { name: 'arn_without_revision', type: 'string', description: 'ARN without revision number' },
    { name: 'revision', type: 'number', description: 'Revision number' },
    { name: 'family', type: 'string', description: 'Family name' },
  ],

  terraform: {
    resourceType: 'aws_ecs_task_definition',
    requiredArgs: ['family', 'container_definitions'],
    referenceableAttrs: {
      arn: 'arn',
      family: 'family',
      revision: 'revision',
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'execution_role_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
