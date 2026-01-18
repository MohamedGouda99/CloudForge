# Feature Specification: Unified Cloud Provider Schema Migration

**Feature Branch**: `011-unified-schema-migration`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "migrate all cloud provider service schemas (AWS, GCP, Azure) from frontend/src/lib/aws/*, frontend/src/lib/gcp/*, frontend/src/lib/azure/* to shared/resource-catalog following a unified pattern. Create consistent ServiceDefinition interfaces across all providers. Expose all schemas via /api/catalog endpoint with provider filtering (?provider=aws|gcp|azure). Frontend should fetch schemas dynamically from backend API instead of bundling them. Remove duplicate frontend schema files after migration. Ensure Terraform resource mappings, icons, inputs, outputs, and blocks are preserved."

## Clarifications

### Session 2026-01-18

- Q: What is the Azure service coverage scope for initial implementation? → A: Core 5 categories only (compute, storage, database, networking, security) with 3-5 resources each.
- Q: What frontend caching strategy should be used for API-fetched schemas? → A: React Query / TanStack Query with stale-while-revalidate pattern.
- Q: What should be the maximum retry attempts when the catalog API is unavailable? → A: 3 retries with exponential backoff (~15 seconds total).
- Q: Should the catalog API implement pagination for large provider catalogs? → A: No pagination; single response returns all resources at once.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Serves All Provider Schemas via API (Priority: P1)

As a frontend developer, I need the backend API to serve resource schemas for all cloud providers (AWS, GCP, Azure) so that the frontend can dynamically fetch schemas instead of bundling them.

**Why this priority**: This is the foundation - without the backend serving schemas, the frontend cannot fetch them dynamically. Enables single source of truth and reduces frontend bundle size.

**Independent Test**: Can be fully tested by calling `GET /api/catalog/?provider=aws`, `GET /api/catalog/?provider=gcp`, and `GET /api/catalog/?provider=azure` and verifying each returns valid schemas with proper ServiceDefinition structure.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** I call `GET /api/catalog/?provider=aws`, **Then** I receive a JSON response with all AWS resource schemas including terraform_resource, inputs, outputs, and icons.
2. **Given** the API is running, **When** I call `GET /api/catalog/?provider=gcp`, **Then** I receive a JSON response with all GCP resource schemas.
3. **Given** the API is running, **When** I call `GET /api/catalog/?provider=azure`, **Then** I receive a JSON response with all Azure resource schemas.
4. **Given** the API is running, **When** I call `GET /api/catalog/?provider=aws&category=compute`, **Then** I receive only compute category resources for AWS.
5. **Given** the API is running, **When** I call `GET /api/catalog/aws_instance`, **Then** I receive the complete schema for EC2 Instance including all inputs, blocks, outputs, and relations.

---

### User Story 2 - Unified ServiceDefinition Interface Across Providers (Priority: P1)

As a platform maintainer, I need all cloud providers to use the same ServiceDefinition interface so that the frontend components work consistently regardless of provider.

**Why this priority**: Ensures consistency and prevents frontend bugs from schema format differences. The unified interface already exists in `shared/resource-catalog/src/types.ts` and must be applied to all providers.

**Independent Test**: Can be tested by validating that GCP and Azure schemas pass TypeScript compilation against the ServiceDefinition interface from `shared/resource-catalog/src/types.ts`.

**Acceptance Scenarios**:

1. **Given** the shared ServiceDefinition interface, **When** I add a GCP resource to the catalog, **Then** it must conform to the same structure as AWS resources (id, terraform_resource, name, description, icon, category, classification, inputs, outputs, terraform, relations).
2. **Given** an Azure resource definition, **When** the schema is loaded, **Then** it contains the same fields as AWS and GCP resources.
3. **Given** the catalog API, **When** resources from different providers are returned, **Then** the JSON structure is identical across providers.

---

### User Story 3 - GCP Schemas Migrated to Shared Catalog (Priority: P1)

