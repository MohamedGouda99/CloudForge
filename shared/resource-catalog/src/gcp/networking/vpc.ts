/**
 * GCP VPC Network Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const gcpComputeNetwork: ServiceDefinition = {
  id: 'compute_network',
  terraform_resource: 'google_compute_network',
  name: 'VPC Network',
  description: 'Manages a VPC network or legacy network resource on GCP',
  icon: NETWORKING_ICONS.VPC,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the resource',
        example: 'my-network',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'An optional description of this resource',
        group: 'basic',
      },
      {
        name: 'auto_create_subnetworks',
        type: 'bool',
        description: 'When set to true, the network is created in auto subnet mode',
        default: true,
        group: 'basic',
      },
      {
        name: 'routing_mode',
        type: 'string',
        description: 'The network-wide routing mode to use',
        options: ['REGIONAL', 'GLOBAL'],
        default: 'REGIONAL',
        group: 'advanced',
      },
      {
        name: 'mtu',
        type: 'number',
        description: 'Maximum Transmission Unit in bytes',
        default: 1460,
        group: 'advanced',
      },
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'delete_default_routes_on_create',
        type: 'bool',
        description: 'If set to true, default routes will be deleted immediately after network creation',
        default: false,
        group: 'advanced',
      },
    ],
    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'gateway_ipv4', type: 'string', description: 'The gateway address for default routing' },
  ],

  terraform: {
    resourceType: 'google_compute_network',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      name: 'name',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['google_compute_subnetwork', 'google_compute_firewall', 'google_compute_router'],
        description: 'VPC can contain subnets, firewall rules, and routers',
      },
    ],
  },
};
