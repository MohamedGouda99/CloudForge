/**
 * AWS Serverless Resources Index
 */

// Icon resources
export { awsLambdaPermission } from './lambda-permission';
export { awsLambdaEventSourceMapping } from './lambda-event-source-mapping';
export { awsSfnStateMachine } from './sfn-state-machine';

// Aggregate all serverless resources
import { awsLambdaPermission } from './lambda-permission';
import { awsLambdaEventSourceMapping } from './lambda-event-source-mapping';
import { awsSfnStateMachine } from './sfn-state-machine';

export const serverlessResources = [
  awsLambdaPermission,
  awsLambdaEventSourceMapping,
  awsSfnStateMachine,
];
