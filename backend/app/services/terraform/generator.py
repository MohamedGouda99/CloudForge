from typing import List, Dict, Any
from jinja2 import Environment, FileSystemLoader, Template  # noqa: F401 (Template reserved for future templating)
import os
from app.models import Resource, Project, CloudProvider


class TerraformGenerator:
    """Generate Terraform code from visual infrastructure design."""

    def __init__(self):
        self.env = Environment(loader=FileSystemLoader("app/services/terraform/templates"))

    def generate_terraform(self, project: Project, resources: List[Resource]) -> Dict[str, str]:
        """Generate complete Terraform configuration."""

        provider_config = self._generate_provider(project.cloud_provider)
        resource_configs = self._generate_resources(resources, project.cloud_provider)
        variables_config = self._generate_variables(resources, project.cloud_provider)
        outputs_config = self._generate_outputs(resources)
        tfvars_config = self._generate_tfvars(project.cloud_provider)

        return {
            "provider.tf": provider_config,
            "main.tf": resource_configs,
            "variables.tf": variables_config,
            "outputs.tf": outputs_config,
            "terraform.tfvars": tfvars_config,
        }

    def _generate_provider(self, cloud_provider: CloudProvider) -> str:
        """Generate provider configuration."""

        providers = {
            CloudProvider.AWS: """
terraform {
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
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

provider "archive" {}
""",
            CloudProvider.AZURE: """
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0"
}

provider "azurerm" {
  features {}
}
""",
            CloudProvider.GCP: """
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}
"""
        }

        return providers.get(cloud_provider, "")

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
    ) -> str:
        """Generate resource configurations including auxiliary data sources."""

        context = self._build_resource_context(resources, cloud_provider)

        blocks: List[str] = []
        data_source_blocks = self._generate_data_sources(context, cloud_provider)
        blocks.extend(data_source_blocks)

        for resource in resources:
            resource_block = self._generate_resource_block(resource, cloud_provider, context)
            if resource_block:
                blocks.append(resource_block)

        return "\n\n".join(blocks)

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

    def _generate_generic_resource(
        self,
        resource: Resource,
        _context: Dict[str, Any]
    ) -> str:
        """Fallback generator for resources without explicit handlers."""

        config = resource.config or {}

        if not config:
            return (
                f'# {resource.resource_type}.{resource.resource_name} is defined without configuration.\n'
                f'# Add properties in the designer to generate Terraform for this resource.\n'
                f'resource "{resource.resource_type}" "{resource.resource_name}" {{\n}}\n'
            )

        lines = [f'resource "{resource.resource_type}" "{resource.resource_name}" {{']

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
            if stripped.startswith("${") and stripped.endswith("}"):
                return stripped[2:-1]
            if stripped.startswith("data.") or stripped.startswith("var.") or stripped.startswith("local."):
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

        lines = [f'resource "aws_instance" "{resource.resource_name}" {{']

        ami_value = config.get("ami", "ami-0c55b159cbfafe1f0")
        lines.append(f"  ami           = {self._format_hcl_value(ami_value)}")

        instance_type = config.get("instance_type", "t2.micro")
        lines.append(f"  instance_type = {self._format_hcl_value(instance_type)}")

        key_name = config.get("key_name")
        if key_name:
            lines.append(f"  key_name      = {self._format_hcl_value(key_name)}")

        az_value = config.get("availability_zone")
        az_reference = self._resolve_availability_zone_reference(az_value, context)
        if az_reference:
            lines.append(f"  availability_zone = {az_reference}")
        elif az_value:
            lines.append(f"  availability_zone = {self._format_hcl_value(az_value)}")

        if "associate_public_ip_address" in config:
            lines.append(
                "  associate_public_ip_address = "
                f"{self._format_hcl_value(config.get('associate_public_ip_address', True))}"
            )

        if config.get("user_data"):
            lines.append("  user_data = <<-EOT")
            lines.append(config["user_data"])
            lines.append("EOT")

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        lines.append("  }")
        lines.append("}")

        return "\n".join(lines)

    def _generate_aws_vpc(self, resource: Resource, _context: Dict[str, Any]) -> str:
        config = resource.config or {}
        return f"""
resource "aws_vpc" "{resource.resource_name}" {{
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

        lines = [f'resource "aws_subnet" "{resource.resource_name}" {{']
        lines.append(f"  vpc_id            = {self._format_hcl_value(config.get('vpc_id', 'aws_vpc.main.id'))}")
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
        zip_filename = config.get('filename', f'{resource.resource_name}.zip')

        # Generate archive data source for the Lambda function code
        archive_data_source = f"""
# Create a placeholder Lambda function code archive
data "archive_file" "{resource.resource_name}_code" {{
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

        return archive_data_source + f"""
resource "aws_lambda_function" "{resource.resource_name}" {{
  function_name = "{config.get('function_name', resource.resource_name)}"
  runtime       = "{config.get('runtime', 'python3.11')}"
  handler       = "{config.get('handler', 'lambda_function.lambda_handler')}"
  role          = "{config.get('role_arn', 'arn:aws:iam::123456789012:role/lambda_execution_role')}"

  filename         = data.archive_file.{resource.resource_name}_code.output_path
  source_code_hash = data.archive_file.{resource.resource_name}_code.output_base64sha256

  tags = {{
    Name = "{resource.resource_name}"
  }}
}}
"""

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
    azurerm_network_interface.{config.get('network_interface', 'main-nic')}.id
  ]

  admin_ssh_key {{
    username   = "{config.get('admin_username', 'azureuser')}"
    public_key = "{config.get('public_key', 'ssh-rsa AAA...')}"
  }}

  os_disk {{
    name                 = "{resource.resource_name}-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }}

  source_image_reference {{
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }}

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
  }}

  network_interface {{
    network = "{config.get('network', 'default')}"
    access_config {{}}
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

        return "\n".join(variables) if variables else "# No variables defined"

    def _generate_outputs(self, resources: List[Resource]) -> str:
        """Generate outputs.tf file."""

        outputs: List[str] = []

        for resource in resources:
            if resource.resource_type in ["aws_instance", "gcp_compute_instance", "azure_virtual_machine"]:
                outputs.append(f"""
output "{resource.resource_name}_id" {{
  description = "ID of {resource.resource_name}"
  value       = {resource.resource_type}.{resource.resource_name}.id
}}
""")

        return "\n".join(outputs) if outputs else "# No outputs defined"

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

        elif cloud_provider == CloudProvider.GCP:
            tfvars.append("# GCP Configuration")
            tfvars.append('gcp_project           = "YOUR_PROJECT_ID"')
            tfvars.append('gcp_region            = "us-central1"')
            tfvars.append('gcp_credentials_file  = "path/to/credentials.json"')

        tfvars.append("")
        tfvars.append("# Sensitive Variables (use environment variables or secret management)")
        tfvars.append('# db_password = "your-secure-password"')

        return "\n".join(tfvars)

