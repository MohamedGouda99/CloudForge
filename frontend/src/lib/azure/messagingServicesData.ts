/**
 * Azure Messaging Services Data - Complete definitions from messaging.json
 * This file contains ALL 9 messaging services with ALL their properties
 * 
 * Services included:
 * 1. Service Bus Namespace (azurerm_servicebus_namespace)
 * 2. Service Bus Queue (azurerm_servicebus_queue)
 * 3. Service Bus Topic (azurerm_servicebus_topic)
 * 4. Service Bus Subscription (azurerm_servicebus_subscription)
 * 5. Event Hubs Namespace (azurerm_eventhub_namespace)
 * 6. Event Hub (azurerm_eventhub)
 * 7. Event Grid Topic (azurerm_eventgrid_topic)
 * 8. Logic App (azurerm_logic_app_workflow)
 * 9. API Management (azurerm_api_management)
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

// Azure Messaging service icon mappings - using Azure Public Service Icons
export const MESSAGING_ICONS: Record<string, string> = {
  'azurerm_servicebus_namespace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10836-icon-service-Azure-Service-Bus.svg',
  'azurerm_servicebus_queue': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10836-icon-service-Azure-Service-Bus.svg',
  'azurerm_servicebus_topic': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10836-icon-service-Azure-Service-Bus.svg',
  'azurerm_servicebus_subscription': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10836-icon-service-Azure-Service-Bus.svg',
  'azurerm_eventhub_namespace': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00039-icon-service-Event-Hubs.svg',
  'azurerm_eventhub': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/analytics/00039-icon-service-Event-Hubs.svg',
  'azurerm_eventgrid_topic': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10206-icon-service-Event-Grid-Topics.svg',
  'azurerm_logic_app_workflow': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/02631-icon-service-Logic-Apps.svg',
  'azurerm_api_management': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/integration/10042-icon-service-API-Management-Services.svg',
};

// Messaging service definition interface
export interface MessagingServiceDefinition {
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

// Complete messaging services data from messaging.json
export const MESSAGING_SERVICES: MessagingServiceDefinition[] = [
  {
    id: "servicebus_namespace",
    name: "Service Bus Namespace",
    description: "Azure Service Bus namespace",
    terraform_resource: "azurerm_servicebus_namespace",
    icon: MESSAGING_ICONS['azurerm_servicebus_namespace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Namespace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "SKU tier", options: ["Basic", "Standard", "Premium"] }
      ],
      optional: [
        { name: "capacity", type: "number", description: "Messaging units (Premium)" },
        { name: "premium_messaging_partitions", type: "number", description: "Premium partitions" },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "minimum_tls_version", type: "string", description: "Min TLS version", default: "1.2" },
        { name: "zone_redundant", type: "bool", description: "Zone redundant" },
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
            { name: "identity_id", type: "string", required: true },
            { name: "infrastructure_encryption_enabled", type: "bool" }
          ]
        },
        {
          name: "network_rule_set",
          required: false,
          attributes: [
            { name: "default_action", type: "string", options: ["Allow", "Deny"] },
            { name: "public_network_access_enabled", type: "bool" },
            { name: "trusted_services_allowed", type: "bool" },
            { name: "ip_rules", type: "list" }
          ],
          blocks: [
            {
              name: "network_rules",
              multiple: true,
              attributes: [
                { name: "subnet_id", type: "string", required: true },
                { name: "ignore_missing_vnet_service_endpoint", type: "bool" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Namespace ID" },
      { name: "endpoint", type: "string", description: "Endpoint URL" },
      { name: "default_primary_connection_string", type: "string", sensitive: true },
      { name: "default_secondary_connection_string", type: "string", sensitive: true },
      { name: "default_primary_key", type: "string", sensitive: true },
      { name: "default_secondary_key", type: "string", sensitive: true }
    ]
  },
  {
    id: "servicebus_queue",
    name: "Service Bus Queue",
    description: "Azure Service Bus queue",
    terraform_resource: "azurerm_servicebus_queue",
    icon: MESSAGING_ICONS['azurerm_servicebus_queue'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Queue name" },
        { name: "namespace_id", type: "string", description: "Namespace ID" }
      ],
      optional: [
        { name: "lock_duration", type: "string", description: "Lock duration", default: "PT1M" },
        { name: "max_message_size_in_kilobytes", type: "number", description: "Max message size KB" },
        { name: "max_size_in_megabytes", type: "number", description: "Max queue size MB", default: 1024 },
        { name: "requires_duplicate_detection", type: "bool", description: "Duplicate detection" },
        { name: "requires_session", type: "bool", description: "Requires session" },
        { name: "default_message_ttl", type: "string", description: "Default message TTL" },
        { name: "dead_lettering_on_message_expiration", type: "bool", description: "Dead letter on expiry" },
        { name: "duplicate_detection_history_time_window", type: "string", description: "Duplicate history window", default: "PT10M" },
        { name: "max_delivery_count", type: "number", description: "Max delivery count", default: 10 },
        { name: "status", type: "string", description: "Status", options: ["Active", "Creating", "Deleting", "Disabled", "ReceiveDisabled", "Renaming", "SendDisabled", "Unknown"], default: "Active" },
        { name: "enable_batched_operations", type: "bool", description: "Batched operations", default: true },
        { name: "auto_delete_on_idle", type: "string", description: "Auto delete on idle" },
        { name: "enable_partitioning", type: "bool", description: "Partitioning" },
        { name: "enable_express", type: "bool", description: "Express" },
        { name: "forward_to", type: "string", description: "Forward to queue/topic" },
        { name: "forward_dead_lettered_messages_to", type: "string", description: "Forward dead letters to" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Queue ID" }
    ]
  },
  {
    id: "servicebus_topic",
    name: "Service Bus Topic",
    description: "Azure Service Bus topic",
    terraform_resource: "azurerm_servicebus_topic",
    icon: MESSAGING_ICONS['azurerm_servicebus_topic'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Topic name" },
        { name: "namespace_id", type: "string", description: "Namespace ID" }
      ],
      optional: [
        { name: "status", type: "string", description: "Status", options: ["Active", "Disabled", "SendDisabled"], default: "Active" },
        { name: "max_message_size_in_kilobytes", type: "number", description: "Max message size KB" },
        { name: "max_size_in_megabytes", type: "number", description: "Max topic size MB", default: 5120 },
        { name: "requires_duplicate_detection", type: "bool", description: "Duplicate detection" },
        { name: "default_message_ttl", type: "string", description: "Default message TTL" },
        { name: "duplicate_detection_history_time_window", type: "string", description: "Duplicate history window", default: "PT10M" },
        { name: "enable_batched_operations", type: "bool", description: "Batched operations", default: true },
        { name: "auto_delete_on_idle", type: "string", description: "Auto delete on idle" },
        { name: "enable_partitioning", type: "bool", description: "Partitioning" },
        { name: "enable_express", type: "bool", description: "Express" },
        { name: "support_ordering", type: "bool", description: "Support ordering" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Topic ID" }
    ]
  },
  {
    id: "servicebus_subscription",
    name: "Service Bus Subscription",
    description: "Azure Service Bus subscription",
    terraform_resource: "azurerm_servicebus_subscription",
    icon: MESSAGING_ICONS['azurerm_servicebus_subscription'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Subscription name" },
        { name: "topic_id", type: "string", description: "Topic ID" },
        { name: "max_delivery_count", type: "number", description: "Max delivery count" }
      ],
      optional: [
        { name: "status", type: "string", description: "Status", options: ["Active", "Disabled", "ReceiveDisabled"], default: "Active" },
        { name: "lock_duration", type: "string", description: "Lock duration", default: "PT1M" },
        { name: "requires_session", type: "bool", description: "Requires session" },
        { name: "default_message_ttl", type: "string", description: "Default message TTL" },
        { name: "auto_delete_on_idle", type: "string", description: "Auto delete on idle" },
        { name: "dead_lettering_on_message_expiration", type: "bool", description: "Dead letter on expiry" },
        { name: "dead_lettering_on_filter_evaluation_error", type: "bool", description: "Dead letter on filter error", default: true },
        { name: "enable_batched_operations", type: "bool", description: "Batched operations", default: true },
        { name: "forward_to", type: "string", description: "Forward to" },
        { name: "forward_dead_lettered_messages_to", type: "string", description: "Forward dead letters to" },
        { name: "client_scoped_subscription_enabled", type: "bool", description: "Client scoped subscription" }
      ],
      blocks: [
        {
          name: "client_scoped_subscription",
          required: false,
          attributes: [
            { name: "client_id", type: "string" },
            { name: "is_client_scoped_subscription_shareable", type: "bool" },
            { name: "is_client_scoped_subscription_durable", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subscription ID" }
    ]
  },
  {
    id: "eventhub_namespace",
    name: "Event Hubs Namespace",
    description: "Azure Event Hubs namespace",
    terraform_resource: "azurerm_eventhub_namespace",
    icon: MESSAGING_ICONS['azurerm_eventhub_namespace'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Namespace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "SKU tier", options: ["Basic", "Standard", "Premium"] }
      ],
      optional: [
        { name: "capacity", type: "number", description: "Throughput units", default: 1 },
        { name: "auto_inflate_enabled", type: "bool", description: "Auto inflate" },
        { name: "dedicated_cluster_id", type: "string", description: "Dedicated cluster ID" },
        { name: "maximum_throughput_units", type: "number", description: "Max throughput units" },
        { name: "zone_redundant", type: "bool", description: "Zone redundant" },
        { name: "local_authentication_enabled", type: "bool", description: "Local auth", default: true },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "minimum_tls_version", type: "string", description: "Min TLS version", default: "1.2" },
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
          name: "network_rulesets",
          required: false,
          attributes: [
            { name: "default_action", type: "string", options: ["Allow", "Deny"] },
            { name: "public_network_access_enabled", type: "bool", default: true },
            { name: "trusted_service_access_enabled", type: "bool" },
            { name: "ip_rule", type: "list" }
          ],
          blocks: [
            {
              name: "virtual_network_rule",
              multiple: true,
              attributes: [
                { name: "subnet_id", type: "string", required: true },
                { name: "ignore_missing_virtual_network_service_endpoint", type: "bool" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Namespace ID" },
      { name: "default_primary_connection_string", type: "string", sensitive: true },
      { name: "default_secondary_connection_string", type: "string", sensitive: true },
      { name: "default_primary_key", type: "string", sensitive: true },
      { name: "default_secondary_key", type: "string", sensitive: true }
    ]
  },
  {
    id: "eventhub",
    name: "Event Hub",
    description: "Azure Event Hub",
    terraform_resource: "azurerm_eventhub",
    icon: MESSAGING_ICONS['azurerm_eventhub'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Event Hub name" },
        { name: "namespace_name", type: "string", description: "Namespace name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "partition_count", type: "number", description: "Partition count" },
        { name: "message_retention", type: "number", description: "Message retention days" }
      ],
      optional: [
        { name: "status", type: "string", description: "Status", options: ["Active", "Disabled", "SendDisabled"], default: "Active" }
      ],
      blocks: [
        {
          name: "capture_description",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "encoding", type: "string", required: true, options: ["Avro", "AvroDeflate"] },
            { name: "interval_in_seconds", type: "number" },
            { name: "size_limit_in_bytes", type: "number" },
            { name: "skip_empty_archives", type: "bool" }
          ],
          blocks: [
            {
              name: "destination",
              required: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "archive_name_format", type: "string", required: true },
                { name: "blob_container_name", type: "string", required: true },
                { name: "storage_account_id", type: "string", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Event Hub ID" },
      { name: "partition_ids", type: "list", description: "Partition IDs" }
    ]
  },
  {
    id: "eventgrid_topic",
    name: "Event Grid Topic",
    description: "Azure Event Grid topic",
    terraform_resource: "azurerm_eventgrid_topic",
    icon: MESSAGING_ICONS['azurerm_eventgrid_topic'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Topic name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "input_schema", type: "string", description: "Input schema", options: ["CloudEventSchemaV1_0", "CustomEventSchema", "EventGridSchema"], default: "EventGridSchema" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "local_auth_enabled", type: "bool", description: "Local auth", default: true },
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
          name: "input_mapping_fields",
          required: false,
          attributes: [
            { name: "id", type: "string" },
            { name: "topic", type: "string" },
            { name: "event_type", type: "string" },
            { name: "event_time", type: "string" },
            { name: "data_version", type: "string" },
            { name: "subject", type: "string" }
          ]
        },
        {
          name: "input_mapping_default_values",
          required: false,
          attributes: [
            { name: "event_type", type: "string" },
            { name: "data_version", type: "string" },
            { name: "subject", type: "string" }
          ]
        },
        {
          name: "inbound_ip_rule",
          required: false,
          multiple: true,
          attributes: [
            { name: "ip_mask", type: "string", required: true },
            { name: "action", type: "string", options: ["Allow"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Topic ID" },
      { name: "endpoint", type: "string", description: "Topic endpoint" },
      { name: "primary_access_key", type: "string", sensitive: true },
      { name: "secondary_access_key", type: "string", sensitive: true }
    ]
  },
  {
    id: "logic_app_workflow",
    name: "Logic App",
    description: "Azure Logic App workflow",
    terraform_resource: "azurerm_logic_app_workflow",
    icon: MESSAGING_ICONS['azurerm_logic_app_workflow'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Logic App name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "integration_service_environment_id", type: "string", description: "ISE ID" },
        { name: "logic_app_integration_account_id", type: "string", description: "Integration account ID" },
        { name: "workflow_schema", type: "string", description: "Workflow schema" },
        { name: "workflow_version", type: "string", description: "Workflow version" },
        { name: "parameters", type: "map", description: "Workflow parameters" },
        { name: "workflow_parameters", type: "map", description: "Workflow parameters definition" },
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
          name: "access_control",
          required: false,
          blocks: [
            {
              name: "action",
              blocks: [
                {
                  name: "allowed_caller_ip_address_range",
                  multiple: true,
                  attributes: [
                    { name: "address_range", type: "string", required: true }
                  ]
                }
              ]
            },
            {
              name: "content",
              blocks: [
                {
                  name: "allowed_caller_ip_address_range",
                  multiple: true,
                  attributes: [
                    { name: "address_range", type: "string", required: true }
                  ]
                }
              ]
            },
            {
              name: "trigger",
              blocks: [
                {
                  name: "allowed_caller_ip_address_range",
                  multiple: true,
                  attributes: [
                    { name: "address_range", type: "string", required: true }
                  ]
                },
                {
                  name: "open_authentication_policy",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true }
                  ],
                  blocks: [
                    {
                      name: "claim",
                      required: true,
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string", required: true },
                        { name: "value", type: "string", required: true }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "workflow_management",
              blocks: [
                {
                  name: "allowed_caller_ip_address_range",
                  multiple: true,
                  attributes: [
                    { name: "address_range", type: "string", required: true }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Logic App ID" },
      { name: "access_endpoint", type: "string", description: "Access endpoint" },
      { name: "connector_endpoint_ip_addresses", type: "list", description: "Connector IPs" },
      { name: "connector_outbound_ip_addresses", type: "list", description: "Connector outbound IPs" },
      { name: "workflow_endpoint_ip_addresses", type: "list", description: "Workflow IPs" },
      { name: "workflow_outbound_ip_addresses", type: "list", description: "Workflow outbound IPs" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "api_management",
    name: "API Management",
    description: "Azure API Management service",
    terraform_resource: "azurerm_api_management",
    icon: MESSAGING_ICONS['azurerm_api_management'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "APIM name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "publisher_name", type: "string", description: "Publisher name" },
        { name: "publisher_email", type: "string", description: "Publisher email" },
        { name: "sku_name", type: "string", description: "SKU (tier_capacity)", options: ["Consumption_0", "Developer_1", "Basic_1", "Basic_2", "Standard_1", "Standard_2", "Premium_1", "Premium_2"] }
      ],
      optional: [
        { name: "client_certificate_enabled", type: "bool", description: "Client certificate" },
        { name: "gateway_disabled", type: "bool", description: "Disable gateway" },
        { name: "min_api_version", type: "string", description: "Min API version" },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "notification_sender_email", type: "string", description: "Notification sender email" },
        { name: "public_ip_address_id", type: "string", description: "Public IP ID" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "virtual_network_type", type: "string", description: "VNet type", options: ["None", "External", "Internal"], default: "None" },
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
          name: "additional_location",
          required: false,
          multiple: true,
          attributes: [
            { name: "location", type: "string", required: true },
            { name: "capacity", type: "number" },
            { name: "zones", type: "list" },
            { name: "public_ip_address_id", type: "string" },
            { name: "gateway_disabled", type: "bool" }
          ],
          blocks: [
            {
              name: "virtual_network_configuration",
              attributes: [
                { name: "subnet_id", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "certificate",
          required: false,
          multiple: true,
          attributes: [
            { name: "encoded_certificate", type: "string", required: true },
            { name: "store_name", type: "string", required: true, options: ["CertificateAuthority", "Root"] },
            { name: "certificate_password", type: "string", sensitive: true }
          ]
        },
        {
          name: "delegation",
          required: false,
          attributes: [
            { name: "subscriptions_enabled", type: "bool" },
            { name: "user_registration_enabled", type: "bool" },
            { name: "url", type: "string" },
            { name: "validation_key", type: "string" }
          ]
        },
        {
          name: "hostname_configuration",
          required: false,
          blocks: [
            {
              name: "management",
              multiple: true,
              attributes: [
                { name: "host_name", type: "string", required: true },
                { name: "key_vault_id", type: "string" },
                { name: "certificate", type: "string" },
                { name: "certificate_password", type: "string", sensitive: true },
                { name: "negotiate_client_certificate", type: "bool" },
                { name: "ssl_keyvault_identity_client_id", type: "string" }
              ]
            },
            {
              name: "portal",
              multiple: true,
              attributes: [
                { name: "host_name", type: "string", required: true },
                { name: "key_vault_id", type: "string" },
                { name: "certificate", type: "string" },
                { name: "certificate_password", type: "string", sensitive: true },
                { name: "negotiate_client_certificate", type: "bool" },
                { name: "ssl_keyvault_identity_client_id", type: "string" }
              ]
            },
            {
              name: "developer_portal",
              multiple: true,
              attributes: [
                { name: "host_name", type: "string", required: true },
                { name: "key_vault_id", type: "string" },
                { name: "certificate", type: "string" },
                { name: "certificate_password", type: "string", sensitive: true },
                { name: "negotiate_client_certificate", type: "bool" },
                { name: "ssl_keyvault_identity_client_id", type: "string" }
              ]
            },
            {
              name: "proxy",
              multiple: true,
              attributes: [
                { name: "host_name", type: "string", required: true },
                { name: "default_ssl_binding", type: "bool" },
                { name: "key_vault_id", type: "string" },
                { name: "certificate", type: "string" },
                { name: "certificate_password", type: "string", sensitive: true },
                { name: "negotiate_client_certificate", type: "bool" },
                { name: "ssl_keyvault_identity_client_id", type: "string" }
              ]
            },
            {
              name: "scm",
              multiple: true,
              attributes: [
                { name: "host_name", type: "string", required: true },
                { name: "key_vault_id", type: "string" },
                { name: "certificate", type: "string" },
                { name: "certificate_password", type: "string", sensitive: true },
                { name: "negotiate_client_certificate", type: "bool" },
                { name: "ssl_keyvault_identity_client_id", type: "string" }
              ]
            }
          ]
        },
        {
          name: "protocols",
          required: false,
          attributes: [
            { name: "enable_http2", type: "bool" }
          ]
        },
        {
          name: "security",
          required: false,
          attributes: [
            { name: "enable_backend_ssl30", type: "bool" },
            { name: "enable_backend_tls10", type: "bool" },
            { name: "enable_backend_tls11", type: "bool" },
            { name: "enable_frontend_ssl30", type: "bool" },
            { name: "enable_frontend_tls10", type: "bool" },
            { name: "enable_frontend_tls11", type: "bool" },
            { name: "tls_ecdhe_ecdsa_with_aes128_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_ecdhe_ecdsa_with_aes256_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_ecdhe_rsa_with_aes128_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_ecdhe_rsa_with_aes256_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes128_cbc_sha256_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes128_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes128_gcm_sha256_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes256_cbc_sha256_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes256_cbc_sha_ciphers_enabled", type: "bool" },
            { name: "tls_rsa_with_aes256_gcm_sha384_ciphers_enabled", type: "bool" },
            { name: "triple_des_ciphers_enabled", type: "bool" }
          ]
        },
        {
          name: "sign_in",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true }
          ]
        },
        {
          name: "sign_up",
          required: false,
          blocks: [
            {
              name: "terms_of_service",
              required: true,
              attributes: [
                { name: "consent_required", type: "bool", required: true },
                { name: "enabled", type: "bool", required: true },
                { name: "text", type: "string" }
              ]
            }
          ]
        },
        {
          name: "tenant_access",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true }
          ]
        },
        {
          name: "virtual_network_configuration",
          required: false,
          attributes: [
            { name: "subnet_id", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "APIM ID" },
      { name: "gateway_url", type: "string", description: "Gateway URL" },
      { name: "gateway_regional_url", type: "string", description: "Regional gateway URL" },
      { name: "management_api_url", type: "string", description: "Management API URL" },
      { name: "portal_url", type: "string", description: "Portal URL" },
      { name: "developer_portal_url", type: "string", description: "Developer portal URL" },
      { name: "scm_url", type: "string", description: "SCM URL" },
      { name: "public_ip_addresses", type: "list", description: "Public IPs" },
      { name: "private_ip_addresses", type: "list", description: "Private IPs" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  }
];

// All messaging terraform resources
export const MESSAGING_TERRAFORM_RESOURCES = MESSAGING_SERVICES.map(s => s.terraform_resource);

// Get messaging service by terraform resource name
export function getMessagingServiceByTerraformResource(terraformResource: string): MessagingServiceDefinition | undefined {
  return MESSAGING_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get messaging service by ID
export function getMessagingServiceById(id: string): MessagingServiceDefinition | undefined {
  return MESSAGING_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a messaging resource
export function isMessagingResource(terraformResource: string): boolean {
  return MESSAGING_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get messaging icon
export function getMessagingIcon(terraformResource: string): string | undefined {
  return MESSAGING_ICONS[terraformResource];
}







