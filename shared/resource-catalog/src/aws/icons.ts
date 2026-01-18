/**
 * AWS Icon Paths
 *
 * Centralized icon path definitions for all AWS resources.
 * Based on AWS Architecture Icons (July 2025 release).
 *
 * Base path: /cloud_icons/AWS/Architecture-Service-Icons_07312025/
 */

const AWS_ICON_BASE = '/cloud_icons/AWS/Architecture-Service-Icons_07312025';

// ============================================================================
// Compute Icons
// ============================================================================

export const COMPUTE_ICONS = {
  EC2: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_Amazon-EC2_64.svg`,
  LAMBDA: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_AWS-Lambda_64.svg`,
  ELASTIC_BEANSTALK: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_AWS-Elastic-Beanstalk_64.svg`,
  APP_RUNNER: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_AWS-App-Runner_64.svg`,
  BATCH: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_AWS-Batch_64.svg`,
  LAUNCH_TEMPLATE: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_Amazon-EC2_64.svg`, // Uses EC2 icon
  AUTO_SCALING: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_Amazon-EC2-Auto-Scaling_64.svg`,
} as const;

// ============================================================================
// Container Icons
// ============================================================================

export const CONTAINER_ICONS = {
  ECS: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg`,
  ECS_CLUSTER: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg`,
  ECS_SERVICE: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg`,
  ECS_TASK: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg`,
  EKS: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg`,
  EKS_CLUSTER: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg`,
  EKS_NODE_GROUP: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Kubernetes-Service_64.svg`,
  ECR: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_Amazon-Elastic-Container-Registry_64.svg`,
  FARGATE: `${AWS_ICON_BASE}/Arch_Containers/64/Arch_AWS-Fargate_64.svg`,
} as const;

// ============================================================================
// Networking Icons
// ============================================================================

const AWS_RESOURCE_ICON_BASE = '/cloud_icons/AWS/Resource-Icons_07312025';

export const NETWORKING_ICONS = {
  VPC: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg`,
  SUBNET: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Virtual-private-cloud-VPC_48.svg`,
  SECURITY_GROUP: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Network-Access-Control-List_48.svg`,
  INTERNET_GATEWAY: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Internet-Gateway_48.svg`,
  NAT_GATEWAY: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_NAT-Gateway_48.svg`,
  ROUTE_TABLE: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Router_48.svg`,
  NETWORK_ACL: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Network-Access-Control-List_48.svg`,
  ELASTIC_IP: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Elastic-Network-Interface_48.svg`,
  NETWORK_INTERFACE: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Elastic-Network-Interface_48.svg`,
  TRANSIT_GATEWAY: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_AWS-Transit-Gateway_64.svg`,
  ALB: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg`,
  NLB: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Network-Load-Balancer_48.svg`,
  TARGET_GROUP: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg`,
  LISTENER: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg`,
  API_GATEWAY: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg`,
  API_GATEWAY_V2: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg`,
  CLOUDFRONT: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg`,
  ROUTE53: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg`,
  VPN_GATEWAY: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_VPN-Gateway_48.svg`,
  VPN_CONNECTION: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_VPN-Connection_48.svg`,
  CUSTOMER_GATEWAY: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Customer-Gateway_48.svg`,
  VPC_PEERING: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Peering-Connection_48.svg`,
  VPC_ENDPOINT: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Endpoints_48.svg`,
  FLOW_LOGS: `${AWS_RESOURCE_ICON_BASE}/Res_Networking-Content-Delivery/Res_Amazon-VPC_Flow-Logs_48.svg`,
} as const;

// ============================================================================
// Security Icons
// ============================================================================

