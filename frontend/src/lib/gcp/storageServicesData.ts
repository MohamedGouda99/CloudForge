/**
 * GCP Storage Services Data - Complete definitions from storage.json
 * This file contains ALL 8 storage services with ALL their properties
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

// GCP Storage service icon mappings - using GCP core products and legacy icons
export const STORAGE_ICONS: Record<string, string> = {
  'google_storage_bucket': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
  'google_storage_bucket_object': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
  'google_storage_bucket_iam_binding': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
  'google_storage_bucket_acl': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
  'google_storage_notification': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
  'google_storage_transfer_job': '/api/icons/gcp/google-cloud-legacy-icons/data_transfer/data_transfer.svg',
  'google_filestore_instance': '/api/icons/gcp/google-cloud-legacy-icons/filestore/filestore.svg',
  'google_filestore_backup': '/api/icons/gcp/google-cloud-legacy-icons/filestore/filestore.svg',
};

// Storage service definition interface
export interface StorageServiceDefinition {
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

// Complete storage services data - manually defined
export const STORAGE_SERVICES: StorageServiceDefinition[] = [
  {
    id: "storage_bucket",
    name: "Cloud Storage Bucket",
    description: "Google Cloud Storage bucket for object storage",
    terraform_resource: "google_storage_bucket",
    icon: STORAGE_ICONS['google_storage_bucket'],
    inputs: {
        required: [
          { name: "name", type: "string", description: "Globally unique bucket name" },
          { name: "location", type: "string", description: "Bucket location", options: ["US", "EU", "ASIA", "us-central1", "us-east1", "us-west1", "europe-west1", "asia-east1"] }
        ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "storage_class", type: "string", description: "Storage class", options: ["STANDARD", "NEARLINE", "COLDLINE", "ARCHIVE", "MULTI_REGIONAL", "REGIONAL"], default: "STANDARD" },
        { name: "force_destroy", type: "bool", description: "Force delete non-empty bucket", default: false },
        { name: "uniform_bucket_level_access", type: "bool", description: "Uniform bucket-level access", default: false },
        { name: "public_access_prevention", type: "string", description: "Public access prevention", options: ["inherited", "enforced"] },
        { name: "default_event_based_hold", type: "bool", description: "Default event-based hold" },
        { name: "requester_pays", type: "bool", description: "Requester pays", default: false },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: [
        {
          name: "versioning",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true }
          ]
        },
        {
          name: "website",
          required: false,
          attributes: [
            { name: "main_page_suffix", type: "string" },
            { name: "not_found_page", type: "string" }
          ]
        },
        {
          name: "cors",
          required: false,
          multiple: true,
          attributes: [
            { name: "origin", type: "list" },
            { name: "method", type: "list" },
            { name: "response_header", type: "list" },
            { name: "max_age_seconds", type: "number" }
          ]
        },
        {
          name: "lifecycle_rule",
          required: false,
          multiple: true,
          attributes: [],
          blocks: [
            {
              name: "action",
              required: true,
              attributes: [
                { name: "type", type: "string", options: ["Delete", "SetStorageClass", "AbortIncompleteMultipartUpload"], required: true },
                { name: "storage_class", type: "string" }
              ]
            },
            {
              name: "condition",
              required: true,
              attributes: [
                { name: "age", type: "number" },
                { name: "created_before", type: "string" },
                { name: "custom_time_before", type: "string" },
                { name: "days_since_custom_time", type: "number" },
                { name: "days_since_noncurrent_time", type: "number" },
                { name: "noncurrent_time_before", type: "string" },
                { name: "num_newer_versions", type: "number" },
                { name: "with_state", type: "string", options: ["LIVE", "ARCHIVED", "ANY"] },
                { name: "matches_storage_class", type: "list" },
                { name: "matches_prefix", type: "list" },
                { name: "matches_suffix", type: "list" }
              ]
            }
          ]
        },
        {
          name: "retention_policy",
          required: false,
          attributes: [
            { name: "is_locked", type: "bool" },
            { name: "retention_period", type: "number", required: true }
          ]
        },
        {
          name: "logging",
          required: false,
          attributes: [
            { name: "log_bucket", type: "string", required: true },
            { name: "log_object_prefix", type: "string" }
          ]
        },
        {
          name: "encryption",
          required: false,
          attributes: [
            { name: "default_kms_key_name", type: "string", required: true }
          ]
        },
        {
          name: "autoclass",
          required: false,
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "terminal_storage_class", type: "string", options: ["NEARLINE", "ARCHIVE"] }
          ]
        },
        {
          name: "custom_placement_config",
          required: false,
          attributes: [
            { name: "data_locations", type: "list", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "url", type: "string", description: "gs:// URL" }
    ]
  },
  {
    id: "storage_bucket_object",
    name: "Storage Object",
    description: "Object in Cloud Storage bucket",
    terraform_resource: "google_storage_bucket_object",
    icon: STORAGE_ICONS['google_storage_bucket_object'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Object name" },
        { name: "bucket", type: "string", description: "Bucket name" }
      ],
      optional: [
        { name: "content", type: "string", description: "Object content as string" },
        { name: "source", type: "string", description: "Local file path" },
        { name: "content_type", type: "string", description: "Content type" },
        { name: "content_disposition", type: "string", description: "Content-Disposition" },
        { name: "content_encoding", type: "string", description: "Content-Encoding" },
        { name: "content_language", type: "string", description: "Content-Language" },
        { name: "cache_control", type: "string", description: "Cache-Control" },
        { name: "storage_class", type: "string", description: "Storage class" },
        { name: "metadata", type: "map", description: "Metadata" },
        { name: "kms_key_name", type: "string", description: "KMS key name" },
        { name: "event_based_hold", type: "bool", description: "Event-based hold" },
        { name: "temporary_hold", type: "bool", description: "Temporary hold" }
      ],
      blocks: [
        {
          name: "customer_encryption",
          required: false,
          attributes: [
            { name: "encryption_algorithm", type: "string" },
            { name: "encryption_key", type: "string", required: true, sensitive: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Object ID" },
      { name: "self_link", type: "string", description: "Self link" },
      { name: "output_name", type: "string", description: "Output name" },
      { name: "crc32c", type: "string", description: "CRC32C hash" },
      { name: "md5hash", type: "string", description: "MD5 hash" },
      { name: "media_link", type: "string", description: "Media download link" }
    ]
  },
  {
    id: "storage_bucket_iam_binding",
    name: "Bucket IAM Binding",
    description: "IAM binding for Cloud Storage bucket",
    terraform_resource: "google_storage_bucket_iam_binding",
    icon: STORAGE_ICONS['google_storage_bucket_iam_binding'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name" },
        { name: "role", type: "string", description: "IAM role", options: ["roles/storage.admin", "roles/storage.objectAdmin", "roles/storage.objectCreator", "roles/storage.objectViewer", "roles/storage.legacyBucketOwner", "roles/storage.legacyBucketReader", "roles/storage.legacyBucketWriter", "roles/storage.legacyObjectOwner", "roles/storage.legacyObjectReader"] },
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
    id: "storage_bucket_acl",
    name: "Bucket ACL",
    description: "Access control list for bucket",
    terraform_resource: "google_storage_bucket_acl",
    icon: STORAGE_ICONS['google_storage_bucket_acl'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name" }
      ],
      optional: [
        { name: "predefined_acl", type: "string", description: "Predefined ACL", options: ["authenticatedRead", "bucketOwnerFullControl", "bucketOwnerRead", "private", "projectPrivate", "publicRead", "publicReadWrite"] },
        { name: "default_acl", type: "string", description: "Default object ACL" },
        { name: "role_entity", type: "list", description: "Role entity pairs" }
      ],
      blocks: []
    },
    outputs: []
  },
  {
    id: "storage_notification",
    name: "Storage Notification",
    description: "Pub/Sub notification for bucket events",
    terraform_resource: "google_storage_notification",
    icon: STORAGE_ICONS['google_storage_notification'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name" },
        { name: "payload_format", type: "string", description: "Payload format", options: ["JSON_API_V1", "NONE"] },
        { name: "topic", type: "string", description: "Pub/Sub topic" }
      ],
      optional: [
        { name: "custom_attributes", type: "map", description: "Custom attributes" },
        { name: "event_types", type: "list", description: "Event types", options: ["OBJECT_FINALIZE", "OBJECT_METADATA_UPDATE", "OBJECT_DELETE", "OBJECT_ARCHIVE"] },
        { name: "object_name_prefix", type: "string", description: "Object name prefix filter" }
      ],
      blocks: []
    },
    outputs: [
      { name: "notification_id", type: "string", description: "Notification ID" },
      { name: "self_link", type: "string", description: "Self link" }
    ]
  },
  {
    id: "storage_transfer_job",
    name: "Storage Transfer Job",
    description: "Transfer job for moving data",
    terraform_resource: "google_storage_transfer_job",
    icon: STORAGE_ICONS['google_storage_transfer_job'],
    inputs: {
      required: [
        { name: "description", type: "string", description: "Job description" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "status", type: "string", description: "Job status", options: ["ENABLED", "DISABLED", "DELETED"] }
      ],
      blocks: [
        {
          name: "transfer_spec",
          required: true,
          attributes: [],
          blocks: [
            {
              name: "gcs_data_sink",
              attributes: [
                { name: "bucket_name", type: "string", required: true },
                { name: "path", type: "string" }
              ]
            },
            {
              name: "gcs_data_source",
              attributes: [
                { name: "bucket_name", type: "string", required: true },
                { name: "path", type: "string" }
              ]
            },
            {
              name: "aws_s3_data_source",
              attributes: [
                { name: "bucket_name", type: "string", required: true },
                { name: "role_arn", type: "string" }
              ],
              blocks: [
                {
                  name: "aws_access_key",
                  attributes: [
                    { name: "access_key_id", type: "string", required: true, sensitive: true },
                    { name: "secret_access_key", type: "string", required: true, sensitive: true }
                  ]
                }
              ]
            },
            {
              name: "http_data_source",
              attributes: [
                { name: "list_url", type: "string", required: true }
              ]
            },
            {
              name: "azure_blob_storage_data_source",
              attributes: [
                { name: "storage_account", type: "string", required: true },
                { name: "container", type: "string", required: true },
                { name: "path", type: "string" }
              ],
              blocks: [
                {
                  name: "azure_credentials",
                  attributes: [
                    { name: "sas_token", type: "string", required: true, sensitive: true }
                  ]
                }
              ]
            },
            {
              name: "object_conditions",
              attributes: [
                { name: "min_time_elapsed_since_last_modification", type: "string" },
                { name: "max_time_elapsed_since_last_modification", type: "string" },
                { name: "include_prefixes", type: "list" },
                { name: "exclude_prefixes", type: "list" },
                { name: "last_modified_since", type: "string" },
                { name: "last_modified_before", type: "string" }
              ]
            },
            {
              name: "transfer_options",
              attributes: [
                { name: "overwrite_objects_already_existing_in_sink", type: "bool" },
                { name: "delete_objects_unique_in_sink", type: "bool" },
                { name: "delete_objects_from_source_after_transfer", type: "bool" },
                { name: "overwrite_when", type: "string", options: ["ALWAYS", "DIFFERENT", "NEVER"] }
              ]
            }
          ]
        },
        {
          name: "schedule",
          required: false,
          attributes: [
            { name: "repeat_interval", type: "string" }
          ],
          blocks: [
            {
              name: "schedule_start_date",
              required: true,
              attributes: [
                { name: "year", type: "number", required: true },
                { name: "month", type: "number", required: true },
                { name: "day", type: "number", required: true }
              ]
            },
            {
              name: "schedule_end_date",
              attributes: [
                { name: "year", type: "number", required: true },
                { name: "month", type: "number", required: true },
                { name: "day", type: "number", required: true }
              ]
            },
            {
              name: "start_time_of_day",
              attributes: [
                { name: "hours", type: "number", required: true },
                { name: "minutes", type: "number", required: true },
                { name: "seconds", type: "number", required: true },
                { name: "nanos", type: "number", required: true }
              ]
            }
          ]
        },
        {
          name: "notification_config",
          required: false,
          attributes: [
            { name: "pubsub_topic", type: "string", required: true },
            { name: "event_types", type: "list" },
            { name: "payload_format", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "name", type: "string", description: "Job name" },
      { name: "creation_time", type: "string", description: "Creation time" },
      { name: "last_modification_time", type: "string", description: "Last modification" },
      { name: "deletion_time", type: "string", description: "Deletion time" }
    ]
  },
  {
    id: "filestore_instance",
    name: "Filestore Instance",
    description: "Managed file storage for applications",
    terraform_resource: "google_filestore_instance",
    icon: STORAGE_ICONS['google_filestore_instance'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Instance name" },
        { name: "location", type: "string", description: "Zone or region" },
        { name: "tier", type: "string", description: "Service tier", options: ["STANDARD", "PREMIUM", "BASIC_HDD", "BASIC_SSD", "HIGH_SCALE_SSD", "ZONAL", "REGIONAL", "ENTERPRISE"] }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" },
        { name: "kms_key_name", type: "string", description: "KMS key name" }
      ],
      blocks: [
        {
          name: "file_shares",
          required: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "capacity_gb", type: "number", required: true },
            { name: "source_backup", type: "string" }
          ],
          blocks: [
            {
              name: "nfs_export_options",
              required: false,
              multiple: true,
              attributes: [
                { name: "ip_ranges", type: "list" },
                { name: "access_mode", type: "string", options: ["READ_ONLY", "READ_WRITE"] },
                { name: "squash_mode", type: "string", options: ["NO_ROOT_SQUASH", "ROOT_SQUASH"] },
                { name: "anon_uid", type: "number" },
                { name: "anon_gid", type: "number" }
              ]
            }
          ]
        },
        {
          name: "networks",
          required: true,
          multiple: true,
          attributes: [
            { name: "network", type: "string", required: true },
            { name: "modes", type: "list", options: ["ADDRESS_MODE_UNSPECIFIED", "MODE_IPV4"], required: true },
            { name: "reserved_ip_range", type: "string" },
            { name: "connect_mode", type: "string", options: ["DIRECT_PEERING", "PRIVATE_SERVICE_ACCESS"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "create_time", type: "string", description: "Creation time" },
      { name: "etag", type: "string", description: "ETag" },
      { name: "networks", type: "list", description: "Network info with IPs" }
    ]
  },
  {
    id: "filestore_backup",
    name: "Filestore Backup",
    description: "Backup of Filestore instance",
    terraform_resource: "google_filestore_backup",
    icon: STORAGE_ICONS['google_filestore_backup'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Backup name" },
        { name: "location", type: "string", description: "Region" },
        { name: "source_instance", type: "string", description: "Source instance" },
        { name: "source_file_share", type: "string", description: "Source file share" }
      ],
      optional: [
        { name: "project", type: "string", description: "Project ID" },
        { name: "description", type: "string", description: "Description" },
        { name: "labels", type: "map", description: "Labels" }
      ],
      blocks: []
    },
    outputs: [
      { name: "id", type: "string", description: "Backup ID" },
      { name: "state", type: "string", description: "Backup state" },
      { name: "create_time", type: "string", description: "Creation time" },
      { name: "capacity_gb", type: "string", description: "Capacity" },
      { name: "storage_bytes", type: "string", description: "Storage used" },
      { name: "download_bytes", type: "string", description: "Download size" }
    ]
  }
];

// All storage terraform resources
export const STORAGE_TERRAFORM_RESOURCES = STORAGE_SERVICES.map(s => s.terraform_resource);

// Get storage service by terraform resource name
export function getStorageServiceByTerraformResource(terraformResource: string): StorageServiceDefinition | undefined {
  return STORAGE_SERVICES.find(service => service.terraform_resource === terraformResource);
}

// Get storage service by ID
export function getStorageServiceById(id: string): StorageServiceDefinition | undefined {
  return STORAGE_SERVICES.find(service => service.id === id);
}

// Check if a terraform resource is a storage resource
export function isStorageResource(terraformResource: string): boolean {
  return STORAGE_TERRAFORM_RESOURCES.includes(terraformResource);
}

// Get storage icon
export function getStorageIcon(terraformResource: string): string | undefined {
  return STORAGE_ICONS[terraformResource];
}
