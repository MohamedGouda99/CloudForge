/**
 * AWS VPC Resource Definition
 *
 * Complete schema for aws_vpc based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsVpc: ServiceDefinition = {
  id: 'vpc',
  terraform_resource: 'aws_vpc',
  name: 'VPC',
  description: 'Virtual Private Cloud - isolated virtual network in AWS for launching resources',
  icon: NETWORKING_ICONS.VPC,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'cidr_block',
        type: 'string',
        description: 'The IPv4 CIDR block for the VPC (can be explicit or derived from IPAM)',
        example: '10.0.0.0/16',
        validation: {
          pattern: '^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$',
        },
        group: 'basic',
      },
      {
        name: 'instance_tenancy',
        type: 'string',
        description: 'Tenancy option for instances launched into the VPC',
        default: 'default',
        options: ['default', 'dedicated'],
        group: 'advanced',
      },
      {
        name: 'enable_dns_support',
        type: 'bool',
        description: 'Enable DNS support in the VPC',
        default: true,
        group: 'basic',
      },
      {
        name: 'enable_dns_hostnames',
        type: 'bool',
        description: 'Enable DNS hostnames in the VPC',
        default: false,
        group: 'basic',
      },
      {
        name: 'enable_network_address_usage_metrics',
        type: 'bool',
        description: 'Enable Network Address Usage metrics for the VPC',
        default: false,
        group: 'advanced',
      },
      {
        name: 'assign_generated_ipv6_cidr_block',
        type: 'bool',
        description: 'Request an Amazon-provided IPv6 /56 CIDR block',
        default: false,
        group: 'advanced',
      },
      {
        name: 'ipv4_ipam_pool_id',
        type: 'string',
        description: 'IPv4 IPAM pool ID for CIDR allocation',
        group: 'advanced',
      },
      {
        name: 'ipv4_netmask_length',
        type: 'number',
        description: 'Netmask length for IPv4 CIDR allocation from IPAM',
        group: 'advanced',
      },
      {
        name: 'ipv6_cidr_block',
        type: 'string',
        description: 'IPv6 CIDR block from IPAM pool',
        group: 'advanced',
      },
      {
        name: 'ipv6_ipam_pool_id',
        type: 'string',
        description: 'IPAM pool ID for IPv6 allocation',
        group: 'advanced',
      },
      {
        name: 'ipv6_netmask_length',
        type: 'number',
        description: 'Netmask length for IPv6 CIDR (44-60 in 4-increment steps)',
        validation: { min: 44, max: 60 },
        group: 'advanced',
      },
      {
        name: 'ipv6_cidr_block_network_border_group',
        type: 'string',
        description: 'Network border group to restrict IPv6 advertisement scope',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the VPC',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'VPC ID' },
    { name: 'arn', type: 'string', description: 'ARN of the VPC' },
    { name: 'cidr_block', type: 'string', description: 'CIDR block of the VPC' },
    { name: 'default_network_acl_id', type: 'string', description: 'Default Network ACL ID' },
    { name: 'default_route_table_id', type: 'string', description: 'Default Route Table ID' },
    { name: 'default_security_group_id', type: 'string', description: 'Default Security Group ID' },
    { name: 'main_route_table_id', type: 'string', description: 'Main Route Table ID' },
    { name: 'ipv6_cidr_block', type: 'string', description: 'IPv6 CIDR block' },
    { name: 'ipv6_association_id', type: 'string', description: 'IPv6 CIDR block association ID' },
    { name: 'ipv6_cidr_block_network_border_group', type: 'string', description: 'Network border group for IPv6' },
    { name: 'dhcp_options_id', type: 'string', description: 'DHCP options set ID' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID that owns the VPC' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_vpc',
    requiredArgs: ['cidr_block'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      cidr_block: 'cidr_block',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: [
          'aws_subnet',
          'aws_security_group',
          'aws_internet_gateway',
          'aws_nat_gateway',
          'aws_route_table',
          'aws_network_acl',
          'aws_vpn_gateway',
          'aws_vpc_endpoint',
          'aws_vpc_peering_connection',
          'aws_flow_log',
        ],
        description: 'Resources that can be contained within a VPC',
      },
    ],
  },
};
