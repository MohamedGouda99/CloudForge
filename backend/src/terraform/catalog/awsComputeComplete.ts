/**
 * Complete AWS Compute Services Catalog with Relationship Rules
 *
 * All 19 compute services from computeServicesData.ts with comprehensive relationship intelligence.
 * This is the COMPLETE, production-ready catalog for the compute-only MVP.
 */

import type { ServiceDefinition } from "../types";

// Helper to create terraform metadata
const createTerraformMeta = (resourceType: string, requiredArgs: string[], outputs: Record<string, string>) => ({
  resourceType,
  requiredArgs,
  referenceableAttrs: outputs,
});

/**
 * 1. EC2 Instance
 */
export const ec2Instance: ServiceDefinition = {
  id: "ec2_instance",
  name: "EC2 Instance",
  description: "Virtual server in the cloud",
  terraform_resource: "aws_instance",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
  inputs: {
    required: [
      { name: "ami", type: "string", description: "AMI ID to use for the instance" },
      { name: "instance_type", type: "string", description: "Instance type" }
    ],
    optional: [
      { name: "availability_zone", type: "string", description: "AZ to start the instance in" },
      { name: "subnet_id", type: "string", description: "VPC Subnet ID to launch in", reference: "aws_subnet.id" },
      { name: "vpc_security_group_ids", type: "list(string)", description: "List of security group IDs", reference: "aws_security_group.id" },
      { name: "key_name", type: "string", description: "Key pair name for SSH access", reference: "aws_key_pair.key_name" },
      { name: "iam_instance_profile", type: "string", description: "IAM Instance Profile", reference: "aws_iam_instance_profile.name" },
      { name: "user_data", type: "string", description: "User data script" },
      { name: "associate_public_ip_address", type: "bool", description: "Associate public IP", default: false },
      { name: "monitoring", type: "bool", description: "Enable detailed monitoring", default: false },
      { name: "placement_group", type: "string", description: "Placement group name", reference: "aws_placement_group.name" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Instance ID" },
    { name: "arn", type: "string", description: "Instance ARN" },
    { name: "public_ip", type: "string", description: "Public IP" },
    { name: "private_ip", type: "string", description: "Private IP" }
  ],
  terraform: createTerraformMeta("aws_instance", ["ami", "instance_type"], { id: "id", arn: "arn", public_ip: "public_ip" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_key_pair",
        apply: { setArg: "key_name", toTargetAttr: "key_name" }
      },
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_ami",
        apply: { setArg: "ami", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_placement_group",
        apply: { setArg: "placement_group", toTargetAttr: "name" }
      }
    ]
  }
};

/**
 * 2. Launch Template
 */
export const launchTemplate: ServiceDefinition = {
  id: "ec2_launch_template",
  name: "Launch Template",
  description: "Template for launching EC2 instances",
  terraform_resource: "aws_launch_template",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "name", type: "string", description: "Launch template name" },
      { name: "image_id", type: "string", description: "AMI ID" },
      { name: "instance_type", type: "string", description: "Instance type" },
      { name: "key_name", type: "string", description: "Key pair name" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Launch template ID" },
    { name: "arn", type: "string", description: "Launch template ARN" },
    { name: "latest_version", type: "number", description: "Latest version" }
  ],
  terraform: createTerraformMeta("aws_launch_template", [], { id: "id", arn: "arn" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_ami",
        apply: { setArg: "image_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_key_pair",
        apply: { setArg: "key_name", toTargetAttr: "key_name" }
      }
    ]
  }
};

/**
 * 3. Auto Scaling Group
 */
