/**
 * Azure SQL Server Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const azureSqlServer: ServiceDefinition = {
  id: 'sql_server',
  terraform_resource: 'azurerm_mssql_server',
  name: 'SQL Server',
  description: 'Manages a Microsoft SQL Azure Database Server',
  icon: DATABASE_ICONS.SQL_DATABASE,
  category: 'database',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the Microsoft SQL Server',
        example: 'my-sql-server',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which to create the Microsoft SQL Server',
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
        name: 'version',
        type: 'string',
        description: 'The version for the new server',
        options: ['2.0', '12.0'],
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'administrator_login',
        type: 'string',
        description: 'The administrator login name for the new server',
        group: 'security',
      },
      {
        name: 'administrator_login_password',
        type: 'string',
        description: 'The password associated with the administrator_login user',
        sensitive: true,
        group: 'security',
      },
      {
        name: 'minimum_tls_version',
        type: 'string',
        description: 'The Minimum TLS Version for all SQL Database and SQL Data Warehouse databases',
        default: '1.2',
        options: ['1.0', '1.1', '1.2', 'Disabled'],
        group: 'security',
      },
      {
        name: 'public_network_access_enabled',
        type: 'bool',
        description: 'Whether public network access is allowed for this server',
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
        name: 'azuread_administrator',
        description: 'An azuread_administrator block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'login_username',
            type: 'string',
            description: 'The login username of the Azure AD Administrator of this SQL Server',
          },
          {
            name: 'object_id',
            type: 'string',
            description: 'The object id of the Azure AD Administrator of this SQL Server',
          },
          {
            name: 'tenant_id',
            type: 'string',
            description: 'The tenant id of the Azure AD Administrator of this SQL Server',
          },
          {
            name: 'azuread_authentication_only',
            type: 'bool',
            description: 'Specifies whether only AD Users and administrators can be used to login',
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
    { name: 'id', type: 'string', description: 'The ID of the SQL Server' },
    { name: 'fully_qualified_domain_name', type: 'string', description: 'The fully qualified domain name of the Azure SQL Server' },
  ],

  terraform: {
    resourceType: 'azurerm_mssql_server',
    requiredArgs: ['name', 'resource_group_name', 'location', 'version'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      fully_qualified_domain_name: 'fully_qualified_domain_name',
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
        childTypes: ['azurerm_mssql_database'],
        description: 'SQL Server can contain SQL databases',
      },
    ],
  },
};
