/**
 * GCP Developer Tools Services Data - Complete definitions from developer-tools.json
 * This file contains ALL 5 developer tools services with ALL their properties
 * 
 * Services included:
 * 1. Artifact Registry Repository (google_artifact_registry_repository)
 * 2. Cloud Build Trigger (google_cloudbuild_trigger)
 * 3. Cloud Source Repository (google_sourcerepo_repository)
 * 4. Secret Manager Secret (google_secret_manager_secret)
 * 5. Firebase Project (google_firebase_project)
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

// GCP Developer Tools service icon mappings - using GCP core products and legacy icons
export const DEVELOPER_TOOLS_ICONS: Record<string, string> = {
  'google_artifact_registry_repository': '/api/icons/gcp/google-cloud-legacy-icons/artifact_registry/artifact_registry.svg',
  'google_cloudbuild_trigger': '/api/icons/gcp/google-cloud-legacy-icons/cloud_build/cloud_build.svg',
  'google_sourcerepo_repository': '/api/icons/gcp/google-cloud-legacy-icons/cloud_code/cloud_code.svg',
  'google_secret_manager_secret': '/api/icons/gcp/google-cloud-legacy-icons/secret_manager/secret_manager.svg',
  'google_firebase_project': '/api/icons/gcp/google-cloud-legacy-icons/cloud_code/cloud_code.svg',
};

// Developer Tools service definition interface
export interface DeveloperToolsServiceDefinition {
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

// Complete developer tools services data - manually defined
export const DEVELOPER_TOOLS_SERVICES: DeveloperToolsServiceDefinition[] = [
  {
    id: "artifact_registry_repository",
    name: "Artifact Registry Repository",
    description: "Artifact Registry repository",
    terraform_resource: "google_artifact_registry_repository",
    icon: DEVELOPER_TOOLS_ICONS['google_artifact_registry_repository'],
    inputs: {
      required: [
        { name: "repository_id", type: "string", description: "Repository ID" },
        { name: "location", type: "string", description: "Location" },
        { name: "format", type: "string", description: "Repository format", options: ["DOCKER", "MAVEN", "NPM", "APT", "YUM", "PYTHON", "KFP", "GO"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "kms_key_name", type: "string", description: "KMS key name" },
        { name: "mode", type: "string", description: "Repository mode", options: ["STANDARD_REPOSITORY", "REMOTE_REPOSITORY", "VIRTUAL_REPOSITORY"] },
        { name: "cleanup_policy_dry_run", type: "bool", description: "Cleanup policy dry run" }
      ],
      blocks: [
        {
          name: "docker_config",
          required: false,
          attributes: [
            { name: "immutable_tags", type: "bool" }
          ]
        },
        {
          name: "maven_config",
          required: false,
          attributes: [
            { name: "allow_snapshot_overwrites", type: "bool" },
            { name: "version_policy", type: "string", options: ["VERSION_POLICY_UNSPECIFIED", "RELEASE", "SNAPSHOT"] }
          ]
        },
        {
          name: "virtual_repository_config",
          required: false,
          attributes: [],
          blocks: [
            {
              name: "upstream_policies",
              multiple: true,
              attributes: [
                { name: "id", type: "string", required: true },
                { name: "repository", type: "string" },
                { name: "priority", type: "number" }
              ]
            }
          ]
        },
        {
          name: "remote_repository_config",
          required: false,
          attributes: [
            { name: "description", type: "string" }
          ],
          blocks: [
            {
              name: "docker_repository",
              attributes: [
                { name: "public_repository", type: "string", options: ["DOCKER_HUB"] }
              ],
              blocks: [
                {
                  name: "custom_repository",
                  attributes: [
                    { name: "uri", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "maven_repository",
              attributes: [
                { name: "public_repository", type: "string", options: ["MAVEN_CENTRAL"] }
              ],
              blocks: [
                {
                  name: "custom_repository",
                  attributes: [
                    { name: "uri", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "npm_repository",
              attributes: [
                { name: "public_repository", type: "string", options: ["NPMJS"] }
              ],
              blocks: [
                {
                  name: "custom_repository",
                  attributes: [
                    { name: "uri", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "python_repository",
              attributes: [
                { name: "public_repository", type: "string", options: ["PYPI"] }
              ],
              blocks: [
                {
                  name: "custom_repository",
                  attributes: [
                    { name: "uri", type: "string" }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "cleanup_policies",
          required: false,
          multiple: true,
          attributes: [
            { name: "id", type: "string", required: true },
            { name: "action", type: "string", options: ["DELETE", "KEEP"] }
          ],
          blocks: [
            {
              name: "condition",
              attributes: [
                { name: "tag_state", type: "string", options: ["TAGGED", "UNTAGGED", "ANY"] },
                { name: "tag_prefixes", type: "list" },
                { name: "version_name_prefixes", type: "list" },
                { name: "package_name_prefixes", type: "list" },
                { name: "older_than", type: "string" },
                { name: "newer_than", type: "string" }
              ]
            },
            {
              name: "most_recent_versions",
              attributes: [
                { name: "package_name_prefixes", type: "list" },
                { name: "keep_count", type: "number" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Repository ID" },
      { name: "name", type: "string", description: "Repository name" },
      { name: "create_time", type: "string", description: "Create time" },
      { name: "update_time", type: "string", description: "Update time" }
    ]
  },
  {
    id: "cloudbuild_trigger",
    name: "Cloud Build Trigger",
    description: "Cloud Build trigger",
    terraform_resource: "google_cloudbuild_trigger",
    icon: DEVELOPER_TOOLS_ICONS['google_cloudbuild_trigger'],
    inputs: {
      required: [],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "name", type: "string", description: "Trigger name" },
        { name: "description", type: "string", description: "Description" },
        { name: "disabled", type: "bool", description: "Disabled" },
        { name: "substitutions", type: "map", description: "Substitutions" },
        { name: "service_account", type: "string", description: "Service account" },
        { name: "include_build_logs", type: "string", description: "Include build logs", options: ["INCLUDE_BUILD_LOGS_UNSPECIFIED", "INCLUDE_BUILD_LOGS_WITH_STATUS"] },
        { name: "filename", type: "string", description: "Build config filename" },
        { name: "filter", type: "string", description: "CEL filter" },
        { name: "ignored_files", type: "list", description: "Ignored files" },
        { name: "included_files", type: "list", description: "Included files" },
        { name: "location", type: "string", description: "Location" },
        { name: "tags", type: "list", description: "Tags" }
      ],
      blocks: [
        {
          name: "trigger_template",
          required: false,
          attributes: [
            { name: "project_id", type: "string" },
            { name: "repo_name", type: "string" },
            { name: "dir", type: "string" },
            { name: "invert_regex", type: "bool" },
            { name: "branch_name", type: "string" },
            { name: "tag_name", type: "string" },
            { name: "commit_sha", type: "string" }
          ]
        },
        {
          name: "github",
          required: false,
          attributes: [
            { name: "owner", type: "string" },
            { name: "name", type: "string" },
            { name: "enterprise_config_resource_name", type: "string" }
          ],
          blocks: [
            {
              name: "pull_request",
              attributes: [
                { name: "branch", type: "string", required: true },
                { name: "comment_control", type: "string", options: ["COMMENTS_DISABLED", "COMMENTS_ENABLED", "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"] },
                { name: "invert_regex", type: "bool" }
              ]
            },
            {
              name: "push",
              attributes: [
                { name: "branch", type: "string" },
                { name: "tag", type: "string" },
                { name: "invert_regex", type: "bool" }
              ]
            }
          ]
        },
        {
          name: "pubsub_config",
          required: false,
          attributes: [
            { name: "topic", type: "string", required: true },
            { name: "service_account_email", type: "string" }
          ]
        },
        {
          name: "webhook_config",
          required: false,
          attributes: [
            { name: "secret", type: "string", required: true }
          ]
        },
        {
          name: "build",
          required: false,
          attributes: [
            { name: "images", type: "list" },
            { name: "substitutions", type: "map" },
            { name: "tags", type: "list" },
            { name: "timeout", type: "string" },
            { name: "logs_bucket", type: "string" },
            { name: "queue_ttl", type: "string" }
          ],
          blocks: [
            {
              name: "step",
              required: true,
              multiple: true,
              attributes: [
                { name: "name", type: "string", required: true },
                { name: "args", type: "list" },
                { name: "env", type: "list" },
                { name: "id", type: "string" },
                { name: "entrypoint", type: "string" },
                { name: "dir", type: "string" },
                { name: "secret_env", type: "list" },
                { name: "timeout", type: "string" },
                { name: "timing", type: "string" },
                { name: "wait_for", type: "list" },
                { name: "script", type: "string" },
                { name: "allow_failure", type: "bool" },
                { name: "allow_exit_codes", type: "list" }
              ],
              blocks: [
                {
                  name: "volumes",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "path", type: "string", required: true }
                  ]
                }
              ]
            },
            {
              name: "source",
              blocks: [
                {
                  name: "storage_source",
                  attributes: [
                    { name: "bucket", type: "string", required: true },
                    { name: "object", type: "string", required: true },
                    { name: "generation", type: "string" }
                  ]
                },
                {
                  name: "repo_source",
                  attributes: [
                    { name: "project_id", type: "string" },
                    { name: "repo_name", type: "string", required: true },
                    { name: "dir", type: "string" },
                    { name: "invert_regex", type: "bool" },
                    { name: "substitutions", type: "map" },
                    { name: "branch_name", type: "string" },
                    { name: "tag_name", type: "string" },
                    { name: "commit_sha", type: "string" }
                  ]
                }
              ]
            },
            {
              name: "options",
              attributes: [
                { name: "source_provenance_hash", type: "list" },
                { name: "requested_verify_option", type: "string" },
                { name: "machine_type", type: "string" },
                { name: "disk_size_gb", type: "number" },
                { name: "substitution_option", type: "string" },
                { name: "dynamic_substitutions", type: "bool" },
                { name: "log_streaming_option", type: "string" },
                { name: "worker_pool", type: "string" },
                { name: "logging", type: "string" },
                { name: "env", type: "list" },
                { name: "secret_env", type: "list" }
              ],
              blocks: [
                {
                  name: "volumes",
                  multiple: true,
                  attributes: [
                    { name: "name", type: "string", required: true },
                    { name: "path", type: "string", required: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "approval_config",
          required: false,
          attributes: [
            { name: "approval_required", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Trigger ID" },
      { name: "trigger_id", type: "string", description: "Trigger ID" },
      { name: "create_time", type: "string", description: "Create time" }
    ]
  },
  {
    id: "sourcerepo_repository",
    name: "Cloud Source Repository",
    description: "Cloud Source Repository",
    terraform_resource: "google_sourcerepo_repository",
    icon: DEVELOPER_TOOLS_ICONS['google_sourcerepo_repository'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Repository name" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" }
      ],
      blocks: [
        {
          name: "pubsub_configs",
          required: false,
          multiple: true,
          attributes: [
            { name: "topic", type: "string", required: true },
            { name: "message_format", type: "string", required: true, options: ["PROTOBUF", "JSON"] },
            { name: "service_account_email", type: "string" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Repository ID" },
      { name: "size", type: "number", description: "Repository size" },
      { name: "url", type: "string", description: "Repository URL" }
    ]
  },
  {
    id: "secret_manager_secret",
    name: "Secret Manager Secret",
    description: "Secret Manager secret",
    terraform_resource: "google_secret_manager_secret",
    icon: DEVELOPER_TOOLS_ICONS['google_secret_manager_secret'],
    inputs: {
      required: [
        { name: "secret_id", type: "string", description: "Secret ID" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "version_aliases", type: "map", description: "Version aliases" },
        { name: "version_destroy_ttl", type: "string", description: "Version destroy TTL" },
        { name: "expire_time", type: "string", description: "Expire time" },
        { name: "ttl", type: "string", description: "TTL" },
        { name: "annotations", type: "map", description: "Annotations" }
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
          required: false,
          attributes: [
            { name: "next_rotation_time", type: "string" },
            { name: "rotation_period", type: "string" }
          ]
        },
        {
          name: "topics",
          required: false,
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
      { name: "create_time", type: "string", description: "Create time" }
    ]
  },
  {
    id: "firebase_project",
    name: "Firebase Project",
    description: "Firebase project",
    terraform_resource: "google_firebase_project",
    icon: DEVELOPER_TOOLS_ICONS['google_firebase_project'],
    inputs: {
      required: [
        { name: "project", type: "string", description: "Project ID" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Project ID" },
      { name: "display_name", type: "string", description: "Display name" },
      { name: "project_number", type: "string", description: "Project number" }
    ]
  }
];

// All developer tools terraform resources
export const DEVELOPER_TOOLS_TERRAFORM_RESOURCES = DEVELOPER_TOOLS_SERVICES.map(s => s.terraform_resource);

// Get developer tools service by terraform resource name
export function getDeveloperToolsServiceByTerraformResource(terraformResource: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get developer tools service by ID
export function getDeveloperToolsServiceById(id: string): DeveloperToolsServiceDefinition | undefined {
  return DEVELOPER_TOOLS_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a developer tools resource
export function isDeveloperToolsResource(terraformResource: string): boolean {
  return DEVELOPER_TOOLS_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get developer tools icon
export function getDeveloperToolsIcon(terraformResource: string): string | undefined {
  return DEVELOPER_TOOLS_ICONS[terraformResource];
}

