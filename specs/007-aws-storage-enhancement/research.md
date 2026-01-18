# Research: AWS Storage Schema Enhancement

**Date**: 2026-01-17
**Source**: Terraform Registry - AWS Provider Documentation

## Overview

Research findings from Terraform Registry for AWS storage services. This document contains the authoritative schema data for each service to be added or enhanced.

---

## Missing Services to Add

### 1. aws_s3_bucket_cors_configuration

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_cors_configuration

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| bucket | string | Name of the bucket |
| cors_rule | block | Set of CORS rules (up to 100 supported) |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| expected_bucket_owner | string | Account ID of expected bucket owner |

#### cors_rule Block
**Required:**
- `allowed_methods` (set(string)) - HTTP methods allowed (GET, PUT, HEAD, POST, DELETE)
- `allowed_origins` (set(string)) - Origins allowed to access the bucket

**Optional:**
- `allowed_headers` (set(string)) - Headers specified in Access-Control-Request-Headers
- `expose_headers` (set(string)) - Headers customers can access in response
- `id` (string) - Unique rule identifier (max 255 chars)
- `max_age_seconds` (number) - Browser cache time for preflight response

#### Outputs
| Name | Type | Description |
|------|------|-------------|
| id | string | Bucket name |

---

### 2. aws_s3_bucket_website_configuration

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_website_configuration

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| bucket | string | Name of the bucket |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| expected_bucket_owner | string | Account ID of expected bucket owner |
| error_document | block | Error document configuration |
| index_document | block | Index document configuration |
| redirect_all_requests_to | block | Redirect all requests configuration |
| routing_rule | block | Routing rules configuration |
| routing_rules | string | JSON array of routing rules |

#### error_document Block
- `key` (string, required) - Object key for 4XX errors

#### index_document Block
- `suffix` (string, required) - Suffix appended to directory requests

#### redirect_all_requests_to Block
- `host_name` (string, required) - Host for redirects
- `protocol` (string, optional) - http or https

#### routing_rule Block
- `condition` (block, optional) - Condition for redirect
  - `http_error_code_returned_equals` (string)
  - `key_prefix_equals` (string)
- `redirect` (block, required) - Redirect configuration
  - `host_name` (string)
  - `http_redirect_code` (string)
  - `protocol` (string) - http or https
  - `replace_key_prefix_with` (string)
  - `replace_key_with` (string)

#### Outputs
| Name | Type | Description |
|------|------|-------------|
| id | string | Bucket name |
| website_domain | string | Domain of website endpoint |
| website_endpoint | string | Website endpoint URL |

---

### 3. aws_s3_bucket_notification

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_notification

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| bucket | string | Name of the bucket |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| eventbridge | bool | Enable Amazon EventBridge notifications (default: false) |
| lambda_function | block | Lambda function notification config (multiple) |
| queue | block | SQS queue notification config |
| topic | block | SNS topic notification config |

#### lambda_function Block
**Required:**
- `events` (list(string)) - S3 event types (s3:ObjectCreated:*, s3:ObjectRemoved:*, etc.)
- `lambda_function_arn` (string) - Lambda function ARN

**Optional:**
- `id` (string) - Unique identifier
- `filter_prefix` (string) - Object key prefix filter
- `filter_suffix` (string) - Object key suffix filter

#### queue Block
**Required:**
- `events` (list(string)) - S3 event types
- `queue_arn` (string) - SQS queue ARN

**Optional:**
- `id` (string) - Unique identifier
- `filter_prefix` (string) - Object key prefix filter
- `filter_suffix` (string) - Object key suffix filter

#### topic Block
**Required:**
- `events` (list(string)) - S3 event types
- `topic_arn` (string) - SNS topic ARN

**Optional:**
- `id` (string) - Unique identifier
- `filter_prefix` (string) - Object key prefix filter
- `filter_suffix` (string) - Object key suffix filter

#### Outputs
None additional

---

### 4. aws_s3_bucket_replication_configuration

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_replication_configuration

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| bucket | string | Source S3 bucket name |
| role | string | IAM role ARN for S3 replication |
| rule | block | Replication rules configuration |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| token | string | Object Lock token for enabled buckets |

#### rule Block
**Required:**
- `status` (string) - "Enabled" or "Disabled"
- `destination` (block) - Target bucket configuration

**Optional:**
- `id` (string) - Max 255 characters
- `priority` (number) - Required for multiple rules; defaults to 0
- `prefix` (string) - Deprecated, conflicts with filter
- `filter` (block) - Conflicts with prefix
- `delete_marker_replication` (block) - V2 only
- `source_selection_criteria` (block) - Special selection criteria
- `existing_object_replication` (block) - Requires AWS Support

#### destination Block
**Required:**
- `bucket` (string) - Destination bucket ARN

