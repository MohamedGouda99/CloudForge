/**
 * AWS Networking Services - Complete Catalog with Relationship Rules
 *
 * This catalog contains all 27 AWS networking services with comprehensive relationship rules:
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

import { ServiceDefinition } from "../types";

/**
 * Helper to create Terraform metadata
 */
function createTerraformMeta(
  resourceType: string,
  requiredArgs: string[],
  referenceableAttrs: Record<string, string>
) {
  return {
    resourceType,
    requiredArgs,
    referenceableAttrs,
  };
}

/**
 * 1. VPC
 */
export const vpc: ServiceDefinition = {
  id: "networking_vpc",
  name: "VPC",
  description: "Virtual Private Cloud",
  terraform_resource: "aws_vpc",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "cidr_block", type: "string", description: "IPv4 CIDR block", example: "10.0.0.0/16" }
    ],
    optional: [
      { name: "instance_tenancy", type: "string", description: "Instance tenancy", options: ["default", "dedicated"], default: "default" },
      { name: "enable_dns_support", type: "bool", description: "Enable DNS support", default: true },
      { name: "enable_dns_hostnames", type: "bool", description: "Enable DNS hostnames", default: false },
      { name: "enable_network_address_usage_metrics", type: "bool", description: "Enable network address usage metrics" },
      { name: "assign_generated_ipv6_cidr_block", type: "bool", description: "Request IPv6 CIDR block" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "VPC ID" },
    { name: "arn", type: "string", description: "VPC ARN" },
    { name: "cidr_block", type: "string", description: "CIDR block" },
    { name: "main_route_table_id", type: "string", description: "Main route table ID" },
    { name: "default_security_group_id", type: "string", description: "Default SG ID" },
    { name: "default_network_acl_id", type: "string", description: "Default NACL ID" },
    { name: "owner_id", type: "string", description: "Owner account ID" }
  ],
  terraform: createTerraformMeta("aws_vpc", ["cidr_block"], {
    id: "id",
    arn: "arn",
    cidr_block: "cidr_block",
    main_route_table_id: "main_route_table_id",
    default_security_group_id: "default_security_group_id"
  })
};

/**
 * 2. Subnet
 */
export const subnet: ServiceDefinition = {
  id: "networking_subnet",
  name: "Subnet",
  description: "VPC Subnet",
  terraform_resource: "aws_subnet",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
    ],
    optional: [
      { name: "cidr_block", type: "string", description: "IPv4 CIDR block" },
      { name: "availability_zone", type: "string", description: "Availability zone" },
      { name: "map_public_ip_on_launch", type: "bool", description: "Map public IP on launch" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Subnet ID" },
    { name: "arn", type: "string", description: "Subnet ARN" },
    { name: "cidr_block", type: "string", description: "CIDR block" },
    { name: "availability_zone", type: "string", description: "Availability zone" },
    { name: "vpc_id", type: "string", description: "VPC ID" }
  ],
  terraform: createTerraformMeta("aws_subnet", ["vpc_id"], {
    id: "id",
    arn: "arn",
    vpc_id: "vpc_id"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "associate",
        direction: "inbound",
        toResourceType: "aws_route_table",
        apply: [
          {
            createAssociationResource: {
              type: "aws_route_table_association",
              nameTemplate: "${target.name}_to_${this.name}",
              args: {
                route_table_id: "${target.id}",
                subnet_id: "${this.id}"
              }
            }
          }
        ]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Subnet requires a VPC",
          fixHint: "Place subnet inside a VPC or draw an edge to a VPC"
        }
      }
    ]
  }
};

/**
 * 3. Internet Gateway
 */
export const internetGateway: ServiceDefinition = {
  id: "networking_internet_gateway",
  name: "Internet Gateway",
  description: "Gateway for internet access",
  terraform_resource: "aws_internet_gateway",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-VPC-Internet-Gateway_64.svg",
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
  ],
  terraform: createTerraformMeta("aws_internet_gateway", [], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "warn",
          message: "Internet Gateway typically requires a VPC",
          fixHint: "Attach to a VPC or place inside a VPC"
        }
      }
    ]
  }
};

