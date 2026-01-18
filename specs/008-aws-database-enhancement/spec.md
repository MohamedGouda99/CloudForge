# Feature Specification: AWS Database Schema Enhancement

**Feature Branch**: `008-aws-database-enhancement`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Enhance AWS Database service schemas by fetching accurate Terraform Registry documentation and updating databaseServicesData.ts with correct arguments, attributes, nested blocks, outputs, data types, and timeouts."

## User Scenarios & Testing

### User Story 1 - Accurate RDS Instance Configuration (Priority: P1) MVP

Infrastructure engineers using CloudForge need to configure RDS database instances with all available Terraform options including timeouts, restore configurations, and performance settings. Currently, the schema is missing several key arguments and outputs that exist in the official Terraform Registry documentation.

**Why this priority**: RDS is the most commonly used database service in AWS. Missing timeouts causes Terraform apply operations to fail unexpectedly. Missing outputs prevents users from referencing critical values like hosted_zone_id and resource_id.

**Independent Test**: Place an RDS Instance on the canvas, verify all arguments appear in the property panel including timeouts block, restore_to_point_in_time block with all attributes, and verify outputs include resource_id, status, availability_zone, and hosted_zone_id.

**Acceptance Scenarios**:

1. **Given** a user places an RDS Instance on the canvas, **When** they open the property panel, **Then** they see timeouts block with create/update/delete options (default create: 40m, update: 80m, delete: 60m)
2. **Given** a user configures an RDS Instance, **When** they view available outputs, **Then** they see resource_id, status, availability_zone, and hosted_zone_id in addition to existing outputs
3. **Given** a user needs point-in-time recovery, **When** they expand restore_to_point_in_time block, **Then** they see source_dbi_resource_id option in addition to existing attributes

---

### User Story 2 - Complete RDS Supporting Services (Priority: P1)

Infrastructure engineers need to configure RDS supporting services that are listed in the file header but not implemented: DB Option Group and RDS Proxy. These are essential for Oracle/SQL Server TDE encryption, APEX, and connection pooling scenarios.

**Why this priority**: DB Option Group is required for Oracle/SQL Server features like TDE and APEX. RDS Proxy is essential for serverless applications that need connection pooling.

**Independent Test**: Browse database services catalog, locate DB Option Group and RDS Proxy services, place them on canvas, verify all arguments/outputs match Terraform Registry.

**Acceptance Scenarios**:

1. **Given** a user browses database services, **When** they search for DB Option Group, **Then** the service appears with engine_name, major_engine_version (required), and option block
2. **Given** a user configures a DB Option Group, **When** they add an option, **Then** they can specify option_name (required), version, port, vpc_security_group_memberships, db_security_group_memberships, and option_settings
3. **Given** a user places an RDS Proxy, **When** they configure it, **Then** they see name, engine_family, role_arn, vpc_subnet_ids (required), auth block, debug_logging, idle_client_timeout, require_tls
4. **Given** a user views RDS Proxy outputs, **When** reviewing available attributes, **Then** they see arn, endpoint, and id

---

### User Story 3 - Accurate Aurora Cluster Configuration (Priority: P1)

Infrastructure engineers configuring Aurora Serverless v2 need access to the complete serverlessv2_scaling_configuration block including the new seconds_until_auto_pause parameter for auto-pause functionality.

**Why this priority**: Aurora Serverless v2 with auto-pause is a cost-saving feature that requires the seconds_until_auto_pause parameter. Missing this prevents users from enabling auto-pause.

**Independent Test**: Place an Aurora Cluster on canvas, configure serverlessv2_scaling_configuration block, verify min_capacity supports 0 (for auto-pause), max_capacity, and seconds_until_auto_pause parameters.

**Acceptance Scenarios**:

1. **Given** a user configures Aurora Serverless v2, **When** they expand serverlessv2_scaling_configuration, **Then** they see min_capacity, max_capacity, and seconds_until_auto_pause parameters
2. **Given** a user sets min_capacity to 0, **When** they configure seconds_until_auto_pause, **Then** they can specify 300-86400 seconds for auto-pause delay
3. **Given** a user views Aurora Cluster outputs, **When** checking available attributes, **Then** they see cluster_resource_id, hosted_zone_id, and cluster_members

---

### User Story 4 - Enhanced DynamoDB Configuration (Priority: P2)

Infrastructure engineers need DynamoDB Global Table support (V1) or replica configuration (V2) for multi-region deployments, plus missing attributes like import_table, on_demand_throughput, and warm_throughput blocks.

**Why this priority**: Multi-region DynamoDB is critical for globally distributed applications. Import table functionality allows initial data loading.

**Independent Test**: Place a DynamoDB Table on canvas, verify replica block for V2 global tables, import_table block for data import, and on_demand_throughput block.

**Acceptance Scenarios**:

1. **Given** a user configures DynamoDB Global Table V2, **When** they add a replica block, **Then** they can specify region_name (required), kms_key_arn, point_in_time_recovery, propagate_tags
2. **Given** a user needs to import data, **When** they expand import_table block, **Then** they see s3_bucket_source, input_format, and input_compression_type options
3. **Given** a user views DynamoDB outputs, **When** reviewing attributes, **Then** they see stream_label and tags_all in addition to existing outputs

