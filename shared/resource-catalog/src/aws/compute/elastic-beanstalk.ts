/**
 * AWS Elastic Beanstalk Application Resource Definition
 *
 * Complete schema for aws_elastic_beanstalk_application based on Terraform AWS Provider 5.x
 */

import type { ServiceDefinition } from '../../types';
import { COMPUTE_ICONS } from '../icons';

export const awsElasticBeanstalkApplication: ServiceDefinition = {
  id: 'elastic_beanstalk_application',
  terraform_resource: 'aws_elastic_beanstalk_application',
  name: 'Elastic Beanstalk Application',
  description: 'Container for Elastic Beanstalk environments that run your application',
  icon: COMPUTE_ICONS.ELASTIC_BEANSTALK,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the application',
        validation: {
          minLength: 1,
          maxLength: 100,
        },
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the application',
        validation: { maxLength: 200 },
        group: 'basic',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the application',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'appversion_lifecycle',
        description: 'Application version lifecycle configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'service_role',
            type: 'string',
            description: 'IAM service role ARN for application version lifecycle',
          },
          {
            name: 'max_count',
            type: 'number',
            description: 'Maximum number of application versions to retain',
            validation: { min: 1, max: 1000 },
          },
          {
            name: 'max_age_in_days',
            type: 'number',
            description: 'Maximum age in days to retain application versions',
            validation: { min: 1, max: 180 },
          },
          {
            name: 'delete_source_from_s3',
            type: 'bool',
            description: 'Delete source bundle from S3 when deleting version',
            default: false,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'arn', type: 'string', description: 'ARN of the Beanstalk application' },
    { name: 'name', type: 'string', description: 'Name of the application' },
  ],

  terraform: {
    resourceType: 'aws_elastic_beanstalk_application',
    requiredArgs: ['name'],
    referenceableAttrs: {
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {},
};