/**
 * 4. NAT Gateway
 */
export const natGateway: ServiceDefinition = {
  id: "networking_nat_gateway",
  name: "NAT Gateway",
  description: "Network Address Translation gateway",
  terraform_resource: "aws_nat_gateway",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" }
    ],
    optional: [
      { name: "allocation_id", type: "string", description: "EIP allocation ID", reference: "aws_eip.allocation_id" },
      { name: "connectivity_type", type: "string", description: "Connectivity type", options: ["private", "public"], default: "public" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "NAT Gateway ID" },
    { name: "allocation_id", type: "string", description: "EIP allocation ID" },
    { name: "network_interface_id", type: "string", description: "Network interface ID" },
    { name: "public_ip", type: "string", description: "Public IP address" },
    { name: "subnet_id", type: "string", description: "Subnet ID" }
  ],
  terraform: createTerraformMeta("aws_nat_gateway", ["subnet_id"], {
    id: "id",
    public_ip: "public_ip"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_subnet",
        apply: [{ setArg: "subnet_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_subnet",
        apply: { setArg: "subnet_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_eip",
        apply: { setArg: "allocation_id", toTargetAttr: "allocation_id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "subnet_id",
        acceptsResourceTypes: ["aws_subnet"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "NAT Gateway requires a subnet",
          fixHint: "Attach to a subnet or place inside a subnet"
        }
      }
    ]
  }
};

/**
 * 5. Route Table
 */
export const routeTable: ServiceDefinition = {
  id: "networking_route_table",
  name: "Route Table",
  description: "VPC route table",
  terraform_resource: "aws_route_table",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
    ],
    optional: [
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Route table ID" },
    { name: "arn", type: "string", description: "Route table ARN" },
    { name: "vpc_id", type: "string", description: "VPC ID" }
  ],
  terraform: createTerraformMeta("aws_route_table", ["vpc_id"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_subnet",
        apply: [
          {
            createAssociationResource: {
              type: "aws_route_table_association",
              nameTemplate: "${this.name}_to_${target.name}",
              args: {
                route_table_id: "${this.id}",
                subnet_id: "${target.id}"
              }
            }
          }
        ]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Route Table requires a VPC",
          fixHint: "Attach to a VPC or place inside a VPC"
        }
      }
    ]
  }
};

/**
 * 6. Route
 */
