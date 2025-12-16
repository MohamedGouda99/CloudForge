/**
 * GCP Compute Services Data - Complete definitions from compute.json
 * This file contains ALL 10 compute services with ALL their properties
 * 
 * Services included:
 * 1. Compute Instance (google_compute_instance)
 * 2. Instance Template (google_compute_instance_template)
 * 3. Instance Group Manager (google_compute_instance_group_manager)
 * 4. Regional Instance Group Manager (google_compute_region_instance_group_manager)
 * 5. Autoscaler (google_compute_autoscaler)
 * 6. Persistent Disk (google_compute_disk)
 * 7. Disk Snapshot (google_compute_snapshot)
 * 8. Compute Image (google_compute_image)
 * 9. Static IP Address (google_compute_address)
 * 10. Global Static IP (google_compute_global_address)
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

// GCP Compute service icon mappings - using GCP core products and legacy icons
export const COMPUTE_ICONS: Record<string, string> = {
  'google_compute_instance': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_instance_template': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_instance_group_manager': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_region_instance_group_manager': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_autoscaler': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_disk': '/api/icons/gcp/google-cloud-legacy-icons/persistent_disk/persistent_disk.svg',
  'google_compute_snapshot': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_image': '/api/icons/gcp/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  'google_compute_address': '/api/icons/gcp/google-cloud-legacy-icons/cloud_external_ip_addresses/cloud_external_ip_addresses.svg',
  'google_compute_global_address': '/api/icons/gcp/google-cloud-legacy-icons/cloud_external_ip_addresses/cloud_external_ip_addresses.svg',
};

// Compute service definition interface
export interface ComputeServiceDefinition {
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

// Helper function to convert JSON blocks to ServiceBlock format
function convertBlock(block: any): ServiceBlock {
  return {
    name: block.name,
    required: block.required || false,
    multiple: block.multiple || false,
    attributes: (block.attributes || []).map((attr: any) => ({
      name: attr.name,
      type: attr.type,
      description: attr.description,
      options: attr.options,
      default: attr.default,
      required: attr.required || false,
      sensitive: attr.sensitive || false,
    })),
    blocks: block.blocks ? block.blocks.map(convertBlock) : undefined,
  };
}

// Complete compute services data from compute.json
export const COMPUTE_SERVICES: ComputeServiceDefinition[] = [
  {
    id: "compute_instance",
    name: "Compute Instance",
    description: "Google Compute Engine virtual machine",
    terraform_resource: "google_compute_instance",
    icon: COMPUTE_ICONS['google_compute_instance'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Instance name" },
        { name: "machine_type", type: "string", description: "Machine type", options: ["e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4", "e2-standard-8", "n1-standard-1", "n1-standard-2", "n1-standard-4", "n1-standard-8", "n2-standard-2", "n2-standard-4", "n2-standard-8", "n2d-standard-2", "c2-standard-4", "c2-standard-8", "m1-ultramem-40", "a2-highgpu-1g"] },
        { name: "zone", type: "string", description: "GCP zone" }
      ],
      optional: [
        { name: "project", type: "string", description: "GCP project ID" },
        { name: "description", type: "string", description: "Instance description" },
        { name: "deletion_protection", type: "bool", description: "Deletion protection", default: false },
        { name: "hostname", type: "string", description: "Custom hostname" },
        { name: "can_ip_forward", type: "bool", description: "Allow IP forwarding", default: false },
        { name: "labels", type: "map", description: "Resource labels" },
        { name: "metadata", type: "map", description: "Metadata key/value pairs" },
        { name: "metadata_startup_script", type: "string", description: "Startup script" },
        { name: "min_cpu_platform", type: "string", description: "Minimum CPU platform" },
        { name: "allow_stopping_for_update", type: "bool", description: "Allow stop for update" },
        { name: "desired_status", type: "string", description: "Desired status", options: ["RUNNING", "TERMINATED"] },
        { name: "enable_display", type: "bool", description: "Enable virtual display" },
        { name: "resource_policies", type: "list", description: "Resource policy self links" },
        { name: "tags", type: "list", description: "Network tags" }
      ],
      blocks: [
        {
          name: "boot_disk",
          required: true,
          attributes: [
            { name: "auto_delete", type: "bool", default: true },
            { name: "device_name", type: "string" },
            { name: "mode", type: "string", options: ["READ_WRITE", "READ_ONLY"] },
            { name: "disk_encryption_key_raw", type: "string", sensitive: true },
            { name: "kms_key_self_link", type: "string" },
            { name: "source", type: "string" }
          ],
          blocks: [
            {
              name: "initialize_params",
              attributes: [
                { name: "size", type: "number" },
                { name: "type", type: "string", options: ["pd-standard", "pd-balanced", "pd-ssd", "pd-extreme"] },
                { name: "image", type: "string" },
                { name: "labels", type: "map" }
              ]
            }
          ]
        },
        {
          name: "network_interface",
          required: true,
          multiple: true,
          attributes: [
            { name: "network", type: "string", reference: "google_compute_network.self_link" },
            { name: "subnetwork", type: "string", reference: "google_compute_subnetwork.self_link" },
            { name: "subnetwork_project", type: "string" },
            { name: "network_ip", type: "string" },
            { name: "nic_type", type: "string", options: ["GVNIC", "VIRTIO_NET"] },
            { name: "stack_type", type: "string", options: ["IPV4_ONLY", "IPV4_IPV6"] },
            { name: "queue_count", type: "number" }
          ],
          blocks: [
            {
              name: "access_config",
              attributes: [
                { name: "nat_ip", type: "string" },
                { name: "public_ptr_domain_name", type: "string" },
                { name: "network_tier", type: "string", options: ["PREMIUM", "STANDARD"] }
              ]
            },
            {
              name: "alias_ip_range",
              multiple: true,
              attributes: [
                { name: "ip_cidr_range", type: "string", required: true },
                { name: "subnetwork_range_name", type: "string" }
              ]
            }
          ]
        },
        {
          name: "attached_disk",
          required: false,
          multiple: true,
          attributes: [
            { name: "source", type: "string", required: true },
            { name: "device_name", type: "string" },
            { name: "mode", type: "string", options: ["READ_WRITE", "READ_ONLY"] },
            { name: "disk_encryption_key_raw", type: "string", sensitive: true },
            { name: "kms_key_self_link", type: "string" }
          ]
        },
        {
          name: "scratch_disk",
          required: false,
          multiple: true,
          attributes: [
            { name: "interface", type: "string", required: true, options: ["SCSI", "NVME"] }
          ]
        },
        {
          name: "service_account",
          required: false,
          attributes: [
            { name: "email", type: "string" },
            { name: "scopes", type: "list", required: true }
          ]
        },
        {
          name: "scheduling",
          required: false,
          attributes: [
            { name: "preemptible", type: "bool", default: false },
            { name: "on_host_maintenance", type: "string", options: ["MIGRATE", "TERMINATE"] },
            { name: "automatic_restart", type: "bool", default: true },
            { name: "provisioning_model", type: "string", options: ["STANDARD", "SPOT"] },
            { name: "instance_termination_action", type: "string", options: ["DELETE", "STOP"] },
            { name: "min_node_cpus", type: "number" }
          ],
          blocks: [
            {
              name: "node_affinities",
              multiple: true,
              attributes: [
                { name: "key", type: "string", required: true },
                { name: "operator", type: "string", required: true },
                { name: "values", type: "list", required: true }
              ]
            }
          ]
        },
        {
          name: "shielded_instance_config",
          required: false,
          attributes: [
            { name: "enable_secure_boot", type: "bool", default: false },
            { name: "enable_vtpm", type: "bool", default: true },
            { name: "enable_integrity_monitoring", type: "bool", default: true }
          ]
        },
        {
          name: "confidential_instance_config",
          required: false,
          attributes: [
            { name: "enable_confidential_compute", type: "bool", required: true }
          ]
        },
        {
          name: "advanced_machine_features",
          required: false,
          attributes: [
            { name: "enable_nested_virtualization", type: "bool" },
            { name: "threads_per_core", type: "number" },
            { name: "visible_core_count", type: "number" }
          ]
        },
        {
          name: "reservation_affinity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true, options: ["ANY_RESERVATION", "SPECIFIC_RESERVATION", "NO_RESERVATION"] }
          ],
          blocks: [
            {
              name: "specific_reservation",
              attributes: [
                { name: "key", type: "string", required: true },
                { name: "values", type: "list", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "instance_id", type: "string", description: "Server instance ID" },
      { name: "self_link", type: "string", description: "Self link URI" },
      { name: "cpu_platform", type: "string", description: "CPU platform" },
      { name: "current_status", type: "string", description: "Current status" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" },
      { name: "metadata_fingerprint", type: "string", description: "Metadata fingerprint" },
      { name: "tags_fingerprint", type: "string", description: "Tags fingerprint" },
      { name: "network_interface", type: "list", description: "Network interface details" }
    ]
  },
  {
    id: "compute_instance_template",
    name: "Instance Template",
    description: "Template for creating VM instances",
    terraform_resource: "google_compute_instance_template",
    icon: COMPUTE_ICONS['google_compute_instance_template'],
    inputs: {
      required: [
        { name: "machine_type", type: "string", description: "Machine type" }
      ],
      optional: [
        { name: "name", type: "string", description: "Template name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "can_ip_forward", type: "bool", description: "IP forwarding" },
        { name: "instance_description", type: "string", description: "Instance description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "metadata", type: "map", description: "Metadata" },
        { name: "metadata_startup_script", type: "string", description: "Startup script" },
        { name: "min_cpu_platform", type: "string", description: "Min CPU platform" },
        { name: "tags", type: "list", description: "Network tags" }
      ],
      blocks: [
        {
          name: "disk",
          required: true,
          multiple: true,
          attributes: [
            { name: "auto_delete", type: "bool" },
            { name: "boot", type: "bool" },
            { name: "device_name", type: "string" },
            { name: "disk_name", type: "string" },
            { name: "disk_size_gb", type: "number" },
            { name: "disk_type", type: "string" },
            { name: "interface", type: "string" },
            { name: "mode", type: "string" },
            { name: "source", type: "string" },
            { name: "source_image", type: "string" },
            { name: "type", type: "string" },
            { name: "labels", type: "map" },
            { name: "resource_policies", type: "list" }
          ]
        },
        {
          name: "network_interface",
          required: true,
          multiple: true,
          attributes: [
            { name: "network", type: "string" },
            { name: "subnetwork", type: "string" },
            { name: "subnetwork_project", type: "string" },
            { name: "network_ip", type: "string" },
            { name: "nic_type", type: "string" },
            { name: "stack_type", type: "string" },
            { name: "queue_count", type: "number" }
          ]
        },
        {
          name: "service_account",
          required: false,
          attributes: [
            { name: "email", type: "string" },
            { name: "scopes", type: "list", required: true }
          ]
        },
        {
          name: "scheduling",
          required: false,
          attributes: [
            { name: "preemptible", type: "bool" },
            { name: "on_host_maintenance", type: "string" },
            { name: "automatic_restart", type: "bool" },
            { name: "provisioning_model", type: "string" }
          ]
        },
        {
          name: "shielded_instance_config",
          required: false,
          attributes: [
            { name: "enable_secure_boot", type: "bool" },
            { name: "enable_vtpm", type: "bool" },
            { name: "enable_integrity_monitoring", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Template ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "self_link_unique", type: "string", description: "Unique self link" },
      { name: "metadata_fingerprint", type: "string", description: "Metadata fingerprint" },
      { name: "tags_fingerprint", type: "string", description: "Tags fingerprint" }
    ]
  },
  {
    id: "compute_instance_group_manager",
    name: "Instance Group Manager",
    description: "Managed instance group",
    terraform_resource: "google_compute_instance_group_manager",
    icon: COMPUTE_ICONS['google_compute_instance_group_manager'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Manager name" },
        { name: "base_instance_name", type: "string", description: "Base instance name" },
        { name: "zone", type: "string", description: "GCP zone" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "target_size", type: "number", description: "Target number of instances" },
        { name: "target_pools", type: "list", description: "Target pool URLs" },
        { name: "wait_for_instances", type: "bool", description: "Wait for instances" },
        { name: "wait_for_instances_status", type: "string", description: "Wait status", options: ["STABLE", "UPDATED"] }
      ],
      blocks: [
        {
          name: "version",
          required: true,
          multiple: true,
          attributes: [
            { name: "instance_template", type: "string", required: true },
            { name: "name", type: "string" }
          ],
          blocks: [
            {
              name: "target_size",
              attributes: [
                { name: "fixed", type: "number" },
                { name: "percent", type: "number" }
              ]
            }
          ]
        },
        {
          name: "named_port",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "port", type: "number", required: true }
          ]
        },
        {
          name: "auto_healing_policies",
          required: false,
          attributes: [
            { name: "health_check", type: "string", required: true },
            { name: "initial_delay_sec", type: "number", required: true }
          ]
        },
        {
          name: "update_policy",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true, options: ["OPPORTUNISTIC", "PROACTIVE"] },
            { name: "minimal_action", type: "string", required: true, options: ["NONE", "REFRESH", "RESTART", "REPLACE"] },
            { name: "most_disruptive_allowed_action", type: "string" },
            { name: "max_surge_fixed", type: "number" },
            { name: "max_surge_percent", type: "number" },
            { name: "max_unavailable_fixed", type: "number" },
            { name: "max_unavailable_percent", type: "number" },
            { name: "replacement_method", type: "string", options: ["RECREATE", "SUBSTITUTE"] }
          ]
        },
        {
          name: "stateful_disk",
          required: false,
          multiple: true,
          attributes: [
            { name: "device_name", type: "string", required: true },
            { name: "delete_rule", type: "string", options: ["NEVER", "ON_PERMANENT_INSTANCE_DELETION"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Manager ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "instance_group", type: "string", description: "Instance group URL" },
      { name: "fingerprint", type: "string", description: "Fingerprint" }
    ]
  },
  {
    id: "compute_region_instance_group_manager",
    name: "Regional Instance Group Manager",
    description: "Regional managed instance group",
    terraform_resource: "google_compute_region_instance_group_manager",
    icon: COMPUTE_ICONS['google_compute_region_instance_group_manager'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Manager name" },
        { name: "base_instance_name", type: "string", description: "Base instance name" },
        { name: "region", type: "string", description: "GCP region" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "target_size", type: "number", description: "Target size" },
        { name: "distribution_policy_zones", type: "list", description: "Distribution zones" },
        { name: "distribution_policy_target_shape", type: "string", description: "Distribution shape", options: ["EVEN", "BALANCED", "ANY", "ANY_SINGLE_ZONE"] }
      ],
      blocks: [
        {
          name: "version",
          required: true,
          multiple: true,
          attributes: [
            { name: "instance_template", type: "string", required: true },
            { name: "name", type: "string" }
          ]
        },
        {
          name: "update_policy",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "minimal_action", type: "string", required: true },
            { name: "max_surge_fixed", type: "number" },
            { name: "max_unavailable_fixed", type: "number" },
            { name: "instance_redistribution_type", type: "string", options: ["PROACTIVE", "NONE"] }
          ]
        },
        {
          name: "auto_healing_policies",
          required: false,
          attributes: [
            { name: "health_check", type: "string", required: true },
            { name: "initial_delay_sec", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Manager ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "instance_group", type: "string", description: "Instance group URL" },
      { name: "fingerprint", type: "string", description: "Fingerprint" }
    ]
  },
  {
    id: "compute_autoscaler",
    name: "Autoscaler",
    description: "Auto-scaling for managed instance groups",
    terraform_resource: "google_compute_autoscaler",
    icon: COMPUTE_ICONS['google_compute_autoscaler'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Autoscaler name" },
        { name: "zone", type: "string", description: "GCP zone" },
        { name: "target", type: "string", description: "Target instance group manager" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" }
      ],
      blocks: [
        {
          name: "autoscaling_policy",
          required: true,
          attributes: [
            { name: "min_replicas", type: "number", required: true },
            { name: "max_replicas", type: "number", required: true },
            { name: "cooldown_period", type: "number", default: 60 },
            { name: "mode", type: "string", options: ["OFF", "ONLY_UP", "ONLY_DOWN", "ON"] }
          ],
          blocks: [
            {
              name: "cpu_utilization",
              attributes: [
                { name: "target", type: "number", required: true },
                { name: "predictive_method", type: "string", options: ["NONE", "OPTIMIZE_AVAILABILITY"] }
              ]
            },
            {
              name: "metric",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "target", type: "number" },
                { name: "type", type: "string", options: ["GAUGE", "DELTA_PER_SECOND", "DELTA_PER_MINUTE"] },
                { name: "filter", type: "string" },
                { name: "single_instance_assignment", type: "number" }
              ]
            },
            {
              name: "load_balancing_utilization",
              attributes: [
                { name: "target", type: "number", required: true }
              ]
            },
            {
              name: "scale_in_control",
              attributes: [
                { name: "time_window_sec", type: "number" }
              ],
              blocks: [
                {
                  name: "max_scaled_in_replicas",
                  attributes: [
                    { name: "fixed", type: "number" },
                    { name: "percent", type: "number" }
                  ]
                }
              ]
            },
            {
              name: "scaling_schedules",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "min_required_replicas", type: "number", required: true },
                { name: "schedule", type: "string", required: true },
                { name: "time_zone", type: "string" },
                { name: "duration_sec", type: "number", required: true },
                { name: "description", type: "string" },
                { name: "disabled", type: "bool" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Autoscaler ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "creation_timestamp", type: "string", description: "Creation time" }
    ]
  },
  {
    id: "compute_disk",
    name: "Persistent Disk",
    description: "Persistent disk for VMs",
    terraform_resource: "google_compute_disk",
    icon: COMPUTE_ICONS['google_compute_disk'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Disk name" },
        { name: "zone", type: "string", description: "GCP zone" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "size", type: "number", description: "Disk size in GB" },
        { name: "type", type: "string", description: "Disk type", options: ["pd-standard", "pd-balanced", "pd-ssd", "pd-extreme"] },
        { name: "image", type: "string", description: "Source image" },
        { name: "snapshot", type: "string", description: "Source snapshot" },
        { name: "source_disk", type: "string", description: "Source disk" },
        { name: "physical_block_size_bytes", type: "number", description: "Block size", options: [4096, 16384] },
        { name: "provisioned_iops", type: "number", description: "Provisioned IOPS" },
        { name: "provisioned_throughput", type: "number", description: "Provisioned throughput" },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: [
        {
          name: "disk_encryption_key",
          required: false,
          attributes: [
            { name: "raw_key", type: "string", sensitive: true },
            { name: "sha256", type: "string" },
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        },
        {
          name: "source_image_encryption_key",
          required: false,
          attributes: [
            { name: "raw_key", type: "string", sensitive: true },
            { name: "sha256", type: "string" },
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        },
        {
          name: "source_snapshot_encryption_key",
          required: false,
          attributes: [
            { name: "raw_key", type: "string", sensitive: true },
            { name: "sha256", type: "string" },
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        },
        {
          name: "guest_os_features",
          required: false,
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["MULTI_IP_SUBNET", "SECURE_BOOT", "SEV_CAPABLE", "UEFI_COMPATIBLE", "VIRTIO_SCSI_MULTIQUEUE", "WINDOWS", "GVNIC", "SEV_LIVE_MIGRATABLE", "SEV_SNP_CAPABLE", "SUSPEND_RESUME_COMPATIBLE", "TDX_CAPABLE"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Disk ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "source_image_id", type: "string", description: "Source image ID" },
      { name: "source_snapshot_id", type: "string", description: "Source snapshot ID" },
      { name: "source_disk_id", type: "string", description: "Source disk ID" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" },
      { name: "last_attach_timestamp", type: "string", description: "Last attach time" },
      { name: "last_detach_timestamp", type: "string", description: "Last detach time" },
      { name: "users", type: "list", description: "Users of disk" }
    ]
  },
  {
    id: "compute_snapshot",
    name: "Disk Snapshot",
    description: "Snapshot of a persistent disk",
    terraform_resource: "google_compute_snapshot",
    icon: COMPUTE_ICONS['google_compute_snapshot'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Snapshot name" },
        { name: "source_disk", type: "string", description: "Source disk" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "zone", type: "string", description: "Zone of source disk" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "storage_locations", type: "list", description: "Storage locations" },
        { name: "chain_name", type: "string", description: "Snapshot chain name" }
      ],
      blocks: [
        {
          name: "snapshot_encryption_key",
          required: false,
          attributes: [
            { name: "raw_key", type: "string", sensitive: true },
            { name: "sha256", type: "string" },
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        },
        {
          name: "source_disk_encryption_key",
          required: false,
          attributes: [
            { name: "raw_key", type: "string", sensitive: true },
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Snapshot ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "snapshot_id", type: "number", description: "Unique snapshot ID" },
      { name: "creation_timestamp", type: "string", description: "Creation time" },
      { name: "disk_size_gb", type: "number", description: "Disk size" },
      { name: "storage_bytes", type: "number", description: "Storage bytes" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" }
    ]
  },
  {
    id: "compute_image",
    name: "Compute Image",
    description: "Custom boot disk image",
    terraform_resource: "google_compute_image",
    icon: COMPUTE_ICONS['google_compute_image'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Image name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "family", type: "string", description: "Image family" },
        { name: "source_disk", type: "string", description: "Source disk" },
        { name: "source_image", type: "string", description: "Source image" },
        { name: "source_snapshot", type: "string", description: "Source snapshot" },
        { name: "disk_size_gb", type: "number", description: "Disk size in GB" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "licenses", type: "list", description: "License URLs" }
      ],
      blocks: [
        {
          name: "raw_disk",
          required: false,
          attributes: [
            { name: "source", type: "string", required: true },
            { name: "sha1", type: "string" },
            { name: "container_type", type: "string", default: "TAR" }
          ]
        },
        {
          name: "guest_os_features",
          required: false,
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true }
          ]
        },
        {
          name: "image_encryption_key",
          required: false,
          attributes: [
            { name: "kms_key_self_link", type: "string" },
            { name: "kms_key_service_account", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Image ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "archive_size_bytes", type: "number", description: "Archive size" },
      { name: "creation_timestamp", type: "string", description: "Creation time" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" }
    ]
  },
  {
    id: "compute_address",
    name: "Static IP Address",
    description: "Static external IP address",
    terraform_resource: "google_compute_address",
    icon: COMPUTE_ICONS['google_compute_address'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Address name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "address", type: "string", description: "Static IP address" },
        { name: "address_type", type: "string", description: "Address type", options: ["INTERNAL", "EXTERNAL"] },
        { name: "purpose", type: "string", description: "Purpose", options: ["GCE_ENDPOINT", "SHARED_LOADBALANCER_VIP", "VPC_PEERING", "IPSEC_INTERCONNECT", "PRIVATE_SERVICE_CONNECT"] },
        { name: "network_tier", type: "string", description: "Network tier", options: ["PREMIUM", "STANDARD"] },
        { name: "subnetwork", type: "string", description: "Subnetwork for internal" },
        { name: "network", type: "string", description: "Network" },
        { name: "prefix_length", type: "number", description: "Prefix length" },
        { name: "labels", type: "map", description: "Labels" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Address ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "address", type: "string", description: "IP address" },
      { name: "creation_timestamp", type: "string", description: "Creation time" },
      { name: "users", type: "list", description: "Users of address" }
    ]
  },
  {
    id: "compute_global_address",
    name: "Global Static IP",
    description: "Global static IP address",
    terraform_resource: "google_compute_global_address",
    icon: COMPUTE_ICONS['google_compute_global_address'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Address name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "address", type: "string", description: "IP address" },
        { name: "address_type", type: "string", description: "Address type", options: ["INTERNAL", "EXTERNAL"] },
        { name: "purpose", type: "string", description: "Purpose", options: ["VPC_PEERING", "PRIVATE_SERVICE_CONNECT"] },
        { name: "ip_version", type: "string", description: "IP version", options: ["IPV4", "IPV6"] },
        { name: "prefix_length", type: "number", description: "Prefix length" },
        { name: "network", type: "string", description: "Network" },
        { name: "labels", type: "map", description: "Labels" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Address ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "address", type: "string", description: "IP address" },
      { name: "creation_timestamp", type: "string", description: "Creation time" }
    ]
  }
];

// All compute terraform resources
export const COMPUTE_TERRAFORM_RESOURCES = COMPUTE_SERVICES.map(s => s.terraform_resource);

// Get compute service by terraform resource name
export function getComputeServiceByTerraformResource(terraformResource: string): ComputeServiceDefinition | undefined {
  return COMPUTE_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get compute service by ID
export function getComputeServiceById(id: string): ComputeServiceDefinition | undefined {
  return COMPUTE_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a compute resource
export function isComputeResource(terraformResource: string): boolean {
  return COMPUTE_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get compute icon
export function getComputeIcon(terraformResource: string): string | undefined {
  return COMPUTE_ICONS[terraformResource];
}

