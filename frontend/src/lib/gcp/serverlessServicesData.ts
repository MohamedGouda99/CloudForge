/**
 * GCP Serverless Services Data - Complete definitions from serverless.json
 * This file contains ALL 4 serverless services with ALL their properties
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

// GCP Serverless service icon mappings - using GCP core products and legacy icons
export const SERVERLESS_ICONS: Record<string, string> = {
  'google_cloudfunctions_function': '/api/icons/gcp/google-cloud-legacy-icons/cloud_functions/cloud_functions.svg',
  'google_cloudfunctions2_function': '/api/icons/gcp/google-cloud-legacy-icons/cloud_functions/cloud_functions.svg',
  'google_cloud_run_service': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg',
  'google_app_engine_application': '/api/icons/gcp/google-cloud-legacy-icons/app_engine/app_engine.svg',
};

// Serverless service definition interface
export interface ServerlessServiceDefinition {
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

// Complete serverless services data - manually defined
export const SERVERLESS_SERVICES: ServerlessServiceDefinition[] = [
  {
    id: "cloudfunctions_function",
    name: "Cloud Functions (1st Gen)",
    description: "Cloud Functions 1st generation function",
    terraform_resource: "google_cloudfunctions_function",
    icon: SERVERLESS_ICONS['google_cloudfunctions_function'],
    inputs: {
        required: [
          { name: "name", type: "string", description: "Function name" },
          { name: "runtime", type: "string", description: "Runtime", options: ["nodejs16", "nodejs18", "nodejs20", "python39", "python310", "python311", "python312", "go119", "go120", "go121", "go122", "java11", "java17", "java21", "dotnet6", "dotnet8", "ruby30", "ruby32", "php81", "php82", "php83"] }
        ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "available_memory_mb", type: "number", description: "Available memory MB", default: 256 },
        { name: "timeout", type: "number", description: "Timeout seconds", default: 60 },
        { name: "entry_point", type: "string", description: "Entry point" },
        { name: "trigger_http", type: "bool", description: "HTTP trigger" },
        { name: "https_trigger_security_level", type: "string", description: "HTTPS security level", options: ["SECURE_ALWAYS", "SECURE_OPTIONAL"] },
        { name: "https_trigger_url", type: "string", description: "HTTPS trigger URL" },
        { name: "ingress_settings", type: "string", description: "Ingress settings", options: ["ALLOW_ALL", "ALLOW_INTERNAL_AND_GCLB", "ALLOW_INTERNAL_ONLY"] },
        { name: "labels", type: "map", description: "Labels" },
        { name: "service_account_email", type: "string", description: "Service account" },
        { name: "environment_variables", type: "map", description: "Environment variables" },
        { name: "build_environment_variables", type: "map", description: "Build environment variables" },
        { name: "vpc_connector", type: "string", description: "VPC connector" },
        { name: "vpc_connector_egress_settings", type: "string", description: "VPC egress settings", options: ["ALL_TRAFFIC", "PRIVATE_RANGES_ONLY"] },
        { name: "source_archive_bucket", type: "string", description: "Source archive bucket" },
        { name: "source_archive_object", type: "string", description: "Source archive object" },
        { name: "max_instances", type: "number", description: "Max instances" },
        { name: "min_instances", type: "number", description: "Min instances" },
        { name: "docker_registry", type: "string", description: "Docker registry", options: ["CONTAINER_REGISTRY", "ARTIFACT_REGISTRY"] },
        { name: "docker_repository", type: "string", description: "Docker repository" },
        { name: "kms_key_name", type: "string", description: "KMS key name" }
      ],
      blocks: [
        {
          name: "event_trigger",
          required: false,
          attributes: [
            { name: "event_type", type: "string", required: true },
            { name: "resource", type: "string", required: true }
          ],
          blocks: [
            {
              name: "failure_policy",
              required: false,
              attributes: [
                { name: "retry", type: "bool", required: true }
              ]
            }
          ]
        },
        {
          name: "source_repository",
          required: false,
          attributes: [
            { name: "url", type: "string", required: true }
          ]
        },
        {
          name: "secret_environment_variables",
          required: false,
          multiple: true,
          attributes: [
            { name: "key", type: "string", required: true },
            { name: "project_id", type: "string" },
            { name: "secret", type: "string", required: true },
            { name: "version", type: "string", required: true }
          ]
        },
        {
          name: "secret_volumes",
          required: false,
          multiple: true,
          attributes: [
            { name: "mount_path", type: "string", required: true },
            { name: "project_id", type: "string" },
            { name: "secret", type: "string", required: true }
          ],
          blocks: [
            {
              name: "versions",
              required: false,
              multiple: true,
              attributes: [
                { name: "path", type: "string", required: true },
                { name: "version", type: "string", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Function ID" },
      { name: "https_trigger_url", type: "string", description: "HTTPS trigger URL" },
      { name: "source_repository.0.deployed_url", type: "string", description: "Deployed URL" },
      { name: "status", type: "string", description: "Function status" },
      { name: "version_id", type: "string", description: "Version ID" }
    ]
  },
  {
    id: "cloudfunctions2_function",
    name: "Cloud Functions (2nd Gen)",
    description: "Cloud Functions 2nd generation function",
    terraform_resource: "google_cloudfunctions2_function",
    icon: SERVERLESS_ICONS['google_cloudfunctions2_function'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Function name" },
        { name: "location", type: "string", description: "Location" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "kms_key_name", type: "string", description: "KMS key name" }
      ],
      blocks: [
        {
          name: "build_config",
          required: false,
          attributes: [
            { name: "runtime", type: "string", required: true },
            { name: "entry_point", type: "string" },
            { name: "environment_variables", type: "map" },
            { name: "docker_repository", type: "string" },
            { name: "worker_pool", type: "string" },
            { name: "service_account", type: "string" }
          ],
          blocks: [
            {
              name: "source",
              required: false,
              attributes: [],
              blocks: [
                {
                  name: "storage_source",
                  required: false,
                  attributes: [
                    { name: "bucket", type: "string" },
                    { name: "object", type: "string" },
                    { name: "generation", type: "number" }
                  ]
                },
                {
                  name: "repo_source",
                  required: false,
                  attributes: [
                    { name: "project_id", type: "string" },
                    { name: "repo_name", type: "string" },
                    { name: "branch_name", type: "string" },
                    { name: "tag_name", type: "string" },
                    { name: "commit_sha", type: "string" },
                    { name: "dir", type: "string" },
                    { name: "invert_regex", type: "bool" }
                  ]
                }
              ]
            },
            {
              name: "automatic_update_policy",
              required: false,
              attributes: []
            },
            {
              name: "on_deploy_update_policy",
              required: false,
              attributes: []
            }
          ]
        },
        {
          name: "service_config",
          required: false,
          attributes: [
            { name: "max_instance_count", type: "number" },
            { name: "min_instance_count", type: "number" },
            { name: "available_memory", type: "string" },
            { name: "available_cpu", type: "string" },
            { name: "timeout_seconds", type: "number" },
            { name: "max_instance_request_concurrency", type: "number" },
            { name: "environment_variables", type: "map" },
            { name: "ingress_settings", type: "string", options: ["ALLOW_ALL", "ALLOW_INTERNAL_ONLY", "ALLOW_INTERNAL_AND_GCLB"] },
            { name: "all_traffic_on_latest_revision", type: "bool" },
            { name: "service_account_email", type: "string" },
            { name: "vpc_connector", type: "string" },
            { name: "vpc_connector_egress_settings", type: "string", options: ["VPC_CONNECTOR_EGRESS_SETTINGS_UNSPECIFIED", "PRIVATE_RANGES_ONLY", "ALL_TRAFFIC"] }
          ],
          blocks: [
            {
              name: "secret_environment_variables",
              required: false,
              multiple: true,
              attributes: [
                { name: "key", type: "string", required: true },
                { name: "project_id", type: "string", required: true },
                { name: "secret", type: "string", required: true },
                { name: "version", type: "string", required: true }
              ]
            },
            {
              name: "secret_volumes",
              required: false,
              multiple: true,
              attributes: [
                { name: "mount_path", type: "string", required: true },
                { name: "project_id", type: "string", required: true },
                { name: "secret", type: "string", required: true }
              ],
              blocks: [
                {
                  name: "versions",
                  required: false,
                  multiple: true,
                  attributes: [
                    { name: "version", type: "string", required: true },
                    { name: "path", type: "string", required: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "event_trigger",
          required: false,
          attributes: [
            { name: "trigger_region", type: "string" },
            { name: "event_type", type: "string" },
            { name: "pubsub_topic", type: "string" },
            { name: "service_account_email", type: "string" },
            { name: "retry_policy", type: "string", options: ["RETRY_POLICY_UNSPECIFIED", "RETRY_POLICY_DO_NOT_RETRY", "RETRY_POLICY_RETRY"] }
          ],
          blocks: [
            {
              name: "event_filters",
              required: false,
              multiple: true,
              attributes: [
                { name: "attribute", type: "string", required: true },
                { name: "value", type: "string", required: true },
                { name: "operator", type: "string" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Function ID" },
      { name: "name", type: "string", description: "Function name" },
      { name: "environment", type: "string", description: "Environment" },
      { name: "url", type: "string", description: "Function URL" },
      { name: "state", type: "string", description: "Function state" },
      { name: "update_time", type: "string", description: "Update time" },
      { name: "service_config.0.service", type: "string", description: "Cloud Run service name" },
      { name: "service_config.0.uri", type: "string", description: "Service URI" }
    ]
  },
  {
    id: "cloud_run_service",
    name: "Cloud Run Service",
    description: "Cloud Run service",
    terraform_resource: "google_cloud_run_service",
    icon: SERVERLESS_ICONS['google_cloud_run_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Service name" },
        { name: "location", type: "string", description: "Location" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "autogenerate_revision_name", type: "bool", description: "Auto generate revision name" }
      ],
      blocks: [
        {
          name: "template",
          required: true,
          attributes: [],
          blocks: [
            {
              name: "metadata",
              required: false,
              attributes: [
                { name: "name", type: "string" },
                { name: "namespace", type: "string" },
                { name: "labels", type: "map" },
                { name: "annotations", type: "map" }
              ]
            },
            {
              name: "spec",
              required: true,
              attributes: [
                { name: "container_concurrency", type: "number" },
                { name: "timeout_seconds", type: "number" },
                { name: "service_account_name", type: "string" }
              ],
              blocks: [
                {
                  name: "containers",
                  required: true,
                  multiple: true,
                  attributes: [
                    { name: "image", type: "string", required: true },
                    { name: "args", type: "list" },
                    { name: "command", type: "list" },
                    { name: "working_dir", type: "string" },
                    { name: "name", type: "string" }
                  ],
                  blocks: [
                    {
                      name: "env",
                      required: false,
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string", required: true },
                        { name: "value", type: "string" }
                      ],
                      blocks: [
                        {
                          name: "value_from",
                          required: false,
                          attributes: [],
                          blocks: [
                            {
                              name: "secret_key_ref",
                              required: false,
                              attributes: [
                                { name: "name", type: "string", required: true },
                                { name: "key", type: "string", required: true }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "ports",
                      required: false,
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string" },
                        { name: "protocol", type: "string" },
                        { name: "container_port", type: "number", required: true }
                      ]
                    },
                    {
                      name: "resources",
                      required: false,
                      attributes: [
                        { name: "limits", type: "map" },
                        { name: "requests", type: "map" }
                      ]
                    },
                    {
                      name: "volume_mounts",
                      required: false,
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string", required: true },
                        { name: "mount_path", type: "string", required: true }
                      ]
                    },
                    {
                      name: "liveness_probe",
                      required: false,
                      attributes: [
                        { name: "initial_delay_seconds", type: "number" },
                        { name: "timeout_seconds", type: "number" },
                        { name: "period_seconds", type: "number" },
                        { name: "failure_threshold", type: "number" }
                      ],
                      blocks: [
                        {
                          name: "http_get",
                          required: false,
                          attributes: [
                            { name: "path", type: "string" },
                            { name: "port", type: "number" }
                          ],
                          blocks: [
                            {
                              name: "http_headers",
                              required: false,
                              multiple: true,
                              attributes: [
                                { name: "name", type: "string", required: true },
                                { name: "value", type: "string" }
                              ]
                            }
                          ]
                        },
                        {
                          name: "grpc",
                          required: false,
                          attributes: [
                            { name: "port", type: "number" },
                            { name: "service", type: "string" }
                          ]
                        }
                      ]
                    },
                    {
                      name: "startup_probe",
                      required: false,
                      attributes: [
                        { name: "initial_delay_seconds", type: "number" },
                        { name: "timeout_seconds", type: "number" },
                        { name: "period_seconds", type: "number" },
                        { name: "failure_threshold", type: "number" }
                      ],
                      blocks: [
                        {
                          name: "http_get",
                          required: false,
                          attributes: [
                            { name: "path", type: "string" },
                            { name: "port", type: "number" }
                          ],
                          blocks: [
                            {
                              name: "http_headers",
                              required: false,
                              multiple: true,
                              attributes: [
                                { name: "name", type: "string", required: true },
                                { name: "value", type: "string" }
                              ]
                            }
                          ]
                        },
                        {
                          name: "tcp_socket",
                          required: false,
                          attributes: [
                            { name: "port", type: "number" }
                          ]
                        },
                        {
                          name: "grpc",
                          required: false,
                          attributes: [
                            { name: "port", type: "number" },
                            { name: "service", type: "string" }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "volumes",
                  required: false,
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true }
                  ],
                  blocks: [
                    {
                      name: "secret",
                      required: false,
                      attributes: [
                        { name: "secret_name", type: "string", required: true },
                        { name: "default_mode", type: "number" }
                      ],
                      blocks: [
                        {
                          name: "items",
                          required: false,
                          multiple: true,
                          attributes: [
                            { name: "key", type: "string", required: true },
                            { name: "path", type: "string", required: true },
                            { name: "mode", type: "number" }
                          ]
                        }
                      ]
                    },
                    {
                      name: "cloud_sql_instance",
                      required: false,
                      attributes: [
                        { name: "instances", type: "list" }
                      ]
                    },
                    {
                      name: "empty_dir",
                      required: false,
                      attributes: [
                        { name: "medium", type: "string" },
                        { name: "size_limit", type: "string" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "traffic",
          required: false,
          multiple: true,
          attributes: [
            { name: "percent", type: "number", required: true },
            { name: "revision_name", type: "string" },
            { name: "latest_revision", type: "bool" },
            { name: "tag", type: "string" }
          ]
        },
        {
          name: "metadata",
          required: false,
          attributes: [
            { name: "namespace", type: "string" },
            { name: "labels", type: "map" },
            { name: "annotations", type: "map" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "status", type: "list", description: "Service status" },
      { name: "metadata.0.generation", type: "number", description: "Generation" },
      { name: "metadata.0.resource_version", type: "string", description: "Resource version" },
      { name: "metadata.0.self_link", type: "string", description: "Self link" },
      { name: "metadata.0.uid", type: "string", description: "UID" }
    ]
  },
  {
    id: "app_engine_application",
    name: "App Engine Application",
    description: "App Engine application",
    terraform_resource: "google_app_engine_application",
    icon: SERVERLESS_ICONS['google_app_engine_application'],
    inputs: {
      required: [
        { name: "location_id", type: "string", description: "Location ID" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "auth_domain", type: "string", description: "Auth domain" },
        { name: "serving_status", type: "string", description: "Serving status", options: ["SERVING", "USER_DISABLED", "SYSTEM_DISABLED"] },
        { name: "database_type", type: "string", description: "Database type", options: ["CLOUD_DATASTORE_COMPATIBILITY", "CLOUD_FIRESTORE", "CLOUD_DATASTORE_COMPATIBILITY_MODE", "CLOUD_FIRESTORE_NATIVE"] }
      ],
      blocks: [
        {
          name: "feature_settings",
          required: false,
          attributes: [
            { name: "split_health_checks", type: "bool" }
          ]
        },
        {
          name: "iap",
          required: false,
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "oauth2_client_id", type: "string", required: true },
            { name: "oauth2_client_secret", type: "string", required: true, sensitive: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Application ID" },
      { name: "name", type: "string", description: "Application name" },
      { name: "app_id", type: "string", description: "App ID" },
      { name: "url_dispatch_rule", type: "list", description: "URL dispatch rules" },
      { name: "code_bucket", type: "string", description: "Code bucket" },
      { name: "default_hostname", type: "string", description: "Default hostname" },
      { name: "default_bucket", type: "string", description: "Default bucket" },
      { name: "gcr_domain", type: "string", description: "GCR domain" },
      { name: "iap.0.oauth2_client_secret_sha256", type: "string", description: "IAP secret SHA256" }
    ]
  }
];

// All serverless terraform resources
export const SERVERLESS_TERRAFORM_RESOURCES = SERVERLESS_SERVICES.map(s => s.terraform_resource);

// Get serverless service by terraform resource name
export function getServerlessServiceByTerraformResource(terraformResource: string): ServerlessServiceDefinition | undefined {
  return SERVERLESS_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get serverless service by ID
export function getServerlessServiceById(id: string): ServerlessServiceDefinition | undefined {
  return SERVERLESS_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a serverless resource
export function isServerlessResource(terraformResource: string): boolean {
  return SERVERLESS_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get serverless icon
export function getServerlessIcon(terraformResource: string): string | undefined {
  return SERVERLESS_ICONS[terraformResource];
}
