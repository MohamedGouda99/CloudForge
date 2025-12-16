// Icon mapping utilities

import { GENERATED_ICON_MAP } from './generatedCatalog';

// Manual icon overrides for special cases
const MANUAL_ICON_MAP: Record<string, string> = {
  'aws_instance': '/icons/aws/ec2.svg',
  'aws_vpc': '/icons/aws/vpc.svg',
  'aws_subnet': '/icons/aws/subnet.svg',
  'aws_security_group': '/icons/aws/security-group.svg',
  'aws_s3_bucket': '/icons/aws/s3.svg',
  'aws_lambda_function': '/icons/aws/lambda.svg',
  'aws_rds_instance': '/icons/aws/rds.svg',
  'aws_dynamodb_table': '/icons/aws/dynamodb.svg',
  'aws_iam_role': '/icons/aws/iam.svg',
  'aws_iam_policy': '/icons/aws/iam.svg',
  'aws_cloudwatch_log_group': '/icons/aws/cloudwatch.svg',
  'aws_sns_topic': '/icons/aws/sns.svg',
  'aws_sqs_queue': '/icons/aws/sqs.svg',
  'aws_elasticache_cluster': '/icons/aws/elasticache.svg',
  'aws_ecs_cluster': '/icons/aws/ecs.svg',
  'aws_eks_cluster': '/icons/aws/eks.svg',
  'azurerm_resource_group': '/icons/azure/resource-group.svg',
  'azurerm_virtual_network': '/icons/azure/vnet.svg',
  'azurerm_subnet': '/icons/azure/subnet.svg',
  'azurerm_virtual_machine': '/icons/azure/vm.svg',
  'google_compute_instance': '/icons/gcp/compute-engine.svg',
  'google_compute_network': '/icons/gcp/vpc.svg',
};

/**
 * Get icon from manual mapping
 */
export function getManualIcon(resourceType: string): string | undefined {
  return MANUAL_ICON_MAP[resourceType];
}

/**
 * Get resource icon with fallback
 */
export function getResourceIcon(resourceType: string): string {
  // Check manual mapping first
  const manual = MANUAL_ICON_MAP[resourceType];
  if (manual) return manual;
  
  // Check generated catalog
  const generated = GENERATED_ICON_MAP[resourceType];
  if (generated) return generated;
  
  // Default fallback
  return '/icons/aws/resource.svg';
}

export { GENERATED_ICON_MAP, MANUAL_ICON_MAP };

