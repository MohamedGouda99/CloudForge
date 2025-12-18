/**
 * GCP Containers Services Data - Complete definitions from containers.json
 * This file contains ALL 4 containers services with ALL their properties
 * 
 * Services included:
 * 1. GKE Cluster (google_container_cluster)
 * 2. GKE Node Pool (google_container_node_pool)
 * 3. Artifact Registry (google_artifact_registry_repository)
 * 4. Cloud Run Service (google_cloud_run_service)
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

// GCP Containers service icon mappings - using GCP core products and legacy icons
export const CONTAINERS_ICONS: Record<string, string> = {
  'google_container_cluster': '/api/icons/gcp/core-products-icons/Unique Icons/GKE/SVG/GKE-512-color.svg',
  'google_container_node_pool': '/api/icons/gcp/core-products-icons/Unique Icons/GKE/SVG/GKE-512-color.svg',
  'google_artifact_registry_repository': '/api/icons/gcp/google-cloud-legacy-icons/artifact_registry/artifact_registry.svg',
  'google_cloud_run_service': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg',
};

// Containers service definition interface
export interface ContainersServiceDefinition {
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

// Complete containers services data - manually defined
export const CONTAINERS_SERVICES: ContainersServiceDefinition[] = [
  {
    id: "container_cluster",
    name: "GKE Cluster",
    description: "Google Kubernetes Engine cluster",
    terraform_resource: "google_container_cluster",
    icon: CONTAINERS_ICONS['google_container_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" },
        { name: "location", type: "string", description: "Zone or region" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "initial_node_count", type: "number", description: "Initial node count" },
        { name: "remove_default_node_pool", type: "bool", description: "Remove default pool" },
        { name: "network", type: "string", description: "VPC network" },
        { name: "subnetwork", type: "string", description: "Subnetwork" },
        { name: "cluster_ipv4_cidr", type: "string", description: "Cluster IPv4 CIDR" },
        { name: "min_master_version", type: "string", description: "Min master version" },
        { name: "node_version", type: "string", description: "Node version" },
        { name: "deletion_protection", type: "bool", description: "Deletion protection", default: true },
        { name: "enable_autopilot", type: "bool", description: "Enable Autopilot" },
        { name: "enable_shielded_nodes", type: "bool", description: "Shielded nodes", default: true },
        { name: "enable_intranode_visibility", type: "bool", description: "Intranode visibility" },
        { name: "enable_l4_ilb_subsetting", type: "bool", description: "L4 ILB subsetting" },
        { name: "enable_legacy_abac", type: "bool", description: "Legacy ABAC", default: false },
        { name: "enable_tpu", type: "bool", description: "Enable TPU" },
        { name: "default_max_pods_per_node", type: "number", description: "Max pods per node" },
        { name: "logging_service", type: "string", description: "Logging service" },
        { name: "monitoring_service", type: "string", description: "Monitoring service" },
        { name: "networking_mode", type: "string", description: "Networking mode", options: ["VPC_NATIVE", "ROUTES"] },
        { name: "datapath_provider", type: "string", description: "Datapath provider", options: ["DATAPATH_PROVIDER_UNSPECIFIED", "LEGACY_DATAPATH", "ADVANCED_DATAPATH"] },
        { name: "resource_labels", type: "map", description: "Resource labels" }
      ],
      blocks: [
        {
          name: "node_config",
          required: false,
          attributes: [
            { name: "machine_type", type: "string" },
            { name: "disk_size_gb", type: "number" },
            { name: "disk_type", type: "string", options: ["pd-standard", "pd-balanced", "pd-ssd"] },
            { name: "image_type", type: "string" },
            { name: "labels", type: "map" },
            { name: "local_ssd_count", type: "number" },
            { name: "metadata", type: "map" },
            { name: "min_cpu_platform", type: "string" },
            { name: "oauth_scopes", type: "list" },
            { name: "preemptible", type: "bool" },
            { name: "spot", type: "bool" },
            { name: "service_account", type: "string" },
            { name: "tags", type: "list" },
            { name: "boot_disk_kms_key", type: "string" },
            { name: "node_group", type: "string" }
          ],
          blocks: [
            {
              name: "shielded_instance_config",
              attributes: [
                { name: "enable_secure_boot", type: "bool" },
                { name: "enable_integrity_monitoring", type: "bool" }
              ]
            },
            {
              name: "workload_metadata_config",
              attributes: [
                { name: "mode", type: "string", options: ["MODE_UNSPECIFIED", "GCE_METADATA", "GKE_METADATA"] }
              ]
            }
          ]
        },
        {
          name: "ip_allocation_policy",
          required: false,
          attributes: [
            { name: "cluster_secondary_range_name", type: "string" },
            { name: "services_secondary_range_name", type: "string" },
            { name: "cluster_ipv4_cidr_block", type: "string" },
            { name: "services_ipv4_cidr_block", type: "string" },
            { name: "stack_type", type: "string", options: ["IPV4", "IPV4_IPV6"] }
          ]
        },
        {
          name: "master_auth",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "client_certificate_config",
              required: true,
              attributes: [
                { name: "issue_client_certificate", type: "bool", required: true }
              ]
            }
          ]
        },
        {
          name: "private_cluster_config",
          required: false,
          attributes: [
            { name: "enable_private_nodes", type: "bool" },
            { name: "enable_private_endpoint", type: "bool" },
            { name: "master_ipv4_cidr_block", type: "string" },
            { name: "private_endpoint_subnetwork", type: "string" }
          ]
        },
        {
          name: "addons_config",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "http_load_balancing",
              attributes: [
                { name: "disabled", type: "bool" }
              ]
            },
            {
              name: "horizontal_pod_autoscaling",
              attributes: [
                { name: "disabled", type: "bool" }
              ]
            },
            {
              name: "network_policy_config",
              attributes: [
                { name: "disabled", type: "bool" }
              ]
            }
          ]
        },
        {
          name: "cluster_autoscaling",
          required: false,
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "autoscaling_profile", type: "string", options: ["BALANCED", "OPTIMIZE_UTILIZATION"] }
          ],
          blocks: [
            {
              name: "resource_limits",
              multiple: true,
              attributes: [
                { name: "resource_type", type: "string", required: true },
                { name: "minimum", type: "number" },
                { name: "maximum", type: "number" }
              ]
            }
          ]
        },
        {
          name: "network_policy",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "provider", type: "string", options: ["CALICO", "PROVIDER_UNSPECIFIED"] }
          ]
        },
        {
          name: "release_channel",
          required: false,
          attributes: [
            { name: "channel", type: "string", required: true, options: ["UNSPECIFIED", "RAPID", "REGULAR", "STABLE"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "endpoint", type: "string", description: "Cluster endpoint" },
      { name: "cluster_ca_certificate", type: "string", description: "CA certificate", sensitive: true },
      { name: "master_version", type: "string", description: "Master version" },
      { name: "services_ipv4_cidr", type: "string", description: "Services IPv4 CIDR" }
    ]
  },
  {
    id: "container_node_pool",
    name: "GKE Node Pool",
    description: "Node pool for GKE cluster",
    terraform_resource: "google_container_node_pool",
    icon: CONTAINERS_ICONS['google_container_node_pool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Node pool name" },
        { name: "cluster", type: "string", description: "Cluster name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "location", type: "string", description: "Location" },
        { name: "node_count", type: "number", description: "Node count" },
        { name: "initial_node_count", type: "number", description: "Initial node count" },
        { name: "max_pods_per_node", type: "number", description: "Max pods per node" },
        { name: "node_locations", type: "list", description: "Node locations" },
        { name: "version", type: "string", description: "Node version" }
      ],
      blocks: [
        {
          name: "node_config",
          required: false,
          attributes: [
            { name: "machine_type", type: "string" },
            { name: "disk_size_gb", type: "number" },
            { name: "disk_type", type: "string" },
            { name: "image_type", type: "string" },
            { name: "labels", type: "map" },
            { name: "local_ssd_count", type: "number" },
            { name: "metadata", type: "map" },
            { name: "min_cpu_platform", type: "string" },
            { name: "oauth_scopes", type: "list" },
            { name: "preemptible", type: "bool" },
            { name: "spot", type: "bool" },
            { name: "service_account", type: "string" },
            { name: "tags", type: "list" },
            { name: "boot_disk_kms_key", type: "string" }
          ]
        },
        {
          name: "autoscaling",
          required: false,
          attributes: [
            { name: "min_node_count", type: "number" },
            { name: "max_node_count", type: "number" },
            { name: "total_min_node_count", type: "number" },
            { name: "total_max_node_count", type: "number" },
            { name: "location_policy", type: "string", options: ["BALANCED", "ANY"] }
          ]
        },
        {
          name: "management",
          required: false,
          attributes: [
            { name: "auto_repair", type: "bool" },
            { name: "auto_upgrade", type: "bool" }
          ]
        },
        {
          name: "upgrade_settings",
          required: false,
          attributes: [
            { name: "strategy", type: "string", options: ["SURGE", "BLUE_GREEN"] },
            { name: "max_surge", type: "number" },
            { name: "max_unavailable", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Node pool ID" },
      { name: "instance_group_urls", type: "list", description: "Instance group URLs" },
      { name: "managed_instance_group_urls", type: "list", description: "Managed instance group URLs" },
      { name: "operation", type: "string", description: "Operation" }
    ]
  },
  {
    id: "artifact_registry_repository",
    name: "Artifact Registry",
    description: "Artifact Registry repository",
    terraform_resource: "google_artifact_registry_repository",
    icon: CONTAINERS_ICONS['google_artifact_registry_repository'],
    inputs: {
      required: [
        { name: "repository_id", type: "string", description: "Repository ID" },
        { name: "location", type: "string", description: "Location" },
        { name: "format", type: "string", description: "Repository format", options: ["DOCKER", "MAVEN", "NPM", "APT", "YUM", "PYTHON", "GO", "KFP"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "kms_key_name", type: "string", description: "KMS key name" },
        { name: "mode", type: "string", description: "Repository mode", options: ["STANDARD_REPOSITORY", "VIRTUAL_REPOSITORY", "REMOTE_REPOSITORY"] },
        { name: "cleanup_policy_dry_run", type: "bool", description: "Cleanup policy dry run" }
      ],
      blocks: [
        {
          name: "docker_config",
          required: false,
          attributes: [
            { name: "immutable_tags", type: "bool" }
          ]
        },
        {
          name: "maven_config",
          required: false,
          attributes: [
            { name: "allow_snapshot_overwrites", type: "bool" },
            { name: "version_policy", type: "string", options: ["VERSION_POLICY_UNSPECIFIED", "RELEASE", "SNAPSHOT"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Repository ID" },
      { name: "name", type: "string", description: "Repository name" },
      { name: "create_time", type: "string", description: "Creation time" },
      { name: "update_time", type: "string", description: "Update time" }
    ]
  },
  {
    id: "cloud_run_service",
    name: "Cloud Run Service",
    description: "Serverless container service",
    terraform_resource: "google_cloud_run_service",
    icon: CONTAINERS_ICONS['google_cloud_run_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Service name" },
        { name: "location", type: "string", description: "Location" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "autogenerate_revision_name", type: "bool", description: "Auto-generate revision name" }
      ],
      blocks: [
        {
          name: "template",
          required: true,
          attributes: [],
          blocks: [
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
                    { name: "working_dir", type: "string" }
                  ],
                  blocks: [
                    {
                      name: "ports",
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string" },
                        { name: "container_port", type: "number" },
                        { name: "protocol", type: "string" }
                      ]
                    },
                    {
                      name: "resources",
                      attributes: [
                        { name: "limits", type: "map" },
                        { name: "requests", type: "map" }
                      ]
                    },
                    {
                      name: "env",
                      multiple: true,
                      attributes: [
                        { name: "name", type: "string", required: true },
                        { name: "value", type: "string" }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "metadata",
              attributes: [
                { name: "name", type: "string" },
                { name: "annotations", type: "map" },
                { name: "labels", type: "map" }
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
            { name: "annotations", type: "map" },
            { name: "labels", type: "map" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "status", type: "list", description: "Service status" }
    ]
  }
];

// All containers terraform resources
export const CONTAINERS_TERRAFORM_RESOURCES = CONTAINERS_SERVICES.map(s => s.terraform_resource);

// Get containers service by terraform resource name
export function getContainersServiceByTerraformResource(terraformResource: string): ContainersServiceDefinition | undefined {
  return CONTAINERS_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get containers service by ID
export function getContainersServiceById(id: string): ContainersServiceDefinition | undefined {
  return CONTAINERS_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a containers resource
export function isContainersResource(terraformResource: string): boolean {
  return CONTAINERS_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get containers icon
export function getContainersIcon(terraformResource: string): string | undefined {
  return CONTAINERS_ICONS[terraformResource];
}

