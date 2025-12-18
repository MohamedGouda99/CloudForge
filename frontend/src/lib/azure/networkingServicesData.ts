/**
 * Azure Networking Services Data - Complete definitions from networking.json
 * This file contains ALL 12 networking services with ALL their properties
 * 
 * Services included:
 * 1. Virtual Network (azurerm_virtual_network)
 * 2. Subnet (azurerm_subnet)
 * 3. Network Security Group (azurerm_network_security_group)
 * 4. Public IP Address (azurerm_public_ip)
 * 5. Network Interface (azurerm_network_interface)
 * 6. Load Balancer (azurerm_lb)
 * 7. Application Gateway (azurerm_application_gateway)
 * 8. NAT Gateway (azurerm_nat_gateway)
 * 9. Private DNS Zone (azurerm_private_dns_zone)
 * 10. Private Endpoint (azurerm_private_endpoint)
 * 11. ExpressRoute Circuit (azurerm_express_route_circuit)
 * 12. Virtual Network Gateway (azurerm_virtual_network_gateway)
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

// Azure Networking service icon mappings - using Azure Public Service Icons
export const NETWORKING_ICONS: Record<string, string> = {
  'azurerm_virtual_network': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10061-icon-service-Virtual-Networks.svg',
  'azurerm_subnet': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/02742-icon-service-Subnet.svg',
  'azurerm_network_security_group': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10067-icon-service-Network-Security-Groups.svg',
  'azurerm_public_ip': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10069-icon-service-Public-IP-Addresses.svg',
  'azurerm_network_interface': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10080-icon-service-Network-Interfaces.svg',
  'azurerm_lb': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10062-icon-service-Load-Balancers.svg',
  'azurerm_application_gateway': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10076-icon-service-Application-Gateways.svg',
  'azurerm_nat_gateway': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10310-icon-service-NAT.svg',
  'azurerm_private_dns_zone': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10064-icon-service-DNS-Zones.svg',
  'azurerm_private_endpoint': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/00427-icon-service-Private-Link.svg',
  'azurerm_express_route_circuit': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10079-icon-service-ExpressRoute-Circuits.svg',
  'azurerm_virtual_network_gateway': '/cloud_icons/Azure/Azure_Public_Service_Icons/Icons/networking/10063-icon-service-Virtual-Network-Gateways.svg',
};

// Networking service definition interface
export interface NetworkingServiceDefinition {
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

// Complete networking services data from networking.json
export const NETWORKING_SERVICES: NetworkingServiceDefinition[] = [
  {
    id: "virtual_network",
    name: "Virtual Network",
    description: "Azure Virtual Network for private networking",
    terraform_resource: "azurerm_virtual_network",
    icon: NETWORKING_ICONS['azurerm_virtual_network'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "VNet name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "address_space", type: "list", description: "Address space CIDR blocks" }
      ],
      optional: [
        { name: "dns_servers", type: "list", description: "Custom DNS servers" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "flow_timeout_in_minutes", type: "number", description: "Flow timeout" },
        { name: "bgp_community", type: "string", description: "BGP community" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "ddos_protection_plan",
          required: false,
          attributes: [
            { name: "id", type: "string", required: true },
            { name: "enable", type: "bool", required: true }
          ]
        },
        {
          name: "encryption",
          required: false,
          attributes: [
            { name: "enforcement", type: "string", required: true, options: ["AllowUnencrypted", "DropUnencrypted"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VNet ID" },
      { name: "guid", type: "string", description: "VNet GUID" }
    ]
  },
  {
    id: "subnet",
    name: "Subnet",
    description: "Subnet within a virtual network",
    terraform_resource: "azurerm_subnet",
    icon: NETWORKING_ICONS['azurerm_subnet'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Subnet name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "virtual_network_name", type: "string", description: "VNet name" },
        { name: "address_prefixes", type: "list", description: "Address prefixes" }
      ],
      optional: [
        { name: "private_endpoint_network_policies_enabled", type: "bool", description: "Private endpoint network policies", default: true },
        { name: "private_link_service_network_policies_enabled", type: "bool", description: "Private link service policies", default: true },
        { name: "service_endpoints", type: "list", description: "Service endpoints", options: ["Microsoft.AzureActiveDirectory", "Microsoft.AzureCosmosDB", "Microsoft.ContainerRegistry", "Microsoft.EventHub", "Microsoft.KeyVault", "Microsoft.ServiceBus", "Microsoft.Sql", "Microsoft.Storage", "Microsoft.Web"] },
        { name: "service_endpoint_policy_ids", type: "list", description: "Service endpoint policy IDs" }
      ],
      blocks: [
        {
          name: "delegation",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true }
          ],
          blocks: [
            {
              name: "service_delegation",
              required: true,
              attributes: [
                { name: "name", type: "string", required: true, options: ["Microsoft.Web/serverFarms", "Microsoft.ContainerInstance/containerGroups", "Microsoft.Netapp/volumes", "Microsoft.Sql/managedInstances", "Microsoft.DBforMySQL/flexibleServers", "Microsoft.DBforPostgreSQL/flexibleServers"] },
                { name: "actions", type: "list" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subnet ID" }
    ]
  },
  {
    id: "network_security_group",
    name: "Network Security Group",
    description: "Network security group with rules",
    terraform_resource: "azurerm_network_security_group",
    icon: NETWORKING_ICONS['azurerm_network_security_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "NSG name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "security_rule",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "priority", type: "number", required: true },
            { name: "direction", type: "string", required: true, options: ["Inbound", "Outbound"] },
            { name: "access", type: "string", required: true, options: ["Allow", "Deny"] },
            { name: "protocol", type: "string", required: true, options: ["Tcp", "Udp", "Icmp", "*"] },
            { name: "source_port_range", type: "string" },
            { name: "source_port_ranges", type: "list" },
            { name: "destination_port_range", type: "string" },
            { name: "destination_port_ranges", type: "list" },
            { name: "source_address_prefix", type: "string" },
            { name: "source_address_prefixes", type: "list" },
            { name: "source_application_security_group_ids", type: "list" },
            { name: "destination_address_prefix", type: "string" },
            { name: "destination_address_prefixes", type: "list" },
            { name: "destination_application_security_group_ids", type: "list" },
            { name: "description", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "NSG ID" }
    ]
  },
  {
    id: "public_ip",
    name: "Public IP Address",
    description: "Public IP address resource",
    terraform_resource: "azurerm_public_ip",
    icon: NETWORKING_ICONS['azurerm_public_ip'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "IP name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "allocation_method", type: "string", description: "Allocation method", options: ["Static", "Dynamic"] }
      ],
      optional: [
        { name: "sku", type: "string", description: "SKU", options: ["Basic", "Standard"], default: "Basic" },
        { name: "sku_tier", type: "string", description: "SKU tier", options: ["Regional", "Global"] },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "ip_version", type: "string", description: "IP version", options: ["IPv4", "IPv6"] },
        { name: "idle_timeout_in_minutes", type: "number", description: "Idle timeout", default: 4 },
        { name: "domain_name_label", type: "string", description: "DNS label" },
        { name: "reverse_fqdn", type: "string", description: "Reverse FQDN" },
        { name: "public_ip_prefix_id", type: "string", description: "Public IP prefix ID" },
        { name: "ip_tags", type: "map", description: "IP tags" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "ddos_protection_mode", type: "string", description: "DDoS protection", options: ["Disabled", "Enabled", "VirtualNetworkInherited"] },
        { name: "ddos_protection_plan_id", type: "string", description: "DDoS protection plan ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Public IP ID" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "fqdn", type: "string", description: "FQDN" }
    ]
  },
  {
    id: "network_interface",
    name: "Network Interface",
    description: "Network interface for VMs",
    terraform_resource: "azurerm_network_interface",
    icon: NETWORKING_ICONS['azurerm_network_interface'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "NIC name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "dns_servers", type: "list", description: "DNS servers" },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "enable_ip_forwarding", type: "bool", description: "IP forwarding", default: false },
        { name: "enable_accelerated_networking", type: "bool", description: "Accelerated networking", default: false },
        { name: "internal_dns_name_label", type: "string", description: "Internal DNS label" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "ip_configuration",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "subnet_id", type: "string" },
            { name: "private_ip_address_allocation", type: "string", required: true, options: ["Dynamic", "Static"] },
            { name: "private_ip_address", type: "string" },
            { name: "private_ip_address_version", type: "string", options: ["IPv4", "IPv6"] },
            { name: "public_ip_address_id", type: "string" },
            { name: "primary", type: "bool" },
            { name: "gateway_load_balancer_frontend_ip_configuration_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "NIC ID" },
      { name: "applied_dns_servers", type: "list", description: "Applied DNS servers" },
      { name: "internal_domain_name_suffix", type: "string", description: "Internal domain suffix" },
      { name: "mac_address", type: "string", description: "MAC address" },
      { name: "private_ip_address", type: "string", description: "Private IP" },
      { name: "private_ip_addresses", type: "list", description: "Private IPs" },
      { name: "virtual_machine_id", type: "string", description: "Attached VM ID" }
    ]
  },
  {
    id: "lb",
    name: "Load Balancer",
    description: "Azure Load Balancer",
    terraform_resource: "azurerm_lb",
    icon: NETWORKING_ICONS['azurerm_lb'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Load balancer name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "sku", type: "string", description: "SKU", options: ["Basic", "Standard", "Gateway"], default: "Basic" },
        { name: "sku_tier", type: "string", description: "SKU tier", options: ["Regional", "Global"] },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "frontend_ip_configuration",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "zones", type: "list" },
            { name: "subnet_id", type: "string" },
            { name: "private_ip_address", type: "string" },
            { name: "private_ip_address_allocation", type: "string", options: ["Dynamic", "Static"] },
            { name: "private_ip_address_version", type: "string", options: ["IPv4", "IPv6"] },
            { name: "public_ip_address_id", type: "string" },
            { name: "public_ip_prefix_id", type: "string" },
            { name: "gateway_load_balancer_frontend_ip_configuration_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Load balancer ID" },
      { name: "private_ip_address", type: "string", description: "Private IP" },
      { name: "private_ip_addresses", type: "list", description: "Private IPs" },
      { name: "frontend_ip_configuration", type: "list", description: "Frontend IP configs" }
    ]
  },
  {
    id: "application_gateway",
    name: "Application Gateway",
    description: "Layer 7 load balancer",
    terraform_resource: "azurerm_application_gateway",
    icon: NETWORKING_ICONS['azurerm_application_gateway'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "App gateway name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "enable_http2", type: "bool", description: "Enable HTTP/2" },
        { name: "force_firewall_policy_association", type: "bool", description: "Force WAF policy" },
        { name: "fips_enabled", type: "bool", description: "FIPS mode" },
        { name: "firewall_policy_id", type: "string", description: "WAF policy ID" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "sku",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true, options: ["Standard_Small", "Standard_Medium", "Standard_Large", "Standard_v2", "WAF_Medium", "WAF_Large", "WAF_v2"] },
            { name: "tier", type: "string", required: true, options: ["Standard", "Standard_v2", "WAF", "WAF_v2"] },
            { name: "capacity", type: "number" }
          ]
        },
        {
          name: "gateway_ip_configuration",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "subnet_id", type: "string", required: true }
          ]
        },
        {
          name: "frontend_port",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "port", type: "number", required: true }
          ]
        },
        {
          name: "frontend_ip_configuration",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "subnet_id", type: "string" },
            { name: "private_ip_address", type: "string" },
            { name: "public_ip_address_id", type: "string" },
            { name: "private_ip_address_allocation", type: "string" },
            { name: "private_link_configuration_name", type: "string" }
          ]
        },
        {
          name: "backend_address_pool",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "fqdns", type: "list" },
            { name: "ip_addresses", type: "list" }
          ]
        },
        {
          name: "backend_http_settings",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "cookie_based_affinity", type: "string", required: true, options: ["Enabled", "Disabled"] },
            { name: "port", type: "number", required: true },
            { name: "protocol", type: "string", required: true, options: ["Http", "Https"] },
            { name: "request_timeout", type: "number" },
            { name: "host_name", type: "string" },
            { name: "path", type: "string" },
            { name: "probe_name", type: "string" },
            { name: "pick_host_name_from_backend_address", type: "bool" },
            { name: "affinity_cookie_name", type: "string" },
            { name: "trusted_root_certificate_names", type: "list" }
          ]
        },
        {
          name: "http_listener",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "frontend_ip_configuration_name", type: "string", required: true },
            { name: "frontend_port_name", type: "string", required: true },
            { name: "protocol", type: "string", required: true, options: ["Http", "Https"] },
            { name: "host_name", type: "string" },
            { name: "host_names", type: "list" },
            { name: "require_sni", type: "bool" },
            { name: "ssl_certificate_name", type: "string" },
            { name: "ssl_profile_name", type: "string" },
            { name: "firewall_policy_id", type: "string" }
          ]
        },
        {
          name: "request_routing_rule",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "rule_type", type: "string", required: true, options: ["Basic", "PathBasedRouting"] },
            { name: "http_listener_name", type: "string", required: true },
            { name: "backend_address_pool_name", type: "string" },
            { name: "backend_http_settings_name", type: "string" },
            { name: "redirect_configuration_name", type: "string" },
            { name: "rewrite_rule_set_name", type: "string" },
            { name: "url_path_map_name", type: "string" },
            { name: "priority", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "App gateway ID" },
      { name: "backend_address_pool", type: "list", description: "Backend pools" },
      { name: "frontend_ip_configuration", type: "list", description: "Frontend IPs" },
      { name: "frontend_port", type: "list", description: "Frontend ports" },
      { name: "http_listener", type: "list", description: "HTTP listeners" },
      { name: "private_endpoint_connection", type: "list", description: "Private endpoints" }
    ]
  },
  {
    id: "nat_gateway",
    name: "NAT Gateway",
    description: "Azure NAT Gateway for outbound connectivity",
    terraform_resource: "azurerm_nat_gateway",
    icon: NETWORKING_ICONS['azurerm_nat_gateway'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "NAT gateway name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" }
      ],
      optional: [
        { name: "idle_timeout_in_minutes", type: "number", description: "Idle timeout", default: 4 },
        { name: "sku_name", type: "string", description: "SKU", options: ["Standard"] },
        { name: "zones", type: "list", description: "Availability zones" },
        { name: "tags", type: "map", description: "Resource tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "NAT gateway ID" },
      { name: "resource_guid", type: "string", description: "Resource GUID" }
    ]
  },
  {
    id: "private_dns_zone",
    name: "Private DNS Zone",
    description: "Azure Private DNS zone",
    terraform_resource: "azurerm_private_dns_zone",
    icon: NETWORKING_ICONS['azurerm_private_dns_zone'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Zone name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" }
      ],
      optional: [
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "soa_record",
          required: false,
          attributes: [
            { name: "email", type: "string", required: true },
            { name: "expire_time", type: "number" },
            { name: "minimum_ttl", type: "number" },
            { name: "refresh_time", type: "number" },
            { name: "retry_time", type: "number" },
            { name: "ttl", type: "number" },
            { name: "tags", type: "map" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Zone ID" },
      { name: "number_of_record_sets", type: "number", description: "Number of record sets" },
      { name: "max_number_of_record_sets", type: "number", description: "Max record sets" },
      { name: "max_number_of_virtual_network_links", type: "number", description: "Max VNet links" },
      { name: "max_number_of_virtual_network_links_with_registration", type: "number", description: "Max VNet links with registration" }
    ]
  },
  {
    id: "private_endpoint",
    name: "Private Endpoint",
    description: "Private endpoint for Azure services",
    terraform_resource: "azurerm_private_endpoint",
    icon: NETWORKING_ICONS['azurerm_private_endpoint'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Endpoint name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "subnet_id", type: "string", description: "Subnet ID" }
      ],
      optional: [
        { name: "custom_network_interface_name", type: "string", description: "Custom NIC name" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "private_service_connection",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "is_manual_connection", type: "bool", required: true },
            { name: "private_connection_resource_id", type: "string" },
            { name: "private_connection_resource_alias", type: "string" },
            { name: "subresource_names", type: "list" },
            { name: "request_message", type: "string" }
          ]
        },
        {
          name: "private_dns_zone_group",
          required: false,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "private_dns_zone_ids", type: "list", required: true }
          ]
        },
        {
          name: "ip_configuration",
          required: false,
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "private_ip_address", type: "string", required: true },
            { name: "subresource_name", type: "string" },
            { name: "member_name", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Endpoint ID" },
      { name: "custom_dns_configs", type: "list", description: "Custom DNS configs" },
      { name: "private_dns_zone_configs", type: "list", description: "DNS zone configs" },
      { name: "network_interface", type: "list", description: "Network interface" }
    ]
  },
  {
    id: "express_route_circuit",
    name: "ExpressRoute Circuit",
    description: "ExpressRoute circuit for hybrid connectivity",
    terraform_resource: "azurerm_express_route_circuit",
    icon: NETWORKING_ICONS['azurerm_express_route_circuit'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Circuit name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "service_provider_name", type: "string", description: "Service provider name" },
        { name: "peering_location", type: "string", description: "Peering location" },
        { name: "bandwidth_in_mbps", type: "number", description: "Bandwidth in Mbps" }
      ],
      optional: [
        { name: "allow_classic_operations", type: "bool", description: "Allow classic operations", default: false },
        { name: "express_route_port_id", type: "string", description: "ExpressRoute port ID" },
        { name: "bandwidth_in_gbps", type: "number", description: "Bandwidth in Gbps" },
        { name: "authorization_key", type: "string", description: "Authorization key" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "sku",
          required: true,
          attributes: [
            { name: "tier", type: "string", required: true, options: ["Basic", "Local", "Standard", "Premium"] },
            { name: "family", type: "string", required: true, options: ["MeteredData", "UnlimitedData"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Circuit ID" },
      { name: "service_key", type: "string", description: "Service key", sensitive: true },
      { name: "service_provider_provisioning_state", type: "string", description: "Provider provisioning state" }
    ]
  },
  {
    id: "virtual_network_gateway",
    name: "Virtual Network Gateway",
    description: "VPN or ExpressRoute gateway",
    terraform_resource: "azurerm_virtual_network_gateway",
    icon: NETWORKING_ICONS['azurerm_virtual_network_gateway'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Gateway name" },
        { name: "resource_group_name", type: "string", description: "Resource group name" },
        { name: "location", type: "string", description: "Azure region" },
        { name: "type", type: "string", description: "Gateway type", options: ["Vpn", "ExpressRoute"] },
        { name: "sku", type: "string", description: "SKU", options: ["Basic", "Standard", "HighPerformance", "UltraPerformance", "VpnGw1", "VpnGw2", "VpnGw3", "VpnGw4", "VpnGw5", "VpnGw1AZ", "VpnGw2AZ", "VpnGw3AZ", "VpnGw4AZ", "VpnGw5AZ", "ErGw1AZ", "ErGw2AZ", "ErGw3AZ"] }
      ],
      optional: [
        { name: "vpn_type", type: "string", description: "VPN type", options: ["PolicyBased", "RouteBased"], default: "RouteBased" },
        { name: "active_active", type: "bool", description: "Active-active mode" },
        { name: "enable_bgp", type: "bool", description: "Enable BGP" },
        { name: "private_ip_address_enabled", type: "bool", description: "Private IP enabled" },
        { name: "default_local_network_gateway_id", type: "string", description: "Default local network gateway" },
        { name: "generation", type: "string", description: "VPN gateway generation", options: ["Generation1", "Generation2", "None"] },
        { name: "edge_zone", type: "string", description: "Edge zone" },
        { name: "tags", type: "map", description: "Resource tags" }
      ],
      blocks: [
        {
          name: "ip_configuration",
          required: true,
          multiple: true,
          attributes: [
            { name: "name", type: "string" },
            { name: "public_ip_address_id", type: "string", required: true },
            { name: "private_ip_address_allocation", type: "string" },
            { name: "subnet_id", type: "string", required: true }
          ]
        },
        {
          name: "vpn_client_configuration",
          required: false,
          attributes: [
            { name: "address_space", type: "list", required: true },
            { name: "aad_tenant", type: "string" },
            { name: "aad_audience", type: "string" },
            { name: "aad_issuer", type: "string" },
            { name: "radius_server_address", type: "string" },
            { name: "radius_server_secret", type: "string", sensitive: true },
            { name: "vpn_client_protocols", type: "list", options: ["SSTP", "IkeV2", "OpenVPN"] },
            { name: "vpn_auth_types", type: "list", options: ["AAD", "Certificate", "Radius"] }
          ],
          blocks: [
            {
              name: "root_certificate",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "public_cert_data", type: "string", required: true }
              ]
            },
            {
              name: "revoked_certificate",
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "thumbprint", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "bgp_settings",
          required: false,
          attributes: [
            { name: "asn", type: "number" },
            { name: "peer_weight", type: "number" }
          ],
          blocks: [
            {
              name: "peering_addresses",
              multiple: true,
              attributes: [
                { name: "ip_configuration_name", type: "string" },
                { name: "apipa_addresses", type: "list" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Gateway ID" },
      { name: "bgp_settings", type: "list", description: "BGP settings" }
    ]
  }
];

// All networking terraform resources
export const NETWORKING_TERRAFORM_RESOURCES = NETWORKING_SERVICES.map(s => s.terraform_resource);

// Get networking service by terraform resource name
export function getNetworkingServiceByTerraformResource(terraformResource: string): NetworkingServiceDefinition | undefined {
  return NETWORKING_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get networking service by ID
export function getNetworkingServiceById(id: string): NetworkingServiceDefinition | undefined {
  return NETWORKING_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a networking resource
export function isNetworkingResource(terraformResource: string): boolean {
  return NETWORKING_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get networking icon
export function getNetworkingIcon(terraformResource: string): string | undefined {
  return NETWORKING_ICONS[terraformResource];
}


