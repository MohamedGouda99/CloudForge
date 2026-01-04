"""
GCP Terraform Generator.

Implements the CloudProviderGenerator interface for Google Cloud resources.
"""

from typing import Dict, List, Any, Set
from app.services.terraform.base import CloudProviderGenerator
from app.services.terraform.config import PROVIDER_CONFIGS, DEFAULTS, CloudProvider
from app.services.terraform.formatters import HCLFormatter
from app.models import Resource


class GCPGenerator(CloudProviderGenerator):
    """
    GCP-specific Terraform generator.

    Generates Terraform code for Google Cloud resources including:
    - Compute (Compute Engine, Cloud Functions)
    - Networking (VPC, Subnets, Firewall)
    - Storage (Cloud Storage, Persistent Disks)
    - Database (Cloud SQL, Firestore)
    - And more...
    """

    def __init__(self):
        self._config = PROVIDER_CONFIGS[CloudProvider.GCP]
        self._supported_types = self._build_supported_types()

    @property
    def provider_name(self) -> str:
        return self._config.terraform_provider

    @property
    def supported_resource_types(self) -> Set[str]:
        return self._supported_types

    def _build_supported_types(self) -> Set[str]:
        """Build the set of supported GCP resource types."""
        return {
            # Compute
            "google_compute_instance", "google_compute_instance_template",
            "google_compute_instance_group", "google_compute_instance_group_manager",

            # Networking
            "google_compute_network", "google_compute_subnetwork",
            "google_compute_firewall", "google_compute_router",
            "google_compute_router_nat", "google_compute_address",
            "google_compute_global_address",

            # Load Balancing
            "google_compute_forwarding_rule", "google_compute_backend_service",
            "google_compute_url_map", "google_compute_target_http_proxy",

            # Storage
            "google_storage_bucket", "google_storage_bucket_object",
            "google_compute_disk",

            # Database
            "google_sql_database_instance", "google_sql_database",
            "google_sql_user",

            # Serverless
            "google_cloudfunctions_function", "google_cloud_run_service",
            "google_app_engine_application",

            # Containers
            "google_container_cluster", "google_container_node_pool",
            "google_artifact_registry_repository",

            # IAM
            "google_service_account", "google_project_iam_member",
            "google_service_account_iam_member",

            # Pub/Sub
            "google_pubsub_topic", "google_pubsub_subscription",

            # BigQuery
            "google_bigquery_dataset", "google_bigquery_table",

            # Monitoring
            "google_logging_metric", "google_monitoring_alert_policy",
        }

    def generate_terraform_block(self) -> str:
        """Generate terraform block with GCP provider requirements."""
        return f"""terraform {{
  required_version = "{DEFAULTS.TERRAFORM_MIN_VERSION}"

  required_providers {{
    google = {{
      source  = "{self._config.provider_source}"
      version = "{self._config.provider_version}"
    }}
  }}
}}
"""

    def generate_provider_block(self, use_custom_endpoint: bool = False) -> str:
        """Generate GCP provider configuration."""
        return """
provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}
"""

    def generate_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate HCL for a GCP resource."""
        resource_type = resource.resource_type

        # Route to specific generators
        generators = {
            "google_compute_instance": self._generate_instance,
            "google_compute_network": self._generate_network,
            "google_storage_bucket": self._generate_bucket,
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
        """Generate HCL for a generic GCP resource."""
        resource_type = resource.resource_type
        resource_name = self.sanitize_identifier(resource.resource_name)
        config = resource.config or {}

        lines = [f'resource "{resource_type}" "{resource_name}" {{']
        lines.append(f'  name = "{resource.resource_name}"')

        skip_fields = {'name', 'labels'}

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

        # GCP uses labels instead of tags
        labels = config.get('labels', {})
        if not isinstance(labels, dict):
            labels = {}
        lines.append("")
        lines.append("  labels = {")
        lines.append(f'    name = "{resource.resource_name}"')
        for key, value in labels.items():
            if key != "name":
                lines.append(f'    {key} = "{value}"')
        lines.append("  }")
        lines.append("}")

        return "\n".join(lines)

    def _generate_instance(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate GCP Compute Instance."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "google_compute_instance" "{name}" {{
  name         = "{name}"
  machine_type = "{config.get('machine_type', DEFAULTS.DEFAULT_GCP_MACHINE_TYPE)}"
  zone         = "{config.get('zone', 'us-central1-a')}"

  boot_disk {{
    initialize_params {{
      image = "{config.get('image', 'debian-cloud/debian-11')}"
    }}
    auto_delete = true
  }}

  network_interface {{
    network    = {HCLFormatter.format_value(config.get('network', 'var.gcp_network_self_link'))}
    subnetwork = {HCLFormatter.format_value(config.get('subnetwork', 'var.gcp_subnetwork_self_link'))}
    access_config {{}}
  }}

  shielded_instance_config {{
    enable_integrity_monitoring = true
    enable_vtpm                 = true
  }}

  labels = {{
    name = "{name}"
  }}
}}
'''

    def _generate_network(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate GCP VPC Network."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "google_compute_network" "{name}" {{
  name                    = "{name}"
  auto_create_subnetworks = {str(config.get('auto_create_subnetworks', False)).lower()}
}}
'''

    def _generate_bucket(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate GCP Storage Bucket."""
        config = resource.config or {}
        name = resource.resource_name

        return f'''
resource "google_storage_bucket" "{name}" {{
  name     = "{config.get('bucket_name', name)}"
  location = "{config.get('location', 'US')}"

  labels = {{
    name = "{name}"
  }}
}}
'''

    def generate_data_sources(self, context: Dict[str, Any]) -> List[str]:
        """Generate GCP data sources."""
        return []  # Implement when needed

    def generate_iam_resources(self, context: Dict[str, Any]) -> List[str]:
        """Generate GCP IAM resources."""
        return []  # Implement when needed

    def get_default_region(self) -> str:
        return self._config.default_region

    def get_region_variable_name(self) -> str:
        return self._config.region_variable
