/**
 * GCP Security & Identity Services Data - Complete definitions from security.json
 * This file contains ALL 11 security services with ALL their properties
 */

// Type definitions
export interface ServiceInput {
  name: string;
  type: string;
  description?: string;
  example?: string;
  default?: unknown;
  options?: string[];
  reference?: string;
  required?: boolean;
  sensitive?: boolean;
}

export interface BlockAttribute {
  name: string;
  type: string;
  description?: string;
  options?: string[];
  default?: unknown;
  required?: boolean;
  sensitive?: boolean;
}

export interface ServiceBlock {
  name: string;
  description?: string;
  multiple?: boolean;
  required?: boolean;
  attributes: BlockAttribute[];
  nested_blocks?: ServiceBlock[];
  blocks?: ServiceBlock[];
}

export interface ServiceOutput {
  name: string;
  type: string;
  description?: string;
  sensitive?: boolean;
}

// GCP Security & Identity service icon mappings - using GCP core products and legacy icons
export const SECURITY_ICONS: Record<string, string> = {
  'google_service_account': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
  'google_service_account_key': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
  'google_project_iam_binding': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
  'google_project_iam_member': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
  'google_kms_key_ring': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
  'google_kms_crypto_key': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
  'google_secret_manager_secret': '/api/icons/gcp/google-cloud-legacy-icons/secret_manager/secret_manager.svg',
  'google_secret_manager_secret_version': '/api/icons/gcp/google-cloud-legacy-icons/secret_manager/secret_manager.svg',
  'google_iap_web_iam_binding': '/api/icons/gcp/google-cloud-legacy-icons/identity-aware_proxy/identity-aware_proxy.svg',
  'google_organization_policy': '/api/icons/gcp/google-cloud-legacy-icons/security/security.svg',
  'google_compute_security_policy': '/api/icons/gcp/google-cloud-legacy-icons/cloud_armor/cloud_armor.svg',
};

// Security & Identity service definition interface
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

