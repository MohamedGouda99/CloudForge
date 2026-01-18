# Research: GCP Service Schema Enhancement

**Date**: 2026-01-17
**Feature**: 010-gcp-schema-enhancement

## Research Tasks

### 1. Terraform Google Provider Version

**Decision**: Target Terraform Google Provider 6.x (latest stable)

**Rationale**:
- Latest stable version ensures schemas include current resources and attributes
- Most users will be using recent provider versions
- Reduces technical debt from outdated schemas

**Alternatives Considered**:
- Specific older version (5.x): Rejected - would miss newer resources
- Minimum supported version: Rejected - adds complexity without benefit

### 2. GCP Service Categories & Icon Mapping

**Decision**: Use category-level icons from `/cloud_icons/GCP/Category Icons/`

**Icon Path Pattern**:
```
/cloud_icons/GCP/Category Icons/[Category Name]/SVG/[Category]-512-color.svg
```

**Category Icon Mapping**:

| Category | Icon Path |
|----------|-----------|
| Compute | `/cloud_icons/GCP/Category Icons/Compute/SVG/Compute-512-color.svg` |
| Storage | `/cloud_icons/GCP/Category Icons/Storage/SVG/Storage-512-color.svg` |
| Databases | `/cloud_icons/GCP/Category Icons/Databases/SVG/Databases-512-color.svg` |
| Networking | `/cloud_icons/GCP/Category Icons/Networking/SVG/Networking-512-color-rgb.svg` |
| Security Identity | `/cloud_icons/GCP/Category Icons/Security Identity/SVG/SecurityIdentity-512-color.svg` |
| Data Analytics | `/cloud_icons/GCP/Category Icons/Data Analytics/SVG/DataAnalytics-512-color.svg` |
| Containers | `/cloud_icons/GCP/Category Icons/Containers/SVG/Containers-512-color.svg` |
| Developer Tools | `/cloud_icons/GCP/Category Icons/Developer Tools/SVG/Developer_Tools-512-color.svg` |
| AI Machine Learning | `/cloud_icons/GCP/Category Icons/AI _ Machine Learning/SVG/AIMachineLearning-512-color.svg` |
| Management Tools | `/cloud_icons/GCP/Category Icons/Management Tools/SVG/ManagementTools-512-color.svg` |
| Integration Services | `/cloud_icons/GCP/Category Icons/Integration Services/SVG/IntegrationServices-512-color.svg` |
| Serverless Computing | `/cloud_icons/GCP/Category Icons/Serverless Computing/SVG/ServerlessComputing-512-color.svg` |

### 3. GCP Service Inventory by Category

#### Compute Services (computeServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Compute Instance | google_compute_instance | Verify |
| Instance Template | google_compute_instance_template | Verify |
| Instance Group Manager | google_compute_instance_group_manager | Verify |
| Regional Instance Group Manager | google_compute_region_instance_group_manager | Verify |
| Autoscaler | google_compute_autoscaler | Verify |
| Regional Autoscaler | google_compute_region_autoscaler | Verify |
| Disk | google_compute_disk | Verify |
| Regional Disk | google_compute_region_disk | Verify |
| Snapshot | google_compute_snapshot | Verify |
| Image | google_compute_image | Verify |

#### Storage Services (storageServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Cloud Storage Bucket | google_storage_bucket | Verify |
| Storage Bucket Object | google_storage_bucket_object | Verify |
| Filestore Instance | google_filestore_instance | Verify |
| Storage Transfer Job | google_storage_transfer_job | Verify |

#### Database Services (databaseServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Cloud SQL Instance | google_sql_database_instance | Verify |
| Cloud SQL Database | google_sql_database | Verify |
| Cloud SQL User | google_sql_user | Verify |
| Spanner Instance | google_spanner_instance | Verify |
| Spanner Database | google_spanner_database | Verify |
| Firestore Database | google_firestore_database | Verify |
| Bigtable Instance | google_bigtable_instance | Verify |
| Bigtable Table | google_bigtable_table | Verify |
| Redis Instance | google_redis_instance | Verify |
| Memcache Instance | google_memcache_instance | **Add** |
| AlloyDB Cluster | google_alloydb_cluster | **Add** |
| AlloyDB Instance | google_alloydb_instance | **Add** |

#### Networking Services (networkingServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| VPC Network | google_compute_network | Verify |
| Subnetwork | google_compute_subnetwork | Verify |
| Firewall | google_compute_firewall | Verify |
| Firewall Policy | google_compute_firewall_policy | Verify |
| Router | google_compute_router | Verify |
| Router NAT | google_compute_router_nat | Verify |
| VPN Gateway | google_compute_vpn_gateway | Verify |
| VPN Tunnel | google_compute_vpn_tunnel | Verify |
| Interconnect Attachment | google_compute_interconnect_attachment | Verify |
| Global Address | google_compute_global_address | Verify |
| Address | google_compute_address | Verify |
| Global Forwarding Rule | google_compute_global_forwarding_rule | Verify |
| Forwarding Rule | google_compute_forwarding_rule | Verify |
| Target HTTP Proxy | google_compute_target_http_proxy | Verify |
| Target HTTPS Proxy | google_compute_target_https_proxy | Verify |
| URL Map | google_compute_url_map | Verify |
| Backend Service | google_compute_backend_service | Verify |
| Health Check | google_compute_health_check | Verify |

