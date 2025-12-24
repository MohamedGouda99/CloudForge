"""
Schema-Driven Terraform Generator

This module generates Terraform HCL code dynamically based on frontend service schemas.
Instead of writing custom generators for each service, it reads the schema and generates
code automatically.

This allows supporting ALL services (200+) without writing individual generators.
"""

import json
from typing import Dict, List, Any, Optional, Set
from pathlib import Path
from app.models import Resource
from app.services.terraform.value_detector import ValueDetector


# ============================================================================
# TERRAFORM TYPE MAPPINGS
# ============================================================================
# Maps resource_type -> field_name -> expected_type
# This ensures proper type handling for list, set, map, number, bool fields
# ============================================================================

# Fields that MUST be lists (list(string), list(number), set(string), etc.)
LIST_TYPE_FIELDS: Dict[str, Set[str]] = {
    # AWS Compute
    "aws_instance": {
        "vpc_security_group_ids", "security_groups", "ipv6_addresses",
        "secondary_private_ips", "network_interface"
    },
    "aws_launch_template": {
        "vpc_security_group_ids", "security_group_names"
    },
    "aws_autoscaling_group": {
        "target_group_arns", "vpc_zone_identifier", "termination_policies",
        "load_balancers", "availability_zones", "suspended_processes",
        "enabled_metrics", "warm_pool_state"
    },
    "aws_spot_instance_request": {
        "vpc_security_group_ids", "security_groups", "ipv6_addresses"
    },
    "aws_spot_fleet_request": {
        "target_group_arns"
    },
    "aws_batch_compute_environment": {
        "instance_type", "security_group_ids", "subnets"
    },
    "aws_batch_job_definition": {
        "platform_capabilities"
    },

    # AWS Networking
    "aws_vpc": {
        "ipv4_ipam_pool_id"  # Not a list, but included for completeness
    },
    "aws_nat_gateway": {
        "secondary_allocation_ids", "secondary_private_ip_addresses"
    },
    "aws_route_table": {
        "propagating_vgws"
    },
    "aws_security_group": {
        "ingress", "egress"  # Blocks, but may come as lists
    },
    "aws_security_group_rule": {
        "cidr_blocks", "ipv6_cidr_blocks", "prefix_list_ids"
    },
    "aws_network_acl": {
        "subnet_ids"
    },
    "aws_ec2_transit_gateway": {
        "transit_gateway_cidr_blocks"
    },
    "aws_ec2_transit_gateway_vpc_attachment": {
        "subnet_ids"
    },
    "aws_vpc_endpoint": {
        "route_table_ids", "subnet_ids", "security_group_ids"
    },
    "aws_network_interface": {
        "ipv4_prefixes", "ipv6_address_list", "private_ips", "security_groups"
    },
    "aws_lb": {
        "security_groups", "subnets"
    },
    "aws_route53_record": {
        "records"
    },
    "aws_cloudfront_distribution": {
        "aliases"
    },
    "aws_api_gateway_rest_api": {
        "binary_media_types"
    },

    # AWS Database
    "aws_db_instance": {
        "vpc_security_group_ids", "db_security_groups", "enabled_cloudwatch_logs_exports"
    },
    "aws_rds_cluster": {
        "availability_zones", "vpc_security_group_ids", "enabled_cloudwatch_logs_exports"
    },
    "aws_elasticache_cluster": {
        "security_group_ids", "snapshot_arns"
    },
    "aws_elasticache_replication_group": {
        "security_group_ids", "snapshot_arns"
    },
    "aws_dynamodb_table": {
        "attribute"  # Block, but may need list handling
    },

    # AWS Storage
    "aws_s3_bucket": {
        # Most S3 fields are blocks or strings
    },
    "aws_efs_file_system": {
        # Most EFS fields are strings or blocks
    },

    # AWS Serverless
    "aws_lambda_function": {
        "layers", "architectures"
    },
    "aws_api_gateway_method": {
        "authorization_scopes"
    },

    # AWS Containers
    "aws_ecs_service": {
        "capacity_provider_strategy", "load_balancer", "placement_constraints",
        "placement_strategy", "security_groups", "subnets"
    },
    "aws_ecs_task_definition": {
        "container_definitions", "requires_compatibilities", "volumes"
    },
    "aws_eks_cluster": {
        "enabled_cluster_log_types", "subnet_ids", "security_group_ids"
    },
    "aws_eks_node_group": {
        "subnet_ids", "instance_types"
    },

    # AWS Messaging
    "aws_sns_topic": {
        # Most fields are strings
    },
    "aws_sqs_queue": {
        # Most fields are strings
    },

    # AWS Security
    "aws_iam_role": {
        "managed_policy_arns"
    },
    "aws_iam_user": {
        # Most fields are strings
    },
    "aws_kms_key": {
        # Most fields are strings
    },

    # AWS Analytics
    "aws_kinesis_stream": {
        # Most fields are strings or numbers
    },
    "aws_athena_workgroup": {
        # Most fields are strings
    },
}