As a platform user designing GCP infrastructure, I need GCP service schemas available in the unified catalog so that the visual designer correctly displays GCP resources with proper inputs and outputs.

**Why this priority**: GCP is the second most requested provider. Currently GCP schemas exist in frontend files and need migration to the shared catalog.

**Independent Test**: Can be tested by verifying each GCP category (compute, storage, database, networking, security, analytics, containers, developer-tools, machine-learning, management, messaging, serverless) appears in `/api/catalog/?provider=gcp` with complete schemas.

**Acceptance Scenarios**:

1. **Given** the shared catalog, **When** I request GCP compute resources, **Then** I receive schemas for google_compute_instance, google_compute_disk, google_compute_image, etc.
2. **Given** the GCP networking schema, **When** loaded via API, **Then** it includes all inputs (required/optional), blocks (nested configurations), and outputs from the original frontend files.
3. **Given** a GCP resource in the catalog, **When** displayed in the designer, **Then** the correct GCP service icon is shown.

---

### User Story 4 - Azure Schemas Added to Shared Catalog (Priority: P2)

As a platform user designing Azure infrastructure, I need Azure service schemas available in the unified catalog so that the visual designer supports Azure resources.

**Why this priority**: Azure support completes the multi-cloud story. Currently no Azure schemas exist in frontend, so this requires creation from Terraform Azure Provider documentation.

**Independent Test**: Can be tested by verifying core Azure categories (compute, storage, database, networking, security) appear in `/api/catalog/?provider=azure` with 3-5 resources per category (15-25 total resources).

**Acceptance Scenarios**:

1. **Given** the shared catalog, **When** I request Azure compute resources, **Then** I receive schemas for azurerm_virtual_machine, azurerm_virtual_machine_scale_set, etc.
2. **Given** the Azure storage schema, **When** loaded via API, **Then** it includes schemas for azurerm_storage_account, azurerm_storage_container, azurerm_storage_blob.
3. **Given** an Azure resource in the catalog, **When** displayed in the designer, **Then** the correct Azure service icon is shown.

---

### User Story 5 - Frontend Fetches Schemas from Backend API (Priority: P2)

As a frontend developer, I need the Resource Palette and Inspector Panel to fetch schemas from the backend API instead of importing bundled files so that schema updates don't require frontend rebuilds.

**Why this priority**: Decouples frontend from schema data, enables hot schema updates, and reduces frontend bundle size.

**Independent Test**: Can be tested by removing frontend schema imports and verifying the Resource Palette still displays all resources after fetching from API.

**Acceptance Scenarios**:

1. **Given** the frontend loads, **When** the Resource Palette initializes, **Then** it fetches schemas from `/api/catalog/?provider={selectedProvider}` instead of importing local files.
2. **Given** a project with provider=gcp, **When** the designer opens, **Then** the Resource Palette displays GCP resources fetched from the API.
3. **Given** the Inspector Panel opens for a selected node, **When** the node is an AWS resource, **Then** the panel fetches the schema from `/api/catalog/aws_instance` to display input fields.

---

### User Story 6 - Remove Duplicate Frontend Schema Files (Priority: P3)

As a platform maintainer, I need duplicate frontend schema files removed after migration so that there's a single source of truth and no maintenance burden of keeping files in sync.

**Why this priority**: Cleanup task that follows successful migration. Low risk but important for maintainability.

**Independent Test**: Can be tested by deleting `frontend/src/lib/aws/*`, `frontend/src/lib/gcp/*` schema files and verifying the frontend still works by fetching from API.

**Acceptance Scenarios**:

1. **Given** schemas are served via API, **When** I delete `frontend/src/lib/gcp/*ServicesData.ts` files, **Then** the frontend continues to work correctly.
2. **Given** the migration is complete, **When** I search for ServiceDefinition imports in frontend, **Then** they reference the API client, not local files.

---

### Edge Cases

