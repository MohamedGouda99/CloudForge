# Feature Specification: GCP Service Schema Enhancement

**Feature Branch**: `010-gcp-schema-enhancement`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Update all GCP service schemas (*Data.ts) by fetching Terraform Registry docs: fix arguments, attributes, blocks, outputs, types, timeouts. Add missing services/categories with icons. Verify all schemas and icons via Registry. Focus on local code only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Infrastructure Designer Uses Accurate GCP Resource Properties (Priority: P1)

A cloud infrastructure designer uses CloudForge to visually design GCP infrastructure. When they drag a GCP resource (e.g., Cloud SQL, GKE Cluster, Pub/Sub) onto the canvas, the Inspector Panel must display accurate and complete configuration options matching the current Terraform provider documentation.

**Why this priority**: This is the core user-facing value. Inaccurate schemas lead to failed Terraform deployments and user frustration. Designers rely on the Inspector Panel to configure resources correctly without needing to reference external documentation.

**Independent Test**: Can be fully tested by dragging any GCP resource onto the canvas and verifying all configuration fields match the official Terraform Registry documentation for that resource.

**Acceptance Scenarios**:

1. **Given** a user has the Designer canvas open, **When** they drag a `google_sql_database_instance` onto the canvas and open the Inspector Panel, **Then** they see all required fields (database_version), optional fields (name, region, deletion_protection, etc.), and nested blocks (settings, replica_configuration, clone) with correct types and descriptions.

2. **Given** a user is configuring a `google_container_cluster`, **When** they expand the nested blocks section, **Then** they see all valid nested blocks (node_config, master_auth, network_policy, etc.) with their respective attributes matching Terraform Registry documentation.

3. **Given** a user configures a GCP resource with all fields, **When** Terraform code is generated, **Then** the generated HCL contains valid attribute names and types that pass `terraform validate`.

---

### User Story 2 - Complete GCP Service Coverage (Priority: P1)

A user expects to find all major GCP services available in the Resource Palette. Missing services force users to manually write Terraform code, defeating the purpose of the visual designer.

**Why this priority**: Equal to P1 because incomplete service coverage directly impacts user adoption and the platform's value proposition.

**Independent Test**: Can be tested by comparing the Resource Palette's GCP services against a comprehensive list of Terraform GCP provider resources.

**Acceptance Scenarios**:

1. **Given** a user opens the Resource Palette and selects GCP, **When** they browse the Database category, **Then** they see Cloud SQL Instance, Cloud SQL Database, Cloud SQL User, Cloud Spanner Instance, Cloud Spanner Database, Firestore Database, Bigtable Instance, Bigtable Table, Memorystore Redis, Memorystore Memcache, AlloyDB Cluster, and AlloyDB Instance.

2. **Given** a user browses GCP Networking, **When** they view available resources, **Then** they see VPC Network, Subnetwork, Firewall, Cloud Router, Cloud NAT, VPN Gateway, VPN Tunnel, Interconnect Attachment, Global Address, and Load Balancer resources.

3. **Given** a user browses any GCP category, **When** they view available resources, **Then** each resource displays a valid icon that visually represents the service.

---

### User Story 3 - Timeout Configuration Support (Priority: P2)

An infrastructure designer needs to configure custom timeouts for resource creation, update, and deletion operations to handle long-running provisioning (e.g., large GKE clusters, Cloud SQL instances with many replicas).

**Why this priority**: Timeout configuration is important for production deployments but not blocking for basic functionality.

**Independent Test**: Can be tested by configuring timeout blocks on resources and verifying generated Terraform includes valid timeout configuration.

**Acceptance Scenarios**:

1. **Given** a user is configuring a `google_sql_database_instance`, **When** they access the timeouts configuration, **Then** they can set create, update, and delete timeout values with proper duration format (e.g., "30m", "1h").

2. **Given** a user has configured custom timeouts, **When** Terraform is generated, **Then** the output includes a valid `timeouts` block with the specified durations.

---

### User Story 4 - Output Attributes for Resource References (Priority: P2)

When connecting GCP resources together (e.g., connecting a Cloud SQL instance to a VPC), users need to see available output attributes to create proper references.

**Why this priority**: Output attributes enable resource connections but the platform can function without them initially.

**Independent Test**: Can be tested by viewing a resource's output tab and verifying all exported attributes match Terraform Registry documentation.

**Acceptance Scenarios**:

1. **Given** a user selects a `google_compute_network` on the canvas, **When** they view the Outputs section, **Then** they see id, self_link, gateway_ipv4, and other exported attributes with correct types and descriptions.

