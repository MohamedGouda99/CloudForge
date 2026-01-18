/**
 * AWS Subnet Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsSubnet: ServiceDefinition = {
  id: 'subnet',
  terraform_resource: 'aws_subnet',
  name: 'Subnet',
  description: 'A range of IP addresses in your VPC for launching resources',
  icon: NETWORKING_ICONS.SUBNET,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to create the subnet in',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'cidr_block',
        type: 'string',
        description: 'IPv4 CIDR block for the subnet (conflicts with ipv4_ipam_pool_id)',
        example: '10.0.1.0/24',
        validation: {
          pattern: '^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$',
        },
        group: 'basic',
      },
      {
        name: 'availability_zone',
        type: 'string',
        description: 'Availability zone for the subnet',
        example: 'us-east-1a',
        group: 'basic',
      },
      {
        name: 'availability_zone_id',
        type: 'string',
        description: 'AZ ID of the subnet (conflicts with availability_zone)',
        example: 'use1-az1',
        group: 'basic',
      },
      {
        name: 'map_public_ip_on_launch',
        type: 'bool',
        description: 'Auto-assign public IPv4 address on instance launch',
        default: false,
        group: 'basic',
      },
      {
        name: 'assign_ipv6_address_on_creation',
        type: 'bool',
        description: 'Auto-assign IPv6 address on instance launch',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_dns64',
        type: 'bool',
        description: 'Enable DNS64 for instances in this subnet',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_resource_name_dns_aaaa_record_on_launch',
        type: 'bool',
        description: 'Respond to DNS queries with IPv6 address (AAAA record)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_resource_name_dns_a_record_on_launch',
        type: 'bool',
        description: 'Respond to DNS queries with IPv4 address (A record)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'ipv6_cidr_block',
        type: 'string',
        description: 'IPv6 CIDR block for the subnet (must be /64 prefix)',
        group: 'advanced',
      },
      {
        name: 'ipv6_native',
        type: 'bool',
        description: 'Create an IPv6-only subnet',
        default: false,
        group: 'advanced',
      },
      {
        name: 'ipv4_ipam_pool_id',
        type: 'string',
        description: 'IPAM pool ID for IPv4 CIDR allocation',
        group: 'advanced',
      },
      {
        name: 'ipv4_netmask_length',
        type: 'number',
        description: 'Netmask length for IPv4 CIDR from IPAM',
        group: 'advanced',
      },
      {
        name: 'ipv6_ipam_pool_id',
        type: 'string',
        description: 'IPAM pool ID for IPv6 CIDR allocation',
        group: 'advanced',
      },
      {
        name: 'ipv6_netmask_length',
        type: 'number',
        description: 'Netmask length for IPv6 CIDR from IPAM',
        group: 'advanced',
      },
      {
        name: 'customer_owned_ipv4_pool',
        type: 'string',
        description: 'Customer owned IPv4 address pool (for Outposts)',
        group: 'advanced',
      },
      {
        name: 'map_customer_owned_ip_on_launch',
        type: 'bool',
        description: 'Map customer owned IP on launch (for Outposts)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'outpost_arn',
        type: 'string',
        description: 'ARN of the Outpost to create subnet in',
        group: 'advanced',
      },
      {
        name: 'private_dns_hostname_type_on_launch',
        type: 'string',
        description: 'Type of hostnames to assign on instance launch',
        options: ['ip-name', 'resource-name'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the subnet',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Subnet ID' },
    { name: 'arn', type: 'string', description: 'ARN of the subnet' },
    { name: 'availability_zone', type: 'string', description: 'Availability zone' },
    { name: 'availability_zone_id', type: 'string', description: 'AZ ID' },
    { name: 'cidr_block', type: 'string', description: 'IPv4 CIDR block of the subnet' },
    { name: 'ipv6_cidr_block_association_id', type: 'string', description: 'IPv6 CIDR block association ID' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_subnet',
    requiredArgs: ['vpc_id'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      cidr_block: 'cidr_block',
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
        childTypes: [
          'aws_instance',
          'aws_nat_gateway',
          'aws_network_interface',
          'aws_db_instance',
          'aws_elasticache_cluster',
          'aws_efs_mount_target',
          'aws_lambda_function',
        ],
        description: 'Resources that can be placed in a subnet',
      },
    ],
  },
};
