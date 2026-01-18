/**
 * AWS GuardDuty Detector Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/guardduty_detector
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsGuarddutyDetector: ServiceDefinition = {
  id: 'guardduty_detector',
  terraform_resource: 'aws_guardduty_detector',
  name: 'GuardDuty',
  description: 'Amazon GuardDuty intelligent threat detection service',
  icon: SECURITY_ICONS.GUARDDUTY,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'enable',
        type: 'bool',
        description: 'Enable GuardDuty monitoring and feedback reporting',
        default: true,
        group: 'basic',
      },
      {
        name: 'finding_publishing_frequency',
        type: 'string',
        description: 'Frequency of notifications for subsequent finding occurrences',
        default: 'SIX_HOURS',
        options: ['FIFTEEN_MINUTES', 'ONE_HOUR', 'SIX_HOURS'],
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the detector',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'GuardDuty detector ID' },
    { name: 'arn', type: 'string', description: 'ARN of the GuardDuty detector' },
    { name: 'account_id', type: 'string', description: 'AWS account ID of the detector' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_guardduty_detector',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
  },
};
