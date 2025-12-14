from typing import Dict, List, Optional

# Lightweight AWS catalog focused on best-practice starting points
AWS_RESOURCE_CATEGORIES: List[Dict[str, str]] = [
    {"id": "networking", "name": "Networking & Edge", "description": "VPC, subnets, routing, edge connectivity"},
    {"id": "security", "name": "Security & Identity", "description": "Guardrails, encryption, IAM"},
    {"id": "compute", "name": "Compute & Containers", "description": "EC2, EKS, ECS, Lambda"},
    {"id": "data", "name": "Data & Storage", "description": "RDS, Aurora, S3, DynamoDB"},
    {"id": "operations", "name": "Operations", "description": "Monitoring, backups, observability"},
]

AWS_RESOURCE_CATALOG: List[Dict[str, object]] = [
    {
        "id": "aws_vpc",
        "name": "Amazon VPC",
        "category": "networking",
        "service": "Networking",
        "terraform_type": "aws_vpc",
        "description": "Isolated networking boundary with DNS enabled.",
        "best_practices": [
            "Enable DNS support and hostnames",
            "Use /16 CIDR to allow subnets per AZ",
            "Tag with owner, env, and cost-center",
        ],
        "defaults": {
            "cidr_block": "10.0.0.0/16",
            "enable_dns_hostnames": True,
            "enable_dns_support": True,
        },
        "connects_to": ["aws_subnet", "aws_internet_gateway", "aws_security_group"],
    },
    {
        "id": "aws_subnet",
        "name": "Subnet (public/private)",
        "category": "networking",
        "service": "Networking",
        "terraform_type": "aws_subnet",
        "description": "Public or private subnet aligned to an AZ.",
        "best_practices": [
            "Create at least two AZs for HA",
            "Keep /20 to /24 CIDRs per subnet",
        ],
        "defaults": {
            "cidr_block": "10.0.1.0/24",
            "map_public_ip_on_launch": False,
        },
        "connects_to": ["aws_route_table", "aws_nat_gateway", "aws_instance", "aws_eks_node_group"],
    },
    {
        "id": "aws_internet_gateway",
        "name": "Internet Gateway",
        "category": "networking",
        "service": "Networking",
        "terraform_type": "aws_internet_gateway",
        "description": "Outbound internet access for public subnets.",
        "best_practices": ["Attach to dedicated public route tables", "Restrict 0.0.0.0/0 to public subnets only"],
        "defaults": {},
        "connects_to": ["aws_route_table"],
    },
    {
        "id": "aws_nat_gateway",
        "name": "NAT Gateway",
        "category": "networking",
        "service": "Networking",
        "terraform_type": "aws_nat_gateway",
        "description": "Managed egress for private subnets.",
        "best_practices": [
            "Place one NAT per AZ for resiliency",
            "Use EIPs per NAT for deterministic egress",
        ],
        "defaults": {},
        "connects_to": ["aws_subnet", "aws_route_table"],
    },
    {
        "id": "aws_security_group",
        "name": "Security Group",
        "category": "security",
        "service": "Security",
        "terraform_type": "aws_security_group",
        "description": "Layer-4 firewall for resources.",
        "best_practices": [
            "Default deny inbound, allow least-privilege",
            "Use separate SGs per tier (web/app/db)",
        ],
        "defaults": {"ingress": [], "egress": [{"cidr_blocks": ["0.0.0.0/0"], "from_port": 0, "to_port": 0, "protocol": "-1"}]},
        "connects_to": ["aws_instance", "aws_rds_instance", "aws_lb", "aws_lambda_function"],
    },
    {
        "id": "aws_lb",
        "name": "Application Load Balancer",
        "category": "networking",
        "service": "Networking",
        "terraform_type": "aws_lb",
        "description": "Layer-7 load balancer with HTTPS termination.",
        "best_practices": ["Use HTTPS listeners with TLS 1.2+", "Enable access logs to S3", "Enable WAF where needed"],
        "defaults": {"internal": False, "load_balancer_type": "application"},
        "connects_to": ["aws_security_group", "aws_subnet"],
    },
    {
        "id": "aws_instance",
        "name": "EC2 Instance",
        "category": "compute",
        "service": "Compute",
        "terraform_type": "aws_instance",
        "description": "General-purpose compute with IAM role and SGs.",
        "best_practices": [
            "Use IAM roles not access keys",
            "Keep root volume encrypted",
            "Use ALB + ASG instead of single instances",
        ],
        "defaults": {"instance_type": "t3.micro", "ami": "ami-latest"},
        "connects_to": ["aws_security_group", "aws_subnet", "aws_lb"],
    },
    {
        "id": "aws_rds_instance",
        "name": "Amazon RDS",
        "category": "data",
        "service": "Data",
        "terraform_type": "aws_db_instance",
        "description": "Managed relational database with backups.",
        "best_practices": [
            "Enable storage encryption",
            "Set backup_retention_period >= 7",
            "Place in private subnets",
        ],
        "defaults": {
            "engine": "postgres",
            "instance_class": "db.t3.micro",
            "allocated_storage": 20,
            "backup_retention_period": 7,
            "skip_final_snapshot": False,
        },
        "connects_to": ["aws_subnet", "aws_security_group"],
    },
    {
        "id": "aws_s3_bucket",
        "name": "S3 Bucket",
        "category": "data",
        "service": "Storage",
        "terraform_type": "aws_s3_bucket",
        "description": "Encrypted object storage with versioning.",
        "best_practices": ["Block public access by default", "Enable versioning and lifecycle policies"],
        "defaults": {"force_destroy": False, "versioning": {"enabled": True}},
        "connects_to": ["aws_cloudtrail", "aws_lb", "aws_lambda_function"],
    },
    {
        "id": "aws_eks_cluster",
        "name": "EKS Cluster",
        "category": "compute",
        "service": "Containers",
        "terraform_type": "aws_eks_cluster",
        "description": "Managed Kubernetes control plane.",
        "best_practices": ["Use private API endpoint when possible", "Enable control plane logging", "Separate nodegroups per workload"],
        "defaults": {"version": "1.29", "enabled_cluster_log_types": ["api", "audit"]},
        "connects_to": ["aws_subnet", "aws_security_group", "aws_eks_node_group"],
    },
    {
        "id": "aws_lambda_function",
        "name": "Lambda Function",
        "category": "compute",
        "service": "Serverless",
        "terraform_type": "aws_lambda_function",
        "description": "Serverless compute with IAM role and VPC access.",
        "best_practices": ["Set memory/timeouts per function", "Use VPC only when needed", "Ship logs to CloudWatch"],
        "defaults": {"timeout": 10, "memory_size": 256, "runtime": "python3.11"},
        "connects_to": ["aws_subnet", "aws_security_group", "aws_s3_bucket"],
    },
]


