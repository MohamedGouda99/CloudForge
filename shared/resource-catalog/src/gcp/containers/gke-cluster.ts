/**
 * GCP GKE Cluster Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { CONTAINERS_ICONS } from '../icons';

export const gcpContainerCluster: ServiceDefinition = {
  id: 'container_cluster',
  terraform_resource: 'google_container_cluster',
  name: 'GKE Cluster',
  description: 'Manages a Google Kubernetes Engine (GKE) cluster',
  icon: CONTAINERS_ICONS.GKE,
  category: 'containers',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the cluster',
        example: 'my-gke-cluster',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The location (region or zone) in which the cluster master will be created',
        example: 'us-central1',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the cluster',
        group: 'basic',
      },
      {
        name: 'network',
        type: 'string',
        description: 'The name or self_link of the Google Compute Engine network',
        reference: 'google_compute_network.self_link',
        group: 'basic',
      },
      {
        name: 'subnetwork',
        type: 'string',
        description: 'The name or self_link of the Google Compute Engine subnetwork',
        reference: 'google_compute_subnetwork.self_link',
        group: 'basic',
      },
      {
        name: 'initial_node_count',
        type: 'number',
        description: 'The number of nodes to create in this cluster default node pool',
        default: 1,
        group: 'basic',
      },
      {
        name: 'remove_default_node_pool',
        type: 'bool',
        description: 'If true, deletes the default node pool upon cluster creation',
        default: false,
        group: 'advanced',
      },
      {
        name: 'min_master_version',
        type: 'string',
        description: 'The minimum version of the master',
        group: 'advanced',
      },
      {
        name: 'deletion_protection',
        type: 'bool',
        description: 'Whether or not to allow Terraform to destroy the cluster',
        default: true,
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'node_config',
        description: 'Parameters used in creating the default node pool',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'machine_type',
            type: 'string',
            description: 'The name of a Google Compute Engine machine type',
            default: 'e2-medium',
          },
          {
            name: 'disk_size_gb',
            type: 'number',
            description: 'Size of the disk attached to each node, specified in GB',
            default: 100,
          },
          {
            name: 'disk_type',
            type: 'string',
            description: 'Type of the disk attached to each node',
            options: ['pd-standard', 'pd-balanced', 'pd-ssd'],
            default: 'pd-standard',
          },
          {
            name: 'preemptible',
            type: 'bool',
            description: 'A boolean that represents whether or not the underlying node VMs are preemptible',
            default: false,
          },
          {
            name: 'service_account',
            type: 'string',
            description: 'The Google Cloud Platform Service Account to be used by the node VMs',
          },
        ],
      },
      {
        name: 'master_auth',
        description: 'The authentication information for accessing the Kubernetes master',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'client_certificate_config',
            type: 'string',
            description: 'Whether client certificate authorization is enabled for this cluster',
          },
        ],
      },
      {
        name: 'private_cluster_config',
        description: 'Configuration for private clusters',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'enable_private_nodes',
            type: 'bool',
            description: 'When true, the cluster nodes will not have external IP addresses',
          },
          {
            name: 'enable_private_endpoint',
            type: 'bool',
            description: 'When true, the cluster master can only be accessed via the private IP',
          },
          {
            name: 'master_ipv4_cidr_block',
            type: 'string',
            description: 'The IP range in CIDR notation to use for the hosted master network',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'self_link', type: 'string', description: 'The server-defined URL for the resource' },
    { name: 'endpoint', type: 'string', description: 'The IP address of this cluster master' },
    { name: 'cluster_ca_certificate', type: 'string', description: 'Base64 encoded public certificate that is the root of trust for the cluster' },
    { name: 'master_version', type: 'string', description: 'The current version of the master in the cluster' },
  ],

  terraform: {
    resourceType: 'google_container_cluster',
    requiredArgs: ['name', 'location'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      endpoint: 'endpoint',
      name: 'name',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['google_container_node_pool'],
        description: 'GKE cluster can contain node pools',
      },
    ],
  },
};
