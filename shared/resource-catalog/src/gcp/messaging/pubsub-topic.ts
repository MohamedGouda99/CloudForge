/**
 * GCP Pub/Sub Topic Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const gcpPubSubTopic: ServiceDefinition = {
  id: 'pubsub_topic',
  terraform_resource: 'google_pubsub_topic',
  name: 'Pub/Sub Topic',
  description: 'A named resource to which messages are sent by publishers',
  icon: MESSAGING_ICONS.PUBSUB,
  category: 'messaging',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the topic',
        example: 'my-topic',
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
        name: 'labels',
        type: 'map(string)',
        description: 'A set of key/value label pairs to assign to this Topic',
        group: 'basic',
      },
      {
        name: 'kms_key_name',
        type: 'string',
        description: 'The resource name of the Cloud KMS CryptoKey to be used to protect access to messages published on this topic',
        group: 'security',
      },
      {
        name: 'message_retention_duration',
        type: 'string',
        description: 'Indicates the minimum duration to retain a message after it is published to the topic',
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'message_storage_policy',
        description: 'Policy constraining the set of Google Cloud Platform regions where messages published to the topic may be stored',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'allowed_persistence_regions',
            type: 'list(string)',
            description: 'A list of IDs of GCP regions where messages that are published to the topic may be persisted in storage',
          },
        ],
      },
      {
        name: 'schema_settings',
        description: 'Settings for validating messages published against a schema',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'schema',
            type: 'string',
            description: 'The name of the schema that messages published should be validated against',
          },
          {
            name: 'encoding',
            type: 'string',
            description: 'The encoding of messages validated against schema',
            options: ['ENCODING_UNSPECIFIED', 'JSON', 'BINARY'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
  ],

  terraform: {
    resourceType: 'google_pubsub_topic',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    validChildren: [
      {
        childTypes: ['google_pubsub_subscription'],
        description: 'Pub/Sub topic can have subscriptions',
      },
    ],
  },
};
