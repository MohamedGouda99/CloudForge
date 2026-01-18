/**
 * AWS Lambda Function Resource Definition
 *
 * Complete schema for aws_lambda_function based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsLambdaFunction: ServiceDefinition = {
  id: 'lambda_function',
  terraform_resource: 'aws_lambda_function',
  name: 'Lambda Function',
  description: 'Serverless compute service that runs code in response to events',
  icon: COMPUTE_ICONS.LAMBDA,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'function_name',
        type: 'string',
        description: 'Unique name for your Lambda function',
        example: 'my-function',
        validation: {
          pattern: '^[a-zA-Z0-9-_]+$',
          minLength: 1,
          maxLength: 64,
        },
        group: 'basic',
      },
      {
        name: 'role',
        type: 'string',
        description: 'IAM role ARN that Lambda assumes when executing',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'runtime',
        type: 'string',
        description: 'Runtime environment for the Lambda function',
        default: 'python3.12',
        options: [
          'nodejs20.x', 'nodejs18.x',
          'python3.12', 'python3.11', 'python3.10', 'python3.9',
          'java21', 'java17', 'java11',
          'dotnet8', 'dotnet6',
          'ruby3.3', 'ruby3.2',
          'provided.al2023', 'provided.al2',
        ],
        group: 'basic',
      },
      {
        name: 'handler',
        type: 'string',
        description: 'Function entrypoint in your code',
        default: 'index.handler',
        example: 'index.handler',
        group: 'basic',
      },
      {
        name: 'filename',
        type: 'string',
        description: 'Path to the function deployment package (ZIP file)',
        example: 'lambda.zip',
        group: 'basic',
      },
      {
        name: 's3_bucket',
        type: 'string',
        description: 'S3 bucket containing the function deployment package',
        reference: 'aws_s3_bucket.id',
        group: 'basic',
      },
      {
        name: 's3_key',
        type: 'string',
        description: 'S3 key of the function deployment package',
        group: 'basic',
      },
      {
        name: 's3_object_version',
        type: 'string',
        description: 'S3 object version of the deployment package',
        group: 'advanced',
      },
      {
        name: 'image_uri',
        type: 'string',
        description: 'ECR image URI for container-based Lambda',
        example: '123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo:latest',
        group: 'basic',
      },
      {
        name: 'package_type',
        type: 'string',
        description: 'Lambda deployment package type',
        default: 'Zip',
        options: ['Zip', 'Image'],
        group: 'basic',
      },
      {
        name: 'memory_size',
        type: 'number',
        description: 'Amount of memory in MB for the function (128-10240)',
        default: 128,
        validation: { min: 128, max: 10240 },
        group: 'basic',
      },
      {
        name: 'timeout',
        type: 'number',
        description: 'Function execution timeout in seconds (1-900)',
        default: 3,
        validation: { min: 1, max: 900 },
        group: 'basic',
      },
      {
        name: 'architectures',
        type: 'list(string)',
        description: 'CPU architecture for the function',
        default: ['x86_64'],
        options: ['x86_64', 'arm64'],
        group: 'advanced',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the function',
        validation: { maxLength: 256 },
        group: 'basic',
      },
      {
        name: 'publish',
        type: 'bool',
        description: 'Publish a new version on each update',
        default: false,
        group: 'advanced',
      },
      {
        name: 'reserved_concurrent_executions',
        type: 'number',
        description: 'Reserved concurrent execution limit (-1 to unreserve)',
        default: -1,
        validation: { min: -1, max: 1000 },
        group: 'advanced',
      },
      {
        name: 'layers',
        type: 'list(string)',
        description: 'List of Lambda Layer ARNs to attach',
        group: 'advanced',
      },
      {
        name: 'kms_key_arn',
        type: 'string',
        description: 'KMS key ARN for encrypting environment variables',
        reference: 'aws_kms_key.arn',
        group: 'advanced',
      },
      {
        name: 'source_code_hash',
        type: 'string',
        description: 'Base64-encoded SHA256 hash of the deployment package',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the function',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'environment',
        description: 'Environment variable configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'variables',
            type: 'map(string)',
            description: 'Map of environment variables',
            default: {},
          },
        ],
      },
      {
        name: 'vpc_config',
        description: 'VPC configuration for the function',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'subnet_ids',
            type: 'set(string)',
            description: 'List of subnet IDs for VPC access',
          },
          {
            name: 'security_group_ids',
            type: 'set(string)',
            description: 'List of security group IDs',
          },
        ],
      },
      {
        name: 'dead_letter_config',
        description: 'Dead letter queue configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'target_arn',
            type: 'string',
            description: 'ARN of the SNS topic or SQS queue for failed invocations',
          },
        ],
      },
      {
        name: 'tracing_config',
        description: 'X-Ray tracing configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'mode',
            type: 'string',
            description: 'X-Ray tracing mode',
            default: 'PassThrough',
            options: ['Active', 'PassThrough'],
          },
        ],
      },
      {
        name: 'file_system_config',
        description: 'EFS file system configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'arn',
            type: 'string',
            description: 'ARN of the EFS access point',
          },
          {
            name: 'local_mount_path',
            type: 'string',
            description: 'Local mount path in the function',
            example: '/mnt/efs',
          },
        ],
      },
      {
        name: 'ephemeral_storage',
        description: 'Ephemeral storage configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'size',
            type: 'number',
            description: 'Storage size in MB (512-10240)',
            default: 512,
            validation: { min: 512, max: 10240 },
          },
        ],
      },
      {
        name: 'snap_start',
        description: 'SnapStart configuration for Java functions',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'apply_on',
            type: 'string',
            description: 'When to apply SnapStart',
            options: ['PublishedVersions', 'None'],
          },
        ],
      },
      {
        name: 'logging_config',
        description: 'CloudWatch Logs configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'log_format',
            type: 'string',
            description: 'Log format for the function',
            default: 'Text',
            options: ['Text', 'JSON'],
          },
          {
            name: 'log_group',
            type: 'string',
            description: 'CloudWatch log group name',
          },
          {
            name: 'application_log_level',
            type: 'string',
            description: 'Application log level',
            options: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
          },
          {
            name: 'system_log_level',
            type: 'string',
            description: 'System log level',
            options: ['DEBUG', 'INFO', 'WARN'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN identifying the Lambda function' },
    { name: 'invoke_arn', type: 'string', description: 'ARN for invoking the function from API Gateway' },
    { name: 'qualified_arn', type: 'string', description: 'ARN identifying the Lambda function version or alias' },
    { name: 'qualified_invoke_arn', type: 'string', description: 'Qualified ARN for API Gateway invocation' },
    { name: 'version', type: 'string', description: 'Latest published version of the function' },
    { name: 'signing_job_arn', type: 'string', description: 'ARN of the signing job' },
    { name: 'signing_profile_version_arn', type: 'string', description: 'ARN of the signing profile version' },
    { name: 'source_code_size', type: 'number', description: 'Size of the function deployment package in bytes' },
    { name: 'last_modified', type: 'string', description: 'Date the function was last modified' },
  ],

  terraform: {
    resourceType: 'aws_lambda_function',
    requiredArgs: ['function_name', 'role'],
    referenceableAttrs: {
      arn: 'arn',
      invoke_arn: 'invoke_arn',
      qualified_arn: 'qualified_arn',
      function_name: 'function_name',
      version: 'version',
    },
  },

  relations: {
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_sqs_queue',
        apply: {
          createAssociationResource: {
            type: 'aws_lambda_event_source_mapping',
            nameTemplate: '${source.function_name}_${target.name}_trigger',
            args: {
              function_name: '${source.arn}',
              event_source_arn: '${target.arn}',
            },
          },
        },
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_dynamodb_table',
        apply: {
          createAssociationResource: {
            type: 'aws_lambda_event_source_mapping',
            nameTemplate: '${source.function_name}_${target.name}_trigger',
            args: {
              function_name: '${source.arn}',
              event_source_arn: '${target.stream_arn}',
            },
          },
        },
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'vpc_config.security_group_ids', toTargetAttr: 'id' }],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'role',
        acceptsResourceTypes: ['aws_iam_role'],
        search: [{ type: 'connected_edges', edgeKind: 'attach' }],
        onMissing: {
          level: 'error',
          message: 'Lambda function requires an IAM execution role',
          fixHint: 'Connect an IAM role to the Lambda function',
        },
      },
    ],
  },
};
