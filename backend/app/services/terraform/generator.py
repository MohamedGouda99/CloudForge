from typing import List, Dict, Any, Tuple, Set
from jinja2 import Environment, FileSystemLoader, Template  # noqa: F401 (Template reserved for future templating)
import os
import re
from app.models import Resource, Project, CloudProvider
from app.services.terraform.value_detector import ValueDetector
from app.services.terraform.schema_driven_generator import get_schema_driven_generator


class VariableCollector:
    """
    Collects hardcoded values that should become Terraform variables.

    Rules:
    - If a value is a REFERENCE (aws_*.*.*, var.*, data.*, local.*) -> NO variable needed
    - If a value is HARDCODED (literal string, number) -> CREATE a variable
    - Variables are named: {resource_type}_{resource_name}_{field_name}
    """

    # Fields that should ALWAYS be variables (important config)
    ALWAYS_VARIABLE = {
        'cidr_block', 'availability_zone', 'instance_type', 'ami', 'engine',
        'engine_version', 'instance_class', 'allocated_storage', 'db_name',
        'username', 'bucket', 'function_name', 'runtime', 'handler',
        'memory_size', 'timeout', 'machine_type', 'zone', 'image',
        'vm_size', 'location', 'sku', 'tier'
    }

    # Fields that should NEVER be variables (always hardcoded or reference)
    NEVER_VARIABLE = {
        'vpc_id', 'subnet_id', 'security_group_ids', 'vpc_security_group_ids',
        'target_group_arn', 'role', 'role_arn', 'iam_instance_profile',
        'key_name', 'kms_key_id', 'network_interface_id', 'allocation_id',
        'gateway_id', 'nat_gateway_id', 'internet_gateway_id', 'route_table_id',
        'db_subnet_group_name', 'parameter_group_name', 'option_group_name',
        'cluster_identifier', 'replication_group_id', 'source_security_group_id'
    }

    # Reference patterns
    REFERENCE_PATTERNS = [
        re.compile(r'^aws_[a-zA-Z_]+\.[a-zA-Z_][a-zA-Z0-9_]*\.'),  # aws_*.name.
        re.compile(r'^azurerm_[a-zA-Z_]+\.[a-zA-Z_][a-zA-Z0-9_]*\.'),  # azurerm_*.name.
        re.compile(r'^google_[a-zA-Z_]+\.[a-zA-Z_][a-zA-Z0-9_]*\.'),  # google_*.name.
        re.compile(r'^var\.'),  # var.*
        re.compile(r'^data\.'),  # data.*
        re.compile(r'^local\.'),  # local.*
        re.compile(r'^module\.'),  # module.*
        re.compile(r'^\$\{'),  # ${...} interpolation
    ]

    def __init__(self, region: str = None):
        self.variables: Dict[str, Dict[str, Any]] = {}  # var_name -> {value, type, description}
        self._seen_names: Set[str] = set()
        self._region = region  # AWS region for deriving availability zones

    def derive_availability_zone(self, original_az: str) -> str:
        """
        Derive availability zone from the configured region.

        If the original_az belongs to a different region than self._region,
        replace the region prefix with the configured region.

        Example:
        - original_az = "us-east-1a", self._region = "us-west-2"
        - Returns: "us-west-2a"
        """
        if not self._region or not original_az:
            return original_az

        # Extract the AZ suffix (a, b, c, d, etc.)
        # AWS AZ format: {region}{az-letter}, e.g., us-east-1a, eu-west-1b
        az_match = re.match(r'^(.+?)([a-z])$', original_az.strip())
        if az_match:
            az_suffix = az_match.group(2)
            return f"{self._region}{az_suffix}"

        # Couldn't parse, return original with region prefix
        return f"{self._region}a"

    def is_reference(self, value: Any) -> bool:
        """Check if a value is a Terraform reference (should NOT be variabilized)."""
        if not isinstance(value, str):
            return False

        value = value.strip()
        for pattern in self.REFERENCE_PATTERNS:
            if pattern.match(value):
                return True
        return False

    def should_create_variable(self, field_name: str, value: Any, resource_type: str) -> bool:
        """Determine if a field should have a variable created for it."""
        # Never create variables for these fields (they're always references)
        if field_name in self.NEVER_VARIABLE:
            return False

        # If value is already a reference, don't create variable
        if self.is_reference(value):
            return False

        # If value is empty/None/False, don't create variable
        if value is None or value == '' or value is False:
            return False

        # Always create variables for important config fields
        if field_name in self.ALWAYS_VARIABLE:
            return True

        # For string values that look like hardcoded config, create variable
        if isinstance(value, str) and value.strip():
            return True

        # For numbers that are meaningful config, create variable
        if isinstance(value, (int, float)) and field_name not in {'from_port', 'to_port'}:
            return True

        return False

    def add_variable(
        self,
        resource_type: str,
        resource_name: str,
        field_name: str,
        value: Any,
        description: str = None
    ) -> str:
        """
        Add a variable and return the var.xxx reference to use.

        Returns the variable reference string (e.g., "var.vpc_cidr_block")
        """
        # For availability_zone fields, derive from configured region
        if field_name == 'availability_zone' and isinstance(value, str):
            value = self.derive_availability_zone(value)

        # Create a descriptive variable name
        # Simplify: use resource_name + field_name for readability
        clean_resource = self._sanitize_name(resource_name)
        var_name = f"{clean_resource}_{field_name}"

        # Handle duplicates
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

        # Store variable info
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
        """Generate the variables.tf content."""
        if not self.variables:
            return "# No variables defined"

        lines = []
        for var_name, info in sorted(self.variables.items()):
            lines.append(f'variable "{var_name}" {{')
            lines.append(f'  description = "{info["description"]}"')
            lines.append(f'  type        = {info["type"]}')

            # Add default value for strings and numbers
            if info['type'] == 'string':
                escaped_value = str(info['value']).replace('"', '\\"')
                lines.append(f'  default     = "{escaped_value}"')
            elif info['type'] == 'number':
                lines.append(f'  default     = {info["value"]}')
            elif info['type'] == 'bool':
                lines.append(f'  default     = {"true" if info["value"] else "false"}')
            elif info['type'] == 'list(string)':
                list_str = "[" + ", ".join(f'"{v}"' for v in info['value']) + "]"
                lines.append(f'  default     = {list_str}')

            lines.append('}')
            lines.append('')

        return '\n'.join(lines)

    def generate_tfvars(self) -> str:
        """Generate the terraform.tfvars content."""
        if not self.variables:
            return "# No variables to configure"

        lines = []
        for var_name, info in sorted(self.variables.items()):
            value = info['value']
            if info['type'] == 'string':
                escaped_value = str(value).replace('"', '\\"')
                lines.append(f'{var_name} = "{escaped_value}"')
            elif info['type'] == 'number':
                lines.append(f'{var_name} = {value}')
            elif info['type'] == 'bool':
                lines.append(f'{var_name} = {"true" if value else "false"}')
            elif info['type'] == 'list(string)':
                list_str = "[" + ", ".join(f'"{v}"' for v in value) + "]"
                lines.append(f'{var_name} = {list_str}')

        return '\n'.join(lines)


