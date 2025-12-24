/**
 * Comprehensive Test Suite for AWS Compute Relationships
 *
 * Tests all 7 key scenarios for compute-only MVP:
 * 1. EIP --associate--> Instance produces aws_eip_association
 * 2. ASG --attach--> Launch Template wires launch_template reference
 * 3. Autoscaling Policy --attach--> ASG wires autoscaling_group_name
 * 4. Batch Job Queue --associate--> Compute Environment creates compute_environment_order
 * 5. Beanstalk Environment --attach--> Application wires application
 * 6. AMI From Instance --attach--> Instance wires source_instance_id
 * 7. Unsupported edge returns ERROR diagnostic with edgeId
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ServiceRegistry } from "../registry";
import { TerraformGenerator } from "../generate";
import type { Diagram } from "../types";
import { AWS_COMPUTE_SERVICES } from "../catalog/awsComputeComplete";

describe("AWS Compute Relationships", () => {
  let registry: ServiceRegistry;
  let generator: TerraformGenerator;

  beforeEach(() => {
    registry = new ServiceRegistry();
    // Register all 19 AWS compute services
    registry.registerBulk(AWS_COMPUTE_SERVICES);
    generator = new TerraformGenerator(registry);
  });

  // ===========================================================================
  // Test 1: EIP --associate--> Instance produces aws_eip_association
  // ===========================================================================
  describe("EIP to Instance Association", () => {
    it("should create aws_eip_association resource when EIP connects to Instance", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "web_server",
            properties: {
              ami: "ami-12345678",
              instance_type: "t3.micro",
            },
          },
          {
            id: "eip1",
            provider: "aws",
            category: "networking",
            type: "aws_eip",
            name: "web_ip",
            properties: {},
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "eip1",
            to: "instance1",
            kind: "associate",
          },
        ],
      };

      const result = generator.generate(diagram);

      // No errors
      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Check HCL contains instance and EIP
      expect(result.mainTf).toContain('resource "aws_instance" "web_server"');
      expect(result.mainTf).toContain('resource "aws_eip" "web_ip"');

      // Check association resource was created
      expect(result.mainTf).toContain('resource "aws_eip_association"');
      expect(result.mainTf).toContain("allocation_id = aws_eip.web_ip.allocation_id");
      expect(result.mainTf).toContain("instance_id = aws_instance.web_server.id");
    });

    it("should create association with 'attach' edge kind", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "app",
            properties: { ami: "ami-123", instance_type: "t3.small" },
          },
          {
            id: "eip1",
            provider: "aws",
            category: "networking",
            type: "aws_eip",
            name: "app_ip",
            properties: {},
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "eip1",
            to: "instance1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);
      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain('resource "aws_eip_association"');
    });
  });

  // ===========================================================================
  // Test 2: ASG --attach--> Launch Template wires launch_template reference
  // ===========================================================================
  describe("Auto Scaling Group to Launch Template", () => {
    it("should wire launch_template block when ASG connects to Launch Template", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lt1",
            provider: "aws",
            category: "compute",
            type: "aws_launch_template",
            name: "web_template",
            properties: {
              image_id: "ami-12345",
              instance_type: "t3.micro",
            },
          },
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "web_asg",
            properties: {
              max_size: 10,
              min_size: 2,
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "asg1",
            to: "lt1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Verify HCL contains resources
      expect(result.mainTf).toContain('resource "aws_launch_template" "web_template"');
      expect(result.mainTf).toContain('resource "aws_autoscaling_group" "web_asg"');

      // Verify launch_template block is wired
      expect(result.mainTf).toMatch(/launch_template\s*{/);
      expect(result.mainTf).toContain("id = aws_launch_template.web_template.id");
      expect(result.mainTf).toMatch(/version\s*=\s*"\$Latest"/);
    });

    it("should wire launch_template via containment (ASG inside Launch Template)", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lt1",
            provider: "aws",
            category: "compute",
            type: "aws_launch_template",
            name: "api_template",
            properties: {},
          },
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "api_asg",
            parentId: "lt1",
            properties: {
              max_size: 5,
              min_size: 1,
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("id = aws_launch_template.api_template.id");
    });

    it("should use 'connect' edge kind", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lt1",
            provider: "aws",
            category: "compute",
            type: "aws_launch_template",
            name: "batch_template",
            properties: {},
          },
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "batch_asg",
            properties: { max_size: 20, min_size: 0 },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "asg1",
            to: "lt1",
            kind: "connect",
          },
        ],
      };

      const result = generator.generate(diagram);
      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("id = aws_launch_template.batch_template.id");
    });
  });

  // ===========================================================================
  // Test 3: Autoscaling Policy --attach--> ASG wires autoscaling_group_name
  // ===========================================================================
  describe("Auto Scaling Policy to ASG", () => {
    it("should wire autoscaling_group_name via edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "main_asg",
            properties: { max_size: 10, min_size: 2 },
          },
          {
            id: "policy1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "scale_up",
            properties: {
              name: "scale_up_policy",
              adjustment_type: "ChangeInCapacity",
              scaling_adjustment: 1,
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "policy1",
            to: "asg1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain('resource "aws_autoscaling_policy" "scale_up"');
      expect(result.mainTf).toContain("autoscaling_group_name = aws_autoscaling_group.main_asg.name");
    });

    it("should wire autoscaling_group_name via containment", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "prod_asg",
            properties: { max_size: 100, min_size: 10 },
          },
          {
            id: "policy1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "scale_policy",
            parentId: "asg1",
            properties: { name: "policy" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("autoscaling_group_name = aws_autoscaling_group.prod_asg.name");
    });

    it("should auto-resolve when only one ASG exists", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "only_asg",
            properties: { max_size: 5, min_size: 1 },
          },
          {
            id: "policy1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "auto_policy",
            properties: { name: "auto" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      // Should auto-resolve with a warning
      const warnings = result.diagnostics.filter((d) => d.level === "warn");
      expect(warnings.length).toBeGreaterThan(0);

      // But should still wire correctly
      expect(result.mainTf).toContain("autoscaling_group_name = aws_autoscaling_group.only_asg.name");
    });

    it("should error when no ASG is available and no edge is drawn", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "policy1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "orphan_policy",
            properties: { name: "orphan" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/requires an Auto Scaling Group/i);
      expect(errors[0].fixHint).toMatch(/draw an edge/i);
    });
  });

  // ===========================================================================
  // Test 4: Batch Job Queue --associate--> Compute Environment
  // ===========================================================================
  describe("Batch Job Queue to Compute Environment", () => {
    it("should create compute_environment_order block via edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_compute_environment",
            name: "batch_env",
            properties: { type: "MANAGED" },
          },
          {
            id: "queue1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_queue",
            name: "job_queue",
            properties: {
              name: "main_queue",
              priority: 1,
              state: "ENABLED",
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "queue1",
            to: "env1",
            kind: "associate",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain('resource "aws_batch_job_queue" "job_queue"');
      expect(result.mainTf).toMatch(/compute_environment_order\s*{/);
      expect(result.mainTf).toContain("compute_environment = aws_batch_compute_environment.batch_env.arn");
      expect(result.mainTf).toMatch(/order\s*=\s*1/);
    });

    it("should work with 'depends' edge kind", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_compute_environment",
            name: "gpu_env",
            properties: { type: "MANAGED" },
          },
          {
            id: "queue1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_queue",
            name: "gpu_queue",
            properties: { name: "gpu", priority: 10, state: "ENABLED" },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "queue1",
            to: "env1",
            kind: "depends",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("compute_environment = aws_batch_compute_environment.gpu_env.arn");
    });

    it("should wire via containment", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_compute_environment",
            name: "ml_env",
            properties: { type: "MANAGED" },
          },
          {
            id: "queue1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_queue",
            name: "ml_queue",
            parentId: "env1",
            properties: { name: "ml", priority: 5, state: "ENABLED" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("compute_environment = aws_batch_compute_environment.ml_env.arn");
    });
  });

  // ===========================================================================
  // Test 5: Beanstalk Environment --attach--> Application
  // ===========================================================================
  describe("Elastic Beanstalk Environment to Application", () => {
    it("should wire application attribute via edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "app1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_application",
            name: "my_app",
            properties: { name: "MyApplication" },
          },
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_environment",
            name: "prod_env",
            properties: {
              name: "production",
              solution_stack_name: "64bit Amazon Linux 2023",
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "env1",
            to: "app1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain('resource "aws_elastic_beanstalk_environment" "prod_env"');
      expect(result.mainTf).toContain("application = aws_elastic_beanstalk_application.my_app.name");
    });

    it("should wire via containment", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "app1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_application",
            name: "api_app",
            properties: { name: "API" },
          },
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_environment",
            name: "staging",
            parentId: "app1",
            properties: { name: "staging" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("application = aws_elastic_beanstalk_application.api_app.name");
    });

    it("should auto-resolve when only one application exists", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "app1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_application",
            name: "single_app",
            properties: { name: "SingleApp" },
          },
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_environment",
            name: "auto_env",
            properties: { name: "auto" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      // Should auto-resolve with warning
      const warnings = result.diagnostics.filter((d) => d.level === "warn");
      expect(warnings.length).toBeGreaterThan(0);

      expect(result.mainTf).toContain("application = aws_elastic_beanstalk_application.single_app.name");
    });

    it("should error when no application is available", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_elastic_beanstalk_environment",
            name: "orphan_env",
            properties: { name: "orphan" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/requires an Application/i);
      expect(errors[0].fixHint).toBeDefined();
    });
  });

  // ===========================================================================
  // Test 6: AMI from Instance --attach--> Instance
  // ===========================================================================
  describe("AMI from Instance to EC2 Instance", () => {
    it("should wire source_instance_id via edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "source_server",
            properties: { ami: "ami-123", instance_type: "t3.micro" },
          },
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami_from_instance",
            name: "backup_ami",
            properties: { name: "server-backup" },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "ami1",
            to: "instance1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain('resource "aws_ami_from_instance" "backup_ami"');
      expect(result.mainTf).toContain("source_instance_id = aws_instance.source_server.id");
    });

    it("should wire via containment", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "web_server",
            properties: { ami: "ami-456", instance_type: "t3.small" },
          },
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami_from_instance",
            name: "web_ami",
            parentId: "instance1",
            properties: { name: "web-snapshot" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("source_instance_id = aws_instance.web_server.id");
    });

    it("should auto-resolve when only one instance exists", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "only_instance",
            properties: { ami: "ami-789", instance_type: "t3.medium" },
          },
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami_from_instance",
            name: "auto_ami",
            properties: { name: "auto" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const warnings = result.diagnostics.filter((d) => d.level === "warn");
      expect(warnings.length).toBeGreaterThan(0);

      expect(result.mainTf).toContain("source_instance_id = aws_instance.only_instance.id");
    });

    it("should error when no instance is available", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami_from_instance",
            name: "orphan_ami",
            properties: { name: "orphan" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/requires a source EC2 instance/i);
    });
  });

  // ===========================================================================
  // Test 7: Unsupported edge returns ERROR diagnostic with edgeId
  // ===========================================================================
  describe("Unsupported Edge Connections", () => {
    it("should return ERROR when connecting incompatible resources", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami",
            name: "my_ami",
            properties: { name: "MyAMI" },
          },
          {
            id: "key1",
            provider: "aws",
            category: "compute",
            type: "aws_key_pair",
            name: "my_key",
            properties: { public_key: "ssh-rsa ..." },
          },
        ],
        edges: [
          {
            id: "invalid_edge",
            from: "ami1",
            to: "key1",
            kind: "connect",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);

      const edgeError = errors.find((e) => e.edgeId === "invalid_edge");
      expect(edgeError).toBeDefined();
      expect(edgeError!.message).toMatch(/unsupported|invalid|cannot connect/i);
      expect(edgeError!.fixHint).toBeDefined();
    });

    it("should return ERROR for wrong edge kind", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "server",
            properties: { ami: "ami-123", instance_type: "t3.micro" },
          },
          {
            id: "key1",
            provider: "aws",
            category: "compute",
            type: "aws_key_pair",
            name: "ssh_key",
            properties: { public_key: "ssh-rsa ..." },
          },
        ],
        edges: [
          {
            id: "wrong_kind_edge",
            from: "instance1",
            to: "key1",
            kind: "depends", // wrong kind, should be 'connect'
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);

      const edgeError = errors.find((e) => e.edgeId === "wrong_kind_edge");
      expect(edgeError).toBeDefined();
    });

    it("should provide helpful fixHint for unsupported edges", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "batch_def",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_definition",
            name: "job_def",
            properties: { name: "MyJob", type: "container" },
          },
          {
            id: "eip1",
            provider: "aws",
            category: "networking",
            type: "aws_eip",
            name: "ip",
            properties: {},
          },
        ],
        edges: [
          {
            id: "nonsense_edge",
            from: "batch_def",
            to: "eip1",
            kind: "connect",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);

      const edgeError = errors.find((e) => e.edgeId === "nonsense_edge");
      expect(edgeError).toBeDefined();
      expect(edgeError!.fixHint).toContain("Remove this edge");
    });
  });

  // ===========================================================================
  // Additional Integration Tests
  // ===========================================================================
  describe("Complex Multi-Resource Scenarios", () => {
    it("should handle complete EC2 deployment with multiple relationships", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "key1",
            provider: "aws",
            category: "compute",
            type: "aws_key_pair",
            name: "deploy_key",
            properties: { public_key: "ssh-rsa AAAA..." },
          },
          {
            id: "ami1",
            provider: "aws",
            category: "compute",
            type: "aws_ami",
            name: "base_ami",
            properties: { name: "BaseImage" },
          },
          {
            id: "placement1",
            provider: "aws",
            category: "compute",
            type: "aws_placement_group",
            name: "cluster_group",
            properties: { name: "cluster", strategy: "cluster" },
          },
          {
            id: "instance1",
            provider: "aws",
            category: "compute",
            type: "aws_instance",
            name: "app_server",
            properties: { instance_type: "c5.large" },
          },
          {
            id: "eip1",
            provider: "aws",
            category: "networking",
            type: "aws_eip",
            name: "server_ip",
            properties: {},
          },
          {
            id: "backup_ami",
            provider: "aws",
            category: "compute",
            type: "aws_ami_from_instance",
            name: "nightly_backup",
            properties: { name: "backup" },
          },
        ],
        edges: [
          { id: "e1", from: "instance1", to: "key1", kind: "connect" },
          { id: "e2", from: "instance1", to: "ami1", kind: "connect" },
          { id: "e3", from: "instance1", to: "placement1", kind: "attach" },
          { id: "e4", from: "eip1", to: "instance1", kind: "associate" },
          { id: "e5", from: "backup_ami", to: "instance1", kind: "attach" },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Verify all resources are present
      expect(result.mainTf).toContain('resource "aws_key_pair" "deploy_key"');
      expect(result.mainTf).toContain('resource "aws_ami" "base_ami"');
      expect(result.mainTf).toContain('resource "aws_placement_group" "cluster_group"');
      expect(result.mainTf).toContain('resource "aws_instance" "app_server"');
      expect(result.mainTf).toContain('resource "aws_eip" "server_ip"');
      expect(result.mainTf).toContain('resource "aws_ami_from_instance" "nightly_backup"');
      expect(result.mainTf).toContain('resource "aws_eip_association"');

      // Verify relationships
      expect(result.mainTf).toContain("key_name = aws_key_pair.deploy_key.key_name");
      expect(result.mainTf).toContain("ami = aws_ami.base_ami.id");
      expect(result.mainTf).toContain("placement_group = aws_placement_group.cluster_group.name");
      expect(result.mainTf).toContain("source_instance_id = aws_instance.app_server.id");
    });

    it("should handle Auto Scaling setup with policy", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lt1",
            provider: "aws",
            category: "compute",
            type: "aws_launch_template",
            name: "web_lt",
            properties: { image_id: "ami-123", instance_type: "t3.micro" },
          },
          {
            id: "asg1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_group",
            name: "web_asg",
            properties: { max_size: 10, min_size: 2, desired_capacity: 5 },
          },
          {
            id: "policy1",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "scale_up",
            properties: { name: "scale_up" },
          },
          {
            id: "policy2",
            provider: "aws",
            category: "compute",
            type: "aws_autoscaling_policy",
            name: "scale_down",
            properties: { name: "scale_down" },
          },
        ],
        edges: [
          { id: "e1", from: "asg1", to: "lt1", kind: "attach" },
          { id: "e2", from: "policy1", to: "asg1", kind: "attach" },
          { id: "e3", from: "policy2", to: "asg1", kind: "attach" },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Both policies should reference the same ASG
      const policyMatches = result.mainTf.match(/autoscaling_group_name = aws_autoscaling_group\.web_asg\.name/g);
      expect(policyMatches).toHaveLength(2);
    });

    it("should handle AWS Batch pipeline", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "env1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_compute_environment",
            name: "batch_env",
            properties: { type: "MANAGED" },
          },
          {
            id: "queue1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_queue",
            name: "queue",
            properties: { name: "queue", priority: 1, state: "ENABLED" },
          },
          {
            id: "def1",
            provider: "aws",
            category: "compute",
            type: "aws_batch_job_definition",
            name: "job",
            properties: { name: "job", type: "container" },
          },
        ],
        edges: [
          { id: "e1", from: "queue1", to: "env1", kind: "associate" },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain("compute_environment = aws_batch_compute_environment.batch_env.arn");
    });
  });
});
