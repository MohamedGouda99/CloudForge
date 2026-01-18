/**
 * AWS Auto Scaling Group Resource Definition
 *
 * Complete schema for aws_autoscaling_group based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsAutoscalingGroup: ServiceDefinition = {
  id: 'autoscaling_group',
  terraform_resource: 'aws_autoscaling_group',
  name: 'Auto Scaling Group',
  description: 'Automatically scales EC2 instances based on demand',
  icon: COMPUTE_ICONS.AUTO_SCALING,
  category: 'compute',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'min_size',
        type: 'number',
        description: 'Minimum number of instances in the group',
        default: 1,
        validation: { min: 0, max: 10000 },
        group: 'basic',
      },
      {
        name: 'max_size',
        type: 'number',
        description: 'Maximum number of instances in the group',
        default: 3,
        validation: { min: 0, max: 10000 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the Auto Scaling group',
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Creates a unique name beginning with the specified prefix',
        group: 'basic',
      },
      {
        name: 'desired_capacity',
        type: 'number',
        description: 'Desired number of instances in the group',
        validation: { min: 0, max: 10000 },
        group: 'basic',
      },
      {
        name: 'vpc_zone_identifier',
        type: 'list(string)',
        description: 'List of subnet IDs to launch instances in',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'availability_zones',
        type: 'list(string)',
        description: 'List of availability zones',
        group: 'basic',
      },
      {
        name: 'health_check_type',
        type: 'string',
        description: 'Type of health check to perform',
        default: 'EC2',
        options: ['EC2', 'ELB'],
        group: 'basic',
      },
      {
        name: 'health_check_grace_period',
        type: 'number',
        description: 'Time after instance launch before health checking starts (seconds)',
        default: 300,
        validation: { min: 0, max: 7200 },
        group: 'advanced',
      },
      {
        name: 'default_cooldown',
        type: 'number',
        description: 'Time between scaling activities (seconds)',
        default: 300,
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'default_instance_warmup',
        type: 'number',
        description: 'Time until a new instance contributes to CloudWatch metrics (seconds)',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'force_delete',
        type: 'bool',
        description: 'Delete the ASG without waiting for instances to terminate',
        default: false,
        group: 'advanced',
      },
      {
        name: 'termination_policies',
        type: 'list(string)',
        description: 'Policies to decide which instances to terminate first',
        options: ['OldestInstance', 'NewestInstance', 'OldestLaunchConfiguration', 'OldestLaunchTemplate', 'ClosestToNextInstanceHour', 'Default', 'AllocationStrategy'],
        group: 'advanced',
      },
      {
        name: 'suspended_processes',
        type: 'list(string)',
        description: 'Processes to suspend',
        options: ['Launch', 'Terminate', 'HealthCheck', 'ReplaceUnhealthy', 'AZRebalance', 'AlarmNotification', 'ScheduledActions', 'AddToLoadBalancer', 'InstanceRefresh'],
        group: 'advanced',
      },
      {
        name: 'enabled_metrics',
        type: 'list(string)',
        description: 'Metrics to collect',
        options: ['GroupMinSize', 'GroupMaxSize', 'GroupDesiredCapacity', 'GroupInServiceInstances', 'GroupPendingInstances', 'GroupStandbyInstances', 'GroupTerminatingInstances', 'GroupTotalInstances'],
        group: 'advanced',
      },
      {
        name: 'metrics_granularity',
        type: 'string',
        description: 'Granularity of metrics',
        default: '1Minute',
        options: ['1Minute'],
        group: 'advanced',
      },
      {
        name: 'protect_from_scale_in',
        type: 'bool',
        description: 'Protect instances from scale-in',
        default: false,
        group: 'advanced',
      },
      {
        name: 'target_group_arns',
        type: 'list(string)',
        description: 'ARNs of target groups to associate',
        reference: 'aws_lb_target_group.arn',
        group: 'basic',
      },
      {
        name: 'load_balancers',
        type: 'list(string)',
        description: 'Names of classic load balancers',
        group: 'basic',
      },
      {
        name: 'service_linked_role_arn',
        type: 'string',
        description: 'ARN of the service-linked role',
        group: 'advanced',
      },
      {
        name: 'max_instance_lifetime',
        type: 'number',
        description: 'Maximum amount of time an instance can be in service (seconds)',
        validation: { min: 86400, max: 31536000 },
        group: 'advanced',
      },
      {
        name: 'capacity_rebalance',
        type: 'bool',
        description: 'Enable capacity rebalancing for Spot Instances',
        default: false,
        group: 'advanced',
      },
      {
        name: 'wait_for_capacity_timeout',
        type: 'string',
        description: 'Timeout waiting for capacity',
        default: '10m',
        group: 'advanced',
      },
    ],

    blocks: [
      {
        name: 'launch_template',
        description: 'Launch template specification',
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
            description: 'Launch template version ($Latest, $Default, or version number)',
            default: '$Latest',
          },
        ],
      },
      {
        name: 'mixed_instances_policy',
        description: 'Mixed instances policy for combining Spot and On-Demand',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'instances_distribution',
            type: 'string',
            description: 'JSON configuration for instance distribution',
          },
          {
            name: 'launch_template',
            type: 'string',
            description: 'JSON configuration for launch template overrides',
          },
        ],
      },
      {
        name: 'instance_refresh',
        description: 'Instance refresh configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'strategy',
            type: 'string',
            description: 'Refresh strategy',
            default: 'Rolling',
            options: ['Rolling'],
          },
          {
            name: 'triggers',
            type: 'set(string)',
            description: 'Attributes that trigger an instance refresh',
          },
        ],
      },
      {
        name: 'warm_pool',
        description: 'Warm pool configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'pool_state',
            type: 'string',
            description: 'State of instances in the warm pool',
            default: 'Stopped',
            options: ['Stopped', 'Running', 'Hibernated'],
          },
          {
            name: 'min_size',
            type: 'number',
            description: 'Minimum size of the warm pool',
            default: 0,
          },
          {
            name: 'max_group_prepared_capacity',
            type: 'number',
            description: 'Maximum prepared capacity',
          },
        ],
      },
      {
        name: 'tag',
        description: 'Tags to propagate to launched instances',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'key',
            type: 'string',
            description: 'Tag key',
          },
          {
            name: 'value',
            type: 'string',
            description: 'Tag value',
          },
          {
            name: 'propagate_at_launch',
            type: 'bool',
            description: 'Propagate tag to instances',
            default: true,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Auto Scaling group ID' },
    { name: 'arn', type: 'string', description: 'ARN of the Auto Scaling group' },
    { name: 'name', type: 'string', description: 'Name of the Auto Scaling group' },
    { name: 'availability_zones', type: 'list(string)', description: 'Availability zones' },
    { name: 'min_size', type: 'number', description: 'Minimum group size' },
    { name: 'max_size', type: 'number', description: 'Maximum group size' },
    { name: 'desired_capacity', type: 'number', description: 'Desired capacity' },
    { name: 'default_cooldown', type: 'number', description: 'Default cooldown period' },
    { name: 'health_check_grace_period', type: 'number', description: 'Health check grace period' },
    { name: 'health_check_type', type: 'string', description: 'Health check type' },
  ],

  terraform: {
    resourceType: 'aws_autoscaling_group',
    requiredArgs: ['min_size', 'max_size'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['aws_autoscaling_policy', 'aws_autoscaling_schedule', 'aws_autoscaling_lifecycle_hook'],
        description: 'Auto scaling policies and lifecycle hooks',
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_launch_template',
        apply: [
          { setArg: 'launch_template.id', toTargetAttr: 'id' },
          { setArg: 'launch_template.version', toTargetAttr: '$Latest' },
        ],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_lb_target_group',
        apply: [{ pushToListArg: 'target_group_arns', toTargetAttr: 'arn' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'launch_template',
        acceptsResourceTypes: ['aws_launch_template'],
        search: [{ type: 'connected_edges', edgeKind: 'connect' }],
        onMissing: {
          level: 'warning',
          message: 'Auto Scaling Group should have a launch template',
          fixHint: 'Connect a launch template to the ASG',
        },
      },
    ],
  },
};