# Fields that MUST be numbers (not quoted)
NUMBER_TYPE_FIELDS: Dict[str, Set[str]] = {
    "aws_instance": {
        "cpu_core_count", "cpu_threads_per_core"
    },
    "aws_autoscaling_group": {
        "max_size", "min_size", "desired_capacity", "default_cooldown",
        "health_check_grace_period", "max_instance_lifetime"
    },
    "aws_db_instance": {
        "allocated_storage", "max_allocated_storage", "iops", "port",
        "backup_retention_period", "monitoring_interval"
    },
    "aws_rds_cluster": {
        "port", "backup_retention_period"
    },
    "aws_lambda_function": {
        "memory_size", "timeout", "reserved_concurrent_executions"
    },
    "aws_ecs_service": {
        "desired_count"
    },
    "aws_eks_node_group": {
        "desired_size", "max_size", "min_size"
    },
    "aws_elasticache_cluster": {
        "num_cache_nodes", "port"
    },
    "aws_kinesis_stream": {
        "shard_count", "retention_period"
    },
    "aws_lb_target_group": {
        "port", "deregistration_delay", "slow_start"
    },
    "aws_lb_listener": {
        "port"
    },
    "aws_route53_record": {
        "ttl"
    },
    "aws_security_group_rule": {
        "from_port", "to_port"
    },
}

# Fields that are REPEATED BLOCKS (not list syntax, but multiple block entries)
# These need special HCL formatting: ingress { } ingress { } instead of ingress = [...]
BLOCK_TYPE_FIELDS: Dict[str, Set[str]] = {
    "aws_security_group": {
        "ingress", "egress"
    },
    "aws_security_group_rule": set(),  # Uses separate resource
    "aws_network_acl": {
        "ingress", "egress"
    },
    "aws_instance": {
        "ebs_block_device", "network_interface", "root_block_device",
        "credit_specification", "metadata_options"
    },
    "aws_launch_template": {
        "block_device_mappings", "network_interfaces", "iam_instance_profile",
        "monitoring", "placement", "metadata_options"
    },
    "aws_autoscaling_group": {
        "launch_template", "mixed_instances_policy", "instance_refresh", "tag"
    },
    "aws_lb": {
        "access_logs", "subnet_mapping"
    },
    "aws_lb_target_group": {
        "health_check", "stickiness"
    },
    "aws_lb_listener": {
        "default_action"
    },
    "aws_route_table": {
        "route"
    },
    "aws_vpc_endpoint": {
        "dns_options"
    },
    "aws_db_instance": {
        "restore_to_point_in_time", "s3_import"
    },
    "aws_rds_cluster": {
        "scaling_configuration", "serverlessv2_scaling_configuration"
    },
    "aws_lambda_function": {
        "vpc_config", "environment", "file_system_config", "tracing_config"
    },
    "aws_ecs_service": {
        "network_configuration", "load_balancer", "service_registries"
    },
    "aws_eks_cluster": {
        "vpc_config", "encryption_config"
    },
}

