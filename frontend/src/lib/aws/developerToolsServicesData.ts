/**
 * AWS Developer Tools Services Data - Complete definitions from developer-tools.json
 * This file contains ALL 13 developer tools services with ALL their properties
 * 
 * Services included:
 * 1. CodeCommit Repository (aws_codecommit_repository)
 * 2. CodeBuild Project (aws_codebuild_project)
 * 3. CodePipeline (aws_codepipeline)
 * 4. CodeDeploy Application (aws_codedeploy_app)
 * 5. CodeDeploy Deployment Group (aws_codedeploy_deployment_group)
 * 6. CodeArtifact Domain (aws_codeartifact_domain)
 * 7. CodeArtifact Repository (aws_codeartifact_repository)
 * 8. CodeStar Connection (aws_codestarconnections_connection)
 * 9. Amplify App (aws_amplify_app)
 * 10. Amplify Branch (aws_amplify_branch)
 * 11. X-Ray Sampling Rule (aws_xray_sampling_rule)
 * 12. X-Ray Group (aws_xray_group)
 * 13. Cloud9 Environment (aws_cloud9_environment_ec2)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Developer Tools service icon mappings - using actual AWS Architecture icons
export const DEVELOPER_TOOLS_ICONS: Record<string, string> = {
  'aws_codecommit_repository': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeCommit_64.svg',
  'aws_codebuild_project': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeBuild_64.svg',
  'aws_codepipeline': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodePipeline_64.svg',
  'aws_codedeploy_app': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeDeploy_64.svg',
  'aws_codedeploy_deployment_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeDeploy_64.svg',
  'aws_codeartifact_domain': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeArtifact_64.svg',
  'aws_codeartifact_repository': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-CodeArtifact_64.svg',
  'aws_codestarconnections_connection': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_Amazon-CodeCatalyst_64.svg',
  'aws_amplify_app': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Front-End-Web-Mobile/64/Arch_AWS-Amplify_64.svg',
  'aws_amplify_branch': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Front-End-Web-Mobile/64/Arch_AWS-Amplify_64.svg',
  'aws_xray_sampling_rule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-X-Ray_64.svg',
  'aws_xray_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-X-Ray_64.svg',
  'aws_cloud9_environment_ec2': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Developer-Tools/64/Arch_AWS-Cloud9_64.svg',
};

// Developer Tools service definition interface
export interface DeveloperToolsServiceDefinition {
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

// Complete developer tools services data from developer-tools.json
export const DEVELOPER_TOOLS_SERVICES: DeveloperToolsServiceDefinition[] = [
  {
    id: "codecommit_repository",
    name: "CodeCommit Repository",
    description: "Git repository hosting",
    terraform_resource: "aws_codecommit_repository",
    icon: DEVELOPER_TOOLS_ICONS['aws_codecommit_repository'],
    inputs: {
      required: [
        { name: "repository_name", type: "string", description: "Repository name" }
      ],
      optional: [
        { name: "description", type: "string", description: "Repository description" },
        { name: "default_branch", type: "string", description: "Default branch name" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Repository ARN" },
      { name: "clone_url_http", type: "string", description: "HTTP clone URL" },
      { name: "clone_url_ssh", type: "string", description: "SSH clone URL" },
      { name: "repository_id", type: "string", description: "Repository ID" },
      { name: "repository_name", type: "string", description: "Repository name" }
    ]
  },
  {
    id: "codebuild_project",
    name: "CodeBuild Project",
    description: "Build and test service",
    terraform_resource: "aws_codebuild_project",
    icon: DEVELOPER_TOOLS_ICONS['aws_codebuild_project'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Project name" },
        { name: "service_role", type: "string", description: "Service role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "badge_enabled", type: "bool", description: "Enable build badge" },
        { name: "build_timeout", type: "number", description: "Build timeout in minutes" },
        { name: "concurrent_build_limit", type: "number", description: "Concurrent build limit" },
        { name: "description", type: "string", description: "Project description" },
        { name: "encryption_key", type: "string", description: "KMS key ARN" },
        { name: "project_visibility", type: "string", description: "Project visibility", options: ["PUBLIC_READ", "PRIVATE"] },
        { name: "queued_timeout", type: "number", description: "Queued timeout in minutes" },
        { name: "source_version", type: "string", description: "Source version" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "artifacts",
          attributes: [
            { name: "type", type: "string", required: true, options: ["CODEPIPELINE", "NO_ARTIFACTS", "S3"] },
            { name: "location", type: "string" },
            { name: "name", type: "string" },
            { name: "encryption_disabled", type: "bool" },
            { name: "packaging", type: "string" },
            { name: "path", type: "string" }
          ]
        },
        {
          name: "environment",
          attributes: [
            { name: "compute_type", type: "string", required: true, options: ["BUILD_GENERAL1_SMALL", "BUILD_GENERAL1_MEDIUM", "BUILD_GENERAL1_LARGE", "BUILD_GENERAL1_2XLARGE"] },
            { name: "image", type: "string", required: true },
            { name: "type", type: "string", required: true, options: ["LINUX_CONTAINER", "LINUX_GPU_CONTAINER", "WINDOWS_CONTAINER", "ARM_CONTAINER"] },
            { name: "privileged_mode", type: "bool" },
            { name: "image_pull_credentials_type", type: "string", options: ["CODEBUILD", "SERVICE_ROLE"] }
          ]
        },
        {
          name: "source",
          attributes: [
            { name: "type", type: "string", required: true, options: ["BITBUCKET", "CODECOMMIT", "CODEPIPELINE", "GITHUB", "GITHUB_ENTERPRISE", "GITLAB", "NO_SOURCE", "S3"] },
            { name: "buildspec", type: "string" },
            { name: "git_clone_depth", type: "number" },
            { name: "insecure_ssl", type: "bool" },
            { name: "location", type: "string" },
            { name: "report_build_status", type: "bool" }
          ]
        },
        {
          name: "cache",
          attributes: [
            { name: "type", type: "string", options: ["LOCAL", "NO_CACHE", "S3"] },
            { name: "location", type: "string" },
            { name: "modes", type: "list(string)" }
          ]
        },
        {
          name: "vpc_config",
          attributes: [
            { name: "security_group_ids", type: "list(string)", required: true },
            { name: "subnets", type: "list(string)", required: true },
            { name: "vpc_id", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Project ARN" },
      { name: "badge_url", type: "string", description: "Badge URL" },
      { name: "id", type: "string", description: "Project ID" },
      { name: "name", type: "string", description: "Project name" }
    ]
  },
  {
    id: "codepipeline",
    name: "CodePipeline",
    description: "Continuous delivery pipeline",
    terraform_resource: "aws_codepipeline",
    icon: DEVELOPER_TOOLS_ICONS['aws_codepipeline'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Pipeline name" },
        { name: "role_arn", type: "string", description: "Service role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "execution_mode", type: "string", description: "Execution mode", options: ["QUEUED", "SUPERSEDED", "PARALLEL"] },
        { name: "pipeline_type", type: "string", description: "Pipeline type", options: ["V1", "V2"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "artifact_store",
          multiple: true,
          attributes: [
            { name: "location", type: "string", required: true },
            { name: "type", type: "string", required: true, options: ["S3"] },
            { name: "region", type: "string" }
          ]
        },
        {
          name: "stage",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Pipeline ARN" },
      { name: "id", type: "string", description: "Pipeline ID" },
      { name: "name", type: "string", description: "Pipeline name" }
    ]
  },
  {
    id: "codedeploy_app",
    name: "CodeDeploy Application",
    description: "Application deployment service",
    terraform_resource: "aws_codedeploy_app",
    icon: DEVELOPER_TOOLS_ICONS['aws_codedeploy_app'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Application name" }
      ],
      optional: [
        { name: "compute_platform", type: "string", description: "Compute platform", options: ["Server", "Lambda", "ECS"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Application ARN" },
      { name: "application_id", type: "string", description: "Application ID" },
      { name: "id", type: "string", description: "Application ID" },
      { name: "name", type: "string", description: "Application name" }
    ]
  },
  {
    id: "codedeploy_deployment_group",
    name: "CodeDeploy Deployment Group",
    description: "Group of deployment targets",
    terraform_resource: "aws_codedeploy_deployment_group",
    icon: DEVELOPER_TOOLS_ICONS['aws_codedeploy_deployment_group'],
    inputs: {
      required: [
        { name: "app_name", type: "string", description: "Application name", reference: "aws_codedeploy_app.name" },
        { name: "deployment_group_name", type: "string", description: "Deployment group name" },
        { name: "service_role_arn", type: "string", description: "Service role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "autoscaling_groups", type: "list(string)", description: "Auto Scaling group names" },
        { name: "deployment_config_name", type: "string", description: "Deployment config name" },
        { name: "outdated_instances_strategy", type: "string", description: "Outdated instances strategy", options: ["UPDATE", "IGNORE"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "auto_rollback_configuration",
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "events", type: "list(string)" }
          ]
        },
        {
          name: "deployment_style",
          attributes: [
            { name: "deployment_option", type: "string", options: ["WITH_TRAFFIC_CONTROL", "WITHOUT_TRAFFIC_CONTROL"] },
            { name: "deployment_type", type: "string", options: ["IN_PLACE", "BLUE_GREEN"] }
          ]
        },
        {
          name: "ec2_tag_filter",
          multiple: true,
          attributes: [
            { name: "key", type: "string" },
            { name: "type", type: "string", options: ["KEY_ONLY", "VALUE_ONLY", "KEY_AND_VALUE"] },
            { name: "value", type: "string" }
          ]
        },
        {
          name: "ecs_service",
          attributes: [
            { name: "cluster_name", type: "string", required: true },
            { name: "service_name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Deployment group ARN" },
      { name: "compute_platform", type: "string", description: "Compute platform" },
      { name: "deployment_group_id", type: "string", description: "Deployment group ID" },
      { name: "id", type: "string", description: "Deployment group ID" }
    ]
  },
  {
    id: "codeartifact_domain",
    name: "CodeArtifact Domain",
    description: "Artifact repository domain",
    terraform_resource: "aws_codeartifact_domain",
    icon: DEVELOPER_TOOLS_ICONS['aws_codeartifact_domain'],
    inputs: {
      required: [
        { name: "domain", type: "string", description: "Domain name" }
      ],
      optional: [
        { name: "encryption_key", type: "string", description: "KMS key ARN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Domain ARN" },
      { name: "asset_size_bytes", type: "number", description: "Asset size in bytes" },
      { name: "created_time", type: "string", description: "Creation time" },
      { name: "id", type: "string", description: "Domain ID" },
      { name: "owner", type: "string", description: "Owner account ID" },
      { name: "repository_count", type: "number", description: "Repository count" }
    ]
  },
  {
    id: "codeartifact_repository",
    name: "CodeArtifact Repository",
    description: "Artifact package repository",
    terraform_resource: "aws_codeartifact_repository",
    icon: DEVELOPER_TOOLS_ICONS['aws_codeartifact_repository'],
    inputs: {
      required: [
        { name: "domain", type: "string", description: "Domain name", reference: "aws_codeartifact_domain.domain" },
        { name: "repository", type: "string", description: "Repository name" }
      ],
      optional: [
        { name: "description", type: "string", description: "Repository description" },
        { name: "domain_owner", type: "string", description: "Domain owner account ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "external_connections",
          attributes: [
            { name: "external_connection_name", type: "string", required: true }
          ]
        },
        {
          name: "upstream",
          multiple: true,
          attributes: [
            { name: "repository_name", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Repository ARN" },
      { name: "administrator_account", type: "string", description: "Administrator account ID" },
      { name: "id", type: "string", description: "Repository ID" }
    ]
  },
  {
    id: "codestar_connection",
    name: "CodeStar Connection",
    description: "Source control connection",
    terraform_resource: "aws_codestarconnections_connection",
    icon: DEVELOPER_TOOLS_ICONS['aws_codestarconnections_connection'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Connection name" }
      ],
      optional: [
        { name: "host_arn", type: "string", description: "Host ARN for self-managed" },
        { name: "provider_type", type: "string", description: "Provider type", options: ["Bitbucket", "GitHub", "GitHubEnterpriseServer", "GitLab", "GitLabSelfManaged"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Connection ARN" },
      { name: "connection_status", type: "string", description: "Connection status" },
      { name: "id", type: "string", description: "Connection ID" }
    ]
  },
  {
    id: "amplify_app",
    name: "Amplify App",
    description: "Full-stack web app hosting",
    terraform_resource: "aws_amplify_app",
    icon: DEVELOPER_TOOLS_ICONS['aws_amplify_app'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "App name" }
      ],
      optional: [
        { name: "access_token", type: "string", description: "Personal access token" },
        { name: "build_spec", type: "string", description: "Build spec YAML" },
        { name: "description", type: "string", description: "App description" },
        { name: "enable_auto_branch_creation", type: "bool", description: "Enable auto branch creation" },
        { name: "enable_basic_auth", type: "bool", description: "Enable basic auth" },
        { name: "enable_branch_auto_build", type: "bool", description: "Enable branch auto build" },
        { name: "enable_branch_auto_deletion", type: "bool", description: "Enable branch auto deletion" },
        { name: "environment_variables", type: "map(string)", description: "Environment variables" },
        { name: "iam_service_role_arn", type: "string", description: "IAM service role ARN" },
        { name: "oauth_token", type: "string", description: "OAuth token" },
        { name: "platform", type: "string", description: "Platform", options: ["WEB", "WEB_COMPUTE", "WEB_DYNAMIC"] },
        { name: "repository", type: "string", description: "Repository URL" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "auto_branch_creation_config",
          attributes: [
            { name: "enable_auto_build", type: "bool" },
            { name: "enable_basic_auth", type: "bool" },
            { name: "enable_pull_request_preview", type: "bool" },
            { name: "environment_variables", type: "map(string)" },
            { name: "framework", type: "string" },
            { name: "stage", type: "string" }
          ]
        },
        {
          name: "custom_rule",
          multiple: true,
          attributes: [
            { name: "source", type: "string", required: true },
            { name: "target", type: "string", required: true },
            { name: "condition", type: "string" },
            { name: "status", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "App ARN" },
      { name: "default_domain", type: "string", description: "Default domain" },
      { name: "id", type: "string", description: "App ID" }
    ]
  },
  {
    id: "amplify_branch",
    name: "Amplify Branch",
    description: "Branch in Amplify app",
    terraform_resource: "aws_amplify_branch",
    icon: DEVELOPER_TOOLS_ICONS['aws_amplify_branch'],
    inputs: {
      required: [
        { name: "app_id", type: "string", description: "App ID", reference: "aws_amplify_app.id" },
        { name: "branch_name", type: "string", description: "Branch name" }
      ],
      optional: [
        { name: "backend_environment_arn", type: "string", description: "Backend environment ARN" },
        { name: "description", type: "string", description: "Branch description" },
        { name: "display_name", type: "string", description: "Display name" },
        { name: "enable_auto_build", type: "bool", description: "Enable auto build" },
        { name: "enable_basic_auth", type: "bool", description: "Enable basic auth" },
        { name: "enable_notification", type: "bool", description: "Enable notifications" },
        { name: "enable_performance_mode", type: "bool", description: "Enable performance mode" },
        { name: "enable_pull_request_preview", type: "bool", description: "Enable PR preview" },
        { name: "environment_variables", type: "map(string)", description: "Environment variables" },
        { name: "framework", type: "string", description: "Framework" },
        { name: "stage", type: "string", description: "Stage", options: ["PRODUCTION", "BETA", "DEVELOPMENT", "EXPERIMENTAL", "PULL_REQUEST"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Branch ARN" },
      { name: "associated_resources", type: "list(string)", description: "Associated resources" },
      { name: "custom_domains", type: "list(string)", description: "Custom domains" }
    ]
  },
  {
    id: "xray_sampling_rule",
    name: "X-Ray Sampling Rule",
    description: "Distributed tracing sampling rule",
    terraform_resource: "aws_xray_sampling_rule",
    icon: DEVELOPER_TOOLS_ICONS['aws_xray_sampling_rule'],
    inputs: {
      required: [
        { name: "rule_name", type: "string", description: "Rule name" },
        { name: "priority", type: "number", description: "Rule priority" },
        { name: "reservoir_size", type: "number", description: "Reservoir size" },
        { name: "fixed_rate", type: "number", description: "Fixed rate (0-1)" },
        { name: "url_path", type: "string", description: "URL path pattern" },
        { name: "host", type: "string", description: "Host pattern" },
        { name: "http_method", type: "string", description: "HTTP method pattern" },
        { name: "service_type", type: "string", description: "Service type pattern" },
        { name: "service_name", type: "string", description: "Service name pattern" },
        { name: "version", type: "number", description: "Rule version" }
      ],
      optional: [
        { name: "attributes", type: "map(string)", description: "Attributes" },
        { name: "resource_arn", type: "string", description: "Resource ARN pattern" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Rule ARN" },
      { name: "id", type: "string", description: "Rule ID" }
    ]
  },
  {
    id: "xray_group",
    name: "X-Ray Group",
    description: "Filter group for X-Ray traces",
    terraform_resource: "aws_xray_group",
    icon: DEVELOPER_TOOLS_ICONS['aws_xray_group'],
    inputs: {
      required: [
        { name: "group_name", type: "string", description: "Group name" },
        { name: "filter_expression", type: "string", description: "Filter expression" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "insights_configuration",
          attributes: [
            { name: "insights_enabled", type: "bool", required: true },
            { name: "notifications_enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Group ARN" },
      { name: "id", type: "string", description: "Group ID" }
    ]
  },
  {
    id: "cloud9_environment",
    name: "Cloud9 Environment",
    description: "Cloud-based IDE environment",
    terraform_resource: "aws_cloud9_environment_ec2",
    icon: DEVELOPER_TOOLS_ICONS['aws_cloud9_environment_ec2'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Environment name" },
        { name: "instance_type", type: "string", description: "EC2 instance type" }
      ],
      optional: [
        { name: "automatic_stop_time_minutes", type: "number", description: "Auto stop time in minutes" },
        { name: "connection_type", type: "string", description: "Connection type", options: ["CONNECT_SSH", "CONNECT_SSM"] },
        { name: "description", type: "string", description: "Environment description" },
        { name: "image_id", type: "string", description: "Image ID" },
        { name: "owner_arn", type: "string", description: "Owner ARN" },
        { name: "subnet_id", type: "string", description: "Subnet ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Environment ARN" },
      { name: "id", type: "string", description: "Environment ID" },
      { name: "type", type: "string", description: "Environment type" }
    ]
  }
];

// List of all developer tools terraform resource types
export const DEVELOPER_TOOLS_TERRAFORM_RESOURCES = DEVELOPER_TOOLS_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getDeveloperToolsServiceByTerraformResource(terraformResource: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getDeveloperToolsServiceById(id: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(s => s.id === id);
}

export function isDeveloperToolsResource(terraformResource: string): boolean {
  return DEVELOPER_TOOLS_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getDeveloperToolsIcon(terraformResource: string): string {
  return DEVELOPER_TOOLS_ICONS[terraformResource] || DEVELOPER_TOOLS_ICONS['aws_codebuild_project'];
}











