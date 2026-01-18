/**
 * AWS Route Table Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsRouteTable: ServiceDefinition = {
  id: 'route_table',
  terraform_resource: 'aws_route_table',
  name: 'Route Table',
  description: 'Contains rules for routing network traffic',
  icon: NETWORKING_ICONS.ROUTE_TABLE,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to create the route table in',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the route table',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'route',
        description: 'Route entries',
        required: false,
        multiple: true,
        attributes: [
          { name: 'cidr_block', type: 'string', description: 'Destination CIDR block' },
          { name: 'gateway_id', type: 'string', description: 'Internet gateway ID' },
          { name: 'nat_gateway_id', type: 'string', description: 'NAT gateway ID' },
          { name: 'vpc_peering_connection_id', type: 'string', description: 'VPC peering connection ID' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Route table ID' },
    { name: 'arn', type: 'string', description: 'ARN of the route table' },
    { name: 'owner_id', type: 'string', description: 'Owner ID' },
  ],

  terraform: {
    resourceType: 'aws_route_table',
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
        childTypes: ['aws_route'],
        description: 'Route entries in the route table',
      },
    ],
  },
};
