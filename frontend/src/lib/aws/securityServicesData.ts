/**
 * AWS Security Services Data - Complete definitions from security.json
 * This file contains ALL 25 security services with ALL their properties
 * 
 * Services included:
 * 1. IAM User (aws_iam_user)
 * 2. IAM Group (aws_iam_group)
 * 3. IAM Role (aws_iam_role)
 * 4. IAM Policy (aws_iam_policy)
 * 5. IAM Role Policy Attachment (aws_iam_role_policy_attachment)
 * 6. IAM User Policy Attachment (aws_iam_user_policy_attachment)
 * 7. IAM Group Policy Attachment (aws_iam_group_policy_attachment)
 * 8. IAM Instance Profile (aws_iam_instance_profile)
 * 9. IAM Access Key (aws_iam_access_key)
 * 10. IAM OIDC Provider (aws_iam_openid_connect_provider)
 * 11. IAM SAML Provider (aws_iam_saml_provider)
 * 12. Cognito User Pool (aws_cognito_user_pool)
 * 13. Cognito User Pool Client (aws_cognito_user_pool_client)
 * 14. Cognito Identity Pool (aws_cognito_identity_pool)
 * 15. KMS Key (aws_kms_key)
 * 16. KMS Alias (aws_kms_alias)
 * 17. Secrets Manager Secret (aws_secretsmanager_secret)
 * 18. Secrets Manager Secret Version (aws_secretsmanager_secret_version)
 * 19. Secrets Manager Rotation (aws_secretsmanager_secret_rotation)
 * 20. ACM Certificate (aws_acm_certificate)
 * 21. ACM Certificate Validation (aws_acm_certificate_validation)
 * 22. WAFv2 Web ACL (aws_wafv2_web_acl)
 * 23. WAFv2 IP Set (aws_wafv2_ip_set)
 * 24. GuardDuty Detector (aws_guardduty_detector)
 * 25. Security Hub (aws_securityhub_account)
 * 26. Inspector (aws_inspector2_enabler)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Security service icon mappings - using actual AWS Architecture icons
export const SECURITY_ICONS: Record<string, string> = {
  'aws_iam_user': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_role': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_role_policy_attachment': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_user_policy_attachment': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_group_policy_attachment': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_instance_profile': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_access_key': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Identity-and-Access-Management_64.svg',
  'aws_iam_openid_connect_provider': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-IAM-Identity-Center_64.svg',
  'aws_iam_saml_provider': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-IAM-Identity-Center_64.svg',
  'aws_cognito_user_pool': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg',
  'aws_cognito_user_pool_client': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg',
  'aws_cognito_identity_pool': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg',
  'aws_kms_key': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Key-Management-Service_64.svg',
  'aws_kms_alias': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Key-Management-Service_64.svg',
  'aws_secretsmanager_secret': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Secrets-Manager_64.svg',
  'aws_secretsmanager_secret_version': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Secrets-Manager_64.svg',
  'aws_secretsmanager_secret_rotation': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Secrets-Manager_64.svg',
  'aws_acm_certificate': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Certificate-Manager_64.svg',
  'aws_acm_certificate_validation': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Certificate-Manager_64.svg',
  'aws_wafv2_web_acl': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-WAF_64.svg',
  'aws_wafv2_ip_set': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-WAF_64.svg',
  'aws_guardduty_detector': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-GuardDuty_64.svg',
  'aws_securityhub_account': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-Security-Hub_64.svg',
  'aws_inspector2_enabler': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-Inspector_64.svg',
};

// Security service definition interface
export interface SecurityServiceDefinition {
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

// Complete security services data from security.json
export const SECURITY_SERVICES: SecurityServiceDefinition[] = [
  {
    id: "iam_user",
    name: "IAM User",
    description: "Identity and Access Management user",
    terraform_resource: "aws_iam_user",
    icon: SECURITY_ICONS['aws_iam_user'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "User name" }
      ],
      optional: [
        { name: "path", type: "string", description: "Path for the user", default: "/" },
        { name: "permissions_boundary", type: "string", description: "Permissions boundary ARN" },
        { name: "force_destroy", type: "bool", description: "Force destroy" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "User ID" },
      { name: "arn", type: "string", description: "User ARN" },
      { name: "name", type: "string", description: "User name" },
      { name: "unique_id", type: "string", description: "Unique ID" }
    ]
  },
  {
    id: "iam_group",
    name: "IAM Group",
    description: "IAM group for users",
    terraform_resource: "aws_iam_group",
    icon: SECURITY_ICONS['aws_iam_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Group name" }
      ],
      optional: [
        { name: "path", type: "string", description: "Path for the group", default: "/" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Group ID" },
      { name: "arn", type: "string", description: "Group ARN" },
      { name: "name", type: "string", description: "Group name" },
      { name: "unique_id", type: "string", description: "Unique ID" }
    ]
  },
  {
    id: "iam_role",
    name: "IAM Role",
    description: "IAM role for AWS services",
    terraform_resource: "aws_iam_role",
    icon: SECURITY_ICONS['aws_iam_role'],
    inputs: {
      required: [
        { name: "assume_role_policy", type: "string", description: "Assume role policy document JSON" }
      ],
      optional: [
        { name: "name", type: "string", description: "Role name" },
        { name: "name_prefix", type: "string", description: "Role name prefix" },
        { name: "path", type: "string", description: "Path for the role", default: "/" },
        { name: "description", type: "string", description: "Role description" },
        { name: "max_session_duration", type: "number", description: "Maximum session duration in seconds" },
        { name: "permissions_boundary", type: "string", description: "Permissions boundary ARN" },
        { name: "force_detach_policies", type: "bool", description: "Force detach policies" },
        { name: "managed_policy_arns", type: "list(string)", description: "Managed policy ARNs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "inline_policy",
          multiple: true,
          attributes: [
            { name: "name", type: "string" },
            { name: "policy", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Role ID" },
      { name: "arn", type: "string", description: "Role ARN" },
      { name: "name", type: "string", description: "Role name" },
      { name: "unique_id", type: "string", description: "Unique ID" },
      { name: "create_date", type: "string", description: "Creation date" }
    ]
  },
  {
    id: "iam_policy",
    name: "IAM Policy",
    description: "IAM managed policy",
    terraform_resource: "aws_iam_policy",
    icon: SECURITY_ICONS['aws_iam_policy'],
    inputs: {
      required: [
        { name: "policy", type: "string", description: "Policy document JSON" }
      ],
      optional: [
        { name: "name", type: "string", description: "Policy name" },
        { name: "name_prefix", type: "string", description: "Policy name prefix" },
        { name: "path", type: "string", description: "Path for the policy", default: "/" },
        { name: "description", type: "string", description: "Policy description" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Policy ID" },
      { name: "arn", type: "string", description: "Policy ARN" },
      { name: "name", type: "string", description: "Policy name" },
      { name: "policy_id", type: "string", description: "Policy ID" },
      { name: "attachment_count", type: "number", description: "Attachment count" }
    ]
  },
  {
    id: "iam_role_policy_attachment",
    name: "IAM Role Policy Attachment",
    description: "Attach policy to IAM role",
    terraform_resource: "aws_iam_role_policy_attachment",
    icon: SECURITY_ICONS['aws_iam_role_policy_attachment'],
    inputs: {
      required: [
        { name: "role", type: "string", description: "Role name", reference: "aws_iam_role.name" },
        { name: "policy_arn", type: "string", description: "Policy ARN", reference: "aws_iam_policy.arn" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Attachment ID" }
    ]
  },
  {
    id: "iam_user_policy_attachment",
    name: "IAM User Policy Attachment",
    description: "Attach policy to IAM user",
    terraform_resource: "aws_iam_user_policy_attachment",
    icon: SECURITY_ICONS['aws_iam_user_policy_attachment'],
    inputs: {
      required: [
        { name: "user", type: "string", description: "User name", reference: "aws_iam_user.name" },
        { name: "policy_arn", type: "string", description: "Policy ARN", reference: "aws_iam_policy.arn" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Attachment ID" }
    ]
  },
  {
    id: "iam_group_policy_attachment",
    name: "IAM Group Policy Attachment",
    description: "Attach policy to IAM group",
    terraform_resource: "aws_iam_group_policy_attachment",
    icon: SECURITY_ICONS['aws_iam_group_policy_attachment'],
    inputs: {
      required: [
        { name: "group", type: "string", description: "Group name", reference: "aws_iam_group.name" },
        { name: "policy_arn", type: "string", description: "Policy ARN", reference: "aws_iam_policy.arn" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Attachment ID" }
    ]
  },
  {
    id: "iam_instance_profile",
    name: "IAM Instance Profile",
    description: "Instance profile for EC2",
    terraform_resource: "aws_iam_instance_profile",
    icon: SECURITY_ICONS['aws_iam_instance_profile'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Profile name" },
        { name: "name_prefix", type: "string", description: "Profile name prefix" },
        { name: "path", type: "string", description: "Path for the profile", default: "/" },
        { name: "role", type: "string", description: "Role name", reference: "aws_iam_role.name" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Profile ID" },
      { name: "arn", type: "string", description: "Profile ARN" },
      { name: "name", type: "string", description: "Profile name" },
      { name: "unique_id", type: "string", description: "Unique ID" },
      { name: "create_date", type: "string", description: "Creation date" }
    ]
  },
  {
    id: "iam_access_key",
    name: "IAM Access Key",
    description: "Access key for IAM user",
    terraform_resource: "aws_iam_access_key",
    icon: SECURITY_ICONS['aws_iam_access_key'],
    inputs: {
      required: [
        { name: "user", type: "string", description: "IAM user name", reference: "aws_iam_user.name" }
      ],
      optional: [
        { name: "pgp_key", type: "string", description: "PGP key for encryption" },
        { name: "status", type: "string", description: "Access key status", options: ["Active", "Inactive"] }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Access key ID" },
      { name: "secret", type: "string", description: "Secret access key" },
      { name: "create_date", type: "string", description: "Creation date" }
    ]
  },
  {
    id: "iam_openid_connect_provider",
    name: "IAM OIDC Provider",
    description: "OpenID Connect identity provider",
    terraform_resource: "aws_iam_openid_connect_provider",
    icon: SECURITY_ICONS['aws_iam_openid_connect_provider'],
    inputs: {
      required: [
        { name: "client_id_list", type: "list(string)", description: "Client ID list" },
        { name: "thumbprint_list", type: "list(string)", description: "Thumbprint list" },
        { name: "url", type: "string", description: "OIDC provider URL" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Provider ID" },
      { name: "arn", type: "string", description: "Provider ARN" }
    ]
  },
  {
    id: "iam_saml_provider",
    name: "IAM SAML Provider",
    description: "SAML identity provider",
    terraform_resource: "aws_iam_saml_provider",
    icon: SECURITY_ICONS['aws_iam_saml_provider'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Provider name" },
        { name: "saml_metadata_document", type: "string", description: "SAML metadata document" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Provider ID" },
      { name: "arn", type: "string", description: "Provider ARN" },
      { name: "valid_until", type: "string", description: "Valid until date" }
    ]
  },
  {
    id: "cognito_user_pool",
    name: "Cognito User Pool",
    description: "User directory for authentication",
    terraform_resource: "aws_cognito_user_pool",
    icon: SECURITY_ICONS['aws_cognito_user_pool'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "User pool name" }
      ],
      optional: [
        { name: "alias_attributes", type: "list(string)", description: "Alias attributes", options: ["phone_number", "email", "preferred_username"] },
        { name: "auto_verified_attributes", type: "list(string)", description: "Auto-verified attributes", options: ["email", "phone_number"] },
        { name: "deletion_protection", type: "string", description: "Deletion protection", options: ["ACTIVE", "INACTIVE"] },
        { name: "email_verification_message", type: "string", description: "Email verification message" },
        { name: "email_verification_subject", type: "string", description: "Email verification subject" },
        { name: "mfa_configuration", type: "string", description: "MFA configuration", options: ["OFF", "ON", "OPTIONAL"] },
        { name: "sms_authentication_message", type: "string", description: "SMS authentication message" },
        { name: "sms_verification_message", type: "string", description: "SMS verification message" },
        { name: "username_attributes", type: "list(string)", description: "Username attributes" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "password_policy",
          attributes: [
            { name: "minimum_length", type: "number" },
            { name: "require_lowercase", type: "bool" },
            { name: "require_numbers", type: "bool" },
            { name: "require_symbols", type: "bool" },
            { name: "require_uppercase", type: "bool" },
            { name: "temporary_password_validity_days", type: "number" }
          ]
        },
        {
          name: "schema",
          multiple: true,
          attributes: [
            { name: "attribute_data_type", type: "string", required: true, options: ["Boolean", "DateTime", "Number", "String"] },
            { name: "name", type: "string", required: true },
            { name: "developer_only_attribute", type: "bool" },
            { name: "mutable", type: "bool" },
            { name: "required", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "User pool ID" },
      { name: "arn", type: "string", description: "User pool ARN" },
      { name: "endpoint", type: "string", description: "User pool endpoint" },
      { name: "domain", type: "string", description: "User pool domain" },
      { name: "creation_date", type: "string", description: "Creation date" }
    ]
  },
  {
    id: "cognito_user_pool_client",
    name: "Cognito User Pool Client",
    description: "App client for user pool",
    terraform_resource: "aws_cognito_user_pool_client",
    icon: SECURITY_ICONS['aws_cognito_user_pool_client'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Client name" },
        { name: "user_pool_id", type: "string", description: "User pool ID", reference: "aws_cognito_user_pool.id" }
      ],
      optional: [
        { name: "access_token_validity", type: "number", description: "Access token validity in minutes" },
        { name: "allowed_oauth_flows", type: "list(string)", description: "Allowed OAuth flows", options: ["code", "implicit", "client_credentials"] },
        { name: "allowed_oauth_flows_user_pool_client", type: "bool", description: "Enable OAuth flows" },
        { name: "allowed_oauth_scopes", type: "list(string)", description: "Allowed OAuth scopes" },
        { name: "callback_urls", type: "list(string)", description: "Callback URLs" },
        { name: "default_redirect_uri", type: "string", description: "Default redirect URI" },
        { name: "enable_token_revocation", type: "bool", description: "Enable token revocation" },
        { name: "explicit_auth_flows", type: "list(string)", description: "Explicit auth flows" },
        { name: "generate_secret", type: "bool", description: "Generate client secret" },
        { name: "id_token_validity", type: "number", description: "ID token validity in minutes" },
        { name: "logout_urls", type: "list(string)", description: "Logout URLs" },
        { name: "refresh_token_validity", type: "number", description: "Refresh token validity in days" },
        { name: "supported_identity_providers", type: "list(string)", description: "Supported identity providers" }
      ],
      blocks: [
        {
          name: "token_validity_units",
          attributes: [
            { name: "access_token", type: "string", options: ["seconds", "minutes", "hours", "days"] },
            { name: "id_token", type: "string", options: ["seconds", "minutes", "hours", "days"] },
            { name: "refresh_token", type: "string", options: ["seconds", "minutes", "hours", "days"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Client ID" },
      { name: "client_secret", type: "string", description: "Client secret" }
    ]
  },
  {
    id: "cognito_identity_pool",
    name: "Cognito Identity Pool",
    description: "Federated identities for AWS access",
    terraform_resource: "aws_cognito_identity_pool",
    icon: SECURITY_ICONS['aws_cognito_identity_pool'],
    inputs: {
      required: [
        { name: "identity_pool_name", type: "string", description: "Identity pool name" }
      ],
      optional: [
        { name: "allow_unauthenticated_identities", type: "bool", description: "Allow unauthenticated identities" },
        { name: "allow_classic_flow", type: "bool", description: "Allow classic flow" },
        { name: "developer_provider_name", type: "string", description: "Developer provider name" },
        { name: "openid_connect_provider_arns", type: "list(string)", description: "OIDC provider ARNs" },
        { name: "saml_provider_arns", type: "list(string)", description: "SAML provider ARNs" },
        { name: "supported_login_providers", type: "map(string)", description: "Supported login providers" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "cognito_identity_providers",
          multiple: true,
          attributes: [
            { name: "client_id", type: "string" },
            { name: "provider_name", type: "string" },
            { name: "server_side_token_check", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Identity pool ID" },
      { name: "arn", type: "string", description: "Identity pool ARN" }
    ]
  },
  {
    id: "kms_key",
    name: "KMS Key",
    description: "Customer managed encryption key",
    terraform_resource: "aws_kms_key",
    icon: SECURITY_ICONS['aws_kms_key'],
    inputs: {
      required: [],
      optional: [
        { name: "description", type: "string", description: "Key description" },
        { name: "key_usage", type: "string", description: "Key usage", options: ["ENCRYPT_DECRYPT", "SIGN_VERIFY", "GENERATE_VERIFY_MAC"], default: "ENCRYPT_DECRYPT" },
        { name: "customer_master_key_spec", type: "string", description: "Key spec", options: ["SYMMETRIC_DEFAULT", "RSA_2048", "RSA_3072", "RSA_4096", "ECC_NIST_P256", "ECC_NIST_P384", "ECC_NIST_P521", "ECC_SECG_P256K1", "HMAC_224", "HMAC_256", "HMAC_384", "HMAC_512"] },
        { name: "policy", type: "string", description: "Key policy JSON" },
        { name: "bypass_policy_lockout_safety_check", type: "bool", description: "Bypass policy lockout safety check" },
        { name: "deletion_window_in_days", type: "number", description: "Deletion window in days" },
        { name: "enable_key_rotation", type: "bool", description: "Enable key rotation" },
        { name: "is_enabled", type: "bool", description: "Key is enabled", default: true },
        { name: "multi_region", type: "bool", description: "Multi-region key" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Key ID" },
      { name: "arn", type: "string", description: "Key ARN" },
      { name: "key_id", type: "string", description: "Key ID" }
    ]
  },
  {
    id: "kms_alias",
    name: "KMS Alias",
    description: "Alias for KMS key",
    terraform_resource: "aws_kms_alias",
    icon: SECURITY_ICONS['aws_kms_alias'],
    inputs: {
      required: [
        { name: "target_key_id", type: "string", description: "Target key ID", reference: "aws_kms_key.id" }
      ],
      optional: [
        { name: "name", type: "string", description: "Alias name (must start with alias/)" },
        { name: "name_prefix", type: "string", description: "Alias name prefix" }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Alias ARN" },
      { name: "target_key_arn", type: "string", description: "Target key ARN" }
    ]
  },
  {
    id: "secretsmanager_secret",
    name: "Secrets Manager Secret",
    description: "Secret for credentials and sensitive data",
    terraform_resource: "aws_secretsmanager_secret",
    icon: SECURITY_ICONS['aws_secretsmanager_secret'],
    inputs: {
      required: [],
      optional: [
        { name: "name", type: "string", description: "Secret name" },
        { name: "name_prefix", type: "string", description: "Secret name prefix" },
        { name: "description", type: "string", description: "Secret description" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "policy", type: "string", description: "Resource policy JSON" },
        { name: "recovery_window_in_days", type: "number", description: "Recovery window in days" },
        { name: "force_overwrite_replica_secret", type: "bool", description: "Force overwrite replica secret" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "replica",
          multiple: true,
          attributes: [
            { name: "region", type: "string", required: true },
            { name: "kms_key_id", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Secret ID" },
      { name: "arn", type: "string", description: "Secret ARN" },
      { name: "name", type: "string", description: "Secret name" }
    ]
  },
  {
    id: "secretsmanager_secret_version",
    name: "Secrets Manager Secret Version",
    description: "Version of a secret",
    terraform_resource: "aws_secretsmanager_secret_version",
    icon: SECURITY_ICONS['aws_secretsmanager_secret_version'],
    inputs: {
      required: [
        { name: "secret_id", type: "string", description: "Secret ID", reference: "aws_secretsmanager_secret.id" }
      ],
      optional: [
        { name: "secret_string", type: "string", description: "Secret string value" },
        { name: "secret_binary", type: "string", description: "Secret binary value" },
        { name: "version_stages", type: "list(string)", description: "Version stages" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Version ID" },
      { name: "arn", type: "string", description: "Version ARN" },
      { name: "version_id", type: "string", description: "Version ID" }
    ]
  },
  {
    id: "secretsmanager_secret_rotation",
    name: "Secrets Manager Rotation",
    description: "Automatic secret rotation",
    terraform_resource: "aws_secretsmanager_secret_rotation",
    icon: SECURITY_ICONS['aws_secretsmanager_secret_rotation'],
    inputs: {
      required: [
        { name: "secret_id", type: "string", description: "Secret ID", reference: "aws_secretsmanager_secret.id" },
        { name: "rotation_lambda_arn", type: "string", description: "Rotation Lambda ARN", reference: "aws_lambda_function.arn" }
      ],
      optional: [
        { name: "rotate_immediately", type: "bool", description: "Rotate immediately" }
      ],
      blocks: [
        {
          name: "rotation_rules",
          attributes: [
            { name: "automatically_after_days", type: "number" },
            { name: "duration", type: "string" },
            { name: "schedule_expression", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Secret ID" },
      { name: "rotation_enabled", type: "bool", description: "Rotation enabled" }
    ]
  },
  {
    id: "acm_certificate",
    name: "ACM Certificate",
    description: "SSL/TLS certificate",
    terraform_resource: "aws_acm_certificate",
    icon: SECURITY_ICONS['aws_acm_certificate'],
    inputs: {
      required: [],
      optional: [
        { name: "domain_name", type: "string", description: "Domain name" },
        { name: "subject_alternative_names", type: "list(string)", description: "Subject alternative names" },
        { name: "validation_method", type: "string", description: "Validation method", options: ["DNS", "EMAIL", "NONE"] },
        { name: "certificate_authority_arn", type: "string", description: "Private CA ARN" },
        { name: "certificate_body", type: "string", description: "Certificate body PEM" },
        { name: "certificate_chain", type: "string", description: "Certificate chain PEM" },
        { name: "private_key", type: "string", description: "Private key PEM" },
        { name: "key_algorithm", type: "string", description: "Key algorithm", options: ["RSA_1024", "RSA_2048", "RSA_3072", "RSA_4096", "EC_prime256v1", "EC_secp384r1", "EC_secp521r1"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "options",
          attributes: [
            { name: "certificate_transparency_logging_preference", type: "string", options: ["ENABLED", "DISABLED"] }
          ]
        },
        {
          name: "validation_option",
          multiple: true,
          attributes: [
            { name: "domain_name", type: "string", required: true },
            { name: "validation_domain", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Certificate ID" },
      { name: "arn", type: "string", description: "Certificate ARN" },
      { name: "domain_name", type: "string", description: "Domain name" },
      { name: "domain_validation_options", type: "list(object)", description: "Domain validation options" },
      { name: "status", type: "string", description: "Certificate status" },
      { name: "type", type: "string", description: "Certificate type" }
    ]
  },
  {
    id: "acm_certificate_validation",
    name: "ACM Certificate Validation",
    description: "Validate ACM certificate",
    terraform_resource: "aws_acm_certificate_validation",
    icon: SECURITY_ICONS['aws_acm_certificate_validation'],
    inputs: {
      required: [
        { name: "certificate_arn", type: "string", description: "Certificate ARN", reference: "aws_acm_certificate.arn" }
      ],
      optional: [
        { name: "validation_record_fqdns", type: "list(string)", description: "Validation record FQDNs" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Certificate ARN" },
      { name: "certificate_arn", type: "string", description: "Certificate ARN" }
    ]
  },
  {
    id: "wafv2_web_acl",
    name: "WAFv2 Web ACL",
    description: "Web Application Firewall access control list",
    terraform_resource: "aws_wafv2_web_acl",
    icon: SECURITY_ICONS['aws_wafv2_web_acl'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Web ACL name" },
        { name: "scope", type: "string", description: "Scope", options: ["CLOUDFRONT", "REGIONAL"] }
      ],
      optional: [
        { name: "description", type: "string", description: "Web ACL description" },
        { name: "token_domains", type: "list(string)", description: "Token domains" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "default_action",
          description: "Default action for requests",
          attributes: []
        },
        {
          name: "visibility_config",
          attributes: [
            { name: "cloudwatch_metrics_enabled", type: "bool", required: true },
            { name: "metric_name", type: "string", required: true },
            { name: "sampled_requests_enabled", type: "bool", required: true }
          ]
        },
        {
          name: "rule",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "priority", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Web ACL ID" },
      { name: "arn", type: "string", description: "Web ACL ARN" },
      { name: "capacity", type: "number", description: "Web ACL capacity" },
      { name: "lock_token", type: "string", description: "Lock token" }
    ]
  },
  {
    id: "wafv2_ip_set",
    name: "WAFv2 IP Set",
    description: "IP address set for WAF rules",
    terraform_resource: "aws_wafv2_ip_set",
    icon: SECURITY_ICONS['aws_wafv2_ip_set'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "IP set name" },
        { name: "scope", type: "string", description: "Scope", options: ["CLOUDFRONT", "REGIONAL"] },
        { name: "ip_address_version", type: "string", description: "IP version", options: ["IPV4", "IPV6"] }
      ],
      optional: [
        { name: "description", type: "string", description: "IP set description" },
        { name: "addresses", type: "list(string)", description: "IP addresses in CIDR notation" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "IP set ID" },
      { name: "arn", type: "string", description: "IP set ARN" },
      { name: "lock_token", type: "string", description: "Lock token" }
    ]
  },
  {
    id: "guardduty_detector",
    name: "GuardDuty Detector",
    description: "Threat detection service",
    terraform_resource: "aws_guardduty_detector",
    icon: SECURITY_ICONS['aws_guardduty_detector'],
    inputs: {
      required: [],
      optional: [
        { name: "enable", type: "bool", description: "Enable GuardDuty", default: true },
        { name: "finding_publishing_frequency", type: "string", description: "Finding publishing frequency", options: ["FIFTEEN_MINUTES", "ONE_HOUR", "SIX_HOURS"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "datasources",
          description: "Data sources configuration",
          attributes: []
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Detector ID" },
      { name: "arn", type: "string", description: "Detector ARN" },
      { name: "account_id", type: "string", description: "AWS account ID" }
    ]
  },
  {
    id: "security_hub_account",
    name: "Security Hub",
    description: "Security posture management",
    terraform_resource: "aws_securityhub_account",
    icon: SECURITY_ICONS['aws_securityhub_account'],
    inputs: {
      required: [],
      optional: [
        { name: "enable_default_standards", type: "bool", description: "Enable default standards" },
        { name: "control_finding_generator", type: "string", description: "Control finding generator", options: ["SECURITY_CONTROL", "STANDARD_CONTROL"] },
        { name: "auto_enable_controls", type: "bool", description: "Auto enable controls" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "AWS account ID" },
      { name: "arn", type: "string", description: "Security Hub ARN" }
    ]
  },
  {
    id: "inspector2_enabler",
    name: "Inspector",
    description: "Vulnerability management service",
    terraform_resource: "aws_inspector2_enabler",
    icon: SECURITY_ICONS['aws_inspector2_enabler'],
    inputs: {
      required: [
        { name: "account_ids", type: "list(string)", description: "Account IDs to enable" },
        { name: "resource_types", type: "list(string)", description: "Resource types", options: ["EC2", "ECR", "LAMBDA", "LAMBDA_CODE"] }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "ID" }
    ]
  }
];

// List of all security terraform resource types
export const SECURITY_TERRAFORM_RESOURCES = SECURITY_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getSecurityServiceByTerraformResource(terraformResource: string): SecurityServiceDefinition | undefined {
  return SECURITY_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getSecurityServiceById(id: string): SecurityServiceDefinition | undefined {
  return SECURITY_SERVICES.find(s => s.id === id);
}

export function isSecurityResource(terraformResource: string): boolean {
  return SECURITY_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getSecurityIcon(terraformResource: string): string {
  return SECURITY_ICONS[terraformResource] || SECURITY_ICONS['aws_iam_role'];
}










