/**
 * AWS Messaging Services Data - Complete definitions from messaging.json
 * This file contains ALL 10 messaging services with ALL their properties
 * 
 * Services included:
 * 1. SQS Queue (aws_sqs_queue)
 * 2. SQS Queue Policy (aws_sqs_queue_policy)
 * 3. SQS Redrive Policy (aws_sqs_queue_redrive_policy)
 * 4. SNS Topic (aws_sns_topic)
 * 5. SNS Subscription (aws_sns_topic_subscription)
 * 6. SNS Topic Policy (aws_sns_topic_policy)
 * 7. Kinesis Data Stream (aws_kinesis_stream)
 * 8. Kinesis Firehose (aws_kinesis_firehose_delivery_stream)
 * 9. Amazon MQ Broker (aws_mq_broker)
 * 10. EventBridge Pipe (aws_pipes_pipe)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Messaging service icon mappings - using actual AWS Architecture icons
export const MESSAGING_ICONS: Record<string, string> = {
  'aws_sqs_queue': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg',
  'aws_sqs_queue_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg',
  'aws_sqs_queue_redrive_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg',
  'aws_sns_topic': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg',
  'aws_sns_topic_subscription': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg',
  'aws_sns_topic_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg',
  'aws_kinesis_stream': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Kinesis-Data-Streams_64.svg',
  'aws_kinesis_firehose_delivery_stream': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Kinesis_64.svg',
  'aws_mq_broker': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-MQ_64.svg',
  'aws_pipes_pipe': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg',
};

// Messaging service definition interface
export interface MessagingServiceDefinition {
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

// Complete messaging services data from messaging.json
export const MESSAGING_SERVICES: MessagingServiceDefinition[] = [
  {
    id: "sqs_queue",
    name: "SQS Queue",
    description: "Simple Queue Service queue",
    terraform_resource: "aws_sqs_queue",
    icon: MESSAGING_ICONS['aws_sqs_queue'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Queue name" },
        { name: "name_prefix", type: "string", description: "Queue name prefix" },
        { name: "visibility_timeout_seconds", type: "number", description: "Visibility timeout", default: 30 },
        { name: "message_retention_seconds", type: "number", description: "Message retention", default: 345600 },
        { name: "max_message_size", type: "number", description: "Max message size", default: 262144 },
        { name: "delay_seconds", type: "number", description: "Delivery delay", default: 0 },
        { name: "receive_wait_time_seconds", type: "number", description: "Receive wait time", default: 0 },
        { name: "policy", type: "string", description: "Queue policy JSON" },
        { name: "redrive_policy", type: "string", description: "Dead-letter queue policy JSON" },
        { name: "fifo_queue", type: "bool", description: "Is FIFO queue", default: false },
        { name: "content_based_deduplication", type: "bool", description: "Content-based deduplication" },
        { name: "deduplication_scope", type: "string", description: "Deduplication scope", options: ["messageGroup", "queue"] },
        { name: "fifo_throughput_limit", type: "string", description: "FIFO throughput limit", options: ["perQueue", "perMessageGroupId"] },
        { name: "kms_master_key_id", type: "string", description: "KMS key ID" },
        { name: "sqs_managed_sse_enabled", type: "bool", description: "Enable SQS managed SSE" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Queue URL" },
      { name: "arn", type: "string", description: "Queue ARN" },
      { name: "url", type: "string", description: "Queue URL" },
      { name: "name", type: "string", description: "Queue name" }
    ]
  },
  {
    id: "sqs_queue_policy",
    name: "SQS Queue Policy",
    description: "Resource policy for SQS queue",
    terraform_resource: "aws_sqs_queue_policy",
    icon: MESSAGING_ICONS['aws_sqs_queue_policy'],
    inputs: {
      required: [
        { name: "queue_url", type: "string", description: "Queue URL", reference: "aws_sqs_queue.url" },
        { name: "policy", type: "string", description: "Policy document JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Queue URL" }
    ]
  },
  {
    id: "sqs_queue_redrive_policy",
    name: "SQS Redrive Policy",
    description: "Dead-letter queue configuration",
    terraform_resource: "aws_sqs_queue_redrive_policy",
    icon: MESSAGING_ICONS['aws_sqs_queue_redrive_policy'],
    inputs: {
      required: [
        { name: "queue_url", type: "string", description: "Queue URL", reference: "aws_sqs_queue.url" },
        { name: "redrive_policy", type: "string", description: "Redrive policy JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Queue URL" }
    ]
  },
  {
    id: "sns_topic",
    name: "SNS Topic",
    description: "Simple Notification Service topic",
    terraform_resource: "aws_sns_topic",
    icon: MESSAGING_ICONS['aws_sns_topic'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Topic name" },
        { name: "name_prefix", type: "string", description: "Topic name prefix" },
        { name: "display_name", type: "string", description: "Display name" },
        { name: "policy", type: "string", description: "Topic policy JSON" },
        { name: "delivery_policy", type: "string", description: "Delivery policy JSON" },
        { name: "kms_master_key_id", type: "string", description: "KMS key ID" },
        { name: "tracing_config", type: "string", description: "Tracing config", options: ["Active", "PassThrough"] },
        { name: "fifo_topic", type: "bool", description: "Is FIFO topic" },
        { name: "content_based_deduplication", type: "bool", description: "Content-based deduplication" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Topic ARN" },
      { name: "arn", type: "string", description: "Topic ARN" },
      { name: "name", type: "string", description: "Topic name" },
      { name: "owner", type: "string", description: "Owner account ID" }
    ]
  },
  {
    id: "sns_subscription",
    name: "SNS Subscription",
    description: "Subscription to SNS topic",
    terraform_resource: "aws_sns_topic_subscription",
    icon: MESSAGING_ICONS['aws_sns_topic_subscription'],
    inputs: {
      required: [
        { name: "topic_arn", type: "string", description: "Topic ARN", reference: "aws_sns_topic.arn" },
        { name: "protocol", type: "string", description: "Protocol", options: ["http", "https", "email", "email-json", "sms", "sqs", "application", "lambda", "firehose"] },
        { name: "endpoint", type: "string", description: "Endpoint URL/ARN/address" }
      ],
      optional: [
        { name: "confirmation_timeout_in_minutes", type: "number", description: "Confirmation timeout" },
        { name: "delivery_policy", type: "string", description: "Delivery policy JSON" },
        { name: "endpoint_auto_confirms", type: "bool", description: "Endpoint auto confirms" },
        { name: "filter_policy", type: "string", description: "Filter policy JSON" },
        { name: "filter_policy_scope", type: "string", description: "Filter policy scope", options: ["MessageAttributes", "MessageBody"] },
        { name: "raw_message_delivery", type: "bool", description: "Raw message delivery" },
        { name: "redrive_policy", type: "string", description: "Redrive policy JSON" },
        { name: "subscription_role_arn", type: "string", description: "IAM role for Firehose" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subscription ID" },
      { name: "arn", type: "string", description: "Subscription ARN" },
      { name: "confirmation_was_authenticated", type: "bool", description: "Confirmation was authenticated" },
      { name: "owner_id", type: "string", description: "Owner account ID" },
      { name: "pending_confirmation", type: "bool", description: "Pending confirmation" }
    ]
  },
  {
    id: "sns_topic_policy",
    name: "SNS Topic Policy",
    description: "Resource policy for SNS topic",
    terraform_resource: "aws_sns_topic_policy",
    icon: MESSAGING_ICONS['aws_sns_topic_policy'],
    inputs: {
      required: [
        { name: "arn", type: "string", description: "Topic ARN", reference: "aws_sns_topic.arn" },
        { name: "policy", type: "string", description: "Policy document JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Topic ARN" },
      { name: "owner", type: "string", description: "Owner account ID" }
    ]
  },
  {
    id: "kinesis_stream",
    name: "Kinesis Data Stream",
    description: "Real-time data streaming",
    terraform_resource: "aws_kinesis_stream",
    icon: MESSAGING_ICONS['aws_kinesis_stream'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Stream name" }
      ],
      optional: [
        { name: "shard_count", type: "number", description: "Number of shards" },
        { name: "retention_period", type: "number", description: "Retention period in hours", default: 24 },
        { name: "shard_level_metrics", type: "list(string)", description: "Shard level metrics" },
        { name: "enforce_consumer_deletion", type: "bool", description: "Enforce consumer deletion" },
        { name: "encryption_type", type: "string", description: "Encryption type", options: ["NONE", "KMS"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "stream_mode_details",
          attributes: [
            { name: "stream_mode", type: "string", required: true, options: ["PROVISIONED", "ON_DEMAND"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Stream ID" },
      { name: "arn", type: "string", description: "Stream ARN" },
      { name: "name", type: "string", description: "Stream name" },
      { name: "shard_count", type: "number", description: "Shard count" }
    ]
  },
  {
    id: "kinesis_firehose",
    name: "Kinesis Firehose",
    description: "Data delivery stream",
    terraform_resource: "aws_kinesis_firehose_delivery_stream",
    icon: MESSAGING_ICONS['aws_kinesis_firehose_delivery_stream'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Delivery stream name" },
        { name: "destination", type: "string", description: "Destination", options: ["extended_s3", "redshift", "elasticsearch", "opensearch", "opensearchserverless", "splunk", "http_endpoint", "snowflake"] }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "kinesis_source_configuration",
          attributes: [
            { name: "kinesis_stream_arn", type: "string", required: true },
            { name: "role_arn", type: "string", required: true }
          ]
        },
        {
          name: "extended_s3_configuration",
          attributes: [
            { name: "bucket_arn", type: "string", required: true },
            { name: "role_arn", type: "string", required: true },
            { name: "buffering_size", type: "number" },
            { name: "buffering_interval", type: "number" },
            { name: "compression_format", type: "string", options: ["UNCOMPRESSED", "GZIP", "ZIP", "Snappy", "HADOOP_SNAPPY"] },
            { name: "error_output_prefix", type: "string" },
            { name: "kms_key_arn", type: "string" },
            { name: "prefix", type: "string" },
            { name: "s3_backup_mode", type: "string" }
          ]
        },
        {
          name: "http_endpoint_configuration",
          attributes: [
            { name: "url", type: "string", required: true },
            { name: "access_key", type: "string" },
            { name: "buffering_interval", type: "number" },
            { name: "buffering_size", type: "number" },
            { name: "name", type: "string" },
            { name: "retry_duration", type: "number" },
            { name: "role_arn", type: "string" },
            { name: "s3_backup_mode", type: "string" }
          ]
        },
        {
          name: "server_side_encryption",
          attributes: [
            { name: "enabled", type: "bool" },
            { name: "key_arn", type: "string" },
            { name: "key_type", type: "string", options: ["AWS_OWNED_CMK", "CUSTOMER_MANAGED_CMK"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Delivery stream ID" },
      { name: "arn", type: "string", description: "Delivery stream ARN" },
      { name: "name", type: "string", description: "Delivery stream name" },
      { name: "destination_id", type: "string", description: "Destination ID" }
    ]
  },
  {
    id: "mq_broker",
    name: "Amazon MQ Broker",
    description: "Managed message broker",
    terraform_resource: "aws_mq_broker",
    icon: MESSAGING_ICONS['aws_mq_broker'],
    inputs: {
      required: [
        { name: "broker_name", type: "string", description: "Broker name" },
        { name: "engine_type", type: "string", description: "Engine type", options: ["ActiveMQ", "RabbitMQ"] },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "host_instance_type", type: "string", description: "Host instance type" }
      ],
      optional: [
        { name: "apply_immediately", type: "bool", description: "Apply changes immediately" },
        { name: "authentication_strategy", type: "string", description: "Authentication strategy", options: ["simple", "ldap"] },
        { name: "auto_minor_version_upgrade", type: "bool", description: "Auto minor version upgrade" },
        { name: "deployment_mode", type: "string", description: "Deployment mode", options: ["SINGLE_INSTANCE", "ACTIVE_STANDBY_MULTI_AZ", "CLUSTER_MULTI_AZ"] },
        { name: "publicly_accessible", type: "bool", description: "Publicly accessible" },
        { name: "security_groups", type: "list(string)", description: "Security group IDs" },
        { name: "storage_type", type: "string", description: "Storage type", options: ["efs", "ebs"] },
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "configuration",
          attributes: [
            { name: "id", type: "string" },
            { name: "revision", type: "number" }
          ]
        },
        {
          name: "encryption_options",
          attributes: [
            { name: "kms_key_id", type: "string" },
            { name: "use_aws_owned_key", type: "bool" }
          ]
        },
        {
          name: "logs",
          attributes: [
            { name: "audit", type: "string" },
            { name: "general", type: "bool" }
          ]
        },
        {
          name: "maintenance_window_start_time",
          attributes: [
            { name: "day_of_week", type: "string", required: true },
            { name: "time_of_day", type: "string", required: true },
            { name: "time_zone", type: "string", required: true }
          ]
        },
        {
          name: "user",
          multiple: true,
          attributes: [
            { name: "password", type: "string", required: true },
            { name: "username", type: "string", required: true },
            { name: "console_access", type: "bool" },
            { name: "groups", type: "list(string)" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Broker ID" },
      { name: "arn", type: "string", description: "Broker ARN" }
    ]
  },
  {
    id: "eventbridge_pipe",
    name: "EventBridge Pipe",
    description: "Point-to-point integration between sources and targets",
    terraform_resource: "aws_pipes_pipe",
    icon: MESSAGING_ICONS['aws_pipes_pipe'],
    inputs: {
      required: [
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" },
        { name: "source", type: "string", description: "Source ARN" },
        { name: "target", type: "string", description: "Target ARN" }
      ],
      optional: [
        { name: "name", type: "string", description: "Pipe name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "description", type: "string", description: "Pipe description" },
        { name: "desired_state", type: "string", description: "Desired state", options: ["RUNNING", "STOPPED"] },
        { name: "enrichment", type: "string", description: "Enrichment ARN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "log_configuration",
          attributes: [
            { name: "level", type: "string", required: true, options: ["OFF", "ERROR", "INFO", "TRACE"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Pipe ID" },
      { name: "arn", type: "string", description: "Pipe ARN" },
      { name: "name", type: "string", description: "Pipe name" }
    ]
  }
];

// List of all messaging terraform resource types
export const MESSAGING_TERRAFORM_RESOURCES = MESSAGING_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getMessagingServiceByTerraformResource(terraformResource: string): MessagingServiceDefinition | undefined {
  return MESSAGING_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getMessagingServiceById(id: string): MessagingServiceDefinition | undefined {
  return MESSAGING_SERVICES.find(s => s.id === id);
}

export function isMessagingResource(terraformResource: string): boolean {
  return MESSAGING_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getMessagingIcon(terraformResource: string): string {
  return MESSAGING_ICONS[terraformResource] || MESSAGING_ICONS['aws_sqs_queue'];
}





