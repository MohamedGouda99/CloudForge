/**
 * Azure Function App Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const azureFunctionApp: ServiceDefinition = {
  id: 'function_app',
  terraform_resource: 'azurerm_linux_function_app',
  name: 'Function App',
  description: 'Manages a Linux Function App',
  icon: COMPUTE_ICONS.FUNCTIONS,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Specifies the name of the Function App',
        example: 'my-function-app',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the Resource Group in which the Function App should be created',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'Specifies the supported Azure location where the Function App should exist',
        example: 'eastus',
        group: 'basic',
      },
      {
        name: 'service_plan_id',
        type: 'string',
        description: 'The ID of the App Service Plan within which to create this Function App',
        group: 'basic',
      },
      {
        name: 'storage_account_name',
        type: 'string',
        description: 'The backend storage account name which will be used by this Function App',
        group: 'basic',
      },
      {
        name: 'storage_account_access_key',
        type: 'string',
        description: 'The access key which will be used to access the backend storage account for the Function App',
        sensitive: true,
        group: 'security',
      },
    ],
    optional: [
      {
        name: 'app_settings',
        type: 'map(string)',
        description: 'A map of key-value pairs for App Settings',
        group: 'basic',
      },
      {
        name: 'https_only',
        type: 'bool',
        description: 'Can the Function App only be accessed via HTTPS?',
        default: true,
        group: 'security',
      },
      {
        name: 'functions_extension_version',
        type: 'string',
        description: 'The runtime version associated with the Function App',
        default: '~4',
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
        name: 'site_config',
        description: 'A site_config block',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'always_on',
            type: 'bool',
            description: 'Should the Function App be loaded at all times?',
          },
          {
            name: 'ftps_state',
            type: 'string',
            description: 'State of FTP / FTPS service for this Function App',
            options: ['AllAllowed', 'FtpsOnly', 'Disabled'],
          },
          {
            name: 'http2_enabled',
            type: 'bool',
            description: 'Specifies if the HTTP/2 protocol should be enabled',
          },
          {
            name: 'minimum_tls_version',
            type: 'string',
            description: 'The minimum version of TLS required for SSL requests',
            options: ['1.0', '1.1', '1.2'],
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
    { name: 'id', type: 'string', description: 'The ID of the Function App' },
    { name: 'default_hostname', type: 'string', description: 'The default hostname associated with the Function App' },
    { name: 'outbound_ip_addresses', type: 'string', description: 'A comma separated list of outbound IP addresses' },
    { name: 'identity', type: 'object', description: 'An identity block containing the principal_id and tenant_id' },
  ],

  terraform: {
    resourceType: 'azurerm_linux_function_app',
    requiredArgs: ['name', 'resource_group_name', 'location', 'service_plan_id', 'storage_account_name', 'storage_account_access_key', 'site_config'],
    referenceableAttrs: {
      id: 'id',
      default_hostname: 'default_hostname',
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
