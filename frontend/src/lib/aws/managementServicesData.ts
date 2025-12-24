/**
 * AWS Management & Governance Services Data - Complete definitions from management.json
 * This file contains ALL 19 management services with ALL their properties
 * 
 * Services included:
 * 1. CloudWatch Log Group (aws_cloudwatch_log_group)
 * 2. CloudWatch Log Stream (aws_cloudwatch_log_stream)
 * 3. CloudWatch Metric Alarm (aws_cloudwatch_metric_alarm)
 * 4. CloudWatch Dashboard (aws_cloudwatch_dashboard)
 * 5. CloudWatch Log Metric Filter (aws_cloudwatch_log_metric_filter)
 * 6. CloudWatch Log Subscription Filter (aws_cloudwatch_log_subscription_filter)
 * 7. CloudTrail (aws_cloudtrail)
 * 8. AWS Config Recorder (aws_config_configuration_recorder)
 * 9. AWS Config Recorder Status (aws_config_configuration_recorder_status)
 * 10. AWS Config Delivery Channel (aws_config_delivery_channel)
 * 11. AWS Config Rule (aws_config_config_rule)
 * 12. SSM Parameter (aws_ssm_parameter)
 * 13. SSM Document (aws_ssm_document)
 * 14. SSM Maintenance Window (aws_ssm_maintenance_window)
 * 15. AWS Organizations (aws_organizations_organization)
 * 16. Organizational Unit (aws_organizations_organizational_unit)
 * 17. AWS Account (aws_organizations_account)
 * 18. Organizations Policy (aws_organizations_policy)
 * 19. Service Catalog Portfolio (aws_servicecatalog_portfolio)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Management service icon mappings - using actual AWS Architecture icons
export const MANAGEMENT_ICONS: Record<string, string> = {
  'aws_cloudwatch_log_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudwatch_log_stream': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudwatch_metric_alarm': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudwatch_dashboard': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudwatch_log_metric_filter': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudwatch_log_subscription_filter': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg',
  'aws_cloudtrail': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-CloudTrail_64.svg',
  'aws_config_configuration_recorder': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Config_64.svg',
  'aws_config_configuration_recorder_status': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Config_64.svg',
  'aws_config_delivery_channel': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Config_64.svg',
  'aws_config_config_rule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Config_64.svg',
  'aws_ssm_parameter': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Systems-Manager_64.svg',
  'aws_ssm_document': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Systems-Manager_64.svg',
  'aws_ssm_maintenance_window': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Systems-Manager_64.svg',
  'aws_organizations_organization': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Organizations_64.svg',
  'aws_organizations_organizational_unit': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Organizations_64.svg',
  'aws_organizations_account': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Organizations_64.svg',
  'aws_organizations_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Organizations_64.svg',
  'aws_servicecatalog_portfolio': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_AWS-Service-Catalog_64.svg',
};

// Management service definition interface
export interface ManagementServiceDefinition {
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

// Complete management services data from management.json
export const MANAGEMENT_SERVICES: ManagementServiceDefinition[] = [
  {
    id: "cloudwatch_log_group",
    name: "CloudWatch Log Group",
    description: "Log storage and management",
    terraform_resource: "aws_cloudwatch_log_group",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_log_group'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Log group name" },
        { name: "name_prefix", type: "string", description: "Log group name prefix" },
        { name: "retention_in_days", type: "number", description: "Retention in days", options: ["0", "1", "3", "5", "7", "14", "30", "60", "90", "120", "150", "180", "365", "400", "545", "731", "1096", "1827", "2192", "2557", "2922", "3288", "3653"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "skip_destroy", type: "bool", description: "Skip destroy" },
        { name: "log_group_class", type: "string", description: "Log group class", options: ["STANDARD", "INFREQUENT_ACCESS"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Log group ARN" },
      { name: "name", type: "string", description: "Log group name" }
    ]
  },
  {
    id: "cloudwatch_log_stream",
    name: "CloudWatch Log Stream",
    description: "Log stream within log group",
    terraform_resource: "aws_cloudwatch_log_stream",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_log_stream'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Log stream name" },
        { name: "log_group_name", type: "string", description: "Log group name", reference: "aws_cloudwatch_log_group.name" }
      ],
      optional: []
    },
    outputs: [
      { name: "arn", type: "string", description: "Log stream ARN" },
      { name: "name", type: "string", description: "Log stream name" }
    ]
  },
  {
    id: "cloudwatch_metric_alarm",
    name: "CloudWatch Metric Alarm",
    description: "Alarm based on CloudWatch metrics",
    terraform_resource: "aws_cloudwatch_metric_alarm",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_metric_alarm'],
    inputs: {
      required: [
        { name: "alarm_name", type: "string", description: "Alarm name" },
        { name: "comparison_operator", type: "string", description: "Comparison operator", options: ["GreaterThanOrEqualToThreshold", "GreaterThanThreshold", "LessThanThreshold", "LessThanOrEqualToThreshold"] },
        { name: "evaluation_periods", type: "number", description: "Evaluation periods" }
      ],
      optional: [
        { name: "metric_name", type: "string", description: "Metric name" },
        { name: "namespace", type: "string", description: "Metric namespace" },
        { name: "period", type: "number", description: "Period in seconds" },
        { name: "statistic", type: "string", description: "Statistic", options: ["SampleCount", "Average", "Sum", "Minimum", "Maximum"] },
        { name: "threshold", type: "number", description: "Threshold value" },
        { name: "actions_enabled", type: "bool", description: "Actions enabled" },
        { name: "alarm_actions", type: "list(string)", description: "Alarm action ARNs" },
        { name: "alarm_description", type: "string", description: "Alarm description" },
        { name: "datapoints_to_alarm", type: "number", description: "Datapoints to alarm" },
        { name: "dimensions", type: "map(string)", description: "Metric dimensions" },
        { name: "insufficient_data_actions", type: "list(string)", description: "Insufficient data action ARNs" },
        { name: "ok_actions", type: "list(string)", description: "OK action ARNs" },
        { name: "treat_missing_data", type: "string", description: "Treat missing data", options: ["missing", "ignore", "breaching", "notBreaching"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "metric_query",
          multiple: true,
          attributes: [
            { name: "id", type: "string", required: true },
            { name: "expression", type: "string" },
            { name: "label", type: "string" },
            { name: "return_data", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Alarm ID" },
      { name: "arn", type: "string", description: "Alarm ARN" }
    ]
  },
  {
    id: "cloudwatch_dashboard",
    name: "CloudWatch Dashboard",
    description: "Monitoring dashboard",
    terraform_resource: "aws_cloudwatch_dashboard",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_dashboard'],
    inputs: {
      required: [
        { name: "dashboard_name", type: "string", description: "Dashboard name" },
        { name: "dashboard_body", type: "string", description: "Dashboard body JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "dashboard_arn", type: "string", description: "Dashboard ARN" }
    ]
  },
  {
    id: "cloudwatch_log_metric_filter",
    name: "CloudWatch Log Metric Filter",
    description: "Filter to create metrics from logs",
    terraform_resource: "aws_cloudwatch_log_metric_filter",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_log_metric_filter'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Filter name" },
        { name: "log_group_name", type: "string", description: "Log group name", reference: "aws_cloudwatch_log_group.name" },
        { name: "pattern", type: "string", description: "Filter pattern" }
      ],
      optional: [],
      blocks: [
        {
          name: "metric_transformation",
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "namespace", type: "string", required: true },
            { name: "value", type: "string", required: true },
            { name: "default_value", type: "string" },
            { name: "dimensions", type: "map(string)" },
            { name: "unit", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Filter ID" }
    ]
  },
  {
    id: "cloudwatch_log_subscription_filter",
    name: "CloudWatch Log Subscription Filter",
    description: "Stream logs to destinations",
    terraform_resource: "aws_cloudwatch_log_subscription_filter",
    icon: MANAGEMENT_ICONS['aws_cloudwatch_log_subscription_filter'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Filter name" },
        { name: "log_group_name", type: "string", description: "Log group name", reference: "aws_cloudwatch_log_group.name" },
        { name: "filter_pattern", type: "string", description: "Filter pattern" },
        { name: "destination_arn", type: "string", description: "Destination ARN" }
      ],
      optional: [
        { name: "role_arn", type: "string", description: "IAM role ARN" },
        { name: "distribution", type: "string", description: "Distribution", options: ["Random", "ByLogStream"] }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Filter ID" }
    ]
  },
  {
    id: "cloudtrail",
    name: "CloudTrail",
    description: "AWS API activity logging",
    terraform_resource: "aws_cloudtrail",
    icon: MANAGEMENT_ICONS['aws_cloudtrail'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Trail name" },
        { name: "s3_bucket_name", type: "string", description: "S3 bucket for logs", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "cloud_watch_logs_group_arn", type: "string", description: "CloudWatch Logs group ARN" },
        { name: "cloud_watch_logs_role_arn", type: "string", description: "CloudWatch Logs role ARN" },
        { name: "enable_log_file_validation", type: "bool", description: "Enable log file validation" },
        { name: "enable_logging", type: "bool", description: "Enable logging" },
        { name: "include_global_service_events", type: "bool", description: "Include global service events" },
        { name: "is_multi_region_trail", type: "bool", description: "Is multi-region trail" },
        { name: "is_organization_trail", type: "bool", description: "Is organization trail" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "s3_key_prefix", type: "string", description: "S3 key prefix" },
        { name: "sns_topic_name", type: "string", description: "SNS topic name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "event_selector",
          multiple: true,
          attributes: [
            { name: "include_management_events", type: "bool" },
            { name: "read_write_type", type: "string", options: ["ReadOnly", "WriteOnly", "All"] }
          ]
        },
        {
          name: "insight_selector",
          multiple: true,
          attributes: [
            { name: "insight_type", type: "string", required: true, options: ["ApiCallRateInsight", "ApiErrorRateInsight"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Trail name" },
      { name: "arn", type: "string", description: "Trail ARN" },
      { name: "home_region", type: "string", description: "Home region" }
    ]
  },
  {
    id: "config_configuration_recorder",
    name: "AWS Config Recorder",
    description: "Configuration change recorder",
    terraform_resource: "aws_config_configuration_recorder",
    icon: MANAGEMENT_ICONS['aws_config_configuration_recorder'],
    inputs: {
      required: [
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "name", type: "string", description: "Recorder name" }
      ],
      blocks: [
        {
          name: "recording_group",
          attributes: [
            { name: "all_supported", type: "bool" },
            { name: "include_global_resource_types", type: "bool" },
            { name: "resource_types", type: "list(string)" }
          ]
        },
        {
          name: "recording_mode",
          attributes: [
            { name: "recording_frequency", type: "string", options: ["CONTINUOUS", "DAILY"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Recorder name" }
    ]
  },
  {
    id: "config_configuration_recorder_status",
    name: "AWS Config Recorder Status",
    description: "Enable/disable Config recorder",
    terraform_resource: "aws_config_configuration_recorder_status",
    icon: MANAGEMENT_ICONS['aws_config_configuration_recorder_status'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Recorder name", reference: "aws_config_configuration_recorder.name" },
        { name: "is_enabled", type: "bool", description: "Is enabled" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Recorder name" }
    ]
  },
  {
    id: "config_delivery_channel",
    name: "AWS Config Delivery Channel",
    description: "Delivery channel for Config",
    terraform_resource: "aws_config_delivery_channel",
    icon: MANAGEMENT_ICONS['aws_config_delivery_channel'],
    inputs: {
      required: [
        { name: "s3_bucket_name", type: "string", description: "S3 bucket name", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "name", type: "string", description: "Channel name" },
        { name: "s3_key_prefix", type: "string", description: "S3 key prefix" },
        { name: "s3_kms_key_arn", type: "string", description: "S3 KMS key ARN" },
        { name: "sns_topic_arn", type: "string", description: "SNS topic ARN" }
      ],
      blocks: [
        {
          name: "snapshot_delivery_properties",
          attributes: [
            { name: "delivery_frequency", type: "string", options: ["One_Hour", "Three_Hours", "Six_Hours", "Twelve_Hours", "TwentyFour_Hours"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Channel name" }
    ]
  },
  {
    id: "config_config_rule",
    name: "AWS Config Rule",
    description: "Compliance rule for Config",
    terraform_resource: "aws_config_config_rule",
    icon: MANAGEMENT_ICONS['aws_config_config_rule'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Rule name" }
      ],
      optional: [
        { name: "description", type: "string", description: "Rule description" },
        { name: "input_parameters", type: "string", description: "Input parameters JSON" },
        { name: "maximum_execution_frequency", type: "string", description: "Max execution frequency", options: ["One_Hour", "Three_Hours", "Six_Hours", "Twelve_Hours", "TwentyFour_Hours"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "source",
          attributes: [
            { name: "owner", type: "string", required: true, options: ["AWS", "CUSTOM_LAMBDA", "CUSTOM_POLICY"] }
          ]
        },
        {
          name: "scope",
          attributes: [
            { name: "compliance_resource_id", type: "string" },
            { name: "compliance_resource_types", type: "list(string)" },
            { name: "tag_key", type: "string" },
            { name: "tag_value", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Rule ARN" },
      { name: "rule_id", type: "string", description: "Rule ID" }
    ]
  },
  {
    id: "ssm_parameter",
    name: "SSM Parameter",
    description: "Systems Manager parameter store",
    terraform_resource: "aws_ssm_parameter",
    icon: MANAGEMENT_ICONS['aws_ssm_parameter'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Parameter name" },
        { name: "type", type: "string", description: "Parameter type", options: ["String", "StringList", "SecureString"] }
      ],
      optional: [
        { name: "value", type: "string", description: "Parameter value" },
        { name: "description", type: "string", description: "Parameter description" },
        { name: "tier", type: "string", description: "Parameter tier", options: ["Standard", "Advanced", "Intelligent-Tiering"] },
        { name: "key_id", type: "string", description: "KMS key ID for SecureString" },
        { name: "overwrite", type: "bool", description: "Overwrite existing" },
        { name: "allowed_pattern", type: "string", description: "Allowed pattern regex" },
        { name: "data_type", type: "string", description: "Data type", options: ["text", "aws:ec2:image", "aws:ssm:integration"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Parameter ARN" },
      { name: "name", type: "string", description: "Parameter name" },
      { name: "type", type: "string", description: "Parameter type" },
      { name: "value", type: "string", description: "Parameter value" },
      { name: "version", type: "number", description: "Parameter version" }
    ]
  },
  {
    id: "ssm_document",
    name: "SSM Document",
    description: "Systems Manager document",
    terraform_resource: "aws_ssm_document",
    icon: MANAGEMENT_ICONS['aws_ssm_document'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Document name" },
        { name: "content", type: "string", description: "Document content JSON/YAML" },
        { name: "document_type", type: "string", description: "Document type", options: ["Command", "Policy", "Automation", "Session", "Package"] }
      ],
      optional: [
        { name: "document_format", type: "string", description: "Document format", options: ["JSON", "YAML", "TEXT"] },
        { name: "target_type", type: "string", description: "Target type" },
        { name: "version_name", type: "string", description: "Version name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "attachments_source",
          multiple: true,
          attributes: [
            { name: "key", type: "string", required: true, options: ["SourceUrl", "S3FileUrl", "AttachmentReference"] },
            { name: "values", type: "list(string)", required: true },
            { name: "name", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Document ARN" },
      { name: "created_date", type: "string", description: "Creation date" },
      { name: "default_version", type: "string", description: "Default version" },
      { name: "description", type: "string", description: "Document description" },
      { name: "document_version", type: "string", description: "Document version" },
      { name: "hash", type: "string", description: "Document hash" },
      { name: "latest_version", type: "string", description: "Latest version" },
      { name: "owner", type: "string", description: "Owner account ID" },
      { name: "status", type: "string", description: "Document status" }
    ]
  },
  {
    id: "ssm_maintenance_window",
    name: "SSM Maintenance Window",
    description: "Maintenance window for patching",
    terraform_resource: "aws_ssm_maintenance_window",
    icon: MANAGEMENT_ICONS['aws_ssm_maintenance_window'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Window name" },
        { name: "cutoff", type: "number", description: "Cutoff hours before window end" },
        { name: "duration", type: "number", description: "Duration in hours" },
        { name: "schedule", type: "string", description: "Schedule expression" }
      ],
      optional: [
        { name: "allow_unassociated_targets", type: "bool", description: "Allow unassociated targets" },
        { name: "description", type: "string", description: "Window description" },
        { name: "enabled", type: "bool", description: "Is enabled" },
        { name: "end_date", type: "string", description: "End date" },
        { name: "schedule_offset", type: "number", description: "Schedule offset days" },
        { name: "schedule_timezone", type: "string", description: "Schedule timezone" },
        { name: "start_date", type: "string", description: "Start date" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Window ID" }
    ]
  },
  {
    id: "organizations_organization",
    name: "AWS Organizations",
    description: "Multi-account management",
    terraform_resource: "aws_organizations_organization",
    icon: MANAGEMENT_ICONS['aws_organizations_organization'],
    inputs: {
      required: [],
      optional: [
        { name: "aws_service_access_principals", type: "list(string)", description: "AWS service access principals" },
        { name: "enabled_policy_types", type: "list(string)", description: "Enabled policy types" },
        { name: "feature_set", type: "string", description: "Feature set", options: ["ALL", "CONSOLIDATED_BILLING"] }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Organization ID" },
      { name: "arn", type: "string", description: "Organization ARN" },
      { name: "master_account_arn", type: "string", description: "Master account ARN" },
      { name: "master_account_email", type: "string", description: "Master account email" },
      { name: "master_account_id", type: "string", description: "Master account ID" }
    ]
  },
  {
    id: "organizations_organizational_unit",
    name: "Organizational Unit",
    description: "Container for accounts",
    terraform_resource: "aws_organizations_organizational_unit",
    icon: MANAGEMENT_ICONS['aws_organizations_organizational_unit'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "OU name" },
        { name: "parent_id", type: "string", description: "Parent ID" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "OU ID" },
      { name: "arn", type: "string", description: "OU ARN" }
    ]
  },
  {
    id: "organizations_account",
    name: "AWS Account",
    description: "Member account in organization",
    terraform_resource: "aws_organizations_account",
    icon: MANAGEMENT_ICONS['aws_organizations_account'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Account name" },
        { name: "email", type: "string", description: "Account email" }
      ],
      optional: [
        { name: "close_on_deletion", type: "bool", description: "Close account on deletion" },
        { name: "create_govcloud", type: "bool", description: "Create GovCloud account" },
        { name: "iam_user_access_to_billing", type: "string", description: "IAM user access to billing", options: ["ALLOW", "DENY"] },
        { name: "parent_id", type: "string", description: "Parent OU ID" },
        { name: "role_name", type: "string", description: "Admin role name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Account ID" },
      { name: "arn", type: "string", description: "Account ARN" },
      { name: "govcloud_id", type: "string", description: "GovCloud account ID" },
      { name: "status", type: "string", description: "Account status" }
    ]
  },
  {
    id: "organizations_policy",
    name: "Organizations Policy",
    description: "Service control or other policy",
    terraform_resource: "aws_organizations_policy",
    icon: MANAGEMENT_ICONS['aws_organizations_policy'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Policy name" },
        { name: "content", type: "string", description: "Policy content JSON" }
      ],
      optional: [
        { name: "description", type: "string", description: "Policy description" },
        { name: "type", type: "string", description: "Policy type", options: ["AISERVICES_OPT_OUT_POLICY", "BACKUP_POLICY", "SERVICE_CONTROL_POLICY", "TAG_POLICY"] },
        { name: "skip_destroy", type: "bool", description: "Skip destroy" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Policy ID" },
      { name: "arn", type: "string", description: "Policy ARN" }
    ]
  },
  {
    id: "service_catalog_portfolio",
    name: "Service Catalog Portfolio",
    description: "Collection of products",
    terraform_resource: "aws_servicecatalog_portfolio",
    icon: MANAGEMENT_ICONS['aws_servicecatalog_portfolio'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Portfolio name" },
        { name: "provider_name", type: "string", description: "Provider name" }
      ],
      optional: [
        { name: "description", type: "string", description: "Portfolio description" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Portfolio ID" },
      { name: "arn", type: "string", description: "Portfolio ARN" },
      { name: "created_time", type: "string", description: "Creation time" }
    ]
  }
];

// List of all management terraform resource types
export const MANAGEMENT_TERRAFORM_RESOURCES = MANAGEMENT_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getManagementServiceByTerraformResource(terraformResource: string): ManagementServiceDefinition | undefined {
  return MANAGEMENT_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getManagementServiceById(id: string): ManagementServiceDefinition | undefined {
  return MANAGEMENT_SERVICES.find(s => s.id === id);
}

export function isManagementResource(terraformResource: string): boolean {
  return MANAGEMENT_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getManagementIcon(terraformResource: string): string {
  return MANAGEMENT_ICONS[terraformResource] || MANAGEMENT_ICONS['aws_cloudwatch_log_group'];
}











