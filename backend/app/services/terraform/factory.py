"""
Generator Factory.

Implements the Factory Pattern for creating cloud provider generators.
This allows for loose coupling between the main generator and specific providers.
"""

from typing import Dict, Type, Optional
from app.services.terraform.base import CloudProviderGenerator
from app.services.terraform.generators.aws import AWSGenerator
from app.services.terraform.generators.azure import AzureGenerator
from app.services.terraform.generators.gcp import GCPGenerator
from app.models import CloudProvider


class GeneratorFactory:
    """
    Factory for creating cloud provider generators.

    Implements the Factory Pattern:
    - Encapsulates object creation
    - Allows adding new providers without modifying existing code
    - Provides a clean API for getting generators

    Usage:
        generator = GeneratorFactory.get_generator(CloudProvider.AWS)
        hcl = generator.generate_resource(resource, context, var_collector)
    """

    # Registry of provider generators
    _generators: Dict[CloudProvider, Type[CloudProviderGenerator]] = {
        CloudProvider.AWS: AWSGenerator,
        CloudProvider.AZURE: AzureGenerator,
        CloudProvider.GCP: GCPGenerator,
    }

    # Cache for generator instances (singleton per provider)
    _instances: Dict[CloudProvider, CloudProviderGenerator] = {}

    @classmethod
    def get_generator(cls, provider: CloudProvider) -> CloudProviderGenerator:
        """
        Get a generator instance for the specified cloud provider.

        Uses singleton pattern to reuse generator instances.

        Args:
            provider: The cloud provider enum value

        Returns:
            CloudProviderGenerator instance for the provider

        Raises:
            ValueError: If the provider is not supported
        """
        if provider not in cls._generators:
            raise ValueError(f"Unsupported cloud provider: {provider}")

        # Return cached instance if available
        if provider not in cls._instances:
            generator_class = cls._generators[provider]
            cls._instances[provider] = generator_class()

        return cls._instances[provider]

    @classmethod
    def register_generator(
        cls,
        provider: CloudProvider,
        generator_class: Type[CloudProviderGenerator]
    ) -> None:
        """
        Register a new generator class for a provider.

        This allows extending the factory with new providers at runtime.

        Args:
            provider: The cloud provider enum value
            generator_class: The generator class to register
        """
        cls._generators[provider] = generator_class
        # Clear cached instance for this provider
        if provider in cls._instances:
            del cls._instances[provider]

    @classmethod
    def clear_cache(cls) -> None:
        """Clear the generator instance cache."""
        cls._instances.clear()

    @classmethod
    def get_supported_providers(cls) -> list:
        """Get list of supported cloud providers."""
        return list(cls._generators.keys())

    @classmethod
    def is_supported(cls, provider: CloudProvider) -> bool:
        """Check if a provider is supported."""
        return provider in cls._generators


def get_generator(provider: CloudProvider) -> CloudProviderGenerator:
    """
    Convenience function to get a generator.

    Args:
        provider: The cloud provider

    Returns:
        CloudProviderGenerator instance
    """
    return GeneratorFactory.get_generator(provider)
