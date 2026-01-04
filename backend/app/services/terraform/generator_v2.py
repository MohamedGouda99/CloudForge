"""
Terraform Generator V2 - Refactored Architecture.

This module uses the new OOP architecture with:
- Abstract base classes (Strategy Pattern)
- Factory pattern for provider selection
- Centralized configuration
- Separated concerns (formatters, generators, config)

This is the main entry point for Terraform generation.
"""

from typing import Dict, List, Any, Optional
import re
from app.models import Resource, Project, CloudProvider
from app.services.terraform.factory import get_generator
from app.services.terraform.config import (
    PROVIDER_CONFIGS,
    DEFAULTS,
    VariableConfig,
    OUTPUT_CONFIGS,
    LOGICAL_ONLY_TYPES,
)
from app.services.terraform.formatters import (
    HCLFormatter,
    VariableFormatter,
    OutputFormatter,
)


class VariableCollector:
    """
    Collects hardcoded values that should become Terraform variables.

    Implements intelligent variable extraction:
    - References (aws_*.*.*, var.*, data.*) -> NO variable needed
    - Hardcoded values (literal strings, numbers) -> CREATE a variable
    """

    def __init__(self, region: Optional[str] = None):
        self.variables: Dict[str, Dict[str, Any]] = {}
        self._seen_names: set = set()
        self._region = region

    def derive_availability_zone(self, original_az: str) -> str:
        """Derive availability zone from configured region."""
        if not self._region or not original_az:
            return original_az

        az_match = re.match(r'^(.+?)([a-z])$', original_az.strip())
        if az_match:
            az_suffix = az_match.group(2)
            return f"{self._region}{az_suffix}"

        return f"{self._region}a"

    def is_reference(self, value: Any) -> bool:
        """Check if a value is a Terraform reference."""
        if not isinstance(value, str):
            return False

        value = value.strip()
        for prefix in VariableConfig.REFERENCE_PREFIXES:
            if value.startswith(prefix):
                return True
        return False

    def should_create_variable(self, field_name: str, value: Any, resource_type: str) -> bool:
        """Determine if a field should have a variable created."""
        if field_name in VariableConfig.NEVER_VARIABLE:
            return False
        if self.is_reference(value):
            return False
        if value is None or value == '' or value is False:
            return False
        if field_name in VariableConfig.ALWAYS_VARIABLE:
            return True
        if isinstance(value, str) and value.strip():
            return True
        if isinstance(value, (int, float)) and field_name not in {'from_port', 'to_port'}:
            return True
        return False

    def add_variable(
        self,
        resource_type: str,
        resource_name: str,
        field_name: str,
        value: Any,
        description: Optional[str] = None
    ) -> str:
        """Add a variable and return the var.xxx reference."""
        if field_name == 'availability_zone' and isinstance(value, str):
            value = self.derive_availability_zone(value)

        clean_resource = self._sanitize_name(resource_name)
        var_name = f"{clean_resource}_{field_name}"

        original_name = var_name
        counter = 1
        while var_name in self._seen_names:
            var_name = f"{original_name}_{counter}"
            counter += 1

        self._seen_names.add(var_name)

        # Determine type
        if isinstance(value, bool):
            var_type = "bool"
        elif isinstance(value, int):
            var_type = "number"
        elif isinstance(value, float):
            var_type = "number"
        elif isinstance(value, list):
            var_type = "list(string)"
        else:
            var_type = "string"

        self.variables[var_name] = {
            'value': value,
            'type': var_type,
            'description': description or f"{field_name} for {resource_name}",
            'resource_type': resource_type,
            'field_name': field_name,
        }

        return f"var.{var_name}"

    def _sanitize_name(self, name: str) -> str:
        """Sanitize a name for use in variable names."""
        cleaned = re.sub(r'[^a-zA-Z0-9]', '_', name.strip())
        cleaned = re.sub(r'_+', '_', cleaned).strip('_').lower()
        return cleaned or "resource"

    def generate_variables_tf(self) -> str:
        """Generate variables.tf content."""
        if not self.variables:
            return "# No variables defined"

        lines = []
        for var_name, info in sorted(self.variables.items()):
            var_def = VariableFormatter.format_variable_definition(
                name=var_name,
                var_type=info['type'],
                description=info['description'],
                default=info['value']
            )
            lines.append(var_def)
            lines.append('')

        return '\n'.join(lines)

    def generate_tfvars(self) -> str:
        """Generate terraform.tfvars content."""
        if not self.variables:
            return "# No variables to configure"

        lines = []
        for var_name, info in sorted(self.variables.items()):
            entry = VariableFormatter.format_tfvars_entry(
                var_name, info['value'], info['type']
            )
            lines.append(entry)

        return '\n'.join(lines)


