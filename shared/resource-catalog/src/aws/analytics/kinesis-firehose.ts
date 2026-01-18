/**
 * AWS Kinesis Firehose Delivery Stream Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kinesis_firehose_delivery_stream
 */

import type { ServiceDefinition } from '../../types';

const ANALYTICS_ICONS = {
  FIREHOSE: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Kinesis-Data-Firehose_64.svg',
};

export const awsKinesisFirehoseDeliveryStream: ServiceDefinition = {
  id: 'kinesis_firehose_delivery_stream',
  terraform_resource: 'aws_kinesis_firehose_delivery_stream',
  name: 'Kinesis Firehose',
  description: 'Delivery stream for loading streaming data into data stores',
  icon: ANALYTICS_ICONS.FIREHOSE,
  category: 'analytics',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the delivery stream',
        validation: { pattern: '^[a-zA-Z0-9_.-]+$', maxLength: 64 },
        group: 'basic',
      },
      {
        name: 'destination',
        type: 'string',
        description: 'Destination for the delivery stream',
        options: ['extended_s3', 's3', 'redshift', 'elasticsearch', 'splunk', 'http_endpoint', 'opensearch', 'opensearchserverless'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the delivery stream',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'kinesis_source_configuration',
        description: 'Source from Kinesis Data Stream',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'kinesis_stream_arn',
            type: 'string',
            description: 'ARN of the source Kinesis stream',
          },
          {
            name: 'role_arn',
            type: 'string',
            description: 'IAM role ARN for reading from the stream',
          },
        ],
      },
      {
        name: 'extended_s3_configuration',
        description: 'S3 destination configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'bucket_arn',
            type: 'string',
            description: 'ARN of the S3 bucket',
          },
          {
            name: 'role_arn',
            type: 'string',
            description: 'IAM role ARN for S3 access',
          },
          {
            name: 'prefix',
            type: 'string',
            description: 'S3 key prefix',
          },
          {
            name: 'buffering_interval',
            type: 'number',
            description: 'Buffer interval in seconds',
            default: 300,
          },
          {
            name: 'buffering_size',
            type: 'number',
            description: 'Buffer size in MB',
            default: 5,
          },
          {
            name: 'compression_format',
            type: 'string',
            description: 'Compression format',
            options: ['UNCOMPRESSED', 'GZIP', 'ZIP', 'Snappy', 'HADOOP_SNAPPY'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Delivery stream name' },
    { name: 'arn', type: 'string', description: 'ARN of the delivery stream' },
    { name: 'name', type: 'string', description: 'Name of the delivery stream' },
  ],

  terraform: {
    resourceType: 'aws_kinesis_firehose_delivery_stream',
    requiredArgs: ['name', 'destination'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_s3_bucket',
        apply: [{ setArg: 'extended_s3_configuration.bucket_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
