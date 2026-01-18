/**
 * Azure Key Vault Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const azureKeyVault: ServiceDefinition = {
  id: 'key_vault',
  terraform_resource: 'azurerm_key_vault',
  name: 'Key Vault',
  description: 'Manages a Key Vault',
  icon: SECURITY_ICONS.KEY_VAULT,
  category: 'security',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Specifies the name of the Key Vault',
        example: 'my-keyvault',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the Key Vault',
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
        name: 'tenant_id',
        type: 'string',
        description: 'The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault',
        group: 'security',
      },
      {
        name: 'sku_name',
        type: 'string',
        description: 'The Name of the SKU used for this Key Vault',
        options: ['standard', 'premium'],
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'enabled_for_deployment',
        type: 'bool',
        description: 'Boolean flag to specify whether Azure Virtual Machines are permitted to retrieve certificates stored as secrets from the key vault',
        default: false,
        group: 'security',
      },
      {
        name: 'enabled_for_disk_encryption',
        type: 'bool',
        description: 'Boolean flag to specify whether Azure Disk Encryption is permitted to retrieve secrets from the vault and unwrap keys',
        default: false,
        group: 'security',
      },
      {
        name: 'enabled_for_template_deployment',
        type: 'bool',
        description: 'Boolean flag to specify whether Azure Resource Manager is permitted to retrieve secrets from the key vault',
        default: false,
        group: 'security',
      },
      {
        name: 'enable_rbac_authorization',
        type: 'bool',
        description: 'Boolean flag to specify whether Azure Key Vault uses Role Based Access Control (RBAC) for authorization of data actions',
        default: false,
        group: 'security',
      },
      {
        name: 'purge_protection_enabled',
        type: 'bool',
        description: 'Is Purge Protection enabled for this Key Vault?',
        default: false,
        group: 'security',
      },
      {
        name: 'soft_delete_retention_days',
        type: 'number',
        description: 'The number of days that items should be retained for once soft-deleted',
        default: 90,
        group: 'advanced',
      },
      {
        name: 'public_network_access_enabled',
        type: 'bool',
        description: 'Whether public network access is allowed for this Key Vault',
        default: true,
        group: 'networking',
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
        name: 'access_policy',
        description: 'A list of access policies for the Key Vault',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'tenant_id',
            type: 'string',
            description: 'The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault',
          },
          {
            name: 'object_id',
            type: 'string',
            description: 'The object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault',
          },
          {
            name: 'application_id',
            type: 'string',
            description: 'The object ID of an Application in Azure Active Directory',
          },
          {
            name: 'certificate_permissions',
            type: 'list(string)',
            description: 'List of certificate permissions',
          },
          {
            name: 'key_permissions',
            type: 'list(string)',
            description: 'List of key permissions',
          },
          {
            name: 'secret_permissions',
            type: 'list(string)',
            description: 'List of secret permissions',
          },
          {
            name: 'storage_permissions',
            type: 'list(string)',
            description: 'List of storage permissions',
          },
        ],
      },
      {
        name: 'network_acls',
        description: 'A network_acls block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'bypass',
            type: 'string',
            description: 'Specifies which traffic can bypass the network rules',
            options: ['AzureServices', 'None'],
          },
          {
            name: 'default_action',
            type: 'string',
            description: 'The Default Action to use when no rules match from ip_rules / virtual_network_subnet_ids',
            options: ['Allow', 'Deny'],
          },
          {
            name: 'ip_rules',
            type: 'list(string)',
            description: 'One or more IP Addresses, or CIDR Blocks which should be able to access the Key Vault',
          },
          {
            name: 'virtual_network_subnet_ids',
            type: 'list(string)',
            description: 'One or more Subnet IDs which should be able to access this Key Vault',
          },
        ],
      },
      {
        name: 'contact',
        description: 'One or more contact block',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'email',
            type: 'string',
            description: 'E-mail address of the contact',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Name of the contact',
          },
          {
            name: 'phone',
            type: 'string',
            description: 'Phone number of the contact',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Key Vault' },
    { name: 'vault_uri', type: 'string', description: 'The URI of the Key Vault, used for performing operations on keys and secrets' },
  ],

  terraform: {
    resourceType: 'azurerm_key_vault',
    requiredArgs: ['name', 'resource_group_name', 'location', 'tenant_id', 'sku_name'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      vault_uri: 'vault_uri',
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
        childTypes: ['azurerm_key_vault_secret', 'azurerm_key_vault_key', 'azurerm_key_vault_certificate'],
        description: 'Key Vault can contain secrets, keys, and certificates',
      },
    ],
  },
};
