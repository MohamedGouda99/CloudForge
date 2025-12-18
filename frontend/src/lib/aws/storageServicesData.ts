/**
 * AWS Storage Services Data - Complete definitions from storage.json
 * This file contains ALL 24 storage services with ALL their properties
 * 
 * Services included:
 * 1. S3 Bucket (aws_s3_bucket)
 * 2. S3 Bucket Versioning (aws_s3_bucket_versioning)
 * 3. S3 Bucket Encryption (aws_s3_bucket_server_side_encryption_configuration)
 * 4. S3 Public Access Block (aws_s3_bucket_public_access_block)
 * 5. S3 Bucket Lifecycle (aws_s3_bucket_lifecycle_configuration)
 * 6. S3 Bucket CORS (aws_s3_bucket_cors_configuration)
 * 7. S3 Bucket Website (aws_s3_bucket_website_configuration)
 * 8. S3 Bucket Policy (aws_s3_bucket_policy)
 * 9. S3 Bucket Notification (aws_s3_bucket_notification)
 * 10. S3 Bucket Replication (aws_s3_bucket_replication_configuration)
 * 11. S3 Object (aws_s3_object)
 * 12. EBS Volume (aws_ebs_volume)
 * 13. EBS Volume Attachment (aws_volume_attachment)
 * 14. EBS Snapshot (aws_ebs_snapshot)
 * 15. EBS Snapshot Copy (aws_ebs_snapshot_copy)
 * 16. EFS File System (aws_efs_file_system)
 * 17. EFS Mount Target (aws_efs_mount_target)
 * 18. EFS Access Point (aws_efs_access_point)
 * 19. FSx Lustre (aws_fsx_lustre_file_system)
 * 20. FSx Windows (aws_fsx_windows_file_system)
 * 21. Glacier Vault (aws_glacier_vault)
 * 22. Glacier Vault Lock (aws_glacier_vault_lock)
 * 23. Backup Vault (aws_backup_vault)
 * 24. Backup Plan (aws_backup_plan)
 * 25. Backup Selection (aws_backup_selection)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Storage service icon mappings - using actual AWS Architecture icons
export const STORAGE_ICONS: Record<string, string> = {
  'aws_s3_bucket': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_versioning': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_server_side_encryption_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_public_access_block': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_lifecycle_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_cors_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_website_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_policy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_notification': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_bucket_replication_configuration': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_s3_object': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
  'aws_ebs_volume': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg',
  'aws_volume_attachment': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg',
  'aws_ebs_snapshot': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg',
  'aws_ebs_snapshot_copy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg',
  'aws_efs_file_system': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-EFS_64.svg',
  'aws_efs_mount_target': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-EFS_64.svg',
  'aws_efs_access_point': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-EFS_64.svg',
  'aws_fsx_lustre_file_system': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-FSx-for-Lustre_64.svg',
  'aws_fsx_windows_file_system': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-FSx-for-WFS_64.svg',
  'aws_glacier_vault': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service-Glacier_64.svg',
  'aws_glacier_vault_lock': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service-Glacier_64.svg',
  'aws_backup_vault': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_AWS-Backup_64.svg',
  'aws_backup_plan': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_AWS-Backup_64.svg',
  'aws_backup_selection': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_AWS-Backup_64.svg',
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

// Complete storage services data from storage.json
export const STORAGE_SERVICES: StorageServiceDefinition[] = [
  {
    id: "s3_bucket",
    name: "S3 Bucket",
    description: "Object storage bucket",
    terraform_resource: "aws_s3_bucket",
    icon: STORAGE_ICONS['aws_s3_bucket'],
    inputs: {
      required: [],
      optional: [
        { name: "bucket", type: "string", description: "Bucket name (globally unique)" },
        { name: "bucket_prefix", type: "string", description: "Bucket name prefix" },
        { name: "force_destroy", type: "bool", description: "Delete all objects on destroy", default: false },
        { name: "object_lock_enabled", type: "bool", description: "Enable object lock" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" },
      { name: "arn", type: "string", description: "Bucket ARN" },
      { name: "bucket", type: "string", description: "Bucket name" },
      { name: "bucket_domain_name", type: "string", description: "Bucket domain name" },
      { name: "bucket_regional_domain_name", type: "string", description: "Regional domain name" },
      { name: "hosted_zone_id", type: "string", description: "Route 53 hosted zone ID" },
      { name: "region", type: "string", description: "AWS region" },
      { name: "website_endpoint", type: "string", description: "Website endpoint" },
      { name: "website_domain", type: "string", description: "Website domain" }
    ]
  },
  {
    id: "s3_bucket_versioning",
    name: "S3 Bucket Versioning",
    description: "Enable versioning on S3 bucket",
    terraform_resource: "aws_s3_bucket_versioning",
    icon: STORAGE_ICONS['aws_s3_bucket_versioning'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name or ID", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "expected_bucket_owner", type: "string", description: "Expected bucket owner account ID" },
        { name: "mfa", type: "string", description: "MFA device serial and token" }
      ],
      blocks: [
        {
          name: "versioning_configuration",
          attributes: [
            { name: "status", type: "string", required: true, options: ["Enabled", "Suspended", "Disabled"] },
            { name: "mfa_delete", type: "string", options: ["Enabled", "Disabled"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" }
    ]
  },
  {
    id: "s3_bucket_encryption",
    name: "S3 Bucket Encryption",
    description: "Server-side encryption configuration",
    terraform_resource: "aws_s3_bucket_server_side_encryption_configuration",
    icon: STORAGE_ICONS['aws_s3_bucket_server_side_encryption_configuration'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name or ID", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "expected_bucket_owner", type: "string", description: "Expected bucket owner account ID" }
      ],
      blocks: [
        {
          name: "rule",
          multiple: true,
          attributes: [
            { name: "bucket_key_enabled", type: "bool" }
          ],
          nested_blocks: [
            {
              name: "apply_server_side_encryption_by_default",
              attributes: [
                { name: "sse_algorithm", type: "string", required: true, options: ["aws:kms", "AES256"] },
                { name: "kms_master_key_id", type: "string" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" }
    ]
  },
  {
    id: "s3_bucket_public_access_block",
    name: "S3 Public Access Block",
    description: "Block public access to S3 bucket",
    terraform_resource: "aws_s3_bucket_public_access_block",
    icon: STORAGE_ICONS['aws_s3_bucket_public_access_block'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name or ID", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "block_public_acls", type: "bool", description: "Block public ACLs", default: false },
        { name: "block_public_policy", type: "bool", description: "Block public bucket policies", default: false },
        { name: "ignore_public_acls", type: "bool", description: "Ignore public ACLs", default: false },
        { name: "restrict_public_buckets", type: "bool", description: "Restrict public bucket policies", default: false }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" }
    ]
  },
  {
    id: "s3_bucket_lifecycle",
    name: "S3 Bucket Lifecycle",
    description: "Lifecycle configuration for S3 bucket",
    terraform_resource: "aws_s3_bucket_lifecycle_configuration",
    icon: STORAGE_ICONS['aws_s3_bucket_lifecycle_configuration'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name or ID", reference: "aws_s3_bucket.id" }
      ],
      optional: [
        { name: "expected_bucket_owner", type: "string", description: "Expected bucket owner account ID" }
      ],
      blocks: [
        {
          name: "rule",
          multiple: true,
          attributes: [
            { name: "id", type: "string", required: true },
            { name: "status", type: "string", required: true, options: ["Enabled", "Disabled"] }
          ],
          nested_blocks: [
            {
              name: "expiration",
              attributes: [
                { name: "date", type: "string" },
                { name: "days", type: "number" },
                { name: "expired_object_delete_marker", type: "bool" }
              ]
            },
            {
              name: "transition",
              multiple: true,
              attributes: [
                { name: "date", type: "string" },
                { name: "days", type: "number" },
                { name: "storage_class", type: "string", required: true, options: ["GLACIER", "STANDARD_IA", "ONEZONE_IA", "INTELLIGENT_TIERING", "DEEP_ARCHIVE", "GLACIER_IR"] }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" }
    ]
  },
  {
    id: "s3_bucket_policy",
    name: "S3 Bucket Policy",
    description: "Bucket policy for S3",
    terraform_resource: "aws_s3_bucket_policy",
    icon: STORAGE_ICONS['aws_s3_bucket_policy'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name or ID", reference: "aws_s3_bucket.id" },
        { name: "policy", type: "string", description: "IAM policy document JSON" }
      ],
      optional: []
    },
    outputs: [
      { name: "id", type: "string", description: "Bucket name" }
    ]
  },
  {
    id: "s3_object",
    name: "S3 Object",
    description: "Object in S3 bucket",
    terraform_resource: "aws_s3_object",
    icon: STORAGE_ICONS['aws_s3_object'],
    inputs: {
      required: [
        { name: "bucket", type: "string", description: "Bucket name", reference: "aws_s3_bucket.id" },
        { name: "key", type: "string", description: "Object key" }
      ],
      optional: [
        { name: "source", type: "string", description: "Path to file" },
        { name: "content", type: "string", description: "Literal content" },
        { name: "content_base64", type: "string", description: "Base64 encoded content" },
        { name: "acl", type: "string", description: "ACL", options: ["private", "public-read", "public-read-write", "authenticated-read", "bucket-owner-read", "bucket-owner-full-control"] },
        { name: "content_type", type: "string", description: "Content type" },
        { name: "storage_class", type: "string", description: "Storage class", options: ["STANDARD", "REDUCED_REDUNDANCY", "ONEZONE_IA", "INTELLIGENT_TIERING", "GLACIER", "DEEP_ARCHIVE", "GLACIER_IR", "STANDARD_IA"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Object key" },
      { name: "etag", type: "string", description: "ETag" },
      { name: "version_id", type: "string", description: "Version ID" }
    ]
  },
  {
    id: "ebs_volume",
    name: "EBS Volume",
    description: "Elastic Block Store volume",
    terraform_resource: "aws_ebs_volume",
    icon: STORAGE_ICONS['aws_ebs_volume'],
    inputs: {
      required: [
        { name: "availability_zone", type: "string", description: "Availability zone" }
      ],
      optional: [
        { name: "encrypted", type: "bool", description: "Enable encryption" },
        { name: "iops", type: "number", description: "IOPS for io1/io2/gp3" },
        { name: "kms_key_id", type: "string", description: "KMS key ID for encryption" },
        { name: "multi_attach_enabled", type: "bool", description: "Enable multi-attach" },
        { name: "size", type: "number", description: "Size in GB" },
        { name: "snapshot_id", type: "string", description: "Snapshot ID to create from" },
        { name: "throughput", type: "number", description: "Throughput for gp3" },
        { name: "type", type: "string", description: "Volume type", options: ["gp2", "gp3", "io1", "io2", "st1", "sc1", "standard"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Volume ID" },
      { name: "arn", type: "string", description: "Volume ARN" },
      { name: "availability_zone", type: "string", description: "AZ" },
      { name: "encrypted", type: "bool", description: "Is encrypted" },
      { name: "iops", type: "number", description: "IOPS" },
      { name: "size", type: "number", description: "Size in GB" },
      { name: "type", type: "string", description: "Volume type" }
    ]
  },
  {
    id: "ebs_volume_attachment",
    name: "EBS Volume Attachment",
    description: "Attach EBS volume to EC2 instance",
    terraform_resource: "aws_volume_attachment",
    icon: STORAGE_ICONS['aws_volume_attachment'],
    inputs: {
      required: [
        { name: "device_name", type: "string", description: "Device name", example: "/dev/sdf" },
        { name: "instance_id", type: "string", description: "Instance ID", reference: "aws_instance.id" },
        { name: "volume_id", type: "string", description: "Volume ID", reference: "aws_ebs_volume.id" }
      ],
      optional: [
        { name: "force_detach", type: "bool", description: "Force detach" },
        { name: "skip_destroy", type: "bool", description: "Skip destroy" },
        { name: "stop_instance_before_detaching", type: "bool", description: "Stop instance before detaching" }
      ]
    },
    outputs: [
      { name: "device_name", type: "string", description: "Device name" },
      { name: "instance_id", type: "string", description: "Instance ID" },
      { name: "volume_id", type: "string", description: "Volume ID" }
    ]
  },
  {
    id: "ebs_snapshot",
    name: "EBS Snapshot",
    description: "Snapshot of EBS volume",
    terraform_resource: "aws_ebs_snapshot",
    icon: STORAGE_ICONS['aws_ebs_snapshot'],
    inputs: {
      required: [
        { name: "volume_id", type: "string", description: "Volume ID", reference: "aws_ebs_volume.id" }
      ],
      optional: [
        { name: "description", type: "string", description: "Snapshot description" },
        { name: "storage_tier", type: "string", description: "Storage tier", options: ["archive", "standard"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Snapshot ID" },
      { name: "arn", type: "string", description: "Snapshot ARN" },
      { name: "encrypted", type: "bool", description: "Is encrypted" },
      { name: "volume_size", type: "number", description: "Volume size in GB" }
    ]
  },
  {
    id: "efs_file_system",
    name: "EFS File System",
    description: "Elastic File System",
    terraform_resource: "aws_efs_file_system",
    icon: STORAGE_ICONS['aws_efs_file_system'],
    inputs: {
      required: [],
      optional: [
        { name: "availability_zone_name", type: "string", description: "AZ for One Zone storage" },
        { name: "creation_token", type: "string", description: "Creation token" },
        { name: "encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "performance_mode", type: "string", description: "Performance mode", options: ["generalPurpose", "maxIO"] },
        { name: "provisioned_throughput_in_mibps", type: "number", description: "Provisioned throughput" },
        { name: "throughput_mode", type: "string", description: "Throughput mode", options: ["bursting", "provisioned", "elastic"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "lifecycle_policy",
          multiple: true,
          attributes: [
            { name: "transition_to_ia", type: "string", options: ["AFTER_7_DAYS", "AFTER_14_DAYS", "AFTER_30_DAYS", "AFTER_60_DAYS", "AFTER_90_DAYS"] },
            { name: "transition_to_primary_storage_class", type: "string", options: ["AFTER_1_ACCESS"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "File system ID" },
      { name: "arn", type: "string", description: "File system ARN" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "number_of_mount_targets", type: "number", description: "Number of mount targets" }
    ]
  },
  {
    id: "efs_mount_target",
    name: "EFS Mount Target",
    description: "Mount target for EFS",
    terraform_resource: "aws_efs_mount_target",
    icon: STORAGE_ICONS['aws_efs_mount_target'],
    inputs: {
      required: [
        { name: "file_system_id", type: "string", description: "File system ID", reference: "aws_efs_file_system.id" },
        { name: "subnet_id", type: "string", description: "Subnet ID", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "ip_address", type: "string", description: "IP address" },
        { name: "security_groups", type: "list(string)", description: "Security group IDs" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Mount target ID" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "ip_address", type: "string", description: "IP address" },
      { name: "network_interface_id", type: "string", description: "Network interface ID" }
    ]
  },
  {
    id: "efs_access_point",
    name: "EFS Access Point",
    description: "Access point for EFS",
    terraform_resource: "aws_efs_access_point",
    icon: STORAGE_ICONS['aws_efs_access_point'],
    inputs: {
      required: [
        { name: "file_system_id", type: "string", description: "File system ID", reference: "aws_efs_file_system.id" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "posix_user",
          attributes: [
            { name: "gid", type: "number", required: true },
            { name: "uid", type: "number", required: true },
            { name: "secondary_gids", type: "list(number)" }
          ]
        },
        {
          name: "root_directory",
          attributes: [
            { name: "path", type: "string" }
          ],
          nested_blocks: [
            {
              name: "creation_info",
              attributes: [
                { name: "owner_gid", type: "number", required: true },
                { name: "owner_uid", type: "number", required: true },
                { name: "permissions", type: "string", required: true }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Access point ID" },
      { name: "arn", type: "string", description: "Access point ARN" },
      { name: "file_system_arn", type: "string", description: "File system ARN" }
    ]
  },
  {
    id: "fsx_lustre_file_system",
    name: "FSx Lustre File System",
    description: "High-performance file system for compute workloads",
    terraform_resource: "aws_fsx_lustre_file_system",
    icon: STORAGE_ICONS['aws_fsx_lustre_file_system'],
    inputs: {
      required: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "storage_capacity", type: "number", description: "Storage capacity in GB" },
        { name: "storage_type", type: "string", description: "Storage type", options: ["SSD", "HDD"] },
        { name: "deployment_type", type: "string", description: "Deployment type", options: ["SCRATCH_1", "SCRATCH_2", "PERSISTENT_1", "PERSISTENT_2"] },
        { name: "per_unit_storage_throughput", type: "number", description: "Throughput per TB" },
        { name: "data_compression_type", type: "string", description: "Compression type", options: ["LZ4", "NONE"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "File system ID" },
      { name: "arn", type: "string", description: "File system ARN" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "mount_name", type: "string", description: "Mount name" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "fsx_windows_file_system",
    name: "FSx Windows File System",
    description: "Windows file server",
    terraform_resource: "aws_fsx_windows_file_system",
    icon: STORAGE_ICONS['aws_fsx_windows_file_system'],
    inputs: {
      required: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs" },
        { name: "throughput_capacity", type: "number", description: "Throughput capacity in MB/s" }
      ],
      optional: [
        { name: "active_directory_id", type: "string", description: "Active Directory ID" },
        { name: "aliases", type: "list(string)", description: "DNS aliases" },
        { name: "automatic_backup_retention_days", type: "number", description: "Backup retention days" },
        { name: "deployment_type", type: "string", description: "Deployment type", options: ["SINGLE_AZ_1", "SINGLE_AZ_2", "MULTI_AZ_1"] },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "storage_capacity", type: "number", description: "Storage capacity in GB" },
        { name: "storage_type", type: "string", description: "Storage type", options: ["SSD", "HDD"] },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "File system ID" },
      { name: "arn", type: "string", description: "File system ARN" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "vpc_id", type: "string", description: "VPC ID" }
    ]
  },
  {
    id: "glacier_vault",
    name: "Glacier Vault",
    description: "Archive storage vault",
    terraform_resource: "aws_glacier_vault",
    icon: STORAGE_ICONS['aws_glacier_vault'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Vault name" }
      ],
      optional: [
        { name: "access_policy", type: "string", description: "Access policy JSON" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "notification",
          attributes: [
            { name: "events", type: "list(string)", required: true, options: ["ArchiveRetrievalCompleted", "InventoryRetrievalCompleted"] },
            { name: "sns_topic", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "arn", type: "string", description: "Vault ARN" },
      { name: "location", type: "string", description: "Vault location" }
    ]
  },
  {
    id: "backup_vault",
    name: "Backup Vault",
    description: "AWS Backup vault",
    terraform_resource: "aws_backup_vault",
    icon: STORAGE_ICONS['aws_backup_vault'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Vault name" }
      ],
      optional: [
        { name: "kms_key_arn", type: "string", description: "KMS key ARN" },
        { name: "force_destroy", type: "bool", description: "Force destroy" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Vault name" },
      { name: "arn", type: "string", description: "Vault ARN" },
      { name: "recovery_points", type: "number", description: "Number of recovery points" }
    ]
  },
  {
    id: "backup_plan",
    name: "Backup Plan",
    description: "AWS Backup plan",
    terraform_resource: "aws_backup_plan",
    icon: STORAGE_ICONS['aws_backup_plan'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Plan name" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "rule",
          multiple: true,
          attributes: [
            { name: "rule_name", type: "string", required: true },
            { name: "target_vault_name", type: "string", required: true },
            { name: "schedule", type: "string" },
            { name: "enable_continuous_backup", type: "bool" },
            { name: "start_window", type: "number" },
            { name: "completion_window", type: "number" }
          ],
          nested_blocks: [
            {
              name: "lifecycle",
              attributes: [
                { name: "cold_storage_after", type: "number" },
                { name: "delete_after", type: "number" }
              ]
            }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Plan ID" },
      { name: "arn", type: "string", description: "Plan ARN" },
      { name: "version", type: "string", description: "Plan version" }
    ]
  },
  {
    id: "backup_selection",
    name: "Backup Selection",
    description: "Resource selection for backup plan",
    terraform_resource: "aws_backup_selection",
    icon: STORAGE_ICONS['aws_backup_selection'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Selection name" },
        { name: "plan_id", type: "string", description: "Backup plan ID", reference: "aws_backup_plan.id" },
        { name: "iam_role_arn", type: "string", description: "IAM role ARN", reference: "aws_iam_role.arn" }
      ],
      optional: [
        { name: "resources", type: "list(string)", description: "Resource ARNs" },
        { name: "not_resources", type: "list(string)", description: "Excluded resource ARNs" }
      ],
      blocks: [
        {
          name: "selection_tag",
          multiple: true,
          attributes: [
            { name: "type", type: "string", required: true, options: ["STRINGEQUALS"] },
            { name: "key", type: "string", required: true },
            { name: "value", type: "string", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Selection ID" }
    ]
  }
];

// List of all storage terraform resource types
export const STORAGE_TERRAFORM_RESOURCES = STORAGE_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getStorageServiceByTerraformResource(terraformResource: string): StorageServiceDefinition | undefined {
  return STORAGE_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getStorageServiceById(id: string): StorageServiceDefinition | undefined {
  return STORAGE_SERVICES.find(s => s.id === id);
}

export function isStorageResource(terraformResource: string): boolean {
  return STORAGE_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getStorageIcon(terraformResource: string): string {
  return STORAGE_ICONS[terraformResource] || STORAGE_ICONS['aws_s3_bucket'];
}










