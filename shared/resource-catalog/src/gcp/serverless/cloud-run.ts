/**
 * GCP Cloud Run Service Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SERVERLESS_ICONS } from '../icons';

export const gcpCloudRunService: ServiceDefinition = {
  id: 'cloud_run_service',
  terraform_resource: 'google_cloud_run_service',
  name: 'Cloud Run Service',
  description: 'A Cloud Run service has a unique endpoint and autoscales containers',
  icon: SERVERLESS_ICONS.CLOUD_RUN,
  category: 'serverless',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name must be unique within a namespace',
        example: 'my-service',
        group: 'basic',
      },
      {
        name: 'location',
        type: 'string',
        description: 'The location of the cloud run instance',
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
        name: 'autogenerate_revision_name',
        type: 'bool',
        description: 'If set to true, the revision name will be automatically generated',
        default: false,
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'template',
        description: 'The template for the revision',
        required: true,
        multiple: false,
        attributes: [
          {
            name: 'spec',
            type: 'string',
            description: 'RevisionSpec holds the desired state of the Revision',
          },
        ],
      },
      {
        name: 'traffic',
        description: 'Traffic configuration for the service',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'percent',
            type: 'number',
            description: 'Percent specifies percent of the traffic to this Revision or Configuration',
          },
          {
            name: 'latest_revision',
            type: 'bool',
            description: 'Indicates that the latest revision should be used for this traffic',
            default: true,
          },
          {
            name: 'revision_name',
            type: 'string',
            description: 'RevisionName is the name of a specific revision to route traffic to',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'status', type: 'string', description: 'The current status of the Cloud Run service' },
  ],

  terraform: {
    resourceType: 'google_cloud_run_service',
    requiredArgs: ['name', 'location', 'template'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },
};
