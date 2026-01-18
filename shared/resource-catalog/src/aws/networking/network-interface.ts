/**
 * AWS Network Interface Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/network_interface
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsNetworkInterface: ServiceDefinition = {
  id: 'network_interface',
  terraform_resource: 'aws_network_interface',
  name: 'Network Interface',
  description: 'Elastic network interface (ENI) for EC2 instances',
  icon: NETWORKING_ICONS.NETWORK_INTERFACE,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID to create the ENI in',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the network interface',
        group: 'basic',
      },
      {
        name: 'private_ips',
        type: 'set(string)',
        description: 'Private IP addresses to assign to the ENI',
        group: 'basic',
      },
      {
        name: 'private_ip_list',
        type: 'list(string)',
        description: 'Private IP addresses in order of preference',
        group: 'basic',
      },
      {
        name: 'private_ip_list_enabled',
        type: 'bool',
        description: 'Enable private IP list configuration',
        default: false,
        group: 'advanced',
      },
      {
        name: 'security_groups',
        type: 'set(string)',
        description: 'Security group IDs to associate with the ENI',
        reference: 'aws_security_group.id',
        group: 'basic',
      },
      {
        name: 'source_dest_check',
        type: 'bool',
        description: 'Enable source/destination check',
        default: true,
        group: 'advanced',
      },
      {
        name: 'ipv6_addresses',
        type: 'set(string)',
        description: 'IPv6 addresses to assign to the ENI',
        group: 'advanced',
      },
      {
        name: 'ipv6_address_count',
        type: 'number',
        description: 'Number of IPv6 addresses to assign',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'ipv4_prefix_count',
        type: 'number',
        description: 'Number of IPv4 prefixes to assign',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'ipv6_prefix_count',
        type: 'number',
        description: 'Number of IPv6 prefixes to assign',
        validation: { min: 0 },
        group: 'advanced',
      },
      {
        name: 'interface_type',
        type: 'string',
        description: 'Type of network interface',
        default: 'interface',
        options: ['interface', 'efa', 'trunk'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the ENI',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'attachment',
        description: 'Attach the ENI to an EC2 instance',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'instance',
            type: 'string',
            description: 'EC2 instance ID to attach to',
          },
          {
            name: 'device_index',
            type: 'number',
            description: 'Device index (1 or higher)',
            validation: { min: 1 },
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Network interface ID' },
    { name: 'arn', type: 'string', description: 'ARN of the network interface' },
    { name: 'mac_address', type: 'string', description: 'MAC address of the ENI' },
    { name: 'private_dns_name', type: 'string', description: 'Private DNS name' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
  ],

  terraform: {
    resourceType: 'aws_network_interface',
    requiredArgs: ['subnet_id'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      private_ip: 'private_ip',
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
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_groups', toTargetAttr: 'id' }],
      },
    ],
  },
};