export const autoScalingGroup: ServiceDefinition = {
  id: "ec2_autoscaling_group",
  name: "Auto Scaling Group",
  description: "Automatically scales EC2 instances",
  terraform_resource: "aws_autoscaling_group",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2-Auto-Scaling_64.svg",
  inputs: {
    required: [
      { name: "max_size", type: "number", description: "Maximum number of instances" },
      { name: "min_size", type: "number", description: "Minimum number of instances" }
    ],
    optional: [
      { name: "name", type: "string", description: "ASG name" },
      { name: "desired_capacity", type: "number", description: "Desired capacity" },
      { name: "health_check_type", type: "string", description: "Health check type" },
      { name: "vpc_zone_identifier", type: "list(string)", description: "Subnet IDs" },
      { name: "tags", type: "list(object)", description: "Tags" }
    ],
    blocks: [
      {
        name: "launch_template",
        attributes: [
          { name: "id", type: "string" },
          { name: "version", type: "string" }
        ]
      }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "ASG ID" },
    { name: "arn", type: "string", description: "ASG ARN" },
    { name: "name", type: "string", description: "ASG name" }
  ],
  terraform: createTerraformMeta("aws_autoscaling_group", ["max_size", "min_size"], { id: "id", arn: "arn", name: "name" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_launch_template",
        apply: [
          { setArg: "launch_template.id", toTargetAttr: "id" },
          { setArg: "launch_template.version", toLiteral: "$Latest" }
        ]
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_launch_template",
        apply: [
          { setArg: "launch_template.id", toTargetAttr: "id" },
          { setArg: "launch_template.version", toLiteral: "$Latest" }
        ]
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_launch_template",
        apply: [
          { setArg: "launch_template.id", toParentAttr: "id" },
          { setArg: "launch_template.version", toLiteral: "$Latest" }
        ]
      }
    ]
  }
};

/**
 * 4. Auto Scaling Policy
 */
export const autoScalingPolicy: ServiceDefinition = {
  id: "ec2_autoscaling_policy",
  name: "Auto Scaling Policy",
  description: "Scaling policy for Auto Scaling Groups",
  terraform_resource: "aws_autoscaling_policy",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2-Auto-Scaling_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Policy name" },
      { name: "autoscaling_group_name", type: "string", description: "ASG name", reference: "aws_autoscaling_group.name" }
    ],
    optional: [
      { name: "adjustment_type", type: "string", description: "Adjustment type" },
      { name: "policy_type", type: "string", description: "Policy type" },
      { name: "scaling_adjustment", type: "number", description: "Scaling adjustment" }
    ]
  },
  outputs: [
    { name: "arn", type: "string", description: "Policy ARN" },
    { name: "name", type: "string", description: "Policy name" }
  ],
  terraform: createTerraformMeta("aws_autoscaling_policy", ["name", "autoscaling_group_name"], { arn: "arn", name: "name" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_autoscaling_group",
        apply: { setArg: "autoscaling_group_name", toTargetAttr: "name" }
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_autoscaling_group",
        apply: { setArg: "autoscaling_group_name", toTargetAttr: "name" }
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_autoscaling_group",
        apply: [{ setArg: "autoscaling_group_name", toParentAttr: "name" }]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "autoscaling_group_name",
        acceptsResourceTypes: ["aws_autoscaling_group"],
        targetAttribute: "name",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Auto Scaling Policy requires an Auto Scaling Group",
          fixHint: "Draw an edge to an ASG or place this policy inside an ASG"
        }
      }
    ]
  }
};

/**
 * 5-6. Spot Instance/Fleet (simplified for compute-only)
 */
