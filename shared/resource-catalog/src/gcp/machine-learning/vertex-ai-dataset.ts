/**
 * GCP Vertex AI Dataset Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { MACHINE_LEARNING_ICONS } from '../icons';

export const gcpVertexAIDataset: ServiceDefinition = {
  id: 'vertex_ai_dataset',
  terraform_resource: 'google_vertex_ai_dataset',
  name: 'Vertex AI Dataset',
  description: 'A collection of DataItems and Annotations on them',
  icon: MACHINE_LEARNING_ICONS.VERTEX_AI,
  category: 'machine-learning',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'display_name',
        type: 'string',
        description: 'The user-defined name of the Dataset',
        example: 'my-dataset',
        group: 'basic',
      },
      {
        name: 'metadata_schema_uri',
        type: 'string',
        description: 'Points to a YAML file stored on Google Cloud Storage describing additional information about the Dataset',
        example: 'gs://google-cloud-aiplatform/schema/dataset/metadata/image_1.0.0.yaml',
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
        name: 'region',
        type: 'string',
        description: 'The region of the dataset',
        group: 'basic',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'A set of key/value label pairs to assign to this Dataset',
        group: 'basic',
      },
    ],
    blocks: [
      {
        name: 'encryption_spec',
        description: 'Customer-managed encryption key spec for a Dataset',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'kms_key_name',
            type: 'string',
            description: 'Required. The Cloud KMS resource identifier of the customer managed encryption key',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'name', type: 'string', description: 'The resource name of the Dataset' },
    { name: 'create_time', type: 'string', description: 'The timestamp of when the dataset was created' },
    { name: 'update_time', type: 'string', description: 'The timestamp of when the dataset was last updated' },
  ],

  terraform: {
    resourceType: 'google_vertex_ai_dataset',
    requiredArgs: ['display_name', 'metadata_schema_uri'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },
};
