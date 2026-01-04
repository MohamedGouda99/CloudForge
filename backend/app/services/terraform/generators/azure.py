"""
Azure Terraform Generator.

Implements the CloudProviderGenerator interface for Azure resources.
"""

from typing import Dict, List, Any, Set
from app.services.terraform.base import CloudProviderGenerator
from app.services.terraform.config import PROVIDER_CONFIGS, DEFAULTS, CloudProvider
from app.services.terraform.formatters import HCLFormatter
from app.models import Resource


class AzureGenerator(CloudProviderGenerator):
    """
    Azure-specific Terraform generator.

    Generates Terraform code for Azure resources including:
    - Compute (VMs, Scale Sets, Functions)
    - Networking (VNets, Subnets, NSGs)
    - Storage (Storage Accounts, Blobs)
    - Database (SQL, CosmosDB)
    - And more...
    """

    def __init__(self):
        self._config = PROVIDER_CONFIGS[CloudProvider.AZURE]
        self._supported_types = self._build_supported_types()

    @property
    def provider_name(self) -> str:
        return self._config.terraform_provider

    @property
    def supported_resource_types(self) -> Set[str]:
        return self._supported_types

    def _build_supported_types(self) -> Set[str]:
        """Build the set of supported Azure resource types."""
        return {
            # Resource Group
            "azurerm_resource_group",

            # Compute
            "azurerm_linux_virtual_machine", "azurerm_windows_virtual_machine",
            "azurerm_virtual_machine", "azurerm_virtual_machine_scale_set",
            "azurerm_availability_set",

            # Networking
            "azurerm_virtual_network", "azurerm_subnet",
            "azurerm_network_security_group", "azurerm_network_security_rule",
            "azurerm_network_interface", "azurerm_public_ip",
            "azurerm_lb", "azurerm_lb_backend_address_pool",
            "azurerm_application_gateway",

            # Storage
            "azurerm_storage_account", "azurerm_storage_container",
            "azurerm_storage_blob", "azurerm_managed_disk",

            # Database
            "azurerm_sql_server", "azurerm_sql_database",
            "azurerm_cosmosdb_account", "azurerm_cosmosdb_sql_database",
            "azurerm_mysql_server", "azurerm_postgresql_server",

            # Serverless
            "azurerm_function_app", "azurerm_app_service", "azurerm_app_service_plan",

            # Containers
            "azurerm_kubernetes_cluster", "azurerm_container_registry",
            "azurerm_container_group",

            # Identity
            "azurerm_user_assigned_identity",

            # Key Vault
            "azurerm_key_vault", "azurerm_key_vault_secret",

            # Monitoring
            "azurerm_log_analytics_workspace", "azurerm_application_insights",
        }

    def generate_terraform_block(self) -> str:
        """Generate terraform block with Azure provider requirements."""
        return f"""terraform {{
  required_version = "{DEFAULTS.TERRAFORM_MIN_VERSION}"

  required_providers {{
    azurerm = {{
      source  = "{self._config.provider_source}"
      version = "{self._config.provider_version}"
    }}
  }}
}}
"""

    def generate_provider_block(self, use_custom_endpoint: bool = False) -> str:
        """Generate Azure provider configuration."""
        return """
provider "azurerm" {
  features {}
}
"""

    def generate_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate HCL for an Azure resource."""
        resource_type = resource.resource_type

        # Route to specific generators
        generators = {
            "azurerm_linux_virtual_machine": self._generate_linux_vm,
            "azurerm_virtual_network": self._generate_vnet,
            "azurerm_storage_account": self._generate_storage,
        }

        if resource_type in generators:
            return generators[resource_type](resource, context, var_collector)

        return self._generate_generic_resource(resource, context, var_collector)

    def _generate_generic_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate HCL for a generic Azure resource."""
        resource_type = resource.resource_type
        resource_name = self.sanitize_identifier(resource.resource_name)
        config = resource.config or {}

        lines = [f'resource "{resource_type}" "{resource_name}" {{']
        lines.append(f'  name = "{resource.resource_name}"')

        skip_fields = {'name', 'tags'}

        for field_name, value in config.items():
            if field_name in skip_fields:
                continue
            if value is None or value == '' or value is False:
                continue

            if isinstance(value, dict) and value:
                block_lines = HCLFormatter.format_block(field_name, value)
                lines.extend(block_lines)
            elif isinstance(value, list) and value:
                formatted = HCLFormatter.format_value(value)
                lines.append(f"  {field_name} = {formatted}")
            else:
                formatted = HCLFormatter.format_value(value)
                lines.append(f"  {field_name} = {formatted}")

        lines.append("")
        lines.append(HCLFormatter.format_tags(config.get('tags', {}), resource.resource_name))
        lines.append("}")

        return "\n".join(lines)

    def _generate_linux_vm(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate Azure Linux VM."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "azurerm_linux_virtual_machine" "{name}" {{
  name                = "{name}"
  resource_group_name = "{config.get('resource_group_name', 'main-rg')}"
  location            = "{config.get('location', self.get_default_region())}"
  size                = "{config.get('vm_size', DEFAULTS.DEFAULT_AZURE_VM_SIZE)}"
  admin_username      = "{config.get('admin_username', 'azureuser')}"
  network_interface_ids = [
    {config.get('network_interface', 'var.azure_network_interface_id')}
  ]

  admin_ssh_key {{
    username   = "{config.get('admin_username', 'azureuser')}"
    public_key = "{config.get('public_key', 'ssh-rsa AAA...')}"
  }}

  os_disk {{
    name                 = "{name}-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
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
    Name = "{name}"
  }}
}}
'''

    def _generate_vnet(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate Azure Virtual Network."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "azurerm_virtual_network" "{name}" {{
  name                = "{name}"
  location            = "{config.get('location', self.get_default_region())}"
  resource_group_name = {config.get('resource_group', 'azurerm_resource_group.main.name')}
  address_space       = {config.get('address_space', '["10.0.0.0/16"]')}

  tags = {{
    Name = "{name}"
  }}
}}
'''

    def _generate_storage(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate Azure Storage Account."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "azurerm_storage_account" "{name}" {{
  name                     = "{name}"
  resource_group_name      = {config.get('resource_group', 'azurerm_resource_group.main.name')}
  location                 = "{config.get('location', self.get_default_region())}"
  account_tier             = "{config.get('account_tier', 'Standard')}"
  account_replication_type = "{config.get('replication_type', 'LRS')}"
  enable_https_traffic_only = true
  min_tls_version            = "TLS1_2"
  allow_blob_public_access   = false

  tags = {{
    Name = "{name}"
  }}
}}
'''

    def generate_data_sources(self, context: Dict[str, Any]) -> List[str]:
        """Generate Azure data sources."""
        return []  # Azure typically doesn't need data sources like AWS

    def generate_iam_resources(self, context: Dict[str, Any]) -> List[str]:
        """Generate Azure identity resources."""
        return []  # Implement when needed

    def get_default_region(self) -> str:
        return self._config.default_region

    def get_region_variable_name(self) -> str:
        return self._config.region_variable
