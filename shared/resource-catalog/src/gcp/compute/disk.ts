/**
 * GCP Persistent Disk Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const gcpComputeDisk: ServiceDefinition = {
  id: 'compute_disk',
  terraform_resource: 'google_compute_disk',
  name: 'Persistent Disk',
  description: 'Persistent disks are durable storage devices that function similarly to physical disks',
  icon: COMPUTE_ICONS.PERSISTENT_DISK,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the resource',
        example: 'my-disk',
        group: 'basic',
      },
      {
        name: 'zone',
        type: 'string',
        description: 'A reference to the zone where the disk resides',
        example: 'us-central1-a',
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
        name: 'labels',
        type: 'map(string)',
        description: 'Labels to apply to this disk',
        group: 'basic',
      },
      {
        name: 'size',
        type: 'number',
        description: 'Size of the persistent disk, specified in GB',
        group: 'basic',
      },
      {
        name: 'type',
        type: 'string',
        description: 'URL of the disk type resource describing which disk type to use',
        options: ['pd-standard', 'pd-ssd', 'pd-balanced', 'pd-extreme'],
        default: 'pd-standard',
        group: 'basic',
      },
      {
        name: 'image',
        type: 'string',
        description: 'The image from which to initialize this disk',
        group: 'basic',
      },
      {
        name: 'snapshot',
        type: 'string',
        description: 'The source snapshot used to create this disk',
        group: 'advanced',
      },
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'provisioned_iops',
        type: 'number',
        description: 'Indicates how many IOPS to provision for the disk',
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'disk_encryption_key',
        description: 'Encrypts the disk using a customer-supplied encryption key',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'raw_key',
            type: 'string',
            description: 'Specifies a 256-bit customer-supplied encryption key',
          },
          {
            name: 'kms_key_self_link',
            type: 'string',
            description: 'The self link of the encryption key used to encrypt the disk',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The URI of the created resource' },
    { name: 'creation_timestamp', type: 'string', description: 'Creation timestamp in RFC3339 text format' },
    { name: 'last_attach_timestamp', type: 'string', description: 'Last attach timestamp' },
    { name: 'last_detach_timestamp', type: 'string', description: 'Last detach timestamp' },
    { name: 'users', type: 'string', description: 'Links to the users of the disk' },
    { name: 'label_fingerprint', type: 'string', description: 'The fingerprint used for optimistic locking' },
  ],

  terraform: {
    resourceType: 'google_compute_disk',
    requiredArgs: ['name', 'zone'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
    },
  },
};
