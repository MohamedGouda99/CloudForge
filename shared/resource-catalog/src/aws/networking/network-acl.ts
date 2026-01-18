/**
 * AWS Network ACL Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsNetworkAcl: ServiceDefinition = {
  id: 'network_acl',
  terraform_resource: 'aws_network_acl',
  name: 'Network ACL',
  description: 'Network access control list for subnet-level traffic filtering',
  icon: NETWORKING_ICONS.NETWORK_ACL,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to create the network ACL in',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'subnet_ids',
        type: 'list(string)',
        description: 'Subnet IDs to associate with this ACL',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the network ACL',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'ingress',
        description: 'Ingress rules',
        required: false,
        multiple: true,
        attributes: [
          { name: 'rule_no', type: 'number', description: 'Rule number' },
          { name: 'protocol', type: 'string', description: 'Protocol' },
          { name: 'action', type: 'string', description: 'Allow or deny' },
          { name: 'cidr_block', type: 'string', description: 'CIDR block' },
          { name: 'from_port', type: 'number', description: 'From port' },
          { name: 'to_port', type: 'number', description: 'To port' },
        ],
      },
      {
        name: 'egress',
        description: 'Egress rules',
        required: false,
        multiple: true,
        attributes: [
          { name: 'rule_no', type: 'number', description: 'Rule number' },
          { name: 'protocol', type: 'string', description: 'Protocol' },
          { name: 'action', type: 'string', description: 'Allow or deny' },
          { name: 'cidr_block', type: 'string', description: 'CIDR block' },
          { name: 'from_port', type: 'number', description: 'From port' },
          { name: 'to_port', type: 'number', description: 'To port' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Network ACL ID' },
    { name: 'arn', type: 'string', description: 'ARN of the network ACL' },
    { name: 'owner_id', type: 'string', description: 'Owner ID' },
  ],

  terraform: {
    resourceType: 'aws_network_acl',
    requiredArgs: ['vpc_id'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_vpc',
        apply: [{ setArg: 'vpc_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_network_acl_rule'],
        description: 'Network ACL rules',
      },
    ],
  },
};
