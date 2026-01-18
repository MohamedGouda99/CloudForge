/**
 * AWS Route Table Association Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table_association
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsRouteTableAssociation: ServiceDefinition = {
  id: 'route_table_association',
  terraform_resource: 'aws_route_table_association',
  name: 'Route Table Association',
  description: 'Associates a subnet or gateway with a route table',
  icon: NETWORKING_ICONS.ROUTE_TABLE,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'route_table_id',
        type: 'string',
        description: 'ID of the route table to associate',
        reference: 'aws_route_table.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID to associate (mutually exclusive with gateway_id)',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'gateway_id',
        type: 'string',
        description: 'Gateway ID to associate (mutually exclusive with subnet_id)',
        reference: 'aws_internet_gateway.id',
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Association ID' },
  ],

  terraform: {
    resourceType: 'aws_route_table_association',
    requiredArgs: ['route_table_id'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_route_table',
        apply: [{ setArg: 'route_table_id', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_subnet',
        apply: [{ setArg: 'subnet_id', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_internet_gateway',
        apply: [{ setArg: 'gateway_id', toTargetAttr: 'id' }],
      },
    ],
  },
};
