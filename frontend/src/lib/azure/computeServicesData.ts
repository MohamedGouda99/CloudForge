/**
 * Azure Compute Services Data - Complete definitions from compute.json
 * This file contains ALL 6 compute services with ALL their properties
 * 
 * Services included:
 * 1. Linux Virtual Machine (azurerm_linux_virtual_machine)
 * 2. Windows Virtual Machine (azurerm_windows_virtual_machine)
 * 3. Linux Virtual Machine Scale Set (azurerm_linux_virtual_machine_scale_set)
 * 4. Availability Set (azurerm_availability_set)
 * 5. Managed Disk (azurerm_managed_disk)
 * 6. Image (azurerm_image)
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

// Azure Compute service icon mappings - using Azure Public Service Icons
export const COMPUTE_ICONS: Record<string, string> = {
  'azurerm_linux_virtual_machine': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10021-icon-service-Virtual-Machine.svg',
  'azurerm_windows_virtual_machine': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10021-icon-service-Virtual-Machine.svg',
  'azurerm_linux_virtual_machine_scale_set': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10034-icon-service-VM-Scale-Sets.svg',
  'azurerm_availability_set': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10025-icon-service-Availability-Sets.svg',
  'azurerm_managed_disk': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10032-icon-service-Disks.svg',
  'azurerm_image': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/compute/10033-icon-service-Images.svg',
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

// Complete compute services data from compute.json
export const COMPUTE_SERVICES: ComputeServiceDefinition[] = [
  {
    id: "virtual_machine",
    name: "Virtual Machine",
    description: "Azure Virtual Machine",
    terraform_resource: "azurerm_linux_virtual_machine",
    icon: COMPUTE_ICONS['azurerm_linux_virtual_machine'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "VM name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "size", type: "string", description: "VM size (e.g., Standard_D2s_v3)" },
        { name: "admin_username", type: "string", description: "Admin username" },
        { name: "network_interface_ids", type: "list", description: "Network interface IDs" }
      ],
      optional: [
        { name: "admin_password", type: "string", description: "Admin password", sensitive: true },
        { name: "disable_password_authentication", type: "bool", description: "Disable password auth", default: true },
        { name: "computer_name", type: "string", description: "Computer name" },
        { name: "custom_data", type: "string", description: "Custom data (base64)" },
        { name: "user_data", type: "string", description: "User data (base64)" },
        { name: "availability_set_id", type: "string", description: "Availability set ID" },
        { name: "zone", type: "string", description: "Availability zone" },
        { name: "proximity_placement_group_id", type: "string", description: "Proximity placement group ID" },
        { name: "dedicated_host_id", type: "string", description: "Dedicated host ID" },
        { name: "dedicated_host_group_id", type: "string", description: "Dedicated host group ID" },
        { name: "virtual_machine_scale_set_id", type: "string", description: "VMSS ID" },
        { name: "platform_fault_domain", type: "number", description: "Platform fault domain" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "encryption_at_host_enabled", type: "bool", description: "Encryption at host" },
        { name: "extensions_time_budget", type: "string", description: "Extensions time budget" },
        { name: "eviction_policy", type: "string", description: "Eviction policy", options: ["Deallocate", "Delete"] },
        { name: "max_bid_price", type: "number", description: "Max bid price" },
        { name: "priority", type: "string", description: "Priority", options: ["Regular", "Spot"] },
        { name: "provision_vm_agent", type: "bool", description: "Provision VM agent", default: true },
        { name: "secure_boot_enabled", type: "bool", description: "Secure boot" },
        { name: "vtpm_enabled", type: "bool", description: "vTPM enabled" },
        { name: "license_type", type: "string", description: "License type" },
        { name: "allow_extension_operations", type: "bool", description: "Allow extension operations", default: true },
        { name: "patch_assessment_mode", type: "string", description: "Patch assessment mode" },
        { name: "patch_mode", type: "string", description: "Patch mode" },
        { name: "reboot_setting", type: "string", description: "Reboot setting" },
        { name: "bypass_platform_safety_checks_on_user_schedule_enabled", type: "bool", description: "Bypass platform safety checks" },
        { name: "source_image_id", type: "string", description: "Source image ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "admin_ssh_key",
          required: false,
          multiple: true,
          attributes: [
            { name: "username", type: "string", required: true },
            { name: "public_key", type: "string", required: true }
          ]
        },
        {
          name: "os_disk",
          required: true,
          attributes: [
            { name: "caching", type: "string", required: true, options: ["None", "ReadOnly", "ReadWrite"] },
            { name: "storage_account_type", type: "string", required: true, options: ["Standard_LRS", "StandardSSD_LRS", "Premium_LRS", "StandardSSD_ZRS", "Premium_ZRS"] },
            { name: "disk_size_gb", type: "number" },
            { name: "name", type: "string" },
            { name: "disk_encryption_set_id", type: "string" },
            { name: "secure_vm_disk_encryption_set_id", type: "string" },
            { name: "security_encryption_type", type: "string" },
            { name: "write_accelerator_enabled", type: "bool" }
          ],
          blocks: [
            {
              name: "diff_disk_settings",
              attributes: [
                { name: "option", type: "string", required: true },
                { name: "placement", type: "string" }
              ]
            }
          ]
        },
        {
          name: "source_image_reference",
          required: false,
          attributes: [
            { name: "publisher", type: "string", required: true },
            { name: "offer", type: "string", required: true },
            { name: "sku", type: "string", required: true },
            { name: "version", type: "string", required: true }
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
          name: "boot_diagnostics",
          required: false,
          attributes: [
            { name: "storage_account_uri", type: "string" }
          ]
        },
        {
          name: "plan",
          required: false,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "publisher", type: "string", required: true },
            { name: "product", type: "string", required: true }
          ]
        },
        {
          name: "additional_capabilities",
          required: false,
          attributes: [
            { name: "ultra_ssd_enabled", type: "bool" },
            { name: "hibernation_enabled", type: "bool" }
          ]
        },
        {
          name: "secret",
          required: false,
          multiple: true,
          attributes: [
            { name: "key_vault_id", type: "string", required: true }
          ],
          blocks: [
            {
              name: "certificate",
              required: true,
              multiple: true,
              attributes: [
                { name: "url", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "gallery_application",
          required: false,
          multiple: true,
          attributes: [
            { name: "version_id", type: "string", required: true },
            { name: "configuration_blob_uri", type: "string" },
            { name: "order", type: "number" },
            { name: "tag", type: "string" }
          ]
        },
        {
          name: "termination_notification",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "timeout", type: "string" }
          ]
        },
        {
          name: "os_image_notification",
          required: false,
          attributes: [
            { name: "timeout", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VM ID" },
      { name: "private_ip_address", type: "string", description: "Private IP" },
      { name: "private_ip_addresses", type: "list", description: "Private IPs" },
      { name: "public_ip_address", type: "string", description: "Public IP" },
      { name: "public_ip_addresses", type: "list", description: "Public IPs" },
      { name: "virtual_machine_id", type: "string", description: "VM unique ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "windows_virtual_machine",
    name: "Windows Virtual Machine",
    description: "Azure Windows Virtual Machine",
    terraform_resource: "azurerm_windows_virtual_machine",
    icon: COMPUTE_ICONS['azurerm_windows_virtual_machine'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "VM name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "size", type: "string", description: "VM size" },
        { name: "admin_username", type: "string", description: "Admin username" },
        { name: "admin_password", type: "string", description: "Admin password", sensitive: true },
        { name: "network_interface_ids", type: "list", description: "Network interface IDs" }
      ],
      optional: [
        { name: "computer_name", type: "string", description: "Computer name" },
        { name: "custom_data", type: "string", description: "Custom data (base64)" },
        { name: "enable_automatic_updates", type: "bool", description: "Enable auto updates", default: true },
        { name: "hotpatching_enabled", type: "bool", description: "Hotpatching enabled" },
        { name: "license_type", type: "string", description: "License type" },
        { name: "timezone", type: "string", description: "Timezone" },
        { name: "zone", type: "string", description: "Availability zone" },
        { name: "encryption_at_host_enabled", type: "bool", description: "Encryption at host" },
        { name: "secure_boot_enabled", type: "bool", description: "Secure boot" },
        { name: "vtpm_enabled", type: "bool", description: "vTPM enabled" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "os_disk",
          required: true,
          attributes: [
            { name: "caching", type: "string", required: true },
            { name: "storage_account_type", type: "string", required: true },
            { name: "disk_size_gb", type: "number" },
            { name: "name", type: "string" }
          ]
        },
        {
          name: "source_image_reference",
          required: false,
          attributes: [
            { name: "publisher", type: "string", required: true },
            { name: "offer", type: "string", required: true },
            { name: "sku", type: "string", required: true },
            { name: "version", type: "string", required: true }
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
          name: "boot_diagnostics",
          required: false,
          attributes: [
            { name: "storage_account_uri", type: "string" }
          ]
        },
        {
          name: "winrm_listener",
          required: false,
          multiple: true,
          attributes: [
            { name: "protocol", type: "string", required: true },
            { name: "certificate_url", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VM ID" },
      { name: "private_ip_address", type: "string", description: "Private IP" },
      { name: "public_ip_address", type: "string", description: "Public IP" },
      { name: "virtual_machine_id", type: "string", description: "VM unique ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "virtual_machine_scale_set",
    name: "Virtual Machine Scale Set",
    description: "Azure Linux Virtual Machine Scale Set",
    terraform_resource: "azurerm_linux_virtual_machine_scale_set",
    icon: COMPUTE_ICONS['azurerm_linux_virtual_machine_scale_set'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Scale set name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "VM size" },
        { name: "instances", type: "number", description: "Instance count" },
        { name: "admin_username", type: "string", description: "Admin username" }
      ],
      optional: [
        { name: "admin_password", type: "string", description: "Admin password", sensitive: true },
        { name: "disable_password_authentication", type: "bool", description: "Disable password auth", default: true },
        { name: "upgrade_mode", type: "string", description: "Upgrade mode", options: ["Automatic", "Manual", "Rolling"] },
        { name: "health_probe_id", type: "string", description: "Health probe ID" },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "zone_balance", type: "bool", description: "Zone balance" },
        { name: "single_placement_group", type: "bool", description: "Single placement group" },
        { name: "platform_fault_domain_count", type: "number", description: "Fault domain count" },
        { name: "overprovision", type: "bool", description: "Overprovision", default: true },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "extension_operations_enabled", type: "bool", description: "Extension operations enabled" },
        { name: "extensions_time_budget", type: "string", description: "Extensions time budget" },
        { name: "capacity_reservation_group_id", type: "string", description: "Capacity reservation group ID" },
        { name: "computer_name_prefix", type: "string", description: "Computer name prefix" },
        { name: "custom_data", type: "string", description: "Custom data (base64)" },
        { name: "encryption_at_host_enabled", type: "bool", description: "Encryption at host" },
        { name: "eviction_policy", type: "string", description: "Eviction policy" },
        { name: "max_bid_price", type: "number", description: "Max bid price" },
        { name: "priority", type: "string", description: "Priority" },
        { name: "provision_vm_agent", type: "bool", description: "Provision VM agent", default: true },
        { name: "proximity_placement_group_id", type: "string", description: "Proximity placement group ID" },
        { name: "scale_in_policy", type: "string", description: "Scale in policy" },
        { name: "secure_boot_enabled", type: "bool", description: "Secure boot" },
        { name: "vtpm_enabled", type: "bool", description: "vTPM" },
        { name: "source_image_id", type: "string", description: "Source image ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "admin_ssh_key",
          required: false,
          multiple: true,
          attributes: [
            { name: "username", type: "string", required: true },
            { name: "public_key", type: "string", required: true }
          ]
        },
        {
          name: "os_disk",
          required: true,
          attributes: [
            { name: "caching", type: "string", required: true },
            { name: "storage_account_type", type: "string", required: true },
            { name: "disk_size_gb", type: "number" },
            { name: "disk_encryption_set_id", type: "string" },
            { name: "write_accelerator_enabled", type: "bool" }
          ]
        },
        {
          name: "source_image_reference",
          required: false,
          attributes: [
            { name: "publisher", type: "string", required: true },
            { name: "offer", type: "string", required: true },
            { name: "sku", type: "string", required: true },
            { name: "version", type: "string", required: true }
          ]
        },
        {
          name: "network_interface",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "primary", type: "bool" },
            { name: "network_security_group_id", type: "string" },
            { name: "dns_servers", type: "list" },
            { name: "enable_accelerated_networking", type: "bool" },
            { name: "enable_ip_forwarding", type: "bool" }
          ],
          blocks: [
            {
              name: "ip_configuration",
              required: true,
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "primary", type: "bool" },
                { name: "subnet_id", type: "string" },
                { name: "application_gateway_backend_address_pool_ids", type: "list" },
                { name: "application_security_group_ids", type: "list" },
                { name: "load_balancer_backend_address_pool_ids", type: "list" },
                { name: "load_balancer_inbound_nat_rules_ids", type: "list" },
                { name: "version", type: "string" }
              ],
              blocks: [
                {
                  name: "public_ip_address",
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "domain_name_label", type: "string" },
                    { name: "idle_timeout_in_minutes", type: "number" },
                    { name: "public_ip_prefix_id", type: "string" },
                    { name: "sku_name", type: "string" },
                    { name: "version", type: "string" }
                  ],
                  blocks: [
                    {
                      name: "ip_tag",
                      multiple: true,
                      attributes: [
                        { name: "tag", type: "string", required: true },
                        { name: "type", type: "string", required: true }
                      ]
                    }
                  ]
                }
              ]
            }
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
          name: "boot_diagnostics",
          required: false,
          attributes: [
            { name: "storage_account_uri", type: "string" }
          ]
        },
        {
          name: "data_disk",
          required: false,
          multiple: true,
          attributes: [
            { name: "lun", type: "number", required: true },
            { name: "caching", type: "string", required: true },
            { name: "storage_account_type", type: "string", required: true },
            { name: "disk_size_gb", type: "number", required: true },
            { name: "create_option", type: "string" },
            { name: "disk_encryption_set_id", type: "string" },
            { name: "name", type: "string" },
            { name: "ultra_ssd_disk_iops_read_write", type: "number" },
            { name: "ultra_ssd_disk_mbps_read_write", type: "number" },
            { name: "write_accelerator_enabled", type: "bool" }
          ]
        },
        {
          name: "extension",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "publisher", type: "string", required: true },
            { name: "type", type: "string", required: true },
            { name: "type_handler_version", type: "string", required: true },
            { name: "auto_upgrade_minor_version", type: "bool" },
            { name: "automatic_upgrade_enabled", type: "bool" },
            { name: "force_update_tag", type: "string" },
            { name: "protected_settings", type: "string" },
            { name: "provision_after_extensions", type: "list" },
            { name: "settings", type: "string" }
          ],
          blocks: [
            {
              name: "protected_settings_from_key_vault",
              attributes: [
                { name: "secret_url", type: "string", required: true },
                { name: "source_vault_id", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "automatic_os_upgrade_policy",
          required: false,
          attributes: [
            { name: "disable_automatic_rollback", type: "bool", required: true },
            { name: "enable_automatic_os_upgrade", type: "bool", required: true }
          ]
        },
        {
          name: "rolling_upgrade_policy",
          required: false,
          attributes: [
            { name: "cross_zone_upgrades_enabled", type: "bool" },
            { name: "max_batch_instance_percent", type: "number", required: true },
            { name: "max_unhealthy_instance_percent", type: "number", required: true },
            { name: "max_unhealthy_upgraded_instance_percent", type: "number", required: true },
            { name: "pause_time_between_batches", type: "string", required: true },
            { name: "prioritize_unhealthy_instances_enabled", type: "bool" }
          ]
        },
        {
          name: "automatic_instance_repair",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "grace_period", type: "string" }
          ]
        },
        {
          name: "scale_in",
          required: false,
          attributes: [
            { name: "rule", type: "string" },
            { name: "force_deletion_enabled", type: "bool" }
          ]
        },
        {
          name: "spot_restore",
          required: false,
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "timeout", type: "string" }
          ]
        },
        {
          name: "termination_notification",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "timeout", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Scale set ID" },
      { name: "unique_id", type: "string", description: "Unique ID" },
      { name: "identity", type: "list", description: "Managed identity" }
    ]
  },
  {
    id: "availability_set",
    name: "Availability Set",
    description: "Azure Availability Set",
    terraform_resource: "azurerm_availability_set",
    icon: COMPUTE_ICONS['azurerm_availability_set'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Availability set name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "platform_update_domain_count", type: "number", description: "Update domains", default: 5 },
        { name: "platform_fault_domain_count", type: "number", description: "Fault domains", default: 3 },
        { name: "proximity_placement_group_id", type: "string", description: "Proximity placement group ID" },
        { name: "managed", type: "bool", description: "Use managed disks", default: true },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Availability set ID" }
    ]
  },
  {
    id: "managed_disk",
    name: "Managed Disk",
    description: "Azure Managed Disk",
    terraform_resource: "azurerm_managed_disk",
    icon: COMPUTE_ICONS['azurerm_managed_disk'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Disk name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "storage_account_type", type: "string", description: "Storage type", options: ["Standard_LRS", "StandardSSD_LRS", "Premium_LRS", "StandardSSD_ZRS", "Premium_ZRS", "UltraSSD_LRS", "PremiumV2_LRS"] },
        { name: "create_option", type: "string", description: "Create option", options: ["Copy", "Empty", "FromImage", "Import", "ImportSecure", "Restore", "Upload"] }
      ],
      optional: [
        { name: "disk_size_gb", type: "number", description: "Disk size GB" },
        { name: "zone", type: "string", description: "Availability zone" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "hyper_v_generation", type: "string", description: "Hyper-V generation", options: ["V1", "V2"] },
        { name: "image_reference_id", type: "string", description: "Image reference ID" },
        { name: "gallery_image_reference_id", type: "string", description: "Gallery image reference ID" },
        { name: "logical_sector_size", type: "number", description: "Logical sector size" },
        { name: "optimized_frequent_attach_enabled", type: "bool", description: "Optimized frequent attach" },
        { name: "performance_plus_enabled", type: "bool", description: "Performance plus" },
        { name: "os_type", type: "string", description: "OS type", options: ["Linux", "Windows"] },
        { name: "source_resource_id", type: "string", description: "Source resource ID" },
        { name: "source_uri", type: "string", description: "Source URI" },
        { name: "storage_account_id", type: "string", description: "Storage account ID" },
        { name: "tier", type: "string", description: "Tier" },
        { name: "max_shares", type: "number", description: "Max shares" },
        { name: "trusted_launch_enabled", type: "bool", description: "Trusted launch" },
        { name: "on_demand_bursting_enabled", type: "bool", description: "On-demand bursting" },
        { name: "disk_iops_read_write", type: "number", description: "Disk IOPS read/write" },
        { name: "disk_mbps_read_write", type: "number", description: "Disk MBps read/write" },
        { name: "disk_iops_read_only", type: "number", description: "Disk IOPS read only" },
        { name: "disk_mbps_read_only", type: "number", description: "Disk MBps read only" },
        { name: "upload_size_bytes", type: "number", description: "Upload size bytes" },
        { name: "disk_encryption_set_id", type: "string", description: "Disk encryption set ID" },
        { name: "disk_access_id", type: "string", description: "Disk access ID" },
        { name: "public_network_access_enabled", type: "bool", description: "Public network access", default: true },
        { name: "network_access_policy", type: "string", description: "Network access policy", options: ["AllowAll", "AllowPrivate", "DenyAll"] },
        { name: "security_type", type: "string", description: "Security type" },
        { name: "secure_vm_disk_encryption_set_id", type: "string", description: "Secure VM disk encryption set ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "encryption_settings",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "disk_encryption_key",
              attributes: [
                { name: "secret_url", type: "string", required: true },
                { name: "source_vault_id", type: "string", required: true }
              ]
            },
            {
              name: "key_encryption_key",
              attributes: [
                { name: "key_url", type: "string", required: true },
                { name: "source_vault_id", type: "string", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Disk ID" }
    ]
  },
  {
    id: "image",
    name: "Image",
    description: "Azure Custom Image",
    terraform_resource: "azurerm_image",
    icon: COMPUTE_ICONS['azurerm_image'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Image name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "source_virtual_machine_id", type: "string", description: "Source VM ID" },
        { name: "zone_resilient", type: "bool", description: "Zone resilient" },
        { name: "hyper_v_generation", type: "string", description: "Hyper-V generation", options: ["V1", "V2"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "os_disk",
          required: false,
          attributes: [
            { name: "os_type", type: "string", required: true, options: ["Linux", "Windows"] },
            { name: "os_state", type: "string", required: true, options: ["Generalized", "Specialized"] },
            { name: "managed_disk_id", type: "string" },
            { name: "blob_uri", type: "string" },
            { name: "caching", type: "string", options: ["None", "ReadOnly", "ReadWrite"] },
            { name: "size_gb", type: "number" },
            { name: "disk_encryption_set_id", type: "string" }
          ]
        },
        {
          name: "data_disk",
          required: false,
          multiple: true,
          attributes: [
            { name: "lun", type: "number", required: true },
            { name: "managed_disk_id", type: "string" },
            { name: "blob_uri", type: "string" },
            { name: "caching", type: "string", options: ["None", "ReadOnly", "ReadWrite"] },
            { name: "size_gb", type: "number" },
            { name: "disk_encryption_set_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Image ID" }
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









