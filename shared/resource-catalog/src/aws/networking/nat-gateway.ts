/**
 * AWS NAT Gateway Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsNatGateway: ServiceDefinition = {
  id: 'nat_gateway',
  terraform_resource: 'aws_nat_gateway',
  name: 'NAT Gateway',
  description: 'Network address translation gateway for private subnets',
  icon: NETWORKING_ICONS.NAT_GATEWAY,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID to place the NAT gateway in',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'allocation_id',
        type: 'string',
        description: 'Elastic IP allocation ID (required for public NAT)',
        reference: 'aws_eip.id',
        group: 'basic',
      },
      {
        name: 'connectivity_type',
        type: 'string',
        description: 'Connectivity type (public or private)',
        default: 'public',
        options: ['public', 'private'],
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the NAT gateway',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'NAT Gateway ID' },
    { name: 'public_ip', type: 'string', description: 'Public IP address' },
    { name: 'private_ip', type: 'string', description: 'Private IP address' },
    { name: 'network_interface_id', type: 'string', description: 'Network interface ID' },
  ],

  terraform: {
    resourceType: 'aws_nat_gateway',
    requiredArgs: ['subnet_id'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_subnet',
        apply: [{ setArg: 'subnet_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_eip',
        apply: [{ setArg: 'allocation_id', toTargetAttr: 'id' }],
      },
    ],
  },
};
