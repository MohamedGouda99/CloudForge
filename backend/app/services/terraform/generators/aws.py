"""
AWS Terraform Generator.

Implements the CloudProviderGenerator interface for AWS resources.
Generates provider-specific Terraform HCL code.
"""

from typing import Dict, List, Any, Set
from app.services.terraform.base import CloudProviderGenerator
from app.services.terraform.config import PROVIDER_CONFIGS, DEFAULTS, CloudProvider
from app.services.terraform.formatters import HCLFormatter, OutputFormatter
from app.models import Resource


class AWSGenerator(CloudProviderGenerator):
    """
    AWS-specific Terraform generator.

    Generates Terraform code for AWS resources including:
    - Compute (EC2, Lambda, ECS, EKS)
    - Networking (VPC, Subnet, Security Groups)
    - Storage (S3, EFS, EBS)
    - Database (RDS, DynamoDB, ElastiCache)
    - And more...
    """

    def __init__(self):
        self._config = PROVIDER_CONFIGS[CloudProvider.AWS]
        self._supported_types = self._build_supported_types()

    @property
    def provider_name(self) -> str:
        return self._config.terraform_provider

    @property
    def supported_resource_types(self) -> Set[str]:
        return self._supported_types

    def _build_supported_types(self) -> Set[str]:
        """Build the set of supported AWS resource types."""
        return {
            # Compute
            "aws_instance", "aws_launch_template", "aws_autoscaling_group",
            "aws_spot_instance_request", "aws_spot_fleet_request",

            # Networking
            "aws_vpc", "aws_subnet", "aws_internet_gateway", "aws_nat_gateway",
            "aws_route_table", "aws_route", "aws_route_table_association",
            "aws_security_group", "aws_security_group_rule",
            "aws_network_acl", "aws_network_interface",
            "aws_eip", "aws_eip_association",
            "aws_vpc_endpoint", "aws_vpc_peering_connection",

            # Load Balancing
            "aws_lb", "aws_lb_target_group", "aws_lb_listener", "aws_lb_listener_rule",
            "aws_alb", "aws_alb_target_group", "aws_alb_listener",

            # Storage
            "aws_s3_bucket", "aws_s3_bucket_policy", "aws_s3_bucket_versioning",
            "aws_efs_file_system", "aws_efs_mount_target",
            "aws_ebs_volume", "aws_volume_attachment",

            # Database
            "aws_db_instance", "aws_db_subnet_group", "aws_db_parameter_group",
            "aws_rds_cluster", "aws_rds_cluster_instance",
            "aws_dynamodb_table",
            "aws_elasticache_cluster", "aws_elasticache_replication_group",

            # Serverless
            "aws_lambda_function", "aws_lambda_permission", "aws_lambda_layer_version",
            "aws_api_gateway_rest_api", "aws_api_gateway_resource",
            "aws_api_gateway_method", "aws_api_gateway_integration",

            # Containers
            "aws_ecs_cluster", "aws_ecs_service", "aws_ecs_task_definition",
            "aws_eks_cluster", "aws_eks_node_group",
            "aws_ecr_repository",

            # IAM
            "aws_iam_role", "aws_iam_policy", "aws_iam_role_policy_attachment",
            "aws_iam_instance_profile",

            # Messaging
            "aws_sns_topic", "aws_sns_topic_subscription",
            "aws_sqs_queue", "aws_sqs_queue_policy",

            # DNS
            "aws_route53_zone", "aws_route53_record",

            # CDN
            "aws_cloudfront_distribution", "aws_cloudfront_origin_access_identity",

            # Monitoring
            "aws_cloudwatch_log_group", "aws_cloudwatch_metric_alarm",
        }

    def generate_terraform_block(self) -> str:
        """Generate terraform block with AWS provider requirements."""
        return f"""terraform {{
  required_version = "{DEFAULTS.TERRAFORM_MIN_VERSION}"

  required_providers {{
    aws = {{
      source  = "{self._config.provider_source}"
      version = "{self._config.provider_version}"
    }}
  }}
}}
"""

    def generate_provider_block(self, use_custom_endpoint: bool = False) -> str:
        """Generate AWS provider configuration."""
        if use_custom_endpoint:
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
        return """
provider "aws" {
  region = var.aws_region
}
"""

    def generate_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate HCL for an AWS resource."""
        resource_type = resource.resource_type
        resource_name = self.sanitize_identifier(resource.resource_name)
        config = resource.config or {}

        # Route to specific generators for complex resources
        generators = {
            "aws_lambda_function": self._generate_lambda,
            "aws_nat_gateway": self._generate_nat_gateway,
        }

        if resource_type in generators:
            return generators[resource_type](resource, context, var_collector)

        # Use generic generation for standard resources
        return self._generate_generic_resource(resource, context, var_collector)

    def _generate_generic_resource(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate HCL for a generic AWS resource."""
        resource_type = resource.resource_type
        resource_name = self.sanitize_identifier(resource.resource_name)
        config = resource.config or {}

        lines = [f'resource "{resource_type}" "{resource_name}" {{']

        # Skip internal fields
        skip_fields = {'name', 'tags', 'ingress', 'egress', 'user_data_base64'}

        for field_name, value in config.items():
            if field_name in skip_fields:
                continue
            if value is None or value == '' or value is False:
                continue

            # Handle nested blocks
            if isinstance(value, dict) and value:
                block_lines = HCLFormatter.format_block(field_name, value)
                lines.extend(block_lines)
                continue

            # Handle list values
            if isinstance(value, list) and value:
                formatted = HCLFormatter.format_value(value)
                lines.append(f"  {field_name} = {formatted}")
                continue

            # Handle references vs variables
            if var_collector.is_reference(value):
                lines.append(f"  {field_name} = {value}")
            elif var_collector.should_create_variable(field_name, value, resource_type):
                var_ref = var_collector.add_variable(
                    resource_type, resource.resource_name, field_name, value
                )
                lines.append(f"  {field_name} = {var_ref}")
            else:
                formatted = HCLFormatter.format_value(value)
                lines.append(f"  {field_name} = {formatted}")

        # Handle security group rules
        self._add_security_rules(lines, config)

        # Add tags
        tags = config.get('tags', {})
        if not isinstance(tags, dict):
            tags = {}
        lines.append("")
        lines.append(HCLFormatter.format_tags(tags, resource.resource_name))
        lines.append("}")

        return "\n".join(lines)

    def _add_security_rules(self, lines: List[str], config: Dict[str, Any]):
        """Add ingress/egress rules to resource lines."""
        for rule_type in ('ingress', 'egress'):
            rules = config.get(rule_type, [])
            if rules:
                for rule in (rules if isinstance(rules, list) else [rules]):
                    if isinstance(rule, dict) and rule:
                        lines.extend(HCLFormatter.format_security_rule(rule_type, rule))

    def _generate_lambda(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate Lambda function with IAM role."""
        config = resource.config or {}
        name = self.sanitize_identifier(resource.resource_name)
        zip_filename = config.get('filename') or f'{name}.zip'

        # Archive data source
        archive = f'''
data "archive_file" "{name}_code" {{
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
'''

        lines = [f'resource "aws_lambda_function" "{name}" {{']
        lines.append(f'  function_name = "{config.get("function_name", resource.resource_name)}"')
        lines.append(f'  runtime       = "{config.get("runtime", DEFAULTS.DEFAULT_LAMBDA_RUNTIME)}"')
        lines.append(f'  handler       = "{config.get("handler", DEFAULTS.DEFAULT_LAMBDA_HANDLER)}"')

        # IAM role
        role = config.get('role') or config.get('role_arn')
        if not role:
            if "lambda_iam_roles" not in context:
                context["lambda_iam_roles"] = []
            context["lambda_iam_roles"].append(name)
            role = f"aws_iam_role.{name}_role.arn"
        lines.append(f'  role          = {role}')

        lines.append(f"  filename         = data.archive_file.{name}_code.output_path")
        lines.append(f"  source_code_hash = data.archive_file.{name}_code.output_base64sha256")

        # Optional config
        if config.get('memory_size'):
            lines.append(f"  memory_size = {config['memory_size']}")
        if config.get('timeout'):
            lines.append(f"  timeout = {config['timeout']}")

        lines.append("")
        lines.append(HCLFormatter.format_tags(config.get('tags', {}), resource.resource_name))
        lines.append("}")

        return archive + "\n".join(lines)

    def _generate_nat_gateway(
        self,
        resource: Resource,
        context: Dict[str, Any],
        var_collector: Any
    ) -> str:
        """Generate NAT Gateway with associated EIP."""
        config = resource.config or {}
        name = resource.resource_name

        eip = f'''
resource "aws_eip" "{name}_eip" {{
  domain = "vpc"

  tags = {{
    Name = "{name}-eip"
  }}
}}
'''

        subnet_id = config.get('subnet_id')
        if subnet_id and '.' in subnet_id:
            subnet_ref = subnet_id
        elif subnet_id:
            subnet_ref = f'"{subnet_id}"'
        else:
            subnet_ref = 'var.public_subnet_id'

        nat = f'''
resource "aws_nat_gateway" "{name}" {{
  allocation_id = aws_eip.{name}_eip.id
  subnet_id     = {subnet_ref}

  tags = {{
    Name = "{name}"
  }}

  depends_on = [aws_eip.{name}_eip]
}}
'''
        return eip + nat

    def generate_data_sources(self, context: Dict[str, Any]) -> List[str]:
        """Generate AWS data sources."""
        blocks = []

        # Availability zone data sources
        az_zones = context.get("aws", {}).get("availability_zones", {})
        for identifier, meta in az_zones.items():
            block = [
                f'data "aws_availability_zone" "{identifier}" {{',
                f'  name  = "{meta["name"]}"',
            ]
            if meta.get("state"):
                block.append(f'  state = "{meta["state"]}"')
            block.append("}")
            blocks.append("\n".join(block))

        # AMI data sources
        for ami_name in context.get("ami_data_sources", []):
            block = f'''data "aws_ami" "{ami_name}" {{
  most_recent = true
  owners      = ["amazon"]

  filter {{
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }}

  filter {{
    name   = "virtualization-type"
    values = ["hvm"]
  }}
}}'''
            blocks.append(block)

        return blocks

    def generate_iam_resources(self, context: Dict[str, Any]) -> List[str]:
        """Generate IAM roles and policies for AWS resources."""
        blocks = []

        for lambda_name in context.get("lambda_iam_roles", []):
            # IAM role
            role = f'''resource "aws_iam_role" "{lambda_name}_role" {{
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
            blocks.append(role)

            # Basic execution policy
            basic = f'''resource "aws_iam_role_policy_attachment" "{lambda_name}_basic" {{
  role       = aws_iam_role.{lambda_name}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}}'''
            blocks.append(basic)

            # VPC policy
            vpc = f'''resource "aws_iam_role_policy_attachment" "{lambda_name}_vpc" {{
  role       = aws_iam_role.{lambda_name}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}}'''
            blocks.append(vpc)

        return blocks

    def get_default_region(self) -> str:
        return self._config.default_region

    def get_region_variable_name(self) -> str:
        return self._config.region_variable
