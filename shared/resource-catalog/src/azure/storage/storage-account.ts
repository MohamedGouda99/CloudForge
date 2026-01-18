/**
 * Azure Storage Account Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { STORAGE_ICONS } from '../icons';

export const azureStorageAccount: ServiceDefinition = {
  id: 'storage_account',
  terraform_resource: 'azurerm_storage_account',
  name: 'Storage Account',
  description: 'Manages an Azure Storage Account',
  icon: STORAGE_ICONS.STORAGE_ACCOUNT,
  category: 'storage',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Specifies the name of the storage account',
        example: 'mystorageaccount',
        group: 'basic',
        validation: {
          minLength: 3,
          maxLength: 24,
          pattern: '^[a-z0-9]+$',
        },
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the storage account',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'Specifies the supported Azure location where the resource exists',
        example: 'eastus',
        group: 'basic',
      },
      {
        name: 'account_tier',
        type: 'string',
        description: 'Defines the Tier to use for this storage account',
        options: ['Standard', 'Premium'],
        group: 'basic',
      },
      {
        name: 'account_replication_type',
        type: 'string',
        description: 'Defines the type of replication to use for this storage account',
        options: ['LRS', 'GRS', 'RAGRS', 'ZRS', 'GZRS', 'RAGZRS'],
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'account_kind',
        type: 'string',
        description: 'Defines the Kind of account',
        default: 'StorageV2',
        options: ['BlobStorage', 'BlockBlobStorage', 'FileStorage', 'Storage', 'StorageV2'],
        group: 'basic',
      },
      {
        name: 'access_tier',
        type: 'string',
        description: 'Defines the access tier for BlobStorage, FileStorage and StorageV2 accounts',
        default: 'Hot',
        options: ['Hot', 'Cool'],
        group: 'basic',
      },
      {
        name: 'enable_https_traffic_only',
        type: 'bool',
        description: 'Boolean flag which forces HTTPS if enabled',
        default: true,
        group: 'security',
      },
      {
        name: 'min_tls_version',
        type: 'string',
        description: 'The minimum supported TLS version for the storage account',
        default: 'TLS1_2',
        options: ['TLS1_0', 'TLS1_1', 'TLS1_2'],
        group: 'security',
      },
      {
        name: 'allow_nested_items_to_be_public',
        type: 'bool',
        description: 'Allow or disallow nested items within this Account to opt into being public',
        default: false,
        group: 'security',
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
        name: 'blob_properties',
        description: 'A blob_properties block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'versioning_enabled',
            type: 'bool',
            description: 'Is versioning enabled?',
          },
          {
            name: 'change_feed_enabled',
            type: 'bool',
            description: 'Is the blob service properties for change feed events enabled?',
          },
          {
            name: 'last_access_time_enabled',
            type: 'bool',
            description: 'Is the last access time based tracking enabled?',
          },
        ],
      },
      {
        name: 'network_rules',
        description: 'A network_rules block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'default_action',
            type: 'string',
            description: 'Specifies the default action of allow or deny',
            options: ['Allow', 'Deny'],
          },
          {
            name: 'ip_rules',
            type: 'list(string)',
            description: 'List of public IP or IP ranges in CIDR Format',
          },
          {
            name: 'virtual_network_subnet_ids',
            type: 'list(string)',
            description: 'A list of resource ids for subnets',
          },
          {
            name: 'bypass',
            type: 'list(string)',
            description: 'Specifies whether traffic is bypassed for Logging/Metrics/AzureServices',
            options: ['None', 'Logging', 'Metrics', 'AzureServices'],
          },
        ],
      },
      {
        name: 'identity',
        description: 'An identity block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Specifies the type of Managed Service Identity',
            options: ['SystemAssigned', 'UserAssigned', 'SystemAssigned, UserAssigned'],
          },
          {
            name: 'identity_ids',
            type: 'list(string)',
            description: 'Specifies a list of User Assigned Managed Identity IDs',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Storage Account' },
    { name: 'primary_access_key', type: 'string', description: 'The primary access key for the storage account' },
    { name: 'secondary_access_key', type: 'string', description: 'The secondary access key for the storage account' },
    { name: 'primary_blob_endpoint', type: 'string', description: 'The endpoint URL for blob storage in the primary location' },
    { name: 'primary_connection_string', type: 'string', description: 'The connection string associated with the primary location' },
  ],

  terraform: {
    resourceType: 'azurerm_storage_account',
    requiredArgs: ['name', 'resource_group_name', 'location', 'account_tier', 'account_replication_type'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      primary_access_key: 'primary_access_key',
      primary_blob_endpoint: 'primary_blob_endpoint',
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
        childTypes: ['azurerm_storage_container', 'azurerm_storage_share', 'azurerm_storage_queue', 'azurerm_storage_table'],
        description: 'Storage account can contain blob containers, file shares, queues, and tables',
      },
    ],
  },
};
