/**
 * AWS Internet Gateway Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsInternetGateway: ServiceDefinition = {
  id: 'internet_gateway',
  terraform_resource: 'aws_internet_gateway',
  name: 'Internet Gateway',
  description: 'Gateway for internet access from VPC',
  icon: NETWORKING_ICONS.INTERNET_GATEWAY,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to attach the gateway to',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the internet gateway',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Internet Gateway ID' },
    { name: 'arn', type: 'string', description: 'ARN of the Internet Gateway' },
    { name: 'owner_id', type: 'string', description: 'Owner ID' },
  ],

  terraform: {
    resourceType: 'aws_internet_gateway',
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
    edgeRules: [],
  },
};