// Complete security services data - manually defined
export const SECURITY_SERVICES: SecurityServiceDefinition[] = [
  {
    id: "service_account",
    name: "Service Account",
    description: "Google Cloud service account for authentication",
    terraform_resource: "google_service_account",
    icon: SECURITY_ICONS['google_service_account'],
    inputs: {
      required: [
        { name: "account_id", type: "string", description: "Service account ID" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "display_name", type: "string", description: "Display name" },
        { name: "description", type: "string", description: "Description" },
        { name: "disabled", type: "bool", description: "Disabled" },
        { name: "create_ignore_already_exists", type: "bool", description: "Ignore if exists" }
      ],
      blocks: []
    },
    outputs: [
      { name: "id", type: "string", description: "Service account ID" },
      { name: "email", type: "string", description: "Email address" },
      { name: "name", type: "string", description: "Full resource name" },
      { name: "unique_id", type: "string", description: "Unique ID" },
      { name: "member", type: "string", description: "IAM member string" }
    ]
  },
  {
    id: "service_account_key",
    name: "Service Account Key",
    description: "Key for service account authentication",
    terraform_resource: "google_service_account_key",
    icon: SECURITY_ICONS['google_service_account_key'],
    inputs: {
      required: [
        { name: "service_account_id", type: "string", description: "Service account ID or email" }
      ],
      optional: [
        { name: "key_algorithm", type: "string", description: "Key algorithm", options: ["KEY_ALG_RSA_1024", "KEY_ALG_RSA_2048"] },
        { name: "public_key_type", type: "string", description: "Public key type", options: ["TYPE_X509_PEM_FILE", "TYPE_RAW_PUBLIC_KEY"] },
        { name: "private_key_type", type: "string", description: "Private key type", options: ["TYPE_PKCS12_FILE", "TYPE_GOOGLE_CREDENTIALS_FILE"] },
        { name: "public_key_data", type: "string", description: "Public key data" },
        { name: "keepers", type: "map", description: "Keepers for recreation" }
      ],
      blocks: []
    },
    outputs: [
      { name: "id", type: "string", description: "Key ID" },
      { name: "name", type: "string", description: "Key name" },
      { name: "public_key", type: "string", description: "Public key" },
      { name: "private_key", type: "string", description: "Private key", sensitive: true },
      { name: "valid_after", type: "string", description: "Valid after time" },
      { name: "valid_before", type: "string", description: "Valid before time" }
    ]
  },
  {
    id: "project_iam_binding",
    name: "Project IAM Binding",
    description: "IAM binding at project level",
    terraform_resource: "google_project_iam_binding",
    icon: SECURITY_ICONS['google_project_iam_binding'],
    inputs: {
      required: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "role", type: "string", description: "IAM role" },
        { name: "members", type: "list", description: "IAM members" }
      ],
      optional: [],
      blocks: [
        {
          name: "condition",
          required: false,
          attributes: [
            { name: "title", type: "string", required: true },
            { name: "description", type: "string" },
            { name: "expression", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "etag", type: "string", description: "Policy etag" }
    ]
  },
  {
    id: "project_iam_member",
    name: "Project IAM Member",
    description: "IAM member at project level",
    terraform_resource: "google_project_iam_member",
    icon: SECURITY_ICONS['google_project_iam_member'],
    inputs: {
      required: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "role", type: "string", description: "IAM role" },
        { name: "member", type: "string", description: "IAM member" }
      ],
      optional: [],
      blocks: [
        {
          name: "condition",
          required: false,
          attributes: [
            { name: "title", type: "string", required: true },
            { name: "description", type: "string" },
            { name: "expression", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "etag", type: "string", description: "Policy etag" }
    ]
  },
  {
    id: "kms_key_ring",
    name: "KMS Key Ring",
    description: "Cloud KMS key ring",
    terraform_resource: "google_kms_key_ring",
    icon: SECURITY_ICONS['google_kms_key_ring'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Key ring name" },
        { name: "location", type: "string", description: "Location" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" }
      ],
      blocks: []
    },
    outputs: [
      { name: "id", type: "string", description: "Key ring ID" },
      { name: "self_link", type: "string", description: "Self link" }
    ]
  },
  {
    id: "kms_crypto_key",
    name: "KMS Crypto Key",
    description: "Cloud KMS cryptographic key",
    terraform_resource: "google_kms_crypto_key",
    icon: SECURITY_ICONS['google_kms_crypto_key'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Key name" },
        { name: "key_ring", type: "string", description: "Key ring ID" }
      ],
      optional: [
        { name: "rotation_period", type: "string", description: "Rotation period" },
        { name: "purpose", type: "string", description: "Key purpose", options: ["ENCRYPT_DECRYPT", "ASYMMETRIC_SIGN", "ASYMMETRIC_DECRYPT", "MAC"] },
        { name: "destroy_scheduled_duration", type: "string", description: "Destroy scheduled duration" },
        { name: "import_only", type: "bool", description: "Import only" },
        { name: "skip_initial_version_creation", type: "bool", description: "Skip initial version" },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: [
        {
          name: "version_template",
          required: false,
          attributes: [
            { name: "algorithm", type: "string", options: ["GOOGLE_SYMMETRIC_ENCRYPTION", "RSA_SIGN_PSS_2048_SHA256", "RSA_SIGN_PSS_3072_SHA256", "RSA_SIGN_PSS_4096_SHA256", "RSA_SIGN_PKCS1_2048_SHA256", "RSA_SIGN_PKCS1_3072_SHA256", "RSA_SIGN_PKCS1_4096_SHA256", "RSA_DECRYPT_OAEP_2048_SHA256", "RSA_DECRYPT_OAEP_3072_SHA256", "RSA_DECRYPT_OAEP_4096_SHA256", "EC_SIGN_P256_SHA256", "EC_SIGN_P384_SHA384", "EC_SIGN_SECP256K1_SHA256", "HMAC_SHA256"], required: true },
            { name: "protection_level", type: "string", options: ["SOFTWARE", "HSM", "EXTERNAL", "EXTERNAL_VPC"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Key ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "primary", type: "list", description: "Primary version" }
    ]
  },
  {
    id: "secret_manager_secret",
    name: "Secret Manager Secret",
    description: "Secret in Secret Manager",
    terraform_resource: "google_secret_manager_secret",
    icon: SECURITY_ICONS['google_secret_manager_secret'],
    inputs: {
      required: [
        { name: "secret_id", type: "string", description: "Secret ID" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "annotations", type: "map", description: "Annotations" },
        { name: "version_aliases", type: "map", description: "Version aliases" },
        { name: "expire_time", type: "string", description: "Expiration time" },
        { name: "ttl", type: "string", description: "TTL" }
      ],
      blocks: [
    {
      name: "replication",
      required: true,
      attributes: [
      { name: "automatic", type: "bool" }
    ],
      blocks: [
          {
            name: "auto",
            attributes: [],
            blocks: [
                {
                  name: "customer_managed_encryption",
                  attributes: [
                  { name: "kms_key_name", type: "string", required: true }
                ]
                }
          ]
          },
          {
            name: "user_managed",
            attributes: [],
            blocks: [
                {
                  name: "replicas",
                  required: true,
                  multiple: true,
                  attributes: [
                  { name: "location", type: "string", required: true }
                ],
                  blocks: [
                      {
                        name: "customer_managed_encryption",
                        attributes: [
                        { name: "kms_key_name", type: "string", required: true }
                      ]
                      }
                ]
                }
          ]
          }
    ]
    },
    {
      name: "rotation",
      attributes: [
      { name: "next_rotation_time", type: "string" },
      { name: "rotation_period", type: "string" }
    ]
    },
    {
      name: "topics",
      multiple: true,
      attributes: [
      { name: "name", type: "string", required: true }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Secret ID" },
      { name: "name", type: "string", description: "Secret name" },
      { name: "create_time", type: "string", description: "Creation time" }
    ]
  },
  {
    id: "secret_manager_secret_version",
    name: "Secret Version",
    description: "Version of a secret",
    terraform_resource: "google_secret_manager_secret_version",
    icon: SECURITY_ICONS['google_secret_manager_secret_version'],
    inputs: {
      required: [
        { name: "secret", type: "string", description: "Secret ID" },
        { name: "secret_data", type: "string", description: "Secret data", sensitive: true }
      ],
      optional: [
        { name: "enabled", type: "bool", description: "Enabled", default: true },
        { name: "deletion_policy", type: "string", description: "Deletion policy", options: ["DELETE", "DISABLE", "ABANDON"] },
        { name: "is_secret_data_base64", type: "bool", description: "Is data base64" }
      ],
      blocks: [
        // No blocks
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Version ID" },
      { name: "name", type: "string", description: "Version name" },
      { name: "version", type: "string", description: "Version number" },
      { name: "create_time", type: "string", description: "Creation time" },
      { name: "destroy_time", type: "string", description: "Destroy time" }
    ]
  },
  {
    id: "iap_web_iam_binding",
    name: "IAP Web IAM Binding",
    description: "Identity-Aware Proxy IAM binding for web",
    terraform_resource: "google_iap_web_iam_binding",
    icon: SECURITY_ICONS['google_iap_web_iam_binding'],
    inputs: {
      required: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "role", type: "string", description: "IAM role" },
        { name: "members", type: "list", description: "IAM members" }
      ],
      optional: [
        // No optional inputs
      ],
      blocks: [
        {
          name: "condition",
          required: false,
          attributes: [
            { name: "title", type: "string", required: true },
            { name: "description", type: "string" },
            { name: "expression", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "etag", type: "string", description: "Policy etag" }
    ]
  },
  {
    id: "organization_policy",
    name: "Organization Policy",
    description: "Organization policy constraint",
    terraform_resource: "google_organization_policy",
    icon: SECURITY_ICONS['google_organization_policy'],
    inputs: {
      required: [
        { name: "org_id", type: "string", description: "Organization ID" },
        { name: "constraint", type: "string", description: "Constraint name" }
      ],
      optional: [
        { name: "version", type: "number", description: "Policy version" }
      ],
      blocks: [
        {
          name: "boolean_policy",
          required: false,
          attributes: [
            { name: "enforced", type: "bool", required: true }
          ]
        },
        {
          name: "list_policy",
          required: false,
          attributes: [
            { name: "suggested_value", type: "string" },
            { name: "inherit_from_parent", type: "bool" }
          ],
          blocks: [
            {
              name: "allow",
              required: false,
              attributes: [
                { name: "all", type: "bool" },
                { name: "values", type: "list" }
              ]
            },
            {
              name: "deny",
              required: false,
              attributes: [
                { name: "all", type: "bool" },
                { name: "values", type: "list" }
              ]
            }
          ]
        },
        {
          name: "restore_policy",
          required: false,
          attributes: [
            { name: "default", type: "bool", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "etag", type: "string", description: "Policy etag" },
      { name: "update_time", type: "string", description: "Update time" }
    ]
  },
  {
    id: "compute_security_policy",
    name: "Cloud Armor Policy",
    description: "Cloud Armor security policy",
    terraform_resource: "google_compute_security_policy",
    icon: SECURITY_ICONS['google_compute_security_policy'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Policy name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "type", type: "string", description: "Policy type", options: ["CLOUD_ARMOR", "CLOUD_ARMOR_EDGE", "CLOUD_ARMOR_NETWORK"] }
      ],
      blocks: [
    {
      name: "rule",
      multiple: true,
      attributes: [
      { name: "action", type: "string", options: ["allow", "deny(403)", "deny(404)", "deny(502)", "rate_based_ban", "redirect", "throttle"], required: true },
      { name: "priority", type: "number", required: true },
      { name: "preview", type: "bool" },
      { name: "description", type: "string" }
    ],
      blocks: [
          {
            name: "match",
            required: true,
            attributes: [
            { name: "versioned_expr", type: "string", options: ["SRC_IPS_V1"] }
          ],
            blocks: [
                {
                  name: "config",
                  attributes: [
                  { name: "src_ip_ranges", type: "list" }
                ]
                },
                {
                  name: "expr",
                  attributes: [
                  { name: "expression", type: "string", required: true }
                ]
                }
          ]
          },
          {
            name: "rate_limit_options",
            attributes: [
            { name: "conform_action", type: "string" },
            { name: "exceed_action", type: "string" },
            { name: "enforce_on_key", type: "string" },
            { name: "enforce_on_key_name", type: "string" },
            { name: "ban_duration_sec", type: "number" }
          ],
            blocks: [
                {
                  name: "rate_limit_threshold",
                  attributes: [
                  { name: "count", type: "number", required: true },
                  { name: "interval_sec", type: "number", required: true }
                ]
                },
                {
                  name: "ban_threshold",
                  attributes: [
                  { name: "count", type: "number", required: true },
                  { name: "interval_sec", type: "number", required: true }
                ]
                }
          ]
          },
          {
            name: "redirect_options",
            attributes: [
            { name: "type", type: "string", options: ["EXTERNAL_302", "GOOGLE_RECAPTCHA"], required: true },
            { name: "target", type: "string" }
          ]
          },
          {
            name: "header_action",
            attributes: [],
            blocks: [
                {
                  name: "request_headers_to_adds",
                  multiple: true,
                  attributes: [
                  { name: "header_name", type: "string", required: true },
                  { name: "header_value", type: "string" }
                ]
                }
          ]
          }
    ]
    },
    {
      name: "adaptive_protection_config",
      attributes: [],
      blocks: [
          {
            name: "layer_7_ddos_defense_config",
            attributes: [
            { name: "enable", type: "bool" },
            { name: "rule_visibility", type: "string", options: ["STANDARD", "PREMIUM"] }
          ]
          },
          {
            name: "auto_deploy_config",
            attributes: [
            { name: "load_threshold", type: "number" },
            { name: "confidence_threshold", type: "number" },
            { name: "impacted_baseline_threshold", type: "number" },
            { name: "expiration_sec", type: "number" }
          ]
          }
    ]
    },
    {
      name: "advanced_options_config",
      attributes: [
      { name: "json_parsing", type: "string", options: ["DISABLED", "STANDARD"] },
      { name: "log_level", type: "string", options: ["NORMAL", "VERBOSE"] }
    ],
      blocks: [
          {
            name: "json_custom_config",
            attributes: [
            { name: "content_types", type: "list", required: true }
          ]
          }
    ]
    },
    {
      name: "recaptcha_options_config",
      attributes: [
      { name: "redirect_site_key", type: "string", required: true }
    ]
    }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Policy ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "fingerprint", type: "string", description: "Fingerprint" }
    ]
  }
];

// All security terraform resources
export const SECURITY_TERRAFORM_RESOURCES = SECURITY_SERVICES.map(s => s.terraform_resource);

// Get security service by terraform resource name
export function getSecurityServiceByTerraformResource(terraformResource: string): SecurityServiceDefinition | undefined {
  return SECURITY_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get security service by ID
export function getSecurityServiceById(id: string): SecurityServiceDefinition | undefined {
  return SECURITY_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a security resource
export function isSecurityResource(terraformResource: string): boolean {
  return SECURITY_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get security icon
export function getSecurityIcon(terraformResource: string): string | undefined {
  return SECURITY_ICONS[terraformResource];
}
