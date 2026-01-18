# Feature Specification: AWS Storage Schema Enhancement

**Feature Branch**: `007-aws-storage-enhancement`
**Created**: 2026-01-17
**Status**: Draft
**Input**: Enhance AWS storage service schemas (aws_s3_bucket, aws_ebs_volume, aws_efs_file_system, etc.) by fetching accurate Terraform Registry documentation and updating storageServicesData.ts with correct arguments, attributes, nested blocks, outputs, data types, and timeouts.

## User Scenarios & Testing

### User Story 1 - Accurate S3 Bucket Configuration (Priority: P1)

As a cloud architect using the visual designer, I need the S3 Bucket resource to display all available configuration options (bucket name, versioning, encryption, lifecycle policies, etc.) so that I can accurately design my storage infrastructure without consulting external documentation.

**Why this priority**: S3 is the most commonly used AWS storage service; accurate schema data is critical for generating valid Terraform configurations.

**Independent Test**: Can be verified by placing an S3 Bucket on the canvas and confirming all documented Terraform arguments, attributes, and outputs are available in the property editor.

**Acceptance Scenarios**:

1. **Given** a user places an S3 Bucket on the canvas, **When** they open the property editor, **Then** they see all required and optional arguments matching Terraform Registry documentation
2. **Given** a user configures an S3 Bucket, **When** they generate Terraform code, **Then** the output includes all configured properties with correct data types
3. **Given** a user views S3 Bucket outputs, **When** they reference output attributes, **Then** all documented outputs (arn, bucket_domain_name, hosted_zone_id, etc.) are available

---

### User Story 2 - Accurate EBS Volume Configuration (Priority: P1)

As a cloud architect, I need the EBS Volume resource to show all configuration options (availability zone, volume type, IOPS, encryption, snapshots, etc.) so that I can properly design block storage for EC2 instances.

**Why this priority**: EBS volumes are essential for EC2 compute workloads; accurate configuration ensures proper storage attachment and performance tuning.

**Independent Test**: Can be verified by placing an EBS Volume on the canvas and confirming all Terraform arguments and outputs match the registry documentation.

**Acceptance Scenarios**:

1. **Given** a user places an EBS Volume on the canvas, **When** they open the property editor, **Then** they see availability_zone as required and all optional arguments (encrypted, iops, size, type, throughput, final_snapshot, etc.)
2. **Given** a user configures an io2 volume, **When** they set IOPS and multi-attach, **Then** the configuration validates these options are compatible
3. **Given** a user generates Terraform, **When** they view outputs, **Then** arn, id, and create_time attributes are available for reference

---

### User Story 3 - Accurate EFS File System Configuration (Priority: P1)

As a cloud architect, I need the EFS File System resource to display all configuration options (performance mode, throughput mode, encryption, lifecycle policies, protection settings) so that I can design shared file storage correctly.

**Why this priority**: EFS provides shared storage across multiple EC2 instances; accurate schema ensures proper network file system configuration.

**Independent Test**: Can be verified by placing an EFS File System on the canvas and confirming all Terraform arguments, blocks, and outputs are accurate.

**Acceptance Scenarios**:

1. **Given** a user places an EFS File System on the canvas, **When** they open the property editor, **Then** they see throughput_mode options (bursting, provisioned, elastic) and performance_mode options (generalPurpose, maxIO)
2. **Given** a user configures lifecycle policies, **When** they add transition rules, **Then** transition_to_ia, transition_to_archive, and transition_to_primary_storage_class options are available
3. **Given** a user views EFS outputs, **When** they reference attributes, **Then** dns_name, size_in_bytes, owner_id, and availability_zone_id are available

---

### User Story 4 - Complete Storage Service Coverage (Priority: P2)

As a cloud architect, I need all AWS storage services (S3 bucket configurations, EBS snapshots, EFS mount targets, FSx systems, Glacier vaults, Backup plans) to have accurate schemas so that I can design comprehensive storage solutions.

**Why this priority**: Full coverage ensures architects can design complete storage architectures without gaps.

**Independent Test**: Can be verified by checking each storage resource type in the catalog and confirming property completeness.

**Acceptance Scenarios**:

1. **Given** a user browses storage services, **When** they view any storage resource, **Then** the schema matches current Terraform Registry documentation
2. **Given** a user configures related S3 resources (versioning, encryption, lifecycle), **When** they set properties, **Then** all nested blocks and attributes are accurate

---

### Edge Cases

- What happens when a user configures conflicting options (e.g., bucket and bucket_prefix both set on S3)?
- How does system handle deprecated arguments that still exist in Terraform?
- What happens when required attributes are missing from configuration?
- How are timeouts displayed and configured for resources that support them?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display all required arguments for each storage resource type as documented in Terraform Registry
- **FR-002**: System MUST display all optional arguments with correct data types (string, number, bool, list, map)
- **FR-003**: System MUST display nested blocks with their attributes for complex configurations (e.g., lifecycle_policy, protection blocks)
- **FR-004**: System MUST display all exported attributes/outputs for each resource type
- **FR-005**: System MUST display timeout configurations where applicable (create, read, update, delete)
- **FR-006**: System MUST mark deprecated arguments appropriately when displaying options
- **FR-007**: System MUST provide accurate descriptions matching Terraform documentation
- **FR-008**: System MUST support select/dropdown options for enumerated values (e.g., volume types, storage classes)

### Key Entities

- **StorageServiceDefinition**: Represents a storage resource type with id, name, description, terraform_resource, icon, inputs (required/optional/blocks), and outputs
- **ServiceInput**: Represents an input argument with name, type, description, default value, options, and reference information
- **ServiceBlock**: Represents a nested configuration block with name, attributes, and nested_blocks
- **ServiceOutput**: Represents an exported attribute with name, type, and description

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of AWS storage service schemas match Terraform Registry documentation (arguments, attributes, outputs)
- **SC-002**: All 25 storage services in storageServicesData.ts have complete and accurate schemas
- **SC-003**: Generated Terraform code from storage resources passes `terraform validate` on first attempt
- **SC-004**: Property editor displays all available options without requiring external documentation lookup
- **SC-005**: Schema data includes timeout values for resources that support custom timeouts

## Assumptions

- Terraform Registry documentation is the authoritative source for schema accuracy
- The existing StorageServiceDefinition interface supports all required schema properties
- Changes are backward compatible with existing canvas configurations
- Deprecated arguments are still included but marked appropriately

## Scope Boundaries

**In Scope**:
- All 25 storage services listed in storageServicesData.ts
- Arguments, attributes, nested blocks, outputs, and timeouts
- Data type accuracy and enumeration options

**Out of Scope**:
- Adding new storage services not already in storageServicesData.ts
- Backend API changes
- Visual designer UI changes
- Azure/GCP storage services