class TerraformGeneratorV2:
    """
    Refactored Terraform Generator using OOP best practices.

    Uses:
    - Factory pattern for provider-specific generators
    - Strategy pattern for different cloud providers
    - Centralized configuration
    - Single Responsibility Principle
    """

    def generate_terraform(
        self,
        project: Project,
        resources: List[Resource],
        region_config: Optional[Dict[str, str]] = None
    ) -> Dict[str, str]:
        """
        Generate complete Terraform configuration.

        Args:
            project: Project model with cloud provider info
            resources: List of resources to generate
            region_config: Optional region overrides

        Returns:
            Dict of filename -> content for all Terraform files
        """
        region_config = region_config or {}

        # Get the appropriate generator for this provider
        provider_generator = get_generator(project.cloud_provider)

        # Determine configured region
        provider_config = PROVIDER_CONFIGS.get(project.cloud_provider)
        configured_region = None
        if provider_config:
            region_var = provider_config.region_variable
            configured_region = region_config.get(region_var, provider_config.default_region)

        # Check for custom endpoint (LocalStack)
        use_custom_endpoint = bool(region_config.get('aws_endpoint_url'))

        # Create variable collector
        var_collector = VariableCollector(region=configured_region)

        # Build resource context
        context = self._build_resource_context(resources, project.cloud_provider)

        # Generate resources
        main_body = self._generate_all_resources(
            resources, provider_generator, context, var_collector
        )

        # Generate provider blocks
        terraform_block = provider_generator.generate_terraform_block()
        provider_block = provider_generator.generate_provider_block(use_custom_endpoint)

        # Add provider-specific variables
        self._add_provider_variables(project.cloud_provider, var_collector, region_config)

        # Generate outputs
        outputs_config = self._generate_outputs(resources)

        # Generate variables and tfvars
        variables_config = var_collector.generate_variables_tf()
        tfvars_config = var_collector.generate_tfvars()

        return {
            "providers.tf": terraform_block + "\n" + provider_block,
            "main.tf": main_body or "# No resources defined\n# Add resources from the canvas",
            "variables.tf": variables_config,
            "outputs.tf": outputs_config,
            "terraform.tfvars": tfvars_config,
        }

    def _generate_all_resources(
        self,
        resources: List[Resource],
        provider_generator,
        context: Dict[str, Any],
        var_collector: VariableCollector
    ) -> str:
        """Generate all resources using the provider generator."""
        blocks: List[str] = []

        # Generate data sources
        data_sources = provider_generator.generate_data_sources(context)
        blocks.extend(data_sources)

        # Generate each resource
        for resource in resources:
            if self._should_skip_resource(resource.resource_type):
                continue

            resource_block = provider_generator.generate_resource(
                resource, context, var_collector
            )
            if resource_block:
                blocks.append(resource_block)

        # Generate IAM resources
        iam_blocks = provider_generator.generate_iam_resources(context)
        blocks.extend(iam_blocks)

        return "\n\n".join(blocks)

    def _should_skip_resource(self, resource_type: str) -> bool:
        """Check if resource should be skipped in generation."""
        return (
            resource_type in LOGICAL_ONLY_TYPES or
            resource_type.endswith("_container")
        )

    def _build_resource_context(
        self,
        resources: List[Resource],
        cloud_provider: CloudProvider
    ) -> Dict[str, Any]:
        """Build context for cross-resource references."""
        context: Dict[str, Any] = {
            "aws": {"availability_zones": {}, "availability_zone_lookup": {}},
            "lambda_iam_roles": [],
            "ami_data_sources": [],
        }

        if cloud_provider != CloudProvider.AWS:
            return context

        # Process availability zones
        for resource in resources:
            if resource.resource_type != "aws_availability_zone":
                continue

            config = resource.config or {}
            zone_name = (
                config.get("availability_zone") or
                config.get("zone_name") or
                config.get("name") or
                resource.resource_name
            )

            if not isinstance(zone_name, str) or not zone_name.strip():
                continue

            identifier = self._sanitize_identifier(
                resource.resource_name or zone_name, prefix="az"
            )

            zone_entry = {"name": zone_name.strip()}
            state = config.get("state")
            if isinstance(state, str) and state.strip():
                zone_entry["state"] = state.strip()

            context["aws"]["availability_zones"][identifier] = zone_entry

            # Build lookup table
            for key in [zone_name, zone_name.lower(), resource.resource_name]:
                if key:
                    context["aws"]["availability_zone_lookup"][key.lower()] = identifier

        return context

    def _sanitize_identifier(self, value: str, prefix: str = "id") -> str:
        """Sanitize identifier for Terraform."""
        cleaned = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in value.strip())
        cleaned = cleaned.strip("_")

        if not cleaned:
            cleaned = prefix
        if cleaned[0].isdigit():
            cleaned = f"{prefix}_{cleaned}"

        return cleaned.lower()

    def _add_provider_variables(
        self,
        cloud_provider: CloudProvider,
        var_collector: VariableCollector,
        region_config: Dict[str, str]
    ) -> None:
        """Add provider-specific variables."""
        config = PROVIDER_CONFIGS.get(cloud_provider)
        if not config:
            return

        if cloud_provider == CloudProvider.AWS:
            region = region_config.get('aws_region', config.default_region)
            var_collector.variables['aws_region'] = {
                'value': region,
                'type': 'string',
                'description': 'AWS region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'region',
            }
            var_collector._seen_names.add('aws_region')

        elif cloud_provider == CloudProvider.AZURE:
            location = region_config.get('azure_location', config.default_region)
            var_collector.variables['azure_location'] = {
                'value': location,
                'type': 'string',
                'description': 'Azure region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'location',
            }
            var_collector._seen_names.add('azure_location')

        elif cloud_provider == CloudProvider.GCP:
            region = region_config.get('gcp_region', config.default_region)
            project = region_config.get('gcp_project', 'your-project-id')

            var_collector.variables['gcp_region'] = {
                'value': region,
                'type': 'string',
                'description': 'GCP region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'region',
            }
            var_collector._seen_names.add('gcp_region')

            var_collector.variables['gcp_project'] = {
                'value': project,
                'type': 'string',
                'description': 'GCP project ID',
                'resource_type': 'provider',
                'field_name': 'project',
            }
            var_collector._seen_names.add('gcp_project')

    def _generate_outputs(self, resources: List[Resource]) -> str:
        """Generate outputs.tf content."""
        outputs = []

        for resource in resources:
            resource_type = resource.resource_type
            if resource_type not in OUTPUT_CONFIGS:
                continue

            config = OUTPUT_CONFIGS[resource_type]
            sanitized_name = self._sanitize_identifier(resource.resource_name)

            output = OutputFormatter.format_output(
                name=f"{sanitized_name}_{config['attribute']}",
                value=f"{resource_type}.{sanitized_name}.{config['attribute']}",
                description=f"{config['description']} for {resource.resource_name}"
            )
            outputs.append(output)

        return "\n\n".join(outputs) if outputs else "# No outputs defined"


# Convenience function for backward compatibility
def generate_terraform(
    project: Project,
    resources: List[Resource],
    region_config: Optional[Dict[str, str]] = None
) -> Dict[str, str]:
    """
    Generate Terraform files using the new architecture.

    This is a convenience function for backward compatibility.
    """
    generator = TerraformGeneratorV2()
    return generator.generate_terraform(project, resources, region_config)
