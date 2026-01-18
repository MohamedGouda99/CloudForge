/**
 * Azure SQL Database Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const azureSqlDatabase: ServiceDefinition = {
  id: 'sql_database',
  terraform_resource: 'azurerm_mssql_database',
  name: 'SQL Database',
  description: 'Manages a MS SQL Database',
  icon: DATABASE_ICONS.SQL_DATABASE,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the MS SQL Database',
        example: 'my-database',
        group: 'basic',
      },
      {
        name: 'server_id',
        type: 'string',
        description: 'The id of the MS SQL Server on which to create the database',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'collation',
        type: 'string',
        description: 'Specifies the collation of the database',
        default: 'SQL_Latin1_General_CP1_CI_AS',
        group: 'advanced',
      },
      {
        name: 'max_size_gb',
        type: 'number',
        description: 'The max size of the database in gigabytes',
        group: 'basic',
      },
      {
        name: 'sku_name',
        type: 'string',
        description: 'Specifies the name of the SKU used by the database',
        default: 'S0',
        group: 'basic',
      },
      {
        name: 'zone_redundant',
        type: 'bool',
        description: 'Whether or not this database is zone redundant',
        default: false,
        group: 'advanced',
      },
      {
        name: 'read_scale',
        type: 'bool',
        description: 'If enabled, connections that have application intent set to readonly in their connection string may be routed to a readonly secondary replica',
        default: false,
        group: 'advanced',
      },
      {
        name: 'geo_backup_enabled',
        type: 'bool',
        description: 'A boolean that specifies if the Geo Backup Policy is enabled',
        default: true,
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
        name: 'short_term_retention_policy',
        description: 'A short_term_retention_policy block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'retention_days',
            type: 'number',
            description: 'Point In Time Restore configuration. Value has to be between 7 and 35',
          },
          {
            name: 'backup_interval_in_hours',
            type: 'number',
            description: 'The hours between each differential backup (12 or 24)',
          },
        ],
      },
      {
        name: 'long_term_retention_policy',
        description: 'A long_term_retention_policy block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'weekly_retention',
            type: 'string',
            description: 'The weekly retention policy for an LTR backup in an ISO 8601 format',
          },
          {
            name: 'monthly_retention',
            type: 'string',
            description: 'The monthly retention policy for an LTR backup in an ISO 8601 format',
          },
          {
            name: 'yearly_retention',
            type: 'string',
            description: 'The yearly retention policy for an LTR backup in an ISO 8601 format',
          },
          {
            name: 'week_of_year',
            type: 'number',
            description: 'The week of year to take the yearly backup',
          },
        ],
      },
      {
        name: 'threat_detection_policy',
        description: 'Threat detection policy configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'state',
            type: 'string',
            description: 'The State of the Policy',
            options: ['Enabled', 'Disabled', 'New'],
          },
          {
            name: 'email_account_admins',
            type: 'string',
            description: 'Should the account administrators be emailed when a threat is detected?',
            options: ['Enabled', 'Disabled'],
          },
          {
            name: 'email_addresses',
            type: 'list(string)',
            description: 'A list of email addresses which alerts should be sent to',
          },
          {
            name: 'retention_days',
            type: 'number',
            description: 'Specifies the number of days to keep in the Threat Detection audit logs',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the SQL Database' },
    { name: 'name', type: 'string', description: 'The name of the MS SQL Database' },
  ],

  terraform: {
    resourceType: 'azurerm_mssql_database',
    requiredArgs: ['name', 'server_id'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'azurerm_mssql_server',
        apply: [
          {
            setArg: 'server_id',
            toParentAttr: 'id',
          },
        ],
      },
    ],
  },
};
