/**
 * GCP Cloud Build Trigger Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { DEVELOPER_TOOLS_ICONS } from '../icons';

export const gcpCloudBuildTrigger: ServiceDefinition = {
  id: 'cloudbuild_trigger',
  terraform_resource: 'google_cloudbuild_trigger',
  name: 'Cloud Build Trigger',
  description: 'Configuration for an automated build in response to source repository changes',
  icon: DEVELOPER_TOOLS_ICONS.CLOUD_BUILD,
  category: 'developer-tools',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the trigger',
        example: 'my-build-trigger',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project in which the resource belongs',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Human-readable description of the trigger',
        group: 'basic',
      },
      {
        name: 'disabled',
        type: 'bool',
        description: 'Whether the trigger is disabled or not',
        default: false,
        group: 'basic',
      },
      {
        name: 'filename',
        type: 'string',
        description: 'Path, from the source root, to a file whose contents is used for the template',
        group: 'basic',
      },
      {
        name: 'ignored_files',
        type: 'list(string)',
        description: 'ignoredFiles and includedFiles are file glob matches extended with support for ** in the directory portion',
        group: 'advanced',
      },
      {
        name: 'included_files',
        type: 'list(string)',
        description: 'If any of the files altered in the commit pass the ignoredFiles filter and includedFiles is not empty, then we make sure that at least one of those files matches',
        group: 'advanced',
      },
      {
        name: 'substitutions',
        type: 'map(string)',
        description: 'Substitutions data for Build resource',
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'list(string)',
        description: 'Tags for annotation of a BuildTrigger',
        group: 'basic',
      },
      {
        name: 'service_account',
        type: 'string',
        description: 'The service account used for all user-controlled operations',
        group: 'security',
      },
    ],
    blocks: [
      {
        name: 'trigger_template',
        description: 'Template describing the types of source changes to trigger a build',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'project_id',
            type: 'string',
            description: 'ID of the project that owns the Cloud Source Repository',
          },
          {
            name: 'repo_name',
            type: 'string',
            description: 'Name of the Cloud Source Repository',
          },
          {
            name: 'branch_name',
            type: 'string',
            description: 'Name of the branch to build',
          },
          {
            name: 'tag_name',
            type: 'string',
            description: 'Name of the tag to build',
          },
          {
            name: 'commit_sha',
            type: 'string',
            description: 'Explicit commit SHA to build',
          },
          {
            name: 'dir',
            type: 'string',
            description: 'Directory, relative to the source root, in which to run the build',
          },
          {
            name: 'invert_regex',
            type: 'bool',
            description: 'Only trigger a build if the revision regex does NOT match the revision regex',
          },
        ],
      },
      {
        name: 'github',
        description: 'Describes the configuration of a trigger that creates a build whenever a GitHub event is received',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'owner',
            type: 'string',
            description: 'Owner of the repository',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Name of the repository',
          },
          {
            name: 'pull_request',
            type: 'string',
            description: 'filter to match changes in pull requests (branch pattern)',
          },
          {
            name: 'push',
            type: 'string',
            description: 'filter to match changes in refs, like branches or tags (branch pattern)',
          },
        ],
      },
      {
        name: 'build',
        description: 'Contents of the build template',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'images',
            type: 'list(string)',
            description: 'A list of images to be pushed upon the successful completion of all build steps',
          },
          {
            name: 'tags',
            type: 'list(string)',
            description: 'Tags for annotation of a Build',
          },
          {
            name: 'timeout',
            type: 'string',
            description: 'Amount of time that this build should be allowed to run',
            default: '600s',
          },
          {
            name: 'queue_ttl',
            type: 'string',
            description: 'TTL in queue for this build',
          },
          {
            name: 'logs_bucket',
            type: 'string',
            description: 'Google Cloud Storage bucket where logs should be written',
          },
          {
            name: 'substitutions',
            type: 'map(string)',
            description: 'Substitutions data for Build resource',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'trigger_id', type: 'string', description: 'The unique identifier for the trigger' },
    { name: 'create_time', type: 'string', description: 'Time when the trigger was created' },
  ],

  terraform: {
    resourceType: 'google_cloudbuild_trigger',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      trigger_id: 'trigger_id',
    },
  },
};
