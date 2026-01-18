/**
 * AWS Security Group Rule Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsSecurityGroupRule: ServiceDefinition = {
  id: 'security_group_rule',
  terraform_resource: 'aws_security_group_rule',
  name: 'Security Group Rule',
  description: 'Individual security group rule for ingress or egress',
  icon: NETWORKING_ICONS.SECURITY_GROUP,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'security_group_id',
        type: 'string',
        description: 'Security group ID to attach rule to',
        reference: 'aws_security_group.id',
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'Rule type',
        options: ['ingress', 'egress'],
        group: 'basic',
      },
      {
        name: 'from_port',
        type: 'number',
        description: 'Start port',
        validation: { min: 0, max: 65535 },
        group: 'basic',
      },
      {
        name: 'to_port',
        type: 'number',
        description: 'End port',
        validation: { min: 0, max: 65535 },
        group: 'basic',
      },
      {
        name: 'protocol',
        type: 'string',
        description: 'Protocol (tcp, udp, icmp, -1 for all)',
        options: ['tcp', 'udp', 'icmp', '-1'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'cidr_blocks',
        type: 'list(string)',
        description: 'CIDR blocks',
        example: '["0.0.0.0/0"]',
        group: 'basic',
      },
      {
        name: 'source_security_group_id',
        type: 'string',
        description: 'Source security group ID',
        reference: 'aws_security_group.id',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Rule description',
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Security group rule ID' },
  ],

  terraform: {
    resourceType: 'aws_security_group_rule',
    requiredArgs: ['security_group_id', 'type', 'from_port', 'to_port', 'protocol'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_security_group',
        apply: [{ setArg: 'security_group_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [],
  },
};
