/**
 * Azure Network Security Group Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const azureNetworkSecurityGroup: ServiceDefinition = {
  id: 'network_security_group',
  terraform_resource: 'azurerm_network_security_group',
  name: 'Network Security Group',
  description: 'Manages a network security group that contains a list of network security rules',
  icon: NETWORKING_ICONS.NSG,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Specifies the name of the network security group',
        example: 'my-nsg',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the network security group',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'Specifies the supported Azure location where the resource exists',
        example: 'eastus',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'A mapping of tags to assign to the resource',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'security_rule',
        description: 'List of security_rule objects representing security rules',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'The name of the security rule',
          },
          {
            name: 'description',
            type: 'string',
            description: 'A description for this rule',
          },
          {
            name: 'protocol',
            type: 'string',
            description: 'Network protocol this rule applies to',
            options: ['Tcp', 'Udp', 'Icmp', '*'],
          },
          {
            name: 'source_port_range',
            type: 'string',
            description: 'Source Port or Range',
          },
          {
            name: 'destination_port_range',
            type: 'string',
            description: 'Destination Port or Range',
          },
          {
            name: 'source_address_prefix',
            type: 'string',
            description: 'CIDR or source IP range or * to match any IP',
          },
          {
            name: 'destination_address_prefix',
            type: 'string',
            description: 'CIDR or destination IP range or * to match any IP',
          },
          {
            name: 'access',
            type: 'string',
            description: 'Specifies whether network traffic is allowed or denied',
            options: ['Allow', 'Deny'],
          },
          {
            name: 'priority',
            type: 'number',
            description: 'Specifies the priority of the rule. The value can be between 100 and 4096',
          },
          {
            name: 'direction',
            type: 'string',
            description: 'The direction specifies if rule will be evaluated on incoming or outgoing traffic',
            options: ['Inbound', 'Outbound'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Network Security Group' },
    { name: 'name', type: 'string', description: 'The name of the Network Security Group' },
  ],

  terraform: {
    resourceType: 'azurerm_network_security_group',
    requiredArgs: ['name', 'resource_group_name', 'location'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'azurerm_resource_group',
        apply: [
          {
            setArg: 'resource_group_name',
            toParentAttr: 'name',
          },
          {
            setArg: 'location',
            toParentAttr: 'location',
          },
        ],
      },
    ],
  },
};
