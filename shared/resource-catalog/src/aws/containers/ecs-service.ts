/**
 * AWS ECS Service Resource Definition
 *
 * Complete schema for aws_ecs_service based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINER_ICONS } from '../icons';

export const awsEcsService: ServiceDefinition = {
  id: 'ecs_service',
  terraform_resource: 'aws_ecs_service',
  name: 'ECS Service',
  description: 'Long-running task managed by Amazon ECS',
  icon: CONTAINER_ICONS.ECS_SERVICE,
  category: 'containers',
  classification: 'icon', // Placed inside ECS Cluster

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the service',
        validation: {
          pattern: '^[a-zA-Z][a-zA-Z0-9-_]*$',
          minLength: 1,
          maxLength: 255,
        },
        group: 'basic',
      },
      {
        name: 'cluster',
        type: 'string',
        description: 'ARN of the ECS cluster',
        reference: 'aws_ecs_cluster.arn',
        group: 'basic',
      },
      {
        name: 'task_definition',
        type: 'string',
        description: 'Task definition ARN',
        reference: 'aws_ecs_task_definition.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'desired_count',
        type: 'number',
        description: 'Number of task instances to run',
        default: 1,
        validation: { min: 0, max: 10000 },
        group: 'basic',
      },
      {
        name: 'launch_type',
        type: 'string',
        description: 'Launch type for the service',
        default: 'FARGATE',
        options: ['EC2', 'FARGATE', 'EXTERNAL'],
        group: 'basic',
      },
      {
        name: 'platform_version',
        type: 'string',
        description: 'Platform version for Fargate tasks',
        default: 'LATEST',
        group: 'basic',
      },
      {
        name: 'scheduling_strategy',
        type: 'string',
        description: 'Scheduling strategy',
        default: 'REPLICA',
        options: ['REPLICA', 'DAEMON'],
        group: 'advanced',
      },
      {
        name: 'deployment_minimum_healthy_percent',
        type: 'number',
        description: 'Minimum healthy percent during deployment',
        default: 100,
        validation: { min: 0, max: 100 },
        group: 'advanced',
      },
      {
        name: 'deployment_maximum_percent',
        type: 'number',
        description: 'Maximum percent during deployment',
        default: 200,
        validation: { min: 0, max: 200 },
        group: 'advanced',
      },
      {
        name: 'health_check_grace_period_seconds',
        type: 'number',
        description: 'Grace period for health checks (seconds)',
        validation: { min: 0, max: 2147483647 },
        group: 'advanced',
      },
      {
        name: 'force_new_deployment',
        type: 'bool',
        description: 'Force a new deployment on update',
        default: false,
        group: 'advanced',
      },
      {
        name: 'wait_for_steady_state',
        type: 'bool',
        description: 'Wait for service to reach steady state',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_execute_command',
        type: 'bool',
        description: 'Enable ECS Exec for debugging',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_ecs_managed_tags',
        type: 'bool',
        description: 'Enable ECS managed tags',
        default: false,
        group: 'advanced',
      },
      {
        name: 'propagate_tags',
        type: 'string',
        description: 'Tag propagation setting',
        options: ['SERVICE', 'TASK_DEFINITION'],
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
        name: 'network_configuration',
        description: 'VPC network configuration (required for Fargate)',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'subnets',
            type: 'set(string)',
            description: 'Subnet IDs for the service',
          },
          {
            name: 'security_groups',
            type: 'set(string)',
            description: 'Security group IDs',
          },
          {
            name: 'assign_public_ip',
            type: 'bool',
            description: 'Assign public IP to tasks',
            default: false,
          },
        ],
      },
      {
        name: 'load_balancer',
        description: 'Load balancer configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'target_group_arn',
            type: 'string',
            description: 'Target group ARN',
          },
          {
            name: 'container_name',
            type: 'string',
            description: 'Container name for the target group',
          },
          {
            name: 'container_port',
            type: 'number',
            description: 'Container port for the target group',
          },
          {
            name: 'elb_name',
            type: 'string',
            description: 'Classic load balancer name',
          },
        ],
      },
      {
        name: 'service_registries',
        description: 'Service discovery registries',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'registry_arn',
            type: 'string',
            description: 'ARN of the Service Registry',
          },
          {
            name: 'port',
            type: 'number',
            description: 'Port for SRV records',
          },
          {
            name: 'container_name',
            type: 'string',
            description: 'Container name for the registry',
          },
          {
            name: 'container_port',
            type: 'number',
            description: 'Container port for the registry',
          },
        ],
      },
      {
        name: 'deployment_circuit_breaker',
        description: 'Deployment circuit breaker configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enable',
            type: 'bool',
            description: 'Enable circuit breaker',
            default: false,
          },
          {
            name: 'rollback',
            type: 'bool',
            description: 'Enable automatic rollback',
            default: false,
          },
        ],
      },
      {
        name: 'deployment_controller',
        description: 'Deployment controller configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Deployment controller type',
            default: 'ECS',
            options: ['ECS', 'CODE_DEPLOY', 'EXTERNAL'],
          },
        ],
      },
      {
        name: 'capacity_provider_strategy',
        description: 'Capacity provider strategy',
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
            description: 'Relative weight',
            validation: { min: 0, max: 1000 },
          },
          {
            name: 'base',
            type: 'number',
            description: 'Number of tasks to run',
            validation: { min: 0, max: 100000 },
          },
        ],
      },
      {
        name: 'ordered_placement_strategy',
        description: 'Task placement strategy',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Placement strategy type',
            options: ['binpack', 'random', 'spread'],
          },
          {
            name: 'field',
            type: 'string',
            description: 'Field to apply the strategy to',
          },
        ],
      },
      {
        name: 'placement_constraints',
        description: 'Task placement constraints',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Constraint type',
            options: ['distinctInstance', 'memberOf'],
          },
          {
            name: 'expression',
            type: 'string',
            description: 'Cluster query language expression',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Service ID (ARN)' },
    { name: 'name', type: 'string', description: 'Name of the service' },
    { name: 'cluster', type: 'string', description: 'Cluster ARN' },
  ],

  terraform: {
    resourceType: 'aws_ecs_service',
    requiredArgs: ['name', 'cluster', 'task_definition'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      cluster: 'cluster',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_ecs_cluster',
        apply: [{ setArg: 'cluster', toParentAttr: 'arn' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_ecs_task_definition',
        apply: [{ setArg: 'task_definition', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_lb_target_group',
        apply: [{ setArg: 'load_balancer.target_group_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'network_configuration.security_groups', toTargetAttr: 'id' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'cluster',
        acceptsResourceTypes: ['aws_ecs_cluster'],
        search: [{ type: 'containment_ancestors' }],
        onMissing: {
          level: 'error',
          message: 'ECS Service must be inside an ECS Cluster',
          fixHint: 'Place the service inside an ECS Cluster container',
        },
      },
    ],
  },
};
