/**
 * GCP Subnetwork Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const gcpComputeSubnetwork: ServiceDefinition = {
  id: 'compute_subnetwork',
  terraform_resource: 'google_compute_subnetwork',
  name: 'Subnet',
  description: 'A VPC subnetwork resource in GCP',
  icon: NETWORKING_ICONS.VPC,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the resource',
        example: 'my-subnet',
        group: 'basic',
      },
      {
        name: 'ip_cidr_range',
        type: 'string',
        description: 'The range of internal addresses that are owned by this subnetwork',
        example: '10.0.0.0/24',
        group: 'basic',
      },
      {
        name: 'region',
        type: 'string',
        description: 'The GCP region for this subnetwork',
        example: 'us-central1',
        group: 'basic',
      },
      {
        name: 'network',
        type: 'string',
        description: 'The network this subnet belongs to',
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
        name: 'purpose',
        type: 'string',
        description: 'The purpose of the resource',
        options: ['PRIVATE', 'INTERNAL_HTTPS_LOAD_BALANCER', 'REGIONAL_MANAGED_PROXY', 'GLOBAL_MANAGED_PROXY'],
        group: 'advanced',
      },
      {
        name: 'role',
        type: 'string',
        description: 'The role of subnetwork',
        options: ['ACTIVE', 'BACKUP'],
        group: 'advanced',
      },
      {
        name: 'private_ip_google_access',
        type: 'bool',
        description: 'When enabled, VMs can access Google services without external IP addresses',
        default: false,
        group: 'advanced',
      },
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'stack_type',
        type: 'string',
        description: 'The stack type for this subnet',
        options: ['IPV4_ONLY', 'IPV4_IPV6'],
        default: 'IPV4_ONLY',
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'secondary_ip_range',
        description: 'Secondary IP ranges for VM instances in this subnet',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'range_name',
            type: 'string',
            description: 'The name associated with this subnetwork secondary range',
          },
          {
            name: 'ip_cidr_range',
            type: 'string',
            description: 'The range of IP addresses belonging to this subnetwork secondary range',
          },
        ],
      },
      {
        name: 'log_config',
        description: 'Denotes the logging options for the subnetwork flow logs',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'aggregation_interval',
            type: 'string',
            description: 'Toggles the aggregation interval for collecting flow logs',
            options: ['INTERVAL_5_SEC', 'INTERVAL_30_SEC', 'INTERVAL_1_MIN', 'INTERVAL_5_MIN', 'INTERVAL_10_MIN', 'INTERVAL_15_MIN'],
          },
          {
            name: 'flow_sampling',
            type: 'number',
            description: 'The value of the field must be in [0, 1]',
          },
          {
            name: 'metadata',
            type: 'string',
            description: 'Configures whether metadata fields should be added to the reported logs',
            options: ['EXCLUDE_ALL_METADATA', 'INCLUDE_ALL_METADATA', 'CUSTOM_METADATA'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'creation_timestamp', type: 'string', description: 'Creation timestamp in RFC3339 text format' },
    { name: 'gateway_address', type: 'string', description: 'The gateway address for default routes' },
    { name: 'fingerprint', type: 'string', description: 'Fingerprint of this resource' },
  ],

  terraform: {
    resourceType: 'google_compute_subnetwork',
    requiredArgs: ['name', 'ip_cidr_range', 'region', 'network'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'google_compute_network',
        apply: [{ setArg: 'network', toParentAttr: 'self_link' }],
      },
    ],
    validChildren: [
      {
        childTypes: ['google_compute_instance'],
        description: 'Subnet can contain compute instances',
      },
    ],
  },
};