# Type mappings for fields INSIDE blocks (for proper formatting)
BLOCK_FIELD_TYPES: Dict[str, Dict[str, str]] = {
    "ingress": {
        "from_port": "number",
        "to_port": "number",
        "protocol": "string",
        "cidr_blocks": "list(string)",
        "ipv6_cidr_blocks": "list(string)",
        "prefix_list_ids": "list(string)",
        "security_groups": "list(string)",
        "self": "bool",
        "description": "string",
    },
    "egress": {
        "from_port": "number",
        "to_port": "number",
        "protocol": "string",
        "cidr_blocks": "list(string)",
        "ipv6_cidr_blocks": "list(string)",
        "prefix_list_ids": "list(string)",
        "security_groups": "list(string)",
        "self": "bool",
        "description": "string",
    },
    "root_block_device": {
        "volume_type": "string",
        "volume_size": "number",
        "iops": "number",
        "throughput": "number",
        "encrypted": "bool",
        "kms_key_id": "string",
        "delete_on_termination": "bool",
    },
    "ebs_block_device": {
        "device_name": "string",
        "volume_type": "string",
        "volume_size": "number",
        "iops": "number",
        "throughput": "number",
        "encrypted": "bool",
        "kms_key_id": "string",
        "snapshot_id": "string",
        "delete_on_termination": "bool",
    },
    "vpc_config": {
        "subnet_ids": "list(string)",
        "security_group_ids": "list(string)",
    },
    "health_check": {
        "enabled": "bool",
        "healthy_threshold": "number",
        "interval": "number",
        "matcher": "string",
        "path": "string",
        "port": "string",
        "protocol": "string",
        "timeout": "number",
        "unhealthy_threshold": "number",
    },
    "default_action": {
        "type": "string",
        "order": "number",
        "target_group_arn": "string",
    },
}

# Fields that MUST be booleans (not quoted)
BOOL_TYPE_FIELDS: Dict[str, Set[str]] = {
    "aws_instance": {
        "associate_public_ip_address", "ebs_optimized", "disable_api_termination",
        "monitoring", "hibernation", "source_dest_check"
    },
    "aws_vpc": {
        "enable_dns_support", "enable_dns_hostnames", "assign_generated_ipv6_cidr_block",
        "enable_network_address_usage_metrics"
    },
    "aws_subnet": {
        "map_public_ip_on_launch", "enable_dns64", "ipv6_native",
        "map_customer_owned_ip_on_launch"
    },
    "aws_db_instance": {
        "publicly_accessible", "multi_az", "storage_encrypted", "skip_final_snapshot",
        "copy_tags_to_snapshot", "auto_minor_version_upgrade", "apply_immediately",
        "deletion_protection", "performance_insights_enabled"
    },
    "aws_rds_cluster": {
        "storage_encrypted", "skip_final_snapshot", "copy_tags_to_snapshot",
        "deletion_protection", "enable_http_endpoint"
    },
    "aws_lambda_function": {
        "publish"
    },
    "aws_lb": {
        "internal", "enable_deletion_protection", "enable_cross_zone_load_balancing",
        "enable_http2", "preserve_host_header", "drop_invalid_header_fields"
    },
    "aws_cloudfront_distribution": {
        "enabled", "is_ipv6_enabled", "retain_on_delete", "wait_for_deployment"
    },
    "aws_security_group": {
        "revoke_rules_on_delete"
    },
    "aws_security_group_rule": {
        "self"
    },
}


