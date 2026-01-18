/**
 * Azure CosmosDB Account Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DATABASE_ICONS } from '../icons';

export const azureCosmosdbAccount: ServiceDefinition = {
  id: 'cosmosdb_account',
  terraform_resource: 'azurerm_cosmosdb_account',
  name: 'CosmosDB Account',
  description: 'Manages a CosmosDB (formerly DocumentDB) Account',
  icon: DATABASE_ICONS.COSMOS_DB,
  category: 'database',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Specifies the name of the CosmosDB Account',
        example: 'my-cosmos-account',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the resource group in which the CosmosDB Account is created',
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
        name: 'offer_type',
        type: 'string',
        description: 'Specifies the Offer Type to use for this CosmosDB Account',
        default: 'Standard',
        options: ['Standard'],
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'kind',
        type: 'string',
        description: 'Specifies the Kind of CosmosDB to create',
        default: 'GlobalDocumentDB',
        options: ['GlobalDocumentDB', 'MongoDB', 'Parse'],
        group: 'basic',
      },
      {
        name: 'enable_automatic_failover',
        type: 'bool',
        description: 'Enable automatic fail over for this Cosmos DB account',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_free_tier',
        type: 'bool',
        description: 'Enable Free Tier pricing option for this Cosmos DB account',
        default: false,
        group: 'basic',
      },
      {
        name: 'public_network_access_enabled',
        type: 'bool',
        description: 'Whether or not public network access is allowed for this CosmosDB account',
        default: true,
        group: 'networking',
      },
      {
        name: 'is_virtual_network_filter_enabled',
        type: 'bool',
        description: 'Enables virtual network filtering for this Cosmos DB account',
        default: false,
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
        name: 'consistency_policy',
        description: 'Specifies a consistency_policy resource, used to define the consistency policy for this CosmosDB account',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'consistency_level',
            type: 'string',
            description: 'The Consistency Level to use for this CosmosDB Account',
            options: ['BoundedStaleness', 'Eventual', 'Session', 'Strong', 'ConsistentPrefix'],
          },
          {
            name: 'max_interval_in_seconds',
            type: 'number',
            description: 'When used with the Bounded Staleness consistency level, this value represents the time amount of staleness (in seconds) tolerated',
          },
          {
            name: 'max_staleness_prefix',
            type: 'number',
            description: 'When used with the Bounded Staleness consistency level, this value represents the number of stale requests tolerated',
          },
        ],
      },
      {
        name: 'geo_location',
        description: 'Specifies a geo_location resource, used to define where data should be replicated with the failover_priority 0 specifying the primary location',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'location',
            type: 'string',
            description: 'The name of the Azure region to host replicated data',
          },
          {
            name: 'failover_priority',
            type: 'number',
            description: 'The failover priority of the region',
          },
          {
            name: 'zone_redundant',
            type: 'bool',
            description: 'Should zone redundancy be enabled for this region?',
          },
        ],
      },
      {
        name: 'capabilities',
        description: 'The capabilities which should be enabled for this Cosmos DB account',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'The capability to enable',
            options: ['AllowSelfServeUpgradeToMongo36', 'DisableRateLimitingResponses', 'EnableAggregationPipeline', 'EnableCassandra', 'EnableGremlin', 'EnableMongo', 'EnableTable', 'EnableServerless', 'MongoDBv3.4', 'mongoEnableDocLevelTTL'],
          },
        ],
      },
      {
        name: 'backup',
        description: 'Specifies a backup block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'The type of the backup',
            options: ['Continuous', 'Periodic'],
          },
          {
            name: 'interval_in_minutes',
            type: 'number',
            description: 'The interval in minutes between two backups (only for Periodic)',
          },
          {
            name: 'retention_in_hours',
            type: 'number',
            description: 'The time in hours that each backup is retained (only for Periodic)',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the CosmosDB Account' },
    { name: 'endpoint', type: 'string', description: 'The endpoint used to connect to the CosmosDB account' },
    { name: 'primary_key', type: 'string', description: 'The Primary key for the CosmosDB Account' },
    { name: 'secondary_key', type: 'string', description: 'The Secondary key for the CosmosDB Account' },
    { name: 'connection_strings', type: 'list(string)', description: 'A list of connection strings available for this CosmosDB account' },
  ],

  terraform: {
    resourceType: 'azurerm_cosmosdb_account',
    requiredArgs: ['name', 'resource_group_name', 'location', 'offer_type', 'consistency_policy', 'geo_location'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
      endpoint: 'endpoint',
      primary_key: 'primary_key',
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
        childTypes: ['azurerm_cosmosdb_sql_database', 'azurerm_cosmosdb_mongo_database'],
        description: 'CosmosDB account can contain databases',
      },
    ],
  },
};
