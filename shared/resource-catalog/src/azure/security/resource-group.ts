/**
 * Azure Resource Group Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const azureResourceGroup: ServiceDefinition = {
  id: 'resource_group',
  terraform_resource: 'azurerm_resource_group',
  name: 'Resource Group',
  description: 'Manages a Resource Group',
  icon: SECURITY_ICONS.RESOURCE_GROUP,
  category: 'security',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The Name which should be used for this Resource Group',
        example: 'my-resource-group',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The Azure Region where the Resource Group should exist',
        example: 'eastus',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'A mapping of tags which should be assigned to the Resource Group',
        group: 'basic',
      },
    ],
    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Resource Group' },
    { name: 'name', type: 'string', description: 'The name of the Resource Group' },
    { name: 'location', type: 'string', description: 'The Azure Region where the Resource Group exists' },
  ],

  terraform: {
    resourceType: 'azurerm_resource_group',
    requiredArgs: ['name', 'location'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      location: 'location',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: [
          'azurerm_virtual_network',
          'azurerm_storage_account',
          'azurerm_mssql_server',
          'azurerm_cosmosdb_account',
          'azurerm_linux_virtual_machine',
          'azurerm_linux_function_app',
          'azurerm_network_security_group',
          'azurerm_key_vault',
        ],
        description: 'Resource group can contain all Azure resources',
      },
    ],
  },
};
