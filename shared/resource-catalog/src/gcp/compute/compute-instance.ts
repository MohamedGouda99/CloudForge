/**
 * GCP Compute Instance Resource Definition
 *
 * Complete schema for google_compute_instance based on Terraform Google Provider
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const gcpComputeInstance: ServiceDefinition = {
  id: 'compute_instance',
  terraform_resource: 'google_compute_instance',
  name: 'Compute Instance',
  description: 'A Google Compute Engine VM instance',
  icon: COMPUTE_ICONS.COMPUTE_ENGINE,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'A unique name for the resource, required by GCE',
        example: 'my-instance',
        group: 'basic',
      },
      {
        name: 'machine_type',
        type: 'string',
        description: 'The machine type to create',
        example: 'e2-medium',
        options: [
          'e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4', 'e2-standard-8',
          'n1-standard-1', 'n1-standard-2', 'n1-standard-4',
          'n2-standard-2', 'n2-standard-4', 'n2-standard-8',
          'c2-standard-4', 'c2-standard-8',
        ],
        group: 'basic',
      },
      {
        name: 'zone',
        type: 'string',
        description: 'The zone that the machine should be created in',
        example: 'us-central1-a',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'allow_stopping_for_update',
        type: 'bool',
        description: 'Permits stopping instance for property updates',
        default: false,
        group: 'advanced',
      },
      {
        name: 'can_ip_forward',
        type: 'bool',
        description: 'Whether to allow sending and receiving of packets with non-matching source or destination IPs',
        default: false,
        group: 'advanced',
      },
      {
        name: 'description',
        type: 'string',
        description: 'A brief description of this resource',
        group: 'basic',
      },
      {
        name: 'deletion_protection',
        type: 'bool',
        description: 'Enable deletion protection on this instance',
        default: false,
        group: 'advanced',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'A set of key/value label pairs to assign to the instance',
        group: 'basic',
      },
      {
        name: 'metadata',
        type: 'map(string)',
        description: 'Metadata key/value pairs to make available from within the instance',
        group: 'advanced',
      },
      {
        name: 'metadata_startup_script',
        type: 'string',
        description: 'Alternative startup script that forces instance recreation if changed',
        group: 'advanced',
      },
      {
        name: 'min_cpu_platform',
        type: 'string',
        description: 'Minimum CPU platform',
        example: 'Intel Haswell',
        group: 'advanced',
      },
      {
        name: 'project',
        type: 'string',
        description: 'Project ID; uses provider project if not specified',
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'list(string)',
        description: 'A list of tags to attach to the instance',
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'boot_disk',
        description: 'The boot disk for the instance',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'auto_delete',
            type: 'bool',
            description: 'Whether the disk will be auto-deleted when the instance is deleted',
            default: true,
          },
          {
            name: 'device_name',
            type: 'string',
            description: 'Name with which attached disk will be accessible under /dev/disk/by-id/',
          },
          {
            name: 'disk_encryption_key_raw',
            type: 'string',
            description: 'A 256-bit customer-supplied encryption key',
          },
          {
            name: 'source',
            type: 'string',
            description: 'The name or self_link of an existing disk to attach',
          },
        ],
      },
      {
        name: 'network_interface',
        description: 'Networks to attach to the instance',
        required: true,
        multiple: true,
        attributes: [
          {
            name: 'network',
            type: 'string',
            description: 'The name or self_link of the network to attach this interface to',
            reference: 'google_compute_network.self_link',
          },
          {
            name: 'subnetwork',
            type: 'string',
            description: 'The name or self_link of the subnetwork to attach this interface to',
            reference: 'google_compute_subnetwork.self_link',
          },
          {
            name: 'subnetwork_project',
            type: 'string',
            description: 'The project in which the subnetwork belongs',
          },
          {
            name: 'network_ip',
            type: 'string',
            description: 'The private IP address to assign to the instance',
          },
        ],
      },
      {
        name: 'attached_disk',
        description: 'List of disks to attach to the instance',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'source',
            type: 'string',
            description: 'The name or self_link of the disk to attach to this instance',
          },
          {
            name: 'device_name',
            type: 'string',
            description: 'Name with which the attached disk will be accessible',
          },
          {
            name: 'mode',
            type: 'string',
            description: 'The mode in which to attach this disk',
            options: ['READ_WRITE', 'READ_ONLY'],
            default: 'READ_WRITE',
          },
        ],
      },
      {
        name: 'scratch_disk',
        description: 'Scratch disks to attach to the instance',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'interface',
            type: 'string',
            description: 'The disk interface to use for attaching this disk',
            options: ['SCSI', 'NVME'],
            default: 'SCSI',
          },
        ],
      },
      {
        name: 'service_account',
        description: 'Service account to attach to the instance',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'email',
            type: 'string',
            description: 'The service account e-mail address',
          },
          {
            name: 'scopes',
            type: 'list(string)',
            description: 'A list of service scopes',
          },
        ],
      },
      {
        name: 'scheduling',
        description: 'The scheduling strategy to use',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'preemptible',
            type: 'bool',
            description: 'Specifies if the instance is preemptible',
            default: false,
          },
          {
            name: 'on_host_maintenance',
            type: 'string',
            description: 'Describes maintenance behavior for the instance',
            options: ['MIGRATE', 'TERMINATE'],
          },
          {
            name: 'automatic_restart',
            type: 'bool',
            description: 'Specifies if the instance should be automatically restarted',
            default: true,
          },
        ],
      },
      {
        name: 'shielded_instance_config',
        description: 'Shielded VM configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enable_secure_boot',
            type: 'bool',
            description: 'Verify the digital signature of all boot components',
            default: false,
          },
          {
            name: 'enable_vtpm',
            type: 'bool',
            description: 'Use a virtualized trusted platform module',
            default: true,
          },
          {
            name: 'enable_integrity_monitoring',
            type: 'bool',
            description: 'Compare the most recent boot measurements to the integrity policy baseline',
            default: true,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'instance_id', type: 'string', description: 'The server-assigned unique identifier of this instance' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'cpu_platform', type: 'string', description: 'The CPU platform used by this instance' },
    { name: 'metadata_fingerprint', type: 'string', description: 'The unique fingerprint of the metadata' },
    { name: 'tags_fingerprint', type: 'string', description: 'The unique fingerprint of the tags' },
    { name: 'label_fingerprint', type: 'string', description: 'The unique fingerprint of the labels' },
  ],

  terraform: {
    resourceType: 'google_compute_instance',
    requiredArgs: ['name', 'machine_type', 'zone', 'boot_disk', 'network_interface'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      instance_id: 'instance_id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'google_compute_network',
        apply: [],
      },
      {
        whenParentResourceType: 'google_compute_subnetwork',
        apply: [],
      },
    ],
    autoResolveRules: [
      {
        requiredArg: 'network_interface.network',
        acceptsResourceTypes: ['google_compute_network'],
        search: [{ type: 'containment_ancestors' }],
        onMissing: {
          level: 'warning',
          message: 'Compute instance has no network configured',
          fixHint: 'Place instance inside a VPC network or connect to a network',
        },
      },
    ],
  },
};
