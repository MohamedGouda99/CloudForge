/**
 * AWS Machine Learning Services Data - Complete definitions from machine-learning.json
 * This file contains ALL 11 machine learning services with ALL their properties
 * 
 * Services included:
 * 1. SageMaker Domain (aws_sagemaker_domain)
 * 2. SageMaker User Profile (aws_sagemaker_user_profile)
 * 3. SageMaker Notebook Instance (aws_sagemaker_notebook_instance)
 * 4. SageMaker Model (aws_sagemaker_model)
 * 5. SageMaker Endpoint Configuration (aws_sagemaker_endpoint_configuration)
 * 6. SageMaker Endpoint (aws_sagemaker_endpoint)
 * 7. Bedrock Custom Model (aws_bedrock_custom_model)
 * 8. Comprehend Entity Recognizer (aws_comprehend_entity_recognizer)
 * 9. Lex Bot (aws_lexv2models_bot)
 * 10. Transcribe Custom Vocabulary (aws_transcribe_vocabulary)
 * 11. Rekognition Collection (aws_rekognition_collection)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Machine Learning service icon mappings - using actual AWS Architecture icons
export const MACHINE_LEARNING_ICONS: Record<string, string> = {
  'aws_sagemaker_domain': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-AI_64.svg',
  'aws_sagemaker_user_profile': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-AI_64.svg',
  'aws_sagemaker_notebook_instance': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-Studio-Lab_64.svg',
  'aws_sagemaker_model': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-AI_64.svg',
  'aws_sagemaker_endpoint_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-AI_64.svg',
  'aws_sagemaker_endpoint': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-SageMaker-AI_64.svg',
  'aws_bedrock_custom_model': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-Bedrock_64.svg',
  'aws_comprehend_entity_recognizer': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-Comprehend_64.svg',
  'aws_lexv2models_bot': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-Lex_64.svg',
  'aws_transcribe_vocabulary': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-Transcribe_64.svg',
  'aws_rekognition_collection': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/64/Arch_Amazon-Rekognition_64.svg',
};

// Machine Learning service definition interface
export interface MachineLearningServiceDefinition {
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}

// Complete machine learning services data from machine-learning.json
export const MACHINE_LEARNING_SERVICES: MachineLearningServiceDefinition[] = [
  {
    id: "sagemaker_domain",
    name: "SageMaker Domain",
    description: "ML workspace environment",
    terraform_resource: "aws_sagemaker_domain",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_domain'],
    inputs: {
      required: [
        { name: "domain_name", type: "string", description: "Domain name" },
        { name: "auth_mode", type: "string", description: "Authentication mode", options: ["SSO", "IAM"] },
        { name: "vpc_id", type: "string", description: "VPC ID", reference: "aws_vpc.id" },
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "app_network_access_type", type: "string", description: "App network access type", options: ["PublicInternetOnly", "VpcOnly"] },
        { name: "app_security_group_management", type: "string", description: "Security group management", options: ["Service", "Customer"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "default_user_settings",
          attributes: [
            { name: "execution_role", type: "string", required: true },
            { name: "security_groups", type: "list(string)" }
          ]
        },
        {
          name: "retention_policy",
          attributes: [
            { name: "home_efs_file_system", type: "string", options: ["Retain", "Delete"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Domain ID" },
      { name: "arn", type: "string", description: "Domain ARN" },
      { name: "home_efs_file_system_id", type: "string", description: "Home EFS file system ID" },
      { name: "url", type: "string", description: "Domain URL" }
    ]
  },
  {
    id: "sagemaker_user_profile",
    name: "SageMaker User Profile",
    description: "User profile in SageMaker domain",
    terraform_resource: "aws_sagemaker_user_profile",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_user_profile'],
    inputs: {
      required: [
        { name: "domain_id", type: "string", description: "Domain ID", reference: "aws_sagemaker_domain.id" },
        { name: "user_profile_name", type: "string", description: "User profile name" }
      ],
      optional: [
        { name: "single_sign_on_user_identifier", type: "string", description: "SSO user identifier" },
        { name: "single_sign_on_user_value", type: "string", description: "SSO user value" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "user_settings",
          attributes: [
            { name: "execution_role", type: "string" },
            { name: "security_groups", type: "list(string)" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "User profile ID" },
      { name: "arn", type: "string", description: "User profile ARN" },
      { name: "home_efs_file_system_uid", type: "string", description: "Home EFS UID" }
    ]
  },
  {
    id: "sagemaker_notebook_instance",
    name: "SageMaker Notebook Instance",
    description: "Managed Jupyter notebook",
    terraform_resource: "aws_sagemaker_notebook_instance",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_notebook_instance'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Notebook instance name" },
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" },
        { name: "instance_type", type: "string", description: "Instance type" }
      ],
      optional: [
        { name: "accelerator_types", type: "list(string)", description: "Accelerator types" },
        { name: "additional_code_repositories", type: "list(string)", description: "Additional code repositories" },
        { name: "default_code_repository", type: "string", description: "Default code repository" },
        { name: "direct_internet_access", type: "string", description: "Direct internet access", options: ["Enabled", "Disabled"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "lifecycle_config_name", type: "string", description: "Lifecycle config name" },
        { name: "platform_identifier", type: "string", description: "Platform identifier" },
        { name: "root_access", type: "string", description: "Root access", options: ["Enabled", "Disabled"] },
        { name: "security_groups", type: "list(string)", description: "Security group IDs" },
        { name: "subnet_id", type: "string", description: "Subnet ID" },
        { name: "volume_size", type: "number", description: "Volume size in GB" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Notebook instance ID" },
      { name: "arn", type: "string", description: "Notebook instance ARN" },
      { name: "network_interface_id", type: "string", description: "Network interface ID" },
      { name: "url", type: "string", description: "Notebook instance URL" }
    ]
  },
  {
    id: "sagemaker_model",
    name: "SageMaker Model",
    description: "ML model for inference",
    terraform_resource: "aws_sagemaker_model",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_model'],
    inputs: {
      required: [
        { name: "execution_role_arn", type: "string", description: "Execution role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "name", type: "string", description: "Model name" },
        { name: "enable_network_isolation", type: "bool", description: "Enable network isolation" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "primary_container",
          attributes: [
            { name: "container_hostname", type: "string" },
            { name: "environment", type: "map(string)" },
            { name: "image", type: "string" },
            { name: "mode", type: "string", options: ["SingleModel", "MultiModel"] },
            { name: "model_data_url", type: "string" },
            { name: "model_package_name", type: "string" }
          ]
        },
        {
          name: "container",
          multiple: true,
          attributes: [
            { name: "container_hostname", type: "string" },
            { name: "environment", type: "map(string)" },
            { name: "image", type: "string" },
            { name: "mode", type: "string" },
            { name: "model_data_url", type: "string" },
            { name: "model_package_name", type: "string" }
          ]
        },
        {
          name: "inference_execution_config",
          attributes: [
            { name: "mode", type: "string", required: true, options: ["Serial", "Direct"] }
          ]
        },
        {
          name: "vpc_config",
          attributes: [
            { name: "security_group_ids", type: "list(string)", required: true },
            { name: "subnets", type: "list(string)", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Model ID" },
      { name: "arn", type: "string", description: "Model ARN" },
      { name: "name", type: "string", description: "Model name" }
    ]
  },
  {
    id: "sagemaker_endpoint_configuration",
    name: "SageMaker Endpoint Configuration",
    description: "Endpoint configuration for deployment",
    terraform_resource: "aws_sagemaker_endpoint_configuration",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_endpoint_configuration'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Configuration name" },
        { name: "name_prefix", type: "string", description: "Name prefix" },
        { name: "kms_key_arn", type: "string", description: "KMS key ARN" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "production_variants",
          multiple: true,
          attributes: [
            { name: "model_name", type: "string", required: true },
            { name: "variant_name", type: "string" },
            { name: "accelerator_type", type: "string" },
            { name: "initial_instance_count", type: "number" },
            { name: "initial_variant_weight", type: "number" },
            { name: "instance_type", type: "string" },
            { name: "volume_size_in_gb", type: "number" }
          ]
        },
        {
          name: "data_capture_config",
          attributes: [
            { name: "destination_s3_uri", type: "string", required: true },
            { name: "initial_sampling_percentage", type: "number", required: true },
            { name: "enable_capture", type: "bool" },
            { name: "kms_key_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Configuration ARN" },
      { name: "name", type: "string", description: "Configuration name" }
    ]
  },
  {
    id: "sagemaker_endpoint",
    name: "SageMaker Endpoint",
    description: "Real-time inference endpoint",
    terraform_resource: "aws_sagemaker_endpoint",
    icon: MACHINE_LEARNING_ICONS['aws_sagemaker_endpoint'],
    inputs: {
      required: [
        { name: "endpoint_config_name", type: "string", description: "Endpoint configuration name", reference: "aws_sagemaker_endpoint_configuration.name" }
      ],
      optional: [
        { name: "name", type: "string", description: "Endpoint name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "deployment_config",
          description: "Deployment configuration",
          attributes: []
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Endpoint ID" },
      { name: "arn", type: "string", description: "Endpoint ARN" },
      { name: "name", type: "string", description: "Endpoint name" }
    ]
  },
  {
    id: "bedrock_custom_model",
    name: "Bedrock Custom Model",
    description: "Custom foundation model",
    terraform_resource: "aws_bedrock_custom_model",
    icon: MACHINE_LEARNING_ICONS['aws_bedrock_custom_model'],
    inputs: {
      required: [
        { name: "custom_model_name", type: "string", description: "Custom model name" },
        { name: "base_model_identifier", type: "string", description: "Base model identifier" },
        { name: "job_name", type: "string", description: "Training job name" },
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "custom_model_kms_key_id", type: "string", description: "KMS key ID" },
        { name: "customization_type", type: "string", description: "Customization type", options: ["FINE_TUNING", "CONTINUED_PRE_TRAINING"] },
        { name: "hyperparameters", type: "map(string)", description: "Hyperparameters" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "output_data_config",
          attributes: [
            { name: "s3_uri", type: "string", required: true }
          ]
        },
        {
          name: "training_data_config",
          attributes: [
            { name: "s3_uri", type: "string", required: true }
          ]
        },
        {
          name: "vpc_config",
          attributes: [
            { name: "security_group_ids", type: "list(string)", required: true },
            { name: "subnet_ids", type: "list(string)", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "custom_model_arn", type: "string", description: "Custom model ARN" },
      { name: "id", type: "string", description: "Custom model ID" },
      { name: "job_arn", type: "string", description: "Training job ARN" },
      { name: "job_status", type: "string", description: "Training job status" }
    ]
  },
  {
    id: "comprehend_entity_recognizer",
    name: "Comprehend Entity Recognizer",
    description: "Custom NLP entity recognition",
    terraform_resource: "aws_comprehend_entity_recognizer",
    icon: MACHINE_LEARNING_ICONS['aws_comprehend_entity_recognizer'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Recognizer name" },
        { name: "data_access_role_arn", type: "string", description: "Data access role ARN", reference: "aws_iam_role.arn" },
        { name: "language_code", type: "string", description: "Language code", options: ["en", "es", "fr", "de", "it", "pt", "ar", "hi", "ja", "ko", "zh", "zh-TW"] }
      ],
      optional: [
        { name: "model_kms_key_id", type: "string", description: "Model KMS key ID" },
        { name: "version_name", type: "string", description: "Version name" },
        { name: "version_name_prefix", type: "string", description: "Version name prefix" },
        { name: "volume_kms_key_id", type: "string", description: "Volume KMS key ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "input_data_config",
          attributes: [
            { name: "data_format", type: "string", options: ["COMPREHEND_CSV", "AUGMENTED_MANIFEST"] }
          ]
        },
        {
          name: "vpc_config",
          attributes: [
            { name: "security_group_ids", type: "list(string)", required: true },
            { name: "subnets", type: "list(string)", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Recognizer ARN" },
      { name: "id", type: "string", description: "Recognizer ID" }
    ]
  },
  {
    id: "lex_bot",
    name: "Lex Bot",
    description: "Conversational AI bot",
    terraform_resource: "aws_lexv2models_bot",
    icon: MACHINE_LEARNING_ICONS['aws_lexv2models_bot'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Bot name" },
        { name: "idle_session_ttl_in_seconds", type: "number", description: "Idle session TTL" },
        { name: "role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "description", type: "string", description: "Bot description" },
        { name: "test_bot_alias_tags", type: "map(string)", description: "Test bot alias tags" },
        { name: "type", type: "string", description: "Bot type", options: ["Bot", "BotNetwork"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "data_privacy",
          attributes: [
            { name: "child_directed", type: "bool", required: true }
          ]
        },
        {
          name: "members",
          multiple: true,
          attributes: [
            { name: "alias_id", type: "string", required: true },
            { name: "alias_name", type: "string", required: true },
            { name: "id", type: "string", required: true },
            { name: "name", type: "string", required: true },
            { name: "version", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Bot ARN" },
      { name: "id", type: "string", description: "Bot ID" }
    ]
  },
  {
    id: "transcribe_vocabulary",
    name: "Transcribe Custom Vocabulary",
    description: "Custom vocabulary for speech recognition",
    terraform_resource: "aws_transcribe_vocabulary",
    icon: MACHINE_LEARNING_ICONS['aws_transcribe_vocabulary'],
    inputs: {
      required: [
        { name: "vocabulary_name", type: "string", description: "Vocabulary name" },
        { name: "language_code", type: "string", description: "Language code", options: ["en-US", "en-GB", "es-US", "fr-FR", "de-DE", "it-IT", "pt-BR", "ja-JP", "ko-KR", "zh-CN"] }
      ],
      optional: [
        { name: "phrases", type: "list(string)", description: "Vocabulary phrases" },
        { name: "vocabulary_file_uri", type: "string", description: "S3 URI for vocabulary file" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Vocabulary ARN" },
      { name: "download_uri", type: "string", description: "Download URI" },
      { name: "id", type: "string", description: "Vocabulary ID" }
    ]
  },
  {
    id: "rekognition_collection",
    name: "Rekognition Collection",
    description: "Face collection for recognition",
    terraform_resource: "aws_rekognition_collection",
    icon: MACHINE_LEARNING_ICONS['aws_rekognition_collection'],
    inputs: {
      required: [
        { name: "collection_id", type: "string", description: "Collection ID" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Collection ARN" },
      { name: "face_model_version", type: "string", description: "Face model version" },
      { name: "id", type: "string", description: "Collection ID" }
    ]
  }
];

// List of all machine learning terraform resource types
export const MACHINE_LEARNING_TERRAFORM_RESOURCES = MACHINE_LEARNING_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getMachineLearningServiceByTerraformResource(terraformResource: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getMachineLearningServiceById(id: string): MachineLearningServiceDefinition | undefined {
  return MACHINE_LEARNING_SERVICES.find(s => s.id === id);
}

export function isMachineLearningResource(terraformResource: string): boolean {
  return MACHINE_LEARNING_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getMachineLearningIcon(terraformResource: string): string {
  return MACHINE_LEARNING_ICONS[terraformResource] || MACHINE_LEARNING_ICONS['aws_sagemaker_domain'];
}











