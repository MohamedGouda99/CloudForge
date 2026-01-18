/**
 * AWS WAFv2 Web ACL Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/wafv2_web_acl
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsWafv2WebAcl: ServiceDefinition = {
  id: 'wafv2_web_acl',
  terraform_resource: 'aws_wafv2_web_acl',
  name: 'WAF Web ACL',
  description: 'AWS WAF Web Application Firewall access control list for protecting web applications',
  icon: SECURITY_ICONS.WAF,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Friendly name of the WebACL',
        group: 'basic',
      },
      {
        name: 'scope',
        type: 'string',
        description: 'Scope of the WebACL (REGIONAL for ALB/API Gateway, CLOUDFRONT for CloudFront)',
        options: ['REGIONAL', 'CLOUDFRONT'],
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the WebACL',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the WebACL',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'default_action',
        description: 'Action for requests that do not match any rules',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'allow',
            type: 'object',
            description: 'Allow the request (use empty block {})',
          },
          {
            name: 'block',
            type: 'object',
            description: 'Block the request (use empty block {})',
          },
        ],
      },
      {
        name: 'visibility_config',
        description: 'Visibility configuration for CloudWatch metrics and web request sampling',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'cloudwatch_metrics_enabled',
            type: 'bool',
            description: 'Enable CloudWatch metrics',
            default: true,
          },
          {
            name: 'metric_name',
            type: 'string',
            description: 'Friendly metric name for CloudWatch',
          },
          {
            name: 'sampled_requests_enabled',
            type: 'bool',
            description: 'Enable sampling of requests',
            default: true,
          },
        ],
      },
      {
        name: 'rule',
        description: 'Rule blocks for the WebACL',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: 'Friendly name of the rule',
          },
          {
            name: 'priority',
            type: 'number',
            description: 'Rule priority (lower numbers evaluated first)',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'WebACL ID' },
    { name: 'arn', type: 'string', description: 'ARN of the WebACL' },
    { name: 'capacity', type: 'number', description: 'Web ACL capacity units (WCU) currently being used' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_wafv2_web_acl',
    requiredArgs: ['name', 'scope'],
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
