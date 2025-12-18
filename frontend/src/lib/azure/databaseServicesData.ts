/**
 * Azure Database Services Data - Complete definitions from database.json
 * This file contains ALL 8 database services with ALL their properties
 * 
 * Services included:
 * 1. SQL Server (azurerm_mssql_server)
 * 2. SQL Database (azurerm_mssql_database)
 * 3. SQL Elastic Pool (azurerm_mssql_elasticpool)
 * 4. MySQL Flexible Server (azurerm_mysql_flexible_server)
 * 5. PostgreSQL Flexible Server (azurerm_postgresql_flexible_server)
 * 6. Cosmos DB Account (azurerm_cosmosdb_account)
 * 7. Redis Cache (azurerm_redis_cache)
 */

// Type definitions
export interface ServiceInput {
  name: string;
  type: string;
  description?: string;
  example?: string;
  default?: unknown;
  options?: string[];
  reference?: string;
  required?: boolean;
  sensitive?: boolean;
}

export interface BlockAttribute {
  name: string;
  type: string;
  description?: string;
  options?: string[];
  default?: unknown;
  required?: boolean;
  sensitive?: boolean;
}

export interface ServiceBlock {
  name: string;
  description?: string;
  multiple?: boolean;
  required?: boolean;
  attributes: BlockAttribute[];
  nested_blocks?: ServiceBlock[];
  blocks?: ServiceBlock[];
}

export interface ServiceOutput {
  name: string;
  type: string;
  description?: string;
  sensitive?: boolean;
}

// Azure Database service icon mappings - using Azure Public Service Icons
export const DATABASE_ICONS: Record<string, string> = {
  'azurerm_mssql_server': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10132-icon-service-SQL-Server.svg',
  'azurerm_mssql_database': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10130-icon-service-SQL-Database.svg',
  'azurerm_mssql_elasticpool': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10134-icon-service-SQL-Elastic-Pools.svg',
  'azurerm_mysql_flexible_server': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10122-icon-service-Azure-Database-MySQL-Server.svg',
  'azurerm_postgresql_flexible_server': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10131-icon-service-Azure-Database-PostgreSQL-Server.svg',
  'azurerm_cosmosdb_account': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10121-icon-service-Azure-Cosmos-DB.svg',
  'azurerm_redis_cache': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/databases/10137-icon-service-Cache-Redis.svg',
};

// Database service definition interface
export interface DatabaseServiceDefinition {
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}

