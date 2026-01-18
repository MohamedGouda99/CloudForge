/**
 * AWS Messaging Resources Index
 */

// Icon resources (all messaging resources are icons, not containers)
export { awsSnsTopic } from './sns-topic';
export { awsSqsQueue } from './sqs-queue';
export { awsSnsTopicSubscription } from './sns-topic-subscription';

// Aggregate all messaging resources
import { awsSnsTopic } from './sns-topic';
import { awsSqsQueue } from './sqs-queue';
import { awsSnsTopicSubscription } from './sns-topic-subscription';

export const messagingResources = [
  awsSnsTopic,
  awsSqsQueue,
  awsSnsTopicSubscription,
];
