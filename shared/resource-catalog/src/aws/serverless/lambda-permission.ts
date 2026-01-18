/**
 * AWS Lambda Permission Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsLambdaPermission: ServiceDefinition = {
  id: 'lambda_permission',
  terraform_resource: 'aws_lambda_permission',
  name: 'Lambda Permission',
  description: 'Permission to invoke a Lambda function from an AWS service',
  icon: COMPUTE_ICONS.LAMBDA,
  category: 'serverless',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'action',
        type: 'string',
        description: 'Lambda action to allow',
        default: 'lambda:InvokeFunction',
        example: 'lambda:InvokeFunction',
        group: 'basic',
      },
      {
        name: 'function_name',
        type: 'string',
        description: 'Name or ARN of the Lambda function',
        reference: 'aws_lambda_function.function_name',
        group: 'basic',
      },
      {
        name: 'principal',
        type: 'string',
        description: 'Principal to grant permission to',
        example: 's3.amazonaws.com',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'statement_id',
        type: 'string',
        description: 'Unique statement identifier',
        validation: { pattern: '^[a-zA-Z0-9_-]+$', maxLength: 100 },
        group: 'basic',
      },
      {
        name: 'statement_id_prefix',
        type: 'string',
        description: 'Prefix for auto-generated statement ID',
        group: 'basic',
      },
      {
        name: 'event_source_token',
        type: 'string',
        description: 'Token for Alexa Smart Home invocation',
        group: 'advanced',
      },
      {
        name: 'function_url_auth_type',
        type: 'string',
        description: 'Function URL auth type for permission',
        options: ['AWS_IAM', 'NONE'],
        group: 'advanced',
      },
      {
        name: 'principal_org_id',
        type: 'string',
        description: 'Organization ID for cross-org access',
        group: 'advanced',
      },
      {
        name: 'qualifier',
        type: 'string',
        description: 'Function version or alias',
        group: 'advanced',
      },
      {
        name: 'source_account',
        type: 'string',
        description: 'AWS account ID for the source',
        group: 'advanced',
      },
      {
        name: 'source_arn',
        type: 'string',
        description: 'ARN of the source triggering invocation',
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Permission ID' },
  ],

  terraform: {
    resourceType: 'aws_lambda_permission',
    requiredArgs: ['action', 'function_name', 'principal'],
    referenceableAttrs: {
      id: 'id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'connect',
        direction: 'outbound',
        toResourceType: 'aws_lambda_function',
        apply: [{ setArg: 'function_name', toTargetAttr: 'function_name' }],
      },
    ],
  },
};