class TerraformGenerator:
    """Generate Terraform code from visual infrastructure design."""

    def __init__(self):
        self.env = Environment(loader=FileSystemLoader("app/services/terraform/templates"))

    def _get_config_value(self, config: Dict[str, Any], *keys: str) -> Any:
        """
        Get configuration value, treating empty strings and False as None.
        This ensures user-provided values are used instead of falling back to defaults.

        IMPORTANT: Filters out:
        - Empty strings ('')
        - Whitespace-only strings
        - Boolean False (assumes unchecked checkboxes = not configured)

        Args:
            config: Resource configuration dictionary
            *keys: One or more keys to try (first non-empty value wins)

        Returns:
            The first non-empty value found, or None
        """
        for key in keys:
            value = config.get(key)

            # Filter out None
            if value is None:
                continue

            # Filter out False (unchecked checkboxes from frontend)
            if value is False:
                continue

            # Filter out empty/whitespace strings
            if isinstance(value, str) and not value.strip():
                continue

            # Valid value - return it
            return value

        return None

    def generate_terraform(
        self,
        project: Project,
        resources: List[Resource],
        region_config: Dict[str, str] = None
    ) -> Dict[str, str]:
        """
        Generate complete Terraform configuration in a flat structure.
        All resources are generated directly in main.tf without modules.

        INTELLIGENT VARIABLE SYSTEM:
        - References (aws_*.*.id, var.*, data.*) -> Use as-is, NO variable
        - Hardcoded values (strings, numbers) -> Create variable, use var.xxx

        Args:
            project: Project model
            resources: List of resources
            region_config: Optional dict with region overrides from frontend:
                - aws_region: AWS region (e.g., "us-west-2")
                - azure_location: Azure location (e.g., "westeurope")
                - gcp_region: GCP region (e.g., "europe-west1")
                - gcp_project: GCP project ID
                - aws_endpoint_url: Custom AWS endpoint (for LocalStack)
        """
        region_config = region_config or {}

        # Determine the region for variable collector (used for deriving availability zones)
        configured_region = None
        if project.cloud_provider == CloudProvider.AWS:
            configured_region = region_config.get('aws_region', 'us-east-1')
        elif project.cloud_provider == CloudProvider.GCP:
            configured_region = region_config.get('gcp_region', 'us-central1')
        # Azure uses locations, not regions with AZ suffixes

        # Check if using custom endpoint (LocalStack)
        use_custom_endpoint = bool(region_config.get('aws_endpoint_url'))

        # Create variable collector for intelligent variable extraction
        var_collector = VariableCollector(region=configured_region)

        # Generate resources with intelligent variable extraction
        main_body = self._generate_resources_intelligent(resources, project.cloud_provider, var_collector)

        # Generate provider config (with LocalStack support if custom endpoint)
        provider_config = self._generate_provider(project.cloud_provider, use_custom_endpoint)
        terraform_block = self._generate_terraform_block(project.cloud_provider)

        # Add provider-specific variables with user-configured region values
        if project.cloud_provider == CloudProvider.AWS:
            aws_region = region_config.get('aws_region', 'us-east-1')
            var_collector.variables['aws_region'] = {
                'value': aws_region,
                'type': 'string',
                'description': 'AWS region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'region',
            }
            var_collector._seen_names.add('aws_region')
        elif project.cloud_provider == CloudProvider.AZURE:
            azure_location = region_config.get('azure_location', 'eastus')
            var_collector.variables['azure_location'] = {
                'value': azure_location,
                'type': 'string',
                'description': 'Azure region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'location',
            }
            var_collector._seen_names.add('azure_location')
        elif project.cloud_provider == CloudProvider.GCP:
            gcp_region = region_config.get('gcp_region', 'us-central1')
            gcp_project = region_config.get('gcp_project', 'your-project-id')
            var_collector.variables['gcp_region'] = {
                'value': gcp_region,
                'type': 'string',
                'description': 'GCP region for resource deployment',
                'resource_type': 'provider',
                'field_name': 'region',
            }
            var_collector._seen_names.add('gcp_region')
            var_collector.variables['gcp_project'] = {
                'value': gcp_project,
                'type': 'string',
                'description': 'GCP project ID',
                'resource_type': 'provider',
                'field_name': 'project',
            }
            var_collector._seen_names.add('gcp_project')

        # Generate outputs
        outputs_config, _output_names = self._generate_outputs_flat(resources)

        # Generate variables and tfvars from collector
        variables_config = var_collector.generate_variables_tf()
        tfvars_config = var_collector.generate_tfvars()

        files: Dict[str, str] = {
            "providers.tf": terraform_block + "\n" + provider_config,
            "main.tf": main_body or "# No resources defined\n# Add resources from the canvas to generate Terraform code",
            "variables.tf": variables_config,
            "outputs.tf": outputs_config,
            "terraform.tfvars": tfvars_config,
        }

        return files

    def _generate_resources_intelligent(
        self,
        resources: List[Resource],
        cloud_provider: CloudProvider,
        var_collector: VariableCollector
    ) -> str:
        """
        Generate resources with intelligent variable extraction.

        For each field:
        - If it's a reference (aws_*.*.id) -> use directly
        - If it's hardcoded -> create variable and use var.xxx
        """
        context = self._build_resource_context(resources, cloud_provider)
        blocks: List[str] = []

        # Generate data sources first
        data_source_blocks = self._generate_data_sources(context, cloud_provider)
        if data_source_blocks:
            blocks.extend(data_source_blocks)

        # Generate each resource with intelligent variables
        for resource in resources:
            # Skip logical-only types
            if resource.resource_type in {"aws_region", "aws_availability_zone"} or \
               resource.resource_type.endswith("_container"):
                continue

            resource_block = self._generate_resource_intelligent(resource, context, var_collector)
            if resource_block:
                blocks.append(resource_block)

        # Generate auto-created IAM roles
        iam_blocks = self._generate_iam_resources(context, cloud_provider)
        if iam_blocks:
            blocks.extend(iam_blocks)

        return "\n\n".join(blocks)

    def _generate_resource_intelligent(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: VariableCollector
    ) -> str:
        """
        Generate a single resource block with intelligent variable extraction.

        Logic:
        - For fields that are references (aws_*.*.id, var.*, etc.) -> use directly
        - For fields that are hardcoded -> create variable, use var.xxx
        - Block fields (ingress, egress) -> keep values inside blocks as-is
        """
        resource_type = resource.resource_type
        resource_name = self._sanitize_identifier(resource.resource_name)
        raw_config = resource.config or {}

        lines = [f'resource "{resource_type}" "{resource_name}" {{']

        # Track which fields to skip (internal/handled separately)
        # user_data_base64 conflicts with user_data in Terraform - skip it
        skip_fields = {'name', 'tags', 'ingress', 'egress', 'user_data_base64'}

        # Process all config fields
        for field_name, field_value in raw_config.items():
            # Skip internal fields and block fields
            if field_name in skip_fields:
                continue

            # Skip empty values
            if field_value is None or field_value == '' or field_value is False:
                continue

            # Handle nested blocks (like vpc_config, root_block_device)
            if isinstance(field_value, dict) and field_value:
                block_lines = self._format_block_intelligent(field_name, field_value, resource, var_collector)
                lines.extend(block_lines)
                continue

            # Handle list values
            if isinstance(field_value, list) and field_value:
                formatted = self._format_list_value(field_value)
                lines.append(f"  {field_name} = {formatted}")
                continue

            # INTELLIGENT VARIABLE LOGIC
            # Check if this is a reference (should NOT be variabilized)
            if var_collector.is_reference(field_value):
                # Check if this field should be a list (like vpc_security_group_ids)
                # Import the list type fields from schema_driven_generator
                from app.services.terraform.schema_driven_generator import LIST_TYPE_FIELDS
                list_fields = LIST_TYPE_FIELDS.get(resource_type, set())
                if field_name in list_fields:
                    # Wrap single reference in brackets for list fields
                    lines.append(f"  {field_name} = [{field_value}]")
                else:
                    # It's a reference - use directly without quotes
                    lines.append(f"  {field_name} = {field_value}")
            elif var_collector.should_create_variable(field_name, field_value, resource_type):
                # It's a hardcoded value - create variable
                var_ref = var_collector.add_variable(
                    resource_type,
                    resource.resource_name,
                    field_name,
                    field_value,
                    f"{field_name} for {resource.resource_name}"
                )
                lines.append(f"  {field_name} = {var_ref}")
            else:
                # Use value directly (booleans, special cases)
                formatted = self._format_value_for_hcl(field_value)
                lines.append(f"  {field_name} = {formatted}")

        # Handle ingress blocks for security groups
        ingress_rules = raw_config.get('ingress', [])
        if ingress_rules:
            for rule in (ingress_rules if isinstance(ingress_rules, list) else [ingress_rules]):
                if isinstance(rule, dict) and rule:
                    lines.extend(self._format_security_rule_block('ingress', rule))

        # Handle egress blocks for security groups
        egress_rules = raw_config.get('egress', [])
        if egress_rules:
            for rule in (egress_rules if isinstance(egress_rules, list) else [egress_rules]):
                if isinstance(rule, dict) and rule:
                    lines.extend(self._format_security_rule_block('egress', rule))

        # Always add tags
        tags = raw_config.get('tags', {})
        if not isinstance(tags, dict):
            tags = {}

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        for key, value in tags.items():
            if key != "Name":
                lines.append(f'    {key} = "{value}"')
        lines.append("  }")
        lines.append("}")

        return "\n".join(lines)

    def _format_block_intelligent(
        self,
        block_name: str,
        block_data: Dict[str, Any],
        resource: Resource,
        var_collector: VariableCollector
    ) -> List[str]:
        """Format a nested block with intelligent variable handling."""
        lines = [f"  {block_name} {{"]

        for key, value in block_data.items():
            if value is None or value == '' or value is False:
                continue

            # For block fields, we typically use the value directly
            # (references or hardcoded - most block internals stay as-is)
            if var_collector.is_reference(value):
                lines.append(f"    {key} = {value}")
            elif isinstance(value, list):
                formatted = self._format_list_value(value)
                lines.append(f"    {key} = {formatted}")
            else:
                formatted = self._format_value_for_hcl(value)
                lines.append(f"    {key} = {formatted}")

        lines.append("  }")
        return lines

    def _format_security_rule_block(self, block_name: str, rule: Dict[str, Any]) -> List[str]:
        """Format ingress/egress block for security groups."""
        lines = [f"  {block_name} {{"]

        # Handle from_port and to_port (numbers)
        if 'from_port' in rule:
            lines.append(f"    from_port = {rule['from_port']}")
        if 'to_port' in rule:
            lines.append(f"    to_port = {rule['to_port']}")

        # Handle protocol (string)
        if 'protocol' in rule and rule['protocol']:
            lines.append(f'    protocol = "{rule["protocol"]}"')

        # Handle cidr_blocks (list)
        if 'cidr_blocks' in rule and rule['cidr_blocks']:
            cidr = rule['cidr_blocks']
            if isinstance(cidr, list):
                cidr_str = "[" + ", ".join(f'"{c}"' for c in cidr) + "]"
            else:
                cidr_str = f'["{cidr}"]'
            lines.append(f"    cidr_blocks = {cidr_str}")

        # Handle description
        if 'description' in rule and rule['description']:
            lines.append(f'    description = "{rule["description"]}"')

        lines.append("  }")
        return lines

    def _format_value_for_hcl(self, value: Any) -> str:
        """Format a value for HCL output."""
        if isinstance(value, bool):
            return "true" if value else "false"
        elif isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, str):
            escaped = value.replace('"', '\\"')
            return f'"{escaped}"'
        elif isinstance(value, list):
            return self._format_list_value(value)
        else:
            return f'"{str(value)}"'

    def _format_list_value(self, values: List[Any]) -> str:
        """Format a list for HCL."""
        if not values:
            return "[]"

        formatted_items = []
        for v in values:
            if isinstance(v, str):
                formatted_items.append(f'"{v}"')
            elif isinstance(v, (int, float)):
                formatted_items.append(str(v))
            elif isinstance(v, bool):
                formatted_items.append("true" if v else "false")
            else:
                formatted_items.append(f'"{str(v)}"')

        return "[" + ", ".join(formatted_items) + "]"

    def _generate_terraform_block(self, cloud_provider: CloudProvider) -> str:
        """Generate terraform block with required providers (no remote backend for simplicity)."""

        if cloud_provider == CloudProvider.AWS:
            return """terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
"""
        elif cloud_provider == CloudProvider.AZURE:
            return """terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}
"""
        elif cloud_provider == CloudProvider.GCP:
            return """terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
"""
        else:
            return """terraform {
  required_version = ">= 1.0"
}
"""

    def _generate_provider(self, cloud_provider: CloudProvider, use_custom_endpoint: bool = False) -> str:
        """Generate provider configuration."""

        if cloud_provider == CloudProvider.AWS:
            if use_custom_endpoint:
                # LocalStack/custom endpoint configuration
                return """
provider "aws" {
  region                      = var.aws_region
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  # Custom endpoint is set via AWS_ENDPOINT_URL environment variable
  # This configuration is compatible with LocalStack
}
"""
            else:
                return """
provider "aws" {
  region = var.aws_region
}
"""
        elif cloud_provider == CloudProvider.AZURE:
            return """
provider "azurerm" {
  features {}
}
"""
        elif cloud_provider == CloudProvider.GCP:
            return """
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}
"""
        return ""

    def _generate_versions(self, cloud_provider: CloudProvider) -> str:
        """Generate terraform block with required providers and versions."""

        if cloud_provider == CloudProvider.AWS:
            provider_block = """
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # S3 backend for remote state storage
  backend "s3" {
    bucket         = var.terraform_state_bucket
    key            = var.terraform_state_key
    region         = var.aws_region
    encrypt        = true
    dynamodb_table = var.terraform_lock_table
  }
}
"""
        elif cloud_provider == CloudProvider.AZURE:
            provider_block = """
terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}
"""
        elif cloud_provider == CloudProvider.GCP:
            provider_block = """
terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
"""
        else:
            provider_block = """
terraform {
  required_version = ">= 1.0"
}
"""

        return provider_block.strip() + "\n"

    # -------------------------------------------------------------------------
    # Context & helper utilities
    # -------------------------------------------------------------------------

    def _sanitize_identifier(self, value: str, prefix: str = "id") -> str:
        """Convert arbitrary user-provided names into Terraform-safe identifiers."""
        cleaned = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in value.strip())
        cleaned = cleaned.strip("_")

        if not cleaned:
            cleaned = prefix
        if cleaned[0].isdigit():
            cleaned = f"{prefix}_{cleaned}"

        return cleaned.lower()

    def _build_resource_context(
        self,
        resources: List[Resource],
        cloud_provider: CloudProvider
    ) -> Dict[str, Any]:
        """Collect metadata needed for cross-resource references (data sources, lookups, etc.)."""

        context: Dict[str, Any] = {
            "aws": {
                "availability_zones": {},
                "availability_zone_lookup": {},
            }
        }

        if cloud_provider != CloudProvider.AWS:
            return context

        for resource in resources:
            if resource.resource_type != "aws_availability_zone":
                continue

            config = resource.config or {}
            zone_name = (
                config.get("availability_zone")
                or config.get("zone_name")
                or config.get("name")
                or resource.resource_name
            )

            if not isinstance(zone_name, str) or not zone_name.strip():
                continue

            identifier_source = resource.resource_name or zone_name
            identifier = self._sanitize_identifier(identifier_source, prefix="az")

            zone_entry: Dict[str, Any] = {"name": zone_name.strip()}
            state = config.get("state")
            if isinstance(state, str) and state.strip():
                zone_entry["state"] = state.strip()

            context["aws"]["availability_zones"][identifier] = zone_entry

            lookup_keys = {
                zone_name,
                zone_name.lower(),
                zone_name.upper(),
                resource.resource_name,
            }

            for key in lookup_keys:
                if isinstance(key, str) and key.strip():
                    context["aws"]["availability_zone_lookup"][key.strip().lower()] = identifier

        return context

    def _generate_data_sources(
        self,
        context: Dict[str, Any],
        cloud_provider: CloudProvider
    ) -> List[str]:
        """Generate data source blocks derived from diagram resources."""

        data_blocks: List[str] = []

        if cloud_provider == CloudProvider.AWS:
            # Generate availability zone data sources
            availability_zones: Dict[str, Dict[str, Any]] = context["aws"]["availability_zones"]
            for identifier, meta in availability_zones.items():
                block_lines = [
                    f'data "aws_availability_zone" "{identifier}" {{',
                    f'  name  = "{meta["name"]}"',
                ]
                state = meta.get("state")
                if isinstance(state, str) and state:
                    block_lines.append(f'  state = "{state}"')
                block_lines.append("}")
                data_blocks.append("\n".join(block_lines))

            # Generate AMI data sources for instances without explicit AMI
            ami_data_sources = context.get("ami_data_sources", [])
            for ami_ds_name in ami_data_sources:
                block_lines = [
                    f'data "aws_ami" "{ami_ds_name}" {{',
                    '  most_recent = true',
                    '  owners      = ["amazon"]',
                    '',
                    '  filter {',
                    '    name   = "name"',
                    '    values = ["amzn2-ami-hvm-*-x86_64-gp2"]',
                    '  }',
                    '',
                    '  filter {',
                    '    name   = "virtualization-type"',
                    '    values = ["hvm"]',
                    '  }',
                    '}'
                ]
                data_blocks.append("\n".join(block_lines))

        return data_blocks

    def _generate_iam_resources(
        self,
        context: Dict[str, Any],
        cloud_provider: CloudProvider
    ) -> List[str]:
        """Generate IAM roles and policies for resources that need them."""

        iam_blocks: List[str] = []

        if cloud_provider == CloudProvider.AWS:
            # Generate Lambda execution roles
            lambda_roles = context.get("lambda_iam_roles", [])
            for lambda_name in lambda_roles:
                # IAM role
                role_block = f'''resource "aws_iam_role" "{lambda_name}_role" {{
  name = "{lambda_name}-execution-role"

  assume_role_policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {{
          Service = "lambda.amazonaws.com"
        }}
      }}
    ]
  }})

  tags = {{
    Name = "{lambda_name}-execution-role"
  }}
}}'''
                iam_blocks.append(role_block)

                # Basic execution policy attachment
                basic_policy_block = f'''resource "aws_iam_role_policy_attachment" "{lambda_name}_basic" {{
  role       = aws_iam_role.{lambda_name}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}}'''
                iam_blocks.append(basic_policy_block)

                # VPC execution policy attachment (if Lambda needs VPC access)
                vpc_policy_block = f'''resource "aws_iam_role_policy_attachment" "{lambda_name}_vpc" {{
  role       = aws_iam_role.{lambda_name}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}}'''
                iam_blocks.append(vpc_policy_block)

        return iam_blocks

    # -------------------------------------------------------------------------
    # Resource orchestration
    # -------------------------------------------------------------------------

    def _generate_resources(
        self,
        resources: List[Resource],
        cloud_provider: CloudProvider
    ) -> Tuple[str, Dict[str, List[str]]]:
        """Generate resource configurations including auxiliary data sources."""

        context = self._build_resource_context(resources, cloud_provider)

        blocks: List[str] = []
        categorized: Dict[str, List[str]] = {}

        data_source_blocks = self._generate_data_sources(context, cloud_provider)
        if data_source_blocks:
            blocks.extend(data_source_blocks)
            categorized["data"] = list(data_source_blocks)

        for resource in resources:
            resource_block = self._generate_resource_block(resource, cloud_provider, context)
            if resource_block:
                blocks.append(resource_block)
                category = self._categorize_resource(resource.resource_type)
                categorized.setdefault(category, []).append(resource_block)

        # Generate auto-created IAM roles after processing all resources
        iam_blocks = self._generate_iam_resources(context, cloud_provider)
        if iam_blocks:
            blocks.extend(iam_blocks)
            categorized.setdefault("iam", []).extend(iam_blocks)

        return "\n\n".join(blocks), categorized

    def _generate_resource_block(
        self,
        resource: Resource,
        cloud_provider: CloudProvider,
        context: Dict[str, Any]
    ) -> str:
        """Generate individual resource block based on type."""

        logical_only_types = {
            "aws_region",
            "aws_availability_zone",
        }

        if resource.resource_type in logical_only_types or resource.resource_type.endswith("_container"):
            return ""

        # Use schema-driven generator for ALL resources
        # This supports AWS, Azure, GCP, and any other cloud provider
        # No need for custom generators - the schema-driven approach handles everything
        return self._generate_generic_resource(resource, context)

    def _categorize_resource(self, resource_type: str) -> str:
        """Map resource type to a coarse category for file grouping/reporting."""
        if resource_type.startswith(("aws_vpc", "aws_subnet", "aws_route", "aws_route_table")):
            return "network"
        if resource_type.startswith(("aws_security_group", "aws_wafv2", "aws_network_acl")):
            return "security"
        if resource_type.startswith(("aws_instance", "aws_launch_template", "aws_autoscaling")):
            return "compute"
        if resource_type.startswith(("aws_s3", "aws_efs", "aws_ebs")):
            return "storage"
        if resource_type.startswith(("aws_db", "aws_rds")):
            return "database"
        if resource_type.startswith(("aws_lambda", "aws_api_gateway")):
            return "serverless"
        if resource_type.startswith(("azure_",)):
            return "azure"
        if resource_type.startswith(("gcp_", "google_")):
            return "gcp"
        return "other"

    def _generate_generic_resource(
        self,
        resource: Resource,
        context: Dict[str, Any]
    ) -> str:
        """
        Fallback generator for resources without explicit handlers.
        Uses schema-driven generator to support ALL services dynamically.
        """

        # Get filtered config (no empty strings or False values)
        raw_config = resource.config or {}

        # Filter config using _get_config_value logic
        filtered_config = {}
        for key, value in raw_config.items():
            # Use the same filtering logic as _get_config_value
            if value is None or value is False:
                continue
            if isinstance(value, str) and not value.strip():
                continue
            filtered_config[key] = value

        # Use schema-driven generator for dynamic HCL generation
        schema_generator = get_schema_driven_generator()
        return schema_generator.generate_resource(resource, filtered_config, context)

    # -------------------------------------------------------------------------
    # Formatting helpers
    # -------------------------------------------------------------------------

    def _format_hcl_value(self, value: Any, indent_level: int = 2) -> str:
        """
        Format Python values into HCL-compatible strings.
        Uses ValueDetector to intelligently determine if values should be quoted.
        """

        indent = " " * indent_level

        # Handle booleans
        if isinstance(value, bool):
            return "true" if value else "false"

        # Handle numbers
        if isinstance(value, (int, float)):
            return str(value)

        # Handle strings - use ValueDetector for intelligent formatting
        if isinstance(value, str):
            return ValueDetector.format_for_terraform(value)
        if isinstance(value, list):
            if not value:
                return "[]"

            if all(not isinstance(item, (dict, list)) for item in value):
                inner = ", ".join(self._format_hcl_value(item, 0) for item in value)
                return f"[{inner}]"

            list_lines = ["["]
            for item in value:
                formatted_lines = self._format_hcl_value(item, indent_level + 2).split("\n")
                for line in formatted_lines:
                    list_lines.append(f"{indent}  {line}")
                list_lines[-1] = f"{list_lines[-1]},"
            if list_lines[-1].endswith(","):
                list_lines[-1] = list_lines[-1][:-1]
            list_lines.append(f"{indent}]")
            return "\n".join(list_lines)

        if isinstance(value, dict):
            if not value:
                return "{}"

            dict_lines = ["{"]
            for key, val in value.items():
                formatted = self._format_hcl_value(val, indent_level + 2)
                formatted_lines = formatted.split("\n")
                dict_lines.append(f"{indent}  {key} = {formatted_lines[0]}")
                for line in formatted_lines[1:]:
                    dict_lines.append(f"{indent}  {line}")
            dict_lines.append(f"{indent}}}")
            return "\n".join(dict_lines)

        return f'"{str(value)}"'

    def _resolve_availability_zone_reference(
        self,
        zone_value: Any,
        context: Dict[str, Any]
    ) -> str | None:
        """Resolve availability zone config to a Terraform expression if a data source exists."""

        if not isinstance(zone_value, str):
            return None

        stripped = zone_value.strip()
        if not stripped:
            return None

        if stripped.startswith("${") and stripped.endswith("}"):
            return stripped[2:-1]

        if stripped.startswith("data.") or stripped.startswith("var.") or stripped.startswith("local."):
            return stripped

        lookup = context.get("aws", {}).get("availability_zone_lookup", {})
        identifier = lookup.get(stripped.lower())

        if identifier:
            return f"data.aws_availability_zone.{identifier}.name"

        return None

    # -------------------------------------------------------------------------
    # All resource generation is now handled by the schema-driven generator
    # No need for custom generators - removed for clarity and maintainability
    # -------------------------------------------------------------------------

    # (Old custom generators for aws_instance, aws_vpc, aws_subnet, etc. removed)
    # (Old custom generators for Azure and GCP resources removed)
    # All services now use the schema-driven generator in schema_driven_generator.py

    # -------------------------------------------------------------------------
    # Variables & outputs (moved to end of file)
    # -------------------------------------------------------------------------

    def _generate_aws_vpc(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)

        cidr_block = self._get_config_value(config, 'cidr_block') or '10.0.0.0/16'
        enable_dns_hostnames = self._get_config_value(config, 'enable_dns_hostnames')
        if enable_dns_hostnames is None:
            enable_dns_hostnames = True
        enable_dns_support = self._get_config_value(config, 'enable_dns_support')
        if enable_dns_support is None:
            enable_dns_support = True

        return f"""
resource "aws_vpc" "{sanitized_name}" {{
  cidr_block           = "{cidr_block}"
  enable_dns_hostnames = {str(enable_dns_hostnames).lower()}
  enable_dns_support   = {str(enable_dns_support).lower()}

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_subnet(self, resource: Resource, context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)

        lines = [f'resource "aws_subnet" "{sanitized_name}" {{']
        vpc_id = self._get_config_value(config, 'vpc_id')
        if not vpc_id:
            # Enforce explicit VPC wiring to avoid default VPC usage
            vpc_id = 'var.vpc_id'
        lines.append(f"  vpc_id            = {self._format_hcl_value(vpc_id)}")

        cidr_block = self._get_config_value(config, 'cidr_block') or '10.0.1.0/24'
        lines.append(f"  cidr_block        = {self._format_hcl_value(cidr_block)}")

        az_value = self._get_config_value(config, "availability_zone")
        az_reference = self._resolve_availability_zone_reference(az_value, context)
        if az_reference:
            lines.append(f"  availability_zone = {az_reference}")
        elif az_value:
            lines.append(f"  availability_zone = {self._format_hcl_value(az_value)}")

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        lines.append("  }")
        lines.append("}")

        return "\n".join(lines)

    def _generate_aws_security_group(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        ingress_rules = self._get_config_value(config, "ingress_rules") or []
        ingress_blocks = "\n  ".join([
            f"""ingress {{
    from_port   = {rule.get('from_port', 80)}
    to_port     = {rule.get('to_port', 80)}
    protocol    = "{rule.get('protocol', 'tcp')}"
    cidr_blocks = {rule.get('cidr_blocks', '["0.0.0.0/0"]')}
  }}"""
            for rule in ingress_rules
        ])

        description = self._get_config_value(config, 'description') or 'Security group'
        vpc_id = self._get_config_value(config, 'vpc_id') or 'aws_vpc.main.id'

        return f"""
