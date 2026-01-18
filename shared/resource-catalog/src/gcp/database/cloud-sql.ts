/**
 * GCP Cloud SQL Instance Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const gcpSqlDatabaseInstance: ServiceDefinition = {
  id: 'sql_database_instance',
  terraform_resource: 'google_sql_database_instance',
  name: 'Cloud SQL Instance',
  description: 'Creates a new Google SQL Database Instance',
  icon: DATABASE_ICONS.CLOUD_SQL,
  category: 'database',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the instance',
        example: 'my-sql-instance',
        group: 'basic',
      },
      {
        name: 'database_version',
        type: 'string',
        description: 'The MySQL, PostgreSQL or SQL Server version to use',
        options: ['MYSQL_5_6', 'MYSQL_5_7', 'MYSQL_8_0', 'POSTGRES_9_6', 'POSTGRES_10', 'POSTGRES_11', 'POSTGRES_12', 'POSTGRES_13', 'POSTGRES_14', 'POSTGRES_15', 'SQLSERVER_2017_STANDARD', 'SQLSERVER_2017_ENTERPRISE', 'SQLSERVER_2019_STANDARD', 'SQLSERVER_2019_ENTERPRISE'],
        group: 'basic',
      },
      {
        name: 'region',
        type: 'string',
        description: 'The region the instance will sit in',
        example: 'us-central1',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'deletion_protection',
        type: 'bool',
        description: 'Used to block Terraform from deleting a SQL Instance',
        default: true,
        group: 'advanced',
      },
      {
        name: 'root_password',
        type: 'string',
        description: 'Initial root password for SQLSERVER only',
        group: 'basic',
      },
      {
        name: 'master_instance_name',
        type: 'string',
        description: 'The name of the existing instance that will act as the master in the replication setup',
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'settings',
        description: 'The settings to use for the database',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'tier',
            type: 'string',
            description: 'The machine type to use',
            options: ['db-f1-micro', 'db-g1-small', 'db-n1-standard-1', 'db-n1-standard-2', 'db-n1-standard-4', 'db-n1-highmem-2', 'db-n1-highmem-4'],
          },
          {
            name: 'availability_type',
            type: 'string',
            description: 'The availability type of the Cloud SQL instance',
            options: ['ZONAL', 'REGIONAL'],
            default: 'ZONAL',
          },
          {
            name: 'disk_size',
            type: 'number',
            description: 'The size of data disk, in GB',
            default: 10,
          },
          {
            name: 'disk_type',
            type: 'string',
            description: 'The type of data disk',
            options: ['PD_SSD', 'PD_HDD'],
            default: 'PD_SSD',
          },
          {
            name: 'disk_autoresize',
            type: 'bool',
            description: 'Configuration to increase storage size automatically',
            default: true,
          },
        ],
      },
      {
        name: 'replica_configuration',
        description: 'The configuration for replication',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'failover_target',
            type: 'bool',
            description: 'Specifies if the replica is the failover target',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'connection_name', type: 'string', description: 'The connection name of the instance to be used in connection strings' },
    { name: 'public_ip_address', type: 'string', description: 'The first public IPv4 address assigned' },
    { name: 'private_ip_address', type: 'string', description: 'The first private IPv4 address assigned' },
    { name: 'service_account_email_address', type: 'string', description: 'The service account email address assigned to the instance' },
  ],

  terraform: {
    resourceType: 'google_sql_database_instance',
    requiredArgs: ['name', 'database_version', 'region', 'settings'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      connection_name: 'connection_name',
      name: 'name',
    },
  },
};
