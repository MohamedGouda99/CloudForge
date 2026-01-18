/**
 * AWS Resource Catalog
 *
 * Re-exports all AWS service definitions for easy importing.
 */

// Compute services (EC2, Lambda, ASG, Launch Templates, etc.)
export * from './compute';

// Container services (ECS, EKS, ECR)
export * from './containers';

// Networking services (VPC, Subnet, Security Group, Load Balancer, etc.)
export * from './networking';

// Storage services (S3, EBS, EFS)
export * from './storage';

// Database services (RDS, DynamoDB, ElastiCache)
export * from './database';

// Security services (IAM, Cognito, KMS, Secrets Manager, ACM)
export * from './security';

// Messaging services (SNS, SQS)
export * from './messaging';

// Management services (CloudWatch, EventBridge, SSM)
export * from './management';

// Developer Tools services (CodePipeline, CodeBuild)
export * from './developer-tools';

// Analytics services (Kinesis, Athena, Glue)
export * from './analytics';

// Machine Learning services (SageMaker)
export * from './machine-learning';

// Serverless services (Lambda permissions, Step Functions)
export * from './serverless';

// Icons
export * from './icons';

// Aggregate all resources from all categories
import { awsComputeServices } from './compute';
import { awsContainerServices } from './containers';
import { networkingResources } from './networking';
import { storageResources } from './storage';
import { databaseResources } from './database';
import { securityResources } from './security';
import { messagingResources } from './messaging';
import { managementResources } from './management';
import { developerToolsResources } from './developer-tools';
import { analyticsResources } from './analytics';
import { machineLearningResources } from './machine-learning';
import { serverlessResources } from './serverless';

export const allAwsResources = [
  ...awsComputeServices,
  ...awsContainerServices,
  ...networkingResources,
  ...storageResources,
  ...databaseResources,
  ...securityResources,
  ...messagingResources,
  ...managementResources,
  ...developerToolsResources,
  ...analyticsResources,
  ...machineLearningResources,
  ...serverlessResources,
];
