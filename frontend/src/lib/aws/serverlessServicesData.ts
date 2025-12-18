/**
 * AWS Serverless Services Data - Complete definitions from serverless.json
 * This file contains ALL 11 serverless services with ALL their properties
 * 
 * Services included:
 * 1. Lambda Function (aws_lambda_function)
 * 2. Lambda Alias (aws_lambda_alias)
 * 3. Lambda Layer (aws_lambda_layer_version)
 * 4. Lambda Permission (aws_lambda_permission)
 * 5. Lambda Event Source Mapping (aws_lambda_event_source_mapping)
 * 6. Lambda Function URL (aws_lambda_function_url)
 * 7. Step Functions State Machine (aws_sfn_state_machine)
 * 8. EventBridge Rule (aws_cloudwatch_event_rule)
 * 9. EventBridge Target (aws_cloudwatch_event_target)
 * 10. EventBridge Event Bus (aws_cloudwatch_event_bus)
 * 11. EventBridge Scheduler (aws_scheduler_schedule)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Serverless service icon mappings - using actual AWS Architecture icons
export const SERVERLESS_ICONS: Record<string, string> = {
  'aws_lambda_function': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_lambda_alias': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_lambda_layer_version': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_lambda_permission': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_lambda_event_source_mapping': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_lambda_function_url': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg',
  'aws_sfn_state_machine': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_AWS-Step-Functions_64.svg',
  'aws_cloudwatch_event_rule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg',
  'aws_cloudwatch_event_target': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg',
  'aws_cloudwatch_event_bus': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg',
  'aws_scheduler_schedule': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg',
};

// Serverless service definition interface
export interface ServerlessServiceDefinition {
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

// Complete serverless services data from serverless.json
export const SERVERLESS_SERVICES: ServerlessServiceDefinition[] = [
  {
    id: "lambda_function",
    name: "Lambda Function",
    description: "Serverless compute function",
    terraform_resource: "aws_lambda_function",
    icon: SERVERLESS_ICONS['aws_lambda_function'],
    inputs: {
      required: [
        { name: "function_name", type: "string", description: "Function name" },
        { name: "role", type: "string", description: "Execution role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "runtime", type: "string", description: "Runtime", options: ["nodejs18.x", "nodejs20.x", "python3.9", "python3.10", "python3.11", "python3.12", "java11", "java17", "java21", "dotnet6", "dotnet8", "go1.x", "ruby3.2", "ruby3.3", "provided", "provided.al2", "provided.al2023"] },
        { name: "handler", type: "string", description: "Handler function" },
        { name: "filename", type: "string", description: "Path to deployment package" },
        { name: "s3_bucket", type: "string", description: "S3 bucket for code" },
        { name: "s3_key", type: "string", description: "S3 key for code" },
        { name: "image_uri", type: "string", description: "Container image URI" },
        { name: "package_type", type: "string", description: "Package type", options: ["Zip", "Image"] },
        { name: "description", type: "string", description: "Function description" },
        { name: "memory_size", type: "number", description: "Memory size in MB", default: 128 },
        { name: "timeout", type: "number", description: "Timeout in seconds", default: 3 },
        { name: "reserved_concurrent_executions", type: "number", description: "Reserved concurrent executions" },
        { name: "publish", type: "bool", description: "Publish new version" },
        { name: "kms_key_arn", type: "string", description: "KMS key ARN for encryption" },
        { name: "layers", type: "list(string)", description: "Lambda layer ARNs" },
        { name: "architectures", type: "list(string)", description: "Architectures", options: ["x86_64", "arm64"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "dead_letter_config",
          attributes: [
            { name: "target_arn", type: "string", required: true }
          ]
        },
        {
          name: "environment",
          attributes: [
            { name: "variables", type: "map(string)" }
          ]
        },
        {
          name: "ephemeral_storage",
          attributes: [
            { name: "size", type: "number", required: true }
          ]
        },
        {
          name: "file_system_config",
          attributes: [
            { name: "arn", type: "string", required: true },
            { name: "local_mount_path", type: "string", required: true }
          ]
        },
        {
          name: "logging_config",
          attributes: [
            { name: "log_format", type: "string", required: true, options: ["Text", "JSON"] },
            { name: "application_log_level", type: "string", options: ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"] },
            { name: "log_group", type: "string" },
            { name: "system_log_level", type: "string", options: ["DEBUG", "INFO", "WARN"] }
          ]
        },
        {
          name: "tracing_config",
          attributes: [
            { name: "mode", type: "string", required: true, options: ["Active", "PassThrough"] }
          ]
        },
        {
          name: "vpc_config",
          attributes: [
            { name: "subnet_ids", type: "list(string)", required: true },
            { name: "security_group_ids", type: "list(string)", required: true },
            { name: "ipv6_allowed_for_dual_stack", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Function ARN" },
      { name: "function_name", type: "string", description: "Function name" },
      { name: "invoke_arn", type: "string", description: "Invoke ARN for API Gateway" },
      { name: "last_modified", type: "string", description: "Last modified timestamp" },
      { name: "qualified_arn", type: "string", description: "Qualified ARN with version" },
      { name: "version", type: "string", description: "Latest version" }
    ]
  },
  {
    id: "lambda_alias",
    name: "Lambda Alias",
    description: "Alias for Lambda function version",
    terraform_resource: "aws_lambda_alias",
    icon: SERVERLESS_ICONS['aws_lambda_alias'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Alias name" },
        { name: "function_name", type: "string", description: "Function name", reference: "aws_lambda_function.function_name" },
        { name: "function_version", type: "string", description: "Function version" }
      ],
      optional: [
        { name: "description", type: "string", description: "Alias description" }
      ],
      blocks: [
        {
          name: "routing_config",
          attributes: [
            { name: "additional_version_weights", type: "map(number)" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Alias ARN" },
      { name: "invoke_arn", type: "string", description: "Invoke ARN" }
    ]
  },
  {
    id: "lambda_layer_version",
    name: "Lambda Layer",
    description: "Lambda layer for shared code",
    terraform_resource: "aws_lambda_layer_version",
    icon: SERVERLESS_ICONS['aws_lambda_layer_version'],
    inputs: {
      required: [
        { name: "layer_name", type: "string", description: "Layer name" }
      ],
      optional: [
        { name: "filename", type: "string", description: "Path to layer package" },
        { name: "s3_bucket", type: "string", description: "S3 bucket for layer" },
        { name: "s3_key", type: "string", description: "S3 key for layer" },
        { name: "description", type: "string", description: "Layer description" },
        { name: "compatible_runtimes", type: "list(string)", description: "Compatible runtimes" },
        { name: "compatible_architectures", type: "list(string)", description: "Compatible architectures" },
        { name: "license_info", type: "string", description: "License information" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Layer version ARN" },
      { name: "layer_arn", type: "string", description: "Layer ARN without version" },
      { name: "version", type: "string", description: "Layer version" }
    ]
  },
  {
    id: "lambda_permission",
    name: "Lambda Permission",
    description: "Permission for Lambda invocation",
    terraform_resource: "aws_lambda_permission",
    icon: SERVERLESS_ICONS['aws_lambda_permission'],
    inputs: {
      required: [
        { name: "action", type: "string", description: "Lambda action", example: "lambda:InvokeFunction" },
        { name: "function_name", type: "string", description: "Function name", reference: "aws_lambda_function.function_name" },
        { name: "principal", type: "string", description: "Principal (service or account)" }
      ],
      optional: [
        { name: "statement_id", type: "string", description: "Statement ID" },
        { name: "statement_id_prefix", type: "string", description: "Statement ID prefix" },
        { name: "function_url_auth_type", type: "string", description: "Function URL auth type", options: ["AWS_IAM", "NONE"] },
        { name: "qualifier", type: "string", description: "Function version or alias" },
        { name: "source_account", type: "string", description: "Source account ID" },
        { name: "source_arn", type: "string", description: "Source ARN" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Permission ID" }
    ]
  },
  {
    id: "lambda_event_source_mapping",
    name: "Lambda Event Source Mapping",
    description: "Event source mapping for Lambda",
    terraform_resource: "aws_lambda_event_source_mapping",
    icon: SERVERLESS_ICONS['aws_lambda_event_source_mapping'],
    inputs: {
      required: [
        { name: "function_name", type: "string", description: "Function name or ARN", reference: "aws_lambda_function.arn" }
      ],
      optional: [
        { name: "event_source_arn", type: "string", description: "Event source ARN" },
        { name: "batch_size", type: "number", description: "Batch size" },
        { name: "bisect_batch_on_function_error", type: "bool", description: "Bisect batch on error" },
        { name: "enabled", type: "bool", description: "Enable mapping" },
        { name: "maximum_batching_window_in_seconds", type: "number", description: "Maximum batching window" },
        { name: "maximum_record_age_in_seconds", type: "number", description: "Maximum record age" },
        { name: "maximum_retry_attempts", type: "number", description: "Maximum retry attempts" },
        { name: "parallelization_factor", type: "number", description: "Parallelization factor" },
        { name: "starting_position", type: "string", description: "Starting position", options: ["TRIM_HORIZON", "LATEST", "AT_TIMESTAMP"] },
        { name: "tumbling_window_in_seconds", type: "number", description: "Tumbling window in seconds" }
      ],
      blocks: [
        {
          name: "destination_config",
          nested_blocks: [
            {
              name: "on_failure",
              attributes: [
                { name: "destination_arn", type: "string", required: true }
              ]
            }
          ]
        },
        {
          name: "scaling_config",
          attributes: [
            { name: "maximum_concurrency", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "function_arn", type: "string", description: "Function ARN" },
      { name: "last_modified", type: "string", description: "Last modified timestamp" },
      { name: "state", type: "string", description: "Mapping state" },
      { name: "uuid", type: "string", description: "Mapping UUID" }
    ]
  },
  {
    id: "lambda_function_url",
    name: "Lambda Function URL",
    description: "HTTP URL endpoint for Lambda",
    terraform_resource: "aws_lambda_function_url",
    icon: SERVERLESS_ICONS['aws_lambda_function_url'],
    inputs: {
      required: [
        { name: "function_name", type: "string", description: "Function name", reference: "aws_lambda_function.function_name" },
        { name: "authorization_type", type: "string", description: "Authorization type", options: ["AWS_IAM", "NONE"] }
      ],
      optional: [
        { name: "invoke_mode", type: "string", description: "Invoke mode", options: ["BUFFERED", "RESPONSE_STREAM"] },
        { name: "qualifier", type: "string", description: "Function version or alias" }
      ],
      blocks: [
        {
          name: "cors",
          attributes: [
            { name: "allow_credentials", type: "bool" },
            { name: "allow_headers", type: "list(string)" },
            { name: "allow_methods", type: "list(string)" },
            { name: "allow_origins", type: "list(string)" },
            { name: "expose_headers", type: "list(string)" },
            { name: "max_age", type: "number" }
          ]
        }
      ]
    },
    outputs: [
      { name: "function_arn", type: "string", description: "Function ARN" },
      { name: "function_url", type: "string", description: "Function URL" },
      { name: "url_id", type: "string", description: "URL ID" }
    ]
  },
  {
    id: "step_functions_state_machine",
    name: "Step Functions State Machine",
    description: "Serverless workflow orchestration",
    terraform_resource: "aws_sfn_state_machine",
    icon: SERVERLESS_ICONS['aws_sfn_state_machine'],
    inputs: {
      required: [
        { name: "definition", type: "string", description: "State machine definition JSON" },
        { name: "name", type: "string", description: "State machine name" },
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "publish", type: "bool", description: "Publish version" },
        { name: "type", type: "string", description: "State machine type", options: ["STANDARD", "EXPRESS"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "logging_configuration",
          attributes: [
            { name: "include_execution_data", type: "bool" },
            { name: "level", type: "string", options: ["ALL", "ERROR", "FATAL", "OFF"] },
            { name: "log_destination", type: "string" }
          ]
        },
        {
          name: "tracing_configuration",
          attributes: [
            { name: "enabled", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "State machine ID" },
      { name: "arn", type: "string", description: "State machine ARN" },
      { name: "creation_date", type: "string", description: "Creation date" },
      { name: "status", type: "string", description: "Status" }
    ]
  },
  {
    id: "eventbridge_rule",
    name: "EventBridge Rule",
    description: "Event-driven rule for triggering targets",
    terraform_resource: "aws_cloudwatch_event_rule",
    icon: SERVERLESS_ICONS['aws_cloudwatch_event_rule'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Rule name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "description", type: "string", description: "Rule description" },
        { name: "event_bus_name", type: "string", description: "Event bus name" },
        { name: "event_pattern", type: "string", description: "Event pattern JSON" },
        { name: "role_arn", type: "string", description: "IAM role ARN" },
        { name: "schedule_expression", type: "string", description: "Schedule expression" },
        { name: "state", type: "string", description: "Rule state", options: ["ENABLED", "DISABLED"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Rule ID" },
      { name: "arn", type: "string", description: "Rule ARN" },
      { name: "name", type: "string", description: "Rule name" }
    ]
  },
  {
    id: "eventbridge_target",
    name: "EventBridge Target",
    description: "Target for EventBridge rule",
    terraform_resource: "aws_cloudwatch_event_target",
    icon: SERVERLESS_ICONS['aws_cloudwatch_event_target'],
    inputs: {
      required: [
        { name: "arn", type: "string", description: "Target ARN" },
        { name: "rule", type: "string", description: "Rule name", reference: "aws_cloudwatch_event_rule.name" }
      ],
      optional: [
        { name: "target_id", type: "string", description: "Target ID" },
        { name: "event_bus_name", type: "string", description: "Event bus name" },
        { name: "input", type: "string", description: "Custom input JSON" },
        { name: "input_path", type: "string", description: "Input path" },
        { name: "role_arn", type: "string", description: "IAM role ARN" }
      ],
      blocks: [
        {
          name: "dead_letter_config",
          attributes: [
            { name: "arn", type: "string" }
          ]
        },
        {
          name: "retry_policy",
          attributes: [
            { name: "maximum_event_age_in_seconds", type: "number" },
            { name: "maximum_retry_attempts", type: "number" }
          ]
        },
        {
          name: "sqs_target",
          attributes: [
            { name: "message_group_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Target ID" }
    ]
  },
  {
    id: "eventbridge_bus",
    name: "EventBridge Event Bus",
    description: "Custom event bus",
    terraform_resource: "aws_cloudwatch_event_bus",
    icon: SERVERLESS_ICONS['aws_cloudwatch_event_bus'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Event bus name" }
      ],
      optional: [
        { name: "event_source_name", type: "string", description: "Partner event source name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Event bus ARN" },
      { name: "name", type: "string", description: "Event bus name" }
    ]
  },
  {
    id: "scheduler_schedule",
    name: "EventBridge Scheduler",
    description: "Serverless task scheduler",
    terraform_resource: "aws_scheduler_schedule",
    icon: SERVERLESS_ICONS['aws_scheduler_schedule'],
    inputs: {
      required: [
        { name: "schedule_expression", type: "string", description: "Schedule expression" }
      ],
      optional: [
        { name: "name", type: "string", description: "Schedule name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "description", type: "string", description: "Schedule description" },
        { name: "end_date", type: "string", description: "End date" },
        { name: "group_name", type: "string", description: "Schedule group name" },
        { name: "kms_key_arn", type: "string", description: "KMS key ARN" },
        { name: "schedule_expression_timezone", type: "string", description: "Timezone" },
        { name: "start_date", type: "string", description: "Start date" },
        { name: "state", type: "string", description: "Schedule state", options: ["ENABLED", "DISABLED"] }
      ],
      blocks: [
        {
          name: "flexible_time_window",
          attributes: [
            { name: "mode", type: "string", required: true, options: ["OFF", "FLEXIBLE"] },
            { name: "maximum_window_in_minutes", type: "number" }
          ]
        },
        {
          name: "target",
          attributes: [
            { name: "arn", type: "string", required: true },
            { name: "role_arn", type: "string", required: true },
            { name: "input", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Schedule ID" },
      { name: "arn", type: "string", description: "Schedule ARN" }
    ]
  }
];

// List of all serverless terraform resource types
export const SERVERLESS_TERRAFORM_RESOURCES = SERVERLESS_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getServerlessServiceByTerraformResource(terraformResource: string): ServerlessServiceDefinition | undefined {
  return SERVERLESS_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getServerlessServiceById(id: string): ServerlessServiceDefinition | undefined {
  return SERVERLESS_SERVICES.find(s => s.id === id);
}

export function isServerlessResource(terraformResource: string): boolean {
  return SERVERLESS_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getServerlessIcon(terraformResource: string): string {
  return SERVERLESS_ICONS[terraformResource] || SERVERLESS_ICONS['aws_lambda_function'];
}










