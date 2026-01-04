"""
Centralized Configuration for Terraform Generation.

This module contains all configuration constants, default values,
and type mappings used across the terraform generation system.

Single Source of Truth - No magic strings scattered throughout the codebase.
"""

from enum import Enum
from typing import Dict, Set, Any, FrozenSet
from dataclasses import dataclass, field


class CloudProvider(str, Enum):
    """Supported cloud providers."""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"


@dataclass(frozen=True)
class ProviderConfig:
    """Configuration for a cloud provider."""
    name: str
    terraform_provider: str
    default_region: str
    region_variable: str
    provider_version: str
    provider_source: str


# Provider configurations
PROVIDER_CONFIGS: Dict[CloudProvider, ProviderConfig] = {
    CloudProvider.AWS: ProviderConfig(
        name="AWS",
        terraform_provider="aws",
        default_region="us-east-1",
        region_variable="aws_region",
        provider_version="~> 5.0",
        provider_source="hashicorp/aws",
    ),
    CloudProvider.AZURE: ProviderConfig(
        name="Azure",
        terraform_provider="azurerm",
        default_region="eastus",
        region_variable="azure_location",
        provider_version="~> 3.0",
        provider_source="hashicorp/azurerm",
    ),
    CloudProvider.GCP: ProviderConfig(
        name="GCP",
        terraform_provider="google",
        default_region="us-central1",
        region_variable="gcp_region",
        provider_version="~> 5.0",
        provider_source="hashicorp/google",
    ),
}


@dataclass(frozen=True)
class TerraformDefaults:
    """Default values for Terraform generation."""

    # Networking defaults
    DEFAULT_VPC_CIDR: str = "10.0.0.0/16"
    DEFAULT_SUBNET_CIDR: str = "10.0.1.0/24"
    DEFAULT_SECURITY_GROUP_EGRESS_CIDR: str = "0.0.0.0/0"

    # Compute defaults
    DEFAULT_AWS_INSTANCE_TYPE: str = "t3.micro"
    DEFAULT_AZURE_VM_SIZE: str = "Standard_B2s"
    DEFAULT_GCP_MACHINE_TYPE: str = "e2-micro"

    # Database defaults
    DEFAULT_DB_ALLOCATED_STORAGE: int = 20
    DEFAULT_DB_ENGINE: str = "mysql"
    DEFAULT_DB_ENGINE_VERSION: str = "8.0"
    DEFAULT_DB_INSTANCE_CLASS: str = "db.t3.micro"

    # Lambda defaults
    DEFAULT_LAMBDA_RUNTIME: str = "python3.11"
    DEFAULT_LAMBDA_HANDLER: str = "lambda_function.lambda_handler"
    DEFAULT_LAMBDA_MEMORY: int = 128
    DEFAULT_LAMBDA_TIMEOUT: int = 30

    # Version requirements
    TERRAFORM_MIN_VERSION: str = ">= 1.0"


# Singleton instance
DEFAULTS = TerraformDefaults()


class VariableConfig:
    """Configuration for variable extraction."""

    # Fields that should ALWAYS become variables (important config)
    ALWAYS_VARIABLE: FrozenSet[str] = frozenset({
        'cidr_block', 'availability_zone', 'instance_type', 'ami', 'engine',
        'engine_version', 'instance_class', 'allocated_storage', 'db_name',
        'username', 'bucket', 'function_name', 'runtime', 'handler',
        'memory_size', 'timeout', 'machine_type', 'zone', 'image',
        'vm_size', 'location', 'sku', 'tier'
    })

    # Fields that should NEVER become variables (always hardcoded or reference)
    NEVER_VARIABLE: FrozenSet[str] = frozenset({
        'vpc_id', 'subnet_id', 'security_group_ids', 'vpc_security_group_ids',
        'target_group_arn', 'role', 'role_arn', 'iam_instance_profile',
        'key_name', 'kms_key_id', 'network_interface_id', 'allocation_id',
        'gateway_id', 'nat_gateway_id', 'internet_gateway_id', 'route_table_id',
        'db_subnet_group_name', 'parameter_group_name', 'option_group_name',
        'cluster_identifier', 'replication_group_id', 'source_security_group_id'
    })

    # Reference patterns (regex patterns for Terraform references)
    REFERENCE_PREFIXES: FrozenSet[str] = frozenset({
        'aws_', 'azurerm_', 'google_', 'var.', 'data.', 'local.', 'module.', '${'
    })


