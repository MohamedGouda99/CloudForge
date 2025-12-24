/**
 * AWS Compute Services with Relationship Rules
 *
 * This file demonstrates how to extend the existing frontend catalog with relationship rules.
 * It adds the "terraform" and "relations" fields to the existing service definitions.
 *
 * MINIMAL EXTENSION APPROACH:
 * - Existing fields from frontend catalog remain unchanged
 * - Only adding: terraform? and relations? optional fields
 * - Backward compatible - can be imported alongside existing catalog
 */

import type { ServiceDefinition } from "../types";

/**
 * EC2 Instance with comprehensive relationship rules
 */
export const ec2InstanceService: ServiceDefinition = {
  // ========== EXISTING FIELDS (from frontend catalog) ==========
  id: "ec2_instance",
  name: "EC2 Instance",
  description: "Virtual server in the cloud",
  terraform_resource: "aws_instance",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
  inputs: {
    required: [
      { name: "ami", type: "string", description: "AMI ID to use for the instance", example: "ami-0c55b159cbfafe1f0" },
      { name: "instance_type", type: "string", description: "Instance type", example: "t3.micro", options: ["t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large"] }
    ],
    optional: [
      { name: "availability_zone", type: "string", description: "AZ to start the instance in" },
      { name: "subnet_id", type: "string", description: "VPC Subnet ID to launch in", reference: "aws_subnet.id" },
      { name: "vpc_security_group_ids", type: "list(string)", description: "List of security group IDs", reference: "aws_security_group.id" },
      { name: "key_name", type: "string", description: "Key pair name for SSH access", reference: "aws_key_pair.key_name" },
      { name: "iam_instance_profile", type: "string", description: "IAM Instance Profile", reference: "aws_iam_instance_profile.name" },
      { name: "user_data", type: "string", description: "User data script for instance initialization" },
      { name: "associate_public_ip_address", type: "bool", description: "Associate a public IP address", default: false },
      { name: "private_ip", type: "string", description: "Private IP address" },
      { name: "monitoring", type: "bool", description: "Enable detailed monitoring", default: false },
      { name: "tags", type: "map(string)", description: "Tags for the instance" }
    ],
    blocks: [
      {
        name: "root_block_device",
        description: "Root EBS volume configuration",
        attributes: [
          { name: "volume_type", type: "string", options: ["gp2", "gp3", "io1", "io2"] },
          { name: "volume_size", type: "number", description: "Size in GB" },
          { name: "encrypted", type: "bool" }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Instance ID" },
    { name: "arn", type: "string", description: "Instance ARN" },
    { name: "public_ip", type: "string", description: "Public IP address" },
    { name: "private_ip", type: "string", description: "Private IP address" }
  ],

  // ========== NEW FIELDS (relationship intelligence) ==========
  terraform: {
    resourceType: "aws_instance",
    requiredArgs: ["ami", "instance_type"],
    referenceableAttrs: {
      id: "id",
      arn: "arn",
      public_ip: "public_ip",
      private_ip: "private_ip",
    },
  },

  relations: {
    // Containment: EC2 inside Subnet
    containmentRules: [
      {
        whenParentResourceType: "aws_subnet",
        apply: [
          { setArg: "subnet_id", toParentAttr: "id" },
        ],
      },
    ],

    // Edge: EC2 -> Security Group (connect edge)
    // Edge: EC2 -> IAM Instance Profile (attach edge)
    // Edge: EC2 -> Key Pair (associate edge)
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_security_group",
        apply: [
          { pushToListArg: "vpc_security_group_ids", toTargetAttr: "id" },
        ],
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_iam_instance_profile",
        apply: [
          { setArg: "iam_instance_profile", toTargetAttr: "name" },
        ],
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_key_pair",
        apply: [
          { setArg: "key_name", toTargetAttr: "key_name" },
        ],
      },
    ],

    // Auto-resolve: subnet_id from ancestors if not explicitly set
    autoResolveRules: [
      {
        requiredArg: "subnet_id",
        acceptsResourceTypes: ["aws_subnet"],
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "connect" },
        ],
        onMissing: {
          level: "error",
          message: "EC2 instance requires a subnet. Place it inside a subnet or connect it to one.",
          fixHint: "Drag the EC2 instance inside a subnet, or draw a 'connect' edge to a subnet",
        },
      },
    ],
  },
};

/**
 * IAM Instance Profile with relationship rules
 */
export const iamInstanceProfileService: ServiceDefinition = {
  id: "iam_instance_profile",
  name: "IAM Instance Profile",
  description: "Instance profile for EC2 instances",
  terraform_resource: "aws_iam_instance_profile",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Profile name" },
      { name: "role", type: "string", description: "IAM role name", reference: "aws_iam_role.name" },
    ],
  },
  outputs: [
    { name: "arn", type: "string", description: "Instance profile ARN" },
    { name: "name", type: "string", description: "Instance profile name" },
  ],

  terraform: {
    resourceType: "aws_iam_instance_profile",
    requiredArgs: ["role"],
    referenceableAttrs: {
      arn: "arn",
      name: "name",
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_iam_role",
        apply: [
          { setArg: "role", toTargetAttr: "name" },
        ],
      },
    ],
  },
};

