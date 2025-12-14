from typing import List, Dict, Any, Tuple
from jinja2 import Environment, FileSystemLoader, Template  # noqa: F401 (Template reserved for future templating)
import os
from app.models import Resource, Project, CloudProvider


class TerraformGenerator:
    """Generate Terraform code from visual infrastructure design."""

    def __init__(self):
        self.env = Environment(loader=FileSystemLoader("app/services/terraform/templates"))

    def generate_terraform(self, project: Project, resources: List[Resource]) -> Dict[str, str]:
        """
        Generate complete Terraform configuration using a root/module layout.
        Root files manage providers and module wiring; resources live under modules/infrastructure.
        """

        versions_config = self._generate_versions(project.cloud_provider)
        provider_config = self._generate_provider(project.cloud_provider)
        module_body, _categorized = self._generate_resources(resources, project.cloud_provider)
        module_outputs, output_names = self._generate_outputs(resources)
        variables_config = self._generate_variables(resources, project.cloud_provider)
        tfvars_config = self._generate_tfvars(project.cloud_provider)

        # Root module wiring
        main_config = '\n'.join([
            'module "infrastructure" {',
            '  source = "./modules/infrastructure"',
            '}',
            ''
        ])

        # Forward module outputs to root so callers can consume them easily
        root_outputs = self._forward_module_outputs(output_names, module_name="infrastructure")

        files: Dict[str, str] = {
            "versions.tf": versions_config,
            "providers.tf": provider_config,
            "main.tf": main_config,
            "variables.tf": variables_config,
            "outputs.tf": root_outputs,
            "terraform.tfvars": tfvars_config,
            "modules/infrastructure/main.tf": module_body or "# No resources defined",
            "modules/infrastructure/outputs.tf": module_outputs or "# No outputs defined",
            "modules/infrastructure/variables.tf": "# Module inherits root provider inputs",
            ".tfsec.yml": self._generate_tfsec_config(),
            ".terrascan.toml": self._generate_terrascan_config(),
            "infracost.yml": self._generate_infracost_config(),
        }

        return files

    def _generate_provider(self, cloud_provider: CloudProvider) -> str:
        """Generate provider configuration."""

        providers = {
            CloudProvider.AWS: """
provider "aws" {
  region = var.aws_region
}

provider "archive" {}
""",
            CloudProvider.AZURE: """
provider "azurerm" {
  features {}
}
""",
            CloudProvider.GCP: """
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}
"""
        }

        return providers.get(cloud_provider, "")

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

        return data_blocks

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

        generators = {
            # AWS Resources
            "aws_instance": lambda res: self._generate_aws_instance(res, context),
            "aws_vpc": lambda res: self._generate_aws_vpc(res, context),
            "aws_subnet": lambda res: self._generate_aws_subnet(res, context),
            "aws_security_group": lambda res: self._generate_aws_security_group(res, context),
            "aws_s3_bucket": lambda res: self._generate_aws_s3_bucket(res, context),
            "aws_rds_instance": lambda res: self._generate_aws_rds_instance(res, context),
            "aws_lambda_function": lambda res: self._generate_aws_lambda(res, context),
            "aws_nat_gateway": lambda res: self._generate_aws_nat_gateway(res, context),

            # Azure Resources
            "azure_virtual_machine": lambda res: self._generate_azure_vm(res, context),
            "azure_virtual_network": lambda res: self._generate_azure_vnet(res, context),
            "azure_storage_account": lambda res: self._generate_azure_storage(res, context),

            # GCP Resources
            "gcp_compute_instance": lambda res: self._generate_gcp_instance(res, context),
            "gcp_compute_network": lambda res: self._generate_gcp_network(res, context),
            "gcp_storage_bucket": lambda res: self._generate_gcp_bucket(res, context),
        }

        generator_func = generators.get(resource.resource_type)
        if generator_func:
            return generator_func(resource)

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
        _context: Dict[str, Any]
    ) -> str:
        """Fallback generator for resources without explicit handlers."""

        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)

        if not config:
            return (
                f'# {resource.resource_type}.{sanitized_name} is defined without configuration.\n'
                f'# Add properties in the designer to generate Terraform for this resource.\n'
                f'resource "{resource.resource_type}" "{sanitized_name}" {{\n}}\n'
            )

        lines = [f'resource "{resource.resource_type}" "{sanitized_name}" {{']

        for key, value in config.items():
            formatted_value = self._format_hcl_value(value, indent_level=2)
            if "\n" in formatted_value:
                indented_value = "\n".join(
                    f"  {line}" if index > 0 else f"  {key} = {line}"
                    for index, line in enumerate(formatted_value.split("\n"))
                )
                lines.append(indented_value)
            else:
                lines.append(f"  {key} = {formatted_value}")

        lines.append("}")
        return "\n".join(lines)

    # -------------------------------------------------------------------------
    # Formatting helpers
    # -------------------------------------------------------------------------

    def _format_hcl_value(self, value: Any, indent_level: int = 2) -> str:
        """Format Python values into HCL-compatible strings."""

        indent = " " * indent_level

        if isinstance(value, bool):
            return "true" if value else "false"
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, str):
            stripped = value.strip()
            # BRAINBOARD-STYLE: Handle Terraform interpolation syntax
            if stripped.startswith("${") and stripped.endswith("}"):
                return stripped[2:-1]
            # BRAINBOARD-STYLE: Handle Terraform references (data sources, variables, locals, resources)
            if (stripped.startswith("data.") or
                stripped.startswith("var.") or
                stripped.startswith("local.") or
                stripped.startswith("aws_") or  # AWS resource references
                stripped.startswith("azurerm_") or  # Azure resource references
                stripped.startswith("google_")):  # GCP resource references
                return stripped
            escaped = value.replace('"', '\\"')
            return f'"{escaped}"'
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
    # AWS resource generators
    # -------------------------------------------------------------------------

    def _generate_aws_instance(self, resource: Resource, context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)

        lines = [f'resource "aws_instance" "{sanitized_name}" {{']

        # BRAINBOARD-STYLE: Use actual user config, only fall back to defaults if truly empty
        ami_value = config.get("ami") or config.get("ami_id")
        if not ami_value:
            # Only use default as last resort
            ami_value = "ami-0c55b159cbfafe1f0"
        lines.append(f"  ami           = {self._format_hcl_value(ami_value)}")

        instance_type = config.get("instance_type")
        if not instance_type:
            # Only use default as last resort
            instance_type = "t2.micro"
        lines.append(f"  instance_type = {self._format_hcl_value(instance_type)}")

        # BRAINBOARD-STYLE: Use auto-wired subnet_id from edges, or explicit config, or fallback
        subnet_id = config.get("subnet_id")
        if not subnet_id:
            # Check if it's a Terraform reference (from auto-wiring)
            subnet_id = "var.subnet_id"
        lines.append(f"  subnet_id     = {self._format_hcl_value(subnet_id)}")

        # BRAINBOARD-STYLE: Handle security groups (can be auto-wired from edges)
        vpc_security_group_ids = config.get("vpc_security_group_ids")
        if vpc_security_group_ids:
            if isinstance(vpc_security_group_ids, list):
                # Format as Terraform list
                formatted_sgs = "[" + ", ".join(self._format_hcl_value(sg) for sg in vpc_security_group_ids) + "]"
                lines.append(f"  vpc_security_group_ids = {formatted_sgs}")
            else:
                lines.append(f"  vpc_security_group_ids = {self._format_hcl_value(vpc_security_group_ids)}")

        key_name = config.get("key_name")
        if key_name:
            lines.append(f"  key_name      = {self._format_hcl_value(key_name)}")

        az_value = config.get("availability_zone")
        az_reference = self._resolve_availability_zone_reference(az_value, context)
        if az_reference:
            lines.append(f"  availability_zone = {az_reference}")
        elif az_value:
            lines.append(f"  availability_zone = {self._format_hcl_value(az_value)}")

        # Enforce secure metadata access
        lines.append("  metadata_options {")
        lines.append('    http_tokens = "required"')
        lines.append("  }")

        # Enable detailed monitoring by default (can be overridden)
        monitoring = config.get("monitoring", True)
        if isinstance(monitoring, bool):
            lines.append(f"  monitoring = {str(monitoring).lower()}")
        else:
            lines.append(f"  monitoring = {self._format_hcl_value(monitoring)}")

        if "associate_public_ip_address" in config:
            lines.append(
                "  associate_public_ip_address = "
                f"{self._format_hcl_value(config.get('associate_public_ip_address', True))}"
            )

        # Encrypt root volume by default
        lines.append("  root_block_device {")
        lines.append("    encrypted = true")
        lines.append("  }")

        if config.get("user_data"):
            lines.append("  user_data = <<-EOT")
            lines.append(config["user_data"])
            lines.append("EOT")

        # BRAINBOARD-STYLE: Include user-defined tags
        tags = config.get("tags", {})
        if not isinstance(tags, dict):
            tags = {}

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        for key, value in tags.items():
            if key != "Name":  # Avoid duplicate Name tag
                lines.append(f'    {key} = "{value}"')
        lines.append("  }")
        lines.append("}")

        return "\n".join(lines)

    def _generate_aws_vpc(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)
        return f"""
resource "aws_vpc" "{sanitized_name}" {{
  cidr_block           = "{config.get('cidr_block', '10.0.0.0/16')}"
  enable_dns_hostnames = {str(config.get('enable_dns_hostnames', True)).lower()}
  enable_dns_support   = {str(config.get('enable_dns_support', True)).lower()}

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_subnet(self, resource: Resource, context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)

        lines = [f'resource "aws_subnet" "{sanitized_name}" {{']
        vpc_id = config.get('vpc_id')
        if not vpc_id:
            # Enforce explicit VPC wiring to avoid default VPC usage
            vpc_id = 'var.vpc_id'
        lines.append(f"  vpc_id            = {self._format_hcl_value(vpc_id)}")
        lines.append(f"  cidr_block        = {self._format_hcl_value(config.get('cidr_block', '10.0.1.0/24'))}")

        az_value = config.get("availability_zone")
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
        ingress_rules = config.get("ingress_rules", [])
        ingress_blocks = "\n  ".join([
            f"""ingress {{
    from_port   = {rule.get('from_port', 80)}
    to_port     = {rule.get('to_port', 80)}
    protocol    = "{rule.get('protocol', 'tcp')}"
    cidr_blocks = {rule.get('cidr_blocks', '["0.0.0.0/0"]')}
  }}"""
            for rule in ingress_rules
        ])

        return f"""