export const route: ServiceDefinition = {
  id: "networking_route",
  name: "Route",
  description: "Route in route table",
  terraform_resource: "aws_route",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "route_table_id", type: "string", description: "Route table ID", reference: "aws_route_table.id" }
    ],
    optional: [
      { name: "destination_cidr_block", type: "string", description: "Destination IPv4 CIDR" },
      { name: "gateway_id", type: "string", description: "Internet gateway ID", reference: "aws_internet_gateway.id" },
      { name: "nat_gateway_id", type: "string", description: "NAT gateway ID", reference: "aws_nat_gateway.id" },
      { name: "transit_gateway_id", type: "string", description: "Transit gateway ID" },
      { name: "vpc_peering_connection_id", type: "string", description: "VPC peering connection ID" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Route ID" },
    { name: "state", type: "string", description: "Route state" }
  ],
  terraform: createTerraformMeta("aws_route", ["route_table_id"], {
    id: "id"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_route_table",
        apply: [{ setArg: "route_table_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_route_table",
        apply: { setArg: "route_table_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "route",
        direction: "outbound",
        toResourceType: "aws_internet_gateway",
        apply: { setArg: "gateway_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "route",
        direction: "outbound",
        toResourceType: "aws_nat_gateway",
        apply: { setArg: "nat_gateway_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "route_table_id",
        acceptsResourceTypes: ["aws_route_table"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Route requires a route table",
          fixHint: "Attach to a route table or place inside a route table"
        }
      }
    ]
  }
};

/**
 * 7. Route Table Association
 */
export const routeTableAssociation: ServiceDefinition = {
  id: "networking_route_table_association",
  name: "Route Table Association",
  description: "Associate route table with subnet",
  terraform_resource: "aws_route_table_association",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
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
  ],
  terraform: createTerraformMeta("aws_route_table_association", ["route_table_id"], {
    id: "id"
  }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "associate",
        direction: "inbound",
        toResourceType: "aws_route_table",
        apply: [
          {
            createAssociationResource: {
              type: "aws_route_table_association",
              nameTemplate: "${target.name}_to_${this.name}",
              args: {
                route_table_id: "${target.id}",
                subnet_id: "${this.id}"
              }
            }
          }
        ]
      }
    ]
  }
};

/**
 * 8. Security Group
 */
export const securityGroup: ServiceDefinition = {
  id: "networking_security_group",
  name: "Security Group",
  description: "Virtual firewall for instances",
  terraform_resource: "aws_security_group",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Security group name" },
      { name: "description", type: "string", description: "Description" },
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
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
          { name: "cidr_blocks", type: "list(string)" }
        ]
      },
      {
        name: "egress",
        multiple: true,
        attributes: [
          { name: "from_port", type: "number", required: true },
          { name: "to_port", type: "number", required: true },
          { name: "protocol", type: "string", required: true },
          { name: "cidr_blocks", type: "list(string)" }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Security group ID" },
    { name: "arn", type: "string", description: "Security group ARN" },
    { name: "name", type: "string", description: "Security group name" },
    { name: "vpc_id", type: "string", description: "VPC ID" }
  ],
  terraform: createTerraformMeta("aws_security_group", [], {
    id: "id",
    arn: "arn",
    name: "name"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "warn",
          message: "Security Group typically requires a VPC",
          fixHint: "Attach to a VPC or place inside a VPC"
        }
      }
    ]
  }
};

/**
 * 9. Security Group Rule
 */
export const securityGroupRule: ServiceDefinition = {
  id: "networking_security_group_rule",
  name: "Security Group Rule",
  description: "Individual security group rule",
  terraform_resource: "aws_security_group_rule",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "security_group_id", type: "string", description: "Security group ID", reference: "aws_security_group.id" },
      { name: "type", type: "string", description: "Rule type", options: ["ingress", "egress"] },
      { name: "from_port", type: "number", description: "From port" },
      { name: "to_port", type: "number", description: "To port" },
      { name: "protocol", type: "string", description: "Protocol" }
    ],
    optional: [
      { name: "cidr_blocks", type: "list(string)", description: "IPv4 CIDR blocks" },
      { name: "source_security_group_id", type: "string", description: "Source security group ID" },
      { name: "description", type: "string", description: "Rule description" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Rule ID" },
    { name: "security_group_rule_id", type: "string", description: "Security group rule ID" }
  ],
  terraform: createTerraformMeta("aws_security_group_rule", ["security_group_id", "type", "from_port", "to_port", "protocol"], {
    id: "id"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_security_group",
        apply: [{ setArg: "security_group_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_security_group",
        apply: { setArg: "security_group_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "allow",
        direction: "outbound",
        toResourceType: "aws_security_group",
        apply: { setArg: "source_security_group_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "security_group_id",
        acceptsResourceTypes: ["aws_security_group"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Security Group Rule requires a security group",
          fixHint: "Attach to a security group or place inside one"
        }
      }
    ]
  }
};

/**
 * 10. Network ACL
 */
export const networkACL: ServiceDefinition = {
  id: "networking_network_acl",
  name: "Network ACL",
  description: "Network Access Control List",
  terraform_resource: "aws_network_acl",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
    ],
    optional: [
      { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "NACL ID" },
    { name: "arn", type: "string", description: "NACL ARN" },
    { name: "vpc_id", type: "string", description: "VPC ID" }
  ],
  terraform: createTerraformMeta("aws_network_acl", ["vpc_id"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Network ACL requires a VPC",
          fixHint: "Attach to a VPC or place inside a VPC"
        }
      }
    ]
  }
};

