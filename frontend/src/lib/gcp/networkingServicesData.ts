/**
 * GCP Networking Services Data - Complete definitions from networking.json
 * This file contains ALL 14 networking services with ALL their properties
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

// GCP Networking service icon mappings - using GCP core products and legacy icons
export const NETWORKING_ICONS: Record<string, string> = {
  'google_compute_network': '/api/icons/gcp/google-cloud-legacy-icons/virtual_private_cloud/virtual_private_cloud.svg',
  'google_compute_subnetwork': '/api/icons/gcp/google-cloud-legacy-icons/virtual_private_cloud/virtual_private_cloud.svg',
  'google_compute_firewall': '/api/icons/gcp/google-cloud-legacy-icons/cloud_firewall_rules/cloud_firewall_rules.svg',
  'google_compute_router': '/api/icons/gcp/google-cloud-legacy-icons/cloud_router/cloud_router.svg',
  'google_compute_router_nat': '/api/icons/gcp/google-cloud-legacy-icons/cloud_nat/cloud_nat.svg',
  'google_compute_forwarding_rule': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
  'google_compute_global_forwarding_rule': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
  'google_compute_backend_service': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
  'google_compute_health_check': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
  'google_dns_managed_zone': '/api/icons/gcp/google-cloud-legacy-icons/cloud_dns/cloud_dns.svg',
  'google_dns_record_set': '/api/icons/gcp/google-cloud-legacy-icons/cloud_dns/cloud_dns.svg',
  'google_compute_vpn_gateway': '/api/icons/gcp/google-cloud-legacy-icons/cloud_vpn/cloud_vpn.svg',
  'google_compute_ha_vpn_gateway': '/api/icons/gcp/google-cloud-legacy-icons/cloud_vpn/cloud_vpn.svg',
  'google_service_networking_connection': '/api/icons/gcp/google-cloud-legacy-icons/private_service_connect/private_service_connect.svg',
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

// Complete networking services data - manually defined
export const NETWORKING_SERVICES: NetworkingServiceDefinition[] = [
  {
    id: "compute_network",
    name: "VPC Network",
    description: "Virtual Private Cloud network",
    terraform_resource: "google_compute_network",
    icon: NETWORKING_ICONS['google_compute_network'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Network name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "auto_create_subnetworks", type: "bool", description: "Auto create subnets", default: true },
        { name: "routing_mode", type: "string", description: "Routing mode", options: ["REGIONAL", "GLOBAL"] },
        { name: "mtu", type: "number", description: "MTU", options: [1460, 1500, 8896] },
        { name: "enable_ula_internal_ipv6", type: "bool", description: "Enable ULA internal IPv6" },
        { name: "internal_ipv6_range", type: "string", description: "Internal IPv6 range" },
        { name: "network_firewall_policy_enforcement_order", type: "string", description: "Firewall policy order", options: ["BEFORE_CLASSIC_FIREWALL", "AFTER_CLASSIC_FIREWALL"] },
        { name: "delete_default_routes_on_create", type: "bool", description: "Delete default routes" }
      ],
      blocks: [
        // No blocks
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Network ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "gateway_ipv4", type: "string", description: "Gateway IPv4" },
      { name: "numeric_id", type: "string", description: "Numeric ID" }
    ]
  },
  {
    id: "compute_subnetwork",
    name: "Subnet",
    description: "VPC subnet",
    terraform_resource: "google_compute_subnetwork",
    icon: NETWORKING_ICONS['google_compute_subnetwork'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Subnet name" },
        { name: "ip_cidr_range", type: "string", description: "IP CIDR range" },
        { name: "network", type: "string", description: "VPC network" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "private_ip_google_access", type: "bool", description: "Private Google access" },
        { name: "private_ipv6_google_access", type: "string", description: "Private IPv6 Google access" },
        { name: "purpose", type: "string", description: "Purpose", options: ["PRIVATE", "REGIONAL_MANAGED_PROXY", "GLOBAL_MANAGED_PROXY", "PRIVATE_SERVICE_CONNECT"] },
        { name: "role", type: "string", description: "Role for proxy subnets", options: ["ACTIVE", "BACKUP"] },
        { name: "stack_type", type: "string", description: "Stack type", options: ["IPV4_ONLY", "IPV4_IPV6"] },
        { name: "ipv6_access_type", type: "string", description: "IPv6 access type", options: ["EXTERNAL", "INTERNAL"] }
      ],
      blocks: [
    {
      name: "secondary_ip_range",
      multiple: true,
      attributes: [
      { name: "range_name", type: "string", required: true },
      { name: "ip_cidr_range", type: "string", required: true }
    ]
    },
    {
      name: "log_config",
      attributes: [
      { name: "aggregation_interval", type: "string", options: ["INTERVAL_5_SEC", "INTERVAL_30_SEC", "INTERVAL_1_MIN", "INTERVAL_5_MIN", "INTERVAL_10_MIN", "INTERVAL_15_MIN"] },
      { name: "flow_sampling", type: "number" },
      { name: "metadata", type: "string", options: ["EXCLUDE_ALL_METADATA", "INCLUDE_ALL_METADATA", "CUSTOM_METADATA"] },
      { name: "metadata_fields", type: "list" },
      { name: "filter_expr", type: "string" }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subnet ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "gateway_address", type: "string", description: "Gateway address" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" },
      { name: "ipv6_cidr_range", type: "string", description: "IPv6 CIDR range" }
    ]
  },
  {
    id: "compute_firewall",
    name: "Firewall Rule",
    description: "VPC firewall rule",
    terraform_resource: "google_compute_firewall",
    icon: NETWORKING_ICONS['google_compute_firewall'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Firewall rule name" },
        { name: "network", type: "string", description: "VPC network" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "priority", type: "number", description: "Priority", default: 1000 },
        { name: "direction", type: "string", description: "Direction", options: ["INGRESS", "EGRESS"] },
        { name: "source_ranges", type: "list", description: "Source IP ranges" },
        { name: "destination_ranges", type: "list", description: "Destination IP ranges" },
        { name: "source_tags", type: "list", description: "Source tags" },
        { name: "source_service_accounts", type: "list", description: "Source service accounts" },
        { name: "target_tags", type: "list", description: "Target tags" },
        { name: "target_service_accounts", type: "list", description: "Target service accounts" },
        { name: "disabled", type: "bool", description: "Disabled" }
      ],
      blocks: [
    {
      name: "allow",
      multiple: true,
      attributes: [
      { name: "protocol", type: "string", required: true },
      { name: "ports", type: "list" }
    ]
    },
    {
      name: "deny",
      multiple: true,
      attributes: [
      { name: "protocol", type: "string", required: true },
      { name: "ports", type: "list" }
    ]
    },
    {
      name: "log_config",
      attributes: [
      { name: "metadata", type: "string", options: ["EXCLUDE_ALL_METADATA", "INCLUDE_ALL_METADATA"], required: true }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Firewall ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" }
    ]
  },
  {
    id: "compute_router",
    name: "Cloud Router",
    description: "Cloud Router for dynamic routing",
    terraform_resource: "google_compute_router",
    icon: NETWORKING_ICONS['google_compute_router'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Router name" },
        { name: "network", type: "string", description: "VPC network" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "encrypted_interconnect_router", type: "bool", description: "Encrypted interconnect" }
      ],
      blocks: [
    {
      name: "bgp",
      attributes: [
      { name: "asn", type: "number", required: true },
      { name: "advertise_mode", type: "string", options: ["DEFAULT", "CUSTOM"] },
      { name: "advertised_groups", type: "list" },
      { name: "keepalive_interval", type: "number" }
    ],
      blocks: [
          {
            name: "advertised_ip_ranges",
            multiple: true,
            attributes: [
            { name: "range", type: "string", required: true },
            { name: "description", type: "string" }
          ]
          }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Router ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" }
    ]
  },
  {
    id: "compute_router_nat",
    name: "Cloud NAT",
    description: "Cloud NAT for outbound connectivity",
    terraform_resource: "google_compute_router_nat",
    icon: NETWORKING_ICONS['google_compute_router_nat'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "NAT name" },
        { name: "router", type: "string", description: "Cloud Router name" },
        { name: "nat_ip_allocate_option", type: "string", description: "IP allocation", options: ["MANUAL_ONLY", "AUTO_ONLY"] },
        { name: "source_subnetwork_ip_ranges_to_nat", type: "string", description: "Subnets to NAT", options: ["ALL_SUBNETWORKS_ALL_IP_RANGES", "ALL_SUBNETWORKS_ALL_PRIMARY_IP_RANGES", "LIST_OF_SUBNETWORKS"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "nat_ips", type: "list", description: "NAT IP addresses" },
        { name: "drain_nat_ips", type: "list", description: "Drain NAT IPs" },
        { name: "min_ports_per_vm", type: "number", description: "Min ports per VM" },
        { name: "max_ports_per_vm", type: "number", description: "Max ports per VM" },
        { name: "enable_dynamic_port_allocation", type: "bool", description: "Dynamic port allocation" },
        { name: "udp_idle_timeout_sec", type: "number", description: "UDP idle timeout" },
        { name: "icmp_idle_timeout_sec", type: "number", description: "ICMP idle timeout" },
        { name: "tcp_established_idle_timeout_sec", type: "number", description: "TCP established timeout" },
        { name: "tcp_transitory_idle_timeout_sec", type: "number", description: "TCP transitory timeout" },
        { name: "tcp_time_wait_timeout_sec", type: "number", description: "TCP time wait timeout" },
        { name: "enable_endpoint_independent_mapping", type: "bool", description: "Endpoint independent mapping" },
        { name: "type", type: "string", description: "NAT type", options: ["PUBLIC", "PRIVATE"] }
      ],
      blocks: [
    {
      name: "subnetwork",
      multiple: true,
      attributes: [
      { name: "name", type: "string", required: true },
      { name: "source_ip_ranges_to_nat", type: "list", required: true },
      { name: "secondary_ip_range_names", type: "list" }
    ]
    },
    {
      name: "log_config",
      attributes: [
      { name: "enable", type: "bool", required: true },
      { name: "filter", type: "string", options: ["ERRORS_ONLY", "TRANSLATIONS_ONLY", "ALL"], required: true }
    ]
    }
      ]
    },
    outputs: [

    ]
  },
  {
    id: "compute_forwarding_rule",
    name: "Forwarding Rule",
    description: "Regional forwarding rule for load balancing",
    terraform_resource: "google_compute_forwarding_rule",
    icon: NETWORKING_ICONS['google_compute_forwarding_rule'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Forwarding rule name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "ip_address", type: "string", description: "IP address" },
        { name: "ip_protocol", type: "string", description: "IP protocol", options: ["TCP", "UDP", "ESP", "AH", "SCTP", "ICMP", "L3_DEFAULT"] },
        { name: "port_range", type: "string", description: "Port range" },
        { name: "ports", type: "list", description: "Ports" },
        { name: "all_ports", type: "bool", description: "All ports" },
        { name: "target", type: "string", description: "Target" },
        { name: "backend_service", type: "string", description: "Backend service" },
        { name: "load_balancing_scheme", type: "string", description: "LB scheme", options: ["EXTERNAL", "EXTERNAL_MANAGED", "INTERNAL", "INTERNAL_MANAGED", "INTERNAL_SELF_MANAGED"] },
        { name: "network", type: "string", description: "Network" },
        { name: "subnetwork", type: "string", description: "Subnetwork" },
        { name: "network_tier", type: "string", description: "Network tier", options: ["PREMIUM", "STANDARD"] },
        { name: "labels", type: "map", description: "Labels" },
        { name: "allow_global_access", type: "bool", description: "Allow global access" },
        { name: "allow_psc_global_access", type: "bool", description: "Allow PSC global access" },
        { name: "is_mirroring_collector", type: "bool", description: "Mirroring collector" },
        { name: "service_label", type: "string", description: "Service label" },
        { name: "source_ip_ranges", type: "list", description: "Source IP ranges" },
        { name: "ip_version", type: "string", description: "IP version", options: ["IPV4", "IPV6"] }
      ],
      blocks: [
    {
      name: "service_directory_registrations",
      attributes: [
      { name: "namespace", type: "string" },
      { name: "service", type: "string" }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Forwarding rule ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" },
      { name: "psc_connection_id", type: "string", description: "PSC connection ID" },
      { name: "psc_connection_status", type: "string", description: "PSC connection status" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" },
      { name: "base_forwarding_rule", type: "string", description: "Base forwarding rule" },
      { name: "service_name", type: "string", description: "Service name" }
    ]
  },
  {
    id: "compute_global_forwarding_rule",
    name: "Global Forwarding Rule",
    description: "Global forwarding rule for load balancing",
    terraform_resource: "google_compute_global_forwarding_rule",
    icon: NETWORKING_ICONS['google_compute_global_forwarding_rule'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Forwarding rule name" },
        { name: "target", type: "string", description: "Target proxy" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "ip_address", type: "string", description: "IP address" },
        { name: "ip_protocol", type: "string", description: "IP protocol", options: ["TCP", "UDP", "ESP", "AH", "SCTP", "ICMP"] },
        { name: "port_range", type: "string", description: "Port range" },
        { name: "load_balancing_scheme", type: "string", description: "LB scheme", options: ["EXTERNAL", "EXTERNAL_MANAGED", "INTERNAL_SELF_MANAGED"] },
        { name: "network", type: "string", description: "Network" },
        { name: "subnetwork", type: "string", description: "Subnetwork" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "ip_version", type: "string", description: "IP version", options: ["IPV4", "IPV6"] },
        { name: "source_ip_ranges", type: "list", description: "Source IP ranges" }
      ],
      blocks: [
    {
      name: "metadata_filters",
      multiple: true,
      attributes: [
      { name: "filter_match_criteria", type: "string", options: ["MATCH_ALL", "MATCH_ANY"], required: true }
    ],
      blocks: [
          {
            name: "filter_labels",
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
    outputs: [
      { name: "id", type: "string", description: "Forwarding rule ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "label_fingerprint", type: "string", description: "Label fingerprint" },
      { name: "psc_connection_id", type: "string", description: "PSC connection ID" },
      { name: "psc_connection_status", type: "string", description: "PSC connection status" }
    ]
  },
  {
    id: "compute_backend_service",
    name: "Backend Service",
    description: "Backend service for load balancing",
    terraform_resource: "google_compute_backend_service",
    icon: NETWORKING_ICONS['google_compute_backend_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Backend service name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "health_checks", type: "list", description: "Health check URLs" },
        { name: "load_balancing_scheme", type: "string", description: "LB scheme", options: ["EXTERNAL", "EXTERNAL_MANAGED", "INTERNAL_SELF_MANAGED"] },
        { name: "locality_lb_policy", type: "string", description: "Locality LB policy", options: ["ROUND_ROBIN", "LEAST_REQUEST", "RING_HASH", "RANDOM", "ORIGINAL_DESTINATION", "MAGLEV", "WEIGHTED_MAGLEV"] },
        { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "HTTP2", "TCP", "SSL", "GRPC"] },
        { name: "port_name", type: "string", description: "Named port" },
        { name: "timeout_sec", type: "number", description: "Timeout in seconds" },
        { name: "enable_cdn", type: "bool", description: "Enable CDN" },
        { name: "affinity_cookie_ttl_sec", type: "number", description: "Affinity cookie TTL" },
        { name: "connection_draining_timeout_sec", type: "number", description: "Connection draining timeout" },
        { name: "custom_request_headers", type: "list", description: "Custom request headers" },
        { name: "custom_response_headers", type: "list", description: "Custom response headers" },
        { name: "session_affinity", type: "string", description: "Session affinity", options: ["NONE", "CLIENT_IP", "CLIENT_IP_PORT_PROTO", "CLIENT_IP_PROTO", "GENERATED_COOKIE", "HEADER_FIELD", "HTTP_COOKIE"] }
      ],
      blocks: [
    {
      name: "backend",
      multiple: true,
      attributes: [
      { name: "group", type: "string", required: true },
      { name: "balancing_mode", type: "string", options: ["UTILIZATION", "RATE", "CONNECTION"] },
      { name: "capacity_scaler", type: "number" },
      { name: "description", type: "string" },
      { name: "max_connections", type: "number" },
      { name: "max_connections_per_instance", type: "number" },
      { name: "max_connections_per_endpoint", type: "number" },
      { name: "max_rate", type: "number" },
      { name: "max_rate_per_instance", type: "number" },
      { name: "max_rate_per_endpoint", type: "number" },
      { name: "max_utilization", type: "number" }
    ]
    },
    {
      name: "cdn_policy",
      attributes: [
      { name: "cache_mode", type: "string", options: ["USE_ORIGIN_HEADERS", "FORCE_CACHE_ALL", "CACHE_ALL_STATIC"] },
      { name: "client_ttl", type: "number" },
      { name: "default_ttl", type: "number" },
      { name: "max_ttl", type: "number" },
      { name: "negative_caching", type: "bool" },
      { name: "serve_while_stale", type: "number" },
      { name: "signed_url_cache_max_age_sec", type: "number" }
    ],
      blocks: [
          {
            name: "cache_key_policy",
            attributes: [
            { name: "include_host", type: "bool" },
            { name: "include_protocol", type: "bool" },
            { name: "include_query_string", type: "bool" },
            { name: "query_string_blacklist", type: "list" },
            { name: "query_string_whitelist", type: "list" },
            { name: "include_http_headers", type: "list" },
            { name: "include_named_cookies", type: "list" }
          ]
          },
          {
            name: "negative_caching_policy",
            multiple: true,
            attributes: [
            { name: "code", type: "number" },
            { name: "ttl", type: "number" }
          ]
          }
    ]
    },
    {
      name: "log_config",
      attributes: [
      { name: "enable", type: "bool" },
      { name: "sample_rate", type: "number" }
    ]
    },
    {
      name: "iap",
      attributes: [
      { name: "oauth2_client_id", type: "string", required: true },
      { name: "oauth2_client_secret", type: "string", required: true, sensitive: true }
    ]
    },
    {
      name: "circuit_breakers",
      attributes: [
      { name: "max_requests_per_connection", type: "number" },
      { name: "max_connections", type: "number" },
      { name: "max_pending_requests", type: "number" },
      { name: "max_requests", type: "number" },
      { name: "max_retries", type: "number" }
    ]
    },
    {
      name: "outlier_detection",
      attributes: [
      { name: "consecutive_errors", type: "number" },
      { name: "consecutive_gateway_failure", type: "number" },
      { name: "enforcing_consecutive_errors", type: "number" },
      { name: "enforcing_consecutive_gateway_failure", type: "number" },
      { name: "enforcing_success_rate", type: "number" },
      { name: "max_ejection_percent", type: "number" },
      { name: "success_rate_minimum_hosts", type: "number" },
      { name: "success_rate_request_volume", type: "number" },
      { name: "success_rate_stdev_factor", type: "number" }
    ],
      blocks: [
          {
            name: "base_ejection_time",
            attributes: [
            { name: "seconds", type: "number", required: true },
            { name: "nanos", type: "number" }
          ]
          },
          {
            name: "interval",
            attributes: [
            { name: "seconds", type: "number", required: true },
            { name: "nanos", type: "number" }
          ]
          }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Backend service ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" },
      { name: "fingerprint", type: "string", description: "Fingerprint" },
      { name: "generated_id", type: "number", description: "Generated ID" }
    ]
  },
  {
    id: "compute_health_check",
    name: "Health Check",
    description: "Health check for load balancing",
    terraform_resource: "google_compute_health_check",
    icon: NETWORKING_ICONS['google_compute_health_check'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Health check name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "check_interval_sec", type: "number", description: "Check interval", default: 5 },
        { name: "timeout_sec", type: "number", description: "Timeout", default: 5 },
        { name: "healthy_threshold", type: "number", description: "Healthy threshold", default: 2 },
        { name: "unhealthy_threshold", type: "number", description: "Unhealthy threshold", default: 2 }
      ],
      blocks: [
    {
      name: "tcp_health_check",
      attributes: [
      { name: "port", type: "number" },
      { name: "port_name", type: "string" },
      { name: "port_specification", type: "string", options: ["USE_FIXED_PORT", "USE_NAMED_PORT", "USE_SERVING_PORT"] },
      { name: "proxy_header", type: "string", options: ["NONE", "PROXY_V1"] },
      { name: "request", type: "string" },
      { name: "response", type: "string" }
    ]
    },
    {
      name: "http_health_check",
      attributes: [
      { name: "port", type: "number" },
      { name: "port_name", type: "string" },
      { name: "port_specification", type: "string" },
      { name: "proxy_header", type: "string" },
      { name: "request_path", type: "string" },
      { name: "host", type: "string" },
      { name: "response", type: "string" }
    ]
    },
    {
      name: "https_health_check",
      attributes: [
      { name: "port", type: "number" },
      { name: "port_name", type: "string" },
      { name: "port_specification", type: "string" },
      { name: "proxy_header", type: "string" },
      { name: "request_path", type: "string" },
      { name: "host", type: "string" },
      { name: "response", type: "string" }
    ]
    },
    {
      name: "grpc_health_check",
      attributes: [
      { name: "port", type: "number" },
      { name: "port_name", type: "string" },
      { name: "port_specification", type: "string" },
      { name: "grpc_service_name", type: "string" }
    ]
    },
    {
      name: "ssl_health_check",
      attributes: [
      { name: "port", type: "number" },
      { name: "port_name", type: "string" },
      { name: "port_specification", type: "string" },
      { name: "proxy_header", type: "string" },
      { name: "request", type: "string" },
      { name: "response", type: "string" }
    ]
    },
    {
      name: "log_config",
      attributes: [
      { name: "enable", type: "bool" }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Health check ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" },
      { name: "type", type: "string", description: "Health check type" }
    ]
  },
  {
    id: "dns_managed_zone",
    name: "Cloud DNS Zone",
    description: "Cloud DNS managed zone",
    terraform_resource: "google_dns_managed_zone",
    icon: NETWORKING_ICONS['google_dns_managed_zone'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Zone name" },
        { name: "dns_name", type: "string", description: "DNS name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "visibility", type: "string", description: "Visibility", options: ["public", "private"] },
        { name: "labels", type: "map", description: "Labels" },
        { name: "force_destroy", type: "bool", description: "Force destroy" }
      ],
      blocks: [
    {
      name: "dnssec_config",
      attributes: [
      { name: "kind", type: "string" },
      { name: "non_existence", type: "string", options: ["nsec", "nsec3"] },
      { name: "state", type: "string", options: ["on", "off", "transfer"] }
    ],
      blocks: [
          {
            name: "default_key_specs",
            multiple: true,
            attributes: [
            { name: "algorithm", type: "string" },
            { name: "key_length", type: "number" },
            { name: "key_type", type: "string", options: ["keySigning", "zoneSigning"] },
            { name: "kind", type: "string" }
          ]
          }
    ]
    },
    {
      name: "private_visibility_config",
      attributes: [],
      blocks: [
          {
            name: "networks",
            multiple: true,
            attributes: [
            { name: "network_url", type: "string", required: true }
          ]
          },
          {
            name: "gke_clusters",
            multiple: true,
            attributes: [
            { name: "gke_cluster_name", type: "string", required: true }
          ]
          }
    ]
    },
    {
      name: "forwarding_config",
      attributes: [],
      blocks: [
          {
            name: "target_name_servers",
            required: true,
            multiple: true,
            attributes: [
            { name: "ipv4_address", type: "string", required: true },
            { name: "forwarding_path", type: "string", options: ["default", "private"] }
          ]
          }
    ]
    },
    {
      name: "peering_config",
      attributes: [],
      blocks: [
          {
            name: "target_network",
            required: true,
            attributes: [
            { name: "network_url", type: "string", required: true }
          ]
          }
    ]
    },
    {
      name: "cloud_logging_config",
      attributes: [
      { name: "enable_logging", type: "bool", required: true }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Zone ID" },
      { name: "managed_zone_id", type: "number", description: "Managed zone ID" },
      { name: "name_servers", type: "list", description: "Name servers" },
      { name: "creation_time", type: "string", description: "Creation time" }
    ]
  },
  {
    id: "dns_record_set",
    name: "DNS Record Set",
    description: "DNS record in managed zone",
    terraform_resource: "google_dns_record_set",
    icon: NETWORKING_ICONS['google_dns_record_set'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Record name" },
        { name: "managed_zone", type: "string", description: "Managed zone name" },
        { name: "type", type: "string", description: "Record type", options: ["A", "AAAA", "CAA", "CNAME", "DNSKEY", "DS", "IPSECKEY", "MX", "NAPTR", "NS", "PTR", "SOA", "SPF", "SRV", "SSHFP", "TLSA", "TXT"] },
        { name: "ttl", type: "number", description: "TTL in seconds" },
        { name: "rrdatas", type: "list", description: "Record data" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" }
      ],
      blocks: [
    {
      name: "routing_policy",
      attributes: [],
      blocks: [
          {
            name: "wrr",
            multiple: true,
            attributes: [
            { name: "weight", type: "number", required: true },
            { name: "rrdatas", type: "list" }
          ],
            blocks: [
                {
                  name: "health_checked_targets",
                  attributes: [],
                  blocks: [
                      {
                        name: "internal_load_balancers",
                        multiple: true,
                        attributes: [
                        { name: "load_balancer_type", type: "string", required: true },
                        { name: "ip_address", type: "string", required: true },
                        { name: "port", type: "string", required: true },
                        { name: "ip_protocol", type: "string", required: true },
                        { name: "network_url", type: "string", required: true },
                        { name: "project", type: "string", required: true },
                        { name: "region", type: "string" }
                      ]
                      }
                ]
                }
          ]
          },
          {
            name: "geo",
            multiple: true,
            attributes: [
            { name: "location", type: "string", required: true },
            { name: "rrdatas", type: "list" }
          ]
          },
          {
            name: "primary_backup",
            attributes: [
            { name: "trickle_ratio", type: "number" },
            { name: "enable_geo_fencing_for_backups", type: "bool" }
          ],
            blocks: [
                {
                  name: "primary",
                  required: true,
                  attributes: []
                },
                {
                  name: "backup_geo",
                  required: true,
                  multiple: true,
                  attributes: [
                  { name: "location", type: "string", required: true },
                  { name: "rrdatas", type: "list" }
                ]
                }
          ]
          }
    ]
    }
      ]
    },
    outputs: [

    ]
  },
  {
    id: "compute_vpn_gateway",
    name: "VPN Gateway",
    description: "Classic VPN gateway",
    terraform_resource: "google_compute_vpn_gateway",
    icon: NETWORKING_ICONS['google_compute_vpn_gateway'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Gateway name" },
        { name: "network", type: "string", description: "VPC network" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" }
      ],
      blocks: [
        // No blocks
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Gateway ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "gateway_id", type: "number", description: "Gateway ID number" },
      { name: "creation_timestamp", type: "string", description: "Creation timestamp" }
    ]
  },
  {
    id: "compute_ha_vpn_gateway",
    name: "HA VPN Gateway",
    description: "High-availability VPN gateway",
    terraform_resource: "google_compute_ha_vpn_gateway",
    icon: NETWORKING_ICONS['google_compute_ha_vpn_gateway'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Gateway name" },
        { name: "network", type: "string", description: "VPC network" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "region", type: "string", description: "Region" },
        { name: "description", type: "string", description: "Description" },
        { name: "stack_type", type: "string", description: "Stack type", options: ["IPV4_ONLY", "IPV4_IPV6"] }
      ],
      blocks: [
    {
      name: "vpn_interfaces",
      multiple: true,
      attributes: [
      { name: "id", type: "number" },
      { name: "interconnect_attachment", type: "string" }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Gateway ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "vpn_interfaces", type: "list", description: "VPN interfaces" }
    ]
  },
  {
    id: "service_networking_connection",
    name: "Private Service Connection",
    description: "Private service connection for VPC",
    terraform_resource: "google_service_networking_connection",
    icon: NETWORKING_ICONS['google_service_networking_connection'],
    inputs: {
      required: [
        { name: "network", type: "string", description: "VPC network" },
        { name: "service", type: "string", description: "Service", default: "servicenetworking.googleapis.com" },
        { name: "reserved_peering_ranges", type: "list", description: "Reserved IP ranges" }
      ],
      optional: [
        // No optional inputs
      ],
      blocks: [
        // No blocks
      ]
    },
    outputs: [
      { name: "peering", type: "string", description: "Peering name" }
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