/**
 * IAM Role with policy attachment rules
 */
export const iamRoleService: ServiceDefinition = {
  id: "iam_role",
  name: "IAM Role",
  description: "IAM role for AWS resources",
  terraform_resource: "aws_iam_role",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg",
  inputs: {
    required: [
      { name: "assume_role_policy", type: "string", description: "Assume role policy JSON" },
    ],
    optional: [
      { name: "name", type: "string", description: "Role name" },
      { name: "description", type: "string", description: "Role description" },
    ],
  },
  outputs: [
    { name: "arn", type: "string", description: "Role ARN" },
    { name: "name", type: "string", description: "Role name" },
  ],

  terraform: {
    resourceType: "aws_iam_role",
    requiredArgs: ["assume_role_policy"],
    referenceableAttrs: {
      arn: "arn",
      name: "name",
    },
  },

  relations: {
    edgeRules: [
      // When role attaches to policy, create intermediate attachment resource
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_iam_policy",
        apply: {
          createAssociationResource: {
            type: "aws_iam_role_policy_attachment",
            nameTemplate: "${this.name}_${target.name}_attachment",
            args: {
              role: "${this.name}",
              policy_arn: "${target.arn}",
            },
          },
        },
      },
    ],
  },
};

/**
 * Application Load Balancer with listener creation
 */
export const albService: ServiceDefinition = {
  id: "application_load_balancer",
  name: "Application Load Balancer",
  description: "Layer 7 load balancer",
  terraform_resource: "aws_lb",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Load balancer name" },
      { name: "load_balancer_type", type: "string", description: "Type", options: ["application", "network", "gateway"], default: "application" },
      { name: "subnets", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" },
      { name: "security_groups", type: "list(string)", description: "Security group IDs", reference: "aws_security_group.id" },
    ],
  },
  outputs: [
    { name: "arn", type: "string", description: "LB ARN" },
    { name: "dns_name", type: "string", description: "DNS name" },
  ],

  terraform: {
    resourceType: "aws_lb",
    referenceableAttrs: {
      arn: "arn",
      dns_name: "dns_name",
    },
  },

  relations: {
    edgeRules: [
      // When ALB routes to Target Group, create listener
      {
        whenEdgeKind: "route",
        direction: "outbound",
        toResourceType: "aws_lb_target_group",
        apply: {
          createAssociationResource: {
            type: "aws_lb_listener",
            nameTemplate: "${this.name}_listener_80",
            args: {
              load_balancer_arn: "${this.arn}",
              port: "80",
              protocol: "HTTP",
              default_action: JSON.stringify([
                {
                  type: "forward",
                  target_group_arn: "${target.arn}",
                },
              ]),
            },
          },
        },
      },
    ],
  },
};

/**
 * Target Group for load balancer targets
 */
export const targetGroupService: ServiceDefinition = {
  id: "target_group",
  name: "Target Group",
  description: "Target group for load balancing",
  terraform_resource: "aws_lb_target_group",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [
      { name: "port", type: "number", description: "Target port" },
      { name: "protocol", type: "string", description: "Protocol", options: ["HTTP", "HTTPS", "TCP", "TLS"] },
      { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
    ],
    optional: [
      { name: "name", type: "string", description: "Target group name" },
    ],
  },
  outputs: [
    { name: "arn", type: "string", description: "Target group ARN" },
  ],

  terraform: {
    resourceType: "aws_lb_target_group",
    requiredArgs: ["port", "protocol", "vpc_id"],
    referenceableAttrs: {
      arn: "arn",
    },
  },

  relations: {
    edgeRules: [
      // When Target Group associates with EC2, create target attachment
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: {
          createAssociationResource: {
            type: "aws_lb_target_group_attachment",
            nameTemplate: "${this.name}_${target.name}_attachment",
            args: {
              target_group_arn: "${this.arn}",
              target_id: "${target.id}",
            },
          },
        },
      },
    ],
  },
};

/**
 * Elastic IP with association support
 */
export const eipService: ServiceDefinition = {
  id: "elastic_ip",
  name: "Elastic IP",
  description: "Static public IP address",
  terraform_resource: "aws_eip",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "domain", type: "string", description: "Domain", options: ["vpc", "standard"], default: "vpc" },
    ],
  },
  outputs: [
    { name: "id", type: "string", description: "Allocation ID" },
    { name: "allocation_id", type: "string", description: "Allocation ID" },
    { name: "public_ip", type: "string", description: "Public IP" },
  ],

  terraform: {
    resourceType: "aws_eip",
    referenceableAttrs: {
      id: "id",
      allocation_id: "allocation_id",
      public_ip: "public_ip",
    },
  },

  relations: {
    edgeRules: [
      // When EIP associates with EC2, create association resource
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: {
          createAssociationResource: {
            type: "aws_eip_association",
            nameTemplate: "${this.name}_${target.name}_assoc",
            args: {
              allocation_id: "${this.allocation_id}",
              instance_id: "${target.id}",
            },
          },
        },
      },
    ],
  },
};

/**
 * Export all services as a catalog
 */
export const awsComputeServicesWithRules: ServiceDefinition[] = [
  ec2InstanceService,
  iamInstanceProfileService,
  iamRoleService,
  albService,
  targetGroupService,
  eipService,
];
