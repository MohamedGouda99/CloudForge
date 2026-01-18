"""
Schema Loader for Unified Resource Catalog

Loads JSON schemas from the shared resource-catalog package at startup.
Provides resource definitions to the backend for HCL generation and validation.
Supports multiple cloud providers: AWS, GCP, Azure.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Literal

logger = logging.getLogger(__name__)

# Supported cloud providers
CloudProvider = Literal["aws", "gcp", "azure"]
SUPPORTED_PROVIDERS: List[CloudProvider] = ["aws", "gcp", "azure"]


class SchemaLoader:
    """
    Singleton class to load and cache resource schemas from the shared catalog.
    Supports multiple cloud providers (AWS, GCP, Azure).
    """

    _instance: Optional["SchemaLoader"] = None
    _schemas: Dict[str, Dict[str, Any]] = {}
    _resources_by_type: Dict[str, Dict[str, Any]] = {}
    _resources_by_provider: Dict[str, List[Dict[str, Any]]] = {}
    _initialized: bool = False

    def __new__(cls) -> "SchemaLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_instance(cls) -> "SchemaLoader":
        """Get or create the singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        if not cls._instance._initialized:
            cls._instance._load_schemas()
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance (useful for testing)."""
        cls._instance = None
        cls._schemas = {}
        cls._resources_by_type = {}
        cls._resources_by_provider = {}
        cls._initialized = False

    def _get_schema_paths(self) -> Dict[str, List[Path]]:
        """
        Get paths to schema JSON files organized by provider.

        Returns:
            Dict mapping provider name to list of schema paths
        """
        base_path = Path(__file__).parent.parent.parent.parent.parent
        result: Dict[str, List[Path]] = {}

        for provider in SUPPORTED_PROVIDERS:
            provider_schema_dir = base_path / "shared" / "resource-catalog" / "dist" / "schemas" / provider

            if provider_schema_dir.exists():
                result[provider] = list(provider_schema_dir.glob("*.schema.json"))
            else:
                # Fallback: look for provider-prefixed schemas in main schemas dir
                # Exclude catalog files to avoid duplicates (we load category-specific files)
                schema_dir = base_path / "shared" / "resource-catalog" / "dist" / "schemas"
                if schema_dir.exists():
                    result[provider] = [
                        p for p in schema_dir.glob(f"{provider}-*.schema.json")
                        if "catalog" not in p.name
                    ]
                else:
                    result[provider] = []

        # Also check for legacy AWS schemas without prefix
        legacy_schema_dir = base_path / "shared" / "resource-catalog" / "dist" / "schemas"
        if legacy_schema_dir.exists():
            aws_legacy = list(legacy_schema_dir.glob("aws-*.schema.json"))
            if aws_legacy and "aws" in result:
                result["aws"].extend(aws_legacy)
            # Note: We skip non-prefixed schemas like "all-providers-catalog.schema.json"
            # to avoid loading all providers into a single provider's resource list

        # Deduplicate paths for each provider
        for provider in result:
            result[provider] = list(set(result[provider]))

        for provider, paths in result.items():
            if not paths:
                logger.warning(f"No schema files found for provider: {provider}")
            else:
                logger.debug(f"Found {len(paths)} schema files for provider: {provider}")

        return result

    def _load_schemas(self) -> None:
        """Load all schema JSON files for all providers."""
        schema_paths_by_provider = self._get_schema_paths()

        # Check if any schemas were found
        total_schemas = sum(len(paths) for paths in schema_paths_by_provider.values())
        if total_schemas == 0:
            logger.warning("No schema files found. Using fallback embedded schemas.")
            self._load_fallback_schemas()
            self._initialized = True
            return

        # Initialize provider resource lists
        for provider in SUPPORTED_PROVIDERS:
            self._resources_by_provider[provider] = []

        # Load schemas for each provider
        for provider, schema_paths in schema_paths_by_provider.items():
            for path in schema_paths:
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        schema = json.load(f)
                        # Generate a unique schema key combining provider and category
                        category = path.stem.replace(".schema", "").replace(f"{provider}-", "")
                        schema_key = f"{provider}:{category}"
                        self._schemas[schema_key] = schema

                        # Index resources by terraform_resource for quick lookup
                        for resource in schema.get("resources", []):
                            terraform_resource = resource.get("terraform_resource")
                            if terraform_resource:
                                # Skip if already loaded (avoid duplicates)
                                if terraform_resource in self._resources_by_type:
                                    continue
                                # Add provider info to resource if not present
                                if "provider" not in resource:
                                    resource["provider"] = provider
                                self._resources_by_type[terraform_resource] = resource
                                self._resources_by_provider[provider].append(resource)

                        logger.info(f"Loaded {provider} schema: {path.name} ({len(schema.get('resources', []))} resources)")

                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse schema {path}: {e}")
                except Exception as e:
                    logger.error(f"Failed to load schema {path}: {e}")

        self._initialized = True
        for provider in SUPPORTED_PROVIDERS:
            count = len(self._resources_by_provider.get(provider, []))
            logger.info(f"Provider {provider}: {count} resources loaded")
        logger.info(f"Schema loader initialized with {len(self._resources_by_type)} total resources")

    def _load_fallback_schemas(self) -> None:
        """Load fallback embedded schemas for minimal functionality."""
        # Embedded minimal schema for EC2 and Lambda to ensure basic functionality
        fallback_resources = [
            {
                "id": "ec2_instance",
                "terraform_resource": "aws_instance",
                "name": "EC2 Instance",
                "description": "Virtual server in the AWS cloud",
                "icon": "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg",
                "category": "compute",
                "classification": "icon",
                "inputs": {
                    "required": [
                        {"name": "ami", "type": "string", "description": "AMI ID"},
                        {"name": "instance_type", "type": "string", "description": "Instance type", "default": "t3.micro"},
                    ],
                    "optional": [
                        {"name": "subnet_id", "type": "string", "description": "Subnet ID"},
                        {"name": "vpc_security_group_ids", "type": "list(string)", "description": "Security group IDs"},
                        {"name": "tags", "type": "map(string)", "description": "Tags", "default": {}},
                    ],
                    "blocks": [],
                },
                "outputs": [
                    {"name": "id", "type": "string", "description": "Instance ID"},
                    {"name": "arn", "type": "string", "description": "Instance ARN"},
                    {"name": "public_ip", "type": "string", "description": "Public IP"},
                    {"name": "private_ip", "type": "string", "description": "Private IP"},
                ],
                "terraform": {
                    "resourceType": "aws_instance",
                    "requiredArgs": ["ami", "instance_type"],
                    "referenceableAttrs": {"id": "id", "arn": "arn"},
                },
            },
            {
                "id": "lambda_function",
                "terraform_resource": "aws_lambda_function",
                "name": "Lambda Function",
                "description": "Serverless compute service",
                "icon": "/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg",
                "category": "compute",
                "classification": "icon",
                "inputs": {
                    "required": [
                        {"name": "function_name", "type": "string", "description": "Function name"},
                        {"name": "role", "type": "string", "description": "IAM role ARN"},
                    ],
                    "optional": [
                        {"name": "runtime", "type": "string", "description": "Runtime", "default": "python3.12"},
                        {"name": "handler", "type": "string", "description": "Handler", "default": "index.handler"},
                        {"name": "memory_size", "type": "number", "description": "Memory in MB", "default": 128},
                        {"name": "timeout", "type": "number", "description": "Timeout in seconds", "default": 3},
                        {"name": "tags", "type": "map(string)", "description": "Tags", "default": {}},
                    ],
                    "blocks": [],
                },
                "outputs": [
                    {"name": "arn", "type": "string", "description": "Function ARN"},
                    {"name": "invoke_arn", "type": "string", "description": "Invoke ARN"},
                ],
                "terraform": {
                    "resourceType": "aws_lambda_function",
                    "requiredArgs": ["function_name", "role"],
                    "referenceableAttrs": {"arn": "arn", "function_name": "function_name"},
                },
            },
        ]

        self._schemas["aws:compute"] = {
            "version": "5.x",
            "provider": "aws",
            "category": "compute",
            "resources": fallback_resources,
        }

        # Initialize provider lists
        for provider in SUPPORTED_PROVIDERS:
            self._resources_by_provider[provider] = []

        for resource in fallback_resources:
            resource["provider"] = "aws"
            self._resources_by_type[resource["terraform_resource"]] = resource
            self._resources_by_provider["aws"].append(resource)

    def get_resource(self, terraform_resource: str) -> Optional[Dict[str, Any]]:
        """
        Get a resource definition by Terraform resource type.

        Args:
            terraform_resource: The Terraform resource type (e.g., "aws_instance")

        Returns:
            Resource definition dict or None if not found
        """
        if not self._initialized:
            self._load_schemas()
        return self._resources_by_type.get(terraform_resource)

    def get_all_resources(self, provider: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all resource definitions, optionally filtered by provider.

        Args:
            provider: Optional provider filter ('aws', 'gcp', 'azure')

        Returns:
            List of resource definitions
        """
        if not self._initialized:
            self._load_schemas()

        if provider:
            return self._resources_by_provider.get(provider, [])
        return list(self._resources_by_type.values())

    def get_resources_by_provider(self, provider: str) -> List[Dict[str, Any]]:
        """
        Get all resources for a specific cloud provider.

        Args:
            provider: The cloud provider ('aws', 'gcp', 'azure')

        Returns:
            List of resource definitions for the provider
        """
        if not self._initialized:
            self._load_schemas()
        return self._resources_by_provider.get(provider, [])

    def get_supported_providers(self) -> List[str]:
        """Get list of supported cloud providers."""
        return list(SUPPORTED_PROVIDERS)

    def get_provider_info(self, provider: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata about a cloud provider.

        Args:
            provider: The cloud provider ('aws', 'gcp', 'azure')

        Returns:
            Provider metadata dict or None if not supported
        """
        if provider not in SUPPORTED_PROVIDERS:
            return None

        if not self._initialized:
            self._load_schemas()

        resource_count = len(self._resources_by_provider.get(provider, []))

        provider_names = {
            "aws": ("Amazon Web Services", "AWS"),
            "gcp": ("Google Cloud Platform", "GCP"),
            "azure": ("Microsoft Azure", "Azure"),
        }

        name, short_name = provider_names.get(provider, (provider.upper(), provider.upper()))

        return {
            "id": provider,
            "name": name,
            "shortName": short_name,
            "resourceCount": resource_count,
        }

    def get_all_providers_info(self) -> List[Dict[str, Any]]:
        """Get metadata for all supported providers."""
        return [self.get_provider_info(p) for p in SUPPORTED_PROVIDERS if self.get_provider_info(p)]

    def get_resources_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all resources in a specific category."""
        if not self._initialized:
            self._load_schemas()
        return [r for r in self._resources_by_type.values() if r.get("category") == category]

    def get_resources_by_classification(self, classification: str) -> List[Dict[str, Any]]:
        """Get all resources with a specific classification (icon or container)."""
        if not self._initialized:
            self._load_schemas()
        return [r for r in self._resources_by_type.values() if r.get("classification") == classification]

    def get_container_resources(self) -> List[Dict[str, Any]]:
        """Get all container resources (ECS Cluster, EKS Cluster, etc.)."""
        return self.get_resources_by_classification("container")

    def get_icon_resources(self) -> List[Dict[str, Any]]:
        """Get all icon resources."""
        return self.get_resources_by_classification("icon")

    def get_schema(self, category: str) -> Optional[Dict[str, Any]]:
        """Get a full schema by category."""
        if not self._initialized:
            self._load_schemas()
        return self._schemas.get(category)

    def get_all_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Get all schemas."""
        if not self._initialized:
            self._load_schemas()
        return self._schemas

    def is_container_resource(self, terraform_resource: str) -> bool:
        """Check if a resource type is a container (can contain children)."""
        resource = self.get_resource(terraform_resource)
        return resource.get("classification") == "container" if resource else False

    def get_containment_rules(self, terraform_resource: str) -> Optional[Dict[str, Any]]:
        """
        Get containment rules for a container resource.

        Args:
            terraform_resource: The Terraform resource type (e.g., "aws_vpc")

        Returns:
            Dict with containment information or None if not a container
        """
        resource = self.get_resource(terraform_resource)
        if not resource:
            return None

        if resource.get("classification") != "container":
            return None

        relations = resource.get("relations", {})
        valid_children = relations.get("validChildren", [])

        # Flatten childTypes from all validChildren rules
        child_types = []
        for rule in valid_children:
            child_types.extend(rule.get("childTypes", []))

        return {
            "terraform_resource": terraform_resource,
            "is_container": True,
            "childTypes": child_types,
            "description": valid_children[0].get("description") if valid_children else None,
        }

    def get_valid_child_types(self, terraform_resource: str) -> List[str]:
        """
        Get the list of valid child types for a container resource.

        Args:
            terraform_resource: The Terraform resource type (e.g., "aws_vpc")

        Returns:
            List of terraform resource types that can be children
        """
        rules = self.get_containment_rules(terraform_resource)
        return rules.get("childTypes", []) if rules else []

    def validate_containment(self, container_type: str, child_type: str) -> Dict[str, Any]:
        """
        Validate if a child resource can be placed in a container.

        Args:
            container_type: The container's terraform resource type
            child_type: The child's terraform resource type

        Returns:
            Dict with validation result: {valid: bool, warning?: str, suggestion?: str}
        """
        container = self.get_resource(container_type)
        if not container:
            return {"valid": False, "warning": f"Unknown container type: {container_type}"}

        if container.get("classification") != "container":
            return {"valid": False, "warning": f"{container_type} is not a container resource"}

        valid_children = self.get_valid_child_types(container_type)

        # If no valid children defined, allow with warning
        if not valid_children:
            return {
                "valid": True,
                "warning": f"No containment rules defined for {container_type}. Placement allowed but may be non-standard."
            }

        if child_type in valid_children:
            return {"valid": True}

        # Not in valid children list - allow with warning
        return {
            "valid": True,
            "warning": f"{child_type} is not typically placed in {container_type}",
            "suggestion": f"Valid children for {container_type}: {', '.join(valid_children[:5])}{'...' if len(valid_children) > 5 else ''}"
        }

    def get_containment_auto_wire(self, child_type: str, parent_type: str) -> List[Dict[str, str]]:
        """
        Get auto-wiring rules for when a child is placed in a parent container.

        This looks up the child's containmentRules to find the apply directives
        for the given parent type.

        Args:
            child_type: The child's terraform resource type (e.g., "aws_subnet")
            parent_type: The parent's terraform resource type (e.g., "aws_vpc")

        Returns:
            List of apply directives: [{"setArg": "vpc_id", "toParentAttr": "id"}, ...]
        """
        child = self.get_resource(child_type)
        if not child:
            return []

        relations = child.get("relations", {})
        containment_rules = relations.get("containmentRules", [])

        for rule in containment_rules:
            if rule.get("whenParentResourceType") == parent_type:
                return rule.get("apply", [])

        return []

    def get_all_containment_auto_wires(self) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
        """
        Get all auto-wiring rules organized by parent type then child type.

        Returns:
            Dict like: {
                "aws_vpc": {
                    "aws_subnet": [{"setArg": "vpc_id", "toParentAttr": "id"}],
                    "aws_security_group": [{"setArg": "vpc_id", "toParentAttr": "id"}],
                },
                "aws_subnet": {
                    "aws_instance": [{"setArg": "subnet_id", "toParentAttr": "id"}],
                }
            }
        """
        if not self._initialized:
            self._load_schemas()

        result: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

        for resource in self._resources_by_type.values():
            child_type = resource.get("terraform_resource")
            relations = resource.get("relations", {})
            containment_rules = relations.get("containmentRules", [])

            for rule in containment_rules:
                parent_type = rule.get("whenParentResourceType")
                apply_rules = rule.get("apply", [])

                if parent_type and apply_rules:
                    if parent_type not in result:
                        result[parent_type] = {}
                    result[parent_type][child_type] = apply_rules

        return result

    def get_required_args(self, terraform_resource: str) -> List[str]:
        """Get required arguments for a resource type."""
        resource = self.get_resource(terraform_resource)
        if not resource:
            return []
        return resource.get("terraform", {}).get("requiredArgs", [])

    def get_default_value(self, terraform_resource: str, arg_name: str) -> Any:
        """Get the default value for a resource argument."""
        resource = self.get_resource(terraform_resource)
        if not resource:
            return None

        inputs = resource.get("inputs", {})

        # Check required inputs
        for attr in inputs.get("required", []):
            if attr.get("name") == arg_name:
                return attr.get("default")

        # Check optional inputs
        for attr in inputs.get("optional", []):
            if attr.get("name") == arg_name:
                return attr.get("default")

        return None


# Convenience function for getting the singleton instance
def get_schema_loader() -> SchemaLoader:
    """Get the schema loader singleton instance."""
    return SchemaLoader.get_instance()
