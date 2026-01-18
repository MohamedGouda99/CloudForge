/**
 * AWS Transit Gateway Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsTransitGateway: ServiceDefinition = {
  id: 'ec2_transit_gateway',
  terraform_resource: 'aws_ec2_transit_gateway',
  name: 'Transit Gateway',
  description: 'Network transit hub for connecting VPCs and on-premises networks',
  icon: NETWORKING_ICONS.TRANSIT_GATEWAY,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the transit gateway',
        group: 'basic',
      },
      {
        name: 'amazon_side_asn',
        type: 'number',
        description: 'Amazon side ASN',
        default: 64512,
        group: 'advanced',
      },
      {
        name: 'auto_accept_shared_attachments',
        type: 'string',
        description: 'Auto accept shared attachments',
        default: 'disable',
        options: ['enable', 'disable'],
        group: 'advanced',
      },
      {
        name: 'default_route_table_association',
        type: 'string',
        description: 'Default route table association',
        default: 'enable',
        options: ['enable', 'disable'],
        group: 'advanced',
      },
      {
        name: 'default_route_table_propagation',
        type: 'string',
        description: 'Default route table propagation',
        default: 'enable',
        options: ['enable', 'disable'],
        group: 'advanced',
      },
      {
        name: 'dns_support',
        type: 'string',
        description: 'DNS support',
        default: 'enable',
        options: ['enable', 'disable'],
        group: 'basic',
      },
      {
        name: 'vpn_ecmp_support',
        type: 'string',
        description: 'VPN ECMP support',
        default: 'enable',
        options: ['enable', 'disable'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Transit Gateway ID' },
    { name: 'arn', type: 'string', description: 'ARN of the transit gateway' },
    { name: 'association_default_route_table_id', type: 'string', description: 'Default association route table ID' },
    { name: 'propagation_default_route_table_id', type: 'string', description: 'Default propagation route table ID' },
  ],

  terraform: {
    resourceType: 'aws_ec2_transit_gateway',
    requiredArgs: [],
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
        childTypes: ['aws_ec2_transit_gateway_vpc_attachment', 'aws_ec2_transit_gateway_route_table'],
        description: 'Transit gateway VPC attachments and route tables',
      },
    ],
  },
};