#### Security Services (securityServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Service Account | google_service_account | Verify |
| Service Account Key | google_service_account_key | Verify |
| IAM Policy | google_project_iam_policy | Verify |
| IAM Binding | google_project_iam_binding | Verify |
| IAM Member | google_project_iam_member | Verify |
| KMS Key Ring | google_kms_key_ring | Verify |
| KMS Crypto Key | google_kms_crypto_key | Verify |
| Secret Manager Secret | google_secret_manager_secret | Verify |
| Secret Version | google_secret_manager_secret_version | Verify |

#### Analytics Services (analyticsServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| BigQuery Dataset | google_bigquery_dataset | Verify |
| BigQuery Table | google_bigquery_table | Verify |
| BigQuery Job | google_bigquery_job | Verify |
| Dataflow Job | google_dataflow_job | Verify |
| Dataproc Cluster | google_dataproc_cluster | Verify |
| Dataproc Job | google_dataproc_job | Verify |
| Pub/Sub BigQuery Subscription | google_pubsub_subscription (bigquery_config) | Verify |

#### Containers Services (containersServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| GKE Cluster | google_container_cluster | Verify |
| GKE Node Pool | google_container_node_pool | Verify |
| Artifact Registry Repository | google_artifact_registry_repository | Verify |
| Cloud Run Service | google_cloud_run_service | Verify |
| Cloud Run v2 Service | google_cloud_run_v2_service | Verify |

#### Developer Tools Services (developerToolsServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Cloud Build Trigger | google_cloudbuild_trigger | Verify |
| Source Repository | google_sourcerepo_repository | Verify |
| Cloud Deploy Pipeline | google_clouddeploy_delivery_pipeline | Verify |
| Cloud Deploy Target | google_clouddeploy_target | Verify |

#### Machine Learning Services (machineLearningServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Vertex AI Dataset | google_vertex_ai_dataset | Verify |
| Vertex AI Endpoint | google_vertex_ai_endpoint | Verify |
| Vertex AI Model | google_vertex_ai_model | Verify |
| Vertex AI Featurestore | google_vertex_ai_featurestore | Verify |
| AI Platform Model | google_ml_engine_model | Verify |
| Notebooks Instance | google_notebooks_instance | Verify |

#### Management Services (managementServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Logging Sink | google_logging_project_sink | Verify |
| Logging Metric | google_logging_metric | Verify |
| Monitoring Alert Policy | google_monitoring_alert_policy | Verify |
| Monitoring Dashboard | google_monitoring_dashboard | Verify |
| Monitoring Notification Channel | google_monitoring_notification_channel | Verify |
| Monitoring Uptime Check | google_monitoring_uptime_check_config | Verify |
| Cloud Scheduler Job | google_cloud_scheduler_job | Verify |
| Cloud Tasks Queue | google_cloud_tasks_queue | Verify |

#### Messaging Services (messagingServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Pub/Sub Topic | google_pubsub_topic | Verify |
| Pub/Sub Subscription | google_pubsub_subscription | Verify |
| Pub/Sub Schema | google_pubsub_schema | Verify |

#### Serverless Services (serverlessServicesData.ts)

| Service | Terraform Resource | Status |
|---------|-------------------|--------|
| Cloud Functions (Gen 1) | google_cloudfunctions_function | Verify |
| Cloud Functions (Gen 2) | google_cloudfunctions2_function | Verify |
| Cloud Run Service | google_cloud_run_service | Verify |
| Cloud Run v2 Service | google_cloud_run_v2_service | Verify |
| App Engine Application | google_app_engine_application | Verify |
| App Engine Standard Version | google_app_engine_standard_app_version | Verify |
| App Engine Flexible Version | google_app_engine_flexible_app_version | Verify |
| Cloud Endpoints Service | google_endpoints_service | Verify |
| API Gateway | google_api_gateway_gateway | Verify |
| API Gateway API | google_api_gateway_api | Verify |

### 4. TypeScript Interface Requirements

**Decision**: Use existing interface patterns from `computeServicesData.ts`

**Required Interfaces**:
```typescript
interface ServiceInput {
  name: string;
  type: string;
  description?: string;
  example?: string;
  default?: unknown;
  options?: string[];
  reference?: string;
  required?: boolean;
}

interface BlockAttribute {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
}

interface ServiceBlock {
  name: string;
  description?: string;
  multiple?: boolean;
  attributes: BlockAttribute[];
  nested_blocks?: ServiceBlock[];
}

interface ServiceOutput {
  name: string;
  type: string;
  description: string;
}
```

**Rationale**: Existing interfaces are well-designed and sufficient for all GCP resources.

### 5. Helper Functions Pattern

Each service data file should export:
```typescript
// Service array export
export const GCP_[CATEGORY]_SERVICES: [Category]ServiceDefinition[];

// Terraform resource list
export const [CATEGORY]_TERRAFORM_RESOURCES: string[];

// Helper functions
export function get[Category]ServiceByTerraformResource(terraformResource: string): [Category]ServiceDefinition | undefined;
export function get[Category]ServiceById(id: string): [Category]ServiceDefinition | undefined;
export function is[Category]Resource(terraformResource: string): boolean;
export function get[Category]Icon(terraformResource: string): string;
```

## Research Conclusions

1. All schemas should target Terraform Google Provider 6.x
2. Only stable provider resources (no google-beta)
3. Use category-level icons (no individual service icons available)
4. Follow existing TypeScript interface patterns
5. Include helper functions for service lookup in each file
6. Database category needs 3 new services: Memcache, AlloyDB Cluster, AlloyDB Instance