export const SECURITY_ICONS = {
  IAM: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  IAM_ROLE: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  IAM_USER: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  IAM_GROUP: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  IAM_POLICY: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg`,
  COGNITO: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg`,
  KMS: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Key-Management-Service_64.svg`,
  SECRETS_MANAGER: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Secrets-Manager_64.svg`,
  WAF: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-WAF_64.svg`,
  INSPECTOR: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_Amazon-Inspector_64.svg`,
  SHIELD: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Shield_64.svg`,
  MACIE: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_Amazon-Macie_64.svg`,
  GUARDDUTY: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_Amazon-GuardDuty_64.svg`,
  ACM: `${AWS_ICON_BASE}/Arch_Security-Identity-Compliance/64/Arch_AWS-Certificate-Manager_64.svg`,
} as const;

// ============================================================================
// Messaging Icons
// ============================================================================

export const MESSAGING_ICONS = {
  SNS: `${AWS_ICON_BASE}/Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg`,
  SQS: `${AWS_ICON_BASE}/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg`,
  EVENTBRIDGE: `${AWS_ICON_BASE}/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg`,
} as const;

// ============================================================================
// Management Icons
// ============================================================================

export const MANAGEMENT_ICONS = {
  CLOUDWATCH: `${AWS_ICON_BASE}/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg`,
  CLOUDWATCH_LOGS: `${AWS_ICON_BASE}/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg`,
} as const;

// ============================================================================
// Developer Tools Icons
// ============================================================================

export const DEVELOPER_TOOLS_ICONS = {
  CODEPIPELINE: `${AWS_ICON_BASE}/Arch_Developer-Tools/64/Arch_AWS-CodePipeline_64.svg`,
  CODEBUILD: `${AWS_ICON_BASE}/Arch_Developer-Tools/64/Arch_AWS-CodeBuild_64.svg`,
  CODECOMMIT: `${AWS_ICON_BASE}/Arch_Developer-Tools/64/Arch_AWS-CodeCommit_64.svg`,
  CODEDEPLOY: `${AWS_ICON_BASE}/Arch_Developer-Tools/64/Arch_AWS-CodeDeploy_64.svg`,
} as const;

// ============================================================================
// Storage Icons
// ============================================================================

export const STORAGE_ICONS = {
  S3: `${AWS_ICON_BASE}/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg`,
  EBS: `${AWS_ICON_BASE}/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg`,
  EFS: `${AWS_ICON_BASE}/Arch_Storage/64/Arch_Amazon-Elastic-File-System_64.svg`,
  FSX: `${AWS_ICON_BASE}/Arch_Storage/64/Arch_Amazon-FSx_64.svg`,
  GLACIER: `${AWS_ICON_BASE}/Arch_Storage/64/Arch_Amazon-S3-Glacier_64.svg`,
} as const;

// ============================================================================
// Database Icons
// ============================================================================

export const DATABASE_ICONS = {
  RDS: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-RDS_64.svg`,
  AURORA: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-Aurora_64.svg`,
  DYNAMODB: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-DynamoDB_64.svg`,
  ELASTICACHE: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg`,
  REDSHIFT: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-Redshift_64.svg`,
  DOCUMENTDB: `${AWS_ICON_BASE}/Arch_Database/64/Arch_Amazon-DocumentDB_64.svg`,
} as const;

// ============================================================================
// Analytics Icons
// ============================================================================

export const ANALYTICS_ICONS = {
  KINESIS: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-Kinesis_64.svg`,
  KINESIS_FIREHOSE: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-Kinesis-Data-Firehose_64.svg`,
  ATHENA: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-Athena_64.svg`,
  GLUE: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_AWS-Glue_64.svg`,
  EMR: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-EMR_64.svg`,
  REDSHIFT: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-Redshift_64.svg`,
  QUICKSIGHT: `${AWS_ICON_BASE}/Arch_Analytics/64/Arch_Amazon-QuickSight_64.svg`,
} as const;

// ============================================================================
// Machine Learning Icons
// ============================================================================

export const MACHINE_LEARNING_ICONS = {
  SAGEMAKER: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-SageMaker_64.svg`,
  BEDROCK: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Bedrock_64.svg`,
  REKOGNITION: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Rekognition_64.svg`,
  COMPREHEND: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Comprehend_64.svg`,
  POLLY: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Polly_64.svg`,
  TEXTRACT: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Textract_64.svg`,
  TRANSLATE: `${AWS_ICON_BASE}/Arch_Machine-Learning/64/Arch_Amazon-Translate_64.svg`,
} as const;

// ============================================================================
// Serverless Icons
// ============================================================================

