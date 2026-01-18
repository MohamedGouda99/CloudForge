/**
 * AWS SSM Parameter Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter
 */

import type { ServiceDefinition } from '../../types';
import { MANAGEMENT_ICONS } from '../icons';

export const awsSsmParameter: ServiceDefinition = {
  id: 'ssm_parameter',
  terraform_resource: 'aws_ssm_parameter',
  name: 'SSM Parameter',
  description: 'Systems Manager Parameter Store parameter for configuration data',
  icon: MANAGEMENT_ICONS.CLOUDWATCH, // Using CloudWatch icon as a proxy
  category: 'management',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the parameter (can include hierarchy path)',
        example: '/my-app/database/password',
        validation: { maxLength: 2048 },
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of the parameter',
        options: ['String', 'StringList', 'SecureString'],
        group: 'basic',
      },
      {
        name: 'value',
        type: 'string',
        description: 'Value of the parameter',
        sensitive: true,
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the parameter',
        validation: { maxLength: 1024 },
        group: 'basic',
      },
      {
        name: 'tier',
        type: 'string',
        description: 'Parameter tier',
        default: 'Standard',
        options: ['Standard', 'Advanced', 'Intelligent-Tiering'],
        group: 'advanced',
      },
      {
        name: 'key_id',
        type: 'string',
        description: 'KMS key ID for SecureString encryption',
        reference: 'aws_kms_key.id',
        group: 'security',
      },
      {
        name: 'overwrite',
        type: 'bool',
        description: 'Overwrite an existing parameter',
        default: false,
        group: 'advanced',
      },
      {
        name: 'allowed_pattern',
        type: 'string',
        description: 'Regex pattern to validate parameter value',
        group: 'advanced',
      },
      {
        name: 'data_type',
        type: 'string',
        description: 'Data type of the parameter',
        default: 'text',
        options: ['text', 'aws:ssm:integration', 'aws:ec2:image'],
        group: 'advanced',
      },
      {
        name: 'insecure_value',
        type: 'string',
        description: 'Value of the parameter (visible in plan output)',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the parameter',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the parameter' },
    { name: 'name', type: 'string', description: 'Name of the parameter' },
    { name: 'type', type: 'string', description: 'Type of the parameter' },
    { name: 'value', type: 'string', description: 'Value of the parameter' },
    { name: 'version', type: 'number', description: 'Version of the parameter' },
    { name: 'insecure_value', type: 'string', description: 'Insecure value of the parameter' },
  ],

  terraform: {
    resourceType: 'aws_ssm_parameter',
    requiredArgs: ['name', 'type', 'value'],
    referenceableAttrs: {
      name: 'name',
      arn: 'arn',
      value: 'value',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [{ setArg: 'key_id', toTargetAttr: 'id' }],
      },
    ],
  },
};