AWS_TEMPLATES: List[Dict[str, object]] = [
    {
        "id": "aws-ha-3tier",
        "name": "HA 3-tier Web App",
        "description": "Well-Architected VPC with public ALB, private app tier, and RDS in multi-AZ.",
        "use_case": "web",
        "maturity": "ga",
        "services": ["aws_vpc", "aws_subnet", "aws_security_group", "aws_lb", "aws_instance", "aws_rds_instance", "aws_nat_gateway"],
        "compliance": ["wa-pillars", "landing-zone-ready"],
        "diagram_data": {
            "nodes": [
                {"id": "vpc-1", "type": "default", "position": {"x": 120, "y": 80}, "data": {"label": "VPC", "resourceType": "aws_vpc", "resourceLabel": "core_vpc", "config": {"cidr_block": "10.0.0.0/16", "enable_dns_support": True, "enable_dns_hostnames": True}}},
                {"id": "subnet-public-a", "type": "default", "position": {"x": 80, "y": 220}, "data": {"label": "Public Subnet A", "resourceType": "aws_subnet", "resourceLabel": "public_a", "config": {"cidr_block": "10.0.1.0/24", "map_public_ip_on_launch": True}}},
                {"id": "subnet-private-a", "type": "default", "position": {"x": 220, "y": 220}, "data": {"label": "Private Subnet A", "resourceType": "aws_subnet", "resourceLabel": "private_a", "config": {"cidr_block": "10.0.11.0/24", "map_public_ip_on_launch": False}}},
                {"id": "igw-1", "type": "default", "position": {"x": 60, "y": 120}, "data": {"label": "Internet Gateway", "resourceType": "aws_internet_gateway", "resourceLabel": "igw", "config": {}}},
                {"id": "nat-1", "type": "default", "position": {"x": 220, "y": 320}, "data": {"label": "NAT Gateway", "resourceType": "aws_nat_gateway", "resourceLabel": "nat_gw", "config": {}}},
                {"id": "alb-1", "type": "default", "position": {"x": 60, "y": 340}, "data": {"label": "App ALB", "resourceType": "aws_lb", "resourceLabel": "app_alb", "config": {"internal": False, "load_balancer_type": "application"}}},
                {
                    "id": "sg-web",
                    "type": "default",
                    "position": {"x": 60, "y": 440},
                    "data": {
                        "label": "Web SG",
                        "resourceType": "aws_security_group",
                        "resourceLabel": "web_sg",
                        "config": {
                            "ingress": [
                                {"from_port": 443, "to_port": 443, "protocol": "tcp", "cidr_blocks": ["0.0.0.0/0"]}
                            ],
                            "egress": [
                                {"from_port": 0, "to_port": 0, "protocol": "-1", "cidr_blocks": ["0.0.0.0/0"]}
                            ],
                        },
                    },
                },
                {"id": "app-1", "type": "default", "position": {"x": 220, "y": 440}, "data": {"label": "App EC2", "resourceType": "aws_instance", "resourceLabel": "app_asg", "config": {"instance_type": "t3.micro"}}},
                {"id": "db-1", "type": "default", "position": {"x": 380, "y": 440}, "data": {"label": "RDS", "resourceType": "aws_rds_instance", "resourceLabel": "db", "config": {"engine": "postgres", "instance_class": "db.t3.micro", "allocated_storage": 20, "backup_retention_period": 7}}},
            ],
            "edges": [
                {"id": "edge-vpc-igw", "source": "vpc-1", "target": "igw-1", "data": {"label": "vpc_id"}},
                {"id": "edge-vpc-subnet-public", "source": "vpc-1", "target": "subnet-public-a", "data": {"label": "vpc_id"}},
                {"id": "edge-vpc-subnet-private", "source": "vpc-1", "target": "subnet-private-a", "data": {"label": "vpc_id"}},
                {"id": "edge-subnet-public-alb", "source": "subnet-public-a", "target": "alb-1", "data": {"label": "subnet_id"}},
                {"id": "edge-sg-alb", "source": "sg-web", "target": "alb-1", "data": {"label": "security_groups"}},
                {"id": "edge-subnet-private-nat", "source": "subnet-public-a", "target": "nat-1", "data": {"label": "subnet_id"}},
                {"id": "edge-nat-private", "source": "subnet-private-a", "target": "nat-1", "data": {"label": "nat_gateway_id"}},
                {"id": "edge-sg-app", "source": "sg-web", "target": "app-1", "data": {"label": "vpc_security_group_ids"}},
                {"id": "edge-subnet-app", "source": "subnet-private-a", "target": "app-1", "data": {"label": "subnet_id"}},
                {"id": "edge-sg-db", "source": "sg-web", "target": "db-1", "data": {"label": "vpc_security_group_ids"}},
                {"id": "edge-subnet-db", "source": "subnet-private-a", "target": "db-1", "data": {"label": "subnet_ids"}},
            ],
        },
    },
    {
        "id": "aws-serverless-api",
        "name": "Serverless API",
        "description": "API Gateway with Lambda, private subnets, and S3 logging.",
        "use_case": "api",
        "maturity": "beta",
        "services": ["aws_vpc", "aws_subnet", "aws_lambda_function", "aws_security_group", "aws_s3_bucket"],
        "diagram_data": {
            "nodes": [
                {
                    "id": "vpc-sl",
                    "type": "default",
                    "position": {"x": 120, "y": 80},
                    "data": {
                        "label": "VPC",
                        "resourceType": "aws_vpc",
                        "resourceLabel": "serverless_vpc",
                        "config": {"cidr_block": "10.10.0.0/16"},
                    },
                },
                {
                    "id": "subnet-sl",
                    "type": "default",
                    "position": {"x": 120, "y": 200},
                    "data": {
                        "label": "Private Subnet",
                        "resourceType": "aws_subnet",
                        "resourceLabel": "private",
                        "config": {"cidr_block": "10.10.1.0/24"},
                    },
                },
                {
                    "id": "sg-sl",
                    "type": "default",
                    "position": {"x": 40, "y": 310},
                    "data": {
                        "label": "Lambda SG",
                        "resourceType": "aws_security_group",
                        "resourceLabel": "lambda_sg",
                        "config": {
                            "ingress": [],
                            "egress": [{"from_port": 0, "to_port": 0, "protocol": "-1", "cidr_blocks": ["0.0.0.0/0"]}],
                        },
                    },
                },
                {
                    "id": "lambda-sl",
                    "type": "default",
                    "position": {"x": 120, "y": 320},
                    "data": {
                        "label": "Lambda",
                        "resourceType": "aws_lambda_function",
                        "resourceLabel": "api_handler",
                        "config": {"runtime": "python3.11", "memory_size": 256, "timeout": 15},
                    },
                },
                {
                    "id": "s3-logs",
                    "type": "default",
                    "position": {"x": 260, "y": 320},
                    "data": {
                        "label": "S3 Logs",
                        "resourceType": "aws_s3_bucket",
                        "resourceLabel": "api_logs",
                        "config": {"versioning": {"enabled": True}},
                    },
                },
            ],
            "edges": [
                {"id": "edge-vpc-subnet", "source": "vpc-sl", "target": "subnet-sl", "data": {"label": "vpc_id"}},
                {"id": "edge-sg-lambda", "source": "sg-sl", "target": "lambda-sl", "data": {"label": "security_group_ids"}},
                {"id": "edge-subnet-lambda", "source": "subnet-sl", "target": "lambda-sl", "data": {"label": "subnet_ids"}},
                {"id": "edge-logs-lambda", "source": "lambda-sl", "target": "s3-logs", "data": {"label": "logging"}},
            ],
        },
    },
]


def get_aws_categories() -> List[Dict[str, str]]:
    return AWS_RESOURCE_CATEGORIES


def get_aws_resources() -> List[Dict[str, object]]:
    return AWS_RESOURCE_CATALOG


def get_aws_templates() -> List[Dict[str, object]]:
    return AWS_TEMPLATES


def get_aws_template(template_id: str) -> Optional[Dict[str, object]]:
    return next((tpl for tpl in AWS_TEMPLATES if tpl["id"] == template_id), None)

