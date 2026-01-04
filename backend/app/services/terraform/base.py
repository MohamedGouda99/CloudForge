"""
Abstract Base Class for Cloud Provider Terraform Generators.

This module defines the contract that all cloud-specific generators must implement.
Following the Strategy Pattern and Open/Closed Principle.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Set
from app.models import Resource


class CloudProviderGenerator(ABC):
    """
    Abstract base class for cloud provider Terraform generators.

    Each cloud provider (AWS, Azure, GCP) implements this interface
    to generate provider-specific Terraform HCL code.

    Design Principles:
    - Single Responsibility: Each generator handles one cloud provider
    - Open/Closed: New providers can be added without modifying existing code
    - Liskov Substitution: All generators can be used interchangeably
    - Interface Segregation: Only essential methods are required
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name (e.g., 'aws', 'azurerm', 'google')."""
        pass

    @property
    @abstractmethod
    def supported_resource_types(self) -> Set[str]:
        """Return set of resource types this generator supports."""
        pass

    @abstractmethod
    def generate_terraform_block(self) -> str:
        """
        Generate the terraform {} block with required providers.

        Returns:
            HCL string for terraform block
        """
        pass

    @abstractmethod
    def generate_provider_block(self, use_custom_endpoint: bool = False) -> str:
        """
        Generate the provider {} configuration block.

        Args:
            use_custom_endpoint: Whether to use custom endpoints (e.g., LocalStack)

        Returns:
            HCL string for provider block
        """
        pass

    @abstractmethod
    def generate_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """
        Generate HCL for a single resource.

        Args:
            resource: The resource model to generate
            context: Context with cross-resource references
            var_collector: Variable collector for intelligent variable extraction

        Returns:
            HCL string for the resource block
        """
        pass

    @abstractmethod
    def generate_data_sources(self, context: Dict[str, Any]) -> List[str]:
        """
        Generate data source blocks.

        Args:
            context: Context with resource metadata

        Returns:
            List of HCL strings for data source blocks
        """
        pass

    @abstractmethod
    def generate_iam_resources(self, context: Dict[str, Any]) -> List[str]:
        """
        Generate IAM/identity resources (roles, policies, service accounts).

        Args:
            context: Context with resource metadata

        Returns:
            List of HCL strings for IAM resources
        """
        pass

    @abstractmethod
    def get_default_region(self) -> str:
        """Return the default region for this provider."""
        pass

    @abstractmethod
    def get_region_variable_name(self) -> str:
        """Return the variable name for region (e.g., 'aws_region', 'azure_location')."""
        pass

    def is_logical_only_type(self, resource_type: str) -> bool:
        """
        Check if a resource type is logical-only (not translated to Terraform).

        Args:
            resource_type: The resource type to check

        Returns:
            True if the resource should be skipped in Terraform generation
        """
        logical_types = {
            "aws_region",
            "aws_availability_zone",
            "azure_resource_group_container",
            "google_project_container",
        }
        return resource_type in logical_types or resource_type.endswith("_container")

    def sanitize_identifier(self, value: str, prefix: str = "id") -> str:
        """
        Convert arbitrary user-provided names into Terraform-safe identifiers.

        Args:
            value: The raw identifier value
            prefix: Prefix to use if identifier starts with a digit

        Returns:
            Sanitized Terraform identifier
        """
        cleaned = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in value.strip())
        cleaned = cleaned.strip("_")

        if not cleaned:
            cleaned = prefix
        if cleaned[0].isdigit():
            cleaned = f"{prefix}_{cleaned}"

        return cleaned.lower()


class ResourceGenerator(ABC):
    """
    Abstract base class for resource-specific generators.

    For complex resources that need custom generation logic,
    implement this interface.
    """

    @property
    @abstractmethod
    def resource_type(self) -> str:
        """Return the resource type this generator handles."""
        pass

    @abstractmethod
    def generate(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """
        Generate HCL for this specific resource type.

        Args:
            resource: The resource to generate
            context: Generation context
            var_collector: Variable collector

        Returns:
            HCL string for the resource
        """
        pass

    @abstractmethod
    def get_outputs(self, resource: Resource) -> List[Dict[str, str]]:
        """
        Get output definitions for this resource.

        Args:
            resource: The resource

        Returns:
            List of output definitions with 'name', 'value', 'description'
        """
        pass
