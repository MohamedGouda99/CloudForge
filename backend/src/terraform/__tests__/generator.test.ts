/**
 * Comprehensive test suite for Terraform Generator
 *
 * Tests:
 * 1. Containment-based relationships (EC2 in VPC/Subnet)
 * 2. Edge-based relationships (EC2 -> Security Group, EC2 -> IAM Role)
 * 3. Association resource creation (EIP Association, IAM Role Policy Attachment)
 * 4. AutoResolve for missing dependencies
 * 5. Conflict detection and precedence
 * 6. Load Balancer -> Target Group attachment
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ServiceRegistry } from "../registry";
import { TerraformGenerator } from "../generate";
import type { Diagram, ServiceDefinition } from "../types";

describe("TerraformGenerator", () => {
  let registry: ServiceRegistry;
  let generator: TerraformGenerator;

  beforeEach(() => {
    registry = new ServiceRegistry();
    generator = new TerraformGenerator(registry);
  });

  // =========================================================================
  // Test 1: Containment-based relationship (EC2 in Subnet)
  // =========================================================================
  it("should apply containment rules for EC2 inside Subnet", () => {
    // Register services with relationship rules
    const vpcService: ServiceDefinition = {
      id: "vpc",
      name: "VPC",
      description: "Virtual Private Cloud",
      terraform_resource: "aws_vpc",
      icon: "/icons/vpc.svg",
      inputs: { required: [], optional: [] },
      outputs: [
        { name: "id", type: "string", description: "VPC ID" },
        { name: "cidr_block", type: "string", description: "CIDR block" },
      ],
      terraform: {
        resourceType: "aws_vpc",
        requiredArgs: ["cidr_block"],
        referenceableAttrs: { id: "id", cidr_block: "cidr_block" },
      },
    };

    const subnetService: ServiceDefinition = {
      id: "subnet",
      name: "Subnet",
      description: "VPC Subnet",
      terraform_resource: "aws_subnet",
      icon: "/icons/subnet.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Subnet ID" }],
      terraform: {
        resourceType: "aws_subnet",
        requiredArgs: ["vpc_id", "cidr_block"],
        referenceableAttrs: { id: "id" },
      },
      relations: {
        containmentRules: [
          {
            whenParentResourceType: "aws_vpc",
            apply: [{ setArg: "vpc_id", toParentAttr: "id" }],
          },
        ],
      },
    };

    const ec2Service: ServiceDefinition = {
      id: "ec2",
      name: "EC2 Instance",
      description: "Virtual server",
      terraform_resource: "aws_instance",
      icon: "/icons/ec2.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Instance ID" }],
      terraform: {
        resourceType: "aws_instance",
        requiredArgs: ["ami", "instance_type"],
        referenceableAttrs: { id: "id" },
      },
      relations: {
        containmentRules: [
          {
            whenParentResourceType: "aws_subnet",
            apply: [{ setArg: "subnet_id", toParentAttr: "id" }],
          },
        ],
      },
    };

    registry.registerBulk([vpcService, subnetService, ec2Service]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "vpc1",
          provider: "aws",
          category: "networking",
          type: "aws_vpc",
          name: "main",
          properties: { cidr_block: "10.0.0.0/16" },
        },
        {
          id: "subnet1",
          provider: "aws",
          category: "networking",
          type: "aws_subnet",
          name: "public",
          parentId: "vpc1",
          properties: { cidr_block: "10.0.1.0/24" },
        },
        {
          id: "ec2_1",
          provider: "aws",
          category: "compute",
          type: "aws_instance",
          name: "web",
          parentId: "subnet1",
          properties: { ami: "ami-12345", instance_type: "t3.micro" },
        },
      ],
      edges: [],
    };

    const result = generator.generate(diagram);

    // Verify no errors
    const errors = result.diagnostics.filter((d) => d.level === "error");
    expect(errors).toHaveLength(0);

    // Verify HCL contains proper references
    expect(result.mainTf).toContain('resource "aws_vpc" "main"');
    expect(result.mainTf).toContain('resource "aws_subnet" "public"');
    expect(result.mainTf).toContain('resource "aws_instance" "web"');

    // Verify containment relationships
    expect(result.mainTf).toContain("vpc_id = aws_vpc.main.id");
    expect(result.mainTf).toContain("subnet_id = aws_subnet.public.id");
  });

  // =========================================================================
  // Test 2: Edge-based relationship (EC2 -> IAM Role)
  // =========================================================================
  it("should apply edge rules for EC2 connecting to IAM Instance Profile", () => {
    const iamRoleService: ServiceDefinition = {
      id: "iam_role",
      name: "IAM Role",
      description: "IAM Role for EC2",
      terraform_resource: "aws_iam_role",
      icon: "/icons/iam.svg",
      inputs: { required: [], optional: [] },
      outputs: [
        { name: "arn", type: "string", description: "Role ARN" },
        { name: "name", type: "string", description: "Role name" },
      ],
      terraform: {
        resourceType: "aws_iam_role",
        requiredArgs: ["assume_role_policy"],
        referenceableAttrs: { arn: "arn", name: "name" },
      },
    };

    const iamInstanceProfileService: ServiceDefinition = {
      id: "iam_instance_profile",
      name: "IAM Instance Profile",
      description: "Instance profile for EC2",
      terraform_resource: "aws_iam_instance_profile",
      icon: "/icons/iam.svg",
      inputs: { required: [], optional: [] },
      outputs: [
        { name: "arn", type: "string", description: "Profile ARN" },
        { name: "name", type: "string", description: "Profile name" },
      ],
      terraform: {
        resourceType: "aws_iam_instance_profile",
        requiredArgs: ["role"],
        referenceableAttrs: { arn: "arn", name: "name" },
      },
      relations: {
        edgeRules: [
          {
            whenEdgeKind: "attach",
            direction: "outbound",
            toResourceType: "aws_iam_role",
            apply: [{ setArg: "role", toTargetAttr: "name" }],
          },
        ],
      },
    };

    const ec2Service: ServiceDefinition = {
      id: "ec2",
      name: "EC2 Instance",
      description: "Virtual server",
      terraform_resource: "aws_instance",
      icon: "/icons/ec2.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Instance ID" }],
      terraform: {
        resourceType: "aws_instance",
        requiredArgs: ["ami", "instance_type"],
        referenceableAttrs: { id: "id" },
      },
      relations: {
        edgeRules: [
          {
            whenEdgeKind: "attach",
            direction: "outbound",
            toResourceType: "aws_iam_instance_profile",
            apply: [{ setArg: "iam_instance_profile", toTargetAttr: "name" }],
          },
        ],
      },
    };

    registry.registerBulk([iamRoleService, iamInstanceProfileService, ec2Service]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "role1",
          provider: "aws",
          category: "security",
          type: "aws_iam_role",
          name: "ec2_role",
          properties: {
            assume_role_policy: JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: { Service: "ec2.amazonaws.com" },
                  Action: "sts:AssumeRole",
                },
              ],
            }),
          },
        },
        {
          id: "profile1",
          provider: "aws",
          category: "security",
          type: "aws_iam_instance_profile",
          name: "ec2_profile",
        },
        {
          id: "ec2_1",
          provider: "aws",
          category: "compute",
          type: "aws_instance",
          name: "app",
          properties: { ami: "ami-12345", instance_type: "t3.micro" },
        },
      ],
      edges: [
        {
          id: "edge1",
          from: "profile1",
          to: "role1",
          kind: "attach",
        },
        {
          id: "edge2",
          from: "ec2_1",
          to: "profile1",
          kind: "attach",
        },
      ],
    };

    const result = generator.generate(diagram);

    const errors = result.diagnostics.filter((d) => d.level === "error");
    expect(errors).toHaveLength(0);

    expect(result.mainTf).toContain("role = aws_iam_role.ec2_role.name");
    expect(result.mainTf).toContain("iam_instance_profile = aws_iam_instance_profile.ec2_profile.name");
  });

  // =========================================================================
  // Test 3: Association resource creation (IAM Role Policy Attachment)
  // =========================================================================
  it("should create association resource for IAM Role Policy attachment", () => {
    const iamRoleService: ServiceDefinition = {
      id: "iam_role",
      name: "IAM Role",
      description: "IAM Role",
      terraform_resource: "aws_iam_role",
      icon: "/icons/iam.svg",
      inputs: { required: [], optional: [] },
      outputs: [
        { name: "arn", type: "string", description: "Role ARN" },
        { name: "name", type: "string", description: "Role name" },
      ],
      terraform: {
        resourceType: "aws_iam_role",
        referenceableAttrs: { arn: "arn", name: "name" },
      },
      relations: {
        edgeRules: [
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

    const iamPolicyService: ServiceDefinition = {
      id: "iam_policy",
      name: "IAM Policy",
      description: "IAM Policy",
      terraform_resource: "aws_iam_policy",
      icon: "/icons/iam.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "arn", type: "string", description: "Policy ARN" }],
      terraform: {
        resourceType: "aws_iam_policy",
        referenceableAttrs: { arn: "arn" },
      },
    };

    registry.registerBulk([iamRoleService, iamPolicyService]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "role1",
          provider: "aws",
          category: "security",
          type: "aws_iam_role",
          name: "app_role",
          properties: { assume_role_policy: "{}" },
        },
        {
          id: "policy1",
          provider: "aws",
          category: "security",
          type: "aws_iam_policy",
          name: "s3_access",
          properties: { policy: "{}" },
        },
      ],
      edges: [
        {
          id: "edge1",
          from: "role1",
          to: "policy1",
          kind: "attach",
        },
      ],
    };

    const result = generator.generate(diagram);

    const errors = result.diagnostics.filter((d) => d.level === "error");
    expect(errors).toHaveLength(0);

    // Verify association resource is created
    expect(result.mainTf).toContain('resource "aws_iam_role_policy_attachment"');
    expect(result.mainTf).toContain("app_role_s3_access_attachment");
    expect(result.mainTf).toContain("role = aws_iam_role.app_role.name");
    expect(result.mainTf).toContain("policy_arn = aws_iam_policy.s3_access.arn");
  });

  // =========================================================================
  // Test 4: AutoResolve for missing subnet_id
  // =========================================================================
  it("should auto-resolve subnet_id from containment ancestors", () => {
    const vpcService: ServiceDefinition = {
      id: "vpc",
      name: "VPC",
      description: "VPC",
      terraform_resource: "aws_vpc",
      icon: "/icons/vpc.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "VPC ID" }],
      terraform: {
        resourceType: "aws_vpc",
        referenceableAttrs: { id: "id" },
      },
    };

    const subnetService: ServiceDefinition = {
      id: "subnet",
      name: "Subnet",
      description: "Subnet",
      terraform_resource: "aws_subnet",
      icon: "/icons/subnet.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Subnet ID" }],
      terraform: {
        resourceType: "aws_subnet",
        referenceableAttrs: { id: "id" },
      },
    };

    const ec2Service: ServiceDefinition = {
      id: "ec2",
      name: "EC2 Instance",
      description: "EC2",
      terraform_resource: "aws_instance",
      icon: "/icons/ec2.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Instance ID" }],
      terraform: {
        resourceType: "aws_instance",
        requiredArgs: ["ami", "instance_type", "subnet_id"],
        referenceableAttrs: { id: "id" },
      },
      relations: {
        autoResolveRules: [
          {
            requiredArg: "subnet_id",
            acceptsResourceTypes: ["aws_subnet"],
            search: [{ type: "containment_ancestors" }],
            onMissing: {
              level: "error",
              message: "EC2 instance must be placed inside a subnet",
              fixHint: "Drag the EC2 instance into a subnet",
            },
          },
        ],
      },
    };

    registry.registerBulk([vpcService, subnetService, ec2Service]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "vpc1",
          provider: "aws",
          category: "networking",
          type: "aws_vpc",
          name: "main",
          properties: { cidr_block: "10.0.0.0/16" },
        },
        {
          id: "subnet1",
          provider: "aws",
          category: "networking",
          type: "aws_subnet",
          name: "public",
          parentId: "vpc1",
          properties: { vpc_id: "aws_vpc.main.id", cidr_block: "10.0.1.0/24" },
        },
        {
          id: "ec2_1",
          provider: "aws",
          category: "compute",
          type: "aws_instance",
          name: "web",
          parentId: "subnet1",
          properties: { ami: "ami-12345", instance_type: "t3.micro" },
          // Note: subnet_id is NOT explicitly set
        },
      ],
      edges: [],
    };

    const result = generator.generate(diagram);

    // Should auto-resolve subnet_id from parent
    expect(result.mainTf).toContain("subnet_id = aws_subnet.public.id");

    const errors = result.diagnostics.filter((d) => d.level === "error");
    expect(errors).toHaveLength(0);
  });

  // =========================================================================
  // Test 5: Conflict detection and precedence
  // =========================================================================
  it("should handle conflicts with correct precedence (edge > containment)", () => {
    const subnetService: ServiceDefinition = {
      id: "subnet",
      name: "Subnet",
      description: "Subnet",
      terraform_resource: "aws_subnet",
      icon: "/icons/subnet.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Subnet ID" }],
      terraform: {
        resourceType: "aws_subnet",
        referenceableAttrs: { id: "id" },
      },
    };

    const ec2Service: ServiceDefinition = {
      id: "ec2",
      name: "EC2 Instance",
      description: "EC2",
      terraform_resource: "aws_instance",
      icon: "/icons/ec2.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "id", type: "string", description: "Instance ID" }],
      terraform: {
        resourceType: "aws_instance",
        requiredArgs: ["ami", "instance_type"],
        referenceableAttrs: { id: "id" },
      },
      relations: {
        containmentRules: [
          {
            whenParentResourceType: "aws_subnet",
            apply: [{ setArg: "subnet_id", toParentAttr: "id" }],
          },
        ],
        edgeRules: [
          {
            whenEdgeKind: "connect",
            direction: "outbound",
            toResourceType: "aws_subnet",
            apply: [{ setArg: "subnet_id", toTargetAttr: "id" }],
          },
        ],
      },
    };

    registry.registerBulk([subnetService, ec2Service]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "subnet1",
          provider: "aws",
          category: "networking",
          type: "aws_subnet",
          name: "parent_subnet",
        },
        {
          id: "subnet2",
          provider: "aws",
          category: "networking",
          type: "aws_subnet",
          name: "edge_subnet",
        },
        {
          id: "ec2_1",
          provider: "aws",
          category: "compute",
          type: "aws_instance",
          name: "web",
          parentId: "subnet1", // containment says use subnet1
          properties: { ami: "ami-12345", instance_type: "t3.micro" },
        },
      ],
      edges: [
        {
          id: "edge1",
          from: "ec2_1",
          to: "subnet2", // edge says use subnet2
          kind: "connect",
        },
      ],
    };

    const result = generator.generate(diagram);

    // Edge should win (higher precedence)
    expect(result.mainTf).toContain("subnet_id = aws_subnet.edge_subnet.id");
    expect(result.mainTf).not.toContain("subnet_id = aws_subnet.parent_subnet.id");
  });

  // =========================================================================
  // Test 6: Load Balancer -> Target Group attachment
  // =========================================================================
  it("should create listener for ALB -> Target Group relationship", () => {
    const albService: ServiceDefinition = {
      id: "alb",
      name: "Application Load Balancer",
      description: "ALB",
      terraform_resource: "aws_lb",
      icon: "/icons/alb.svg",
      inputs: { required: [], optional: [] },
      outputs: [
        { name: "arn", type: "string", description: "LB ARN" },
        { name: "dns_name", type: "string", description: "DNS name" },
      ],
      terraform: {
        resourceType: "aws_lb",
        referenceableAttrs: { arn: "arn", dns_name: "dns_name" },
      },
      relations: {
        edgeRules: [
          {
            whenEdgeKind: "route",
            direction: "outbound",
            toResourceType: "aws_lb_target_group",
            apply: {
              createAssociationResource: {
                type: "aws_lb_listener",
                nameTemplate: "${this.name}_listener",
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

    const targetGroupService: ServiceDefinition = {
      id: "target_group",
      name: "Target Group",
      description: "Target Group",
      terraform_resource: "aws_lb_target_group",
      icon: "/icons/tg.svg",
      inputs: { required: [], optional: [] },
      outputs: [{ name: "arn", type: "string", description: "TG ARN" }],
      terraform: {
        resourceType: "aws_lb_target_group",
        referenceableAttrs: { arn: "arn" },
      },
    };

    registry.registerBulk([albService, targetGroupService]);

    const diagram: Diagram = {
      nodes: [
        {
          id: "alb1",
          provider: "aws",
          category: "networking",
          type: "aws_lb",
          name: "web_lb",
          properties: { load_balancer_type: "application" },
        },
        {
          id: "tg1",
          provider: "aws",
          category: "networking",
          type: "aws_lb_target_group",
          name: "web_tg",
          properties: { port: 80, protocol: "HTTP" },
        },
      ],
      edges: [
        {
          id: "edge1",
          from: "alb1",
          to: "tg1",
          kind: "route",
        },
      ],
    };

    const result = generator.generate(diagram);

    expect(result.mainTf).toContain('resource "aws_lb_listener" "web_lb_listener"');
    expect(result.mainTf).toContain("load_balancer_arn = aws_lb.web_lb.arn");
    expect(result.mainTf).toContain("target_group_arn");
  });
});
