/**
 * Azure Developer Tools Services Data - Complete definitions from developer-tools.json
 * This file contains ALL 7 developer-tools services with ALL their properties
 * 
 * Services included:
 * 1. DevTest Labs (azurerm_dev_test_lab)
 * 2. App Service Source Control Token (azurerm_source_control_token)
 * 3. Static Web App (azurerm_static_site)
 * 4. App Configuration (azurerm_app_configuration)
 * 5. Container Registry (azurerm_container_registry)
 * 6. SignalR Service (azurerm_signalr_service)
 * 7. Notification Hub Namespace (azurerm_notification_hub_namespace)
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

// Azure Developer Tools service icon mappings - using Azure Public Service Icons
export const DEVELOPER_TOOLS_ICONS: Record<string, string> = {
  'azurerm_dev_test_lab': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/devops/10264-icon-service-DevTest-Labs.svg',
  'azurerm_source_control_token': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/devops/10261-icon-service-Azure-DevOps.svg',
  'azurerm_static_site': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/app services/10035-icon-service-App-Services.svg',
  'azurerm_app_configuration': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/app services/10035-icon-service-App-Services.svg',
  'azurerm_container_registry': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/containers/10105-icon-service-Container-Registries.svg',
  'azurerm_signalr_service': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/app services/10035-icon-service-App-Services.svg',
  'azurerm_notification_hub_namespace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/app services/10045-icon-service-Notification-Hubs.svg',
};

// Developer Tools service definition interface
export interface DeveloperToolsServiceDefinition {
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

// Complete developer-tools services data from developer-tools.json
export const DEVELOPER_TOOLS_SERVICES: DeveloperToolsServiceDefinition[] = [
  {
    id: "devtest_lab",
    name: "DevTest Labs",
    description: "Azure DevTest Labs",
    terraform_resource: "azurerm_dev_test_lab",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_dev_test_lab'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Lab name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "storage_type", type: "string", description: "Storage type", options: ["Standard", "Premium"], default: "Premium" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Lab ID" },
      { name: "artifacts_storage_account_id", type: "string", description: "Artifacts storage ID" },
      { name: "default_storage_account_id", type: "string", description: "Default storage ID" },
      { name: "default_premium_storage_account_id", type: "string", description: "Premium storage ID" },
      { name: "key_vault_id", type: "string", description: "Key Vault ID" },
      { name: "premium_data_disk_storage_account_id", type: "string", description: "Premium disk storage ID" },
      { name: "unique_identifier", type: "string", description: "Unique identifier" }
    ]
  },
  {
    id: "source_control_token",
    name: "App Service Source Control Token",
    description: "Source control token for App Service",
    terraform_resource: "azurerm_source_control_token",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_source_control_token'],
    inputs: {
      required: [
        { name: "type", type: "string", description: "Token type", options: ["Bitbucket", "Dropbox", "GitHub", "OneDrive"] },
        { name: "token", type: "string", description: "Access token", sensitive: true }
      ],
      optional: [
        { name: "token_secret", type: "string", description: "Token secret", sensitive: true }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Token ID" }
    ]
  },
  {
    id: "static_site",
    name: "Static Web App",
    description: "Azure Static Web App",
    terraform_resource: "azurerm_static_site",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_static_site'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Static site name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "sku_tier", type: "string", description: "SKU tier", options: ["Free", "Standard"], default: "Free" },
        { name: "sku_size", type: "string", description: "SKU size", options: ["Free", "Standard"], default: "Free" },
        { name: "configuration_file_changes_enabled", type: "bool", description: "Config file changes", default: true },
        { name: "preview_environments_enabled", type: "bool", description: "Preview environments", default: true },
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
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Static site ID" },
      { name: "api_key", type: "string", description: "API key", sensitive: true },
      { name: "default_host_name", type: "string", description: "Default hostname" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "app_configuration",
    name: "App Configuration",
    description: "Azure App Configuration",
    terraform_resource: "azurerm_app_configuration",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_app_configuration'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Configuration store name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "sku", type: "string", description: "SKU", options: ["free", "standard"], default: "free" },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "public_network_access", type: "string", description: "Public access", options: ["Enabled", "Disabled"] },
        { name: "purge_protection_enabled", type: "bool", description: "Purge protection" },
        { name: "soft_delete_retention_days", type: "number", description: "Soft delete days" },
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
          name: "encryption",
          required: false,
          attributes: [
            { name: "key_vault_key_identifier", type: "string" },
            { name: "identity_client_id", type: "string" }
          ]
        },
        {
          name: "replica",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "location", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Configuration store ID" },
      { name: "endpoint", type: "string", description: "Endpoint" },
      { name: "primary_read_key", type: "list", description: "Primary read key" },
      { name: "primary_write_key", type: "list", description: "Primary write key" },
      { name: "secondary_read_key", type: "list", description: "Secondary read key" },
      { name: "secondary_write_key", type: "list", description: "Secondary write key" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "container_registry",
    name: "Container Registry",
    description: "Azure Container Registry",
    terraform_resource: "azurerm_container_registry",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_container_registry'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Registry name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "SKU", options: ["Basic", "Standard", "Premium"] }
      ],
      optional: [
        { name: "admin_enabled", type: "bool", description: "Admin enabled" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "quarantine_policy_enabled", type: "bool", description: "Quarantine policy" },
        { name: "zone_redundancy_enabled", type: "bool", description: "Zone redundancy" },
        { name: "export_policy_enabled", type: "bool", description: "Export policy", default: true },
        { name: "anonymous_pull_enabled", type: "bool", description: "Anonymous pull" },
        { name: "data_endpoint_enabled", type: "bool", description: "Data endpoint" },
        { name: "network_rule_bypass_option", type: "string", description: "Network bypass", options: ["None", "AzureServices"], default: "AzureServices" },
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
          name: "georeplications",
          required: false,
          multiple: true,
          attributes: [
            { name: "location", type: "string", required: true },
            { name: "regional_endpoint_enabled", type: "bool" },
            { name: "zone_redundancy_enabled", type: "bool" },
            { name: "tags", type: "map" }
          ]
        },
        {
          name: "network_rule_set",
          required: false,
          attributes: [
            { name: "default_action", type: "string", options: ["Allow", "Deny"], default: "Allow" }
          ],
          blocks: [
            {
              name: "ip_rule",
              multiple: true,
              attributes: [
                { name: "action", type: "string", required: true },
                { name: "ip_range", type: "string", required: true }
              ]
            },
            {
              name: "virtual_network",
              multiple: true,
              attributes: [
                { name: "action", type: "string", required: true },
                { name: "subnet_id", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "retention_policy",
          required: false,
          attributes: [
            { name: "days", type: "number" },
            { name: "enabled", type: "bool" }
          ]
        },
        {
          name: "trust_policy",
          required: false,
          attributes: [
            { name: "enabled", type: "bool" }
          ]
        },
        {
          name: "encryption",
          required: false,
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "key_vault_key_id", type: "string", required: true },
            { name: "identity_client_id", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Registry ID" },
      { name: "login_server", type: "string", description: "Login server" },
      { name: "admin_username", type: "string", description: "Admin username" },
      { name: "admin_password", type: "string", description: "Admin password", sensitive: true },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "signalr_service",
    name: "SignalR Service",
    description: "Azure SignalR Service",
    terraform_resource: "azurerm_signalr_service",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_signalr_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Service name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "connectivity_logs_enabled", type: "bool", description: "Connectivity logs", default: false },
        { name: "messaging_logs_enabled", type: "bool", description: "Messaging logs", default: false },
        { name: "live_trace_enabled", type: "bool", description: "Live trace", default: false },
        { name: "http_request_logs_enabled", type: "bool", description: "HTTP request logs", default: false },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "aad_auth_enabled", type: "bool", description: "AAD auth", default: true },
        { name: "tls_client_cert_enabled", type: "bool", description: "TLS client cert", default: false },
        { name: "serverless_connection_timeout_in_seconds", type: "number", description: "Serverless timeout", default: 30 },
        { name: "service_mode", type: "string", description: "Service mode", options: ["Default", "Serverless", "Classic"], default: "Default" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "sku",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true, options: ["Free_F1", "Standard_S1", "Premium_P1"] },
            { name: "capacity", type: "number", required: true }
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
          name: "cors",
          required: false,
          attributes: [
            { name: "allowed_origins", type: "list", required: true }
          ]
        },
        {
          name: "upstream_endpoint",
          required: false,
          multiple: true,
          attributes: [
            { name: "category_pattern", type: "list", required: true },
            { name: "event_pattern", type: "list", required: true },
            { name: "hub_pattern", type: "list", required: true },
            { name: "url_template", type: "string", required: true },
            { name: "user_assigned_identity_id", type: "string" }
          ]
        },
        {
          name: "live_trace",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", default: true },
            { name: "messaging_logs_enabled", type: "bool", default: true },
            { name: "connectivity_logs_enabled", type: "bool", default: true },
            { name: "http_request_logs_enabled", type: "bool", default: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "hostname", type: "string", description: "Hostname" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "public_port", type: "number", description: "Public port" },
      { name: "server_port", type: "number", description: "Server port" },
      { name: "primary_access_key", type: "string", description: "Primary key", sensitive: true },
      { name: "primary_connection_string", type: "string", description: "Primary connection string", sensitive: true },
      { name: "secondary_access_key", type: "string", description: "Secondary key", sensitive: true },
      { name: "secondary_connection_string", type: "string", description: "Secondary connection string", sensitive: true }
    ]
  },
  {
    id: "notification_hub_namespace",
    name: "Notification Hub Namespace",
    description: "Azure Notification Hub namespace",
    terraform_resource: "azurerm_notification_hub_namespace",
    icon: DEVELOPER_TOOLS_ICONS['azurerm_notification_hub_namespace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Namespace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "namespace_type", type: "string", description: "Namespace type", options: ["Messaging", "NotificationHub"] },
        { name: "sku_name", type: "string", description: "SKU", options: ["Free", "Basic", "Standard"] }
      ],
      optional: [
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Namespace ID" },
      { name: "servicebus_endpoint", type: "string", description: "Service Bus endpoint" }
    ]
  }
];

// All developer-tools terraform resources
export const DEVELOPER_TOOLS_TERRAFORM_RESOURCES = DEVELOPER_TOOLS_SERVICES.map(s => s.terraform_resource);

// Get developer-tools service by terraform resource name
export function getDeveloperToolsServiceByTerraformResource(terraformResource: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get developer-tools service by ID
export function getDeveloperToolsServiceById(id: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a developer-tools resource
export function isDeveloperToolsResource(terraformResource: string): boolean {
  return DEVELOPER_TOOLS_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get developer-tools icon
export function getDeveloperToolsIcon(terraformResource: string): string | undefined {
  return DEVELOPER_TOOLS_ICONS[terraformResource];
}


