/**
 * AWS Route53 Hosted Zone Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsRoute53Zone: ServiceDefinition = {
  id: 'route53_zone',
  terraform_resource: 'aws_route53_zone',
  name: 'Route53 Hosted Zone',
  description: 'DNS hosted zone for domain management',
  icon: NETWORKING_ICONS.ROUTE53,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Domain name for the hosted zone',
        example: 'example.com',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'comment',
        type: 'string',
        description: 'Comment for the hosted zone',
        group: 'basic',
      },
      {
        name: 'force_destroy',
        type: 'bool',
        description: 'Whether to destroy all records on deletion',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'vpc',
        description: 'VPC association for private hosted zones',
        required: false,
        multiple: true,
        attributes: [
          { name: 'vpc_id', type: 'string', description: 'VPC ID' },
          { name: 'vpc_region', type: 'string', description: 'VPC region' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'zone_id', type: 'string', description: 'Hosted zone ID' },
    { name: 'arn', type: 'string', description: 'ARN of the hosted zone' },
    { name: 'name_servers', type: 'list(string)', description: 'Name servers for the zone' },
  ],

  terraform: {
    resourceType: 'aws_route53_zone',
    requiredArgs: ['name'],
    referenceableAttrs: {
      zone_id: 'zone_id',
      arn: 'arn',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_route53_record'],
        description: 'DNS records in the hosted zone',
      },
    ],
  },
};
