/**
 * Azure Containers Services Data - Complete definitions from containers.json
 * This file contains ALL 4 containers services with ALL their properties
 * 
 * Services included:
 * 1. Azure Kubernetes Service (azurerm_kubernetes_cluster)
 * 2. AKS Node Pool (azurerm_kubernetes_cluster_node_pool)
 * 3. Container Registry (azurerm_container_registry)
 * 4. Container Instances (azurerm_container_group)
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

// Azure Containers service icon mappings - using Azure Public Service Icons
export const CONTAINERS_ICONS: Record<string, string> = {
  'azurerm_kubernetes_cluster': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/containers/10023-icon-service-Kubernetes-Services.svg',
  'azurerm_kubernetes_cluster_node_pool': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/containers/10023-icon-service-Kubernetes-Services.svg',
  'azurerm_container_registry': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/containers/10105-icon-service-Container-Registries.svg',
  'azurerm_container_group': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/containers/10104-icon-service-Container-Instances.svg',
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

// Complete containers services data from containers.json
export const CONTAINERS_SERVICES: ContainersServiceDefinition[] = [
  {
    id: "kubernetes_cluster",
    name: "Azure Kubernetes Service",
    description: "Managed Kubernetes cluster",
    terraform_resource: "azurerm_kubernetes_cluster",
    icon: CONTAINERS_ICONS['azurerm_kubernetes_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "dns_prefix", type: "string", description: "DNS prefix" }
      ],
      optional: [
        { name: "dns_prefix_private_cluster", type: "string", description: "Private cluster DNS prefix" },
        { name: "automatic_channel_upgrade", type: "string", description: "Auto upgrade channel", options: ["none", "patch", "rapid", "stable", "node-image"] },
        { name: "azure_policy_enabled", type: "bool", description: "Azure Policy enabled" },
        { name: "disk_encryption_set_id", type: "string", description: "Disk encryption set ID" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "http_application_routing_enabled", type: "bool", description: "HTTP app routing" },
        { name: "image_cleaner_enabled", type: "bool", description: "Image cleaner enabled" },
        { name: "image_cleaner_interval_hours", type: "number", description: "Image cleaner interval" },
        { name: "kubernetes_version", type: "string", description: "Kubernetes version" },
        { name: "local_account_disabled", type: "bool", description: "Disable local accounts" },
        { name: "node_os_channel_upgrade", type: "string", description: "Node OS upgrade", options: ["None", "Unmanaged", "SecurityPatch", "NodeImage"] },
        { name: "node_resource_group", type: "string", description: "Node resource group" },
        { name: "oidc_issuer_enabled", type: "bool", description: "OIDC issuer enabled" },
        { name: "open_service_mesh_enabled", type: "bool", description: "Open Service Mesh" },
        { name: "private_cluster_enabled", type: "bool", description: "Private cluster" },
        { name: "private_cluster_public_fqdn_enabled", type: "bool", description: "Public FQDN for private" },
        { name: "private_dns_zone_id", type: "string", description: "Private DNS zone ID" },
        { name: "workload_identity_enabled", type: "bool", description: "Workload identity" },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "role_based_access_control_enabled", type: "bool", description: "RBAC enabled", default: true },
        { name: "run_command_enabled", type: "bool", description: "Run command enabled", default: true },
        { name: "sku_tier", type: "string", description: "SKU tier", options: ["Free", "Standard", "Premium"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "default_node_pool",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "vm_size", type: "string", required: true },
            { name: "node_count", type: "number" },
            { name: "enable_auto_scaling", type: "bool" },
            { name: "min_count", type: "number" },
            { name: "max_count", type: "number" },
            { name: "max_pods", type: "number" },
            { name: "node_labels", type: "map" },
            { name: "only_critical_addons_enabled", type: "bool" },
            { name: "orchestrator_version", type: "string" },
            { name: "os_disk_size_gb", type: "number" },
            { name: "os_disk_type", type: "string", options: ["Managed", "Ephemeral"] },
            { name: "os_sku", type: "string", options: ["Ubuntu", "AzureLinux", "Windows2019", "Windows2022"] },
            { name: "type", type: "string", options: ["VirtualMachineScaleSets", "AvailabilitySet"] },
            { name: "ultra_ssd_enabled", type: "bool" },
            { name: "vnet_subnet_id", type: "string" },
            { name: "zones", type: "list" },
            { name: "temporary_name_for_rotation", type: "string" },
            { name: "tags", type: "map" }
          ],
          blocks: [
            {
              name: "upgrade_settings",
              attributes: [
                { name: "max_surge", type: "string", required: true }
              ]
            },
            {
              name: "kubelet_config",
              attributes: [
                { name: "allowed_unsafe_sysctls", type: "list" },
                { name: "container_log_max_line", type: "number" },
                { name: "container_log_max_size_mb", type: "number" },
                { name: "cpu_cfs_quota_enabled", type: "bool" },
                { name: "cpu_cfs_quota_period", type: "string" },
                { name: "cpu_manager_policy", type: "string" },
                { name: "image_gc_high_threshold", type: "number" },
                { name: "image_gc_low_threshold", type: "number" },
                { name: "pod_max_pid", type: "number" },
                { name: "topology_manager_policy", type: "string" }
              ]
            }
          ]
        },
        {
          name: "identity",
          required: false,
          attributes: [
            { name: "type", type: "string", required: true, options: ["SystemAssigned", "UserAssigned"] },
            { name: "identity_ids", type: "list" }
          ]
        },
        {
          name: "service_principal",
          required: false,
          attributes: [
            { name: "client_id", type: "string", required: true },
            { name: "client_secret", type: "string", required: true, sensitive: true }
          ]
        },
        {
          name: "network_profile",
          required: false,
          attributes: [
            { name: "network_plugin", type: "string", required: true, options: ["azure", "kubenet", "none"] },
            { name: "network_mode", type: "string", options: ["transparent", "bridge"] },
            { name: "network_policy", type: "string", options: ["azure", "calico"] },
            { name: "dns_service_ip", type: "string" },
            { name: "docker_bridge_cidr", type: "string" },
            { name: "ebpf_data_plane", type: "string", options: ["cilium"] },
            { name: "network_plugin_mode", type: "string", options: ["overlay"] },
            { name: "outbound_type", type: "string", options: ["loadBalancer", "userDefinedRouting", "managedNATGateway", "userAssignedNATGateway"] },
            { name: "pod_cidr", type: "string" },
            { name: "pod_cidrs", type: "list" },
            { name: "service_cidr", type: "string" },
            { name: "service_cidrs", type: "list" },
            { name: "ip_versions", type: "list" },
            { name: "load_balancer_sku", type: "string", options: ["basic", "standard"] }
          ],
          blocks: [
            {
              name: "load_balancer_profile",
              attributes: [
                { name: "idle_timeout_in_minutes", type: "number" },
                { name: "managed_outbound_ip_count", type: "number" },
                { name: "managed_outbound_ipv6_count", type: "number" },
                { name: "outbound_ip_address_ids", type: "list" },
                { name: "outbound_ip_prefix_ids", type: "list" },
                { name: "outbound_ports_allocated", type: "number" }
              ]
            },
            {
              name: "nat_gateway_profile",
              attributes: [
                { name: "idle_timeout_in_minutes", type: "number" },
                { name: "managed_outbound_ip_count", type: "number" }
              ]
            }
          ]
        },
        {
          name: "azure_active_directory_role_based_access_control",
          required: false,
          attributes: [
            { name: "managed", type: "bool" },
            { name: "tenant_id", type: "string" },
            { name: "admin_group_object_ids", type: "list" },
            { name: "azure_rbac_enabled", type: "bool" },
            { name: "client_app_id", type: "string" },
            { name: "server_app_id", type: "string" },
            { name: "server_app_secret", type: "string", sensitive: true }
          ]
        },
        {
          name: "auto_scaler_profile",
          required: false,
          attributes: [
            { name: "balance_similar_node_groups", type: "bool" },
            { name: "expander", type: "string", options: ["least-waste", "priority", "most-pods", "random"] },
            { name: "max_graceful_termination_sec", type: "string" },
            { name: "max_node_provisioning_time", type: "string" },
            { name: "max_unready_nodes", type: "number" },
            { name: "max_unready_percentage", type: "number" },
            { name: "new_pod_scale_up_delay", type: "string" },
            { name: "scale_down_delay_after_add", type: "string" },
            { name: "scale_down_delay_after_delete", type: "string" },
            { name: "scale_down_delay_after_failure", type: "string" },
            { name: "scan_interval", type: "string" },
            { name: "scale_down_unneeded", type: "string" },
            { name: "scale_down_unready", type: "string" },
            { name: "scale_down_utilization_threshold", type: "string" },
            { name: "empty_bulk_delete_max", type: "string" },
            { name: "skip_nodes_with_local_storage", type: "bool" },
            { name: "skip_nodes_with_system_pods", type: "bool" }
          ]
        },
        {
          name: "oms_agent",
          required: false,
          attributes: [
            { name: "log_analytics_workspace_id", type: "string", required: true },
            { name: "msi_auth_for_monitoring_enabled", type: "bool" }
          ]
        },
        {
          name: "ingress_application_gateway",
          required: false,
          attributes: [
            { name: "gateway_id", type: "string" },
            { name: "gateway_name", type: "string" },
            { name: "subnet_cidr", type: "string" },
            { name: "subnet_id", type: "string" }
          ]
        },
        {
          name: "key_vault_secrets_provider",
          required: false,
          attributes: [
            { name: "secret_rotation_enabled", type: "bool" },
            { name: "secret_rotation_interval", type: "string" }
          ]
        },
        {
          name: "maintenance_window",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "allowed",
              multiple: true,
              attributes: [
                { name: "day", type: "string", required: true },
                { name: "hours", type: "list", required: true }
              ]
            },
            {
              name: "not_allowed",
              multiple: true,
              attributes: [
                { name: "start", type: "string", required: true },
                { name: "end", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "linux_profile",
          required: false,
          attributes: [
            { name: "admin_username", type: "string", required: true }
          ],
          blocks: [
            {
              name: "ssh_key",
              required: true,
              attributes: [
                { name: "key_data", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "windows_profile",
          required: false,
          attributes: [
            { name: "admin_username", type: "string", required: true },
            { name: "admin_password", type: "string", sensitive: true },
            { name: "license", type: "string" }
          ],
          blocks: [
            {
              name: "gmsa",
              attributes: [
                { name: "dns_server", type: "string", required: true },
                { name: "root_domain", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "kubelet_identity",
          required: false,
          attributes: [
            { name: "client_id", type: "string" },
            { name: "object_id", type: "string" },
            { name: "user_assigned_identity_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "fqdn", type: "string", description: "FQDN" },
      { name: "private_fqdn", type: "string", description: "Private FQDN" },
      { name: "portal_fqdn", type: "string", description: "Portal FQDN" },
      { name: "kube_admin_config", type: "list", description: "Admin kubeconfig", sensitive: true },
      { name: "kube_admin_config_raw", type: "string", description: "Admin kubeconfig raw", sensitive: true },
      { name: "kube_config", type: "list", description: "Kubeconfig", sensitive: true },
      { name: "kube_config_raw", type: "string", description: "Kubeconfig raw", sensitive: true },
      { name: "http_application_routing_zone_name", type: "string", description: "HTTP routing zone" },
      { name: "oidc_issuer_url", type: "string", description: "OIDC issuer URL" },
      { name: "node_resource_group", type: "string", description: "Node resource group" },
      { name: "node_resource_group_id", type: "string", description: "Node resource group ID" },
      { name: "identity", type: "list", description: "Managed identity" },
      { name: "kubelet_identity", type: "list", description: "Kubelet identity" }
    ]
  },
  {
    id: "kubernetes_cluster_node_pool",
    name: "AKS Node Pool",
    description: "Additional node pool for AKS",
    terraform_resource: "azurerm_kubernetes_cluster_node_pool",
    icon: CONTAINERS_ICONS['azurerm_kubernetes_cluster_node_pool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Node pool name" },
        { name: "kubernetes_cluster_id", type: "string", description: "AKS cluster ID" },
        { name: "vm_size", type: "string", description: "VM size" }
      ],
      optional: [
        { name: "node_count", type: "number", description: "Node count" },
        { name: "enable_auto_scaling", type: "bool", description: "Auto scaling" },
        { name: "min_count", type: "number", description: "Min nodes" },
        { name: "max_count", type: "number", description: "Max nodes" },
        { name: "max_pods", type: "number", description: "Max pods per node" },
        { name: "mode", type: "string", description: "Node pool mode", options: ["System", "User"] },
        { name: "node_labels", type: "map", description: "Node labels" },
        { name: "node_taints", type: "list", description: "Node taints" },
        { name: "orchestrator_version", type: "string", description: "K8s version" },
        { name: "os_disk_size_gb", type: "number", description: "OS disk size" },
        { name: "os_disk_type", type: "string", description: "OS disk type" },
        { name: "os_sku", type: "string", description: "OS SKU" },
        { name: "os_type", type: "string", description: "OS type", options: ["Linux", "Windows"] },
        { name: "priority", type: "string", description: "Priority", options: ["Regular", "Spot"] },
        { name: "eviction_policy", type: "string", description: "Eviction policy", options: ["Delete", "Deallocate"] },
        { name: "spot_max_price", type: "number", description: "Spot max price" },
        { name: "ultra_ssd_enabled", type: "bool", description: "Ultra SSD" },
        { name: "vnet_subnet_id", type: "string", description: "Subnet ID" },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "enable_host_encryption", type: "bool", description: "Host encryption" },
        { name: "enable_node_public_ip", type: "bool", description: "Node public IP" },
        { name: "node_public_ip_prefix_id", type: "string", description: "Public IP prefix" },
        { name: "fips_enabled", type: "bool", description: "FIPS enabled" },
        { name: "kubelet_disk_type", type: "string", description: "Kubelet disk type" },
        { name: "pod_subnet_id", type: "string", description: "Pod subnet ID" },
        { name: "proximity_placement_group_id", type: "string", description: "PPG ID" },
        { name: "scale_down_mode", type: "string", description: "Scale down mode", options: ["Delete", "Deallocate"] },
        { name: "snapshot_id", type: "string", description: "Snapshot ID" },
        { name: "workload_runtime", type: "string", description: "Workload runtime", options: ["OCIContainer", "WasmWasi"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "upgrade_settings",
          required: false,
          attributes: [
            { name: "max_surge", type: "string", required: true }
          ]
        },
        {
          name: "kubelet_config",
          required: false,
          attributes: [
            { name: "cpu_manager_policy", type: "string" },
            { name: "cpu_cfs_quota_enabled", type: "bool" },
            { name: "cpu_cfs_quota_period", type: "string" },
            { name: "image_gc_high_threshold", type: "number" },
            { name: "image_gc_low_threshold", type: "number" },
            { name: "topology_manager_policy", type: "string" },
            { name: "allowed_unsafe_sysctls", type: "list" },
            { name: "container_log_max_size_mb", type: "number" },
            { name: "container_log_max_line", type: "number" },
            { name: "pod_max_pid", type: "number" }
          ]
        },
        {
          name: "linux_os_config",
          required: false,
          attributes: [
            { name: "swap_file_size_mb", type: "number" },
            { name: "transparent_huge_page_defrag", type: "string" },
            { name: "transparent_huge_page_enabled", type: "string" }
          ],
          blocks: [
            {
              name: "sysctl_config",
              attributes: [
                { name: "fs_aio_max_nr", type: "number" },
                { name: "fs_file_max", type: "number" },
                { name: "fs_inotify_max_user_watches", type: "number" },
                { name: "fs_nr_open", type: "number" },
                { name: "kernel_threads_max", type: "number" },
                { name: "net_core_netdev_max_backlog", type: "number" },
                { name: "net_core_optmem_max", type: "number" },
                { name: "net_core_rmem_default", type: "number" },
                { name: "net_core_rmem_max", type: "number" },
                { name: "net_core_somaxconn", type: "number" },
                { name: "net_core_wmem_default", type: "number" },
                { name: "net_core_wmem_max", type: "number" },
                { name: "net_ipv4_ip_local_port_range_max", type: "number" },
                { name: "net_ipv4_ip_local_port_range_min", type: "number" },
                { name: "net_ipv4_neigh_default_gc_thresh1", type: "number" },
                { name: "net_ipv4_neigh_default_gc_thresh2", type: "number" },
                { name: "net_ipv4_neigh_default_gc_thresh3", type: "number" },
                { name: "net_ipv4_tcp_fin_timeout", type: "number" },
                { name: "net_ipv4_tcp_keepalive_intvl", type: "number" },
                { name: "net_ipv4_tcp_keepalive_probes", type: "number" },
                { name: "net_ipv4_tcp_keepalive_time", type: "number" },
                { name: "net_ipv4_tcp_max_syn_backlog", type: "number" },
                { name: "net_ipv4_tcp_max_tw_buckets", type: "number" },
                { name: "net_ipv4_tcp_tw_reuse", type: "bool" },
                { name: "net_netfilter_nf_conntrack_buckets", type: "number" },
                { name: "net_netfilter_nf_conntrack_max", type: "number" },
                { name: "vm_max_map_count", type: "number" },
                { name: "vm_swappiness", type: "number" },
                { name: "vm_vfs_cache_pressure", type: "number" }
              ]
            }
          ]
        },
        {
          name: "node_network_profile",
          required: false,
          attributes: [
            { name: "node_public_ip_tags", type: "map" }
          ]
        },
        {
          name: "windows_profile",
          required: false,
          attributes: [
            { name: "outbound_nat_enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Node pool ID" }
    ]
  },
  {
    id: "container_registry",
    name: "Container Registry",
    description: "Azure Container Registry",
    terraform_resource: "azurerm_container_registry",
    icon: CONTAINERS_ICONS['azurerm_container_registry'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Registry name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "sku", type: "string", description: "SKU", options: ["Basic", "Standard", "Premium"] }
      ],
      optional: [
        { name: "admin_enabled", type: "bool", description: "Admin enabled", default: false },
        { name: "public_network_access_enabled", type: "bool", description: "Public access", default: true },
        { name: "quarantine_policy_enabled", type: "bool", description: "Quarantine policy" },
        { name: "zone_redundancy_enabled", type: "bool", description: "Zone redundancy" },
        { name: "export_policy_enabled", type: "bool", description: "Export policy", default: true },
        { name: "anonymous_pull_enabled", type: "bool", description: "Anonymous pull" },
        { name: "data_endpoint_enabled", type: "bool", description: "Data endpoint" },
        { name: "network_rule_bypass_option", type: "string", description: "Network bypass", options: ["None", "AzureServices"] },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
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
            { name: "default_action", type: "string", options: ["Allow", "Deny"] }
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
    id: "container_group",
    name: "Container Instances",
    description: "Azure Container Instances group",
    terraform_resource: "azurerm_container_group",
    icon: CONTAINERS_ICONS['azurerm_container_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Group name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "os_type", type: "string", description: "OS type", options: ["Linux", "Windows"] }
      ],
      optional: [
        { name: "dns_name_label", type: "string", description: "DNS name label" },
        { name: "dns_name_label_reuse_policy", type: "string", description: "DNS reuse policy", options: ["Noreuse", "ResourceGroupReuse", "SubscriptionReuse", "TenantReuse", "Unsecure"] },
        { name: "ip_address_type", type: "string", description: "IP address type", options: ["Public", "Private", "None"] },
        { name: "key_vault_key_id", type: "string", description: "Key Vault key ID" },
        { name: "key_vault_user_assigned_identity_id", type: "string", description: "User identity for Key Vault" },
        { name: "network_profile_id", type: "string", description: "Network profile ID" },
        { name: "restart_policy", type: "string", description: "Restart policy", options: ["Always", "Never", "OnFailure"] },
        { name: "sku", type: "string", description: "SKU", options: ["Standard", "Dedicated"] },
        { name: "subnet_ids", type: "list", description: "Subnet IDs" },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "container",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "image", type: "string", required: true },
            { name: "cpu", type: "number", required: true },
            { name: "memory", type: "number", required: true },
            { name: "cpu_limit", type: "number" },
            { name: "memory_limit", type: "number" },
            { name: "environment_variables", type: "map" },
            { name: "secure_environment_variables", type: "map", sensitive: true },
            { name: "commands", type: "list" }
          ],
          blocks: [
            {
              name: "ports",
              multiple: true,
              attributes: [
                { name: "port", type: "number", required: true },
                { name: "protocol", type: "string", options: ["TCP", "UDP"] }
              ]
            },
            {
              name: "volume",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "mount_path", type: "string", required: true },
                { name: "read_only", type: "bool" },
                { name: "empty_dir", type: "bool" },
                { name: "storage_account_name", type: "string" },
                { name: "storage_account_key", type: "string", sensitive: true },
                { name: "share_name", type: "string" },
                { name: "secret", type: "map", sensitive: true }
              ],
              blocks: [
                {
                  name: "git_repo",
                  attributes: [
                    { name: "url", type: "string", required: true },
                    { name: "directory", type: "string" },
                    { name: "revision", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "liveness_probe",
              attributes: [
                { name: "exec", type: "list" },
                { name: "failure_threshold", type: "number" },
                { name: "initial_delay_seconds", type: "number" },
                { name: "period_seconds", type: "number" },
                { name: "success_threshold", type: "number" },
                { name: "timeout_seconds", type: "number" }
              ],
              blocks: [
                {
                  name: "http_get",
                  attributes: [
                    { name: "path", type: "string" },
                    { name: "port", type: "number" },
                    { name: "scheme", type: "string" },
                    { name: "http_headers", type: "map" }
                  ]
                }
              ]
            },
            {
              name: "readiness_probe",
              attributes: [
                { name: "exec", type: "list" },
                { name: "failure_threshold", type: "number" },
                { name: "initial_delay_seconds", type: "number" },
                { name: "period_seconds", type: "number" },
                { name: "success_threshold", type: "number" },
                { name: "timeout_seconds", type: "number" }
              ],
              blocks: [
                {
                  name: "http_get",
                  attributes: [
                    { name: "path", type: "string" },
                    { name: "port", type: "number" },
                    { name: "scheme", type: "string" },
                    { name: "http_headers", type: "map" }
                  ]
                }
              ]
            },
            {
              name: "gpu",
              attributes: [
                { name: "count", type: "number" },
                { name: "sku", type: "string", options: ["K80", "P100", "V100"] }
              ]
            },
            {
              name: "gpu_limit",
              attributes: [
                { name: "count", type: "number" },
                { name: "sku", type: "string" }
              ]
            }
          ]
        },
        {
          name: "image_registry_credential",
          required: false,
          multiple: true,
          attributes: [
            { name: "server", type: "string", required: true },
            { name: "username", type: "string" },
            { name: "password", type: "string", sensitive: true },
            { name: "user_assigned_identity_id", type: "string" }
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
          name: "init_container",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "image", type: "string", required: true },
            { name: "environment_variables", type: "map" },
            { name: "secure_environment_variables", type: "map", sensitive: true },
            { name: "commands", type: "list" }
          ],
          blocks: [
            {
              name: "volume",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "mount_path", type: "string", required: true },
                { name: "read_only", type: "bool" },
                { name: "empty_dir", type: "bool" },
                { name: "storage_account_name", type: "string" },
                { name: "storage_account_key", type: "string", sensitive: true },
                { name: "share_name", type: "string" },
                { name: "secret", type: "map", sensitive: true }
              ]
            }
          ]
        },
        {
          name: "dns_config",
          required: false,
          attributes: [
            { name: "nameservers", type: "list", required: true },
            { name: "search_domains", type: "list" },
            { name: "options", type: "list" }
          ]
        },
        {
          name: "diagnostics",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "log_analytics",
              required: true,
              attributes: [
                { name: "workspace_id", type: "string", required: true },
                { name: "workspace_key", type: "string", required: true, sensitive: true },
                { name: "log_type", type: "string", options: ["ContainerInsights", "ContainerInstanceLogs"] },
                { name: "metadata", type: "map" }
              ]
            }
          ]
        },
        {
          name: "exposed_port",
          required: false,
          multiple: true,
          attributes: [
            { name: "port", type: "number", required: true },
            { name: "protocol", type: "string", options: ["TCP", "UDP"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Container group ID" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "fqdn", type: "string", description: "FQDN" },
      { name: "identity", type: "list", description: "Managed identity" }
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









