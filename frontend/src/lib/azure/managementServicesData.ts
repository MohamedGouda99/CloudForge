/**
 * Azure Management Services Data - Complete definitions from management.json
 * This file contains ALL 8 management services with ALL their properties
 * 
 * Services included:
 * 1. Resource Group (azurerm_resource_group)
 * 2. Log Analytics Workspace (azurerm_log_analytics_workspace)
 * 3. Application Insights (azurerm_application_insights)
 * 4. Monitor Action Group (azurerm_monitor_action_group)
 * 5. Monitor Metric Alert (azurerm_monitor_metric_alert)
 * 6. Monitor Diagnostic Setting (azurerm_monitor_diagnostic_setting)
 * 7. Policy Definition (azurerm_policy_definition)
 * 8. Policy Assignment (azurerm_resource_group_policy_assignment)
 * 9. Automation Account (azurerm_automation_account)
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

// Azure Management service icon mappings - using Azure Public Service Icons
export const MANAGEMENT_ICONS: Record<string, string> = {
  'azurerm_resource_group': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/general/00000-icon-service-Resource-Groups.svg',
  'azurerm_log_analytics_workspace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00009-icon-service-Log-Analytics-Workspaces.svg',
  'azurerm_application_insights': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00012-icon-service-Application-Insights.svg',
  'azurerm_monitor_action_group': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00002-icon-service-Alerts.svg',
  'azurerm_monitor_metric_alert': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00002-icon-service-Alerts.svg',
  'azurerm_monitor_diagnostic_setting': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00008-icon-service-Diagnostics-Settings.svg',
  'azurerm_policy_definition': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/10316-icon-service-Policy.svg',
  'azurerm_resource_group_policy_assignment': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/10316-icon-service-Policy.svg',
  'azurerm_automation_account': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/management + governance/00022-icon-service-Automation-Accounts.svg',
};

// Management service definition interface
export interface ManagementServiceDefinition {
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

// Complete management services data from management.json
export const MANAGEMENT_SERVICES: ManagementServiceDefinition[] = [
  {
    id: "resource_group",
    name: "Resource Group",
    description: "Azure Resource Group",
    terraform_resource: "azurerm_resource_group",
    icon: MANAGEMENT_ICONS['azurerm_resource_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "managed_by", type: "string", description: "Managed by resource ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Resource group ID" }
    ]
  },
  {
    id: "log_analytics_workspace",
    name: "Log Analytics Workspace",
    description: "Azure Log Analytics workspace",
    terraform_resource: "azurerm_log_analytics_workspace",
    icon: MANAGEMENT_ICONS['azurerm_log_analytics_workspace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Workspace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "sku", type: "string", description: "SKU", options: ["Free", "PerNode", "Premium", "Standard", "Standalone", "Unlimited", "CapacityReservation", "PerGB2018"], default: "PerGB2018" },
        { name: "retention_in_days", type: "number", description: "Retention in days", default: 30 },
        { name: "daily_quota_gb", type: "number", description: "Daily quota in GB" },
        { name: "cmk_for_query_forced", type: "bool", description: "Force CMK for queries" },
        { name: "internet_ingestion_enabled", type: "bool", description: "Internet ingestion", default: true },
        { name: "internet_query_enabled", type: "bool", description: "Internet query", default: true },
        { name: "reservation_capacity_in_gb_per_day", type: "number", description: "Reservation capacity" },
        { name: "allow_resource_only_permissions", type: "bool", description: "Resource-only permissions", default: true },
        { name: "local_authentication_disabled", type: "bool", description: "Disable local auth" },
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
      { name: "id", type: "string", description: "Workspace ID" },
      { name: "workspace_id", type: "string", description: "Workspace GUID" },
      { name: "primary_shared_key", type: "string", description: "Primary key", sensitive: true },
      { name: "secondary_shared_key", type: "string", description: "Secondary key", sensitive: true }
    ]
  },
  {
    id: "application_insights",
    name: "Application Insights",
    description: "Azure Application Insights",
    terraform_resource: "azurerm_application_insights",
    icon: MANAGEMENT_ICONS['azurerm_application_insights'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Application Insights name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "application_type", type: "string", description: "Application type", options: ["web", "ios", "java", "MobileCenter", "Node.JS", "other", "phone", "store"] }
      ],
      optional: [
        { name: "daily_data_cap_in_gb", type: "number", description: "Daily data cap in GB" },
        { name: "daily_data_cap_notifications_disabled", type: "bool", description: "Disable cap notifications" },
        { name: "retention_in_days", type: "number", description: "Retention in days", default: 90 },
        { name: "sampling_percentage", type: "number", description: "Sampling percentage" },
        { name: "disable_ip_masking", type: "bool", description: "Disable IP masking" },
        { name: "workspace_id", type: "string", description: "Log Analytics workspace ID" },
        { name: "local_authentication_disabled", type: "bool", description: "Disable local auth" },
        { name: "internet_ingestion_enabled", type: "bool", description: "Internet ingestion", default: true },
        { name: "internet_query_enabled", type: "bool", description: "Internet query", default: true },
        { name: "force_customer_storage_for_profiler", type: "bool", description: "Force customer storage" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Application Insights ID" },
      { name: "app_id", type: "string", description: "App ID" },
      { name: "instrumentation_key", type: "string", description: "Instrumentation key", sensitive: true },
      { name: "connection_string", type: "string", description: "Connection string", sensitive: true }
    ]
  },
  {
    id: "monitor_action_group",
    name: "Monitor Action Group",
    description: "Azure Monitor action group",
    terraform_resource: "azurerm_monitor_action_group",
    icon: MANAGEMENT_ICONS['azurerm_monitor_action_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Action group name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "short_name", type: "string", description: "Short name (max 12 chars)" }
      ],
      optional: [
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "location", type: "string", description: "Location", default: "global" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "email_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "email_address", type: "string", required: true },
            { name: "use_common_alert_schema", type: "bool" }
          ]
        },
        {
          name: "sms_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "country_code", type: "string", required: true },
            { name: "phone_number", type: "string", required: true }
          ]
        },
        {
          name: "webhook_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "service_uri", type: "string", required: true },
            { name: "use_common_alert_schema", type: "bool" }
          ],
          blocks: [
            {
              name: "aad_auth",
              attributes: [
                { name: "object_id", type: "string", required: true },
                { name: "identifier_uri", type: "string" },
                { name: "tenant_id", type: "string" }
              ]
            }
          ]
        },
        {
          name: "azure_function_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "function_app_resource_id", type: "string", required: true },
            { name: "function_name", type: "string", required: true },
            { name: "http_trigger_url", type: "string", required: true },
            { name: "use_common_alert_schema", type: "bool" }
          ]
        },
        {
          name: "logic_app_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "resource_id", type: "string", required: true },
            { name: "callback_url", type: "string", required: true },
            { name: "use_common_alert_schema", type: "bool" }
          ]
        },
        {
          name: "arm_role_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "role_id", type: "string", required: true },
            { name: "use_common_alert_schema", type: "bool" }
          ]
        },
        {
          name: "event_hub_receiver",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "event_hub_name", type: "string" },
            { name: "event_hub_namespace", type: "string" },
            { name: "subscription_id", type: "string" },
            { name: "tenant_id", type: "string" },
            { name: "use_common_alert_schema", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Action group ID" }
    ]
  },
  {
    id: "monitor_metric_alert",
    name: "Monitor Metric Alert",
    description: "Azure Monitor metric alert",
    terraform_resource: "azurerm_monitor_metric_alert",
    icon: MANAGEMENT_ICONS['azurerm_monitor_metric_alert'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Alert name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "scopes", type: "list", description: "Resource scopes" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "auto_mitigate", type: "bool", description: "Auto mitigate", default: true },
        { name: "frequency", type: "string", description: "Evaluation frequency", default: "PT1M" },
        { name: "severity", type: "number", description: "Severity (0-4)", default: 3 },
        { name: "target_resource_type", type: "string", description: "Target resource type" },
        { name: "target_resource_location", type: "string", description: "Target resource location" },
        { name: "window_size", type: "string", description: "Evaluation window", default: "PT5M" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "criteria",
          required: false,
          multiple: true,
          attributes: [
            { name: "metric_namespace", type: "string", required: true },
            { name: "metric_name", type: "string", required: true },
            { name: "aggregation", type: "string", required: true, options: ["Average", "Count", "Minimum", "Maximum", "Total"] },
            { name: "operator", type: "string", required: true, options: ["Equals", "GreaterThan", "GreaterThanOrEqual", "LessThan", "LessThanOrEqual", "NotEquals"] },
            { name: "threshold", type: "number", required: true },
            { name: "skip_metric_validation", type: "bool" }
          ],
          blocks: [
            {
              name: "dimension",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "operator", type: "string", required: true, options: ["Include", "Exclude", "StartsWith"] },
                { name: "values", type: "list", required: true }
              ]
            }
          ]
        },
        {
          name: "dynamic_criteria",
          required: false,
          attributes: [
            { name: "metric_namespace", type: "string", required: true },
            { name: "metric_name", type: "string", required: true },
            { name: "aggregation", type: "string", required: true },
            { name: "operator", type: "string", required: true, options: ["LessThan", "GreaterThan", "GreaterOrLessThan"] },
            { name: "alert_sensitivity", type: "string", required: true, options: ["Low", "Medium", "High"] },
            { name: "evaluation_total_count", type: "number" },
            { name: "evaluation_failure_count", type: "number" },
            { name: "ignore_data_before", type: "string" },
            { name: "skip_metric_validation", type: "bool" }
          ],
          blocks: [
            {
              name: "dimension",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "operator", type: "string", required: true },
                { name: "values", type: "list", required: true }
              ]
            }
          ]
        },
        {
          name: "application_insights_web_test_location_availability_criteria",
          required: false,
          attributes: [
            { name: "web_test_id", type: "string", required: true },
            { name: "component_id", type: "string", required: true },
            { name: "failed_location_count", type: "number", required: true }
          ]
        },
        {
          name: "action",
          required: false,
          multiple: true,
          attributes: [
            { name: "action_group_id", type: "string", required: true },
            { name: "webhook_properties", type: "map" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Alert ID" }
    ]
  },
  {
    id: "monitor_diagnostic_setting",
    name: "Diagnostic Setting",
    description: "Azure Monitor diagnostic setting",
    terraform_resource: "azurerm_monitor_diagnostic_setting",
    icon: MANAGEMENT_ICONS['azurerm_monitor_diagnostic_setting'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Setting name" },
        { name: "target_resource_id", type: "string", description: "Target resource ID" }
      ],
      optional: [
        { name: "eventhub_name", type: "string", description: "Event Hub name" },
        { name: "eventhub_authorization_rule_id", type: "string", description: "Event Hub auth rule ID" },
        { name: "log_analytics_workspace_id", type: "string", description: "Log Analytics workspace ID" },
        { name: "log_analytics_destination_type", type: "string", description: "Log Analytics destination", options: ["Dedicated", "AzureDiagnostics"] },
        { name: "storage_account_id", type: "string", description: "Storage account ID" },
        { name: "partner_solution_id", type: "string", description: "Partner solution ID" }
      ],
      blocks: [
        {
          name: "enabled_log",
          required: false,
          multiple: true,
          attributes: [
            { name: "category", type: "string" },
            { name: "category_group", type: "string" }
          ],
          blocks: [
            {
              name: "retention_policy",
              attributes: [
                { name: "enabled", type: "bool", required: true },
                { name: "days", type: "number" }
              ]
            }
          ]
        },
        {
          name: "metric",
          required: false,
          multiple: true,
          attributes: [
            { name: "category", type: "string", required: true },
            { name: "enabled", type: "bool", default: true }
          ],
          blocks: [
            {
              name: "retention_policy",
              attributes: [
                { name: "enabled", type: "bool", required: true },
                { name: "days", type: "number" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Diagnostic setting ID" }
    ]
  },
  {
    id: "policy_definition",
    name: "Policy Definition",
    description: "Azure Policy definition",
    terraform_resource: "azurerm_policy_definition",
    icon: MANAGEMENT_ICONS['azurerm_policy_definition'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Policy name" },
        { name: "policy_type", type: "string", description: "Policy type", options: ["BuiltIn", "Custom", "NotSpecified", "Static"] },
        { name: "mode", type: "string", description: "Policy mode", options: ["All", "Indexed", "Microsoft.ContainerService.Data", "Microsoft.KeyVault.Data", "Microsoft.Kubernetes.Data", "Microsoft.Network.Data"] },
        { name: "display_name", type: "string", description: "Display name" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "management_group_id", type: "string", description: "Management group ID" },
        { name: "policy_rule", type: "string", description: "Policy rule JSON" },
        { name: "metadata", type: "string", description: "Metadata JSON" },
        { name: "parameters", type: "string", description: "Parameters JSON" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Policy definition ID" },
      { name: "role_definition_ids", type: "list", description: "Role definition IDs" }
    ]
  },
  {
    id: "policy_assignment",
    name: "Policy Assignment",
    description: "Azure Policy assignment",
    terraform_resource: "azurerm_resource_group_policy_assignment",
    icon: MANAGEMENT_ICONS['azurerm_resource_group_policy_assignment'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Assignment name" },
        { name: "resource_group_id", type: "string", description: "Resource group ID" },
        { name: "policy_definition_id", type: "string", description: "Policy definition ID" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "display_name", type: "string", description: "Display name" },
        { name: "enforce", type: "bool", description: "Enforce", default: true },
        { name: "location", type: "string", description: "Location for managed identity" },
        { name: "metadata", type: "string", description: "Metadata JSON" },
        { name: "not_scopes", type: "list", description: "Excluded scopes" },
        { name: "parameters", type: "string", description: "Parameters JSON" }
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
          name: "non_compliance_message",
          required: false,
          multiple: true,
          attributes: [
            { name: "content", type: "string", required: true },
            { name: "policy_definition_reference_id", type: "string" }
          ]
        },
        {
          name: "overrides",
          required: false,
          multiple: true,
          attributes: [
            { name: "value", type: "string", required: true }
          ],
          blocks: [
            {
              name: "selectors",
              multiple: true,
              attributes: [
                { name: "in", type: "list" },
                { name: "not_in", type: "list" }
              ]
            }
          ]
        },
        {
          name: "resource_selectors",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string" }
          ],
          blocks: [
            {
              name: "selectors",
              required: true,
              multiple: true,
              attributes: [
                { name: "kind", type: "string", required: true },
                { name: "in", type: "list" },
                { name: "not_in", type: "list" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Assignment ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "automation_account",
    name: "Automation Account",
    description: "Azure Automation account",
    terraform_resource: "azurerm_automation_account",
    icon: MANAGEMENT_ICONS['azurerm_automation_account'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Account name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku_name", type: "string", description: "SKU name", options: ["Basic", "Free"] }
      ],
      optional: [
        { name: "local_authentication_enabled", type: "bool", description: "Local auth", default: true },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
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
            { name: "key_vault_key_id", type: "string", required: true },
            { name: "user_assigned_identity_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Account ID" },
      { name: "dsc_server_endpoint", type: "string", description: "DSC server endpoint" },
      { name: "dsc_primary_access_key", type: "string", description: "DSC primary key", sensitive: true },
      { name: "dsc_secondary_access_key", type: "string", description: "DSC secondary key", sensitive: true },
      { name: "hybrid_service_url", type: "string", description: "Hybrid worker URL" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  }
];

// All management terraform resources
export const MANAGEMENT_TERRAFORM_RESOURCES = MANAGEMENT_SERVICES.map(s => s.terraform_resource);

// Get management service by terraform resource name
export function getManagementServiceByTerraformResource(terraformResource: string): ManagementServiceDefinition | undefined {
  return MANAGEMENT_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get management service by ID
export function getManagementServiceById(id: string): ManagementServiceDefinition | undefined {
  return MANAGEMENT_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a management resource
export function isManagementResource(terraformResource: string): boolean {
  return MANAGEMENT_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get management icon
export function getManagementIcon(terraformResource: string): string | undefined {
  return MANAGEMENT_ICONS[terraformResource];
}






