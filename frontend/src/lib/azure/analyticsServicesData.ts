/**
 * Azure Analytics Services Data - Complete definitions from analytics.json
 * This file contains ALL 6 analytics services with ALL their properties
 * 
 * Services included:
 * 1. Synapse Analytics Workspace (azurerm_synapse_workspace)
 * 2. Synapse SQL Pool (azurerm_synapse_sql_pool)
 * 3. Synapse Spark Pool (azurerm_synapse_spark_pool)
 * 4. Data Factory (azurerm_data_factory)
 * 5. Stream Analytics Job (azurerm_stream_analytics_job)
 * 6. HDInsight Hadoop Cluster (azurerm_hdinsight_hadoop_cluster)
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
}

// Azure Analytics service icon mappings - using Azure Public Service Icons
export const ANALYTICS_ICONS: Record<string, string> = {
  'azurerm_synapse_workspace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00606-icon-service-Azure-Synapse-Analytics.svg',
  'azurerm_synapse_sql_pool': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00606-icon-service-Azure-Synapse-Analytics.svg',
  'azurerm_synapse_spark_pool': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00606-icon-service-Azure-Synapse-Analytics.svg',
  'azurerm_data_factory': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/10126-icon-service-Data-Factories.svg',
  'azurerm_stream_analytics_job': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00042-icon-service-Stream-Analytics-Jobs.svg',
  'azurerm_hdinsight_hadoop_cluster': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/10142-icon-service-HD-Insight-Clusters.svg',
};

// Analytics service definition interface
export interface AnalyticsServiceDefinition {
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

// Complete analytics services data from analytics.json
export const ANALYTICS_SERVICES: AnalyticsServiceDefinition[] = [
  {
    id: "synapse_workspace",
    name: "Synapse Analytics Workspace",
    description: "Azure Synapse Analytics workspace",
    terraform_resource: "azurerm_synapse_workspace",
    icon: ANALYTICS_ICONS['azurerm_synapse_workspace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Workspace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "storage_data_lake_gen2_filesystem_id", type: "string", description: "ADLS Gen2 filesystem ID" }
      ],
      optional: [
        { name: "sql_administrator_login", type: "string", description: "SQL admin login" },
        { name: "sql_administrator_login_password", type: "string", description: "SQL admin password", sensitive: true },
        { name: "compute_subnet_id", type: "string", description: "Compute subnet ID" },
        { name: "data_exfiltration_protection_enabled", type: "bool", description: "Data exfiltration protection" },
        { name: "linking_allowed_for_aad_tenant_ids", type: "list", description: "Allowed AAD tenant IDs" },
        { name: "managed_resource_group_name", type: "string", description: "Managed RG name" },
        { name: "managed_virtual_network_enabled", type: "bool", description: "Managed VNet" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "purview_id", type: "string", description: "Purview account ID" },
        { name: "sql_identity_control_enabled", type: "bool", description: "SQL identity control" },
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
          name: "aad_admin",
          required: false,
          attributes: [
            { name: "login", type: "string", required: true },
            { name: "object_id", type: "string", required: true },
            { name: "tenant_id", type: "string", required: true }
          ]
        },
        {
          name: "azure_devops_repo",
          required: false,
          attributes: [
            { name: "account_name", type: "string", required: true },
            { name: "branch_name", type: "string", required: true },
            { name: "last_commit_id", type: "string" },
            { name: "project_name", type: "string", required: true },
            { name: "repository_name", type: "string", required: true },
            { name: "root_folder", type: "string", required: true },
            { name: "tenant_id", type: "string" }
          ]
        },
        {
          name: "github_repo",
          required: false,
          attributes: [
            { name: "account_name", type: "string", required: true },
            { name: "branch_name", type: "string", required: true },
            { name: "git_url", type: "string" },
            { name: "last_commit_id", type: "string" },
            { name: "repository_name", type: "string", required: true },
            { name: "root_folder", type: "string", required: true }
          ]
        },
        {
          name: "customer_managed_key",
          required: false,
          attributes: [
            { name: "key_versionless_id", type: "string", required: true },
            { name: "key_name", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Workspace ID" },
      { name: "connectivity_endpoints", type: "map", description: "Connectivity endpoints" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "synapse_sql_pool",
    name: "Synapse SQL Pool",
    description: "Azure Synapse dedicated SQL pool",
    terraform_resource: "azurerm_synapse_sql_pool",
    icon: ANALYTICS_ICONS['azurerm_synapse_sql_pool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "SQL pool name" },
        { name: "synapse_workspace_id", type: "string", description: "Synapse workspace ID" },
        { name: "sku_name", type: "string", description: "SKU name", options: ["DW100c", "DW200c", "DW300c", "DW400c", "DW500c", "DW1000c", "DW1500c", "DW2000c", "DW2500c", "DW3000c", "DW5000c", "DW6000c", "DW7500c", "DW10000c", "DW15000c", "DW30000c"] }
      ],
      optional: [
        { name: "create_mode", type: "string", description: "Create mode", options: ["Default", "Recovery", "PointInTimeRestore"], default: "Default" },
        { name: "collation", type: "string", description: "Collation", default: "SQL_LATIN1_GENERAL_CP1_CI_AS" },
        { name: "data_encrypted", type: "bool", description: "Data encrypted" },
        { name: "recovery_database_id", type: "string", description: "Recovery database ID" },
        { name: "geo_backup_policy_enabled", type: "bool", description: "Geo backup", default: true },
        { name: "storage_account_type", type: "string", description: "Storage type", options: ["GRS", "LRS"], default: "GRS" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "restore",
          required: false,
          attributes: [
            { name: "source_database_id", type: "string", required: true },
            { name: "point_in_time", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "SQL pool ID" }
    ]
  },
  {
    id: "synapse_spark_pool",
    name: "Synapse Spark Pool",
    description: "Azure Synapse Spark pool",
    terraform_resource: "azurerm_synapse_spark_pool",
    icon: ANALYTICS_ICONS['azurerm_synapse_spark_pool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Spark pool name" },
        { name: "synapse_workspace_id", type: "string", description: "Synapse workspace ID" },
        { name: "node_size_family", type: "string", description: "Node size family", options: ["HardwareAcceleratedFPGA", "HardwareAcceleratedGPU", "MemoryOptimized", "None"] },
        { name: "node_size", type: "string", description: "Node size", options: ["Small", "Medium", "Large", "XLarge", "XXLarge", "XXXLarge"] }
      ],
      optional: [
        { name: "node_count", type: "number", description: "Node count" },
        { name: "cache_size", type: "number", description: "Cache size" },
        { name: "compute_isolation_enabled", type: "bool", description: "Compute isolation" },
        { name: "dynamic_executor_allocation_enabled", type: "bool", description: "Dynamic executor allocation" },
        { name: "min_executors", type: "number", description: "Min executors" },
        { name: "max_executors", type: "number", description: "Max executors" },
        { name: "session_level_packages_enabled", type: "bool", description: "Session packages" },
        { name: "spark_log_folder", type: "string", description: "Spark log folder", default: "/logs" },
        { name: "spark_events_folder", type: "string", description: "Spark events folder", default: "/events" },
        { name: "spark_version", type: "string", description: "Spark version", default: "2.4" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "auto_scale",
          required: false,
          attributes: [
            { name: "max_node_count", type: "number", required: true },
            { name: "min_node_count", type: "number", required: true }
          ]
        },
        {
          name: "auto_pause",
          required: false,
          attributes: [
            { name: "delay_in_minutes", type: "number", required: true }
          ]
        },
        {
          name: "library_requirement",
          required: false,
          attributes: [
            { name: "content", type: "string", required: true },
            { name: "filename", type: "string", required: true }
          ]
        },
        {
          name: "spark_config",
          required: false,
          attributes: [
            { name: "content", type: "string", required: true },
            { name: "filename", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Spark pool ID" }
    ]
  },
  {
    id: "data_factory",
    name: "Data Factory",
    description: "Azure Data Factory",
    terraform_resource: "azurerm_data_factory",
    icon: ANALYTICS_ICONS['azurerm_data_factory'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Data Factory name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "managed_virtual_network_enabled", type: "bool", description: "Managed VNet" },
        { name: "public_network_enabled", type: "bool", description: "Public network", default: true },
        { name: "customer_managed_key_id", type: "string", description: "CMK ID" },
        { name: "customer_managed_key_identity_id", type: "string", description: "CMK identity ID" },
        { name: "purview_id", type: "string", description: "Purview account ID" },
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
          name: "github_configuration",
          required: false,
          attributes: [
            { name: "account_name", type: "string", required: true },
            { name: "branch_name", type: "string", required: true },
            { name: "git_url", type: "string", required: true },
            { name: "repository_name", type: "string", required: true },
            { name: "root_folder", type: "string", required: true },
            { name: "publishing_enabled", type: "bool" }
          ]
        },
        {
          name: "vsts_configuration",
          required: false,
          attributes: [
            { name: "account_name", type: "string", required: true },
            { name: "branch_name", type: "string", required: true },
            { name: "project_name", type: "string", required: true },
            { name: "repository_name", type: "string", required: true },
            { name: "root_folder", type: "string", required: true },
            { name: "tenant_id", type: "string", required: true },
            { name: "publishing_enabled", type: "bool" }
          ]
        },
        {
          name: "global_parameter",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "type", type: "string", required: true, options: ["Array", "Bool", "Float", "Int", "Object", "String"] },
            { name: "value", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Data Factory ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "stream_analytics_job",
    name: "Stream Analytics Job",
    description: "Azure Stream Analytics job",
    terraform_resource: "azurerm_stream_analytics_job",
    icon: ANALYTICS_ICONS['azurerm_stream_analytics_job'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Job name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "streaming_units", type: "number", description: "Streaming units" },
        { name: "transformation_query", type: "string", description: "Transformation query" }
      ],
      optional: [
        { name: "compatibility_level", type: "string", description: "Compatibility level", options: ["1.0", "1.1", "1.2"], default: "1.1" },
        { name: "data_locale", type: "string", description: "Data locale", default: "en-US" },
        { name: "events_late_arrival_max_delay_in_seconds", type: "number", description: "Late arrival max delay", default: 5 },
        { name: "events_out_of_order_max_delay_in_seconds", type: "number", description: "Out of order max delay", default: 0 },
        { name: "events_out_of_order_policy", type: "string", description: "Out of order policy", options: ["Adjust", "Drop"], default: "Adjust" },
        { name: "output_error_policy", type: "string", description: "Output error policy", options: ["Drop", "Stop"], default: "Drop" },
        { name: "type", type: "string", description: "Job type", options: ["Cloud", "Edge"], default: "Cloud" },
        { name: "content_storage_policy", type: "string", description: "Content storage policy", options: ["JobStorageAccount", "SystemAccount"], default: "SystemAccount" },
        { name: "stream_analytics_cluster_id", type: "string", description: "Cluster ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true }
          ]
        },
        {
          name: "job_storage_account",
          required: false,
          attributes: [
            { name: "authentication_mode", type: "string", required: true, options: ["ConnectionString", "Msi"] },
            { name: "account_name", type: "string", required: true },
            { name: "account_key", type: "string", sensitive: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Job ID" },
      { name: "job_id", type: "string", description: "GUID job ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "hdinsight_hadoop_cluster",
    name: "HDInsight Hadoop Cluster",
    description: "Azure HDInsight Hadoop cluster",
    terraform_resource: "azurerm_hdinsight_hadoop_cluster",
    icon: ANALYTICS_ICONS['azurerm_hdinsight_hadoop_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "cluster_version", type: "string", description: "HDInsight version" },
        { name: "tier", type: "string", description: "Cluster tier", options: ["Standard", "Premium"] }
      ],
      optional: [
        { name: "tls_min_version", type: "string", description: "Min TLS version" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "component_version",
          required: true,
          attributes: [
            { name: "hadoop", type: "string", required: true }
          ]
        },
        {
          name: "gateway",
          required: true,
          attributes: [
            { name: "username", type: "string", required: true },
            { name: "password", type: "string", required: true, sensitive: true }
          ]
        },
        {
          name: "storage_account",
          required: false,
          multiple: true,
          attributes: [
            { name: "storage_container_id", type: "string", required: true },
            { name: "storage_account_key", type: "string", required: true, sensitive: true },
            { name: "is_default", type: "bool", required: true },
            { name: "storage_resource_id", type: "string" }
          ]
        },
        {
          name: "storage_account_gen2",
          required: false,
          attributes: [
            { name: "storage_resource_id", type: "string", required: true },
            { name: "filesystem_id", type: "string", required: true },
            { name: "managed_identity_resource_id", type: "string", required: true },
            { name: "is_default", type: "bool", required: true }
          ]
        },
        {
          name: "roles",
          required: true,
          attributes: [],
          blocks: [
            {
              name: "head_node",
              required: true,
              attributes: [
                { name: "vm_size", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", sensitive: true },
                { name: "ssh_keys", type: "list" },
                { name: "subnet_id", type: "string" },
                { name: "virtual_network_id", type: "string" }
              ],
              blocks: [
                {
                  name: "script_actions",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "uri", type: "string", required: true },
                    { name: "parameters", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "worker_node",
              required: true,
              attributes: [
                { name: "vm_size", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", sensitive: true },
                { name: "ssh_keys", type: "list" },
                { name: "subnet_id", type: "string" },
                { name: "virtual_network_id", type: "string" },
                { name: "target_instance_count", type: "number", required: true }
              ],
              blocks: [
                {
                  name: "autoscale",
                  attributes: [],
                  blocks: [
                    {
                      name: "capacity",
                      attributes: [
                        { name: "min_instance_count", type: "number", required: true },
                        { name: "max_instance_count", type: "number", required: true }
                      ]
                    },
                    {
                      name: "recurrence",
                      attributes: [
                        { name: "timezone", type: "string", required: true }
                      ],
                      blocks: [
                        {
                          name: "schedule",
                          required: true,
                          multiple: true,
                          attributes: [
                            { name: "days", type: "list", required: true },
                            { name: "time", type: "string", required: true },
                            { name: "target_instance_count", type: "number", required: true }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "script_actions",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "uri", type: "string", required: true },
                    { name: "parameters", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "zookeeper_node",
              required: true,
              attributes: [
                { name: "vm_size", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", sensitive: true },
                { name: "ssh_keys", type: "list" },
                { name: "subnet_id", type: "string" },
                { name: "virtual_network_id", type: "string" }
              ],
              blocks: [
                {
                  name: "script_actions",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "uri", type: "string", required: true },
                    { name: "parameters", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "edge_node",
              required: false,
              attributes: [
                { name: "vm_size", type: "string", required: true },
                { name: "target_instance_count", type: "number", required: true }
              ],
              blocks: [
                {
                  name: "install_script_action",
                  required: true,
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "uri", type: "string", required: true },
                    { name: "parameters", type: "string" }
                  ]
                },
                {
                  name: "uninstall_script_actions",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "uri", type: "string", required: true },
                    { name: "parameters", type: "string" }
                  ]
                },
                {
                  name: "https_endpoints",
                  multiple: true,
                  attributes: [
                    { name: "access_modes", type: "list" },
                    { name: "destination_port", type: "number" },
                    { name: "disable_gateway_auth", type: "bool" },
                    { name: "private_ip_address", type: "string" },
                    { name: "sub_domain_suffix", type: "string" }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "metastores",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "hive",
              attributes: [
                { name: "server", type: "string", required: true },
                { name: "database_name", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", required: true, sensitive: true }
              ]
            },
            {
              name: "oozie",
              attributes: [
                { name: "server", type: "string", required: true },
                { name: "database_name", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", required: true, sensitive: true }
              ]
            },
            {
              name: "ambari",
              attributes: [
                { name: "server", type: "string", required: true },
                { name: "database_name", type: "string", required: true },
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", required: true, sensitive: true }
              ]
            }
          ]
        },
        {
          name: "security_profile",
          required: false,
          attributes: [
            { name: "aadds_resource_id", type: "string", required: true },
            { name: "domain_name", type: "string", required: true },
            { name: "domain_username", type: "string", required: true },
            { name: "domain_user_password", type: "string", required: true, sensitive: true },
            { name: "ldaps_urls", type: "list", required: true },
            { name: "msi_resource_id", type: "string", required: true },
            { name: "cluster_users_group_dns", type: "list" }
          ]
        },
        {
          name: "network",
          required: false,
          attributes: [
            { name: "connection_direction", type: "string", options: ["Inbound", "Outbound"] },
            { name: "private_link_enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "https_endpoint", type: "string", description: "HTTPS endpoint" },
      { name: "ssh_endpoint", type: "string", description: "SSH endpoint" }
    ]
  }
];

// All analytics terraform resources
export const ANALYTICS_TERRAFORM_RESOURCES = ANALYTICS_SERVICES.map(s => s.terraform_resource);

// Get analytics service by terraform resource name
export function getAnalyticsServiceByTerraformResource(terraformResource: string): AnalyticsServiceDefinition | undefined {
  return ANALYTICS_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get analytics service by ID
export function getAnalyticsServiceById(id: string): AnalyticsServiceDefinition | undefined {
  return ANALYTICS_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is an analytics resource
export function isAnalyticsResource(terraformResource: string): boolean {
  return ANALYTICS_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get analytics icon
export function getAnalyticsIcon(terraformResource: string): string | undefined {
  return ANALYTICS_ICONS[terraformResource];
}