---

### User Story 5 - ElastiCache and Redis Enhancements (Priority: P2)

Infrastructure engineers configuring ElastiCache need access to log delivery configuration, serverless scaling, and complete outputs for monitoring integration.

**Why this priority**: Log delivery to CloudWatch/Kinesis is essential for monitoring. Serverless cache configuration reduces operational overhead.

**Independent Test**: Place ElastiCache Replication Group, verify log_delivery_configuration block and all outputs including member_clusters.

**Acceptance Scenarios**:

1. **Given** a user configures ElastiCache Replication Group, **When** they expand log_delivery_configuration, **Then** they can specify destination, destination_type, log_format, log_type
2. **Given** a user views ElastiCache outputs, **When** reviewing attributes, **Then** they see member_clusters, engine_version_actual, and cluster_enabled

---

### User Story 6 - Timeouts for All Database Services (Priority: P2)

All database services should have appropriate timeouts blocks to handle long-running create/update/delete operations.

**Why this priority**: Database operations often take longer than default timeouts. Missing timeouts causes unexpected failures.

**Independent Test**: Verify each database service has a timeouts block with appropriate defaults based on Terraform Registry documentation.

**Acceptance Scenarios**:

1. **Given** a user configures any database service, **When** they expand timeouts block, **Then** they see create, update, delete options with appropriate defaults
2. **Given** RDS Instance timeouts, **When** viewing defaults, **Then** create=40m, update=80m, delete=60m
3. **Given** Aurora Cluster timeouts, **When** viewing defaults, **Then** create=120m, update=120m, delete=120m

---

### Edge Cases

- What happens when option_group engine_name doesn't match db_instance engine?
  - Display warning in validation but allow configuration
- How does system handle RDS Proxy without Secrets Manager secret?
  - auth block's secret_arn should be marked as required
- What if DynamoDB replica region is same as primary?
  - Display validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST add aws_db_option_group service with engine_name, major_engine_version (required), option block with option_name, version, port, vpc_security_group_memberships, db_security_group_memberships, option_settings nested block
- **FR-002**: System MUST add aws_db_proxy service with name, engine_family, role_arn, vpc_subnet_ids (required), auth block, debug_logging, idle_client_timeout, require_tls, and outputs arn, endpoint, id
- **FR-003**: System MUST enhance aws_db_instance with timeouts block (create: 40m, update: 80m, delete: 60m), additional outputs (resource_id, status, availability_zone, hosted_zone_id)
- **FR-004**: System MUST enhance aws_rds_cluster serverlessv2_scaling_configuration with seconds_until_auto_pause parameter (300-86400)
- **FR-005**: System MUST enhance aws_dynamodb_table with replica block, import_table block, on_demand_throughput block, and additional outputs (stream_label, tags_all)
- **FR-006**: System MUST add timeouts blocks to all database services with Terraform Registry-accurate defaults
- **FR-007**: System MUST enhance aws_elasticache_replication_group with log_delivery_configuration block and additional outputs (member_clusters, engine_version_actual, cluster_enabled)
- **FR-008**: System MUST update file header comment to accurately reflect service count after additions
- **FR-009**: System MUST add icon mappings for new services (aws_db_option_group, aws_db_proxy) in DATABASE_ICONS object

### Key Entities

- **DatabaseServiceDefinition**: Core interface defining id, name, description, terraform_resource, icon, inputs (required/optional/blocks), outputs
- **ServiceInput**: Defines argument name, type, description, options, default, reference
- **ServiceBlock**: Defines nested block name, multiple flag, attributes, nested_blocks
- **ServiceOutput**: Defines output name, type, description

## Success Criteria

### Measurable Outcomes

- **SC-001**: All database services in the catalog display accurate argument counts matching Terraform Registry documentation
- **SC-002**: Users can configure RDS Instance timeouts and see all outputs without errors
- **SC-003**: DB Option Group and RDS Proxy services appear in the database category and can be placed on canvas
- **SC-004**: Aurora Serverless v2 auto-pause configuration (seconds_until_auto_pause) is available in the property panel
- **SC-005**: DynamoDB Global Table V2 configuration via replica blocks is functional
- **SC-006**: TypeScript compilation completes without errors after all schema updates
- **SC-007**: Property editor displays all new blocks and attributes for enhanced services

## Assumptions

- All schema data will be sourced from official Terraform Registry documentation
- Icon paths for new services will use existing RDS icons from the AWS Architecture icon set
- All changes are additive - no removal of existing schema properties
- V2 global tables (replica blocks) are preferred over V1 aws_dynamodb_global_table for DynamoDB
- Default timeout values follow Terraform provider defaults

## Out of Scope

- Backend Terraform generator changes (schema-only update)
- New icon artwork creation (will reuse existing AWS icons)
- Database connection testing or validation
- Cost estimation for database services