export const spotInstanceRequest: ServiceDefinition = {
  id: "ec2_spot_instance_request",
  name: "Spot Instance Request",
  description: "Request for EC2 Spot Instances",
  terraform_resource: "aws_spot_instance_request",
  icon: "/cloud_icons/AWS/Resource-Icons_07312025/Res_Compute/Res_Amazon-EC2_Spot-Instance_48.svg",
  inputs: {
    required: [
      { name: "ami", type: "string", description: "AMI ID" },
      { name: "instance_type", type: "string", description: "Instance type" }
    ],
    optional: [
      { name: "spot_price", type: "string", description: "Maximum spot price" },
      { name: "key_name", type: "string", description: "Key pair name", reference: "aws_key_pair.key_name" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Spot request ID" },
    { name: "spot_instance_id", type: "string", description: "Instance ID" }
  ],
  terraform: createTerraformMeta("aws_spot_instance_request", ["ami", "instance_type"], { id: "id" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_ami",
        apply: { setArg: "ami", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_key_pair",
        apply: { setArg: "key_name", toTargetAttr: "key_name" }
      }
    ]
  }
};

export const spotFleetRequest: ServiceDefinition = {
  id: "ec2_spot_fleet_request",
  name: "Spot Fleet Request",
  description: "Request for EC2 Spot Fleet",
  terraform_resource: "aws_spot_fleet_request",
  icon: "/cloud_icons/AWS/Architecture-Group-Icons_07312025/Spot-Fleet_32.svg",
  inputs: {
    required: [
      { name: "iam_fleet_role", type: "string", description: "IAM fleet role ARN" },
      { name: "target_capacity", type: "number", description: "Target capacity" }
    ],
    optional: []
  },
  outputs: [
    { name: "id", type: "string", description: "Spot fleet request ID" }
  ],
  terraform: createTerraformMeta("aws_spot_fleet_request", ["iam_fleet_role", "target_capacity"], { id: "id" })
};

/**
 * 7-9. AMI Services
 */
export const ami: ServiceDefinition = {
  id: "ec2_ami",
  name: "AMI",
  description: "Amazon Machine Image",
  terraform_resource: "aws_ami",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2-Image-Builder_64.svg",
  inputs: {
    required: [{ name: "name", type: "string", description: "AMI name" }],
    optional: [
      { name: "description", type: "string", description: "AMI description" },
      { name: "architecture", type: "string", description: "Architecture" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "AMI ID" },
    { name: "arn", type: "string", description: "AMI ARN" }
  ],
  terraform: createTerraformMeta("aws_ami", ["name"], { id: "id", arn: "arn" })
};

export const amiCopy: ServiceDefinition = {
  id: "ec2_ami_copy",
  name: "AMI Copy",
  description: "Copy an AMI",
  terraform_resource: "aws_ami_copy",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2-Image-Builder_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "AMI name" },
      { name: "source_ami_id", type: "string", description: "Source AMI ID" },
      { name: "source_ami_region", type: "string", description: "Source region" }
    ],
    optional: []
  },
  outputs: [
    { name: "id", type: "string", description: "AMI ID" }
  ],
  terraform: createTerraformMeta("aws_ami_copy", ["name", "source_ami_id", "source_ami_region"], { id: "id" })
};

export const amiFromInstance: ServiceDefinition = {
  id: "ec2_ami_from_instance",
  name: "AMI from Instance",
  description: "Create AMI from EC2 instance",
  terraform_resource: "aws_ami_from_instance",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2-Image-Builder_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "AMI name" },
      { name: "source_instance_id", type: "string", description: "Source instance ID", reference: "aws_instance.id" }
    ],
    optional: [
      { name: "description", type: "string", description: "Description" },
      { name: "no_reboot", type: "bool", description: "No reboot during creation" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "AMI ID" },
    { name: "arn", type: "string", description: "AMI ARN" }
  ],
  terraform: createTerraformMeta("aws_ami_from_instance", ["name", "source_instance_id"], { id: "id", arn: "arn" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: { setArg: "source_instance_id", toTargetAttr: "id" }
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: { setArg: "source_instance_id", toTargetAttr: "id" }
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_instance",
        apply: [{ setArg: "source_instance_id", toParentAttr: "id" }]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "source_instance_id",
        acceptsResourceTypes: ["aws_instance"],
        targetAttribute: "id",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "AMI from Instance requires a source EC2 instance",
          fixHint: "Draw an edge to an EC2 instance or place this inside an instance"
        }
      }
    ]
  }
};

/**
 * 10. Key Pair
 */
