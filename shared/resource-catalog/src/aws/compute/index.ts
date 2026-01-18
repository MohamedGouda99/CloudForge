/**
 * AWS Compute Services
 *
 * All compute-related resource definitions including EC2, Lambda,
 * Auto Scaling, Launch Templates, Elastic Beanstalk, App Runner, and Batch.
 */

import type { ServiceDefinition } from '../../types';

// Import individual service definitions
import { awsEc2Instance } from './ec2';
import { awsLambdaFunction } from './lambda';
import { awsLaunchTemplate } from './launch-template';
import { awsAutoscalingGroup } from './autoscaling-group';
import { awsAutoscalingPolicy } from './autoscaling-policy';
import { awsElasticBeanstalkApplication } from './elastic-beanstalk';
import { awsAppRunnerService } from './apprunner';
import { awsBatchJobDefinition } from './batch';
import { awsKeyPair } from './key-pair';
import { awsPlacementGroup } from './placement-group';

// Re-export individual services
export {
  awsEc2Instance,
  awsLambdaFunction,
  awsLaunchTemplate,
  awsAutoscalingGroup,
  awsAutoscalingPolicy,
  awsElasticBeanstalkApplication,
  awsAppRunnerService,
  awsBatchJobDefinition,
  awsKeyPair,
  awsPlacementGroup,
};

// Export combined array of all compute services
export const awsComputeServices: ServiceDefinition[] = [
  awsEc2Instance,
  awsLambdaFunction,
  awsLaunchTemplate,
  awsAutoscalingGroup,
  awsAutoscalingPolicy,
  awsElasticBeanstalkApplication,
  awsAppRunnerService,
  awsBatchJobDefinition,
  awsKeyPair,
  awsPlacementGroup,
];

// Export helper to find a compute service by terraform_resource
export function getComputeService(terraformResource: string): ServiceDefinition | undefined {
  return awsComputeServices.find(s => s.terraform_resource === terraformResource);
}
