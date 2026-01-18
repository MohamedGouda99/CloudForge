/**
 * AWS Container Services
 *
 * All container-related resource definitions including ECS, EKS, and related resources.
 */

import type { ServiceDefinition } from '../../types';

// Import individual service definitions
import { awsEcsCluster } from './ecs-cluster';
import { awsEcsService } from './ecs-service';
import { awsEcsTaskDefinition } from './ecs-task-definition';
import { awsEksCluster } from './eks-cluster';
import { awsEksNodeGroup } from './eks-node-group';
import { awsEcrRepository } from './ecr-repository';
import { awsEcsCapacityProvider } from './ecs-capacity-provider';
import { awsEksAddon } from './eks-addon';
import { awsEksFargateProfile } from './eks-fargate-profile';

// Re-export individual services
export {
  awsEcsCluster,
  awsEcsService,
  awsEcsTaskDefinition,
  awsEksCluster,
  awsEksNodeGroup,
  awsEcrRepository,
  awsEcsCapacityProvider,
  awsEksAddon,
  awsEksFargateProfile,
};

// Export combined array of all container services
export const awsContainerServices: ServiceDefinition[] = [
  awsEcsCluster,
  awsEcsService,
  awsEcsTaskDefinition,
  awsEksCluster,
  awsEksNodeGroup,
  awsEcrRepository,
  awsEcsCapacityProvider,
  awsEksAddon,
  awsEksFargateProfile,
];

// Export helper to find a container service by terraform_resource
export function getContainerService(terraformResource: string): ServiceDefinition | undefined {
  return awsContainerServices.find(s => s.terraform_resource === terraformResource);
}