resource "aws_security_group" "{resource.resource_name}" {{
  name        = "{resource.resource_name}"
  description = "{config.get('description', 'Security group')}"
  vpc_id      = {config.get('vpc_id', 'aws_vpc.main.id')}

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
        return f"""
resource "aws_s3_bucket" "{resource.resource_name}" {{
  bucket = "{config.get('bucket', resource.resource_name)}"

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_rds_instance(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "aws_db_instance" "{resource.resource_name}" {{
  allocated_storage    = {config.get('allocated_storage', 20)}
  db_name              = "{config.get('db_name', 'mydb')}"
  engine               = "{config.get('engine', 'mysql')}"
  engine_version       = "{config.get('engine_version', '8.0')}"
  instance_class       = "{config.get('instance_class', 'db.t3.micro')}"
  username             = "{config.get('username', 'admin')}"
  password             = var.db_password
  parameter_group_name = "{config.get('parameter_group_name', 'default.mysql8.0')}"
  skip_final_snapshot  = true

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

    def _generate_aws_lambda(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        sanitized_name = self._sanitize_identifier(resource.resource_name)
        zip_filename = config.get('filename', f'{sanitized_name}.zip')

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

        # BRAINBOARD-STYLE: Use actual config values
        function_name = config.get('function_name') or resource.resource_name
        lines.append(f'  function_name = "{function_name}"')

        runtime = config.get('runtime') or 'python3.11'
        lines.append(f'  runtime       = "{runtime}"')

        handler = config.get('handler') or 'lambda_function.lambda_handler'
        lines.append(f'  handler       = "{handler}"')

        role = config.get('role') or config.get('role_arn') or 'arn:aws:iam::123456789012:role/lambda_execution_role'
        lines.append(f'  role          = {self._format_hcl_value(role)}')

        lines.append(f"  filename         = data.archive_file.{sanitized_name}_code.output_path")
        lines.append(f"  source_code_hash = data.archive_file.{sanitized_name}_code.output_base64sha256")

        # BRAINBOARD-STYLE: Handle VPC config (auto-wired from edges)
        vpc_config = config.get('vpc_config')
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
        memory_size = config.get('memory_size')
        if memory_size:
            lines.append(f"  memory_size = {memory_size}")

        timeout = config.get('timeout')
        if timeout:
            lines.append(f"  timeout = {timeout}")

        # Environment variables
        environment = config.get('environment')
        if environment and isinstance(environment, dict) and environment:
            lines.append("  environment {")
            lines.append("    variables = {")
            for key, val in environment.items():
                lines.append(f'      {key} = "{val}"')
            lines.append("    }")
            lines.append("  }")

        # BRAINBOARD-STYLE: Include user-defined tags
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
        subnet_id = config.get('subnet_id', '')

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
}

variable "aws_access_key" {
  description = "AWS access key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
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
        """Generate terraform.tfvars file with example values."""

        tfvars: List[str] = []

        tfvars.append("# Terraform Variables")
        tfvars.append("# Fill in your actual values below")
        tfvars.append("")

        if cloud_provider == CloudProvider.AWS:
            tfvars.append("# AWS Configuration")
            tfvars.append('aws_region     = "us-east-1"')
            tfvars.append('# aws_access_key = "YOUR_AWS_ACCESS_KEY"  # Or use AWS CLI credentials')
            tfvars.append('# aws_secret_key = "YOUR_AWS_SECRET_KEY"  # Or use AWS CLI credentials')

        elif cloud_provider == CloudProvider.AZURE:
            tfvars.append("# Azure Configuration")
            tfvars.append('azure_subscription_id = "YOUR_SUBSCRIPTION_ID"')
            tfvars.append('azure_tenant_id       = "YOUR_TENANT_ID"')
            tfvars.append('azure_location        = "eastus"')
            tfvars.append('# azure_network_interface_id = "YOUR_NIC_ID"')
            tfvars.append('# azure_disk_encryption_set_id = "YOUR_DISK_ENC_SET_ID"')

        elif cloud_provider == CloudProvider.GCP:
            tfvars.append("# GCP Configuration")
            tfvars.append('gcp_project           = "YOUR_PROJECT_ID"')
            tfvars.append('gcp_region            = "us-central1"')
            tfvars.append('gcp_credentials_file  = "path/to/credentials.json"')
            tfvars.append('# gcp_network_self_link     = "projects/xxx/global/networks/my-vpc"')
            tfvars.append('# gcp_subnetwork_self_link  = "projects/xxx/regions/us-central1/subnetworks/my-subnet"')

        tfvars.append("")
        tfvars.append("# Sensitive Variables (use environment variables or secret management)")
        tfvars.append('# db_password = "your-secure-password"')

        return "\n".join(tfvars)

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