export const keyPair: ServiceDefinition = {
  id: "ec2_key_pair",
  name: "Key Pair",
  description: "SSH key pair for EC2 access",
  terraform_resource: "aws_key_pair",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg",
  inputs: {
    required: [{ name: "public_key", type: "string", description: "Public key material" }],
    optional: [{ name: "key_name", type: "string", description: "Key pair name" }]
  },
  outputs: [
    { name: "id", type: "string", description: "Key pair ID" },
    { name: "key_name", type: "string", description: "Key pair name" },
    { name: "fingerprint", type: "string", description: "Key fingerprint" }
  ],
  terraform: createTerraformMeta("aws_key_pair", ["public_key"], { id: "id", key_name: "key_name" })
};

/**
 * 11. Placement Group
 */
export const placementGroup: ServiceDefinition = {
  id: "ec2_placement_group",
  name: "Placement Group",
  description: "Logical grouping of instances",
  terraform_resource: "aws_placement_group",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Placement group name" },
      { name: "strategy", type: "string", description: "Placement strategy", options: ["cluster", "partition", "spread"] }
    ],
    optional: []
  },
  outputs: [
    { name: "id", type: "string", description: "Placement group ID" },
    { name: "name", type: "string", description: "Placement group name" }
  ],
  terraform: createTerraformMeta("aws_placement_group", ["name", "strategy"], { id: "id", name: "name" })
};

/**
 * 12-13. Elastic IP and Association
 */
export const eip: ServiceDefinition = {
  id: "ec2_eip",
  name: "Elastic IP",
  description: "Static public IP address",
  terraform_resource: "aws_eip",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [],
    optional: [
      { name: "domain", type: "string", description: "Domain", default: "vpc" },
      { name: "instance", type: "string", description: "Instance ID to associate", reference: "aws_instance.id" },
      { name: "tags", type: "map(string)", description: "Tags" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Allocation ID" },
    { name: "allocation_id", type: "string", description: "Allocation ID" },
    { name: "public_ip", type: "string", description: "Public IP" }
  ],
  terraform: createTerraformMeta("aws_eip", [], { id: "id", allocation_id: "allocation_id", public_ip: "public_ip" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: {
          createAssociationResource: {
            type: "aws_eip_association",
            nameTemplate: "${this.name}_to_${target.name}",
            args: {
              allocation_id: "${this.allocation_id}",
              instance_id: "${target.id}"
            }
          }
        }
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: {
          createAssociationResource: {
            type: "aws_eip_association",
            nameTemplate: "${this.name}_to_${target.name}",
            args: {
              allocation_id: "${this.allocation_id}",
              instance_id: "${target.id}"
            }
          }
        }
      }
    ]
  }
};

export const eipAssociation: ServiceDefinition = {
  id: "ec2_eip_association",
  name: "EIP Association",
  description: "Associate Elastic IP with instance",
  terraform_resource: "aws_eip_association",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg",
  inputs: {
    required: [{ name: "allocation_id", type: "string", description: "Allocation ID", reference: "aws_eip.allocation_id" }],
    optional: [
      { name: "instance_id", type: "string", description: "Instance ID", reference: "aws_instance.id" },
      { name: "network_interface_id", type: "string", description: "Network interface ID" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Association ID" }
  ],
  terraform: createTerraformMeta("aws_eip_association", ["allocation_id"], { id: "id" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_eip",
        apply: { setArg: "allocation_id", toTargetAttr: "allocation_id" }
      },
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_instance",
        apply: { setArg: "instance_id", toTargetAttr: "id" }
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_instance",
        apply: [{ setArg: "instance_id", toParentAttr: "id" }]
      }
    ]
  }
};

/**
 * 14. Lightsail Instance
 */
