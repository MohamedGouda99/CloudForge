/**
 * AWS Route Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsRoute: ServiceDefinition = {
  id: 'route',
  terraform_resource: 'aws_route',
  name: 'Route',
  description: 'Route entry in a route table',
  icon: NETWORKING_ICONS.ROUTE_TABLE,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'route_table_id',
        type: 'string',
        description: 'Route table ID',
        reference: 'aws_route_table.id',
        group: 'basic',
      },
      {
        name: 'destination_cidr_block',
        type: 'string',
        description: 'Destination CIDR block',
        example: '0.0.0.0/0',
        validation: {
          pattern: '^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$',
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'gateway_id',
        type: 'string',
        description: 'Internet gateway ID',
        reference: 'aws_internet_gateway.id',
        group: 'basic',
      },
      {
        name: 'nat_gateway_id',
        type: 'string',
        description: 'NAT gateway ID',
        reference: 'aws_nat_gateway.id',
        group: 'basic',
      },
      {
        name: 'vpc_peering_connection_id',
        type: 'string',
        description: 'VPC peering connection ID',
        reference: 'aws_vpc_peering_connection.id',
        group: 'advanced',
      },
      {
        name: 'transit_gateway_id',
        type: 'string',
        description: 'Transit gateway ID',
        reference: 'aws_ec2_transit_gateway.id',
        group: 'advanced',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Route ID' },
    { name: 'state', type: 'string', description: 'Route state' },
  ],

  terraform: {
    resourceType: 'aws_route',
    requiredArgs: ['route_table_id', 'destination_cidr_block'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_route_table',
        apply: [{ setArg: 'route_table_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'route',
        direction: 'outbound',
        toResourceType: 'aws_internet_gateway',
        apply: [{ setArg: 'gateway_id', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'route',
        direction: 'outbound',
        toResourceType: 'aws_nat_gateway',
        apply: [{ setArg: 'nat_gateway_id', toTargetAttr: 'id' }],
      },
    ],
  },
};
