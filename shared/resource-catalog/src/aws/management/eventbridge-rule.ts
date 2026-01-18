/**
 * AWS CloudWatch Event Rule (EventBridge) Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const awsCloudwatchEventRule: ServiceDefinition = {
  id: 'cloudwatch_event_rule',
  terraform_resource: 'aws_cloudwatch_event_rule',
  name: 'EventBridge Rule',
  description: 'EventBridge rule for event-driven architectures',
  icon: MESSAGING_ICONS.EVENTBRIDGE,
  category: 'management',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the rule',
        validation: { pattern: '^[a-zA-Z0-9_.-]+$', maxLength: 64 },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the rule',
        group: 'basic',
      },
      {
        name: 'event_bus_name',
        type: 'string',
        description: 'Event bus name',
        default: 'default',
        group: 'basic',
      },
      {
        name: 'event_pattern',
        type: 'string',
        description: 'Event pattern JSON',
        group: 'basic',
      },
      {
        name: 'schedule_expression',
        type: 'string',
        description: 'Schedule expression (cron or rate)',
        example: 'rate(5 minutes)',
        group: 'basic',
      },
      {
        name: 'state',
        type: 'string',
        description: 'Rule state',
        default: 'ENABLED',
        options: ['ENABLED', 'DISABLED'],
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Rule name' },
    { name: 'arn', type: 'string', description: 'ARN of the rule' },
  ],

  terraform: {
    resourceType: 'aws_cloudwatch_event_rule',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
