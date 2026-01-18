/**
 * AWS Load Balancer Listener Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsLbListener: ServiceDefinition = {
  id: 'lb_listener',
  terraform_resource: 'aws_lb_listener',
  name: 'LB Listener',
  description: 'Load balancer listener for handling incoming requests',
  icon: NETWORKING_ICONS.ALB,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'load_balancer_arn',
        type: 'string',
        description: 'ARN of the load balancer',
        reference: 'aws_lb.arn',
        group: 'basic',
      },
      {
        name: 'port',
        type: 'number',
        description: 'Port on which the load balancer listens',
        example: '443',
        validation: { min: 1, max: 65535 },
        group: 'basic',
      },
      {
        name: 'protocol',
        type: 'string',
        description: 'Protocol for the listener',
        options: ['HTTP', 'HTTPS', 'TCP', 'TLS', 'UDP', 'TCP_UDP'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'ssl_policy',
        type: 'string',
        description: 'SSL policy (HTTPS/TLS only)',
        default: 'ELBSecurityPolicy-2016-08',
        group: 'advanced',
      },
      {
        name: 'certificate_arn',
        type: 'string',
        description: 'ARN of the certificate (HTTPS/TLS only)',
        reference: 'aws_acm_certificate.arn',
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
        name: 'default_action',
        description: 'Default action for the listener',
        required: true,
        multiple: true,
        attributes: [
          { name: 'type', type: 'string', description: 'Action type', options: ['forward', 'redirect', 'fixed-response'] },
          { name: 'target_group_arn', type: 'string', description: 'Target group ARN (forward type)' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Listener ID' },
    { name: 'arn', type: 'string', description: 'ARN of the listener' },
  ],

  terraform: {
    resourceType: 'aws_lb_listener',
    requiredArgs: ['load_balancer_arn', 'port', 'protocol'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_lb',
        apply: [{ setArg: 'load_balancer_arn', toParentAttr: 'arn' }],
      },
    ],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_lb_listener_rule'],
        description: 'Listener rules',
      },
    ],
  },
};
