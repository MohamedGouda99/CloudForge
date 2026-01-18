/**
 * AWS CodePipeline Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DEVELOPER_TOOLS_ICONS } from '../icons';

export const awsCodepipeline: ServiceDefinition = {
  id: 'codepipeline',
  terraform_resource: 'aws_codepipeline',
  name: 'CodePipeline',
  description: 'Continuous delivery service for CI/CD pipelines',
  icon: DEVELOPER_TOOLS_ICONS.CODEPIPELINE,
  category: 'developer-tools',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the pipeline',
        validation: { pattern: '^[a-zA-Z0-9_-]+$', maxLength: 100 },
        group: 'basic',
      },
      {
        name: 'role_arn',
        type: 'string',
        description: 'IAM role ARN for the pipeline',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'artifact_store',
        description: 'Artifact store configuration',
        required: true,
        multiple: false,
        attributes: [
          { name: 'location', type: 'string', description: 'S3 bucket name' },
          { name: 'type', type: 'string', description: 'Store type', default: 'S3' },
          { name: 'encryption_key', type: 'string', description: 'KMS key ARN' },
        ],
      },
      {
        name: 'stage',
        description: 'Pipeline stages',
        required: true,
        multiple: true,
        attributes: [
          { name: 'name', type: 'string', description: 'Stage name' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Pipeline name' },
    { name: 'arn', type: 'string', description: 'ARN of the pipeline' },
    { name: 'name', type: 'string', description: 'Pipeline name' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_codepipeline',
    requiredArgs: ['name', 'role_arn'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
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
    ],
  },
};
