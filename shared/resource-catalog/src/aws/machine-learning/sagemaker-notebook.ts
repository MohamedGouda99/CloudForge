/**
 * AWS SageMaker Notebook Instance Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sagemaker_notebook_instance
 */

import type { ServiceDefinition } from '../../types';

const ML_ICONS = {
  SAGEMAKER: '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Machine-Learning/64/Arch_Amazon-SageMaker_64.svg',
};

export const awsSagemakerNotebookInstance: ServiceDefinition = {
  id: 'sagemaker_notebook_instance',
  terraform_resource: 'aws_sagemaker_notebook_instance',
  name: 'SageMaker Notebook',
  description: 'Jupyter notebook instance for ML development',
  icon: ML_ICONS.SAGEMAKER,
  category: 'machine-learning',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the notebook instance',
        validation: { pattern: '^[a-zA-Z0-9-]+$', maxLength: 63 },
        group: 'basic',
      },
      {
        name: 'instance_type',
        type: 'string',
        description: 'Instance type for the notebook',
        example: 'ml.t3.medium',
        options: [
          'ml.t3.medium', 'ml.t3.large', 'ml.t3.xlarge', 'ml.t3.2xlarge',
          'ml.m5.xlarge', 'ml.m5.2xlarge', 'ml.m5.4xlarge',
          'ml.p3.2xlarge', 'ml.p3.8xlarge', 'ml.p3.16xlarge',
          'ml.g4dn.xlarge', 'ml.g4dn.2xlarge', 'ml.g4dn.4xlarge',
        ],
        group: 'basic',
      },
      {
        name: 'role_arn',
        type: 'string',
        description: 'IAM role ARN for the notebook instance',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'platform_identifier',
        type: 'string',
        description: 'Platform identifier',
        default: 'notebook-al2-v2',
        options: ['notebook-al1-v1', 'notebook-al2-v1', 'notebook-al2-v2'],
        group: 'basic',
      },
      {
        name: 'volume_size',
        type: 'number',
        description: 'EBS volume size in GB',
        default: 5,
        validation: { min: 5, max: 16384 },
        group: 'basic',
      },
      {
        name: 'subnet_id',
        type: 'string',
        description: 'Subnet ID for VPC configuration',
        reference: 'aws_subnet.id',
        group: 'networking',
      },
      {
        name: 'security_groups',
        type: 'list(string)',
        description: 'Security group IDs',
        reference: 'aws_security_group.id',
        group: 'networking',
      },
      {
        name: 'kms_key_id',
        type: 'string',
        description: 'KMS key ID for EBS volume encryption',
        reference: 'aws_kms_key.arn',
        group: 'security',
      },
      {
        name: 'direct_internet_access',
        type: 'string',
        description: 'Direct internet access setting',
        default: 'Enabled',
        options: ['Enabled', 'Disabled'],
        group: 'networking',
      },
      {
        name: 'root_access',
        type: 'string',
        description: 'Root access to the notebook instance',
        default: 'Enabled',
        options: ['Enabled', 'Disabled'],
        group: 'security',
      },
      {
        name: 'lifecycle_config_name',
        type: 'string',
        description: 'Name of the lifecycle configuration',
        group: 'advanced',
      },
      {
        name: 'default_code_repository',
        type: 'string',
        description: 'Default Git repository URL',
        group: 'advanced',
      },
      {
        name: 'additional_code_repositories',
        type: 'list(string)',
        description: 'Additional Git repository URLs',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the notebook instance',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'instance_metadata_service_configuration',
        description: 'IMDS configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'minimum_instance_metadata_service_version',
            type: 'string',
            description: 'Minimum IMDS version',
            default: '1',
            options: ['1', '2'],
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Notebook instance name' },
    { name: 'arn', type: 'string', description: 'ARN of the notebook instance' },
    { name: 'url', type: 'string', description: 'URL to access the notebook' },
    { name: 'network_interface_id', type: 'string', description: 'Network interface ID' },
  ],

  terraform: {
    resourceType: 'aws_sagemaker_notebook_instance',
    requiredArgs: ['name', 'instance_type', 'role_arn'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_iam_role',
        apply: [{ setArg: 'role_arn', toTargetAttr: 'arn' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_groups', toTargetAttr: 'id' }],
      },
    ],
  },
};
