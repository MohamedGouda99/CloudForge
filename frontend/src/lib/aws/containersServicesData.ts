/**
 * AWS Containers Services Data - Complete definitions from containers.json
 * This file contains ALL 12 container services with ALL their properties
 * 
 * Services included:
 * 1. ECR Repository (aws_ecr_repository)
 * 2. ECR Lifecycle Policy (aws_ecr_lifecycle_policy)
 * 3. ECS Cluster (aws_ecs_cluster)
 * 4. ECS Cluster Capacity Providers (aws_ecs_cluster_capacity_providers)
 * 5. ECS Capacity Provider (aws_ecs_capacity_provider)
 * 6. ECS Task Definition (aws_ecs_task_definition)
 * 7. ECS Service (aws_ecs_service)
 * 8. EKS Cluster (aws_eks_cluster)
 * 9. EKS Node Group (aws_eks_node_group)
 * 10. EKS Fargate Profile (aws_eks_fargate_profile)
 * 11. EKS Add-on (aws_eks_addon)
 * 12. App Runner Service (aws_apprunner_service)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Containers service icon mappings - using actual AWS Architecture icons
export const CONTAINERS_ICONS: Record<string, string> = {
  'aws_ecr_repository': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Registry_64.svg',
  'aws_ecr_lifecycle_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Registry_64.svg',
  'aws_ecs_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg',
  'aws_ecs_cluster_capacity_providers': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg',
  'aws_ecs_capacity_provider': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg',
  'aws_ecs_task_definition': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg',
  'aws_ecs_service': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg',
  'aws_eks_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg',
  'aws_eks_node_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg',
  'aws_eks_fargate_profile': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_AWS-Fargate_64.svg',
  'aws_eks_addon': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg',
  'aws_apprunner_service': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-App-Runner_64.svg',
};

// Containers service definition interface
export interface ContainersServiceDefinition {
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}

// Complete containers services data from containers.json
export const CONTAINERS_SERVICES: ContainersServiceDefinition[] = [
  {
    id: "ecr_repository",
    name: "ECR Repository",
    description: "Container image registry",
    terraform_resource: "aws_ecr_repository",
    icon: CONTAINERS_ICONS['aws_ecr_repository'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Repository name" }
      ],
      optional: [
        { name: "image_tag_mutability", type: "string", description: "Tag mutability", options: ["MUTABLE", "IMMUTABLE"], default: "MUTABLE" },
        { name: "force_delete", type: "bool", description: "Force delete with images" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "encryption_configuration",
          attributes: [
            { name: "encryption_type", type: "string", options: ["AES256", "KMS"] },
            { name: "kms_key", type: "string" }
          ]
        },
        {
          name: "image_scanning_configuration",
          attributes: [
            { name: "scan_on_push", type: "bool", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Repository ARN" },
      { name: "registry_id", type: "string", description: "Registry ID" },
      { name: "repository_url", type: "string", description: "Repository URL" }
    ]
  },
  {
    id: "ecr_lifecycle_policy",
    name: "ECR Lifecycle Policy",
    description: "Lifecycle policy for ECR images",
    terraform_resource: "aws_ecr_lifecycle_policy",
    icon: CONTAINERS_ICONS['aws_ecr_lifecycle_policy'],
    inputs: {
      required: [
        { name: "repository", type: "string", description: "Repository name", reference: "aws_ecr_repository.name" },
        { name: "policy", type: "string", description: "Lifecycle policy JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "repository", type: "string", description: "Repository name" },
      { name: "registry_id", type: "string", description: "Registry ID" }
    ]
  },
  {
    id: "ecs_cluster",
    name: "ECS Cluster",
    description: "Container orchestration cluster",
    terraform_resource: "aws_ecs_cluster",
    icon: CONTAINERS_ICONS['aws_ecs_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "service_connect_defaults",
          attributes: [
            { name: "namespace", type: "string", required: true }
          ]
        },
        {
          name: "setting",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "value", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "name", type: "string", description: "Cluster name" }
    ]
  },
  {
    id: "ecs_cluster_capacity_providers",
    name: "ECS Cluster Capacity Providers",
    description: "Capacity providers for ECS cluster",
    terraform_resource: "aws_ecs_cluster_capacity_providers",
    icon: CONTAINERS_ICONS['aws_ecs_cluster_capacity_providers'],
    inputs: {
      required: [
        { name: "cluster_name", type: "string", description: "Cluster name", reference: "aws_ecs_cluster.name" }
      ],
      optional: [
        { name: "capacity_providers", type: "list(string)", description: "Capacity provider names" }
      ],
      blocks: [
        {
          name: "default_capacity_provider_strategy",
          multiple: true,
          attributes: [
            { name: "capacity_provider", type: "string", required: true },
            { name: "base", type: "number" },
            { name: "weight", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster name" }
    ]
  },
  {
    id: "ecs_capacity_provider",
    name: "ECS Capacity Provider",
    description: "Capacity provider for ECS",
    terraform_resource: "aws_ecs_capacity_provider",
    icon: CONTAINERS_ICONS['aws_ecs_capacity_provider'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Capacity provider name" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "auto_scaling_group_provider",
          attributes: [
            { name: "auto_scaling_group_arn", type: "string", required: true },
            { name: "managed_draining", type: "string", options: ["ENABLED", "DISABLED"] },
            { name: "managed_termination_protection", type: "string", options: ["ENABLED", "DISABLED"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Capacity provider ID" },
      { name: "arn", type: "string", description: "Capacity provider ARN" }
    ]
  },
  {
    id: "ecs_task_definition",
    name: "ECS Task Definition",
    description: "Task definition for containers",
    terraform_resource: "aws_ecs_task_definition",
    icon: CONTAINERS_ICONS['aws_ecs_task_definition'],
    inputs: {
      required: [
        { name: "family", type: "string", description: "Task family name" },
        { name: "container_definitions", type: "string", description: "Container definitions JSON" }
      ],
      optional: [
        { name: "task_role_arn", type: "string", description: "Task role ARN" },
        { name: "execution_role_arn", type: "string", description: "Execution role ARN" },
        { name: "network_mode", type: "string", description: "Network mode", options: ["none", "bridge", "awsvpc", "host"] },
        { name: "requires_compatibilities", type: "list(string)", description: "Launch type compatibility", options: ["EC2", "FARGATE", "EXTERNAL"] },
        { name: "cpu", type: "string", description: "CPU units" },
        { name: "memory", type: "string", description: "Memory in MB" },
        { name: "ipc_mode", type: "string", description: "IPC mode", options: ["host", "task", "none"] },
        { name: "pid_mode", type: "string", description: "PID mode", options: ["host", "task"] },
        { name: "skip_destroy", type: "bool", description: "Skip destroy" },
        { name: "track_latest", type: "bool", description: "Track latest revision" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "ephemeral_storage",
          attributes: [
            { name: "size_in_gib", type: "number", required: true }
          ]
        },
        {
          name: "runtime_platform",
          attributes: [
            { name: "operating_system_family", type: "string", options: ["LINUX", "WINDOWS_SERVER_2019_FULL", "WINDOWS_SERVER_2019_CORE", "WINDOWS_SERVER_2022_FULL", "WINDOWS_SERVER_2022_CORE"] },
            { name: "cpu_architecture", type: "string", options: ["X86_64", "ARM64"] }
          ]
        },
        {
          name: "volume",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "host_path", type: "string" },
            { name: "configure_at_launch", type: "bool" }
          ]
        },
        {
          name: "placement_constraints",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["memberOf"] },
            { name: "expression", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Task definition ID" },
      { name: "arn", type: "string", description: "Task definition ARN" },
      { name: "arn_without_revision", type: "string", description: "ARN without revision" },
      { name: "revision", type: "number", description: "Revision number" }
    ]
  },
  {
    id: "ecs_service",
    name: "ECS Service",
    description: "Long-running container service",
    terraform_resource: "aws_ecs_service",
    icon: CONTAINERS_ICONS['aws_ecs_service'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Service name" }
      ],
      optional: [
        { name: "cluster", type: "string", description: "Cluster ARN", reference: "aws_ecs_cluster.arn" },
        { name: "task_definition", type: "string", description: "Task definition ARN", reference: "aws_ecs_task_definition.arn" },
        { name: "desired_count", type: "number", description: "Desired task count" },
        { name: "enable_ecs_managed_tags", type: "bool", description: "Enable ECS managed tags" },
        { name: "enable_execute_command", type: "bool", description: "Enable execute command" },
        { name: "force_new_deployment", type: "bool", description: "Force new deployment" },
        { name: "health_check_grace_period_seconds", type: "number", description: "Health check grace period" },
        { name: "iam_role", type: "string", description: "IAM role ARN" },
        { name: "launch_type", type: "string", description: "Launch type", options: ["EC2", "FARGATE", "EXTERNAL"] },
        { name: "platform_version", type: "string", description: "Platform version for Fargate" },
        { name: "propagate_tags", type: "string", description: "Propagate tags", options: ["SERVICE", "TASK_DEFINITION"] },
        { name: "scheduling_strategy", type: "string", description: "Scheduling strategy", options: ["REPLICA", "DAEMON"] },
        { name: "wait_for_steady_state", type: "bool", description: "Wait for steady state" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "capacity_provider_strategy",
          multiple: true,
          attributes: [
            { name: "capacity_provider", type: "string", required: true },
            { name: "base", type: "number" },
            { name: "weight", type: "number" }
          ]
        },
        {
          name: "deployment_circuit_breaker",
          attributes: [
            { name: "enable", type: "bool", required: true },
            { name: "rollback", type: "bool", required: true }
          ]
        },
        {
          name: "deployment_controller",
          attributes: [
            { name: "type", type: "string", options: ["ECS", "CODE_DEPLOY", "EXTERNAL"] }
          ]
        },
        {
          name: "load_balancer",
          multiple: true,
          attributes: [
            { name: "container_name", type: "string", required: true },
            { name: "container_port", type: "number", required: true },
            { name: "elb_name", type: "string" },
            { name: "target_group_arn", type: "string" }
          ]
        },
        {
          name: "network_configuration",
          attributes: [
            { name: "subnets", type: "list(string)", required: true },
            { name: "security_groups", type: "list(string)" },
            { name: "assign_public_ip", type: "bool" }
          ]
        },
        {
          name: "ordered_placement_strategy",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["random", "spread", "binpack"] },
            { name: "field", type: "string" }
          ]
        },
        {
          name: "placement_constraints",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["distinctInstance", "memberOf"] },
            { name: "expression", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "cluster", type: "string", description: "Cluster ARN" },
      { name: "desired_count", type: "number", description: "Desired count" },
      { name: "iam_role", type: "string", description: "IAM role" },
      { name: "name", type: "string", description: "Service name" }
    ]
  },
  {
    id: "eks_cluster",
    name: "EKS Cluster",
    description: "Managed Kubernetes cluster",
    terraform_resource: "aws_eks_cluster",
    icon: CONTAINERS_ICONS['aws_eks_cluster'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Cluster name" },
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "version", type: "string", description: "Kubernetes version" },
        { name: "enabled_cluster_log_types", type: "list(string)", description: "Enabled log types", options: ["api", "audit", "authenticator", "controllerManager", "scheduler"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "vpc_config",
          attributes: [
            { name: "subnet_ids", type: "list(string)", required: true },
            { name: "security_group_ids", type: "list(string)" },
            { name: "endpoint_private_access", type: "bool" },
            { name: "endpoint_public_access", type: "bool" },
            { name: "public_access_cidrs", type: "list(string)" }
          ]
        },
        {
          name: "access_config",
          attributes: [
            { name: "authentication_mode", type: "string", options: ["CONFIG_MAP", "API", "API_AND_CONFIG_MAP"] },
            { name: "bootstrap_cluster_creator_admin_permissions", type: "bool" }
          ]
        },
        {
          name: "encryption_config",
          attributes: [
            { name: "resources", type: "list(string)", required: true }
          ]
        },
        {
          name: "kubernetes_network_config",
          attributes: [
            { name: "ip_family", type: "string", options: ["ipv4", "ipv6"] },
            { name: "service_ipv4_cidr", type: "string" },
            { name: "service_ipv6_cidr", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "certificate_authority", type: "list(object)", description: "Certificate authority data" },
      { name: "cluster_id", type: "string", description: "Cluster ID" },
      { name: "created_at", type: "string", description: "Creation timestamp" },
      { name: "endpoint", type: "string", description: "Kubernetes API server endpoint" },
      { name: "platform_version", type: "string", description: "Platform version" },
      { name: "status", type: "string", description: "Cluster status" }
    ]
  },
  {
    id: "eks_node_group",
    name: "EKS Node Group",
    description: "Managed node group for EKS",
    terraform_resource: "aws_eks_node_group",
    icon: CONTAINERS_ICONS['aws_eks_node_group'],
    inputs: {
      required: [
        { name: "cluster_name", type: "string", description: "Cluster name", reference: "aws_eks_cluster.name" },
        { name: "node_role_arn", type: "string", description: "Node IAM role ARN", reference: "aws_iam_role.arn" },
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" }
      ],
      optional: [
        { name: "node_group_name", type: "string", description: "Node group name" },
        { name: "node_group_name_prefix", type: "string", description: "Node group name prefix" },
        { name: "ami_type", type: "string", description: "AMI type", options: ["AL2_x86_64", "AL2_x86_64_GPU", "AL2_ARM_64", "AL2023_x86_64_STANDARD", "AL2023_ARM_64_STANDARD", "BOTTLEROCKET_x86_64", "BOTTLEROCKET_ARM_64", "CUSTOM", "WINDOWS_CORE_2019_x86_64", "WINDOWS_FULL_2019_x86_64", "WINDOWS_CORE_2022_x86_64", "WINDOWS_FULL_2022_x86_64"] },
        { name: "capacity_type", type: "string", description: "Capacity type", options: ["ON_DEMAND", "SPOT"] },
        { name: "disk_size", type: "number", description: "Disk size in GB" },
        { name: "force_update_version", type: "bool", description: "Force update version" },
        { name: "instance_types", type: "list(string)", description: "Instance types" },
        { name: "labels", type: "map(string)", description: "Kubernetes labels" },
        { name: "release_version", type: "string", description: "AMI release version" },
        { name: "version", type: "string", description: "Kubernetes version" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "scaling_config",
          attributes: [
            { name: "desired_size", type: "number", required: true },
            { name: "max_size", type: "number", required: true },
            { name: "min_size", type: "number", required: true }
          ]
        },
        {
          name: "launch_template",
          attributes: [
            { name: "id", type: "string" },
            { name: "name", type: "string" },
            { name: "version", type: "string", required: true }
          ]
        },
        {
          name: "remote_access",
          attributes: [
            { name: "ec2_ssh_key", type: "string" },
            { name: "source_security_group_ids", type: "list(string)" }
          ]
        },
        {
          name: "taint",
          multiple: true,
          attributes: [
            { name: "key", type: "string", required: true },
            { name: "value", type: "string" },
            { name: "effect", type: "string", required: true, options: ["NO_SCHEDULE", "NO_EXECUTE", "PREFER_NO_SCHEDULE"] }
          ]
        },
        {
          name: "update_config",
          attributes: [
            { name: "max_unavailable", type: "number" },
            { name: "max_unavailable_percentage", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Node group ID" },
      { name: "arn", type: "string", description: "Node group ARN" },
      { name: "cluster_name", type: "string", description: "Cluster name" },
      { name: "node_group_name", type: "string", description: "Node group name" },
      { name: "status", type: "string", description: "Node group status" }
    ]
  },
  {
    id: "eks_fargate_profile",
    name: "EKS Fargate Profile",
    description: "Fargate profile for EKS",
    terraform_resource: "aws_eks_fargate_profile",
    icon: CONTAINERS_ICONS['aws_eks_fargate_profile'],
    inputs: {
      required: [
        { name: "cluster_name", type: "string", description: "Cluster name", reference: "aws_eks_cluster.name" },
        { name: "fargate_profile_name", type: "string", description: "Fargate profile name" },
        { name: "pod_execution_role_arn", type: "string", description: "Pod execution role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "selector",
          multiple: true,
          attributes: [
            { name: "namespace", type: "string", required: true },
            { name: "labels", type: "map(string)" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Fargate profile ID" },
      { name: "arn", type: "string", description: "Fargate profile ARN" },
      { name: "status", type: "string", description: "Fargate profile status" }
    ]
  },
  {
    id: "eks_addon",
    name: "EKS Add-on",
    description: "EKS cluster add-on",
    terraform_resource: "aws_eks_addon",
    icon: CONTAINERS_ICONS['aws_eks_addon'],
    inputs: {
      required: [
        { name: "addon_name", type: "string", description: "Add-on name", options: ["vpc-cni", "coredns", "kube-proxy", "aws-ebs-csi-driver", "aws-efs-csi-driver", "snapshot-controller", "adot", "aws-guardduty-agent"] },
        { name: "cluster_name", type: "string", description: "Cluster name", reference: "aws_eks_cluster.name" }
      ],
      optional: [
        { name: "addon_version", type: "string", description: "Add-on version" },
        { name: "configuration_values", type: "string", description: "Configuration values JSON" },
        { name: "preserve", type: "bool", description: "Preserve on delete" },
        { name: "resolve_conflicts", type: "string", description: "Conflict resolution", options: ["OVERWRITE", "NONE", "PRESERVE"] },
        { name: "resolve_conflicts_on_create", type: "string", description: "Conflict resolution on create" },
        { name: "resolve_conflicts_on_update", type: "string", description: "Conflict resolution on update" },
        { name: "service_account_role_arn", type: "string", description: "Service account role ARN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Add-on ID" },
      { name: "arn", type: "string", description: "Add-on ARN" },
      { name: "created_at", type: "string", description: "Creation timestamp" },
      { name: "modified_at", type: "string", description: "Modification timestamp" }
    ]
  },
  {
    id: "apprunner_service",
    name: "App Runner Service",
    description: "Container-based web application service",
    terraform_resource: "aws_apprunner_service",
    icon: CONTAINERS_ICONS['aws_apprunner_service'],
    inputs: {
      required: [
        { name: "service_name", type: "string", description: "Service name" }
      ],
      optional: [
        { name: "auto_scaling_configuration_arn", type: "string", description: "Auto scaling configuration ARN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "source_configuration",
          description: "Source configuration for the service",
          attributes: [
            { name: "auto_deployments_enabled", type: "bool" }
          ]
        },
        {
          name: "health_check_configuration",
          attributes: [
            { name: "healthy_threshold", type: "number" },
            { name: "interval", type: "number" },
            { name: "path", type: "string" },
            { name: "protocol", type: "string", options: ["TCP", "HTTP"] },
            { name: "timeout", type: "number" },
            { name: "unhealthy_threshold", type: "number" }
          ]
        },
        {
          name: "instance_configuration",
          attributes: [
            { name: "cpu", type: "string" },
            { name: "instance_role_arn", type: "string" },
            { name: "memory", type: "string" }
          ]
        },
        {
          name: "encryption_configuration",
          attributes: [
            { name: "kms_key", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Service ID" },
      { name: "arn", type: "string", description: "Service ARN" },
      { name: "service_id", type: "string", description: "Service ID" },
      { name: "service_url", type: "string", description: "Service URL" },
      { name: "status", type: "string", description: "Service status" }
    ]
  }
];

// List of all containers terraform resource types
export const CONTAINERS_TERRAFORM_RESOURCES = CONTAINERS_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getContainersServiceByTerraformResource(terraformResource: string): ContainersServiceDefinition | undefined {
  return CONTAINERS_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getContainersServiceById(id: string): ContainersServiceDefinition | undefined {
  return CONTAINERS_SERVICES.find(s => s.id === id);
}

export function isContainersResource(terraformResource: string): boolean {
  return CONTAINERS_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getContainersIcon(terraformResource: string): string {
  return CONTAINERS_ICONS[terraformResource] || CONTAINERS_ICONS['aws_ecs_cluster'];
}










