/**
 * GCP Messaging Resources
 */

export { gcpPubSubTopic } from './pubsub-topic';
export { gcpPubSubSubscription } from './pubsub-subscription';

import { gcpPubSubTopic } from './pubsub-topic';
import { gcpPubSubSubscription } from './pubsub-subscription';

export const messagingResources = [
  gcpPubSubTopic,
  gcpPubSubSubscription,
];