export const lightsailInstance: ServiceDefinition = {
  id: "lightsail_instance",
  name: "Lightsail Instance",
  description: "Simple virtual private server",
  terraform_resource: "aws_lightsail_instance",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-Lightsail_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Instance name" },
      { name: "availability_zone", type: "string", description: "Availability zone" },
      { name: "blueprint_id", type: "string", description: "Blueprint ID" },
      { name: "bundle_id", type: "string", description: "Bundle ID" }
    ],
    optional: [
      { name: "key_pair_name", type: "string", description: "Key pair name" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Instance ID" },
    { name: "arn", type: "string", description: "Instance ARN" }
  ],
  terraform: createTerraformMeta("aws_lightsail_instance", ["name", "availability_zone", "blueprint_id", "bundle_id"], { id: "id", arn: "arn" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_key_pair",
        apply: { setArg: "key_pair_name", toTargetAttr: "key_name" }
      }
    ]
  }
};

/**
 * 15-16. Elastic Beanstalk
 */
export const beanstalkApplication: ServiceDefinition = {
  id: "elastic_beanstalk_application",
  name: "Elastic Beanstalk Application",
  description: "PaaS application container",
  terraform_resource: "aws_elastic_beanstalk_application",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Elastic-Beanstalk_64.svg",
  inputs: {
    required: [{ name: "name", type: "string", description: "Application name" }],
    optional: [{ name: "description", type: "string", description: "Application description" }]
  },
  outputs: [
    { name: "id", type: "string", description: "Application ID" },
    { name: "arn", type: "string", description: "Application ARN" },
    { name: "name", type: "string", description: "Application name" }
  ],
  terraform: createTerraformMeta("aws_elastic_beanstalk_application", ["name"], { id: "id", arn: "arn", name: "name" })
};

export const beanstalkEnvironment: ServiceDefinition = {
  id: "elastic_beanstalk_environment",
  name: "Elastic Beanstalk Environment",
  description: "Deployment environment for applications",
  terraform_resource: "aws_elastic_beanstalk_environment",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Elastic-Beanstalk_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Environment name" },
      { name: "application", type: "string", description: "Application name", reference: "aws_elastic_beanstalk_application.name" }
    ],
    optional: [
      { name: "description", type: "string", description: "Environment description" },
      { name: "solution_stack_name", type: "string", description: "Solution stack name" }
    ]
  },
  outputs: [
    { name: "id", type: "string", description: "Environment ID" },
    { name: "arn", type: "string", description: "Environment ARN" },
    { name: "cname", type: "string", description: "CNAME" }
  ],
  terraform: createTerraformMeta("aws_elastic_beanstalk_environment", ["name", "application"], { id: "id", arn: "arn", cname: "cname" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "attach",
        direction: "outbound",
        toResourceType: "aws_elastic_beanstalk_application",
        apply: { setArg: "application", toTargetAttr: "name" }
      },
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_elastic_beanstalk_application",
        apply: { setArg: "application", toTargetAttr: "name" }
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_elastic_beanstalk_application",
        apply: [{ setArg: "application", toParentAttr: "name" }]
      }
    ],
    autoResolveRules: [
      {
        requiredArg: "application",
        acceptsResourceTypes: ["aws_elastic_beanstalk_application"],
        targetAttribute: "name",
        search: [
          { type: "containment_ancestors" },
          { type: "connected_edges", edgeKind: "attach" },
          { type: "nearby_in_same_scope", scopeResourceTypes: [] }
        ],
        onMissing: {
          level: "error",
          message: "Beanstalk Environment requires an Application",
          fixHint: "Draw an edge to a Beanstalk Application or place this inside an application"
        }
      }
    ]
  }
};

/**
 * 17-19. AWS Batch
 */
