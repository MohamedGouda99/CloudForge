/**
 * AWS Networking Services Data - Complete definitions from networking.json
 * This file contains ALL 28 networking services with ALL their properties
 * 
 * Services included:
 * 1. VPC (aws_vpc)
 * 2. Subnet (aws_subnet)
 * 3. Internet Gateway (aws_internet_gateway)
 * 4. NAT Gateway (aws_nat_gateway)
 * 5. Route Table (aws_route_table)
 * 6. Route (aws_route)
 * 7. Route Table Association (aws_route_table_association)
 * 8. Security Group (aws_security_group)
 * 9. Security Group Rule (aws_security_group_rule)
 * 10. Network ACL (aws_network_acl)
 * 11. VPC Peering Connection (aws_vpc_peering_connection)
 * 12. Transit Gateway (aws_ec2_transit_gateway)
 * 13. Transit Gateway VPC Attachment (aws_ec2_transit_gateway_vpc_attachment)
 * 14. VPN Gateway (aws_vpn_gateway)
 * 15. Customer Gateway (aws_customer_gateway)
 * 16. VPN Connection (aws_vpn_connection)
 * 17. VPC Endpoint (aws_vpc_endpoint)
 * 18. Network Interface (aws_network_interface)
 * 19. Load Balancer (aws_lb)
 * 20. Target Group (aws_lb_target_group)
 * 21. LB Listener (aws_lb_listener)
 * 22. LB Listener Rule (aws_lb_listener_rule)
 * 23. Route 53 Zone (aws_route53_zone)
 * 24. Route 53 Record (aws_route53_record)
 * 25. CloudFront Distribution (aws_cloudfront_distribution)
 * 26. API Gateway REST API (aws_api_gateway_rest_api)
 * 27. API Gateway V2 API (aws_apigatewayv2_api)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Networking service icon mappings - using actual AWS Architecture icons
export const NETWORKING_ICONS: Record<string, string> = {
  'aws_vpc': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_subnet': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_internet_gateway': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_nat_gateway': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_route_table': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_route': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_route_table_association': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_security_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_security_group_rule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_network_acl': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_vpc_peering_connection': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_ec2_transit_gateway': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Transit-Gateway_64.svg',
  'aws_ec2_transit_gateway_vpc_attachment': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Transit-Gateway_64.svg',
  'aws_vpn_gateway': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg',
  'aws_customer_gateway': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg',
  'aws_vpn_connection': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg',
  'aws_vpc_endpoint': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-PrivateLink_64.svg',
  'aws_network_interface': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
  'aws_lb': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
  'aws_lb_target_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
  'aws_lb_listener': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
  'aws_lb_listener_rule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
  'aws_route53_zone': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg',
  'aws_route53_record': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg',
  'aws_cloudfront_distribution': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg',
  'aws_api_gateway_rest_api': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg',
  'aws_apigatewayv2_api': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg',
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
    id: "vpc",
    name: "VPC",
    description: "Virtual Private Cloud",
    terraform_resource: "aws_vpc",
    icon: NETWORKING_ICONS['aws_vpc'],
    inputs: {
      required: [
        { name: "cidr_block", type: "string", description: "IPv4 CIDR block", example: "10.0.0.0/16" }
      ],
      optional: [
        { name: "instance_tenancy", type: "string", description: "Instance tenancy", options: ["default", "dedicated"], default: "default" },
        { name: "ipv4_ipam_pool_id", type: "string", description: "IPAM pool ID for IPv4" },
        { name: "ipv4_netmask_length", type: "number", description: "Netmask length for IPv4" },
        { name: "ipv6_cidr_block", type: "string", description: "IPv6 CIDR block" },
        { name: "ipv6_ipam_pool_id", type: "string", description: "IPAM pool ID for IPv6" },
        { name: "ipv6_netmask_length", type: "number", description: "Netmask length for IPv6" },
        { name: "ipv6_cidr_block_network_border_group", type: "string", description: "Network border group" },
        { name: "assign_generated_ipv6_cidr_block", type: "bool", description: "Request IPv6 CIDR block" },
        { name: "enable_dns_support", type: "bool", description: "Enable DNS support", default: true },
        { name: "enable_dns_hostnames", type: "bool", description: "Enable DNS hostnames", default: false },
        { name: "enable_network_address_usage_metrics", type: "bool", description: "Enable network address usage metrics" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VPC ID" },
      { name: "arn", type: "string", description: "VPC ARN" },
      { name: "cidr_block", type: "string", description: "CIDR block" },
      { name: "instance_tenancy", type: "string", description: "Instance tenancy" },
      { name: "enable_dns_support", type: "bool", description: "DNS support enabled" },
      { name: "enable_dns_hostnames", type: "bool", description: "DNS hostnames enabled" },
      { name: "main_route_table_id", type: "string", description: "Main route table ID" },
      { name: "default_network_acl_id", type: "string", description: "Default NACL ID" },
      { name: "default_security_group_id", type: "string", description: "Default SG ID" },
      { name: "default_route_table_id", type: "string", description: "Default route table ID" },
      { name: "ipv6_association_id", type: "string", description: "IPv6 association ID" },
      { name: "ipv6_cidr_block_network_border_group", type: "string", description: "IPv6 network border group" },
      { name: "owner_id", type: "string", description: "Owner account ID" }
    ]
  },
  {
    id: "subnet",
    name: "Subnet",
    description: "VPC Subnet",
    terraform_resource: "aws_subnet",
    icon: NETWORKING_ICONS['aws_subnet'],
    inputs: {
      required: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
      ],
      optional: [
        { name: "cidr_block", type: "string", description: "IPv4 CIDR block" },
        { name: "availability_zone", type: "string", description: "Availability zone" },
        { name: "availability_zone_id", type: "string", description: "Availability zone ID" },
        { name: "customer_owned_ipv4_pool", type: "string", description: "Customer owned IPv4 pool" },
        { name: "enable_dns64", type: "bool", description: "Enable DNS64" },
        { name: "enable_lni_at_device_index", type: "number", description: "Enable LNI at device index" },
        { name: "enable_resource_name_dns_aaaa_record_on_launch", type: "bool", description: "Enable AAAA DNS record on launch" },
        { name: "enable_resource_name_dns_a_record_on_launch", type: "bool", description: "Enable A DNS record on launch" },
        { name: "ipv6_cidr_block", type: "string", description: "IPv6 CIDR block" },
        { name: "ipv6_native", type: "bool", description: "IPv6 native subnet" },
        { name: "map_customer_owned_ip_on_launch", type: "bool", description: "Map customer owned IP on launch" },
        { name: "map_public_ip_on_launch", type: "bool", description: "Map public IP on launch" },
        { name: "outpost_arn", type: "string", description: "Outpost ARN" },
        { name: "private_dns_hostname_type_on_launch", type: "string", description: "Private DNS hostname type", options: ["ip-name", "resource-name"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subnet ID" },
      { name: "arn", type: "string", description: "Subnet ARN" },
      { name: "cidr_block", type: "string", description: "CIDR block" },
      { name: "availability_zone", type: "string", description: "Availability zone" },
      { name: "availability_zone_id", type: "string", description: "Availability zone ID" },
      { name: "ipv6_cidr_block_association_id", type: "string", description: "IPv6 association ID" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "internet_gateway",
    name: "Internet Gateway",
    description: "Gateway for internet access",
    terraform_resource: "aws_internet_gateway",
    icon: NETWORKING_ICONS['aws_internet_gateway'],
    inputs: {
      required: [],
      optional: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "IGW ID" },
      { name: "arn", type: "string", description: "IGW ARN" },
      { name: "owner_id", type: "string", description: "Owner account ID" }
    ]
  },
  {
    id: "nat_gateway",
    name: "NAT Gateway",
    description: "Network Address Translation gateway",
    terraform_resource: "aws_nat_gateway",
    icon: NETWORKING_ICONS['aws_nat_gateway'],
    inputs: {
      required: [
        { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "allocation_id", type: "string", description: "EIP allocation ID", reference: "aws_eip.allocation_id" },
        { name: "connectivity_type", type: "string", description: "Connectivity type", options: ["private", "public"], default: "public" },
        { name: "private_ip", type: "string", description: "Private IP address" },
        { name: "secondary_allocation_ids", type: "list(string)", description: "Secondary EIP allocation IDs" },
        { name: "secondary_private_ip_address_count", type: "number", description: "Secondary private IP count" },
        { name: "secondary_private_ip_addresses", type: "list(string)", description: "Secondary private IP addresses" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "NAT Gateway ID" },
      { name: "allocation_id", type: "string", description: "EIP allocation ID" },
      { name: "association_id", type: "string", description: "EIP association ID" },
      { name: "connectivity_type", type: "string", description: "Connectivity type" },
      { name: "network_interface_id", type: "string", description: "Network interface ID" },
      { name: "private_ip", type: "string", description: "Private IP address" },
      { name: "public_ip", type: "string", description: "Public IP address" },
      { name: "subnet_id", type: "string", description: "Subnet ID" }
    ]
  },
  {
    id: "route_table",
    name: "Route Table",
    description: "VPC route table",
    terraform_resource: "aws_route_table",
    icon: NETWORKING_ICONS['aws_route_table'],
    inputs: {
      required: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
      ],
      optional: [
        { name: "propagating_vgws", type: "list(string)", description: "VPN gateway IDs for propagation" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "route",
          multiple: true,
          attributes: [
            { name: "cidr_block", type: "string" },
            { name: "ipv6_cidr_block", type: "string" },
            { name: "destination_prefix_list_id", type: "string" },
            { name: "carrier_gateway_id", type: "string" },
            { name: "core_network_arn", type: "string" },
            { name: "egress_only_gateway_id", type: "string" },
            { name: "gateway_id", type: "string" },
            { name: "local_gateway_id", type: "string" },
            { name: "nat_gateway_id", type: "string" },
            { name: "network_interface_id", type: "string" },
            { name: "transit_gateway_id", type: "string" },
            { name: "vpc_endpoint_id", type: "string" },
            { name: "vpc_peering_connection_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Route table ID" },
      { name: "arn", type: "string", description: "Route table ARN" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "route",
    name: "Route",
    description: "Route in route table",
    terraform_resource: "aws_route",
    icon: NETWORKING_ICONS['aws_route'],
    inputs: {
      required: [
        { name: "route_table_id", type: "string", description: "Route table ID", reference: "aws_route_table.id" }
      ],
      optional: [
        { name: "destination_cidr_block", type: "string", description: "Destination IPv4 CIDR" },
        { name: "destination_ipv6_cidr_block", type: "string", description: "Destination IPv6 CIDR" },
        { name: "destination_prefix_list_id", type: "string", description: "Destination prefix list ID" },
        { name: "carrier_gateway_id", type: "string", description: "Carrier gateway ID" },
        { name: "core_network_arn", type: "string", description: "Core network ARN" },
        { name: "egress_only_gateway_id", type: "string", description: "Egress only IGW ID" },
        { name: "gateway_id", type: "string", description: "Internet gateway ID", reference: "aws_internet_gateway.id" },
        { name: "local_gateway_id", type: "string", description: "Local gateway ID" },
        { name: "nat_gateway_id", type: "string", description: "NAT gateway ID", reference: "aws_nat_gateway.id" },
        { name: "network_interface_id", type: "string", description: "Network interface ID" },
        { name: "transit_gateway_id", type: "string", description: "Transit gateway ID" },
        { name: "vpc_endpoint_id", type: "string", description: "VPC endpoint ID" },
        { name: "vpc_peering_connection_id", type: "string", description: "VPC peering connection ID" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Route ID" },
      { name: "instance_id", type: "string", description: "Instance ID" },
      { name: "instance_owner_id", type: "string", description: "Instance owner ID" },
      { name: "origin", type: "string", description: "Route origin" },
      { name: "state", type: "string", description: "Route state" }
    ]
  },
  {
    id: "route_table_association",
    name: "Route Table Association",
    description: "Associate route table with subnet",
    terraform_resource: "aws_route_table_association",
    icon: NETWORKING_ICONS['aws_route_table_association'],
    inputs: {
      required: [
        { name: "route_table_id", type: "string", description: "Route table ID", reference: "aws_route_table.id" }
      ],
      optional: [
        { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" },
        { name: "gateway_id", type: "string", description: "Gateway ID" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Association ID" }
    ]
  },
  {
    id: "security_group",
    name: "Security Group",
    description: "Virtual firewall for instances",
    terraform_resource: "aws_security_group",
    icon: NETWORKING_ICONS['aws_security_group'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Security group name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "description", type: "string", description: "Description" },
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
        { name: "revoke_rules_on_delete", type: "bool", description: "Revoke rules on delete" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "ingress",
          multiple: true,
          attributes: [
            { name: "from_port", type: "number", required: true },
            { name: "to_port", type: "number", required: true },
            { name: "protocol", type: "string", required: true },
            { name: "cidr_blocks", type: "list(string)" },
            { name: "ipv6_cidr_blocks", type: "list(string)" },
            { name: "prefix_list_ids", type: "list(string)" },
            { name: "security_groups", type: "list(string)" },
            { name: "self", type: "bool" },
            { name: "description", type: "string" }
          ]
        },
        {
          name: "egress",
          multiple: true,
          attributes: [
            { name: "from_port", type: "number", required: true },
            { name: "to_port", type: "number", required: true },
            { name: "protocol", type: "string", required: true },
            { name: "cidr_blocks", type: "list(string)" },
            { name: "ipv6_cidr_blocks", type: "list(string)" },
            { name: "prefix_list_ids", type: "list(string)" },
            { name: "security_groups", type: "list(string)" },
            { name: "self", type: "bool" },
            { name: "description", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Security group ID" },
      { name: "arn", type: "string", description: "Security group ARN" },
      { name: "name", type: "string", description: "Security group name" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "security_group_rule",
    name: "Security Group Rule",
    description: "Individual security group rule",
    terraform_resource: "aws_security_group_rule",
    icon: NETWORKING_ICONS['aws_security_group_rule'],
    inputs: {
      required: [
        { name: "security_group_id", type: "string", description: "Security group ID", reference: "aws_security_group.id" },
        { name: "type", type: "string", description: "Rule type", options: ["ingress", "egress"] },
        { name: "from_port", type: "number", description: "From port" },
        { name: "to_port", type: "number", description: "To port" },
        { name: "protocol", type: "string", description: "Protocol", options: ["tcp", "udp", "icmp", "icmpv6", "-1"] }
      ],
      optional: [
        { name: "cidr_blocks", type: "list(string)", description: "IPv4 CIDR blocks" },
        { name: "ipv6_cidr_blocks", type: "list(string)", description: "IPv6 CIDR blocks" },
        { name: "prefix_list_ids", type: "list(string)", description: "Prefix list IDs" },
        { name: "source_security_group_id", type: "string", description: "Source security group ID" },
        { name: "self", type: "bool", description: "Self-referencing rule" },
        { name: "description", type: "string", description: "Rule description" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Rule ID" },
      { name: "security_group_rule_id", type: "string", description: "Security group rule ID" }
    ]
  },
  {
    id: "network_acl",
    name: "Network ACL",
    description: "Network Access Control List",
    terraform_resource: "aws_network_acl",
    icon: NETWORKING_ICONS['aws_network_acl'],
    inputs: {
      required: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
      ],
      optional: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "ingress",
          multiple: true,
          attributes: [
            { name: "rule_no", type: "number", required: true },
            { name: "protocol", type: "string", required: true },
            { name: "action", type: "string", required: true, options: ["allow", "deny"] },
            { name: "from_port", type: "number" },
            { name: "to_port", type: "number" },
            { name: "cidr_block", type: "string" },
            { name: "ipv6_cidr_block", type: "string" },
            { name: "icmp_type", type: "number" },
            { name: "icmp_code", type: "number" }
          ]
        },
        {
          name: "egress",
          multiple: true,
          attributes: [
            { name: "rule_no", type: "number", required: true },
            { name: "protocol", type: "string", required: true },
            { name: "action", type: "string", required: true, options: ["allow", "deny"] },
            { name: "from_port", type: "number" },
            { name: "to_port", type: "number" },
            { name: "cidr_block", type: "string" },
            { name: "ipv6_cidr_block", type: "string" },
            { name: "icmp_type", type: "number" },
            { name: "icmp_code", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "NACL ID" },
      { name: "arn", type: "string", description: "NACL ARN" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "vpc_peering_connection",
    name: "VPC Peering Connection",
    description: "Peering between two VPCs",
    terraform_resource: "aws_vpc_peering_connection",
    icon: NETWORKING_ICONS['aws_vpc_peering_connection'],
    inputs: {
      required: [
        { name: "vpc_id", type: "string", description: "Requester VPC ID", reference: "aws_vpc.id" },
        { name: "peer_vpc_id", type: "string", description: "Peer VPC ID" }
      ],
      optional: [
        { name: "peer_owner_id", type: "string", description: "Peer owner account ID" },
        { name: "peer_region", type: "string", description: "Peer region" },
        { name: "auto_accept", type: "bool", description: "Auto accept peering" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "accepter",
          attributes: [
            { name: "allow_remote_vpc_dns_resolution", type: "bool" }
          ]
        },
        {
          name: "requester",
          attributes: [
            { name: "allow_remote_vpc_dns_resolution", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Peering connection ID" },
      { name: "accept_status", type: "string", description: "Accept status" }
    ]
  },
  {
    id: "transit_gateway",
    name: "Transit Gateway",
    description: "Hub for VPC and on-premises networks",
    terraform_resource: "aws_ec2_transit_gateway",
    icon: NETWORKING_ICONS['aws_ec2_transit_gateway'],
    inputs: {
      required: [],
      optional: [
        { name: "amazon_side_asn", type: "number", description: "Private ASN" },
        { name: "auto_accept_shared_attachments", type: "string", description: "Auto accept shared attachments", options: ["disable", "enable"] },
        { name: "default_route_table_association", type: "string", description: "Default route table association", options: ["disable", "enable"] },
        { name: "default_route_table_propagation", type: "string", description: "Default route table propagation", options: ["disable", "enable"] },
        { name: "description", type: "string", description: "Description" },
        { name: "dns_support", type: "string", description: "DNS support", options: ["disable", "enable"] },
        { name: "multicast_support", type: "string", description: "Multicast support", options: ["disable", "enable"] },
        { name: "transit_gateway_cidr_blocks", type: "list(string)", description: "Transit Gateway CIDR blocks" },
        { name: "vpn_ecmp_support", type: "string", description: "VPN ECMP support", options: ["disable", "enable"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Transit Gateway ID" },
      { name: "arn", type: "string", description: "Transit Gateway ARN" },
      { name: "association_default_route_table_id", type: "string", description: "Default association route table ID" },
      { name: "propagation_default_route_table_id", type: "string", description: "Default propagation route table ID" },
      { name: "owner_id", type: "string", description: "Owner account ID" }
    ]
  },
  {
    id: "transit_gateway_vpc_attachment",
    name: "Transit Gateway VPC Attachment",
    description: "Attach VPC to Transit Gateway",
    terraform_resource: "aws_ec2_transit_gateway_vpc_attachment",
    icon: NETWORKING_ICONS['aws_ec2_transit_gateway_vpc_attachment'],
    inputs: {
      required: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" },
        { name: "transit_gateway_id", type: "string", description: "Transit Gateway ID", reference: "aws_ec2_transit_gateway.id" },
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
      ],
      optional: [
        { name: "appliance_mode_support", type: "string", description: "Appliance mode support", options: ["disable", "enable"] },
        { name: "dns_support", type: "string", description: "DNS support", options: ["disable", "enable"] },
        { name: "ipv6_support", type: "string", description: "IPv6 support", options: ["disable", "enable"] },
        { name: "transit_gateway_default_route_table_association", type: "bool", description: "Default route table association" },
        { name: "transit_gateway_default_route_table_propagation", type: "bool", description: "Default route table propagation" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Attachment ID" },
      { name: "vpc_owner_id", type: "string", description: "VPC owner account ID" }
    ]
  },
  {
    id: "vpn_gateway",
    name: "VPN Gateway",
    description: "Virtual Private Network gateway",
    terraform_resource: "aws_vpn_gateway",
    icon: NETWORKING_ICONS['aws_vpn_gateway'],
    inputs: {
      required: [],
      optional: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
        { name: "availability_zone", type: "string", description: "Availability zone" },
        { name: "amazon_side_asn", type: "string", description: "Amazon side ASN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VPN Gateway ID" },
      { name: "arn", type: "string", description: "VPN Gateway ARN" },
      { name: "amazon_side_asn", type: "string", description: "Amazon side ASN" }
    ]
  },
  {
    id: "customer_gateway",
    name: "Customer Gateway",
    description: "Customer-side VPN gateway",
    terraform_resource: "aws_customer_gateway",
    icon: NETWORKING_ICONS['aws_customer_gateway'],
    inputs: {
      required: [
        { name: "bgp_asn", type: "string", description: "BGP ASN" },
        { name: "type", type: "string", description: "Gateway type", options: ["ipsec.1"] }
      ],
      optional: [
        { name: "ip_address", type: "string", description: "IP address" },
        { name: "certificate_arn", type: "string", description: "Certificate ARN" },
        { name: "device_name", type: "string", description: "Device name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Customer Gateway ID" },
      { name: "arn", type: "string", description: "Customer Gateway ARN" }
    ]
  },
  {
    id: "vpn_connection",
    name: "VPN Connection",
    description: "Site-to-site VPN connection",
    terraform_resource: "aws_vpn_connection",
    icon: NETWORKING_ICONS['aws_vpn_connection'],
    inputs: {
      required: [
        { name: "customer_gateway_id", type: "string", description: "Customer Gateway ID", reference: "aws_customer_gateway.id" },
        { name: "type", type: "string", description: "Connection type", options: ["ipsec.1"] }
      ],
      optional: [
        { name: "vpn_gateway_id", type: "string", description: "VPN Gateway ID", reference: "aws_vpn_gateway.id" },
        { name: "transit_gateway_id", type: "string", description: "Transit Gateway ID" },
        { name: "enable_acceleration", type: "bool", description: "Enable acceleration" },
        { name: "local_ipv4_network_cidr", type: "string", description: "Local IPv4 CIDR" },
        { name: "local_ipv6_network_cidr", type: "string", description: "Local IPv6 CIDR" },
        { name: "outside_ip_address_type", type: "string", description: "Outside IP address type" },
        { name: "remote_ipv4_network_cidr", type: "string", description: "Remote IPv4 CIDR" },
        { name: "remote_ipv6_network_cidr", type: "string", description: "Remote IPv6 CIDR" },
        { name: "static_routes_only", type: "bool", description: "Use static routes only" },
        { name: "tunnel_inside_ip_version", type: "string", description: "Tunnel IP version", options: ["ipv4", "ipv6"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "VPN Connection ID" },
      { name: "arn", type: "string", description: "VPN Connection ARN" },
      { name: "tunnel1_address", type: "string", description: "Tunnel 1 outside IP" },
      { name: "tunnel1_preshared_key", type: "string", description: "Tunnel 1 preshared key" },
      { name: "transit_gateway_attachment_id", type: "string", description: "Transit Gateway attachment ID" }
    ]
  },
  {
    id: "vpc_endpoint",
    name: "VPC Endpoint",
    description: "Private connection to AWS services",
    terraform_resource: "aws_vpc_endpoint",
    icon: NETWORKING_ICONS['aws_vpc_endpoint'],
    inputs: {
      required: [
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
        { name: "service_name", type: "string", description: "AWS service name" }
      ],
      optional: [
        { name: "vpc_endpoint_type", type: "string", description: "Endpoint type", options: ["Gateway", "Interface", "GatewayLoadBalancer"] },
        { name: "auto_accept", type: "bool", description: "Auto accept endpoint connection" },
        { name: "policy", type: "string", description: "Endpoint policy JSON" },
        { name: "private_dns_enabled", type: "bool", description: "Enable private DNS" },
        { name: "ip_address_type", type: "string", description: "IP address type", options: ["ipv4", "dualstack", "ipv6"] },
        { name: "route_table_ids", type: "list(string)", description: "Route table IDs for Gateway endpoints" },
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs for Interface endpoints" },
        { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "dns_options",
          attributes: [
            { name: "dns_record_ip_type", type: "string" },
            { name: "private_dns_only_for_inbound_resolver_endpoint", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Endpoint ID" },
      { name: "arn", type: "string", description: "Endpoint ARN" },
      { name: "cidr_blocks", type: "list(string)", description: "CIDR blocks for Gateway endpoints" },
      { name: "dns_entry", type: "list(object)", description: "DNS entries" },
      { name: "network_interface_ids", type: "list(string)", description: "Network interface IDs" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "prefix_list_id", type: "string", description: "Prefix list ID" },
      { name: "state", type: "string", description: "Endpoint state" }
    ]
  },
  {
    id: "network_interface",
    name: "Network Interface",
    description: "Elastic Network Interface",
    terraform_resource: "aws_network_interface",
    icon: NETWORKING_ICONS['aws_network_interface'],
    inputs: {
      required: [
        { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "interface_type", type: "string", description: "Interface type", options: ["efa", "interface"] },
        { name: "ipv4_prefix_count", type: "number", description: "IPv4 prefix count" },
        { name: "ipv4_prefixes", type: "list(string)", description: "IPv4 prefixes" },
        { name: "ipv6_address_count", type: "number", description: "IPv6 address count" },
        { name: "ipv6_address_list", type: "list(string)", description: "IPv6 addresses" },
        { name: "private_ip", type: "string", description: "Primary private IP" },
        { name: "private_ips", type: "list(string)", description: "Secondary private IPs" },
        { name: "private_ips_count", type: "number", description: "Secondary private IP count" },
        { name: "security_groups", type: "list(string)", description: "Security group IDs" },
        { name: "source_dest_check", type: "bool", description: "Enable source/dest check" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "attachment",
          multiple: true,
          attributes: [
            { name: "instance", type: "string", required: true },
            { name: "device_index", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "ENI ID" },
      { name: "arn", type: "string", description: "ENI ARN" },
      { name: "mac_address", type: "string", description: "MAC address" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "private_dns_name", type: "string", description: "Private DNS name" }
    ]
  },
  {
    id: "lb",
    name: "Load Balancer",
    description: "Application/Network Load Balancer",
    terraform_resource: "aws_lb",
    icon: NETWORKING_ICONS['aws_lb'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Load balancer name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "internal", type: "bool", description: "Is internal", default: false },
        { name: "load_balancer_type", type: "string", description: "Load balancer type", options: ["application", "network", "gateway"], default: "application" },
        { name: "security_groups", type: "list(string)", description: "Security group IDs" },
        { name: "subnets", type: "list(string)", description: "Subnet IDs" },
        { name: "enable_deletion_protection", type: "bool", description: "Enable deletion protection" },
        { name: "enable_cross_zone_load_balancing", type: "bool", description: "Enable cross-zone load balancing" },
        { name: "enable_http2", type: "bool", description: "Enable HTTP/2" },
        { name: "idle_timeout", type: "number", description: "Idle timeout in seconds" },
        { name: "ip_address_type", type: "string", description: "IP address type", options: ["ipv4", "dualstack"] },
        { name: "preserve_host_header", type: "bool", description: "Preserve host header" },
        { name: "drop_invalid_header_fields", type: "bool", description: "Drop invalid header fields" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "access_logs",
          attributes: [
            { name: "bucket", type: "string", required: true },
            { name: "enabled", type: "bool" },
            { name: "prefix", type: "string" }
          ]
        },
        {
          name: "subnet_mapping",
          multiple: true,
          attributes: [
            { name: "subnet_id", type: "string", required: true },
            { name: "allocation_id", type: "string" },
            { name: "ipv6_address", type: "string" },
            { name: "private_ipv4_address", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Load balancer ID" },
      { name: "arn", type: "string", description: "Load balancer ARN" },
      { name: "arn_suffix", type: "string", description: "ARN suffix" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "zone_id", type: "string", description: "Route 53 zone ID" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "lb_target_group",
    name: "Target Group",
    description: "Load balancer target group",
    terraform_resource: "aws_lb_target_group",
    icon: NETWORKING_ICONS['aws_lb_target_group'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Target group name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "port", type: "number", description: "Port" },
        { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "TCP", "TLS", "UDP", "TCP_UDP", "GENEVE"] },
        { name: "protocol_version", type: "string", description: "Protocol version", options: ["HTTP1", "HTTP2", "GRPC"] },
        { name: "vpc_id", type: "string", description: "VPC ID" },
        { name: "target_type", type: "string", description: "Target type", options: ["instance", "ip", "lambda", "alb"] },
        { name: "deregistration_delay", type: "string", description: "Deregistration delay" },
        { name: "slow_start", type: "number", description: "Slow start duration" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "health_check",
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "healthy_threshold", type: "number" },
            { name: "interval", type: "number" },
            { name: "matcher", type: "string" },
            { name: "path", type: "string" },
            { name: "port", type: "string" },
            { name: "protocol", type: "string" },
            { name: "timeout", type: "number" },
            { name: "unhealthy_threshold", type: "number" }
          ]
        },
        {
          name: "stickiness",
          attributes: [
            { name: "type", type: "string", required: true, options: ["lb_cookie", "app_cookie", "source_ip", "source_ip_dest_ip", "source_ip_dest_ip_proto"] },
            { name: "cookie_duration", type: "number" },
            { name: "cookie_name", type: "string" },
            { name: "enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Target group ID" },
      { name: "arn", type: "string", description: "Target group ARN" },
      { name: "arn_suffix", type: "string", description: "ARN suffix" },
      { name: "name", type: "string", description: "Target group name" },
      { name: "load_balancer_arns", type: "list(string)", description: "Load balancer ARNs" }
    ]
  },
  {
    id: "lb_listener",
    name: "LB Listener",
    description: "Load balancer listener",
    terraform_resource: "aws_lb_listener",
    icon: NETWORKING_ICONS['aws_lb_listener'],
    inputs: {
      required: [
        { name: "load_balancer_arn", type: "string", description: "Load balancer ARN", reference: "aws_lb.arn" }
      ],
      optional: [
        { name: "port", type: "number", description: "Port" },
        { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "TCP", "TLS", "UDP", "TCP_UDP"] },
        { name: "alpn_policy", type: "string", description: "ALPN policy" },
        { name: "certificate_arn", type: "string", description: "SSL certificate ARN" },
        { name: "ssl_policy", type: "string", description: "SSL policy" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "default_action",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["forward", "redirect", "fixed-response", "authenticate-cognito", "authenticate-oidc"] },
            { name: "order", type: "number" },
            { name: "target_group_arn", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Listener ID" },
      { name: "arn", type: "string", description: "Listener ARN" }
    ]
  },
  {
    id: "lb_listener_rule",
    name: "LB Listener Rule",
    description: "Load balancer listener rule",
    terraform_resource: "aws_lb_listener_rule",
    icon: NETWORKING_ICONS['aws_lb_listener_rule'],
    inputs: {
      required: [
        { name: "listener_arn", type: "string", description: "Listener ARN", reference: "aws_lb_listener.arn" }
      ],
      optional: [
        { name: "priority", type: "number", description: "Rule priority" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "action",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true },
            { name: "order", type: "number" },
            { name: "target_group_arn", type: "string" }
          ]
        },
        {
          name: "condition",
          multiple: true,
          description: "Rule conditions",
          attributes: []
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Rule ID" },
      { name: "arn", type: "string", description: "Rule ARN" }
    ]
  },
  {
    id: "route53_zone",
    name: "Route 53 Zone",
    description: "DNS hosted zone",
    terraform_resource: "aws_route53_zone",
    icon: NETWORKING_ICONS['aws_route53_zone'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Domain name" }
      ],
      optional: [
        { name: "comment", type: "string", description: "Zone comment" },
        { name: "delegation_set_id", type: "string", description: "Delegation set ID" },
        { name: "force_destroy", type: "bool", description: "Force destroy" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "vpc",
          multiple: true,
          attributes: [
            { name: "vpc_id", type: "string", required: true },
            { name: "vpc_region", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "zone_id", type: "string", description: "Zone ID" },
      { name: "arn", type: "string", description: "Zone ARN" },
      { name: "name", type: "string", description: "Domain name" },
      { name: "name_servers", type: "list(string)", description: "Name servers" },
      { name: "primary_name_server", type: "string", description: "Primary name server" }
    ]
  },
  {
    id: "route53_record",
    name: "Route 53 Record",
    description: "DNS record",
    terraform_resource: "aws_route53_record",
    icon: NETWORKING_ICONS['aws_route53_record'],
    inputs: {
      required: [
        { name: "zone_id", type: "string", description: "Hosted zone ID", reference: "aws_route53_zone.zone_id" },
        { name: "name", type: "string", description: "Record name" },
        { name: "type", type: "string", description: "Record type", options: ["A", "AAAA", "CAA", "CNAME", "DS", "MX", "NAPTR", "NS", "PTR", "SOA", "SPF", "SRV", "TXT"] }
      ],
      optional: [
        { name: "ttl", type: "number", description: "TTL in seconds" },
        { name: "records", type: "list(string)", description: "Record values" },
        { name: "set_identifier", type: "string", description: "Set identifier for routing" },
        { name: "health_check_id", type: "string", description: "Health check ID" },
        { name: "multivalue_answer_routing_policy", type: "bool", description: "Enable multivalue answer routing" },
        { name: "allow_overwrite", type: "bool", description: "Allow overwriting existing records" }
      ],
      blocks: [
        {
          name: "alias",
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "zone_id", type: "string", required: true },
            { name: "evaluate_target_health", type: "bool", required: true }
          ]
        },
        {
          name: "failover_routing_policy",
          attributes: [
            { name: "type", type: "string", required: true, options: ["PRIMARY", "SECONDARY"] }
          ]
        },
        {
          name: "geolocation_routing_policy",
          attributes: [
            { name: "continent", type: "string" },
            { name: "country", type: "string" },
            { name: "subdivision", type: "string" }
          ]
        },
        {
          name: "latency_routing_policy",
          attributes: [
            { name: "region", type: "string", required: true }
          ]
        },
        {
          name: "weighted_routing_policy",
          attributes: [
            { name: "weight", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "name", type: "string", description: "Record name" },
      { name: "fqdn", type: "string", description: "FQDN" }
    ]
  },
  {
    id: "cloudfront_distribution",
    name: "CloudFront Distribution",
    description: "Content delivery network",
    terraform_resource: "aws_cloudfront_distribution",
    icon: NETWORKING_ICONS['aws_cloudfront_distribution'],
    inputs: {
      required: [
        { name: "enabled", type: "bool", description: "Enable distribution" }
      ],
      optional: [
        { name: "aliases", type: "list(string)", description: "Alternate domain names" },
        { name: "comment", type: "string", description: "Distribution comment" },
        { name: "default_root_object", type: "string", description: "Default root object" },
        { name: "http_version", type: "string", description: "HTTP version", options: ["http1.1", "http2", "http2and3", "http3"] },
        { name: "is_ipv6_enabled", type: "bool", description: "Enable IPv6" },
        { name: "price_class", type: "string", description: "Price class", options: ["PriceClass_All", "PriceClass_200", "PriceClass_100"] },
        { name: "retain_on_delete", type: "bool", description: "Retain on delete" },
        { name: "wait_for_deployment", type: "bool", description: "Wait for deployment" },
        { name: "web_acl_id", type: "string", description: "WAF Web ACL ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "origin",
          multiple: true,
          description: "Content origin configuration",
          attributes: [
            { name: "domain_name", type: "string", required: true },
            { name: "origin_id", type: "string", required: true },
            { name: "connection_attempts", type: "number" },
            { name: "connection_timeout", type: "number" },
            { name: "origin_access_control_id", type: "string" },
            { name: "origin_path", type: "string" }
          ]
        },
        {
          name: "default_cache_behavior",
          description: "Default cache behavior",
          attributes: [
            { name: "allowed_methods", type: "list(string)", required: true },
            { name: "cached_methods", type: "list(string)", required: true },
            { name: "target_origin_id", type: "string", required: true },
            { name: "viewer_protocol_policy", type: "string", required: true, options: ["allow-all", "https-only", "redirect-to-https"] },
            { name: "compress", type: "bool" },
            { name: "default_ttl", type: "number" },
            { name: "max_ttl", type: "number" },
            { name: "min_ttl", type: "number" }
          ]
        },
        {
          name: "restrictions",
          description: "Distribution restrictions",
          attributes: []
        },
        {
          name: "viewer_certificate",
          description: "Viewer certificate configuration",
          attributes: [
            { name: "acm_certificate_arn", type: "string" },
            { name: "cloudfront_default_certificate", type: "bool" },
            { name: "iam_certificate_id", type: "string" },
            { name: "minimum_protocol_version", type: "string" },
            { name: "ssl_support_method", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Distribution ID" },
      { name: "arn", type: "string", description: "Distribution ARN" },
      { name: "domain_name", type: "string", description: "Domain name" },
      { name: "etag", type: "string", description: "ETag" },
      { name: "hosted_zone_id", type: "string", description: "Route 53 zone ID" },
      { name: "status", type: "string", description: "Distribution status" }
    ]
  },
  {
    id: "api_gateway_rest_api",
    name: "API Gateway REST API",
    description: "RESTful API gateway",
    terraform_resource: "aws_api_gateway_rest_api",
    icon: NETWORKING_ICONS['aws_api_gateway_rest_api'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "API name" }
      ],
      optional: [
        { name: "description", type: "string", description: "API description" },
        { name: "api_key_source", type: "string", description: "API key source", options: ["HEADER", "AUTHORIZER"] },
        { name: "binary_media_types", type: "list(string)", description: "Binary media types" },
        { name: "body", type: "string", description: "OpenAPI specification" },
        { name: "disable_execute_api_endpoint", type: "bool", description: "Disable execute-api endpoint" },
        { name: "fail_on_warnings", type: "bool", description: "Fail on warnings" },
        { name: "minimum_compression_size", type: "number", description: "Minimum compression size" },
        { name: "parameters", type: "map(string)", description: "API parameters" },
        { name: "policy", type: "string", description: "Resource policy" },
        { name: "put_rest_api_mode", type: "string", description: "Put mode", options: ["merge", "overwrite"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "endpoint_configuration",
          attributes: [
            { name: "types", type: "list(string)", required: true, options: ["EDGE", "REGIONAL", "PRIVATE"] },
            { name: "vpc_endpoint_ids", type: "list(string)" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "API ID" },
      { name: "arn", type: "string", description: "API ARN" },
      { name: "root_resource_id", type: "string", description: "Root resource ID" },
      { name: "created_date", type: "string", description: "Creation date" },
      { name: "execution_arn", type: "string", description: "Execution ARN" }
    ]
  },
  {
    id: "apigatewayv2_api",
    name: "API Gateway V2 API",
    description: "HTTP/WebSocket API",
    terraform_resource: "aws_apigatewayv2_api",
    icon: NETWORKING_ICONS['aws_apigatewayv2_api'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "API name" },
        { name: "protocol_type", type: "string", description: "Protocol type", options: ["HTTP", "WEBSOCKET"] }
      ],
      optional: [
        { name: "api_key_selection_expression", type: "string", description: "API key selection expression" },
        { name: "body", type: "string", description: "OpenAPI specification" },
        { name: "credentials_arn", type: "string", description: "Credentials ARN" },
        { name: "description", type: "string", description: "API description" },
        { name: "disable_execute_api_endpoint", type: "bool", description: "Disable execute-api endpoint" },
        { name: "fail_on_warnings", type: "bool", description: "Fail on warnings" },
        { name: "route_key", type: "string", description: "Route key for quick create" },
        { name: "route_selection_expression", type: "string", description: "Route selection expression" },
        { name: "target", type: "string", description: "Target for quick create" },
        { name: "version", type: "string", description: "API version" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "cors_configuration",
          attributes: [
            { name: "allow_credentials", type: "bool" },
            { name: "allow_headers", type: "list(string)" },
            { name: "allow_methods", type: "list(string)" },
            { name: "allow_origins", type: "list(string)" },
            { name: "expose_headers", type: "list(string)" },
            { name: "max_age", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "API ID" },
      { name: "arn", type: "string", description: "API ARN" },
      { name: "api_endpoint", type: "string", description: "API endpoint" },
      { name: "execution_arn", type: "string", description: "Execution ARN" }
    ]
  }
];

// List of all networking terraform resource types
export const NETWORKING_TERRAFORM_RESOURCES = NETWORKING_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getNetworkingServiceByTerraformResource(terraformResource: string): NetworkingServiceDefinition | undefined {
  return NETWORKING_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getNetworkingServiceById(id: string): NetworkingServiceDefinition | undefined {
  return NETWORKING_SERVICES.find(s => s.id === id);
}

export function isNetworkingResource(terraformResource: string): boolean {
  return NETWORKING_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getNetworkingIcon(terraformResource: string): string {
  return NETWORKING_ICONS[terraformResource] || NETWORKING_ICONS['aws_vpc'];
}