/**
 * 11. VPC Peering Connection
 */
export const vpcPeeringConnection: ServiceDefinition = {
  id: "networking_vpc_peering",
  name: "VPC Peering Connection",
  description: "Peering between two VPCs",
  terraform_resource: "aws_vpc_peering_connection",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "vpc_id", type: "string", description: "Requester VPC ID", reference: "aws_vpc.id" },
      { name: "peer_vpc_id", type: "string", description: "Peer VPC ID" }
    ],
    optional: [
      { name: "auto_accept", type: "bool", description: "Auto accept peering" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Peering connection ID" },
    { name: "accept_status", type: "string", description: "Accept status" }
  ],
  terraform: createTerraformMeta("aws_vpc_peering_connection", ["vpc_id", "peer_vpc_id"], {
    id: "id"
  }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "peer",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: [
          { setArg: "vpc_id", toTargetAttr: "id" },
          { setArg: "peer_vpc_id", toTargetAttr: "id" }
        ]
      }
    ]
  }
};

/**
 * 12. Transit Gateway
 */
export const transitGateway: ServiceDefinition = {
  id: "networking_transit_gateway",
  name: "Transit Gateway",
  description: "Hub for VPC and on-premises networks",
  terraform_resource: "aws_ec2_transit_gateway",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Transit-Gateway_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "description", type: "string", description: "Description" },
      { name: "amazon_side_asn", type: "number", description: "Private ASN" },
      { name: "auto_accept_shared_attachments", type: "string", description: "Auto accept shared attachments", options: ["disable", "enable"] },
      { name: "dns_support", type: "string", description: "DNS support", options: ["disable", "enable"] },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Transit Gateway ID" },
    { name: "arn", type: "string", description: "Transit Gateway ARN" },
    { name: "owner_id", type: "string", description: "Owner account ID" }
  ],
  terraform: createTerraformMeta("aws_ec2_transit_gateway", [], {
    id: "id",
    arn: "arn"
  })
};

/**
 * 13. Transit Gateway VPC Attachment
 */
export const transitGatewayVPCAttachment: ServiceDefinition = {
  id: "networking_tgw_vpc_attachment",
  name: "Transit Gateway VPC Attachment",
  description: "Attach VPC to Transit Gateway",
  terraform_resource: "aws_ec2_transit_gateway_vpc_attachment",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Transit-Gateway_64.svg",
  inputs: {
    required: [
      { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" },
      { name: "transit_gateway_id", type: "string", description: "Transit Gateway ID", reference: "aws_ec2_transit_gateway.id" },
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" }
    ],
    optional: [
      { name: "dns_support", type: "string", description: "DNS support", options: ["disable", "enable"] },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Attachment ID" },
    { name: "vpc_owner_id", type: "string", description: "VPC owner account ID" }
  ],
  terraform: createTerraformMeta("aws_ec2_transit_gateway_vpc_attachment", ["subnet_ids", "transit_gateway_id", "vpc_id"], {
    id: "id"
  }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: [
          { setArg: "vpc_id", toTargetAttr: "id" }
        ]
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_ec2_transit_gateway",
        apply: [
          { setArg: "transit_gateway_id", toTargetAttr: "id" }
        ]
      }
    ]
  }
};

/**
 * 14. VPN Gateway
 */
export const vpnGateway: ServiceDefinition = {
  id: "networking_vpn_gateway",
  name: "VPN Gateway",
  description: "Virtual Private Network gateway",
  terraform_resource: "aws_vpn_gateway",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
      { name: "availability_zone", type: "string", description: "Availability zone" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "VPN Gateway ID" },
    { name: "arn", type: "string", description: "VPN Gateway ARN" }
  ],
  terraform: createTerraformMeta("aws_vpn_gateway", [], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ]
  }
};

/**
 * 15. Customer Gateway
 */
