/**
 * Azure Machine Learning Services Data - Complete definitions from machine-learning.json
 * This file contains ALL 6 machine-learning services with ALL their properties
 * 
 * Services included:
 * 1. Machine Learning Workspace (azurerm_machine_learning_workspace)
 * 2. ML Compute Cluster (azurerm_machine_learning_compute_cluster)
 * 3. ML Compute Instance (azurerm_machine_learning_compute_instance)
 * 4. Cognitive Services Account (azurerm_cognitive_account)
 * 5. Azure Cognitive Search (azurerm_search_service)
 * 6. Azure Bot (azurerm_bot_service_azure_bot)
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

// Azure Machine Learning service icon mappings - using Azure Public Service Icons
export const MACHINE_LEARNING_ICONS: Record<string, string> = {
  'azurerm_machine_learning_workspace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10166-icon-service-Machine-Learning.svg',
  'azurerm_machine_learning_compute_cluster': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10166-icon-service-Machine-Learning.svg',
  'azurerm_machine_learning_compute_instance': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10166-icon-service-Machine-Learning.svg',
  'azurerm_cognitive_account': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10162-icon-service-Cognitive-Services.svg',
  'azurerm_search_service': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10044-icon-service-Cognitive-Search.svg',
  'azurerm_bot_service_azure_bot': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/ai + machine learning/10165-icon-service-Bot-Services.svg',
};

// Machine Learning service definition interface
export interface MachineLearningServiceDefinition {
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

// Complete machine-learning services data from machine-learning.json
export const MACHINE_LEARNING_SERVICES: MachineLearningServiceDefinition[] = [
  {
    id: "machine_learning_workspace",
    name: "Machine Learning Workspace",
    description: "Azure Machine Learning workspace",
    terraform_resource: "azurerm_machine_learning_workspace",
    icon: MACHINE_LEARNING_ICONS['azurerm_machine_learning_workspace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Workspace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "application_insights_id", type: "string", description: "Application Insights ID" },
        { name: "key_vault_id", type: "string", description: "Key Vault ID" },
        { name: "storage_account_id", type: "string", description: "Storage account ID" }
      ],
      optional: [
        { name: "container_registry_id", type: "string", description: "Container registry ID" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "image_build_compute_name", type: "string", description: "Image build compute" },
        { name: "description", type: "string", description: "Description" },
        { name: "friendly_name", type: "string", description: "Friendly name" },
        { name: "high_business_impact", type: "bool", description: "High business impact" },
        { name: "primary_user_assigned_identity", type: "string", description: "Primary user identity" },
        { name: "v1_legacy_mode_enabled", type: "bool", description: "V1 legacy mode" },
        { name: "sku_name", type: "string", description: "SKU", default: "Basic" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: true,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "identity_ids", type: "list" }
          ]
        },
        {
          name: "encryption",
          required: false,
          attributes: [
            { name: "key_vault_id", type: "string", required: true },
            { name: "key_id", type: "string", required: true },
            { name: "user_assigned_identity_id", type: "string" }
          ]
        },
        {
          name: "managed_network",
          required: false,
          attributes: [
            { name: "isolation_mode", type: "string", options: ["AllowInternetOutbound", "AllowOnlyApprovedOutbound", "Disabled"] }
          ]
        },
        {
          name: "feature_store",
          required: false,
          attributes: [
            { name: "computer_spark_runtime_version", type: "string" },
            { name: "offline_connection_name", type: "string" },
            { name: "online_connection_name", type: "string" }
          ]
        },
        {
          name: "serverless_compute",
          required: false,
          attributes: [
            { name: "subnet_id", type: "string" },
            { name: "public_ip_enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Workspace ID" },
      { name: "discovery_url", type: "string", description: "Discovery URL" },
      { name: "workspace_id", type: "string", description: "Workspace GUID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "machine_learning_compute_cluster",
    name: "ML Compute Cluster",
    description: "Azure ML compute cluster",
    terraform_resource: "azurerm_machine_learning_compute_cluster",
    icon: MACHINE_LEARNING_ICONS['azurerm_machine_learning_compute_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" },
        { name: "machine_learning_workspace_id", type: "string", description: "Workspace ID" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "vm_priority", type: "string", description: "VM priority", options: ["Dedicated", "LowPriority"] },
        { name: "vm_size", type: "string", description: "VM size" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "node_public_ip_enabled", type: "bool", description: "Node public IP", default: true },
        { name: "subnet_resource_id", type: "string", description: "Subnet ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "scale_settings",
          required: true,
          attributes: [
            { name: "max_node_count", type: "number", required: true },
            { name: "min_node_count", type: "number", required: true, default: 0 },
            { name: "scale_down_nodes_after_idle_duration", type: "string", required: true }
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
          name: "ssh",
          required: false,
          attributes: [
            { name: "admin_username", type: "string", required: true },
            { name: "admin_password", type: "string", sensitive: true },
            { name: "key_value", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "machine_learning_compute_instance",
    name: "ML Compute Instance",
    description: "Azure ML compute instance",
    terraform_resource: "azurerm_machine_learning_compute_instance",
    icon: MACHINE_LEARNING_ICONS['azurerm_machine_learning_compute_instance'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Instance name" },
        { name: "machine_learning_workspace_id", type: "string", description: "Workspace ID" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "virtual_machine_size", type: "string", description: "VM size" }
      ],
      optional: [
        { name: "authorization_type", type: "string", description: "Authorization type", options: ["personal"] },
        { name: "description", type: "string", description: "Description" },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "node_public_ip_enabled", type: "bool", description: "Node public IP", default: true },
        { name: "subnet_resource_id", type: "string", description: "Subnet ID" },
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
          name: "assign_to_user",
          required: false,
          attributes: [
            { name: "object_id", type: "string" },
            { name: "tenant_id", type: "string" }
          ]
        },
        {
          name: "ssh",
          required: false,
          attributes: [
            { name: "public_key", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "identity", type: "list", description: "Managed identity" },
      { name: "ssh", type: "list", description: "SSH info" }
    ]
  },
  {
    id: "cognitive_account",
    name: "Cognitive Services Account",
    description: "Azure Cognitive Services account",
    terraform_resource: "azurerm_cognitive_account",
    icon: MACHINE_LEARNING_ICONS['azurerm_cognitive_account'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Account name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "kind", type: "string", description: "Service kind", options: ["Academic", "AnomalyDetector", "Bing.Autosuggest", "Bing.Autosuggest.v7", "Bing.CustomSearch", "Bing.EntitySearch", "Bing.Search", "Bing.Search.v7", "Bing.SpellCheck", "Bing.SpellCheck.v7", "CognitiveServices", "ComputerVision", "ContentModerator", "ContentSafety", "CustomSpeech", "CustomVision.Prediction", "CustomVision.Training", "Emotion", "Face", "FormRecognizer", "ImmersiveReader", "LUIS", "LUIS.Authoring", "MetricsAdvisor", "OpenAI", "Personalizer", "QnAMaker", "Recommendations", "SpeakerRecognition", "Speech", "SpeechServices", "SpeechTranslation", "TextAnalytics", "TextTranslation", "WebLM"] },
        { name: "sku_name", type: "string", description: "SKU name" }
      ],
      optional: [
        { name: "custom_subdomain_name", type: "string", description: "Custom subdomain" },
        { name: "dynamic_throttling_enabled", type: "bool", description: "Dynamic throttling" },
        { name: "fqdns", type: "list", description: "FQDNs" },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "metrics_advisor_aad_client_id", type: "string", description: "Metrics Advisor AAD client ID" },
        { name: "metrics_advisor_aad_tenant_id", type: "string", description: "Metrics Advisor AAD tenant ID" },
        { name: "metrics_advisor_super_user_name", type: "string", description: "Metrics Advisor super user" },
        { name: "metrics_advisor_website_name", type: "string", description: "Metrics Advisor website" },
        { name: "outbound_network_access_restricted", type: "bool", description: "Restrict outbound access" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "qna_runtime_endpoint", type: "string", description: "QnA runtime endpoint" },
        { name: "custom_question_answering_search_service_id", type: "string", description: "QA search service ID" },
        { name: "custom_question_answering_search_service_key", type: "string", description: "QA search service key", sensitive: true },
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
          name: "customer_managed_key",
          required: false,
          attributes: [
            { name: "key_vault_key_id", type: "string", required: true },
            { name: "identity_client_id", type: "string" }
          ]
        },
        {
          name: "network_acls",
          required: false,
          attributes: [
            { name: "default_action", type: "string", required: true, options: ["Allow", "Deny"] },
            { name: "ip_rules", type: "list" }
          ],
          blocks: [
            {
              name: "virtual_network_rules",
              multiple: true,
              attributes: [
                { name: "subnet_id", type: "string", required: true },
                { name: "ignore_missing_vnet_service_endpoint", type: "bool" }
              ]
            }
          ]
        },
        {
          name: "storage",
          required: false,
          multiple: true,
          attributes: [
            { name: "storage_account_id", type: "string", required: true },
            { name: "identity_client_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Account ID" },
      { name: "endpoint", type: "string", description: "Endpoint" },
      { name: "primary_access_key", type: "string", description: "Primary key", sensitive: true },
      { name: "secondary_access_key", type: "string", description: "Secondary key", sensitive: true },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "search_service",
    name: "Azure Cognitive Search",
    description: "Azure Cognitive Search service",
    terraform_resource: "azurerm_search_service",
    icon: MACHINE_LEARNING_ICONS['azurerm_search_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Service name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "SKU", options: ["free", "basic", "standard", "standard2", "standard3", "storage_optimized_l1", "storage_optimized_l2"] }
      ],
      optional: [
        { name: "replica_count", type: "number", description: "Replica count", default: 1 },
        { name: "partition_count", type: "number", description: "Partition count", default: 1 },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "allowed_ips", type: "list", description: "Allowed IPs" },
        { name: "customer_managed_key_enforcement_enabled", type: "bool", description: "CMK enforcement" },
        { name: "hosting_mode", type: "string", description: "Hosting mode", options: ["default", "highDensity"], default: "default" },
        { name: "local_authentication_enabled", type: "bool", description: "Local auth", default: true },
        { name: "authentication_failure_mode", type: "string", description: "Auth failure mode", options: ["http401WithBearerChallenge", "http403"] },
        { name: "semantic_search_sku", type: "string", description: "Semantic search SKU", options: ["free", "standard"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "primary_key", type: "string", description: "Primary admin key", sensitive: true },
      { name: "secondary_key", type: "string", description: "Secondary admin key", sensitive: true },
      { name: "query_keys", type: "list", description: "Query keys" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "bot_service_azure_bot",
    name: "Azure Bot",
    description: "Azure Bot Service",
    terraform_resource: "azurerm_bot_service_azure_bot",
    icon: MACHINE_LEARNING_ICONS['azurerm_bot_service_azure_bot'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Bot name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "microsoft_app_id", type: "string", description: "Microsoft App ID" },
        { name: "sku", type: "string", description: "SKU", options: ["F0", "S1"] }
      ],
      optional: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "endpoint", type: "string", description: "Messaging endpoint" },
        { name: "developer_app_insights_key", type: "string", description: "App Insights key" },
        { name: "developer_app_insights_api_key", type: "string", description: "App Insights API key" },
        { name: "developer_app_insights_application_id", type: "string", description: "App Insights app ID" },
        { name: "icon_url", type: "string", description: "Icon URL" },
        { name: "local_authentication_enabled", type: "bool", description: "Local auth", default: true },
        { name: "luis_app_ids", type: "list", description: "LUIS app IDs" },
        { name: "luis_key", type: "string", description: "LUIS key" },
        { name: "microsoft_app_msi_id", type: "string", description: "MSI ID" },
        { name: "microsoft_app_tenant_id", type: "string", description: "Tenant ID" },
        { name: "microsoft_app_type", type: "string", description: "App type", options: ["SingleTenant", "MultiTenant", "UserAssignedMSI"] },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "streaming_endpoint_enabled", type: "bool", description: "Streaming endpoint" },
        { name: "cmk_key_vault_key_url", type: "string", description: "CMK key URL" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bot ID" }
    ]
  }
];

// All machine-learning terraform resources
export const MACHINE_LEARNING_TERRAFORM_RESOURCES = MACHINE_LEARNING_SERVICES.map(s => s.terraform_resource);

// Get machine-learning service by terraform resource name
export function getMachineLearningServiceByTerraformResource(terraformResource: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get machine-learning service by ID
export function getMachineLearningServiceById(id: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a machine-learning resource
export function isMachineLearningResource(terraformResource: string): boolean {
  return MACHINE_LEARNING_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get machine-learning icon
export function getMachineLearningIcon(terraformResource: string): string | undefined {
  return MACHINE_LEARNING_ICONS[terraformResource];
}

