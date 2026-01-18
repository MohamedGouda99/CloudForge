/**
 * Azure Virtual Machine Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const azureVirtualMachine: ServiceDefinition = {
  id: 'virtual_machine',
  terraform_resource: 'azurerm_linux_virtual_machine',
  name: 'Virtual Machine',
  description: 'Manages a Linux Virtual Machine',
  icon: COMPUTE_ICONS.VIRTUAL_MACHINE,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the Linux Virtual Machine',
        example: 'my-vm',
        group: 'basic',
      },
      {
        name: 'resource_group_name',
        type: 'string',
        description: 'The name of the Resource Group in which the Linux Virtual Machine should exist',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The Azure location where the Linux Virtual Machine should exist',
        example: 'eastus',
        group: 'basic',
      },
      {
        name: 'size',
        type: 'string',
        description: 'The SKU which should be used for this Virtual Machine',
        example: 'Standard_B2s',
        group: 'basic',
      },
      {
        name: 'admin_username',
        type: 'string',
        description: 'The username of the local administrator used for the Virtual Machine',
        group: 'security',
      },
    ],
    optional: [
      {
        name: 'admin_password',
        type: 'string',
        description: 'The Password which should be used for the local-administrator on this Virtual Machine',
        sensitive: true,
        group: 'security',
      },
      {
        name: 'disable_password_authentication',
        type: 'bool',
        description: 'Should Password Authentication be disabled on this Virtual Machine?',
        default: true,
        group: 'security',
      },
      {
        name: 'network_interface_ids',
        type: 'list(string)',
        description: 'A list of Network Interface IDs which should be attached to this Virtual Machine',
        group: 'networking',
      },
      {
        name: 'availability_set_id',
        type: 'string',
        description: 'Specifies the ID of the Availability Set in which the Virtual Machine should exist',
        group: 'advanced',
      },
      {
        name: 'zone',
        type: 'string',
        description: 'Specifies the Availability Zone in which this Linux Virtual Machine should be located',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'A mapping of tags to assign to the resource',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'admin_ssh_key',
        description: 'One or more admin_ssh_key blocks',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'username',
            type: 'string',
            description: 'The Username for which this Public SSH Key should be configured',
          },
          {
            name: 'public_key',
            type: 'string',
            description: 'The Public Key which should be used for authentication',
          },
        ],
      },
      {
        name: 'os_disk',
        description: 'An os_disk block',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'caching',
            type: 'string',
            description: 'The Type of Caching which should be used for the Internal OS Disk',
            options: ['None', 'ReadOnly', 'ReadWrite'],
          },
          {
            name: 'storage_account_type',
            type: 'string',
            description: 'The Type of Storage Account which should back this the Internal OS Disk',
            options: ['Standard_LRS', 'StandardSSD_LRS', 'Premium_LRS'],
          },
          {
            name: 'disk_size_gb',
            type: 'number',
            description: 'The Size of the Internal OS Disk in GB',
          },
        ],
      },
      {
        name: 'source_image_reference',
        description: 'A source_image_reference block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'publisher',
            type: 'string',
            description: 'Specifies the publisher of the image used to create the virtual machine',
          },
          {
            name: 'offer',
            type: 'string',
            description: 'Specifies the offer of the image used to create the virtual machine',
          },
          {
            name: 'sku',
            type: 'string',
            description: 'Specifies the SKU of the image used to create the virtual machine',
          },
          {
            name: 'version',
            type: 'string',
            description: 'Specifies the version of the image used to create the virtual machine',
          },
        ],
      },
      {
        name: 'identity',
        description: 'An identity block',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'type',
            type: 'string',
            description: 'Specifies the type of Managed Service Identity',
            options: ['SystemAssigned', 'UserAssigned', 'SystemAssigned, UserAssigned'],
          },
          {
            name: 'identity_ids',
            type: 'list(string)',
            description: 'Specifies a list of User Assigned Managed Identity IDs',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The ID of the Linux Virtual Machine' },
    { name: 'private_ip_address', type: 'string', description: 'The Primary Private IP Address assigned to this Virtual Machine' },
    { name: 'public_ip_address', type: 'string', description: 'The Primary Public IP Address assigned to this Virtual Machine' },
    { name: 'virtual_machine_id', type: 'string', description: 'A 128-bit identifier which uniquely identifies this Virtual Machine' },
  ],

  terraform: {
    resourceType: 'azurerm_linux_virtual_machine',
    requiredArgs: ['name', 'resource_group_name', 'location', 'size', 'admin_username', 'os_disk'],
    referenceableAttrs: {
      id: 'id',
      private_ip_address: 'private_ip_address',
      public_ip_address: 'public_ip_address',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'azurerm_resource_group',
        apply: [
          {
            setArg: 'resource_group_name',
            toParentAttr: 'name',
          },
          {
            setArg: 'location',
            toParentAttr: 'location',
          },
        ],
      },
    ],
  },
};
