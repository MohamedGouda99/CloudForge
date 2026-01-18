# Implementation Plan: AWS Storage Schema Enhancement

**Branch**: `007-aws-storage-enhancement` | **Date**: 2026-01-17 | **Spec**: [spec.md](spec.md)
**Input**: Enhance AWS storage service schemas by fetching accurate Terraform Registry documentation and updating storageServicesData.ts

## Summary

Enhance all AWS storage service schemas in `storageServicesData.ts` by fetching accurate data from Terraform Registry documentation. Update arguments, attributes, nested blocks, outputs, data types, and timeouts to match official Terraform provider specifications.

## Technical Context

**Language/Version**: TypeScript 5.6+
**Primary Dependencies**: React 18, Vite
**Storage**: N/A (frontend schema data)
**Testing**: Vitest (if available), manual verification via Docker compose
**Target Platform**: Web browser
**Project Type**: Web application (frontend)
**Performance Goals**: Property editor loads instantly with all options
**Constraints**: Schema must match Terraform Registry documentation exactly
**Scale/Scope**: 25 storage services to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | PASS | TypeScript with type definitions, clear naming |
| II. Testing Standards | PASS | Schema accuracy verifiable via Terraform validate |
| III. User Experience Consistency | PASS | Property editor displays all options consistently |
| IV. Performance Requirements | PASS | No API changes, frontend-only schema update |

## Project Structure

### Documentation (this feature)

```text
specs/007-aws-storage-enhancement/
├── plan.md              # This file
├── research.md          # Terraform Registry research findings
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Implementation tasks (to be generated)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── lib/
│       └── aws/
│           └── storageServicesData.ts  # Target file for schema updates
└── public/
    └── cloud_icons/
        └── AWS/
            └── Architecture-Service-Icons_07312025/
                └── Arch_Storage/64/  # Available storage icons
```

**Structure Decision**: Frontend-only changes to `storageServicesData.ts`. No backend modifications required.

## Current State Analysis

### Existing Services (19 implemented)

| # | Service | Terraform Resource | Status |
|---|---------|-------------------|--------|
| 1 | S3 Bucket | aws_s3_bucket | Needs enhancement |
| 2 | S3 Bucket Versioning | aws_s3_bucket_versioning | Complete |
| 3 | S3 Bucket Encryption | aws_s3_bucket_server_side_encryption_configuration | Complete |
| 4 | S3 Public Access Block | aws_s3_bucket_public_access_block | Complete |
| 5 | S3 Bucket Lifecycle | aws_s3_bucket_lifecycle_configuration | Complete |
| 6 | S3 Bucket Policy | aws_s3_bucket_policy | Complete |
| 7 | S3 Object | aws_s3_object | Complete |
| 8 | EBS Volume | aws_ebs_volume | Needs enhancement |
| 9 | EBS Volume Attachment | aws_volume_attachment | Complete |
| 10 | EBS Snapshot | aws_ebs_snapshot | Complete |
| 11 | EFS File System | aws_efs_file_system | Needs enhancement |
| 12 | EFS Mount Target | aws_efs_mount_target | Complete |
| 13 | EFS Access Point | aws_efs_access_point | Complete |
| 14 | FSx Lustre | aws_fsx_lustre_file_system | Complete |
| 15 | FSx Windows | aws_fsx_windows_file_system | Complete |
| 16 | Glacier Vault | aws_glacier_vault | Complete |
| 17 | Backup Vault | aws_backup_vault | Complete |
| 18 | Backup Plan | aws_backup_plan | Complete |
| 19 | Backup Selection | aws_backup_selection | Complete |

### Missing Services (6 to add)

| # | Service | Terraform Resource | Icon Available |
|---|---------|-------------------|----------------|
| 1 | S3 Bucket CORS | aws_s3_bucket_cors_configuration | S3 icon |
| 2 | S3 Bucket Website | aws_s3_bucket_website_configuration | S3 icon |
| 3 | S3 Bucket Notification | aws_s3_bucket_notification | S3 icon |
| 4 | S3 Bucket Replication | aws_s3_bucket_replication_configuration | S3 icon |
| 5 | EBS Snapshot Copy | aws_ebs_snapshot_copy | EBS icon |
| 6 | Glacier Vault Lock | aws_glacier_vault_lock | Glacier icon |

### Available Storage Icons

```text
/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Storage/64/
├── Arch_Amazon-Simple-Storage-Service_64.svg        # S3 resources
├── Arch_Amazon-Elastic-Block-Store_64.svg           # EBS resources
├── Arch_Amazon-EFS_64.svg                           # EFS resources
├── Arch_Amazon-FSx-for-Lustre_64.svg               # FSx Lustre
├── Arch_Amazon-FSx-for-WFS_64.svg                  # FSx Windows
├── Arch_Amazon-FSx-for-NetApp-ONTAP_64.svg         # FSx ONTAP (not used)
├── Arch_Amazon-FSx-for-OpenZFS_64.svg              # FSx OpenZFS (not used)
├── Arch_Amazon-Simple-Storage-Service-Glacier_64.svg # Glacier
├── Arch_AWS-Backup_64.svg                          # Backup
├── Arch_AWS-Storage-Gateway_64.svg                 # Storage Gateway (not used)
├── Arch_AWS-Snowball_64.svg                        # Snowball (not used)
└── Arch_AWS-Snowball-Edge_64.svg                   # Snowball Edge (not used)
```

## Implementation Phases

### Phase 1: Add Missing Services
1. Add aws_s3_bucket_cors_configuration
2. Add aws_s3_bucket_website_configuration
3. Add aws_s3_bucket_notification
4. Add aws_s3_bucket_replication_configuration
5. Add aws_ebs_snapshot_copy
6. Add aws_glacier_vault_lock

### Phase 2: Enhance Existing Services
1. Update aws_s3_bucket with region, timeouts
2. Update aws_ebs_volume with final_snapshot, outpost_arn, volume_initialization_rate, create_time output
3. Update aws_efs_file_system with protection block, transition_to_archive, more outputs

### Phase 3: Verification
1. Run TypeScript type check
2. Rebuild Docker compose
3. Verify property editor displays all options

## Complexity Tracking

No constitution violations identified.

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing configurations | Additive changes only; no removals |
| Type mismatches | Use existing interface definitions |
| Icon path errors | Verify all icons exist before adding |
