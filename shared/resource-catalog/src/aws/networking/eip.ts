/**
 * AWS Elastic IP Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsEip: ServiceDefinition = {
  id: 'eip',
  terraform_resource: 'aws_eip',
  name: 'Elastic IP',
  description: 'Static public IPv4 address for AWS resources',
  icon: NETWORKING_ICONS.ELASTIC_IP,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'domain',
        type: 'string',
        description: 'Indicates if this EIP is for use in VPC',
        default: 'vpc',
        options: ['vpc', 'standard'],
        group: 'basic',
      },
      {
        name: 'instance',
        type: 'string',
        description: 'EC2 instance ID to associate with',
        reference: 'aws_instance.id',
        group: 'basic',
      },
      {
        name: 'network_interface',
        type: 'string',
        description: 'Network interface ID to associate with',
        reference: 'aws_network_interface.id',
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

    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Allocation ID' },
    { name: 'public_ip', type: 'string', description: 'Public IP address' },
    { name: 'public_dns', type: 'string', description: 'Public DNS name' },
    { name: 'private_ip', type: 'string', description: 'Private IP address' },
  ],

  terraform: {
    resourceType: 'aws_eip',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      public_ip: 'public_ip',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_instance',
        apply: [{ setArg: 'instance', toTargetAttr: 'id' }],
      },
    ],
  },
};
