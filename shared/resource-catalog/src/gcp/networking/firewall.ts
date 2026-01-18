/**
 * GCP Firewall Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const gcpComputeFirewall: ServiceDefinition = {
  id: 'compute_firewall',
  terraform_resource: 'google_compute_firewall',
  name: 'Firewall Rule',
  description: 'Each network has its own firewall controlling access to and from the instances',
  icon: NETWORKING_ICONS.FIREWALL,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the resource',
        example: 'allow-ssh',
        group: 'basic',
      },
      {
        name: 'network',
        type: 'string',
        description: 'The name or self_link of the network to attach this firewall to',
        reference: 'google_compute_network.self_link',
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
        name: 'priority',
        type: 'number',
        description: 'Priority for this rule. This is an integer between 0 and 65535',
        default: 1000,
        group: 'basic',
      },
      {
        name: 'direction',
        type: 'string',
        description: 'Direction of traffic to which this firewall applies',
        options: ['INGRESS', 'EGRESS'],
        default: 'INGRESS',
        group: 'basic',
      },
      {
        name: 'source_ranges',
        type: 'list(string)',
        description: 'Source IP CIDR ranges for ingress rules',
        example: '["0.0.0.0/0"]',
        group: 'basic',
      },
      {
        name: 'destination_ranges',
        type: 'list(string)',
        description: 'Destination IP CIDR ranges for egress rules',
        group: 'basic',
      },
      {
        name: 'source_tags',
        type: 'list(string)',
        description: 'Source network tags for ingress rules',
        group: 'advanced',
      },
      {
        name: 'target_tags',
        type: 'list(string)',
        description: 'Target network tags for the rule',
        group: 'advanced',
      },
      {
        name: 'source_service_accounts',
        type: 'list(string)',
        description: 'Source service accounts for ingress rules',
        group: 'advanced',
      },
      {
        name: 'target_service_accounts',
        type: 'list(string)',
        description: 'Target service accounts for the rule',
        group: 'advanced',
      },
      {
        name: 'disabled',
        type: 'bool',
        description: 'Denotes whether the firewall rule is disabled',
        default: false,
        group: 'advanced',
      },
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'allow',
        description: 'The list of ALLOW rules specified by this firewall',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'protocol',
            type: 'string',
            description: 'The IP protocol to which this rule applies',
            options: ['tcp', 'udp', 'icmp', 'esp', 'ah', 'sctp', 'ipip', 'all'],
          },
          {
            name: 'ports',
            type: 'list(string)',
            description: 'An optional list of ports to which this rule applies',
          },
        ],
      },
      {
        name: 'deny',
        description: 'The list of DENY rules specified by this firewall',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'protocol',
            type: 'string',
            description: 'The IP protocol to which this rule applies',
            options: ['tcp', 'udp', 'icmp', 'esp', 'ah', 'sctp', 'ipip', 'all'],
          },
          {
            name: 'ports',
            type: 'list(string)',
            description: 'An optional list of ports to which this rule applies',
          },
        ],
      },
      {
        name: 'log_config',
        description: 'Logging configuration for the firewall rule',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'metadata',
            type: 'string',
            description: 'Metadata to include in the logs',
            options: ['EXCLUDE_ALL_METADATA', 'INCLUDE_ALL_METADATA'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'creation_timestamp', type: 'string', description: 'Creation timestamp in RFC3339 text format' },
  ],

  terraform: {
    resourceType: 'google_compute_firewall',
    requiredArgs: ['name', 'network'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'google_compute_network',
        apply: [{ setArg: 'network', toParentAttr: 'self_link' }],
      },
    ],
  },
};
