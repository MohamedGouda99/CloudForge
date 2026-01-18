/**
 * AWS Batch Job Definition Resource Definition
 *
 * Complete schema for aws_batch_job_definition based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsBatchJobDefinition: ServiceDefinition = {
  id: 'batch_job_definition',
  terraform_resource: 'aws_batch_job_definition',
  name: 'Batch Job Definition',
  description: 'Defines batch processing jobs to run on AWS Batch',
  icon: COMPUTE_ICONS.BATCH,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the job definition',
        validation: {
          pattern: '^[a-zA-Z0-9_-]+$',
          minLength: 1,
          maxLength: 128,
        },
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of job definition',
        default: 'container',
        options: ['container', 'multinode'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'container_properties',
        type: 'string',
        description: 'JSON document for container properties',
        group: 'basic',
      },
      {
        name: 'node_properties',
        type: 'string',
        description: 'JSON document for multi-node parallel job properties',
        group: 'advanced',
      },
      {
        name: 'parameters',
        type: 'map(string)',
        description: 'Default parameters for the job definition',
        default: {},
        group: 'basic',
      },
      {
        name: 'platform_capabilities',
        type: 'list(string)',
        description: 'Platform capabilities required by the job',
        options: ['EC2', 'FARGATE'],
        group: 'basic',
      },
      {
        name: 'propagate_tags',
        type: 'bool',
        description: 'Propagate tags from job to ECS tasks',
        default: false,
        group: 'advanced',
      },
      {
        name: 'scheduling_priority',
        type: 'number',
        description: 'Scheduling priority for the job',
        validation: { min: 0, max: 9999 },
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the job definition',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'retry_strategy',
        description: 'Retry strategy for failed jobs',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'attempts',
            type: 'number',
            description: 'Number of retry attempts',
            default: 1,
            validation: { min: 1, max: 10 },
          },
        ],
      },
      {
        name: 'timeout',
        description: 'Job timeout configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'attempt_duration_seconds',
            type: 'number',
            description: 'Maximum time for each attempt (seconds)',
            validation: { min: 60 },
          },
        ],
      },
      {
        name: 'eks_properties',
        description: 'EKS properties for running on Amazon EKS',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'pod_properties',
            type: 'string',
            description: 'JSON document for pod properties',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the job definition' },
    { name: 'revision', type: 'number', description: 'Revision number of the job definition' },
    { name: 'arn_prefix', type: 'string', description: 'ARN prefix without revision' },
  ],

  terraform: {
    resourceType: 'aws_batch_job_definition',
    requiredArgs: ['name', 'type'],
    referenceableAttrs: {
      arn: 'arn',
      revision: 'revision',
    },
  },

  relations: {},
};