export const customerGateway: ServiceDefinition = {
  id: "networking_customer_gateway",
  name: "Customer Gateway",
  description: "Customer-side VPN gateway",
  terraform_resource: "aws_customer_gateway",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg",
  inputs: {
    required: [
      { name: "bgp_asn", type: "string", description: "BGP ASN" },
      { name: "type", type: "string", description: "Gateway type", options: ["ipsec.1"] }
    ],
    optional: [
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Customer Gateway ID" },
    { name: "arn", type: "string", description: "Customer Gateway ARN" }
  ],
  terraform: createTerraformMeta("aws_customer_gateway", ["bgp_asn", "type"], {
    id: "id",
    arn: "arn"
  })
};

/**
 * 16. VPN Connection
 */
export const vpnConnection: ServiceDefinition = {
  id: "networking_vpn_connection",
  name: "VPN Connection",
  description: "Site-to-site VPN connection",
  terraform_resource: "aws_vpn_connection",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-Site-to-Site-VPN_64.svg",
  inputs: {
    required: [
      { name: "customer_gateway_id", type: "string", description: "Customer Gateway ID", reference: "aws_customer_gateway.id" },
      { name: "type", type: "string", description: "Connection type", options: ["ipsec.1"] }
    ],
    optional: [
      { name: "vpn_gateway_id", type: "string", description: "VPN Gateway ID", reference: "aws_vpn_gateway.id" },
      { name: "transit_gateway_id", type: "string", description: "Transit Gateway ID" },
      { name: "static_routes_only", type: "bool", description: "Use static routes only" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "VPN Connection ID" },
    { name: "arn", type: "string", description: "VPN Connection ARN" },
    { name: "tunnel1_address", type: "string", description: "Tunnel 1 outside IP" }
  ],
  terraform: createTerraformMeta("aws_vpn_connection", ["customer_gateway_id", "type"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "bidirectional",
        toResourceType: "aws_customer_gateway",
        apply: { setArg: "customer_gateway_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "connect",
        direction: "bidirectional",
        toResourceType: "aws_vpn_gateway",
        apply: { setArg: "vpn_gateway_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "customer_gateway_id",
        acceptsResourceTypes: ["aws_customer_gateway"],
        targetAttribute: "id",
        search: [
          { type: "connected_edges", edgeKind: "connect" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "VPN Connection requires a customer gateway",
          fixHint: "Connect to a customer gateway"
        }
      }
    ]
  }
};

/**
 * 17. VPC Endpoint
 */
export const vpcEndpoint: ServiceDefinition = {
  id: "networking_vpc_endpoint",
  name: "VPC Endpoint",
  description: "Private connection to AWS services",
  terraform_resource: "aws_vpc_endpoint",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_AWS-PrivateLink_64.svg",
  inputs: {
    required: [
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
      { name: "service_name", type: "string", description: "AWS service name" }
    ],
    optional: [
      { name: "vpc_endpoint_type", type: "string", description: "Endpoint type", options: ["Gateway", "Interface"] },
      { name: "auto_accept", type: "bool", description: "Auto accept endpoint connection" },
      { name: "subnet_ids", type: "list(string)", description: "Subnet IDs for Interface endpoints" },
      { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Endpoint ID" },
    { name: "arn", type: "string", description: "Endpoint ARN" },
    { name: "state", type: "string", description: "Endpoint state" }
  ],
  terraform: createTerraformMeta("aws_vpc_endpoint", ["vpc_id", "service_name"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "vpc_id",
        acceptsResourceTypes: ["aws_vpc"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "VPC Endpoint requires a VPC",
          fixHint: "Attach to a VPC or place inside a VPC"
        }
      }
    ]
  }
};

/**
 * 18. Network Interface
 */
export const networkInterface: ServiceDefinition = {
  id: "networking_network_interface",
  name: "Network Interface",
  description: "Elastic Network Interface",
  terraform_resource: "aws_network_interface",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg",
  inputs: {
    required: [
      { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" }
    ],
    optional: [
      { name: "description", type: "string", description: "Description" },
      { name: "private_ip", type: "string", description: "Primary private IP" },
      { name: "security_groups", type: "list(string)", description: "Security group IDs" },
      { name: "source_dest_check", type: "bool", description: "Enable source/dest check" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "ENI ID" },
    { name: "arn", type: "string", description: "ENI ARN" },
    { name: "mac_address", type: "string", description: "MAC address" }
  ],
  terraform: createTerraformMeta("aws_network_interface", ["subnet_id"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_subnet",
        apply: [{ setArg: "subnet_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_subnet",
        apply: { setArg: "subnet_id", toTargetAttr: "id" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "subnet_id",
        acceptsResourceTypes: ["aws_subnet"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Network Interface requires a subnet",
          fixHint: "Attach to a subnet or place inside a subnet"
        }
      }
    ]
  }
};

/**
 * 19. Load Balancer
 */
export const loadBalancer: ServiceDefinition = {
  id: "networking_lb",
  name: "Load Balancer",
  description: "Application/Network Load Balancer",
  terraform_resource: "aws_lb",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Load balancer name" },
      { name: "internal", type: "bool", description: "Is internal", default: false },
      { name: "load_balancer_type", type: "string", description: "Load balancer type", options: ["application", "network", "gateway"], default: "application" },
      { name: "security_groups", type: "list(string)", description: "Security group IDs" },
      { name: "subnets", type: "list(string)", description: "Subnet IDs" },
      { name: "enable_deletion_protection", type: "bool", description: "Enable deletion protection" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Load balancer ID" },
    { name: "arn", type: "string", description: "Load balancer ARN" },
    { name: "dns_name", type: "string", description: "DNS name" },
    { name: "zone_id", type: "string", description: "Route 53 zone ID" },
    { name: "vpc_id", type: "string", description: "VPC ID" }
  ],
  terraform: createTerraformMeta("aws_lb", [], {
    id: "id",
    arn: "arn",
    dns_name: "dns_name"
  })
};

/**
 * 20. Target Group
 */
export const targetGroup: ServiceDefinition = {
  id: "networking_lb_target_group",
  name: "Target Group",
  description: "Load balancer target group",
  terraform_resource: "aws_lb_target_group",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Target group name" },
      { name: "port", type: "number", description: "Port" },
      { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "TCP", "TLS", "UDP"] },
      { name: "vpc_id", type: "string", description: "VPC ID" },
      { name: "target_type", type: "string", description: "Target type", options: ["instance", "ip", "lambda", "alb"] },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Target group ID" },
    { name: "arn", type: "string", description: "Target group ARN" },
    { name: "name", type: "string", description: "Target group name" }
  ],
  terraform: createTerraformMeta("aws_lb_target_group", [], {
    id: "id",
    arn: "arn",
    name: "name"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_vpc",
        apply: [{ setArg: "vpc_id", toParentAttr: "id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_vpc",
        apply: { setArg: "vpc_id", toTargetAttr: "id" }
      }
    ]
  }
};

/**
 * 21. LB Listener
 */
export const lbListener: ServiceDefinition = {
  id: "networking_lb_listener",
  name: "LB Listener",
  description: "Load balancer listener",
  terraform_resource: "aws_lb_listener",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [
      { name: "load_balancer_arn", type: "string", description: "Load balancer ARN", reference: "aws_lb.arn" }
    ],
    optional: [
      { name: "port", type: "number", description: "Port" },
      { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "TCP", "TLS", "UDP"] },
      { name: "certificate_arn", type: "string", description: "SSL certificate ARN" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Listener ID" },
    { name: "arn", type: "string", description: "Listener ARN" }
  ],
  terraform: createTerraformMeta("aws_lb_listener", ["load_balancer_arn"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_lb",
        apply: [{ setArg: "load_balancer_arn", toParentAttr: "arn" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_lb",
        apply: { setArg: "load_balancer_arn", toTargetAttr: "arn" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "load_balancer_arn",
        acceptsResourceTypes: ["aws_lb"],
        targetAttribute: "arn",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "LB Listener requires a load balancer",
          fixHint: "Attach to a load balancer or place inside one"
        }
      }
    ]
  }
};

/**
 * 22. LB Listener Rule
 */
export const lbListenerRule: ServiceDefinition = {
  id: "networking_lb_listener_rule",
  name: "LB Listener Rule",
  description: "Load balancer listener rule",
  terraform_resource: "aws_lb_listener_rule",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [
      { name: "listener_arn", type: "string", description: "Listener ARN", reference: "aws_lb_listener.arn" }
    ],
    optional: [
      { name: "priority", type: "number", description: "Rule priority" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Rule ID" },
    { name: "arn", type: "string", description: "Rule ARN" }
  ],
  terraform: createTerraformMeta("aws_lb_listener_rule", ["listener_arn"], {
    id: "id",
    arn: "arn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_lb_listener",
        apply: [{ setArg: "listener_arn", toParentAttr: "arn" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_lb_listener",
        apply: { setArg: "listener_arn", toTargetAttr: "arn" }
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "listener_arn",
        acceptsResourceTypes: ["aws_lb_listener"],
        targetAttribute: "arn",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "LB Listener Rule requires a listener",
          fixHint: "Attach to a listener or place inside one"
        }
      }
    ]
  }
};

/**
 * 23. Route 53 Zone
 */
export const route53Zone: ServiceDefinition = {
  id: "networking_route53_zone",
  name: "Route 53 Zone",
  description: "DNS hosted zone",
  terraform_resource: "aws_route53_zone",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Domain name" }
    ],
    optional: [
      { name: "comment", type: "string", description: "Zone comment" },
      { name: "force_destroy", type: "bool", description: "Force destroy" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "zone_id", type: "string", description: "Zone ID" },
    { name: "arn", type: "string", description: "Zone ARN" },
    { name: "name", type: "string", description: "Domain name" },
    { name: "name_servers", type: "list(string)", description: "Name servers" }
  ],
  terraform: createTerraformMeta("aws_route53_zone", ["name"], {
    zone_id: "zone_id",
    arn: "arn",
    name: "name"
  })
};

/**
 * 24. Route 53 Record
 */
export const route53Record: ServiceDefinition = {
  id: "networking_route53_record",
  name: "Route 53 Record",
  description: "DNS record",
  terraform_resource: "aws_route53_record",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg",
  inputs: {
    required: [
      { name: "zone_id", type: "string", description: "Hosted zone ID", reference: "aws_route53_zone.zone_id" },
      { name: "name", type: "string", description: "Record name" },
      { name: "type", type: "string", description: "Record type", options: ["A", "AAAA", "CNAME", "MX", "TXT"] }
    ],
    optional: [
      { name: "ttl", type: "number", description: "TTL in seconds" },
      { name: "records", type: "list(string)", description: "Record values" },
      { name: "set_identifier", type: "string", description: "Set identifier for routing" }
    ]
  },
  outputs: [
    { name: "name", type: "string", description: "Record name" },
    { name: "fqdn", type: "string", description: "FQDN" }
  ],
  terraform: createTerraformMeta("aws_route53_record", ["zone_id", "name", "type"], {
    name: "name",
    fqdn: "fqdn"
  }),
  relations: {
    containmentRules: [
      {
        whenParentResourceType: "aws_route53_zone",
        apply: [{ setArg: "zone_id", toParentAttr: "zone_id" }]
      }
    ],
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_route53_zone",
        apply: { setArg: "zone_id", toTargetAttr: "zone_id" }
      },
      {
        whenEdgeKind: "route",
        direction: "outbound",
        toResourceType: "aws_lb",
        apply: [
          { setArg: "alias.name", toTargetAttr: "dns_name" },
          { setArg: "alias.zone_id", toTargetAttr: "zone_id" },
          { setArg: "alias.evaluate_target_health", toLiteral: true }
        ]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "zone_id",
        acceptsResourceTypes: ["aws_route53_zone"],
        targetAttribute: "zone_id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Route 53 Record requires a hosted zone",
          fixHint: "Attach to a Route 53 zone or place inside one"
        }
      }
    ]
  }
};

/**
 * 25. CloudFront Distribution
 */
export const cloudfrontDistribution: ServiceDefinition = {
  id: "networking_cloudfront",
  name: "CloudFront Distribution",
  description: "Content delivery network",
  terraform_resource: "aws_cloudfront_distribution",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg",
  inputs: {
    required: [
      { name: "enabled", type: "bool", description: "Enable distribution" }
    ],
    optional: [
      { name: "aliases", type: "list(string)", description: "Alternate domain names" },
      { name: "comment", type: "string", description: "Distribution comment" },
      { name: "default_root_object", type: "string", description: "Default root object" },
      { name: "is_ipv6_enabled", type: "bool", description: "Enable IPv6" },
      { name: "price_class", type: "string", description: "Price class", options: ["PriceClass_All", "PriceClass_200", "PriceClass_100"] },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Distribution ID" },
    { name: "arn", type: "string", description: "Distribution ARN" },
    { name: "domain_name", type: "string", description: "Domain name" },
    { name: "hosted_zone_id", type: "string", description: "Route 53 zone ID" },
    { name: "status", type: "string", description: "Distribution status" }
  ],
  terraform: createTerraformMeta("aws_cloudfront_distribution", ["enabled"], {
    id: "id",
    arn: "arn",
    domain_name: "domain_name"
  })
};

/**
 * 26. API Gateway REST API
 */
export const apiGatewayRestAPI: ServiceDefinition = {
  id: "networking_apigw_rest",
  name: "API Gateway REST API",
  description: "RESTful API gateway",
  terraform_resource: "aws_api_gateway_rest_api",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "API name" }
    ],
    optional: [
      { name: "description", type: "string", description: "API description" },
      { name: "api_key_source", type: "string", description: "API key source", options: ["HEADER", "AUTHORIZER"] },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "API ID" },
    { name: "arn", type: "string", description: "API ARN" },
    { name: "root_resource_id", type: "string", description: "Root resource ID" },
    { name: "execution_arn", type: "string", description: "Execution ARN" }
  ],
  terraform: createTerraformMeta("aws_api_gateway_rest_api", ["name"], {
    id: "id",
    arn: "arn",
    execution_arn: "execution_arn"
  })
};

/**
 * 27. API Gateway V2 API
 */
export const apiGatewayV2API: ServiceDefinition = {
  id: "networking_apigw_v2",
  name: "API Gateway V2 API",
  description: "HTTP/WebSocket API",
  terraform_resource: "aws_apigatewayv2_api",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "API name" },
      { name: "protocol_type", type: "string", description: "Protocol type", options: ["HTTP", "WEBSOCKET"] }
    ],
    optional: [
      { name: "description", type: "string", description: "API description" },
      { name: "version", type: "string", description: "API version" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "API ID" },
    { name: "arn", type: "string", description: "API ARN" },
    { name: "api_endpoint", type: "string", description: "API endpoint" },
    { name: "execution_arn", type: "string", description: "Execution ARN" }
  ],
  terraform: createTerraformMeta("aws_apigatewayv2_api", ["name", "protocol_type"], {
    id: "id",
    arn: "arn",
    api_endpoint: "api_endpoint"
  })
};

/**
 * Export all services as an array
 */
export const AWS_NETWORKING_SERVICES: ServiceDefinition[] = [
  vpc,
  subnet,
  internetGateway,
  natGateway,
  routeTable,
  route,
  routeTableAssociation,
  securityGroup,
  securityGroupRule,
  networkACL,
  vpcPeeringConnection,
  transitGateway,
  transitGatewayVPCAttachment,
  vpnGateway,
  customerGateway,
  vpnConnection,
  vpcEndpoint,
  networkInterface,
  loadBalancer,
  targetGroup,
  lbListener,
  lbListenerRule,
  route53Zone,
  route53Record,
  cloudfrontDistribution,
  apiGatewayRestAPI,
  apiGatewayV2API
];
