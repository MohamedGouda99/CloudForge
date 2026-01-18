/**
 * AWS ECS Cluster Resource Definition
 *
 * Complete schema for aws_ecs_cluster based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEcsCluster: ServiceDefinition = {
  id: 'ecs_cluster',
  terraform_resource: 'aws_ecs_cluster',
  name: 'ECS Cluster',
  description: 'Logical grouping of tasks and services for Amazon ECS',
  icon: CONTAINER_ICONS.ECS_CLUSTER,
  category: 'containers',
  classification: 'container', // Can contain ECS services

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the cluster',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9-_]*$',
          minLength: 1,
          maxLength: 255,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'capacity_providers',
        type: 'list(string)',
        description: 'Capacity providers to associate with the cluster',
        options: ['FARGATE', 'FARGATE_SPOT'],
        group: 'basic',
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
        name: 'setting',
        description: 'Cluster settings',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Setting name',
            options: ['containerInsights'],
          },
          {
            name: 'value',
            type: 'string',
            description: 'Setting value',
            options: ['enabled', 'disabled'],
          },
        ],
      },
      {
        name: 'configuration',
        description: 'Cluster configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'execute_command_configuration',
            type: 'string',
            description: 'JSON configuration for ECS Exec',
          },
        ],
      },
      {
        name: 'default_capacity_provider_strategy',
        description: 'Default capacity provider strategy',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'capacity_provider',
            type: 'string',
            description: 'Capacity provider name',
          },
          {
            name: 'weight',
            type: 'number',
            description: 'Relative weight for the provider',
            default: 1,
            validation: { min: 0, max: 1000 },
          },
          {
            name: 'base',
            type: 'number',
            description: 'Number of tasks to run on this provider',
            default: 0,
            validation: { min: 0, max: 100000 },
          },
        ],
      },
      {
        name: 'service_connect_defaults',
        description: 'Service Connect defaults',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'namespace',
            type: 'string',
            description: 'ARN of the Cloud Map namespace',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Cluster ID' },
    { name: 'arn', type: 'string', description: 'ARN of the cluster' },
    { name: 'name', type: 'string', description: 'Name of the cluster' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_ecs_cluster',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_ecs_service', 'aws_ecs_capacity_provider'],
        description: 'ECS services and capacity providers',
      },
    ],
  },
};
