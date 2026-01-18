/**
 * Azure Virtual Network Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const azureVirtualNetwork: ServiceDefinition = {
  id: 'virtual_network',
  terraform_resource: 'azurerm_virtual_network',
  name: 'Virtual Network',
  description: 'Manages a virtual network including any configured subnets',
  icon: NETWORKING_ICONS.VIRTUAL_NETWORK,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the virtual network',
        example: 'my-vnet',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the virtual network',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The location/region where the virtual network is created',
        example: 'eastus',
        group: 'basic',
      },
      {
        name: 'address_space',
        type: 'list(string)',
        description: 'The address space that is used the virtual network',
        example: '10.0.0.0/16',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'dns_servers',
        type: 'list(string)',
        description: 'List of IP addresses of DNS servers',
        group: 'networking',
      },
      {
        name: 'bgp_community',
        type: 'string',
        description: 'The BGP community attribute in format <as-number>:<community-value>',
        group: 'advanced',
      },
      {
        name: 'flow_timeout_in_minutes',
        type: 'number',
        description: 'The flow timeout in minutes for the Virtual Network',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'A mapping of tags to assign to the resource',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'ddos_protection_plan',
        description: 'A ddos_protection_plan block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'id',
            type: 'string',
            description: 'The ID of DDoS Protection Plan',
          },
          {
            name: 'enable',
            type: 'bool',
            description: 'Enable/disable DDoS Protection Plan on Virtual Network',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The virtual NetworkConfiguration ID' },
    { name: 'name', type: 'string', description: 'The name of the virtual network' },
    { name: 'guid', type: 'string', description: 'The GUID of the virtual network' },
  ],

  terraform: {
    resourceType: 'azurerm_virtual_network',
    requiredArgs: ['name', 'resource_group_name', 'location', 'address_space'],
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
    validChildren: [
      {
        childTypes: ['azurerm_subnet'],
        description: 'Virtual network can contain subnets',
      },
    ],
  },
};
