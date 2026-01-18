/**
 * Azure Storage Container Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const azureStorageContainer: ServiceDefinition = {
  id: 'storage_container',
  terraform_resource: 'azurerm_storage_container',
  name: 'Storage Container',
  description: 'Manages a Container within an Azure Storage Account',
  icon: STORAGE_ICONS.BLOB_STORAGE,
  category: 'storage',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the Container which should be created within the Storage Account',
        example: 'my-container',
        group: 'basic',
      },
      {
        name: 'storage_account_name',
        type: 'string',
        description: 'The name of the Storage Account where the Container should be created',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'container_access_type',
        type: 'string',
        description: 'The Access Level configured for this Container',
        default: 'private',
        options: ['blob', 'container', 'private'],
        group: 'security',
      },
      {
        name: 'metadata',
        type: 'map(string)',
        description: 'A mapping of MetaData for this Container',
        group: 'basic',
      },
    ],
    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Storage Container' },
    { name: 'has_immutability_policy', type: 'bool', description: 'Is there an Immutability Policy configured on this Storage Container?' },
    { name: 'has_legal_hold', type: 'bool', description: 'Is there a Legal Hold configured on this Storage Container?' },
  ],

  terraform: {
    resourceType: 'azurerm_storage_container',
    requiredArgs: ['name', 'storage_account_name'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'azurerm_storage_account',
        apply: [
          {
            setArg: 'storage_account_name',
            toParentAttr: 'name',
          },
        ],
      },
    ],
  },
};
