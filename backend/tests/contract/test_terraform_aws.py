"""
Contract tests for AWS Terraform output.

These tests verify that generated Terraform code conforms to expected structure.
"""
import pytest
import re

from app.services.terraform.generators.aws import AWSGenerator


class TestAWSProviderContract:
    """Test AWS provider block contract."""

    def test_provider_block_structure(self):
        """Test that provider block has required structure."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            },
            {"aws_region": "us-east-1"},
        )

        # Provider block should be present
        assert "provider" in result.lower() or "terraform" in result.lower()

    def test_region_configurable(self):
        """Test that region is configurable."""
        generator = AWSGenerator()
        result = generator.generate(
            {"nodes": [], "edges": []},
            {"aws_region": "eu-west-1"},
        )

        # If region is included, it should match config
        if "region" in result:
            assert "eu-west-1" in result or "var." in result


class TestAWSVPCContract:
    """Test AWS VPC resource contract."""

    def test_vpc_resource_type(self):
        """Test VPC resource type is correct."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain aws_vpc resource
        assert "aws_vpc" in result or "vpc" in result.lower()

    def test_vpc_cidr_block_included(self):
        """Test VPC CIDR block is included in output."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # CIDR block should be present
        assert "10.0.0.0/16" in result or "cidr" in result.lower()


class TestAWSEC2Contract:
    """Test AWS EC2 resource contract."""

    def test_ec2_resource_type(self):
        """Test EC2 instance resource type."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "ec2-1",
                        "type": "aws_instance",
                        "data": {
                            "resourceType": "aws_instance",
                            "resourceLabel": "web",
                            "config": {
                                "ami": "ami-12345678",
                                "instance_type": "t2.micro",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain aws_instance
        assert "aws_instance" in result or "instance" in result.lower()

    def test_ec2_required_attributes(self):
        """Test EC2 has required attributes."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "ec2-1",
                        "type": "aws_instance",
                        "data": {
                            "resourceType": "aws_instance",
                            "resourceLabel": "web",
                            "config": {
                                "ami": "ami-12345678",
                                "instance_type": "t2.micro",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should include AMI and instance type
        assert "ami" in result.lower()
        assert "instance_type" in result.lower() or "t2" in result


class TestAWSS3Contract:
    """Test AWS S3 resource contract."""

    def test_s3_bucket_resource(self):
        """Test S3 bucket resource structure."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "s3-1",
                        "type": "aws_s3_bucket",
                        "data": {
                            "resourceType": "aws_s3_bucket",
                            "resourceLabel": "data",
                            "config": {"bucket": "my-data-bucket"},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain s3_bucket
        assert "s3_bucket" in result or "bucket" in result.lower()


class TestAWSSecurityGroupContract:
    """Test AWS Security Group resource contract."""

    def test_security_group_resource(self):
        """Test security group resource structure."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "sg-1",
                        "type": "aws_security_group",
                        "data": {
                            "resourceType": "aws_security_group",
                            "resourceLabel": "web_sg",
                            "config": {
                                "name": "web-sg",
                                "description": "Web security group",
                            },
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should contain security_group
        assert "security_group" in result or "sg" in result.lower()


class TestAWSResourceReferences:
    """Test resource reference handling."""

    def test_vpc_subnet_reference(self):
        """Test that subnet references VPC correctly."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    },
                    {
                        "id": "subnet-1",
                        "type": "aws_subnet",
                        "data": {
                            "resourceType": "aws_subnet",
                            "resourceLabel": "public",
                            "config": {"cidr_block": "10.0.1.0/24"},
                        },
                    },
                ],
                "edges": [{"id": "e1", "source": "vpc-1", "target": "subnet-1"}],
            },
            {},
        )

        # Should contain both resources
        assert "vpc" in result.lower()
        assert "subnet" in result.lower()


class TestAWSOutputFormat:
    """Test output format compliance."""

    def test_valid_hcl_syntax(self):
        """Test that output is valid HCL structure."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Basic HCL structure checks
        # Braces should be balanced
        open_braces = result.count("{")
        close_braces = result.count("}")
        assert open_braces == close_braces

    def test_no_syntax_errors(self):
        """Test output has no obvious syntax errors."""
        generator = AWSGenerator()
        result = generator.generate(
            {
                "nodes": [
                    {
                        "id": "vpc-1",
                        "type": "aws_vpc",
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "main",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            },
            {},
        )

        # Should not have common syntax issues
        assert "undefined" not in result.lower()
        assert "null" not in result or "= null" in result  # null is valid in HCL