resource "aws_security_group" "{resource.resource_name}" {{
  name        = "{resource.resource_name}"
  description = "{description}"
  vpc_id      = {vpc_id}

  {ingress_blocks}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_s3_bucket(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        bucket_name = self._get_config_value(config, 'bucket') or resource.resource_name

        return f"""
resource "aws_s3_bucket" "{resource.resource_name}" {{
  bucket = "{bucket_name}"

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_rds_instance(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}

        allocated_storage = self._get_config_value(config, 'allocated_storage') or 20
        db_name = self._get_config_value(config, 'db_name') or 'mydb'
        engine = self._get_config_value(config, 'engine') or 'mysql'
        engine_version = self._get_config_value(config, 'engine_version') or '8.0'
        instance_class = self._get_config_value(config, 'instance_class') or 'db.t3.micro'
        username = self._get_config_value(config, 'username') or 'admin'
        parameter_group_name = self._get_config_value(config, 'parameter_group_name') or 'default.mysql8.0'

        return f"""
resource "aws_db_instance" "{resource.resource_name}" {{
  allocated_storage    = {allocated_storage}
  db_name              = "{db_name}"
  engine               = "{engine}"
  engine_version       = "{engine_version}"
  instance_class       = "{instance_class}"
  username             = "{username}"
  password             = var.db_password
  parameter_group_name = "{parameter_group_name}"
  skip_final_snapshot  = true

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_lambda(self, resource: Resource, context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)
        zip_filename = self._get_config_value(config, 'filename') or f'{sanitized_name}.zip'

        # Generate archive data source for the Lambda function code
        archive_data_source = f"""
# Create a placeholder Lambda function code archive
data "archive_file" "{sanitized_name}_code" {{
  type        = "zip"
  output_path = "${{path.module}}/{zip_filename}"

  source {{
    content  = <<-EOT
def lambda_handler(event, context):
    return {{
        'statusCode': 200,
        'body': 'Hello from {resource.resource_name}!'
    }}
EOT
    filename = "lambda_function.py"
  }}
}}
"""

        lines = [f'resource "aws_lambda_function" "{sanitized_name}" {{']

        # Use actual config values
        function_name = self._get_config_value(config, 'function_name') or resource.resource_name
        lines.append(f'  function_name = "{function_name}"')

        runtime = self._get_config_value(config, 'runtime') or 'python3.11'
        lines.append(f'  runtime       = "{runtime}"')

        handler = self._get_config_value(config, 'handler') or 'lambda_function.lambda_handler'
        lines.append(f'  handler       = "{handler}"')

        # Auto-generate IAM role instead of hardcoded ARN
        role = self._get_config_value(config, 'role', 'role_arn')
        if not role:
            # Track that we need to generate IAM role for this Lambda
            if "lambda_iam_roles" not in context:
                context["lambda_iam_roles"] = []
            context["lambda_iam_roles"].append(sanitized_name)
            role = f"aws_iam_role.{sanitized_name}_role.arn"
        lines.append(f'  role          = {self._format_hcl_value(role)}')

        lines.append(f"  filename         = data.archive_file.{sanitized_name}_code.output_path")
        lines.append(f"  source_code_hash = data.archive_file.{sanitized_name}_code.output_base64sha256")

        # Handle VPC config (auto-wired from edges)
        vpc_config = self._get_config_value(config, 'vpc_config')
        if vpc_config and isinstance(vpc_config, dict):
            subnet_ids = vpc_config.get('subnet_ids', [])
            security_group_ids = vpc_config.get('security_group_ids', [])
            if subnet_ids or security_group_ids:
                lines.append("  vpc_config {")
                if subnet_ids:
                    formatted_subnets = "[" + ", ".join(self._format_hcl_value(s) for s in subnet_ids) + "]"
                    lines.append(f"    subnet_ids         = {formatted_subnets}")
                if security_group_ids:
                    formatted_sgs = "[" + ", ".join(self._format_hcl_value(sg) for sg in security_group_ids) + "]"
                    lines.append(f"    security_group_ids = {formatted_sgs}")
                lines.append("  }")

        # Memory and timeout from config
        memory_size = self._get_config_value(config, 'memory_size')
        if memory_size:
            lines.append(f"  memory_size = {memory_size}")

        timeout = self._get_config_value(config, 'timeout')
        if timeout:
            lines.append(f"  timeout = {timeout}")

        # Environment variables
        environment = self._get_config_value(config, 'environment')
        if environment and isinstance(environment, dict) and environment:
            lines.append("  environment {")
            lines.append("    variables = {")
            for key, val in environment.items():
                lines.append(f'      {key} = "{val}"')
            lines.append("    }")
            lines.append("  }")

        # Include user-defined tags
        tags = config.get("tags", {})
        if not isinstance(tags, dict):
            tags = {}

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        for key, value in tags.items():
            if key != "Name":
                lines.append(f'    {key} = "{value}"')
        lines.append("  }")
        lines.append("}")

        return archive_data_source + "\n".join(lines)

    def _generate_aws_nat_gateway(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}

        # NAT Gateway requires an Elastic IP and a subnet
        # Generate an EIP for the NAT Gateway
        eip_block = f"""
resource "aws_eip" "{resource.resource_name}_eip" {{
  domain = "vpc"

  tags = {{
    Name = "{resource.resource_name}-eip"
  }}
}}
"""

        # For subnet_id, try to use configured value or reference to a subnet resource
        # If subnet_id is provided in config, use it; otherwise reference the first available subnet or use a variable
        subnet_id = self._get_config_value(config, 'subnet_id')

        if subnet_id:
            # If it looks like a Terraform reference (contains '.'), use it as-is
            if '.' in subnet_id:
                subnet_ref = subnet_id
            else:
                # Otherwise treat it as a literal value
                subnet_ref = f'"{subnet_id}"'
        else:
            # Default to a variable that users can configure
            subnet_ref = 'var.public_subnet_id'

        nat_gateway_block = f"""
resource "aws_nat_gateway" "{resource.resource_name}" {{
  allocation_id = aws_eip.{resource.resource_name}_eip.id
  subnet_id     = {subnet_ref}

  tags = {{
    Name = "{resource.resource_name}"
  }}

  depends_on = [aws_eip.{resource.resource_name}_eip]
}}
"""

        return eip_block + nat_gateway_block

    # -------------------------------------------------------------------------
    # Azure resource generators
    # -------------------------------------------------------------------------

    def _generate_azure_vm(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "azurerm_linux_virtual_machine" "{resource.resource_name}" {{
  name                = "{resource.resource_name}"
  resource_group_name = "{config.get('resource_group_name', 'main-rg')}"
  location            = "{config.get('location', 'eastus')}"
  size                = "{config.get('vm_size', 'Standard_B2s')}"
  admin_username      = "{config.get('admin_username', 'azureuser')}"
  network_interface_ids = [
    {config.get('network_interface', 'var.azure_network_interface_id')}
  ]

  admin_ssh_key {{
    username   = "{config.get('admin_username', 'azureuser')}"
    public_key = "{config.get('public_key', 'ssh-rsa AAA...')}"
  }}

  os_disk {{
    name                 = "{resource.resource_name}-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_encryption_set_id = try(var.azure_disk_encryption_set_id, null)
  }}

  source_image_reference {{
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }}

  secure_boot_enabled = true
  vtpm_enabled        = true

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_azure_vnet(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "azurerm_virtual_network" "{resource.resource_name}" {{
  name                = "{resource.resource_name}"
  location            = "{config.get('location', 'eastus')}"
  resource_group_name = {config.get('resource_group', 'azurerm_resource_group.main.name')}
  address_space       = {config.get('address_space', '["10.0.0.0/16"]')}

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_azure_storage(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "azurerm_storage_account" "{resource.resource_name}" {{
  name                     = "{resource.resource_name}"
  resource_group_name      = {config.get('resource_group', 'azurerm_resource_group.main.name')}
  location                 = "{config.get('location', 'eastus')}"
  account_tier             = "{config.get('account_tier', 'Standard')}"
  account_replication_type = "{config.get('replication_type', 'LRS')}"
  enable_https_traffic_only = true
  min_tls_version            = "TLS1_2"
  allow_blob_public_access   = false
  shared_access_key_enabled  = false

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    # -------------------------------------------------------------------------
    # GCP resource generators
    # -------------------------------------------------------------------------

    def _generate_gcp_instance(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "google_compute_instance" "{resource.resource_name}" {{
  name         = "{resource.resource_name}"
  machine_type = "{config.get('machine_type', 'e2-micro')}"
  zone         = "{config.get('zone', 'us-central1-a')}"

  boot_disk {{
    initialize_params {{
      image = "{config.get('image', 'debian-cloud/debian-11')}"
    }}
    auto_delete = true
  }}

  network_interface {{
    network    = {self._format_hcl_value(config.get('network', 'var.gcp_network_self_link'))}
    subnetwork = try({self._format_hcl_value(config.get('subnetwork', 'var.gcp_subnetwork_self_link'))}, null)
    access_config {{}}
  }}

  shielded_instance_config {{
    enable_integrity_monitoring = true
    enable_vtpm                 = true
  }}

  labels = {{
    name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_gcp_network(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "google_compute_network" "{resource.resource_name}" {{
  name                    = "{resource.resource_name}"
  auto_create_subnetworks = {str(config.get('auto_create_subnetworks', False)).lower()}
}}
"""

    def _generate_gcp_bucket(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "google_storage_bucket" "{resource.resource_name}" {{
  name     = "{config.get('bucket_name', resource.resource_name)}"
  location = "{config.get('location', 'US')}"

  labels = {{
    name = "{resource.resource_name}"
  }}
}}
"""

    # -------------------------------------------------------------------------
    # Variables & outputs
    # -------------------------------------------------------------------------

    def _generate_variables(self, resources: List[Resource], cloud_provider: CloudProvider) -> str:
        """Generate variables.tf file."""

        variables: List[str] = []

        if cloud_provider == CloudProvider.AWS:
            variables.append("""variable "aws_region" {
  description = "AWS region where resources will be deployed"
  type        = string
  default     = "us-east-1"
}""")

        elif cloud_provider == CloudProvider.AZURE:
            variables.append("""variable "azure_subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "azure_tenant_id" {
  description = "Azure tenant ID"
  type        = string
}

variable "azure_location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}""")

        elif cloud_provider == CloudProvider.GCP:
            variables.append("""variable "gcp_project" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "gcp_credentials_file" {
  description = "Path to GCP credentials JSON file"
  type        = string
}""")

        # Add resource-specific variables
        has_rds = any(r.resource_type == "aws_rds_instance" for r in resources)
        if has_rds:
            variables.append("""
variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}""")

        has_nat_gateway = any(r.resource_type == "aws_nat_gateway" for r in resources)
        if has_nat_gateway:
            variables.append("""
variable "public_subnet_id" {
  description = "Public subnet ID for NAT Gateway"
  type        = string
  default     = "subnet-12345678"
}""")

        has_subnet = any(r.resource_type == "aws_subnet" for r in resources)
        if has_subnet:
            variables.append("""
variable "vpc_id" {
  description = "VPC ID for subnets"
  type        = string
}""")

        has_instance = any(r.resource_type == "aws_instance" for r in resources)
        if has_instance:
            variables.append("""
variable "subnet_id" {
  description = "Subnet ID for instances (avoids default VPC usage)"
  type        = string
}""")

        has_azure_vm = any(r.resource_type == "azure_virtual_machine" for r in resources)
        if has_azure_vm:
            variables.append("""
variable "azure_network_interface_id" {
  description = "Existing Azure NIC ID to attach to VM (prevents default NIC assumptions)"
  type        = string
}

variable "azure_disk_encryption_set_id" {
  description = "Optional Disk Encryption Set for OS disk"
  type        = string
  default     = null
}""")

        has_gcp_instance = any(r.resource_type == "gcp_compute_instance" for r in resources)
        if has_gcp_instance:
            variables.append("""
variable "gcp_network_self_link" {
  description = "Self link of the VPC network to attach instances"
  type        = string
}

variable "gcp_subnetwork_self_link" {
  description = "Self link of the subnetwork to attach instances"
  type        = string
  default     = null
}""")

        return "\n".join(variables) if variables else "# No variables defined"

    def _generate_outputs_flat(self, resources: List[Resource]) -> Tuple[str, List[str]]:
        """Generate outputs directly (flat structure, no modules)."""

        outputs: List[str] = []
        names: List[str] = []

        for resource in resources:
            sanitized_name = self._sanitize_identifier(resource.resource_name)

            if resource.resource_type in ["aws_instance", "gcp_compute_instance", "azure_virtual_machine"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "ID of {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

            if resource.resource_type in ["aws_vpc", "gcp_compute_network", "azure_virtual_network"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "VPC/Network ID for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

            if resource.resource_type in ["aws_subnet"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "Subnet ID for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

            if resource.resource_type in ["aws_security_group"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "Security Group ID for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

            if resource.resource_type in ["aws_s3_bucket", "gcp_storage_bucket", "azure_storage_account"]:
                output_name = f"{sanitized_name}_bucket"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "Bucket/Storage name for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

            if resource.resource_type in ["aws_internet_gateway"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""output "{output_name}" {{
  description = "Internet Gateway ID for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}""")

        return "\n\n".join(outputs) if outputs else "# No outputs defined", names

    def _generate_outputs(self, resources: List[Resource]) -> Tuple[str, List[str]]:
        """Generate outputs for module and return names for root forwarding."""

        outputs: List[str] = []
        names: List[str] = []

        for resource in resources:
            # Sanitize resource name for use in output identifiers
            sanitized_name = self._sanitize_identifier(resource.resource_name)

            if resource.resource_type in ["aws_instance", "gcp_compute_instance", "azure_virtual_machine"]:
                output_name = f"{sanitized_name}_id"
                names.append(output_name)
                outputs.append(f"""
output "{output_name}" {{
  description = "ID of {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}
""")
            if resource.resource_type in ["aws_vpc", "gcp_compute_network", "azure_virtual_network"]:
                output_name = f"{sanitized_name}_network_id"
                names.append(output_name)
                outputs.append(f"""
output "{output_name}" {{
  description = "Identifier for {resource.resource_name} network"
  value       = {resource.resource_type}.{sanitized_name}.id
}}
""")
            if resource.resource_type in ["aws_subnet"]:
                output_name = f"{sanitized_name}_subnet_id"
                names.append(output_name)
                outputs.append(f"""
output "{output_name}" {{
  description = "Subnet ID for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}
""")
            if resource.resource_type in ["aws_s3_bucket", "gcp_storage_bucket", "azure_storage_account"]:
                output_name = f"{sanitized_name}_bucket_name"
                names.append(output_name)
                outputs.append(f"""
output "{output_name}" {{
  description = "Storage identifier for {resource.resource_name}"
  value       = {resource.resource_type}.{sanitized_name}.id
}}
""")

        module_outputs = "\n".join(outputs) if outputs else "# No outputs defined"
        return module_outputs, names

    def _generate_tfvars(self, cloud_provider: CloudProvider) -> str:
        """Generate terraform.tfvars file with default values."""

        tfvars: List[str] = []

        if cloud_provider == CloudProvider.AWS:
            tfvars.append('aws_region = "us-east-1"')

        elif cloud_provider == CloudProvider.AZURE:
            tfvars.append('azure_location = "eastus"')

        elif cloud_provider == CloudProvider.GCP:
            tfvars.append('gcp_project = "your-project-id"')
            tfvars.append('gcp_region  = "us-central1"')

        return "\n".join(tfvars) if tfvars else "# No variables to configure"

    def _forward_module_outputs(self, output_names: List[str], module_name: str) -> str:
        """Expose module outputs at root level for ease of consumption."""
        if not output_names:
            return "# No outputs defined"

        lines: List[str] = []
        for name in output_names:
            lines.append(f"""output "{name}" {{
  value       = module.{module_name}.{name}
  description = "Forwarded from module {module_name}"
}}""")
        return "\n\n".join(lines)

    # -------------------------------------------------------------------------
    # Scanner/estimator configs
    # -------------------------------------------------------------------------

    def _generate_tfsec_config(self) -> str:
        """Baseline tfsec config to scan generated modules directory."""
        return "\n".join([
            "minimum_severity: MEDIUM",
            "exclude_paths:",
            "  - .terraform",
            "  - terraform.tfstate",
            "  - terraform.tfstate.backup",
            "skip_checks: []",
            "",
            "severity_overrides: {}",
        ])

    def _generate_terrascan_config(self) -> str:
        """Baseline Terrascan config."""
        return "\n".join([
            "[scanner]",
            'skip_paths = [".terraform"]',
            'categories = ["all"]',
            'severity = ["LOW","MEDIUM","HIGH","CRITICAL"]',
        ])

    def _generate_infracost_config(self) -> str:
        """Baseline Infracost project config."""
        return "\n".join([
            "version: 0.1",
            "projects:",
            "  - path: .",
            "    terraform_var_files:",
            "      - terraform.tfvars",
        ])