2. **Given** a user is connecting a `google_sql_database_instance` to a network, **When** they select the connection endpoint, **Then** they can reference the instance's connection_name, private_ip_address, or public_ip_address outputs.

---

### Edge Cases

- What happens when a GCP resource has deprecated attributes? (Show with deprecation warning)
- How does the system handle mutually exclusive attributes (e.g., num_nodes vs processing_units in Spanner)?
- What happens when a resource requires a reference to another resource that doesn't exist on canvas?
- How are sensitive attributes (passwords, keys) handled in the UI?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all required arguments for each GCP Terraform resource as mandatory fields in the Inspector Panel
- **FR-002**: System MUST display all optional arguments for each GCP Terraform resource with correct default values where applicable
- **FR-003**: System MUST support nested block configuration with proper hierarchy (blocks containing blocks)
- **FR-004**: System MUST display correct data types for each field (string, number, bool, list, map, set)
- **FR-005**: System MUST include timeout configuration blocks for resources that support custom timeouts
- **FR-006**: System MUST display all output/computed attributes for each resource
- **FR-007**: System MUST display valid icons for all GCP services using the category icon structure
- **FR-008**: System MUST include all major GCP services across categories: Compute, Storage, Database, Networking, Security, Analytics, Containers, Developer Tools, Machine Learning, Management, Messaging, and Serverless
- **FR-009**: System MUST provide helper functions for looking up services by Terraform resource name or service ID
- **FR-010**: System MUST validate that generated Terraform code uses correct attribute names and types

### Key Entities

- **ServiceDefinition**: Represents a GCP service with id, name, description, terraform_resource, icon, inputs (required/optional/blocks), and outputs
- **ServiceInput**: Individual input field with name, type, description, example, default value, and options (for enums)
- **ServiceBlock**: Nested configuration block with attributes and optional nested_blocks
- **ServiceOutput**: Computed/exported attribute with name, type, and description
- **BlockAttribute**: Individual attribute within a block including required flag

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of GCP *Data.ts files include accurate schemas matching current Terraform Google Provider documentation
- **SC-002**: All 12 GCP service categories contain complete service definitions (Compute, Storage, Database, Networking, Security, Analytics, Containers, Developer Tools, Machine Learning, Management, Messaging, Serverless)
- **SC-003**: Each service definition includes all required inputs, optional inputs, nested blocks, and outputs as documented in Terraform Registry
- **SC-004**: All GCP services display valid icons from the `/cloud_icons/GCP/Category Icons/` directory
- **SC-005**: Generated Terraform code for any GCP resource passes `terraform validate` without attribute errors
- **SC-006**: Users can configure any GCP resource property through the Inspector Panel without referencing external documentation

## Scope

### In Scope

- All GCP *Data.ts files in `frontend/src/lib/gcp/`:
  - computeServicesData.ts
  - storageServicesData.ts
  - databaseServicesData.ts
  - networkingServicesData.ts
  - securityServicesData.ts
  - analyticsServicesData.ts
  - containersServicesData.ts
  - developerToolsServicesData.ts
  - machineLearningServicesData.ts
  - managementServicesData.ts
  - messagingServicesData.ts
  - serverlessServicesData.ts
- Adding missing services to each category
- Fixing incorrect or incomplete schemas
- Updating icon paths to use correct GCP category icons
- Adding helper functions for service lookup
- Adding timeout blocks where supported

### Out of Scope

- AWS or Azure service schemas (separate features)
- Backend Terraform generator changes
- UI/UX changes to Inspector Panel
- New GCP services not in Terraform Google Provider
- Custom/community provider resources
- Beta-only resources from google-beta provider (stable google provider only)

## Clarifications

### Session 2026-01-17

- Q: Which Terraform Google Provider version should schemas target? → A: Latest stable version (currently ~6.x)
- Q: Should beta-only resources (google-beta provider) be included? → A: Exclude beta resources (stable only)

## Assumptions

- The Terraform Google Provider documentation on registry.terraform.io is the authoritative source for schema accuracy
- Schemas target the latest stable Terraform Google Provider version (6.x series) to ensure current resources and attributes
- GCP category icons exist at `/cloud_icons/GCP/Category Icons/[Category]/SVG/[Category]-512-color.svg`
- The existing TypeScript interface structure (ServiceInput, ServiceBlock, ServiceOutput) is sufficient for all GCP resources
- Services will use the same icon for all resources within a category (no individual service icons available)

## Dependencies

- Access to Terraform Registry documentation for GCP provider
- Existing GCP icon files in the frontend public directory
- Existing TypeScript interfaces in computeServicesData.ts
