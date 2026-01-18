/**
 * AWS Step Functions State Machine Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sfn_state_machine
 */

import type { ServiceDefinition } from '../../types';

const SERVERLESS_ICONS = {
  STEP_FUNCTIONS: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_AWS-Step-Functions_64.svg',
};

export const awsSfnStateMachine: ServiceDefinition = {
  id: 'sfn_state_machine',
  terraform_resource: 'aws_sfn_state_machine',
  name: 'Step Functions',
  description: 'State machine for orchestrating serverless workflows',
  icon: SERVERLESS_ICONS.STEP_FUNCTIONS,
  category: 'serverless',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the state machine',
        validation: { pattern: '^[a-zA-Z0-9_-]+$', maxLength: 80 },
        group: 'basic',
      },
      {
        name: 'role_arn',
        type: 'string',
        description: 'IAM role ARN for the state machine',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
      {
        name: 'definition',
        type: 'string',
        description: 'State machine definition in Amazon States Language JSON',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name (conflicts with name)',
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of the state machine (cannot be changed after creation)',
        default: 'STANDARD',
        options: ['STANDARD', 'EXPRESS'],
        group: 'basic',
      },
      {
        name: 'publish',
        type: 'bool',
        description: 'Publish a version on each update',
        default: false,
        group: 'advanced',
      },
      {
        name: 'encryption_configuration',
        type: 'object',
        description: 'Encryption configuration for the state machine',
        group: 'security',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the state machine',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'logging_configuration',
        description: 'Logging configuration for the state machine',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'log_destination',
            type: 'string',
            description: 'CloudWatch Logs log group ARN',
          },
          {
            name: 'include_execution_data',
            type: 'bool',
            description: 'Include execution data in logs',
            default: false,
          },
          {
            name: 'level',
            type: 'string',
            description: 'Logging level',
            default: 'OFF',
            options: ['ALL', 'ERROR', 'FATAL', 'OFF'],
          },
        ],
      },
      {
        name: 'tracing_configuration',
        description: 'X-Ray tracing configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable X-Ray tracing',
            default: false,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'State machine ARN' },
    { name: 'arn', type: 'string', description: 'ARN of the state machine' },
    { name: 'name', type: 'string', description: 'Name of the state machine' },
    { name: 'creation_date', type: 'string', description: 'Creation date' },
    { name: 'status', type: 'string', description: 'Status of the state machine' },
    { name: 'state_machine_version_arn', type: 'string', description: 'ARN of the published version' },
    { name: 'revision_id', type: 'string', description: 'Revision ID for concurrent modification tracking' },
    { name: 'description', type: 'string', description: 'Description of the state machine' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_sfn_state_machine',
    requiredArgs: ['name', 'role_arn', 'definition'],
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
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role_arn', toTargetAttr: 'arn' }],
      },
    ],
  },
};
