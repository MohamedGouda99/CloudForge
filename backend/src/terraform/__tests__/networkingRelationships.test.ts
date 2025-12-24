/**
 * Comprehensive Test Suite for AWS Networking Relationships
 *
 * Tests all key scenarios for networking services:
 * 1. VPC → Subnet containment and auto-resolve
 * 2. Subnet → Route Table Association creates association resource
 * 3. Route → Internet Gateway via "route" edge kind
 * 4. Route → NAT Gateway via "route" edge kind
 * 5. Security Group Rule → Security Group containment
 * 6. Load Balancer → Target Group → Listener hierarchy
 * 7. Route53 Record → Load Balancer alias configuration
 * 8. VPC Peering Connection bidirectional
 * 9. VPN Connection between Customer Gateway and VPN Gateway
 * 10. Transit Gateway VPC Attachment
 * 11. Unsupported edge returns ERROR diagnostic with edgeId
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ServiceRegistry } from "../registry";
import { TerraformGenerator } from "../generate";
import type { Diagram } from "../types";
import { AWS_NETWORKING_SERVICES } from "../catalog/awsNetworkingComplete";

describe("AWS Networking Relationships", () => {
  let registry: ServiceRegistry;
  let generator: TerraformGenerator;

  beforeEach(() => {
    registry = new ServiceRegistry();
    // Register all 27 AWS networking services
    registry.registerBulk(AWS_NETWORKING_SERVICES);
    generator = new TerraformGenerator(registry);
  });

  // ===========================================================================
  // Test 1: VPC → Subnet containment and auto-resolve
  // ===========================================================================
  describe("VPC to Subnet Relationship", () => {
    it("should wire vpc_id via containment when Subnet is inside VPC", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "main_vpc",
            properties: {
              cidr_block: "10.0.0.0/16"
            },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "public_subnet",
            parentId: "vpc1",
            properties: {
              cidr_block: "10.0.1.0/24"
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_vpc" "main_vpc"');
      expect(result.mainTf).toContain('resource "aws_subnet" "public_subnet"');
      expect(result.mainTf).toContain("vpc_id = aws_vpc.main_vpc.id");
    });

    it("should wire vpc_id via 'attach' edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "app_vpc",
            properties: { cidr_block: "172.16.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "private_subnet",
            properties: { cidr_block: "172.16.10.0/24" },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "subnet1",
            to: "vpc1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("vpc_id = aws_vpc.app_vpc.id");
    });

    it("should auto-resolve when only one VPC exists", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "only_vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "auto_subnet",
            properties: { cidr_block: "10.0.2.0/24" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      // Should auto-resolve with a warning
      const warnings = result.diagnostics.filter((d) => d.level === "warn");
      expect(warnings.length).toBeGreaterThan(0);

      // Should still wire correctly
      expect(result.mainTf).toContain("vpc_id = aws_vpc.only_vpc.id");
    });

    it("should error when no VPC is available", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "orphan_subnet",
            properties: { cidr_block: "10.0.3.0/24" },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/Subnet requires a VPC/i);
      expect(errors[0].fixHint).toMatch(/Place subnet inside a VPC/i);
    });
  });

  // ===========================================================================
  // Test 2: Route Table Association creates association resource
  // ===========================================================================
  describe("Route Table to Subnet Association", () => {
    it("should create aws_route_table_association when connecting Route Table to Subnet", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "main_vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "web_subnet",
            parentId: "vpc1",
            properties: { cidr_block: "10.0.1.0/24" },
          },
          {
            id: "rt1",
            provider: "aws",
            category: "networking",
            type: "aws_route_table",
            name: "public_rt",
            parentId: "vpc1",
            properties: {},
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "rt1",
            to: "subnet1",
            kind: "associate",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Check main resources
      expect(result.mainTf).toContain('resource "aws_vpc" "main_vpc"');
      expect(result.mainTf).toContain('resource "aws_subnet" "web_subnet"');
      expect(result.mainTf).toContain('resource "aws_route_table" "public_rt"');

      // Check association resource was created
      expect(result.mainTf).toContain('resource "aws_route_table_association"');
      expect(result.mainTf).toContain("route_table_id = aws_route_table.public_rt.id");
      expect(result.mainTf).toContain("subnet_id = aws_subnet.web_subnet.id");
    });
  });

  // ===========================================================================
  // Test 3: Route → Internet Gateway via "route" edge kind
  // ===========================================================================
  describe("Route to Internet Gateway", () => {
    it("should wire gateway_id when Route connects to Internet Gateway", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "igw1",
            provider: "aws",
            category: "networking",
            type: "aws_internet_gateway",
            name: "main_igw",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "rt1",
            provider: "aws",
            category: "networking",
            type: "aws_route_table",
            name: "public_rt",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "route1",
            provider: "aws",
            category: "networking",
            type: "aws_route",
            name: "internet_route",
            parentId: "rt1",
            properties: {
              destination_cidr_block: "0.0.0.0/0"
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "route1",
            to: "igw1",
            kind: "route",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_route" "internet_route"');
      expect(result.mainTf).toContain("gateway_id = aws_internet_gateway.main_igw.id");
      expect(result.mainTf).toContain("route_table_id = aws_route_table.public_rt.id");
    });
  });

  // ===========================================================================
  // Test 4: Route → NAT Gateway via "route" edge kind
  // ===========================================================================
  describe("Route to NAT Gateway", () => {
    it("should wire nat_gateway_id when Route connects to NAT Gateway", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "public_subnet",
            parentId: "vpc1",
            properties: { cidr_block: "10.0.1.0/24" },
          },
          {
            id: "nat1",
            provider: "aws",
            category: "networking",
            type: "aws_nat_gateway",
            name: "nat_gw",
            parentId: "subnet1",
            properties: {},
          },
          {
            id: "rt1",
            provider: "aws",
            category: "networking",
            type: "aws_route_table",
            name: "private_rt",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "route1",
            provider: "aws",
            category: "networking",
            type: "aws_route",
            name: "nat_route",
            parentId: "rt1",
            properties: {
              destination_cidr_block: "0.0.0.0/0"
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "route1",
            to: "nat1",
            kind: "route",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_route" "nat_route"');
      expect(result.mainTf).toContain("nat_gateway_id = aws_nat_gateway.nat_gw.id");
      expect(result.mainTf).toContain("route_table_id = aws_route_table.private_rt.id");
    });
  });

  // ===========================================================================
  // Test 5: Security Group Rule → Security Group containment
  // ===========================================================================
  describe("Security Group Rule to Security Group", () => {
    it("should wire security_group_id via containment", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "sg1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group",
            name: "web_sg",
            parentId: "vpc1",
            properties: {
              name: "web_sg",
              description: "Web security group"
            },
          },
          {
            id: "rule1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "http_ingress",
            parentId: "sg1",
            properties: {
              type: "ingress",
              from_port: 80,
              to_port: 80,
              protocol: "tcp",
              cidr_blocks: ["0.0.0.0/0"]
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_security_group" "web_sg"');
      expect(result.mainTf).toContain('resource "aws_security_group_rule" "http_ingress"');
      expect(result.mainTf).toContain("security_group_id = aws_security_group.web_sg.id");
    });

    it("should wire security_group_id via 'attach' edge", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "sg1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group",
            name: "db_sg",
            parentId: "vpc1",
            properties: { name: "db_sg" },
          },
          {
            id: "rule1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "mysql_ingress",
            properties: {
              type: "ingress",
              from_port: 3306,
              to_port: 3306,
              protocol: "tcp"
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "rule1",
            to: "sg1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      expect(result.diagnostics.filter((d) => d.level === "error")).toHaveLength(0);
      expect(result.mainTf).toContain("security_group_id = aws_security_group.db_sg.id");
    });

    it("should error when no security group is available", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "rule1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "orphan_rule",
            properties: {
              type: "egress",
              from_port: 0,
              to_port: 0,
              protocol: "-1"
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toMatch(/Security Group Rule requires a security group/i);
    });
  });

  // ===========================================================================
  // Test 6: Load Balancer → Listener hierarchy
  // ===========================================================================
  describe("Load Balancer to Listener Relationship", () => {
    it("should wire load_balancer_arn when Listener is inside Load Balancer", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lb1",
            provider: "aws",
            category: "networking",
            type: "aws_lb",
            name: "app_lb",
            properties: {
              name: "app-lb",
              load_balancer_type: "application"
            },
          },
          {
            id: "listener1",
            provider: "aws",
            category: "networking",
            type: "aws_lb_listener",
            name: "http_listener",
            parentId: "lb1",
            properties: {
              port: 80,
              protocol: "HTTP"
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_lb" "app_lb"');
      expect(result.mainTf).toContain('resource "aws_lb_listener" "http_listener"');
      expect(result.mainTf).toContain("load_balancer_arn = aws_lb.app_lb.arn");
    });

    it("should wire listener_arn when Listener Rule is inside Listener", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "lb1",
            provider: "aws",
            category: "networking",
            type: "aws_lb",
            name: "api_lb",
            properties: { name: "api-lb" },
          },
          {
            id: "listener1",
            provider: "aws",
            category: "networking",
            type: "aws_lb_listener",
            name: "https_listener",
            parentId: "lb1",
            properties: {
              port: 443,
              protocol: "HTTPS"
            },
          },
          {
            id: "rule1",
            provider: "aws",
            category: "networking",
            type: "aws_lb_listener_rule",
            name: "api_rule",
            parentId: "listener1",
            properties: {
              priority: 100
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_lb_listener_rule" "api_rule"');
      expect(result.mainTf).toContain("listener_arn = aws_lb_listener.https_listener.arn");
    });
  });

  // ===========================================================================
  // Test 7: Route53 Record → Load Balancer alias configuration
  // ===========================================================================
  describe("Route53 Record to Load Balancer Alias", () => {
    it("should create alias block when Route53 Record routes to Load Balancer", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "zone1",
            provider: "aws",
            category: "networking",
            type: "aws_route53_zone",
            name: "main_zone",
            properties: {
              name: "example.com"
            },
          },
          {
            id: "lb1",
            provider: "aws",
            category: "networking",
            type: "aws_lb",
            name: "web_lb",
            properties: {
              name: "web-lb"
            },
          },
          {
            id: "record1",
            provider: "aws",
            category: "networking",
            type: "aws_route53_record",
            name: "www_record",
            parentId: "zone1",
            properties: {
              name: "www.example.com",
              type: "A"
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "record1",
            to: "lb1",
            kind: "route",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_route53_record" "www_record"');
      // Check for alias block configuration
      expect(result.mainTf).toMatch(/alias\s*{/);
      expect(result.mainTf).toContain("name = aws_lb.web_lb.dns_name");
      expect(result.mainTf).toContain("zone_id = aws_lb.web_lb.zone_id");
      expect(result.mainTf).toContain("evaluate_target_health = true");
    });
  });

  // ===========================================================================
  // Test 8: VPC Peering Connection bidirectional
  // ===========================================================================
  describe("VPC Peering Connection", () => {
    it("should wire both VPCs for peering connection", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc_a",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "vpc2",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc_b",
            properties: { cidr_block: "10.1.0.0/16" },
          },
          {
            id: "peering1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc_peering_connection",
            name: "vpc_peer",
            properties: {
              auto_accept: true
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "peering1",
            to: "vpc1",
            kind: "peer",
          },
          {
            id: "edge2",
            from: "peering1",
            to: "vpc2",
            kind: "peer",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_vpc_peering_connection" "vpc_peer"');
      // Should have peer_vpc_id set (bidirectional edge)
      expect(result.mainTf).toMatch(/peer_vpc_id\s*=\s*aws_vpc\.(vpc_a|vpc_b)\.id/);
    });
  });

  // ===========================================================================
  // Test 9: VPN Connection between Customer Gateway and VPN Gateway
  // ===========================================================================
  describe("VPN Connection", () => {
    it("should wire customer_gateway_id and vpn_gateway_id via edges", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "vgw1",
            provider: "aws",
            category: "networking",
            type: "aws_vpn_gateway",
            name: "vpn_gw",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "cgw1",
            provider: "aws",
            category: "networking",
            type: "aws_customer_gateway",
            name: "customer_gw",
            properties: {
              bgp_asn: "65000",
              type: "ipsec.1",
              ip_address: "203.0.113.1"
            },
          },
          {
            id: "vpn1",
            provider: "aws",
            category: "networking",
            type: "aws_vpn_connection",
            name: "vpn_conn",
            properties: {
              type: "ipsec.1"
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "vpn1",
            to: "cgw1",
            kind: "connect",
          },
          {
            id: "edge2",
            from: "vpn1",
            to: "vgw1",
            kind: "connect",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_vpn_connection" "vpn_conn"');
      expect(result.mainTf).toContain("customer_gateway_id = aws_customer_gateway.customer_gw.id");
      expect(result.mainTf).toContain("vpn_gateway_id = aws_vpn_gateway.vpn_gw.id");
    });
  });

  // ===========================================================================
  // Test 10: Transit Gateway VPC Attachment
  // ===========================================================================
  describe("Transit Gateway VPC Attachment", () => {
    it("should wire transit_gateway_id and vpc_id via edges", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "tgw1",
            provider: "aws",
            category: "networking",
            type: "aws_ec2_transit_gateway",
            name: "main_tgw",
            properties: {
              description: "Main Transit Gateway"
            },
          },
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "app_vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "tgw_subnet",
            parentId: "vpc1",
            properties: { cidr_block: "10.0.1.0/24" },
          },
          {
            id: "attach1",
            provider: "aws",
            category: "networking",
            type: "aws_ec2_transit_gateway_vpc_attachment",
            name: "tgw_attach",
            properties: {
              subnet_ids: ["subnet-123"]
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            from: "attach1",
            to: "vpc1",
            kind: "attach",
          },
          {
            id: "edge2",
            from: "attach1",
            to: "tgw1",
            kind: "attach",
          },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      expect(result.mainTf).toContain('resource "aws_ec2_transit_gateway_vpc_attachment" "tgw_attach"');
      expect(result.mainTf).toContain("vpc_id = aws_vpc.app_vpc.id");
      expect(result.mainTf).toContain("transit_gateway_id = aws_ec2_transit_gateway.main_tgw.id");
    });
  });

  // ===========================================================================
  // Test 11: Unsupported edge returns ERROR diagnostic with edgeId
  // ===========================================================================
  describe("Unsupported Edge Connections", () => {
    it("should return ERROR when connecting incompatible networking resources", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "zone1",
            provider: "aws",
            category: "networking",
            type: "aws_route53_zone",
            name: "zone",
            properties: { name: "example.com" },
          },
          {
            id: "sg1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group",
            name: "sg",
            properties: { name: "sg" },
          },
        ],
        edges: [
          {
            id: "invalid_edge",
            from: "zone1",
            to: "sg1",
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
    });

    it("should return ERROR for wrong edge kind", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "subnet",
            properties: { cidr_block: "10.0.1.0/24" },
          },
        ],
        edges: [
          {
            id: "wrong_kind_edge",
            from: "subnet1",
            to: "vpc1",
            kind: "route", // wrong kind, should be 'attach'
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
            id: "cf1",
            provider: "aws",
            category: "networking",
            type: "aws_cloudfront_distribution",
            name: "cdn",
            properties: { enabled: true },
          },
          {
            id: "nat1",
            provider: "aws",
            category: "networking",
            type: "aws_nat_gateway",
            name: "nat",
            properties: {},
          },
        ],
        edges: [
          {
            id: "nonsense_edge",
            from: "cf1",
            to: "nat1",
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
  describe("Complex Multi-Resource Networking Scenarios", () => {
    it("should handle complete VPC setup with subnets, route tables, and internet gateway", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "main_vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "subnet1",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "public_subnet_1",
            parentId: "vpc1",
            properties: { cidr_block: "10.0.1.0/24" },
          },
          {
            id: "subnet2",
            provider: "aws",
            category: "networking",
            type: "aws_subnet",
            name: "private_subnet_1",
            parentId: "vpc1",
            properties: { cidr_block: "10.0.10.0/24" },
          },
          {
            id: "igw1",
            provider: "aws",
            category: "networking",
            type: "aws_internet_gateway",
            name: "main_igw",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "nat1",
            provider: "aws",
            category: "networking",
            type: "aws_nat_gateway",
            name: "nat_gw",
            parentId: "subnet1",
            properties: {},
          },
          {
            id: "rt_public",
            provider: "aws",
            category: "networking",
            type: "aws_route_table",
            name: "public_rt",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "rt_private",
            provider: "aws",
            category: "networking",
            type: "aws_route_table",
            name: "private_rt",
            parentId: "vpc1",
            properties: {},
          },
          {
            id: "route_public",
            provider: "aws",
            category: "networking",
            type: "aws_route",
            name: "public_internet",
            parentId: "rt_public",
            properties: { destination_cidr_block: "0.0.0.0/0" },
          },
          {
            id: "route_private",
            provider: "aws",
            category: "networking",
            type: "aws_route",
            name: "private_nat",
            parentId: "rt_private",
            properties: { destination_cidr_block: "0.0.0.0/0" },
          },
        ],
        edges: [
          { id: "e1", from: "route_public", to: "igw1", kind: "route" },
          { id: "e2", from: "route_private", to: "nat1", kind: "route" },
          { id: "e3", from: "rt_public", to: "subnet1", kind: "associate" },
          { id: "e4", from: "rt_private", to: "subnet2", kind: "associate" },
        ],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Verify all resources are present
      expect(result.mainTf).toContain('resource "aws_vpc" "main_vpc"');
      expect(result.mainTf).toContain('resource "aws_subnet" "public_subnet_1"');
      expect(result.mainTf).toContain('resource "aws_subnet" "private_subnet_1"');
      expect(result.mainTf).toContain('resource "aws_internet_gateway" "main_igw"');
      expect(result.mainTf).toContain('resource "aws_nat_gateway" "nat_gw"');
      expect(result.mainTf).toContain('resource "aws_route_table" "public_rt"');
      expect(result.mainTf).toContain('resource "aws_route_table" "private_rt"');
      expect(result.mainTf).toContain('resource "aws_route" "public_internet"');
      expect(result.mainTf).toContain('resource "aws_route" "private_nat"');

      // Verify route table associations
      const associationMatches = result.mainTf.match(/resource "aws_route_table_association"/g);
      expect(associationMatches).toHaveLength(2);

      // Verify routes
      expect(result.mainTf).toContain("gateway_id = aws_internet_gateway.main_igw.id");
      expect(result.mainTf).toContain("nat_gateway_id = aws_nat_gateway.nat_gw.id");
    });

    it("should handle load balancer with listeners and target groups", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "app_vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "tg1",
            provider: "aws",
            category: "networking",
            type: "aws_lb_target_group",
            name: "web_tg",
            parentId: "vpc1",
            properties: {
              name: "web-tg",
              port: 80,
              protocol: "HTTP"
            },
          },
          {
            id: "lb1",
            provider: "aws",
            category: "networking",
            type: "aws_lb",
            name: "web_lb",
            properties: { name: "web-lb" },
          },
          {
            id: "listener1",
            provider: "aws",
            category: "networking",
            type: "aws_lb_listener",
            name: "http_listener",
            parentId: "lb1",
            properties: {
              port: 80,
              protocol: "HTTP"
            },
          },
          {
            id: "listener2",
            provider: "aws",
            category: "networking",
            type: "aws_lb_listener",
            name: "https_listener",
            parentId: "lb1",
            properties: {
              port: 443,
              protocol: "HTTPS"
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // Both listeners should reference the same load balancer
      const listenerMatches = result.mainTf.match(/load_balancer_arn = aws_lb\.web_lb\.arn/g);
      expect(listenerMatches).toHaveLength(2);

      // Target group should have VPC
      expect(result.mainTf).toContain("vpc_id = aws_vpc.app_vpc.id");
    });

    it("should handle security groups with multiple rules", () => {
      const diagram: Diagram = {
        nodes: [
          {
            id: "vpc1",
            provider: "aws",
            category: "networking",
            type: "aws_vpc",
            name: "vpc",
            properties: { cidr_block: "10.0.0.0/16" },
          },
          {
            id: "sg1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group",
            name: "web_sg",
            parentId: "vpc1",
            properties: { name: "web_sg" },
          },
          {
            id: "rule1",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "http",
            parentId: "sg1",
            properties: {
              type: "ingress",
              from_port: 80,
              to_port: 80,
              protocol: "tcp"
            },
          },
          {
            id: "rule2",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "https",
            parentId: "sg1",
            properties: {
              type: "ingress",
              from_port: 443,
              to_port: 443,
              protocol: "tcp"
            },
          },
          {
            id: "rule3",
            provider: "aws",
            category: "networking",
            type: "aws_security_group_rule",
            name: "egress_all",
            parentId: "sg1",
            properties: {
              type: "egress",
              from_port: 0,
              to_port: 0,
              protocol: "-1"
            },
          },
        ],
        edges: [],
      };

      const result = generator.generate(diagram);

      const errors = result.diagnostics.filter((d) => d.level === "error");
      expect(errors).toHaveLength(0);

      // All three rules should reference the same security group
      const ruleMatches = result.mainTf.match(/security_group_id = aws_security_group\.web_sg\.id/g);
      expect(ruleMatches).toHaveLength(3);
    });
  });
});
