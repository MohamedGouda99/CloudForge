/**
 * AWS Cognito User Pool Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool
 */

import type { ServiceDefinition } from '../../types';
import { SECURITY_ICONS } from '../icons';

export const awsCognitoUserPool: ServiceDefinition = {
  id: 'cognito_user_pool',
  terraform_resource: 'aws_cognito_user_pool',
  name: 'Cognito User Pool',
  description: 'User directory for authentication, user management, and social identity providers',
  icon: SECURITY_ICONS.COGNITO,
  category: 'security',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the user pool',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'alias_attributes',
        type: 'set(string)',
        description: 'Attributes supported as aliases (conflicts with username_attributes)',
        options: ['email', 'phone_number', 'preferred_username'],
        group: 'basic',
      },
      {
        name: 'username_attributes',
        type: 'set(string)',
        description: 'Attributes for username (conflicts with alias_attributes)',
        options: ['email', 'phone_number'],
        group: 'basic',
      },
      {
        name: 'auto_verified_attributes',
        type: 'set(string)',
        description: 'Attributes to auto-verify',
        options: ['email', 'phone_number'],
        group: 'basic',
      },
      {
        name: 'mfa_configuration',
        type: 'string',
        description: 'Multi-Factor Authentication configuration',
        default: 'OFF',
        options: ['OFF', 'ON', 'OPTIONAL'],
        group: 'security',
      },
      {
        name: 'sms_authentication_message',
        type: 'string',
        description: 'SMS message for MFA code (must contain {####})',
        example: 'Your verification code is {####}',
        group: 'advanced',
      },
      {
        name: 'email_verification_subject',
        type: 'string',
        description: 'Subject of the email verification message',
        group: 'advanced',
      },
      {
        name: 'email_verification_message',
        type: 'string',
        description: 'Email verification message (must contain {####})',
        group: 'advanced',
      },
      {
        name: 'sms_verification_message',
        type: 'string',
        description: 'SMS verification message (must contain {####})',
        group: 'advanced',
      },
      {
        name: 'deletion_protection',
        type: 'string',
        description: 'Delete protection setting',
        default: 'INACTIVE',
        options: ['ACTIVE', 'INACTIVE'],
        group: 'security',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the user pool',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'password_policy',
        description: 'Password strength and requirements',
        required: false,
        multiple: false,
        attributes: [
          { name: 'minimum_length', type: 'number', description: 'Minimum password length (6-99)', default: 8, validation: { min: 6, max: 99 } },
          { name: 'require_lowercase', type: 'bool', description: 'Require lowercase letters', default: true },
          { name: 'require_uppercase', type: 'bool', description: 'Require uppercase letters', default: true },
          { name: 'require_numbers', type: 'bool', description: 'Require numbers', default: true },
          { name: 'require_symbols', type: 'bool', description: 'Require special characters', default: true },
          { name: 'temporary_password_validity_days', type: 'number', description: 'Days until temporary password expires', default: 7 },
          { name: 'password_history_size', type: 'number', description: 'Number of previous passwords to check (0-24)', validation: { min: 0, max: 24 } },
        ],
      },
      {
        name: 'lambda_config',
        description: 'Lambda trigger configurations',
        required: false,
        multiple: false,
        attributes: [
          { name: 'pre_sign_up', type: 'string', description: 'Pre sign-up Lambda ARN' },
          { name: 'pre_authentication', type: 'string', description: 'Pre authentication Lambda ARN' },
          { name: 'post_authentication', type: 'string', description: 'Post authentication Lambda ARN' },
          { name: 'post_confirmation', type: 'string', description: 'Post confirmation Lambda ARN' },
          { name: 'pre_token_generation', type: 'string', description: 'Pre token generation Lambda ARN' },
          { name: 'pre_token_generation_config', type: 'object', description: 'Pre token generation config' },
          { name: 'user_migration', type: 'string', description: 'User migration Lambda ARN' },
          { name: 'define_auth_challenge', type: 'string', description: 'Define auth challenge Lambda ARN' },
          { name: 'create_auth_challenge', type: 'string', description: 'Create auth challenge Lambda ARN' },
          { name: 'verify_auth_challenge_response', type: 'string', description: 'Verify auth challenge Lambda ARN' },
          { name: 'custom_message', type: 'string', description: 'Custom message Lambda ARN' },
          { name: 'custom_email_sender', type: 'object', description: 'Custom email sender config' },
          { name: 'custom_sms_sender', type: 'object', description: 'Custom SMS sender config' },
          { name: 'kms_key_id', type: 'string', description: 'KMS key ID for custom sender encryption' },
        ],
      },
      {
        name: 'schema',
        description: 'User attribute schema definitions',
        required: false,
        multiple: true,
        attributes: [
          { name: 'name', type: 'string', description: 'Attribute name' },
          { name: 'attribute_data_type', type: 'string', description: 'Data type', options: ['Boolean', 'DateTime', 'Number', 'String'] },
          { name: 'developer_only_attribute', type: 'bool', description: 'Developer only attribute', default: false },
          { name: 'mutable', type: 'bool', description: 'Whether attribute can be changed', default: true },
          { name: 'required', type: 'bool', description: 'Whether attribute is required', default: false },
          { name: 'string_attribute_constraints', type: 'object', description: 'String constraints (min_length, max_length)' },
          { name: 'number_attribute_constraints', type: 'object', description: 'Number constraints (min_value, max_value)' },
        ],
      },
      {
        name: 'admin_create_user_config',
        description: 'Admin user creation settings',
        required: false,
        multiple: false,
        attributes: [
          { name: 'allow_admin_create_user_only', type: 'bool', description: 'Only admins can create users', default: false },
          { name: 'invite_message_template', type: 'object', description: 'Invitation message template' },
        ],
      },
      {
        name: 'device_configuration',
        description: 'Device tracking configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'challenge_required_on_new_device', type: 'bool', description: 'Require challenge on new device' },
          { name: 'device_only_remembered_on_user_prompt', type: 'bool', description: 'Only remember device on user prompt' },
        ],
      },
      {
        name: 'email_configuration',
        description: 'Email sending configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'configuration_set', type: 'string', description: 'SES configuration set name' },
          { name: 'email_sending_account', type: 'string', description: 'Email sending account type', options: ['COGNITO_DEFAULT', 'DEVELOPER'] },
          { name: 'from_email_address', type: 'string', description: 'FROM email address' },
          { name: 'reply_to_email_address', type: 'string', description: 'REPLY-TO email address' },
          { name: 'source_arn', type: 'string', description: 'SES verified identity ARN' },
        ],
      },
      {
        name: 'sms_configuration',
        description: 'SMS sending configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'external_id', type: 'string', description: 'External ID for IAM role' },
          { name: 'sns_caller_arn', type: 'string', description: 'SNS caller IAM role ARN' },
          { name: 'sns_region', type: 'string', description: 'SNS region for SMS' },
        ],
      },
      {
        name: 'software_token_mfa_configuration',
        description: 'Software token MFA settings',
        required: false,
        multiple: false,
        attributes: [
          { name: 'enabled', type: 'bool', description: 'Enable software token MFA' },
        ],
      },
      {
        name: 'user_attribute_update_settings',
        description: 'User attribute update settings',
        required: false,
        multiple: false,
        attributes: [
          { name: 'attributes_require_verification_before_update', type: 'set(string)', description: 'Attributes requiring verification before update', options: ['email', 'phone_number'] },
        ],
      },
      {
        name: 'user_pool_add_ons',
        description: 'Advanced security features',
        required: false,
        multiple: false,
        attributes: [
          { name: 'advanced_security_mode', type: 'string', description: 'Advanced security mode', options: ['AUDIT', 'ENFORCED', 'OFF'] },
        ],
      },
      {
        name: 'username_configuration',
        description: 'Username configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'case_sensitive', type: 'bool', description: 'Case sensitive usernames', default: true },
        ],
      },
      {
        name: 'verification_message_template',
        description: 'Verification message templates',
        required: false,
        multiple: false,
        attributes: [
          { name: 'default_email_option', type: 'string', description: 'Default email verification option', options: ['CONFIRM_WITH_CODE', 'CONFIRM_WITH_LINK'] },
          { name: 'email_message', type: 'string', description: 'Email message template' },
          { name: 'email_message_by_link', type: 'string', description: 'Email message for link verification' },
          { name: 'email_subject', type: 'string', description: 'Email subject' },
          { name: 'email_subject_by_link', type: 'string', description: 'Email subject for link verification' },
          { name: 'sms_message', type: 'string', description: 'SMS message template' },
        ],
      },
      {
        name: 'account_recovery_setting',
        description: 'Account recovery options',
        required: false,
        multiple: false,
        attributes: [
          { name: 'recovery_mechanism', type: 'object', description: 'Recovery mechanisms with priority and name' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'User pool ID' },
    { name: 'arn', type: 'string', description: 'ARN of the user pool' },
    { name: 'endpoint', type: 'string', description: 'User pool endpoint URL' },
    { name: 'domain', type: 'string', description: 'User pool domain' },
    { name: 'custom_domain', type: 'string', description: 'Custom domain if configured' },
    { name: 'creation_date', type: 'string', description: 'Creation date' },
    { name: 'last_modified_date', type: 'string', description: 'Last modified date' },
    { name: 'estimated_number_of_users', type: 'number', description: 'Estimated number of users' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_cognito_user_pool',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      endpoint: 'endpoint',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_lambda_function',
        apply: [],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_kms_key',
        apply: [],
      },
    ],
    validChildren: [
      {
        childTypes: ['aws_cognito_user_pool_client', 'aws_cognito_user_pool_domain', 'aws_cognito_identity_provider'],
        description: 'User pool clients and identity providers',
      },
    ],
  },
};
