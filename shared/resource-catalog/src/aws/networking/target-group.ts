/**
 * AWS LB Target Group Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsLbTargetGroup: ServiceDefinition = {
  id: 'lb_target_group',
  terraform_resource: 'aws_lb_target_group',
  name: 'Target Group',
  description: 'Target group for load balancer routing',
  icon: NETWORKING_ICONS.TARGET_GROUP,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the target group',
        validation: { maxLength: 32 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'port',
        type: 'number',
        description: 'Port on which targets receive traffic',
        validation: { min: 1, max: 65535 },
        group: 'basic',
      },
      {
        name: 'protocol',
        type: 'string',
        description: 'Protocol to use for routing traffic',
        options: ['HTTP', 'HTTPS', 'TCP', 'TLS', 'UDP', 'TCP_UDP'],
        group: 'basic',
      },
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID (required for ip or instance target type)',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
      {
        name: 'target_type',
        type: 'string',
        description: 'Type of target',
        default: 'instance',
        options: ['instance', 'ip', 'lambda', 'alb'],
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'health_check',
        description: 'Health check configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'enabled', type: 'bool', description: 'Enable health checks', default: true },
          { name: 'path', type: 'string', description: 'Health check path (HTTP/HTTPS)' },
          { name: 'port', type: 'string', description: 'Health check port' },
          { name: 'protocol', type: 'string', description: 'Health check protocol' },
          { name: 'interval', type: 'number', description: 'Interval between checks', default: 30 },
          { name: 'timeout', type: 'number', description: 'Health check timeout', default: 5 },
          { name: 'healthy_threshold', type: 'number', description: 'Healthy threshold', default: 3 },
          { name: 'unhealthy_threshold', type: 'number', description: 'Unhealthy threshold', default: 3 },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Target group ID' },
    { name: 'arn', type: 'string', description: 'ARN of the target group' },
    { name: 'arn_suffix', type: 'string', description: 'ARN suffix for CloudWatch metrics' },
  ],

  terraform: {
    resourceType: 'aws_lb_target_group',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_lb_target_group_attachment'],
        description: 'Target group attachments',
      },
    ],
  },
};