export const batchComputeEnvironment: ServiceDefinition = {
  id: "batch_compute_environment",
  name: "Batch Compute Environment",
  description: "AWS Batch compute environment",
  terraform_resource: "aws_batch_compute_environment",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Batch_64.svg",
  inputs: {
    required: [{ name: "type", type: "string", description: "Environment type", options: ["MANAGED", "UNMANAGED"] }],
    optional: [
      { name: "compute_environment_name", type: "string", description: "Environment name" },
      { name: "service_role", type: "string", description: "Service role ARN" },
      { name: "state", type: "string", description: "State", options: ["ENABLED", "DISABLED"] }
    ]
  },
  outputs: [
    { name: "arn", type: "string", description: "Environment ARN" },
    { name: "ecs_cluster_arn", type: "string", description: "ECS cluster ARN" }
  ],
  terraform: createTerraformMeta("aws_batch_compute_environment", ["type"], { arn: "arn" })
};

export const batchJobQueue: ServiceDefinition = {
  id: "batch_job_queue",
  name: "Batch Job Queue",
  description: "AWS Batch job queue",
  terraform_resource: "aws_batch_job_queue",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Batch_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Queue name" },
      { name: "priority", type: "number", description: "Queue priority" },
      { name: "state", type: "string", description: "Queue state", options: ["ENABLED", "DISABLED"] }
    ],
    optional: [],
    blocks: [
      {
        name: "compute_environment_order",
        multiple: true,
        attributes: [
          { name: "order", type: "number", required: true },
          { name: "compute_environment", type: "string", required: true }
        ]
      }
    ]
  },
  outputs: [
    { name: "arn", type: "string", description: "Queue ARN" },
    { name: "id", type: "string", description: "Queue ID" }
  ],
  terraform: createTerraformMeta("aws_batch_job_queue", ["name", "priority", "state"], { arn: "arn", id: "id" }),
  relations: {
    edgeRules: [
      {
        whenEdgeKind: "associate",
        direction: "outbound",
        toResourceType: "aws_batch_compute_environment",
        apply: [
          { setArg: "compute_environment_order.compute_environment", toTargetAttr: "arn" },
          { setArg: "compute_environment_order.order", toLiteral: 1 }
        ]
      },
      {
        whenEdgeKind: "depends",
        direction: "outbound",
        toResourceType: "aws_batch_compute_environment",
        apply: [
          { setArg: "compute_environment_order.compute_environment", toTargetAttr: "arn" },
          { setArg: "compute_environment_order.order", toTargetAttr: "1" }
        ]
      }
    ],
    containmentRules: [
      {
        whenParentResourceType: "aws_batch_compute_environment",
        apply: [
          { setArg: "compute_environment_order.compute_environment", toParentAttr: "arn" },
          { setArg: "compute_environment_order.order", toParentAttr: "1" }
        ]
      }
    ]
  }
};

export const batchJobDefinition: ServiceDefinition = {
  id: "batch_job_definition",
  name: "Batch Job Definition",
  description: "AWS Batch job definition",
  terraform_resource: "aws_batch_job_definition",
  icon: "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Batch_64.svg",
  inputs: {
    required: [
      { name: "name", type: "string", description: "Job definition name" },
      { name: "type", type: "string", description: "Job type", options: ["container", "multinode"] }
    ],
    optional: [
      { name: "container_properties", type: "string", description: "Container properties JSON" }
    ]
  },
  outputs: [
    { name: "arn", type: "string", description: "Job definition ARN" },
    { name: "revision", type: "number", description: "Revision number" }
  ],
  terraform: createTerraformMeta("aws_batch_job_definition", ["name", "type"], { arn: "arn" })
};

/**
 * Export all services as array
 */
export const AWS_COMPUTE_SERVICES: ServiceDefinition[] = [
  ec2Instance,
  launchTemplate,
  autoScalingGroup,
  autoScalingPolicy,
  spotInstanceRequest,
  spotFleetRequest,
  ami,
  amiCopy,
  amiFromInstance,
  keyPair,
  placementGroup,
  eip,
  eipAssociation,
  lightsailInstance,
  beanstalkApplication,
  beanstalkEnvironment,
  batchComputeEnvironment,
  batchJobQueue,
  batchJobDefinition
];
