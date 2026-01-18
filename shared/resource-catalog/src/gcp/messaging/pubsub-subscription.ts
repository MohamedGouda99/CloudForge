/**
 * GCP Pub/Sub Subscription Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { MESSAGING_ICONS } from '../icons';

export const gcpPubSubSubscription: ServiceDefinition = {
  id: 'pubsub_subscription',
  terraform_resource: 'google_pubsub_subscription',
  name: 'Pub/Sub Subscription',
  description: 'A named resource representing the stream of messages from a single topic',
  icon: MESSAGING_ICONS.PUBSUB,
  category: 'messaging',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the subscription',
        example: 'my-subscription',
        group: 'basic',
      },
      {
        name: 'topic',
        type: 'string',
        description: 'A reference to a Topic resource',
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
        description: 'A set of key/value label pairs to assign to this Subscription',
        group: 'basic',
      },
      {
        name: 'ack_deadline_seconds',
        type: 'number',
        description: 'Maximum time after a subscriber receives a message before the subscriber should acknowledge the message',
        default: 10,
        group: 'advanced',
      },
      {
        name: 'message_retention_duration',
        type: 'string',
        description: 'How long to retain unacknowledged messages in the subscription\'s backlog',
        default: '604800s',
        group: 'advanced',
      },
      {
        name: 'retain_acked_messages',
        type: 'bool',
        description: 'Indicates whether to retain acknowledged messages',
        default: false,
        group: 'advanced',
      },
      {
        name: 'filter',
        type: 'string',
        description: 'An expression written in the Cloud Pub/Sub filter language',
        group: 'advanced',
      },
      {
        name: 'enable_message_ordering',
        type: 'bool',
        description: 'If true, messages published with the same orderingKey in PubsubMessage will be delivered in the order they are received',
        default: false,
        group: 'advanced',
      },
    ],
    blocks: [
      {
        name: 'push_config',
        description: 'If push delivery is used with this subscription, this field is used to configure it',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'push_endpoint',
            type: 'string',
            description: 'A URL locating the endpoint to which messages should be pushed',
          },
          {
            name: 'attributes',
            type: 'map(string)',
            description: 'Endpoint configuration attributes',
          },
        ],
      },
      {
        name: 'dead_letter_policy',
        description: 'A policy that specifies the conditions for dead lettering messages in this subscription',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'dead_letter_topic',
            type: 'string',
            description: 'The name of the topic to which dead letter messages should be published',
          },
          {
            name: 'max_delivery_attempts',
            type: 'number',
            description: 'The maximum number of delivery attempts for any message',
          },
        ],
      },
      {
        name: 'retry_policy',
        description: 'A policy that specifies how Pub/Sub retries message delivery',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'minimum_backoff',
            type: 'string',
            description: 'The minimum delay between consecutive deliveries of a given message',
          },
          {
            name: 'maximum_backoff',
            type: 'string',
            description: 'The maximum delay between consecutive deliveries of a given message',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
  ],

  terraform: {
    resourceType: 'google_pubsub_subscription',
    requiredArgs: ['name', 'topic'],
    referenceableAttrs: {
      id: 'id',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'google_pubsub_topic',
        apply: [
          {
            setArg: 'topic',
            toParentAttr: 'name',
          },
        ],
      },
    ],
  },
};