- What happens when the API is unavailable? Frontend retries 3 times with exponential backoff (~15 seconds total), then shows a permanent error state with manual retry option.
- What happens when a provider is not yet supported? API returns 400 with message "Provider 'xyz' not supported".
- What happens when a resource type doesn't exist? API returns `{ found: false, resource: null }`.
- How does the system handle schema version mismatches? The catalog response includes a version field for cache invalidation.
- What happens with very large schema responses? No pagination implemented; all resources returned in single response (~50-100KB per provider). React Query caching handles repeated requests.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve resource schemas for AWS, GCP, and Azure providers via `/api/catalog/` endpoint.
- **FR-002**: System MUST support provider filtering via `?provider=aws|gcp|azure` query parameter.
- **FR-003**: System MUST support category filtering via `?category=compute|storage|...` query parameter.
- **FR-004**: System MUST support classification filtering via `?classification=icon|container` query parameter.
- **FR-005**: System MUST return schemas conforming to the unified ServiceDefinition interface.
- **FR-006**: System MUST include all required fields: id, terraform_resource, name, description, icon, category, classification, inputs, outputs, terraform.
- **FR-007**: System MUST preserve all input attributes including name, type, description, example, default, options, reference, validation.
- **FR-008**: System MUST preserve all block configurations with nested attributes.
- **FR-009**: System MUST preserve all output attributes with name, type, description.
- **FR-010**: System MUST include correct icon paths for each service (GCP legacy icons, AWS architecture icons, Azure icons).
- **FR-011**: Frontend MUST fetch schemas from backend API instead of importing bundled files.
- **FR-012**: Frontend Resource Palette MUST display resources fetched from the API.
- **FR-013**: Frontend Inspector Panel MUST use API-fetched schemas to render input forms.
- **FR-014**: System MUST support single resource lookup via `/api/catalog/{terraform_resource}`.
- **FR-015**: System MUST return appropriate error responses for unsupported providers or missing resources.

### Key Entities

- **ServiceDefinition**: The core entity representing a cloud resource with id, terraform_resource, name, description, icon, category, classification, inputs, outputs, terraform metadata, and relations.
- **InputSchema**: Contains required attributes, optional attributes, and nested blocks for a resource.
- **ResourceCatalog**: Collection of ServiceDefinitions with provider, version, and category metadata.
- **Provider**: Cloud provider identifier (aws, gcp, azure) used for filtering and organization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 GCP service categories (compute, storage, database, networking, security, analytics, containers, developer-tools, machine-learning, management, messaging, serverless) are available via `/api/catalog/?provider=gcp`.
- **SC-002**: Core Azure service categories (compute, storage, database, networking, security) with 3-5 resources each (15-25 total) are available via `/api/catalog/?provider=azure`.
- **SC-003**: 100% of existing AWS schemas from `shared/resource-catalog` remain accessible and unchanged.
- **SC-004**: Frontend bundle size reduces by removing embedded schema files (estimated 50-100KB reduction).
- **SC-005**: Resource Palette loads and displays resources within 500ms after API response.
- **SC-006**: All GCP services display correct individual icons (not generic category icons).
- **SC-007**: Schema API response time under 200ms for full catalog requests.
- **SC-008**: Zero TypeScript compilation errors after frontend schema file removal.

## Assumptions

- The existing `shared/resource-catalog/src/types.ts` ServiceDefinition interface is the target format for all providers.
- The backend `schema_loader.py` will be extended to load GCP and Azure schemas from the shared catalog.
- GCP service icons are already available in `frontend/public/cloud_icons/GCP/`.
- Azure service icons will need to be sourced from `Cloud_Services/Azure/` directory.
- The frontend will use a catalog API client (similar to existing patterns) to fetch schemas.
- Caching will be implemented using React Query / TanStack Query with stale-while-revalidate pattern for automatic background refetching and in-memory caching.

## Out of Scope

- Real-time schema updates via WebSocket (future enhancement).
- Schema versioning with migration support.
- Custom resource definitions (user-created schemas).
- Provider-specific validation rules beyond Terraform requirements.