class SchemaDrivenGenerator:
    """
    Generates Terraform HCL dynamically based on service schemas.

    This is the scalable approach - supports ANY service defined in frontend schemas
    without needing custom generator code for each one.
    """

    def __init__(self, schemas_path: Optional[str] = None):
        """
        Initialize schema-driven generator.

        Args:
            schemas_path: Path to frontend schemas directory (optional for now)
        """
        self.schemas_path = schemas_path
        self._schemas_cache: Dict[str, Any] = {}

    def generate_resource(
        self,
        resource: Resource,
        config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> str:
        """
        Generate Terraform HCL for ANY resource based on user configuration.

        This is the magic function - it works for EC2, Lambda, S3, RDS, or ANY service
        by reading what the user configured and outputting only those fields.

        Args:
            resource: Resource model from database
            config: User configuration (filtered - no empty strings or False)
            context: Generation context

        Returns:
            Terraform HCL code as string
        """
        resource_type = resource.resource_type
        resource_name = self._sanitize_identifier(resource.resource_name)

        lines = [f'resource "{resource_type}" "{resource_name}" {{']

        # Get type mappings for this resource type
        list_fields = LIST_TYPE_FIELDS.get(resource_type, set())
        number_fields = NUMBER_TYPE_FIELDS.get(resource_type, set())
        bool_fields = BOOL_TYPE_FIELDS.get(resource_type, set())
        block_fields = BLOCK_TYPE_FIELDS.get(resource_type, set())

        # Process all configured fields dynamically
        for field_name, field_value in config.items():
            # Skip internal fields
            if field_name in {'name', 'tags'}:
                continue

            # Skip if value is None, empty string, or False (already filtered by _get_config_value)
            if field_value is None or field_value == '' or field_value is False:
                continue

            # Handle BLOCK type fields (ingress, egress, ebs_block_device, etc.)
            if field_name in block_fields:
                lines.extend(self._format_repeated_block(field_name, field_value))
                continue

            # Handle dicts/objects specially (nested blocks not in block_fields)
            if isinstance(field_value, dict) and field_value:
                lines.extend(self._format_block(field_name, field_value))
                continue

            # Apply type coercion based on schema for simple fields
            formatted_value = self._format_field_value(
                field_name, field_value, resource_type,
                list_fields, number_fields, bool_fields
            )

            # Add the field to HCL
            lines.append(f"  {field_name} = {formatted_value}")

        # Always add tags with at minimum the Name tag
        tags = config.get('tags', {})
        if not isinstance(tags, dict):
            tags = {}

        lines.append("")
        lines.append("  tags = {")
        lines.append(f'    Name = "{resource.resource_name}"')
        for key, value in tags.items():
            if key != "Name":
                lines.append(f'    {key} = {ValueDetector.format_for_terraform(value)}')
        lines.append("  }")

        lines.append("}")

        return "\n".join(lines)

    def _format_field_value(
        self,
        field_name: str,
        field_value: Any,
        resource_type: str,
        list_fields: Set[str],
        number_fields: Set[str],
        bool_fields: Set[str]
    ) -> str:
        """
        Format a field value based on its expected Terraform type.

        This ensures:
        - List fields are always wrapped in []
        - Number fields are never quoted
        - Bool fields output true/false (not quoted)
        - String fields are properly quoted or unquoted (for references)
        """
        # Handle list type fields - wrap single values in []
        if field_name in list_fields:
            if isinstance(field_value, list):
                return self._format_list(field_value)
            else:
                # Single value that should be a list - wrap it
                formatted = ValueDetector.format_for_terraform(field_value)
                return f"[{formatted}]"

        # Handle number type fields - never quote
        if field_name in number_fields:
            if isinstance(field_value, (int, float)):
                return str(field_value)
            elif isinstance(field_value, str):
                # Try to parse as number, otherwise use as-is (might be a reference)
                try:
                    return str(int(field_value))
                except ValueError:
                    try:
                        return str(float(field_value))
                    except ValueError:
                        # Might be a variable reference like var.port
                        return ValueDetector.format_for_terraform(field_value)

        # Handle boolean type fields - output true/false
        if field_name in bool_fields:
            if isinstance(field_value, bool):
                return "true" if field_value else "false"
            elif isinstance(field_value, str):
                lower = field_value.lower()
                if lower in ('true', '1', 'yes'):
                    return "true"
                elif lower in ('false', '0', 'no'):
                    return "false"
                # Might be a variable reference
                return ValueDetector.format_for_terraform(field_value)

        # Handle lists (even if not in list_fields mapping)
        if isinstance(field_value, list) and field_value:
            return self._format_list(field_value)

        # Default: use ValueDetector for intelligent formatting
        return ValueDetector.format_for_terraform(field_value)

    def _format_list(self, values: List[Any]) -> str:
        """Format a list for Terraform HCL"""
        if not values:
            return "[]"

        # Simple list of primitives
        if all(not isinstance(v, (dict, list)) for v in values):
            formatted = [ValueDetector.format_for_terraform(v) for v in values]
            return f"[{', '.join(formatted)}]"

        # Complex list - format with newlines
        lines = ["["]
        for value in values:
            if isinstance(value, dict):
                lines.append("  {")
                for k, v in value.items():
                    formatted_v = ValueDetector.format_for_terraform(v)
                    lines.append(f"    {k} = {formatted_v}")
                lines.append("  },")
            else:
                formatted_v = ValueDetector.format_for_terraform(value)
                lines.append(f"  {formatted_v},")

        # Remove trailing comma
        if lines[-1].endswith(","):
            lines[-1] = lines[-1][:-1]

        lines.append("]")
        return "\n".join(lines)

    def _format_repeated_block(self, block_name: str, block_data: Any) -> List[str]:
        """
        Format repeated blocks like ingress, egress, ebs_block_device.

        These are HCL blocks that can appear multiple times:
            ingress {
              from_port   = 80
              to_port     = 80
              protocol    = "tcp"
              cidr_blocks = ["0.0.0.0/0"]
            }

            ingress {
              from_port   = 443
              ...
            }
        """
        lines: List[str] = []

        # Get type info for fields inside this block
        field_types = BLOCK_FIELD_TYPES.get(block_name, {})

        # Handle single block (dict) or multiple blocks (list of dicts)
        if isinstance(block_data, dict):
            block_list = [block_data]
        elif isinstance(block_data, list):
            block_list = block_data
        else:
            return lines

        for block in block_list:
            if not isinstance(block, dict) or not block:
                continue

            # Skip blocks with no meaningful content
            has_content = any(
                v is not None and v != '' and v is not False
                for v in block.values()
            )
            if not has_content:
                continue

            lines.append(f"  {block_name} {{")

            for field_name, field_value in block.items():
                # Skip empty values
                if field_value is None or field_value == '' or field_value is False:
                    continue

                # Get expected type for this field
                expected_type = field_types.get(field_name, "string")

                # Format based on expected type
                formatted_value = self._format_block_field(
                    field_name, field_value, expected_type
                )

                lines.append(f"    {field_name} = {formatted_value}")

            lines.append("  }")
            lines.append("")  # Empty line between blocks

        return lines

    def _format_block_field(self, field_name: str, field_value: Any, expected_type: str) -> str:
        """Format a field inside a block based on its expected type."""

        # Handle number types
        if expected_type == "number":
            if isinstance(field_value, (int, float)):
                return str(field_value)
            elif isinstance(field_value, str):
                try:
                    return str(int(field_value))
                except ValueError:
                    try:
                        return str(float(field_value))
                    except ValueError:
                        return ValueDetector.format_for_terraform(field_value)

        # Handle boolean types
        if expected_type == "bool":
            if isinstance(field_value, bool):
                return "true" if field_value else "false"
            elif isinstance(field_value, str):
                lower = field_value.lower()
                if lower in ('true', '1', 'yes'):
                    return "true"
                elif lower in ('false', '0', 'no'):
                    return "false"
            return ValueDetector.format_for_terraform(field_value)

        # Handle list types
        if expected_type.startswith("list("):
            if isinstance(field_value, list):
                return self._format_list(field_value)
            else:
                # Single value that should be a list
                formatted = ValueDetector.format_for_terraform(field_value)
                return f"[{formatted}]"

        # Default: use ValueDetector
        return ValueDetector.format_for_terraform(field_value)

    def _format_block(self, block_name: str, block_data: Dict[str, Any]) -> List[str]:
        """
        Format a nested block in Terraform.

        Example:
            root_block_device {
              volume_size = 20
              encrypted = true
            }
        """
        lines = [f"  {block_name} {{"]

        for key, value in block_data.items():
            if value is None or value == '' or value is False:
                continue

            formatted_value = ValueDetector.format_for_terraform(value)
            lines.append(f"    {key} = {formatted_value}")

        lines.append("  }")

        return lines

    def _sanitize_identifier(self, value: str, prefix: str = "id") -> str:
        """Convert arbitrary names into Terraform-safe identifiers"""
        cleaned = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in value.strip())
        cleaned = cleaned.strip("_")

        if not cleaned:
            cleaned = prefix
        if cleaned[0].isdigit():
            cleaned = f"{prefix}_{cleaned}"

        return cleaned.lower()


# Singleton instance
_schema_driven_generator: Optional[SchemaDrivenGenerator] = None


def get_schema_driven_generator() -> SchemaDrivenGenerator:
    """Get singleton instance of schema-driven generator"""
    global _schema_driven_generator
    if _schema_driven_generator is None:
        _schema_driven_generator = SchemaDrivenGenerator()
    return _schema_driven_generator
