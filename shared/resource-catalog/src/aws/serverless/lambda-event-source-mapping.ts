/**
 * AWS Lambda Event Source Mapping Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_event_source_mapping
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsLambdaEventSourceMapping: ServiceDefinition = {
  id: 'lambda_event_source_mapping',
  terraform_resource: 'aws_lambda_event_source_mapping',
  name: 'Lambda Event Source',
  description: 'Maps an event source to a Lambda function',
  icon: COMPUTE_ICONS.LAMBDA,
  category: 'serverless',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'function_name',
        type: 'string',
        description: 'Name or ARN of the Lambda function',
        reference: 'aws_lambda_function.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'event_source_arn',
        type: 'string',
        description: 'ARN of the event source (Kinesis, DynamoDB, SQS, etc.)',
        group: 'basic',
      },
      {
        name: 'batch_size',
        type: 'number',
        description: 'Maximum number of records per batch',
        default: 100,
        validation: { min: 1, max: 10000 },
        group: 'basic',
      },
      {
        name: 'maximum_batching_window_in_seconds',
        type: 'number',
        description: 'Maximum batching window in seconds',
        validation: { min: 0, max: 300 },
        group: 'advanced',
      },
      {
        name: 'enabled',
        type: 'bool',
        description: 'Enable the event source mapping',
        default: true,
        group: 'basic',
      },
      {
        name: 'starting_position',
        type: 'string',
        description: 'Starting position for stream-based sources',
        options: ['TRIM_HORIZON', 'LATEST', 'AT_TIMESTAMP'],
        group: 'basic',
      },
      {
        name: 'starting_position_timestamp',
        type: 'string',
        description: 'Timestamp for AT_TIMESTAMP starting position',
        group: 'advanced',
      },
      {
        name: 'parallelization_factor',
        type: 'number',
        description: 'Number of batches to process concurrently per shard',
        default: 1,
        validation: { min: 1, max: 10 },
        group: 'advanced',
      },
      {
        name: 'maximum_retry_attempts',
        type: 'number',
        description: 'Maximum retry attempts for failed records',
        default: -1,
        validation: { min: -1, max: 10000 },
        group: 'advanced',
      },
      {
        name: 'maximum_record_age_in_seconds',
        type: 'number',
        description: 'Maximum age of records to process',
        default: -1,
        validation: { min: -1, max: 604800 },
        group: 'advanced',
      },
      {
        name: 'bisect_batch_on_function_error',
        type: 'bool',
        description: 'Split batch on error for Kinesis/DynamoDB',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tumbling_window_in_seconds',
        type: 'number',
        description: 'Tumbling window duration for aggregation',
        validation: { min: 0, max: 900 },
        group: 'advanced',
      },
      {
        name: 'function_response_types',
        type: 'list(string)',
        description: 'Function response types to enable',
        options: ['ReportBatchItemFailures'],
        group: 'advanced',
      },
      {
        name: 'queues',
        type: 'list(string)',
        description: 'Amazon MQ queue names to consume from',
        group: 'advanced',
      },
      {
        name: 'topics',
        type: 'list(string)',
        description: 'Kafka topic names to consume from',
        group: 'advanced',
      },
    ],

    blocks: [
      {
        name: 'destination_config',
        description: 'Destination configuration for failed records',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'on_failure',
            type: 'object',
            description: 'On failure destination',
          },
        ],
      },
      {
        name: 'filter_criteria',
        description: 'Criteria to filter events',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'filter',
            type: 'object',
            description: 'Filter patterns',
          },
        ],
      },
      {
        name: 'scaling_config',
        description: 'Scaling configuration for SQS event sources',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'maximum_concurrency',
            type: 'number',
            description: 'Maximum concurrent Lambda invocations',
            validation: { min: 2, max: 1000 },
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'function_arn', type: 'string', description: 'ARN of the Lambda function' },
    { name: 'last_modified', type: 'string', description: 'Last modified date' },
    { name: 'last_processing_result', type: 'string', description: 'Last processing result' },
    { name: 'state', type: 'string', description: 'State of the event source mapping' },
    { name: 'state_transition_reason', type: 'string', description: 'Reason for state transition' },
    { name: 'uuid', type: 'string', description: 'UUID of the mapping' },
  ],

  terraform: {
    resourceType: 'aws_lambda_event_source_mapping',
    requiredArgs: ['function_name'],
    referenceableAttrs: {
      uuid: 'uuid',
      function_arn: 'function_arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_lambda_function',
        apply: [{ setArg: 'function_name', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_sqs_queue',
        apply: [{ setArg: 'event_source_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_dynamodb_table',
        apply: [{ setArg: 'event_source_arn', toTargetAttr: 'stream_arn' }],
      },
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_kinesis_stream',
        apply: [{ setArg: 'event_source_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