// Complete database services data from database.json
export const DATABASE_SERVICES: DatabaseServiceDefinition[] = [
  {
    id: "mssql_server",
    name: "SQL Server",
    description: "Azure SQL Server",
    terraform_resource: "azurerm_mssql_server",
    icon: DATABASE_ICONS['azurerm_mssql_server'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Server name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "version", type: "string", description: "Server version", options: ["2.0", "12.0"] }
      ],
      optional: [
        { name: "administrator_login", type: "string", description: "Admin login" },
        { name: "administrator_login_password", type: "string", description: "Admin password", sensitive: true },
        { name: "connection_policy", type: "string", description: "Connection policy", options: ["Default", "Proxy", "Redirect"] },
        { name: "minimum_tls_version", type: "string", description: "Min TLS version", options: ["1.0", "1.1", "1.2", "Disabled"] },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "outbound_network_restriction_enabled", type: "bool", description: "Outbound restriction" },
        { name: "primary_user_assigned_identity_id", type: "string", description: "Primary identity ID" },
        { name: "transparent_data_encryption_key_vault_key_id", type: "string", description: "TDE key vault key ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list" }
          ]
        },
        {
          name: "azuread_administrator",
          required: false,
          attributes: [
            { name: "login_username", type: "string", required: true },
            { name: "object_id", type: "string", required: true },
            { name: "tenant_id", type: "string" },
            { name: "azuread_authentication_only", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Server ID" },
      { name: "fully_qualified_domain_name", type: "string", description: "FQDN" },
      { name: "restorable_dropped_database_ids", type: "list", description: "Restorable DB IDs" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "mssql_database",
    name: "SQL Database",
    description: "Azure SQL Database",
    terraform_resource: "azurerm_mssql_database",
    icon: DATABASE_ICONS['azurerm_mssql_database'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Database name" },
        { name: "server_id", type: "string", description: "SQL Server ID" }
      ],
      optional: [
        { name: "auto_pause_delay_in_minutes", type: "number", description: "Auto pause delay" },
        { name: "create_mode", type: "string", description: "Create mode", options: ["Copy", "Default", "OnlineSecondary", "PointInTimeRestore", "Recovery", "Restore", "RestoreExternalBackup", "RestoreExternalBackupSecondary", "RestoreLongTermRetentionBackup", "Secondary"] },
        { name: "collation", type: "string", description: "Collation" },
        { name: "elastic_pool_id", type: "string", description: "Elastic pool ID" },
        { name: "enclave_type", type: "string", description: "Enclave type", options: ["Default", "VBS"] },
        { name: "geo_backup_enabled", type: "bool", description: "Geo backup", default: true },
        { name: "maintenance_configuration_name", type: "string", description: "Maintenance config" },
        { name: "ledger_enabled", type: "bool", description: "Ledger enabled" },
        { name: "license_type", type: "string", description: "License type", options: ["LicenseIncluded", "BasePrice"] },
        { name: "max_size_gb", type: "number", description: "Max size GB" },
        { name: "min_capacity", type: "number", description: "Min capacity" },
        { name: "restore_point_in_time", type: "string", description: "Restore point in time" },
        { name: "recover_database_id", type: "string", description: "Recover database ID" },
        { name: "recovery_point_id", type: "string", description: "Recovery point ID" },
        { name: "restore_dropped_database_id", type: "string", description: "Restore dropped DB ID" },
        { name: "restore_long_term_retention_backup_id", type: "string", description: "LTR backup ID" },
        { name: "read_replica_count", type: "number", description: "Read replica count" },
        { name: "read_scale", type: "bool", description: "Read scale" },
        { name: "sample_name", type: "string", description: "Sample name" },
        { name: "sku_name", type: "string", description: "SKU name" },
        { name: "storage_account_type", type: "string", description: "Storage type", options: ["Geo", "GeoZone", "Local", "Zone"], default: "Geo" },
        { name: "transparent_data_encryption_enabled", type: "bool", description: "TDE enabled", default: true },
        { name: "transparent_data_encryption_key_vault_key_id", type: "string", description: "TDE key vault key ID" },
        { name: "transparent_data_encryption_key_automatic_rotation_enabled", type: "bool", description: "TDE auto rotation" },
        { name: "zone_redundant", type: "bool", description: "Zone redundant" },
        { name: "secondary_type", type: "string", description: "Secondary type", options: ["Geo", "Named"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list", required: true }
          ]
        },
        {
          name: "import",
          required: false,
          attributes: [
            { name: "storage_uri", type: "string", required: true },
            { name: "storage_key", type: "string", required: true, sensitive: true },
            { name: "storage_key_type", type: "string", required: true, options: ["SharedAccessKey", "StorageAccessKey"] },
            { name: "administrator_login", type: "string", required: true },
            { name: "administrator_login_password", type: "string", required: true, sensitive: true },
            { name: "authentication_type", type: "string", required: true, options: ["ADPassword", "SQL"] },
            { name: "storage_account_id", type: "string" }
          ]
        },
        {
          name: "threat_detection_policy",
          required: false,
          attributes: [
            { name: "state", type: "string", options: ["Disabled", "Enabled", "New"] },
            { name: "disabled_alerts", type: "list" },
            { name: "email_account_admins", type: "string", options: ["Disabled", "Enabled"] },
            { name: "email_addresses", type: "list" },
            { name: "retention_days", type: "number" },
            { name: "storage_account_access_key", type: "string", sensitive: true },
            { name: "storage_endpoint", type: "string" }
          ]
        },
        {
          name: "long_term_retention_policy",
          required: false,
          attributes: [
            { name: "weekly_retention", type: "string" },
            { name: "monthly_retention", type: "string" },
            { name: "yearly_retention", type: "string" },
            { name: "week_of_year", type: "number" }
          ]
        },
        {
          name: "short_term_retention_policy",
          required: false,
          attributes: [
            { name: "retention_days", type: "number", required: true },
            { name: "backup_interval_in_hours", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Database ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "mssql_elasticpool",
    name: "SQL Elastic Pool",
    description: "Azure SQL Elastic Pool",
    terraform_resource: "azurerm_mssql_elasticpool",
    icon: DATABASE_ICONS['azurerm_mssql_elasticpool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Pool name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "server_name", type: "string", description: "SQL Server name" }
      ],
      optional: [
        { name: "license_type", type: "string", description: "License type", options: ["LicenseIncluded", "BasePrice"] },
        { name: "max_size_gb", type: "number", description: "Max size GB" },
        { name: "max_size_bytes", type: "number", description: "Max size bytes" },
        { name: "maintenance_configuration_name", type: "string", description: "Maintenance config" },
        { name: "zone_redundant", type: "bool", description: "Zone redundant" },
        { name: "enclave_type", type: "string", description: "Enclave type", options: ["Default", "VBS"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "sku",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "tier", type: "string", required: true },
            { name: "family", type: "string" },
            { name: "capacity", type: "number", required: true }
          ]
        },
        {
          name: "per_database_settings",
          required: true,
          attributes: [
            { name: "min_capacity", type: "number", required: true },
            { name: "max_capacity", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Pool ID" }
    ]
  },
  {
    id: "mysql_flexible_server",
    name: "MySQL Flexible Server",
    description: "Azure Database for MySQL Flexible Server",
    terraform_resource: "azurerm_mysql_flexible_server",
    icon: DATABASE_ICONS['azurerm_mysql_flexible_server'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Server name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "administrator_login", type: "string", description: "Admin login" },
        { name: "administrator_password", type: "string", description: "Admin password", sensitive: true },
        { name: "backup_retention_days", type: "number", description: "Backup retention days" },
        { name: "create_mode", type: "string", description: "Create mode", options: ["Default", "GeoRestore", "PointInTimeRestore", "Replica"] },
        { name: "delegated_subnet_id", type: "string", description: "Delegated subnet ID" },
        { name: "geo_redundant_backup_enabled", type: "bool", description: "Geo redundant backup" },
        { name: "point_in_time_restore_time_in_utc", type: "string", description: "PITR time" },
        { name: "private_dns_zone_id", type: "string", description: "Private DNS zone ID" },
        { name: "replication_role", type: "string", description: "Replication role" },
        { name: "sku_name", type: "string", description: "SKU name" },
        { name: "source_server_id", type: "string", description: "Source server ID" },
        { name: "version", type: "string", description: "MySQL version", options: ["5.7", "8.0.21"] },
        { name: "zone", type: "string", description: "Availability zone" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list", required: true }
          ]
        },
        {
          name: "customer_managed_key",
          required: false,
          attributes: [
            { name: "key_vault_key_id", type: "string" },
            { name: "primary_user_assigned_identity_id", type: "string" },
            { name: "geo_backup_key_vault_key_id", type: "string" },
            { name: "geo_backup_user_assigned_identity_id", type: "string" }
          ]
        },
        {
          name: "high_availability",
          required: false,
          attributes: [
            { name: "mode", type: "string", required: true, options: ["SameZone", "ZoneRedundant"] },
            { name: "standby_availability_zone", type: "string" }
          ]
        },
        {
          name: "maintenance_window",
          required: false,
          attributes: [
            { name: "day_of_week", type: "number" },
            { name: "start_hour", type: "number" },
            { name: "start_minute", type: "number" }
          ]
        },
        {
          name: "storage",
          required: false,
          attributes: [
            { name: "auto_grow_enabled", type: "bool", default: true },
            { name: "io_scaling_enabled", type: "bool" },
            { name: "iops", type: "number" },
            { name: "size_gb", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Server ID" },
      { name: "fqdn", type: "string", description: "FQDN" },
      { name: "public_network_access_enabled", type: "bool", description: "Public access" },
      { name: "replica_capacity", type: "number", description: "Replica capacity" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "postgresql_flexible_server",
    name: "PostgreSQL Flexible Server",
    description: "Azure Database for PostgreSQL Flexible Server",
    terraform_resource: "azurerm_postgresql_flexible_server",
    icon: DATABASE_ICONS['azurerm_postgresql_flexible_server'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Server name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "administrator_login", type: "string", description: "Admin login" },
        { name: "administrator_password", type: "string", description: "Admin password", sensitive: true },
        { name: "backup_retention_days", type: "number", description: "Backup retention days" },
        { name: "create_mode", type: "string", description: "Create mode", options: ["Default", "GeoRestore", "PointInTimeRestore", "Replica", "Update"] },
        { name: "delegated_subnet_id", type: "string", description: "Delegated subnet ID" },
        { name: "geo_redundant_backup_enabled", type: "bool", description: "Geo redundant backup" },
        { name: "point_in_time_restore_time_in_utc", type: "string", description: "PITR time" },
        { name: "private_dns_zone_id", type: "string", description: "Private DNS zone ID" },
        { name: "replication_role", type: "string", description: "Replication role" },
        { name: "sku_name", type: "string", description: "SKU name" },
        { name: "source_server_id", type: "string", description: "Source server ID" },
        { name: "auto_grow_enabled", type: "bool", description: "Auto grow", default: false },
        { name: "storage_mb", type: "number", description: "Storage MB" },
        { name: "storage_tier", type: "string", description: "Storage tier" },
        { name: "version", type: "string", description: "PostgreSQL version", options: ["11", "12", "13", "14", "15", "16"] },
        { name: "public_network_access_enabled", type: "bool", description: "Public access" },
        { name: "zone", type: "string", description: "Availability zone" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list", required: true }
          ]
        },
        {
          name: "customer_managed_key",
          required: false,
          attributes: [
            { name: "key_vault_key_id", type: "string", required: true },
            { name: "primary_user_assigned_identity_id", type: "string" },
            { name: "geo_backup_key_vault_key_id", type: "string" },
            { name: "geo_backup_user_assigned_identity_id", type: "string" }
          ]
        },
        {
          name: "authentication",
          required: false,
          attributes: [
            { name: "active_directory_auth_enabled", type: "bool" },
            { name: "password_auth_enabled", type: "bool", default: true },
            { name: "tenant_id", type: "string" }
          ]
        },
        {
          name: "high_availability",
          required: false,
          attributes: [
            { name: "mode", type: "string", required: true, options: ["SameZone", "ZoneRedundant"] },
            { name: "standby_availability_zone", type: "string" }
          ]
        },
        {
          name: "maintenance_window",
          required: false,
          attributes: [
            { name: "day_of_week", type: "number" },
            { name: "start_hour", type: "number" },
            { name: "start_minute", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Server ID" },
      { name: "fqdn", type: "string", description: "FQDN" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "cosmosdb_account",
    name: "Cosmos DB Account",
    description: "Azure Cosmos DB Account",
    terraform_resource: "azurerm_cosmosdb_account",
    icon: DATABASE_ICONS['azurerm_cosmosdb_account'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Account name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "offer_type", type: "string", description: "Offer type", options: ["Standard"] }
      ],
      optional: [
        { name: "kind", type: "string", description: "Account kind", options: ["GlobalDocumentDB", "MongoDB", "Parse"], default: "GlobalDocumentDB" },
        { name: "ip_range_filter", type: "string", description: "IP range filter" },
        { name: "free_tier_enabled", type: "bool", description: "Free tier" },
        { name: "analytical_storage_enabled", type: "bool", description: "Analytical storage" },
        { name: "automatic_failover_enabled", type: "bool", description: "Auto failover" },
        { name: "partition_merge_enabled", type: "bool", description: "Partition merge" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "is_virtual_network_filter_enabled", type: "bool", description: "VNet filter" },
        { name: "key_vault_key_id", type: "string", description: "Key Vault key ID" },
        { name: "multiple_write_locations_enabled", type: "bool", description: "Multi-region writes" },
        { name: "access_key_metadata_writes_enabled", type: "bool", description: "Key metadata writes", default: true },
        { name: "mongo_server_version", type: "string", description: "MongoDB version", options: ["3.2", "3.6", "4.0", "4.2"] },
        { name: "network_acl_bypass_for_azure_services", type: "bool", description: "Azure services bypass" },
        { name: "network_acl_bypass_ids", type: "list", description: "Bypass resource IDs" },
        { name: "local_authentication_disabled", type: "bool", description: "Disable local auth" },
        { name: "default_identity_type", type: "string", description: "Default identity" },
        { name: "create_mode", type: "string", description: "Create mode", options: ["Default", "Restore"] },
        { name: "minimal_tls_version", type: "string", description: "Min TLS version", options: ["Tls", "Tls11", "Tls12"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "consistency_policy",
          required: true,
          attributes: [
            { name: "consistency_level", type: "string", required: true, options: ["BoundedStaleness", "ConsistentPrefix", "Eventual", "Session", "Strong"] },
            { name: "max_interval_in_seconds", type: "number" },
            { name: "max_staleness_prefix", type: "number" }
          ]
        },
        {
          name: "geo_location",
          required: true,
          multiple: true,
          attributes: [
            { name: "location", type: "string", required: true },
            { name: "failover_priority", type: "number", required: true },
            { name: "zone_redundant", type: "bool" }
          ]
        },
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list" }
          ]
        },
        {
          name: "capabilities",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true }
          ]
        },
        {
          name: "virtual_network_rule",
          required: false,
          multiple: true,
          attributes: [
            { name: "id", type: "string", required: true },
            { name: "ignore_missing_vnet_service_endpoint", type: "bool" }
          ]
        },
        {
          name: "analytical_storage",
          required: false,
          attributes: [
            { name: "schema_type", type: "string", required: true, options: ["FullFidelity", "WellDefined"] }
          ]
        },
        {
          name: "capacity",
          required: false,
          attributes: [
            { name: "total_throughput_limit", type: "number", required: true }
          ]
        },
        {
          name: "backup",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true, options: ["Continuous", "Periodic"] },
            { name: "tier", type: "string" },
            { name: "interval_in_minutes", type: "number" },
            { name: "retention_in_hours", type: "number" },
            { name: "storage_redundancy", type: "string", options: ["Geo", "Local", "Zone"] }
          ]
        },
        {
          name: "cors_rule",
          required: false,
          attributes: [
            { name: "allowed_headers", type: "list", required: true },
            { name: "allowed_methods", type: "list", required: true },
            { name: "allowed_origins", type: "list", required: true },
            { name: "exposed_headers", type: "list", required: true },
            { name: "max_age_in_seconds", type: "number" }
          ]
        },
        {
          name: "restore",
          required: false,
          attributes: [
            { name: "source_cosmosdb_account_id", type: "string", required: true },
            { name: "restore_timestamp_in_utc", type: "string", required: true },
            { name: "tables_to_restore", type: "list" }
          ],
          blocks: [
            {
              name: "database",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "collection_names", type: "list" }
              ]
            },
            {
              name: "gremlin_database",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "graph_names", type: "list" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Account ID" },
      { name: "endpoint", type: "string", description: "Endpoint" },
      { name: "read_endpoints", type: "list", description: "Read endpoints" },
      { name: "write_endpoints", type: "list", description: "Write endpoints" },
      { name: "primary_key", type: "string", description: "Primary key", sensitive: true },
      { name: "secondary_key", type: "string", description: "Secondary key", sensitive: true },
      { name: "primary_readonly_key", type: "string", description: "Primary readonly key", sensitive: true },
      { name: "secondary_readonly_key", type: "string", description: "Secondary readonly key", sensitive: true },
      { name: "connection_strings", type: "list", description: "Connection strings", sensitive: true },
      { name: "primary_sql_connection_string", type: "string", description: "Primary SQL connection", sensitive: true },
      { name: "secondary_sql_connection_string", type: "string", description: "Secondary SQL connection", sensitive: true },
      { name: "primary_readonly_sql_connection_string", type: "string", description: "Primary readonly SQL connection", sensitive: true },
      { name: "secondary_readonly_sql_connection_string", type: "string", description: "Secondary readonly SQL connection", sensitive: true },
      { name: "primary_mongodb_connection_string", type: "string", description: "Primary MongoDB connection", sensitive: true },
      { name: "secondary_mongodb_connection_string", type: "string", description: "Secondary MongoDB connection", sensitive: true },
      { name: "primary_readonly_mongodb_connection_string", type: "string", description: "Primary readonly MongoDB connection", sensitive: true },
      { name: "secondary_readonly_mongodb_connection_string", type: "string", description: "Secondary readonly MongoDB connection", sensitive: true },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "redis_cache",
    name: "Redis Cache",
    description: "Azure Cache for Redis",
    terraform_resource: "azurerm_redis_cache",
    icon: DATABASE_ICONS['azurerm_redis_cache'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cache name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "capacity", type: "number", description: "Capacity" },
        { name: "family", type: "string", description: "SKU family", options: ["C", "P"] },
        { name: "sku_name", type: "string", description: "SKU name", options: ["Basic", "Standard", "Premium"] }
      ],
      optional: [
        { name: "enable_non_ssl_port", type: "bool", description: "Non-SSL port" },
        { name: "minimum_tls_version", type: "string", description: "Min TLS version", options: ["1.0", "1.1", "1.2"] },
        { name: "private_static_ip_address", type: "string", description: "Private static IP" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "replicas_per_master", type: "number", description: "Replicas per master" },
        { name: "replicas_per_primary", type: "number", description: "Replicas per primary" },
        { name: "redis_version", type: "string", description: "Redis version" },
        { name: "tenant_settings", type: "map", description: "Tenant settings" },
        { name: "shard_count", type: "number", description: "Shard count (Premium)" },
        { name: "subnet_id", type: "string", description: "Subnet ID" },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list" }
          ]
        },
        {
          name: "redis_configuration",
          required: false,
          attributes: [
            { name: "aof_backup_enabled", type: "bool" },
            { name: "aof_storage_connection_string_0", type: "string", sensitive: true },
            { name: "aof_storage_connection_string_1", type: "string", sensitive: true },
            { name: "enable_authentication", type: "bool", default: true },
            { name: "active_directory_authentication_enabled", type: "bool" },
            { name: "maxmemory_reserved", type: "number" },
            { name: "maxmemory_delta", type: "number" },
            { name: "maxmemory_policy", type: "string" },
            { name: "data_persistence_authentication_method", type: "string" },
            { name: "maxfragmentationmemory_reserved", type: "number" },
            { name: "rdb_backup_enabled", type: "bool" },
            { name: "rdb_backup_frequency", type: "number" },
            { name: "rdb_backup_max_snapshot_count", type: "number" },
            { name: "rdb_storage_connection_string", type: "string", sensitive: true },
            { name: "storage_account_subscription_id", type: "string" },
            { name: "notify_keyspace_events", type: "string" }
          ]
        },
        {
          name: "patch_schedule",
          required: false,
          multiple: true,
          attributes: [
            { name: "day_of_week", type: "string", required: true },
            { name: "start_hour_utc", type: "number" },
            { name: "maintenance_window", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cache ID" },
      { name: "hostname", type: "string", description: "Hostname" },
      { name: "ssl_port", type: "number", description: "SSL port" },
      { name: "port", type: "number", description: "Non-SSL port" },
      { name: "primary_access_key", type: "string", description: "Primary key", sensitive: true },
      { name: "secondary_access_key", type: "string", description: "Secondary key", sensitive: true },
      { name: "primary_connection_string", type: "string", description: "Primary connection", sensitive: true },
      { name: "secondary_connection_string", type: "string", description: "Secondary connection", sensitive: true },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  }
];

// All database terraform resources
export const DATABASE_TERRAFORM_RESOURCES = DATABASE_SERVICES.map(s => s.terraform_resource);

// Get database service by terraform resource name
export function getDatabaseServiceByTerraformResource(terraformResource: string): DatabaseServiceDefinition | undefined {
  return DATABASE_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get database service by ID
export function getDatabaseServiceById(id: string): DatabaseServiceDefinition | undefined {
  return DATABASE_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a database resource
export function isDatabaseResource(terraformResource: string): boolean {
  return DATABASE_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get database icon
export function getDatabaseIcon(terraformResource: string): string | undefined {
  return DATABASE_ICONS[terraformResource];
}


