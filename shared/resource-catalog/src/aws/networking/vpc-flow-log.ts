/**
 * AWS VPC Flow Log Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/flow_log
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsFlowLog: ServiceDefinition = {
  id: 'flow_log',
  terraform_resource: 'aws_flow_log',
  name: 'VPC Flow Log',
  description: 'Captures information about IP traffic going to and from network interfaces in a VPC',
  icon: NETWORKING_ICONS.FLOW_LOGS,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to attach the flow log to',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID to attach the flow log to',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'eni_id',
        type: 'string',
        description: 'Elastic Network Interface ID to attach the flow log to',
        reference: 'aws_network_interface.id',
        group: 'basic',
      },
      {
        name: 'traffic_type',
        type: 'string',
        description: 'Type of traffic to capture',
        default: 'ALL',
        options: ['ACCEPT', 'REJECT', 'ALL'],
        group: 'basic',
      },
      {
        name: 'log_destination_type',
        type: 'string',
        description: 'Type of destination for flow log data',
        default: 'cloud-watch-logs',
        options: ['cloud-watch-logs', 's3', 'kinesis-data-firehose'],
        group: 'basic',
      },
      {
        name: 'log_destination',
        type: 'string',
        description: 'ARN of the logging destination (CloudWatch Log Group, S3 bucket, or Kinesis Firehose)',
        group: 'basic',
      },
      {
        name: 'iam_role_arn',
        type: 'string',
        description: 'IAM role ARN for publishing to CloudWatch Logs',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'log_format',
        type: 'string',
        description: 'Fields to include in the flow log record',
        group: 'advanced',
      },
      {
        name: 'max_aggregation_interval',
        type: 'number',
        description: 'Maximum interval of time during which a flow of packets is captured (seconds)',
        default: 600,
        options: ['60', '600'],
        validation: { min: 60, max: 600 },
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the flow log',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'destination_options',
        description: 'Destination options for S3 delivery',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'file_format',
            type: 'string',
            description: 'Format of the flow log file',
            default: 'plain-text',
            options: ['plain-text', 'parquet'],
          },
          {
            name: 'hive_compatible_partitions',
            type: 'bool',
            description: 'Use Hive-compatible prefixes for S3',
            default: false,
          },
          {
            name: 'per_hour_partition',
            type: 'bool',
            description: 'Partition flow logs per hour instead of per day',
            default: false,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Flow log ID' },
    { name: 'arn', type: 'string', description: 'ARN of the flow log' },
  ],

  terraform: {
    resourceType: 'aws_flow_log',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_vpc',
        apply: [{ setArg: 'vpc_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'iam_role_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