export const SERVERLESS_ICONS = {
  LAMBDA: `${AWS_ICON_BASE}/Arch_Compute/64/Arch_AWS-Lambda_64.svg`,
  STEP_FUNCTIONS: `${AWS_ICON_BASE}/Arch_App-Integration/64/Arch_AWS-Step-Functions_64.svg`,
  API_GATEWAY: `${AWS_ICON_BASE}/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg`,
  EVENTBRIDGE: `${AWS_ICON_BASE}/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg`,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the icon path for a given Terraform resource type
 */
export function getIconForResource(terraformResource: string): string {
  const iconMap: Record<string, string> = {
    // Compute
    aws_instance: COMPUTE_ICONS.EC2,
    aws_lambda_function: COMPUTE_ICONS.LAMBDA,
    aws_elastic_beanstalk_application: COMPUTE_ICONS.ELASTIC_BEANSTALK,
    aws_elastic_beanstalk_environment: COMPUTE_ICONS.ELASTIC_BEANSTALK,
    aws_apprunner_service: COMPUTE_ICONS.APP_RUNNER,
    aws_batch_job_definition: COMPUTE_ICONS.BATCH,
    aws_batch_compute_environment: COMPUTE_ICONS.BATCH,
    aws_launch_template: COMPUTE_ICONS.LAUNCH_TEMPLATE,
    aws_autoscaling_group: COMPUTE_ICONS.AUTO_SCALING,
    aws_autoscaling_policy: COMPUTE_ICONS.AUTO_SCALING,

    // Containers
    aws_ecs_cluster: CONTAINER_ICONS.ECS_CLUSTER,
    aws_ecs_service: CONTAINER_ICONS.ECS_SERVICE,
    aws_ecs_task_definition: CONTAINER_ICONS.ECS_TASK,
    aws_eks_cluster: CONTAINER_ICONS.EKS_CLUSTER,
    aws_eks_node_group: CONTAINER_ICONS.EKS_NODE_GROUP,
    aws_ecr_repository: CONTAINER_ICONS.ECR,

    // Networking
    aws_vpc: NETWORKING_ICONS.VPC,
    aws_subnet: NETWORKING_ICONS.SUBNET,
    aws_security_group: NETWORKING_ICONS.SECURITY_GROUP,
    aws_security_group_rule: NETWORKING_ICONS.SECURITY_GROUP,
    aws_internet_gateway: NETWORKING_ICONS.INTERNET_GATEWAY,
    aws_nat_gateway: NETWORKING_ICONS.NAT_GATEWAY,
    aws_route_table: NETWORKING_ICONS.ROUTE_TABLE,
    aws_route: NETWORKING_ICONS.ROUTE_TABLE,
    aws_route_table_association: NETWORKING_ICONS.ROUTE_TABLE,
    aws_network_acl: NETWORKING_ICONS.NETWORK_ACL,
    aws_network_acl_rule: NETWORKING_ICONS.NETWORK_ACL,
    aws_eip: NETWORKING_ICONS.ELASTIC_IP,
    aws_eip_association: NETWORKING_ICONS.ELASTIC_IP,
    aws_network_interface: NETWORKING_ICONS.NETWORK_INTERFACE,
    aws_lb: NETWORKING_ICONS.ALB,
    aws_alb: NETWORKING_ICONS.ALB,
    aws_nlb: NETWORKING_ICONS.NLB,
    aws_lb_listener: NETWORKING_ICONS.LISTENER,
    aws_lb_target_group: NETWORKING_ICONS.TARGET_GROUP,
    aws_lb_target_group_attachment: NETWORKING_ICONS.TARGET_GROUP,
    aws_ec2_transit_gateway: NETWORKING_ICONS.TRANSIT_GATEWAY,
    aws_vpc_endpoint: NETWORKING_ICONS.VPC_ENDPOINT,
    aws_vpc_peering_connection: NETWORKING_ICONS.VPC_PEERING,
    aws_vpn_gateway: NETWORKING_ICONS.VPN_GATEWAY,
    aws_vpn_connection: NETWORKING_ICONS.VPN_CONNECTION,
    aws_customer_gateway: NETWORKING_ICONS.CUSTOMER_GATEWAY,
    aws_flow_log: NETWORKING_ICONS.FLOW_LOGS,
    aws_api_gateway_rest_api: NETWORKING_ICONS.API_GATEWAY,
    aws_apigatewayv2_api: NETWORKING_ICONS.API_GATEWAY_V2,
    aws_cloudfront_distribution: NETWORKING_ICONS.CLOUDFRONT,
    aws_route53_zone: NETWORKING_ICONS.ROUTE53,

    // Security - IAM
    aws_iam_role: SECURITY_ICONS.IAM_ROLE,
    aws_iam_user: SECURITY_ICONS.IAM_USER,
    aws_iam_group: SECURITY_ICONS.IAM_GROUP,
    aws_iam_policy: SECURITY_ICONS.IAM_POLICY,
    aws_iam_role_policy_attachment: SECURITY_ICONS.IAM,
    aws_iam_instance_profile: SECURITY_ICONS.IAM,
    // Security - Encryption & Secrets
    aws_kms_key: SECURITY_ICONS.KMS,
    aws_secretsmanager_secret: SECURITY_ICONS.SECRETS_MANAGER,
    aws_acm_certificate: SECURITY_ICONS.ACM,
    // Security - Identity
    aws_cognito_user_pool: SECURITY_ICONS.COGNITO,
    // Security - Protection Services
    aws_wafv2_web_acl: SECURITY_ICONS.WAF,
    aws_inspector2_enabler: SECURITY_ICONS.INSPECTOR,
    aws_shield_protection: SECURITY_ICONS.SHIELD,
    aws_macie2_account: SECURITY_ICONS.MACIE,
    aws_guardduty_detector: SECURITY_ICONS.GUARDDUTY,

    // Storage
    aws_s3_bucket: STORAGE_ICONS.S3,
    aws_s3_object: STORAGE_ICONS.S3,
    aws_s3_bucket_versioning: STORAGE_ICONS.S3,
    aws_s3_bucket_lifecycle_configuration: STORAGE_ICONS.S3,
    aws_ebs_volume: STORAGE_ICONS.EBS,
    aws_efs_file_system: STORAGE_ICONS.EFS,
    aws_efs_mount_target: STORAGE_ICONS.EFS,
    aws_efs_access_point: STORAGE_ICONS.EFS,
    aws_fsx_lustre_file_system: STORAGE_ICONS.FSX,

    // Database
    aws_db_instance: DATABASE_ICONS.RDS,
    aws_rds_cluster: DATABASE_ICONS.AURORA,
    aws_rds_cluster_instance: DATABASE_ICONS.AURORA,
    aws_db_subnet_group: DATABASE_ICONS.RDS,
    aws_db_parameter_group: DATABASE_ICONS.RDS,
    aws_dynamodb_table: DATABASE_ICONS.DYNAMODB,
    aws_elasticache_cluster: DATABASE_ICONS.ELASTICACHE,
    aws_elasticache_replication_group: DATABASE_ICONS.ELASTICACHE,
    aws_redshift_cluster: DATABASE_ICONS.REDSHIFT,
    aws_docdb_cluster: DATABASE_ICONS.DOCUMENTDB,

    // Messaging
    aws_sns_topic: MESSAGING_ICONS.SNS,
    aws_sns_topic_subscription: MESSAGING_ICONS.SNS,
    aws_sqs_queue: MESSAGING_ICONS.SQS,

    // Management
    aws_cloudwatch_log_group: MANAGEMENT_ICONS.CLOUDWATCH_LOGS,
    aws_cloudwatch_event_rule: MESSAGING_ICONS.EVENTBRIDGE,
    aws_cloudwatch_metric_alarm: MANAGEMENT_ICONS.CLOUDWATCH,
    aws_ssm_parameter: MANAGEMENT_ICONS.CLOUDWATCH,

    // Developer Tools
    aws_codepipeline: DEVELOPER_TOOLS_ICONS.CODEPIPELINE,
    aws_codebuild_project: DEVELOPER_TOOLS_ICONS.CODEBUILD,

    // Analytics
    aws_kinesis_stream: ANALYTICS_ICONS.KINESIS,
    aws_kinesis_firehose_delivery_stream: ANALYTICS_ICONS.KINESIS_FIREHOSE,
    aws_athena_workgroup: ANALYTICS_ICONS.ATHENA,
    aws_glue_catalog_database: ANALYTICS_ICONS.GLUE,

    // Machine Learning
    aws_sagemaker_notebook_instance: MACHINE_LEARNING_ICONS.SAGEMAKER,
    aws_sagemaker_endpoint: MACHINE_LEARNING_ICONS.SAGEMAKER,

    // Serverless
    aws_lambda_permission: SERVERLESS_ICONS.LAMBDA,
    aws_lambda_event_source_mapping: SERVERLESS_ICONS.LAMBDA,
    aws_sfn_state_machine: SERVERLESS_ICONS.STEP_FUNCTIONS,

    // New Compute/Container resources
    aws_key_pair: COMPUTE_ICONS.EC2,
    aws_placement_group: COMPUTE_ICONS.EC2,
    aws_ecs_capacity_provider: CONTAINER_ICONS.ECS,
    aws_eks_addon: CONTAINER_ICONS.EKS,
    aws_eks_fargate_profile: CONTAINER_ICONS.FARGATE,
  };

  return iconMap[terraformResource] || COMPUTE_ICONS.EC2;
}
