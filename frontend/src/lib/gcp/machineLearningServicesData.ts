/**
 * GCP Machine Learning Services Data - Complete definitions from machine-learning.json
 * This file contains ALL 7 machine learning services with ALL their properties
 * 
 * Services included:
 * 1. Vertex AI Dataset (google_vertex_ai_dataset)
 * 2. Vertex AI Endpoint (google_vertex_ai_endpoint)
 * 3. Vertex AI Feature Store (google_vertex_ai_featurestore)
 * 4. Vertex AI Workbench Instance (google_notebooks_instance)
 * 5. AI Platform Model (google_ml_engine_model)
 * 6. Dialogflow Agent (google_dialogflow_agent)
 * 7. Dialogflow CX Agent (google_dialogflow_cx_agent)
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

// GCP Machine Learning service icon mappings - using GCP core products and legacy icons
export const MACHINE_LEARNING_ICONS: Record<string, string> = {
  'google_vertex_ai_dataset': '/api/icons/gcp/core-products-icons/Unique Icons/Vertex AI/SVG/VertexAI-512-color.svg',
  'google_vertex_ai_endpoint': '/api/icons/gcp/core-products-icons/Unique Icons/Vertex AI/SVG/VertexAI-512-color.svg',
  'google_vertex_ai_featurestore': '/api/icons/gcp/core-products-icons/Unique Icons/Vertex AI/SVG/VertexAI-512-color.svg',
  'google_notebooks_instance': '/api/icons/gcp/google-cloud-legacy-icons/datalab/datalab.svg',
  'google_ml_engine_model': '/api/icons/gcp/google-cloud-legacy-icons/ai_platform/ai_platform.svg',
  'google_dialogflow_agent': '/api/icons/gcp/google-cloud-legacy-icons/dialogflow/dialogflow.svg',
  'google_dialogflow_cx_agent': '/api/icons/gcp/google-cloud-legacy-icons/dialogflow_cx/dialogflow_cx.svg',
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

// Complete machine learning services data - manually defined
export const MACHINE_LEARNING_SERVICES: MachineLearningServiceDefinition[] = [
  {
    id: "vertex_ai_dataset",
    name: "Vertex AI Dataset",
    description: "Vertex AI dataset",
    terraform_resource: "google_vertex_ai_dataset",
    icon: MACHINE_LEARNING_ICONS['google_vertex_ai_dataset'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "metadata_schema_uri", type: "string", description: "Metadata schema URI" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: [
        {
          name: "encryption_spec",
          required: false,
          attributes: [
            { name: "kms_key_name", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Dataset ID" },
      { name: "name", type: "string", description: "Dataset name" },
      { name: "create_time", type: "string", description: "Create time" },
      { name: "update_time", type: "string", description: "Update time" }
    ]
  },
  {
    id: "vertex_ai_endpoint",
    name: "Vertex AI Endpoint",
    description: "Vertex AI online prediction endpoint",
    terraform_resource: "google_vertex_ai_endpoint",
    icon: MACHINE_LEARNING_ICONS['google_vertex_ai_endpoint'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Endpoint name" },
        { name: "display_name", type: "string", description: "Display name" },
        { name: "location", type: "string", description: "Location" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "network", type: "string", description: "VPC network" },
        { name: "region", type: "string", description: "Region" }
      ],
      blocks: [
        {
          name: "encryption_spec",
          required: false,
          attributes: [
            { name: "kms_key_name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Endpoint ID" },
      { name: "name", type: "string", description: "Endpoint name" },
      { name: "create_time", type: "string", description: "Create time" },
      { name: "update_time", type: "string", description: "Update time" },
      { name: "model_deployment_monitoring_job", type: "string", description: "Monitoring job" },
      { name: "deployed_models", type: "list", description: "Deployed models" }
    ]
  },
  {
    id: "vertex_ai_featurestore",
    name: "Vertex AI Feature Store",
    description: "Vertex AI Feature Store",
    terraform_resource: "google_vertex_ai_featurestore",
    icon: MACHINE_LEARNING_ICONS['google_vertex_ai_featurestore'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Feature store name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "force_destroy", type: "bool", description: "Force destroy" }
      ],
      blocks: [
        {
          name: "online_serving_config",
          required: false,
          attributes: [
            { name: "fixed_node_count", type: "number" }
          ],
          blocks: [
            {
              name: "scaling",
              attributes: [
                { name: "min_node_count", type: "number", required: true },
                { name: "max_node_count", type: "number", required: true }
              ]
            }
          ]
        },
        {
          name: "encryption_spec",
          required: false,
          attributes: [
            { name: "kms_key_name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Feature store ID" },
      { name: "name", type: "string", description: "Feature store name" },
      { name: "create_time", type: "string", description: "Create time" },
      { name: "update_time", type: "string", description: "Update time" },
      { name: "etag", type: "string", description: "Etag" }
    ]
  },
  {
    id: "notebooks_instance",
    name: "Vertex AI Workbench Instance",
    description: "Vertex AI Workbench managed notebook instance",
    terraform_resource: "google_notebooks_instance",
    icon: MACHINE_LEARNING_ICONS['google_notebooks_instance'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Instance name" },
        { name: "location", type: "string", description: "Zone" },
        { name: "machine_type", type: "string", description: "Machine type" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "post_startup_script", type: "string", description: "Post startup script" },
        { name: "instance_owners", type: "list", description: "Instance owners" },
        { name: "service_account", type: "string", description: "Service account" },
        { name: "service_account_scopes", type: "list", description: "Service account scopes" },
        { name: "install_gpu_driver", type: "bool", description: "Install GPU driver" },
        { name: "custom_gpu_driver_path", type: "string", description: "Custom GPU driver path" },
        { name: "boot_disk_type", type: "string", description: "Boot disk type", options: ["PD_STANDARD", "PD_SSD", "PD_BALANCED", "PD_EXTREME"] },
        { name: "boot_disk_size_gb", type: "number", description: "Boot disk size GB" },
        { name: "data_disk_type", type: "string", description: "Data disk type", options: ["PD_STANDARD", "PD_SSD", "PD_BALANCED", "PD_EXTREME"] },
        { name: "data_disk_size_gb", type: "number", description: "Data disk size GB" },
        { name: "no_remove_data_disk", type: "bool", description: "Keep data disk on delete" },
        { name: "disk_encryption", type: "string", description: "Disk encryption", options: ["GMEK", "CMEK"] },
        { name: "kms_key", type: "string", description: "KMS key" },
        { name: "no_public_ip", type: "bool", description: "No public IP" },
        { name: "no_proxy_access", type: "bool", description: "No proxy access" },
        { name: "network", type: "string", description: "Network" },
        { name: "subnet", type: "string", description: "Subnet" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "tags", type: "list", description: "Network tags" },
        { name: "metadata", type: "map", description: "Metadata" },
        { name: "nic_type", type: "string", description: "NIC type", options: ["UNSPECIFIED_NIC_TYPE", "VIRTIO_NET", "GVNIC"] },
        { name: "desired_state", type: "string", description: "Desired state", options: ["ACTIVE", "STOPPED"] }
      ],
      blocks: [
        {
          name: "accelerator_config",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true, options: ["ACCELERATOR_TYPE_UNSPECIFIED", "NVIDIA_TESLA_K80", "NVIDIA_TESLA_P100", "NVIDIA_TESLA_V100", "NVIDIA_TESLA_P4", "NVIDIA_TESLA_T4", "NVIDIA_TESLA_A100", "NVIDIA_L4", "NVIDIA_A100_80GB", "NVIDIA_TESLA_T4_VWS", "NVIDIA_TESLA_P100_VWS", "NVIDIA_TESLA_P4_VWS", "TPU_V2", "TPU_V3"] },
            { name: "core_count", type: "number", required: true }
          ]
        },
        {
          name: "shielded_instance_config",
          required: false,
          attributes: [
            { name: "enable_integrity_monitoring", type: "bool" },
            { name: "enable_secure_boot", type: "bool" },
            { name: "enable_vtpm", type: "bool" }
          ]
        },
        {
          name: "vm_image",
          required: false,
          attributes: [
            { name: "project", type: "string", required: true },
            { name: "image_family", type: "string" },
            { name: "image_name", type: "string" }
          ]
        },
        {
          name: "container_image",
          required: false,
          attributes: [
            { name: "repository", type: "string", required: true },
            { name: "tag", type: "string" }
          ]
        },
        {
          name: "reservation_affinity",
          required: false,
          attributes: [
            { name: "consume_reservation_type", type: "string", required: true, options: ["TYPE_UNSPECIFIED", "NO_RESERVATION", "ANY_RESERVATION", "SPECIFIC_RESERVATION"] },
            { name: "key", type: "string" },
            { name: "values", type: "list" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "proxy_uri", type: "string", description: "Proxy URI" },
      { name: "state", type: "string", description: "Instance state" },
      { name: "create_time", type: "string", description: "Create time" },
      { name: "update_time", type: "string", description: "Update time" }
    ]
  },
  {
    id: "ml_engine_model",
    name: "AI Platform Model",
    description: "AI Platform model",
    terraform_resource: "google_ml_engine_model",
    icon: MACHINE_LEARNING_ICONS['google_ml_engine_model'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Model name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "regions", type: "list", description: "Regions" },
        { name: "online_prediction_logging", type: "bool", description: "Enable prediction logging" },
        { name: "online_prediction_console_logging", type: "bool", description: "Enable console logging" },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: [
        {
          name: "default_version",
          required: false,
          attributes: [
            { name: "name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Model ID" },
      { name: "name", type: "string", description: "Model name" }
    ]
  },
  {
    id: "dialogflow_agent",
    name: "Dialogflow Agent",
    description: "Dialogflow ES agent",
    terraform_resource: "google_dialogflow_agent",
    icon: MACHINE_LEARNING_ICONS['google_dialogflow_agent'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "default_language_code", type: "string", description: "Default language code" },
        { name: "time_zone", type: "string", description: "Time zone" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "supported_language_codes", type: "list", description: "Supported languages" },
        { name: "description", type: "string", description: "Description" },
        { name: "avatar_uri", type: "string", description: "Avatar URI" },
        { name: "enable_logging", type: "bool", description: "Enable logging" },
        { name: "match_mode", type: "string", description: "Match mode", options: ["MATCH_MODE_HYBRID", "MATCH_MODE_ML_ONLY"] },
        { name: "classification_threshold", type: "number", description: "Classification threshold" },
        { name: "api_version", type: "string", description: "API version", options: ["API_VERSION_V1", "API_VERSION_V2", "API_VERSION_V2_BETA_1"] },
        { name: "tier", type: "string", description: "Tier", options: ["TIER_STANDARD", "TIER_ENTERPRISE", "TIER_ENTERPRISE_PLUS"] }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Agent ID" },
      { name: "avatar_uri_backend", type: "string", description: "Avatar URI backend" }
    ]
  },
  {
    id: "dialogflow_cx_agent",
    name: "Dialogflow CX Agent",
    description: "Dialogflow CX agent",
    terraform_resource: "google_dialogflow_cx_agent",
    icon: MACHINE_LEARNING_ICONS['google_dialogflow_cx_agent'],
    inputs: {
      required: [
        { name: "display_name", type: "string", description: "Display name" },
        { name: "location", type: "string", description: "Location" },
        { name: "default_language_code", type: "string", description: "Default language code" },
        { name: "time_zone", type: "string", description: "Time zone" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "supported_language_codes", type: "list", description: "Supported languages" },
        { name: "description", type: "string", description: "Description" },
        { name: "avatar_uri", type: "string", description: "Avatar URI" },
        { name: "enable_stackdriver_logging", type: "bool", description: "Enable Stackdriver logging" },
        { name: "enable_spell_correction", type: "bool", description: "Enable spell correction" },
        { name: "security_settings", type: "string", description: "Security settings" }
      ],
      blocks: [
        {
          name: "speech_to_text_settings",
          required: false,
          attributes: [
            { name: "enable_speech_adaptation", type: "bool" }
          ]
        },
        {
          name: "advanced_settings",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "audio_export_gcs_destination",
              attributes: [
                { name: "uri", type: "string" }
              ]
            },
            {
              name: "dtmf_settings",
              attributes: [
                { name: "enabled", type: "bool" },
                { name: "max_digits", type: "number" },
                { name: "finish_digit", type: "string" }
              ]
            },
            {
              name: "logging_settings",
              attributes: [
                { name: "enable_stackdriver_logging", type: "bool" },
                { name: "enable_interaction_logging", type: "bool" }
              ]
            }
          ]
        },
        {
          name: "git_integration_settings",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "github_settings",
              attributes: [
                { name: "display_name", type: "string" },
                { name: "repository_uri", type: "string" },
                { name: "tracking_branch", type: "string" },
                { name: "access_token", type: "string", sensitive: true },
                { name: "branches", type: "list" }
              ]
            }
          ]
        },
        {
          name: "text_to_speech_settings",
          required: false,
          attributes: [
            { name: "synthesize_speech_configs", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Agent ID" },
      { name: "name", type: "string", description: "Agent name" },
      { name: "start_flow", type: "string", description: "Start flow" }
    ]
  }
];

// All machine learning terraform resources
export const MACHINE_LEARNING_TERRAFORM_RESOURCES = MACHINE_LEARNING_SERVICES.map(s => s.terraform_resource);

// Get machine learning service by terraform resource name
export function getMachineLearningServiceByTerraformResource(terraformResource: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get machine learning service by ID
export function getMachineLearningServiceById(id: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a machine learning resource
export function isMachineLearningResource(terraformResource: string): boolean {
  return MACHINE_LEARNING_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get machine learning icon
export function getMachineLearningIcon(terraformResource: string): string | undefined {
  return MACHINE_LEARNING_ICONS[terraformResource];
}

