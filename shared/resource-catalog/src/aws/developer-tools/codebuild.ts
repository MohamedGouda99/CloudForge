/**
 * AWS CodeBuild Project Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DEVELOPER_TOOLS_ICONS } from '../icons';

export const awsCodebuildProject: ServiceDefinition = {
  id: 'codebuild_project',
  terraform_resource: 'aws_codebuild_project',
  name: 'CodeBuild Project',
  description: 'Build project for compiling and testing code',
  icon: DEVELOPER_TOOLS_ICONS.CODEBUILD,
  category: 'developer-tools',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the build project',
        validation: { pattern: '^[a-zA-Z0-9_-]+$', maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'service_role',
        type: 'string',
        description: 'IAM service role ARN',
        reference: 'aws_iam_role.arn',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the project',
        group: 'basic',
      },
      {
        name: 'build_timeout',
        type: 'number',
        description: 'Build timeout in minutes',
        default: 60,
        validation: { min: 5, max: 480 },
        group: 'basic',
      },
      {
        name: 'queued_timeout',
        type: 'number',
        description: 'Queued timeout in minutes',
        default: 480,
        validation: { min: 5, max: 480 },
        group: 'advanced',
      },
      {
        name: 'concurrent_build_limit',
        type: 'number',
        description: 'Maximum concurrent builds',
        group: 'advanced',
      },
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
        name: 'artifacts',
        description: 'Build artifacts configuration',
        required: true,
        multiple: false,
        attributes: [
          { name: 'type', type: 'string', description: 'Artifact type', options: ['CODEPIPELINE', 'NO_ARTIFACTS', 'S3'] },
          { name: 'location', type: 'string', description: 'S3 bucket name' },
          { name: 'name', type: 'string', description: 'Artifact name' },
        ],
      },
      {
        name: 'environment',
        description: 'Build environment configuration',
        required: true,
        multiple: false,
        attributes: [
          { name: 'compute_type', type: 'string', description: 'Compute type' },
          { name: 'image', type: 'string', description: 'Docker image' },
          { name: 'type', type: 'string', description: 'Environment type' },
          { name: 'privileged_mode', type: 'bool', description: 'Enable privileged mode', default: false },
        ],
      },
      {
        name: 'source',
        description: 'Source configuration',
        required: true,
        multiple: false,
        attributes: [
          { name: 'type', type: 'string', description: 'Source type', options: ['CODECOMMIT', 'CODEPIPELINE', 'GITHUB', 'S3', 'NO_SOURCE'] },
          { name: 'location', type: 'string', description: 'Source location' },
          { name: 'buildspec', type: 'string', description: 'Buildspec file path' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Project name' },
    { name: 'arn', type: 'string', description: 'ARN of the project' },
    { name: 'name', type: 'string', description: 'Project name' },
    { name: 'badge_url', type: 'string', description: 'Build badge URL' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_codebuild_project',
    requiredArgs: ['name', 'service_role'],
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
        apply: [{ setArg: 'service_role', toTargetAttr: 'arn' }],
      },
    ],
  },
};
