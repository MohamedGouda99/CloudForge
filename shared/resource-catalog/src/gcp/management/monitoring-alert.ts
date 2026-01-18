/**
 * GCP Monitoring Alert Policy Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { MANAGEMENT_ICONS } from '../icons';

export const gcpMonitoringAlertPolicy: ServiceDefinition = {
  id: 'monitoring_alert_policy',
  terraform_resource: 'google_monitoring_alert_policy',
  name: 'Monitoring Alert Policy',
  description: 'A set of conditions that determine when to trigger an alert and who to notify',
  icon: MANAGEMENT_ICONS.MONITORING,
  category: 'management',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'display_name',
        type: 'string',
        description: 'A short name or phrase used to identify the policy in dashboards',
        example: 'High CPU Alert',
        group: 'basic',
      },
      {
        name: 'combiner',
        type: 'string',
        description: 'How to combine the results of multiple conditions',
        options: ['AND', 'OR', 'AND_WITH_MATCHING_RESOURCE'],
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'enabled',
        type: 'bool',
        description: 'Whether or not the policy is enabled',
        default: true,
        group: 'basic',
      },
      {
        name: 'notification_channels',
        type: 'list(string)',
        description: 'Identifies the notification channels to which notifications should be sent',
        group: 'basic',
      },
      {
        name: 'user_labels',
        type: 'map(string)',
        description: 'User-supplied key/value data to be used for organizing AlertPolicy objects',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'conditions',
        description: 'A list of conditions for the policy',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'display_name',
            type: 'string',
            description: 'A short name or phrase used to identify the condition in dashboards',
          },
          {
            name: 'condition_threshold',
            type: 'string',
            description: 'A condition that compares a time series against a threshold (JSON config)',
          },
          {
            name: 'condition_absent',
            type: 'string',
            description: 'A condition that checks that a time series continues to receive new data points (JSON config)',
          },
        ],
      },
      {
        name: 'documentation',
        description: 'Documentation that is included with notifications and incidents related to this policy',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'content',
            type: 'string',
            description: 'The text of the documentation',
          },
          {
            name: 'mime_type',
            type: 'string',
            description: 'The format of the content field',
            default: 'text/markdown',
          },
        ],
      },
      {
        name: 'alert_strategy',
        description: 'Control over how this alert policy\'s notification channels are notified',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'auto_close',
            type: 'string',
            description: 'If an alert policy that was active has no data for this long, any open incidents will close',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'name', type: 'string', description: 'The unique resource name for this policy' },
    { name: 'creation_record', type: 'object', description: 'A read-only record of the creation of the alerting policy' },
  ],

  terraform: {
    resourceType: 'google_monitoring_alert_policy',
    requiredArgs: ['display_name', 'combiner', 'conditions'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },
};
