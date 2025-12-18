/**
 * GCP Management Services Data - Complete definitions from management.json
 * This file contains ALL 7 management services with ALL their properties
 * 
 * Services included:
 * 1. Project (google_project)
 * 2. Project Service (google_project_service)
 * 3. Monitoring Alert Policy (google_monitoring_alert_policy)
 * 4. Notification Channel (google_monitoring_notification_channel)
 * 5. Uptime Check (google_monitoring_uptime_check_config)
 * 6. Logging Metric (google_logging_metric)
 * 7. Logging Sink (google_logging_project_sink)
 * 8. Billing Budget (google_billing_budget)
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

// GCP Management service icon mappings - using GCP core products and legacy icons
export const MANAGEMENT_ICONS: Record<string, string> = {
  'google_project': '/api/icons/gcp/google-cloud-legacy-icons/project/project.svg',
  'google_project_service': '/api/icons/gcp/google-cloud-legacy-icons/cloud_apis/cloud_apis.svg',
  'google_monitoring_alert_policy': '/api/icons/gcp/google-cloud-legacy-icons/cloud_monitoring/cloud_monitoring.svg',
  'google_monitoring_notification_channel': '/api/icons/gcp/google-cloud-legacy-icons/cloud_monitoring/cloud_monitoring.svg',
  'google_monitoring_uptime_check_config': '/api/icons/gcp/google-cloud-legacy-icons/cloud_monitoring/cloud_monitoring.svg',
  'google_logging_metric': '/api/icons/gcp/google-cloud-legacy-icons/cloud_logging/cloud_logging.svg',
  'google_logging_project_sink': '/api/icons/gcp/google-cloud-legacy-icons/cloud_logging/cloud_logging.svg',
  'google_billing_budget': '/api/icons/gcp/google-cloud-legacy-icons/billing/billing.svg',
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

// Complete management services data - manually defined
export const MANAGEMENT_SERVICES: ManagementServiceDefinition[] = [
  {
    id: "project",
    name: "Project",
    description: "Google Cloud project",
    terraform_resource: "google_project",
    icon: MANAGEMENT_ICONS['google_project'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Project name" },
        { name: "project_id", type: "string", description: "Project ID" }
      ],
      optional: [
        { name: "org_id", type: "string", description: "Organization ID" },
        { name: "folder_id", type: "string", description: "Folder ID" },
        { name: "billing_account", type: "string", description: "Billing account" },
        { name: "skip_delete", type: "bool", description: "Skip delete on destroy" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "auto_create_network", type: "bool", description: "Auto create network", default: true }
      ]
    },
    outputs: [
      { name: "number", type: "string", description: "Project number" }
    ]
  },
  {
    id: "project_service",
    name: "Project Service",
    description: "Enable API service in project",
    terraform_resource: "google_project_service",
    icon: MANAGEMENT_ICONS['google_project_service'],
    inputs: {
      required: [
        { name: "service", type: "string", description: "Service name (e.g., compute.googleapis.com)" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "disable_dependent_services", type: "bool", description: "Disable dependent services" },
        { name: "disable_on_destroy", type: "bool", description: "Disable on destroy", default: true }
      ]
    },
    outputs: []
  },
  {
    id: "monitoring_alert_policy",
    name: "Monitoring Alert Policy",
    description: "Cloud Monitoring alert policy",
    terraform_resource: "google_monitoring_alert_policy",
    icon: MANAGEMENT_ICONS['google_monitoring_alert_policy'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "combiner", type: "string", description: "Condition combiner", options: ["OR", "AND", "AND_WITH_MATCHING_RESOURCE"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "notification_channels", type: "list", description: "Notification channel IDs" },
        { name: "user_labels", type: "map", description: "User labels" },
        { name: "severity", type: "string", description: "Severity", options: ["CRITICAL", "ERROR", "WARNING"] }
      ],
      blocks: [
        {
          name: "conditions",
          required: true,
          multiple: true,
          attributes: [
            { name: "display_name", type: "string", required: true }
          ],
          blocks: [
            {
              name: "condition_threshold",
              attributes: [
                { name: "filter", type: "string", required: true },
                { name: "duration", type: "string", required: true },
                { name: "comparison", type: "string", required: true, options: ["COMPARISON_GT", "COMPARISON_GE", "COMPARISON_LT", "COMPARISON_LE", "COMPARISON_EQ", "COMPARISON_NE"] },
                { name: "threshold_value", type: "number" },
                { name: "denominator_filter", type: "string" }
              ],
              blocks: [
                {
                  name: "aggregations",
                  multiple: true,
                  attributes: [
                    { name: "alignment_period", type: "string" },
                    { name: "per_series_aligner", type: "string" },
                    { name: "cross_series_reducer", type: "string" },
                    { name: "group_by_fields", type: "list" }
                  ]
                },
                {
                  name: "trigger",
                  attributes: [
                    { name: "count", type: "number" },
                    { name: "percent", type: "number" }
                  ]
                },
                {
                  name: "forecast_options",
                  attributes: [
                    { name: "forecast_horizon", type: "string", required: true }
                  ]
                }
              ]
            },
            {
              name: "condition_absent",
              attributes: [
                { name: "filter", type: "string", required: true },
                { name: "duration", type: "string", required: true }
              ],
              blocks: [
                {
                  name: "aggregations",
                  multiple: true,
                  attributes: [
                    { name: "alignment_period", type: "string" },
                    { name: "per_series_aligner", type: "string" },
                    { name: "cross_series_reducer", type: "string" },
                    { name: "group_by_fields", type: "list" }
                  ]
                },
                {
                  name: "trigger",
                  attributes: [
                    { name: "count", type: "number" },
                    { name: "percent", type: "number" }
                  ]
                }
              ]
            },
            {
              name: "condition_matched_log",
              attributes: [
                { name: "filter", type: "string", required: true },
                { name: "label_extractors", type: "map" }
              ]
            },
            {
              name: "condition_monitoring_query_language",
              attributes: [
                { name: "query", type: "string", required: true },
                { name: "duration", type: "string", required: true },
                { name: "evaluation_missing_data", type: "string", options: ["EVALUATION_MISSING_DATA_INACTIVE", "EVALUATION_MISSING_DATA_ACTIVE", "EVALUATION_MISSING_DATA_NO_OP"] }
              ],
              blocks: [
                {
                  name: "trigger",
                  attributes: [
                    { name: "count", type: "number" },
                    { name: "percent", type: "number" }
                  ]
                }
              ]
            },
            {
              name: "condition_prometheus_query_language",
              attributes: [
                { name: "query", type: "string", required: true },
                { name: "duration", type: "string" },
                { name: "evaluation_interval", type: "string" },
                { name: "labels", type: "map" },
                { name: "rule_group", type: "string" },
                { name: "alert_rule", type: "string" }
              ]
            }
          ]
        },
        {
          name: "documentation",
          required: false,
          attributes: [
            { name: "content", type: "string" },
            { name: "mime_type", type: "string" },
            { name: "subject", type: "string" }
          ]
        },
        {
          name: "alert_strategy",
          required: false,
          attributes: [
            { name: "auto_close", type: "string" }
          ],
          blocks: [
            {
              name: "notification_rate_limit",
              attributes: [
                { name: "period", type: "string" }
              ]
            },
            {
              name: "notification_channel_strategy",
              multiple: true,
              attributes: [
                { name: "notification_channel_names", type: "list" },
                { name: "renotify_interval", type: "string" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Policy ID" },
      { name: "name", type: "string", description: "Policy name" },
      { name: "creation_record", type: "list", description: "Creation record" }
    ]
  },
  {
    id: "monitoring_notification_channel",
    name: "Notification Channel",
    description: "Cloud Monitoring notification channel",
    terraform_resource: "google_monitoring_notification_channel",
    icon: MANAGEMENT_ICONS['google_monitoring_notification_channel'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "type", type: "string", description: "Channel type", options: ["email", "pagerduty", "slack", "sms", "webhook_basicauth", "webhook_tokenauth", "pubsub", "campfire", "hipchat"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Channel labels" },
        { name: "user_labels", type: "map", description: "User labels" },
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "force_delete", type: "bool", description: "Force delete" }
      ],
      blocks: [
        {
          name: "sensitive_labels",
          required: false,
          attributes: [
            { name: "auth_token", type: "string", sensitive: true },
            { name: "password", type: "string", sensitive: true },
            { name: "service_key", type: "string", sensitive: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Channel ID" },
      { name: "name", type: "string", description: "Channel name" },
      { name: "verification_status", type: "string", description: "Verification status" }
    ]
  },
  {
    id: "monitoring_uptime_check_config",
    name: "Uptime Check",
    description: "Cloud Monitoring uptime check",
    terraform_resource: "google_monitoring_uptime_check_config",
    icon: MANAGEMENT_ICONS['google_monitoring_uptime_check_config'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "timeout", type: "string", description: "Timeout" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "period", type: "string", description: "Check period" },
        { name: "selected_regions", type: "list", description: "Selected regions" },
        { name: "checker_type", type: "string", description: "Checker type", options: ["STATIC_IP_CHECKERS", "VPC_CHECKERS"] },
        { name: "user_labels", type: "map", description: "User labels" }
      ],
      blocks: [
        {
          name: "http_check",
          required: false,
          attributes: [
            { name: "path", type: "string" },
            { name: "port", type: "number" },
            { name: "request_method", type: "string", options: ["GET", "POST"] },
            { name: "content_type", type: "string", options: ["TYPE_UNSPECIFIED", "URL_ENCODED", "USER_PROVIDED"] },
            { name: "custom_content_type", type: "string" },
            { name: "body", type: "string" },
            { name: "headers", type: "map" },
            { name: "mask_headers", type: "bool" },
            { name: "use_ssl", type: "bool" },
            { name: "validate_ssl", type: "bool" }
          ],
          blocks: [
            {
              name: "auth_info",
              attributes: [
                { name: "username", type: "string", required: true },
                { name: "password", type: "string", required: true, sensitive: true }
              ]
            },
            {
              name: "accepted_response_status_codes",
              multiple: true,
              attributes: [
                { name: "status_class", type: "string", options: ["STATUS_CLASS_1XX", "STATUS_CLASS_2XX", "STATUS_CLASS_3XX", "STATUS_CLASS_4XX", "STATUS_CLASS_5XX", "STATUS_CLASS_ANY"] },
                { name: "status_value", type: "number" }
              ]
            },
            {
              name: "ping_config",
              attributes: [
                { name: "pings_count", type: "number", required: true }
              ]
            }
          ]
        },
        {
          name: "tcp_check",
          required: false,
          attributes: [
            { name: "port", type: "number", required: true }
          ],
          blocks: [
            {
              name: "ping_config",
              attributes: [
                { name: "pings_count", type: "number", required: true }
              ]
            }
          ]
        },
        {
          name: "monitored_resource",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "labels", type: "map", required: true }
          ]
        },
        {
          name: "resource_group",
          required: false,
          attributes: [
            { name: "resource_type", type: "string" },
            { name: "group_id", type: "string" }
          ]
        },
        {
          name: "content_matchers",
          required: false,
          multiple: true,
          attributes: [
            { name: "content", type: "string", required: true },
            { name: "matcher", type: "string", options: ["CONTAINS_STRING", "NOT_CONTAINS_STRING", "MATCHES_REGEX", "NOT_MATCHES_REGEX", "MATCHES_JSON_PATH", "NOT_MATCHES_JSON_PATH"] }
          ],
          blocks: [
            {
              name: "json_path_matcher",
              attributes: [
                { name: "json_path", type: "string", required: true },
                { name: "json_matcher", type: "string", options: ["EXACT_MATCH", "REGEX_MATCH"] }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Check ID" },
      { name: "name", type: "string", description: "Check name" },
      { name: "uptime_check_id", type: "string", description: "Uptime check ID" }
    ]
  },
  {
    id: "logging_metric",
    name: "Logging Metric",
    description: "Cloud Logging custom metric",
    terraform_resource: "google_logging_metric",
    icon: MANAGEMENT_ICONS['google_logging_metric'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Metric name" },
        { name: "filter", type: "string", description: "Log filter" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "disabled", type: "bool", description: "Disabled" },
        { name: "value_extractor", type: "string", description: "Value extractor expression" },
        { name: "label_extractors", type: "map", description: "Label extractors" },
        { name: "bucket_name", type: "string", description: "Bucket name" }
      ],
      blocks: [
        {
          name: "metric_descriptor",
          required: false,
          attributes: [
            { name: "metric_kind", type: "string", required: true, options: ["DELTA", "GAUGE", "CUMULATIVE"] },
            { name: "value_type", type: "string", required: true, options: ["BOOL", "INT64", "DOUBLE", "STRING", "DISTRIBUTION", "MONEY"] },
            { name: "unit", type: "string" },
            { name: "display_name", type: "string" }
          ],
          blocks: [
            {
              name: "labels",
              multiple: true,
              attributes: [
                { name: "key", type: "string", required: true },
                { name: "value_type", type: "string", options: ["BOOL", "INT64", "STRING"] },
                { name: "description", type: "string" }
              ]
            }
          ]
        },
        {
          name: "bucket_options",
          required: false,
          blocks: [
            {
              name: "linear_buckets",
              attributes: [
                { name: "num_finite_buckets", type: "number", required: true },
                { name: "width", type: "number", required: true },
                { name: "offset", type: "number", required: true }
              ]
            },
            {
              name: "exponential_buckets",
              attributes: [
                { name: "num_finite_buckets", type: "number", required: true },
                { name: "growth_factor", type: "number", required: true },
                { name: "scale", type: "number", required: true }
              ]
            },
            {
              name: "explicit_buckets",
              attributes: [
                { name: "bounds", type: "list", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Metric ID" }
    ]
  },
  {
    id: "logging_project_sink",
    name: "Logging Sink",
    description: "Cloud Logging log sink",
    terraform_resource: "google_logging_project_sink",
    icon: MANAGEMENT_ICONS['google_logging_project_sink'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Sink name" },
        { name: "destination", type: "string", description: "Destination (storage, pubsub, bigquery)" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "filter", type: "string", description: "Log filter" },
        { name: "description", type: "string", description: "Description" },
        { name: "disabled", type: "bool", description: "Disabled" },
        { name: "unique_writer_identity", type: "bool", description: "Unique writer identity", default: false }
      ],
      blocks: [
        {
          name: "bigquery_options",
          required: false,
          attributes: [
            { name: "use_partitioned_tables", type: "bool", required: true }
          ]
        },
        {
          name: "exclusions",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "filter", type: "string", required: true },
            { name: "description", type: "string" },
            { name: "disabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Sink ID" },
      { name: "writer_identity", type: "string", description: "Writer identity" }
    ]
  },
  {
    id: "billing_budget",
    name: "Billing Budget",
    description: "Cloud Billing budget",
    terraform_resource: "google_billing_budget",
    icon: MANAGEMENT_ICONS['google_billing_budget'],
    inputs: {
      required: [
        { name: "billing_account", type: "string", description: "Billing account ID" },
        { name: "display_name", type: "string", description: "Display name" }
      ],
      optional: [
        { name: "ownership_scope", type: "string", description: "Ownership scope", options: ["OWNERSHIP_SCOPE_UNSPECIFIED", "ALL_USERS", "BILLING_ACCOUNT"] }
      ],
      blocks: [
        {
          name: "budget_filter",
          required: false,
          attributes: [
            { name: "projects", type: "list" },
            { name: "credit_types_treatment", type: "string", options: ["INCLUDE_ALL_CREDITS", "EXCLUDE_ALL_CREDITS", "INCLUDE_SPECIFIED_CREDITS"] },
            { name: "credit_types", type: "list" },
            { name: "services", type: "list" },
            { name: "subaccounts", type: "list" },
            { name: "labels", type: "map" },
            { name: "resource_ancestors", type: "list" },
            { name: "calendar_period", type: "string", options: ["MONTH", "QUARTER", "YEAR"] }
          ],
          blocks: [
            {
              name: "custom_period",
              blocks: [
                {
                  name: "start_date",
                  required: true,
                  attributes: [
                    { name: "year", type: "number", required: true },
                    { name: "month", type: "number", required: true },
                    { name: "day", type: "number", required: true }
                  ]
                },
                {
                  name: "end_date",
                  attributes: [
                    { name: "year", type: "number", required: true },
                    { name: "month", type: "number", required: true },
                    { name: "day", type: "number", required: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "amount",
          required: true,
          attributes: [
            { name: "last_period_amount", type: "bool" }
          ],
          blocks: [
            {
              name: "specified_amount",
              attributes: [
                { name: "currency_code", type: "string" },
                { name: "units", type: "string" },
                { name: "nanos", type: "number" }
              ]
            }
          ]
        },
        {
          name: "threshold_rules",
          required: true,
          multiple: true,
          attributes: [
            { name: "threshold_percent", type: "number", required: true },
            { name: "spend_basis", type: "string", options: ["CURRENT_SPEND", "FORECASTED_SPEND"] }
          ]
        },
        {
          name: "all_updates_rule",
          required: false,
          attributes: [
            { name: "pubsub_topic", type: "string" },
            { name: "schema_version", type: "string" },
            { name: "monitoring_notification_channels", type: "list" },
            { name: "disable_default_iam_recipients", type: "bool" },
            { name: "enable_project_level_recipients", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Budget ID" },
      { name: "name", type: "string", description: "Budget name" }
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