class ResourceCategories:
    """Resource categorization for organization."""

    NETWORK_PREFIXES: FrozenSet[str] = frozenset({
        'aws_vpc', 'aws_subnet', 'aws_route', 'aws_route_table',
        'azurerm_virtual_network', 'azurerm_subnet',
        'google_compute_network', 'google_compute_subnetwork'
    })

    SECURITY_PREFIXES: FrozenSet[str] = frozenset({
        'aws_security_group', 'aws_wafv2', 'aws_network_acl',
        'azurerm_network_security_group',
        'google_compute_firewall'
    })

    COMPUTE_PREFIXES: FrozenSet[str] = frozenset({
        'aws_instance', 'aws_launch_template', 'aws_autoscaling',
        'azurerm_virtual_machine', 'azurerm_linux_virtual_machine',
        'google_compute_instance'
    })

    STORAGE_PREFIXES: FrozenSet[str] = frozenset({
        'aws_s3', 'aws_efs', 'aws_ebs',
        'azurerm_storage',
        'google_storage_bucket'
    })

    DATABASE_PREFIXES: FrozenSet[str] = frozenset({
        'aws_db', 'aws_rds',
        'azurerm_sql', 'azurerm_cosmosdb',
        'google_sql_database'
    })

    SERVERLESS_PREFIXES: FrozenSet[str] = frozenset({
        'aws_lambda', 'aws_api_gateway',
        'azurerm_function_app',
        'google_cloudfunctions'
    })

    @classmethod
    def categorize(cls, resource_type: str) -> str:
        """Categorize a resource type."""
        for prefix in cls.NETWORK_PREFIXES:
            if resource_type.startswith(prefix):
                return "network"
        for prefix in cls.SECURITY_PREFIXES:
            if resource_type.startswith(prefix):
                return "security"
        for prefix in cls.COMPUTE_PREFIXES:
            if resource_type.startswith(prefix):
                return "compute"
        for prefix in cls.STORAGE_PREFIXES:
            if resource_type.startswith(prefix):
                return "storage"
        for prefix in cls.DATABASE_PREFIXES:
            if resource_type.startswith(prefix):
                return "database"
        for prefix in cls.SERVERLESS_PREFIXES:
            if resource_type.startswith(prefix):
                return "serverless"

        if resource_type.startswith("azure"):
            return "azure"
        if resource_type.startswith(("gcp_", "google_")):
            return "gcp"

        return "other"


# Logical-only resource types (not translated to Terraform)
LOGICAL_ONLY_TYPES: FrozenSet[str] = frozenset({
    "aws_region",
    "aws_availability_zone",
})


# Output configuration for common resource types
OUTPUT_CONFIGS: Dict[str, Dict[str, str]] = {
    "aws_instance": {"attribute": "id", "description": "Instance ID"},
    "aws_vpc": {"attribute": "id", "description": "VPC ID"},
    "aws_subnet": {"attribute": "id", "description": "Subnet ID"},
    "aws_security_group": {"attribute": "id", "description": "Security Group ID"},
    "aws_s3_bucket": {"attribute": "id", "description": "S3 Bucket ID"},
    "aws_internet_gateway": {"attribute": "id", "description": "Internet Gateway ID"},
    "aws_nat_gateway": {"attribute": "id", "description": "NAT Gateway ID"},
    "aws_lambda_function": {"attribute": "arn", "description": "Lambda ARN"},
    "aws_db_instance": {"attribute": "endpoint", "description": "RDS Endpoint"},

    "azurerm_virtual_machine": {"attribute": "id", "description": "VM ID"},
    "azurerm_linux_virtual_machine": {"attribute": "id", "description": "VM ID"},
    "azurerm_virtual_network": {"attribute": "id", "description": "VNet ID"},
    "azurerm_storage_account": {"attribute": "id", "description": "Storage Account ID"},

    "google_compute_instance": {"attribute": "id", "description": "Instance ID"},
    "google_compute_network": {"attribute": "id", "description": "Network ID"},
    "google_storage_bucket": {"attribute": "name", "description": "Bucket Name"},
}