**Optional:**
- `storage_class` (string) - STANDARD, REDUCED_REDUNDANCY, STANDARD_IA, ONEZONE_IA, INTELLIGENT_TIERING, GLACIER, DEEP_ARCHIVE, GLACIER_IR
- `account` (string) - Account ID
- `access_control_translation` (block)
- `encryption_configuration` (block)
- `metrics` (block)
- `replication_time` (block)

#### filter Block
- `prefix` (string)
- `tag` (block) - key, value
- `and` (block)

#### Outputs
| Name | Type | Description |
|------|------|-------------|
| id | string | Source bucket name |

---

### 5. aws_ebs_snapshot_copy

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ebs_snapshot_copy

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| source_snapshot_id | string | ARN of snapshot to copy |
| source_region | string | Region of source snapshot |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| description | string | Snapshot description |
| encrypted | bool | Whether snapshot is encrypted |
| kms_key_id | string | ARN for KMS encryption key |
| storage_tier | string | archive or standard (default: standard) |
| permanent_restore | bool | Permanently restore archived snapshot |
| temporary_restore_days | number | Days to temporarily restore |
| completion_duration_minutes | number | Time-based copy duration (15-2880, 15-min increments) |
| tags | map(string) | Resource tags |

#### Outputs
| Name | Type | Description |
|------|------|-------------|
| id | string | Snapshot ID (snap-xxxxx) |
| arn | string | Amazon Resource Name |
| owner_id | string | AWS account ID |
| owner_alias | string | amazon, aws-marketplace, or microsoft |
| volume_size | number | Storage capacity in GiB |
| data_encryption_key_id | string | Encryption key identifier |
| tags_all | map(string) | All tags including provider defaults |

#### Timeouts
- create: 10m
- delete: 10m

---

### 6. aws_glacier_vault_lock

**Source**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/glacier_vault_lock

#### Required Arguments
| Name | Type | Description |
|------|------|-------------|
| complete_lock | bool | Permanently apply lock policy (irreversible!) |
| policy | string | JSON IAM policy for vault lock |
| vault_name | string | Name of the Glacier Vault |

#### Optional Arguments
| Name | Type | Description |
|------|------|-------------|
| region | string | AWS region for resource management |
| ignore_deletion_error | bool | Ignore errors when deleting lock policy |

#### Outputs
| Name | Type | Description |
|------|------|-------------|
| id | string | Glacier Vault name |

---

## Enhancements for Existing Services

### aws_s3_bucket

**Additions from Terraform Registry:**
- `region` (string, optional) - AWS region for bucket management
- `timeouts` block:
  - create: 20m (default)
  - read: 20m (default)
  - update: 20m (default)
  - delete: 60m (default)

**Updated Outputs:**
- `bucket_region` (string) - AWS region housing the bucket
- `tags_all` (map(string)) - All tags including provider defaults

---

### aws_ebs_volume

**Additions from Terraform Registry:**
- `final_snapshot` (bool, optional) - Create snapshot before deletion
- `outpost_arn` (string, optional) - Amazon Resource Name of the Outpost
- `volume_initialization_rate` (number, optional) - S3 download rate in MiB/s

**Additional Outputs:**
- `create_time` (string) - Volume creation timestamp

---

### aws_efs_file_system

**Additions from Terraform Registry:**

**lifecycle_policy block additions:**
- `transition_to_archive` (string) - Transition to archive storage

**protection block (new):**
- `replication_overwrite` (string) - "ENABLED" or "DISABLED"

**Additional Outputs:**
- `availability_zone_id` (string) - AZ identifier for One Zone storage
- `name` (string) - Value of Name tag
- `owner_id` (string) - AWS account that created file system
- `size_in_bytes` (object) - Metered storage size with nested:
  - value (number)
  - value_in_ia (number)
  - value_in_standard (number)

---

## Icon Mapping for New Services

All new services will use existing icons from the AWS Architecture icon set:

| Service | Icon Path |
|---------|-----------|
| aws_s3_bucket_cors_configuration | Arch_Amazon-Simple-Storage-Service_64.svg |
| aws_s3_bucket_website_configuration | Arch_Amazon-Simple-Storage-Service_64.svg |
| aws_s3_bucket_notification | Arch_Amazon-Simple-Storage-Service_64.svg |
| aws_s3_bucket_replication_configuration | Arch_Amazon-Simple-Storage-Service_64.svg |
| aws_ebs_snapshot_copy | Arch_Amazon-Elastic-Block-Store_64.svg |
| aws_glacier_vault_lock | Arch_Amazon-Simple-Storage-Service-Glacier_64.svg |

---

## Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Use Terraform Registry raw markdown | Direct, accurate source | Terraform website (requires JS) |
| Add 6 missing services | Header listed 25, only 19 implemented | Keep as-is (incomplete) |
| Use existing S3/EBS/Glacier icons for sub-resources | Consistent with parent service | Create new custom icons |
| Add timeouts to interface | Terraform supports custom timeouts | Ignore timeouts |
