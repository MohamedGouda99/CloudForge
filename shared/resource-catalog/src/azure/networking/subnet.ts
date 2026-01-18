/**
 * Azure Subnet Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const azureSubnet: ServiceDefinition = {
  id: 'subnet',
  terraform_resource: 'azurerm_subnet',
  name: 'Subnet',
  description: 'Manages a subnet. Subnets represent network segments within the IP space defined by the virtual network.',
  icon: NETWORKING_ICONS.SUBNET,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the subnet',
        example: 'my-subnet',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the subnet',
        group: 'basic',
      },
      {
        name: 'virtual_network_name',
        type: 'string',
        description: 'The name of the virtual network to which to attach the subnet',
        group: 'basic',
      },
      {
        name: 'address_prefixes',
        type: 'list(string)',
        description: 'The address prefixes to use for the subnet',
        example: '10.0.1.0/24',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'private_endpoint_network_policies_enabled',
        type: 'bool',
        description: 'Enable or Disable network policies for the private endpoint on the subnet',
        default: true,
        group: 'networking',
      },
      {
        name: 'private_link_service_network_policies_enabled',
        type: 'bool',
        description: 'Enable or Disable network policies for the private link service on the subnet',
        default: true,
        group: 'networking',
      },
      {
        name: 'service_endpoints',
        type: 'list(string)',
        description: 'The list of Service endpoints to associate with the subnet (e.g., Microsoft.Storage, Microsoft.Sql)',
        group: 'networking',
      },
      {
        name: 'service_endpoint_policy_ids',
        type: 'list(string)',
        description: 'The list of IDs of Service Endpoint Policies to associate with the subnet',
        group: 'networking',
      },
    ],
    blocks: [
      {
        name: 'delegation',
        description: 'One or more delegation blocks',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'A name for this delegation',
          },
          {
            name: 'service_delegation',
            type: 'string',
            description: 'A service_delegation configuration (service name)',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The subnet ID' },
    { name: 'name', type: 'string', description: 'The name of the subnet' },
  ],

  terraform: {
    resourceType: 'azurerm_subnet',
    requiredArgs: ['name', 'resource_group_name', 'virtual_network_name', 'address_prefixes'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'azurerm_virtual_network',
        apply: [
          {
            setArg: 'virtual_network_name',
            toParentAttr: 'name',
          },
          {
            setArg: 'resource_group_name',
            toParentAttr: 'resource_group_name',
          },
        ],
      },
    ],
    validChildren: [
      {
        childTypes: ['azurerm_linux_virtual_machine', 'azurerm_network_interface'],
        description: 'Subnet can contain virtual machines and network interfaces',
      },
    ],
  },
};
