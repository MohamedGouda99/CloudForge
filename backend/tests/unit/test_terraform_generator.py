"""
Unit tests for Terraform generators.
"""
import pytest
from unittest.mock import MagicMock, patch

from app.services.terraform.generators.aws import AWSGenerator
from app.services.terraform.generators.azure import AzureGenerator
from app.services.terraform.generators.gcp import GCPGenerator
from app.services.terraform.factory import GeneratorFactory
from app.models import CloudProvider


class TestAWSGenerator:
    """Test suite for AWS Terraform generator."""

    def test_aws_generator_initialization(self):
        """Test AWS generator initializes correctly."""
        generator = AWSGenerator()
        assert generator.provider_name == "aws"
        assert len(generator.supported_resource_types) > 0

    def test_aws_supports_vpc(self):
        """Test AWS generator supports VPC resource."""
        generator = AWSGenerator()
        assert "aws_vpc" in generator.supported_resource_types

    def test_aws_supports_ec2(self):
        """Test AWS generator supports EC2 instance."""
        generator = AWSGenerator()
        assert "aws_instance" in generator.supported_resource_types

    def test_aws_supports_s3(self):
        """Test AWS generator supports S3 bucket."""
        generator = AWSGenerator()
        assert "aws_s3_bucket" in generator.supported_resource_types

    def test_aws_supports_rds(self):
        """Test AWS generator supports RDS instance."""
        generator = AWSGenerator()
        assert "aws_db_instance" in generator.supported_resource_types

    def test_aws_supports_lambda(self):
        """Test AWS generator supports Lambda function."""
        generator = AWSGenerator()
        assert "aws_lambda_function" in generator.supported_resource_types

    def test_aws_supports_security_group(self):
        """Test AWS generator supports security groups."""
        generator = AWSGenerator()
        assert "aws_security_group" in generator.supported_resource_types

    def test_aws_list_type_fields(self):
        """Test AWS generator has correct list type fields."""
        generator = AWSGenerator()
        assert "vpc_security_group_ids" in generator.LIST_TYPE_FIELDS
        assert "subnet_ids" in generator.LIST_TYPE_FIELDS
        assert "security_groups" in generator.LIST_TYPE_FIELDS


class TestAzureGenerator:
    """Test suite for Azure Terraform generator."""

    def test_azure_generator_initialization(self):
        """Test Azure generator initializes correctly."""
        generator = AzureGenerator()
        assert generator.provider_name == "azurerm"
        assert len(generator.supported_resource_types) > 0

    def test_azure_supports_vnet(self):
        """Test Azure generator supports virtual network."""
        generator = AzureGenerator()
        assert "azurerm_virtual_network" in generator.supported_resource_types

    def test_azure_supports_vm(self):
        """Test Azure generator supports virtual machine."""
        generator = AzureGenerator()
        assert "azurerm_linux_virtual_machine" in generator.supported_resource_types or \
               "azurerm_virtual_machine" in generator.supported_resource_types

    def test_azure_supports_storage(self):
        """Test Azure generator supports storage account."""
        generator = AzureGenerator()
        assert "azurerm_storage_account" in generator.supported_resource_types


class TestGCPGenerator:
    """Test suite for GCP Terraform generator."""

    def test_gcp_generator_initialization(self):
        """Test GCP generator initializes correctly."""
        generator = GCPGenerator()
        assert generator.provider_name == "google"
        assert len(generator.supported_resource_types) > 0

    def test_gcp_supports_vpc(self):
        """Test GCP generator supports VPC network."""
        generator = GCPGenerator()
        assert "google_compute_network" in generator.supported_resource_types

    def test_gcp_supports_instance(self):
        """Test GCP generator supports compute instance."""
        generator = GCPGenerator()
        assert "google_compute_instance" in generator.supported_resource_types

    def test_gcp_supports_gcs(self):
        """Test GCP generator supports Cloud Storage bucket."""
        generator = GCPGenerator()
        assert "google_storage_bucket" in generator.supported_resource_types


class TestGeneratorFactory:
    """Test suite for Terraform generator factory."""

    def test_factory_returns_aws_generator(self):
        """Test factory returns AWS generator for aws provider."""
        generator = GeneratorFactory.get_generator(CloudProvider.AWS)
        assert isinstance(generator, AWSGenerator)

    def test_factory_returns_azure_generator(self):
        """Test factory returns Azure generator for azure provider."""
        generator = GeneratorFactory.get_generator(CloudProvider.AZURE)
        assert isinstance(generator, AzureGenerator)

    def test_factory_returns_gcp_generator(self):
        """Test factory returns GCP generator for gcp provider."""
        generator = GeneratorFactory.get_generator(CloudProvider.GCP)
        assert isinstance(generator, GCPGenerator)

    def test_factory_raises_for_invalid_provider(self):
        """Test factory raises exception for invalid provider."""
        with pytest.raises((ValueError, KeyError)):
            GeneratorFactory.get_generator("invalid_provider")

    def test_factory_supported_providers(self):
        """Test factory reports supported providers."""
        supported = GeneratorFactory.get_supported_providers()
        assert CloudProvider.AWS in supported
        assert CloudProvider.AZURE in supported
        assert CloudProvider.GCP in supported


class TestGeneratorBlocks:
    """Test suite for generator block generation."""

    def test_aws_generates_terraform_block(self):
        """Test AWS generator creates terraform block."""
        generator = AWSGenerator()
        result = generator.generate_terraform_block()
        assert result is not None
        assert "terraform" in result or "required_providers" in result

    def test_aws_generates_provider_block(self):
        """Test AWS generator creates provider block."""
        generator = AWSGenerator()
        result = generator.generate_provider_block()
        assert result is not None
        assert "provider" in result or "aws" in result

    def test_azure_generates_terraform_block(self):
        """Test Azure generator creates terraform block."""
        generator = AzureGenerator()
        result = generator.generate_terraform_block()
        assert result is not None

    def test_azure_generates_provider_block(self):
        """Test Azure generator creates provider block."""
        generator = AzureGenerator()
        result = generator.generate_provider_block()
        assert result is not None

    def test_gcp_generates_terraform_block(self):
        """Test GCP generator creates terraform block."""
        generator = GCPGenerator()
        result = generator.generate_terraform_block()
        assert result is not None

    def test_gcp_generates_provider_block(self):
        """Test GCP generator creates provider block."""
        generator = GCPGenerator()
        result = generator.generate_provider_block()
        assert result is not None


class TestGeneratorValidation:
    """Test suite for generator validation methods."""

    def test_aws_validates_known_type(self):
        """Test AWS generator validates known resource type."""
        generator = AWSGenerator()
        # is_supported should return True for aws_vpc
        assert "aws_vpc" in generator.supported_resource_types

    def test_aws_rejects_unknown_type(self):
        """Test AWS generator rejects unknown resource type."""
        generator = AWSGenerator()
        assert "nonexistent_resource" not in generator.supported_resource_types

    def test_azure_validates_known_type(self):
        """Test Azure generator validates known resource type."""
        generator = AzureGenerator()
        assert "azurerm_virtual_network" in generator.supported_resource_types

    def test_gcp_validates_known_type(self):
        """Test GCP generator validates known resource type."""
        generator = GCPGenerator()
        assert "google_compute_network" in generator.supported_resource_types
