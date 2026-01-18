/**
 * GCP Service Account Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const gcpServiceAccount: ServiceDefinition = {
  id: 'service_account',
  terraform_resource: 'google_service_account',
  name: 'Service Account',
  description: 'Allows management of a Google Cloud service account',
  icon: SECURITY_ICONS.IAM,
  category: 'security',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'account_id',
        type: 'string',
        description: 'The account id that is used to generate the service account email address',
        example: 'my-service-account',
        group: 'basic',
      },
    ],
    optional: [
      {
        name: 'display_name',
        type: 'string',
        description: 'The display name for the service account',
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'A text description of the service account',
        group: 'basic',
      },
      {
        name: 'project',
        type: 'string',
        description: 'The ID of the project that the service account will be created in',
        group: 'basic',
      },
      {
        name: 'disabled',
        type: 'bool',
        description: 'Whether the service account is disabled',
        default: false,
        group: 'advanced',
      },
    ],
    blocks: [],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'The identifier of the resource' },
    { name: 'email', type: 'string', description: 'The e-mail address of the service account' },
    { name: 'name', type: 'string', description: 'The fully-qualified name of the service account' },
    { name: 'unique_id', type: 'string', description: 'The unique id of the service account' },
    { name: 'member', type: 'string', description: 'The Identity of the service account in the form serviceAccount:{email}' },
  ],

  terraform: {
    resourceType: 'google_service_account',
    requiredArgs: ['account_id'],
    referenceableAttrs: {
      id: 'id',
      email: 'email',
      name: 'name',
    },
  },
};
