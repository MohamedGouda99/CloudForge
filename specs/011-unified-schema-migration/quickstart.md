# Quick Start: Unified Cloud Provider Schema Migration

**Feature**: 011-unified-schema-migration
**Created**: 2026-01-18

## Overview

This guide provides step-by-step instructions for implementing the unified schema migration. After completing this guide, you will have:

1. GCP schemas migrated to `shared/resource-catalog/`
2. Azure schemas created in `shared/resource-catalog/`
3. Backend API serving all providers via `/api/catalog/?provider=`
4. Frontend fetching schemas dynamically from API

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Access to the CloudForge repository

---

## Step 1: Create GCP Schema Directory Structure

```bash
# Navigate to shared resource catalog
cd shared/resource-catalog/src

# Create GCP directory structure (mirroring AWS)
mkdir -p gcp/{compute,networking,storage,database,security,containers,serverless,analytics,messaging,management,developer-tools,machine-learning}

# Create index and icons files
touch gcp/index.ts gcp/icons.ts
```

---

## Step 2: Create GCP Icons File

Create `shared/resource-catalog/src/gcp/icons.ts`:

```typescript
/**
 * GCP Service Icons
 * Centralized icon path definitions for all GCP resources.
 */

export const GCP_ICONS = {
  // Compute
  COMPUTE_ENGINE: '/cloud_icons/GCP/core-products-icons/Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg',
  CLOUD_RUN: '/cloud_icons/GCP/core-products-icons/Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg',
  CLOUD_FUNCTIONS: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_functions/cloud_functions.svg',
  APP_ENGINE: '/cloud_icons/GCP/google-cloud-legacy-icons/app_engine/app_engine.svg',
  PERSISTENT_DISK: '/cloud_icons/GCP/google-cloud-legacy-icons/persistent_disk/persistent_disk.svg',

  // Networking
  VPC: '/cloud_icons/GCP/google-cloud-legacy-icons/virtual_private_cloud/virtual_private_cloud.svg',
  CLOUD_DNS: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_dns/cloud_dns.svg',
  CLOUD_LOAD_BALANCING: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
  CLOUD_ARMOR: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_armor/cloud_armor.svg',
  CLOUD_ROUTER: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_router/cloud_router.svg',
  FIREWALL: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_firewall_rules/cloud_firewall_rules.svg',

  // Storage
  CLOUD_STORAGE: '/cloud_icons/GCP/core-products-icons/Unique Icons/Cloud Storage/SVG/CloudStorage-512-color.svg',
  FILESTORE: '/cloud_icons/GCP/google-cloud-legacy-icons/filestore/filestore.svg',

  // Database
  CLOUD_SQL: '/cloud_icons/GCP/core-products-icons/Unique Icons/Cloud SQL/SVG/CloudSQL-512-color.svg',
  CLOUD_SPANNER: '/cloud_icons/GCP/core-products-icons/Unique Icons/Cloud Spanner/SVG/CloudSpanner-512-color.svg',
  FIRESTORE: '/cloud_icons/GCP/google-cloud-legacy-icons/firestore/firestore.svg',
  BIGTABLE: '/cloud_icons/GCP/google-cloud-legacy-icons/bigtable/bigtable.svg',
  MEMORYSTORE: '/cloud_icons/GCP/google-cloud-legacy-icons/memorystore/memorystore.svg',

  // Containers
  GKE: '/cloud_icons/GCP/core-products-icons/Unique Icons/Google Kubernetes Engine/SVG/GoogleKubernetesEngine-512-color.svg',
  ARTIFACT_REGISTRY: '/cloud_icons/GCP/google-cloud-legacy-icons/artifact_registry/artifact_registry.svg',

  // Security
  IAM: '/cloud_icons/GCP/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
  KMS: '/cloud_icons/GCP/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
  SECRET_MANAGER: '/cloud_icons/GCP/google-cloud-legacy-icons/secret_manager/secret_manager.svg',

  // Messaging
  PUBSUB: '/cloud_icons/GCP/google-cloud-legacy-icons/pubsub/pubsub.svg',

  // Analytics
  BIGQUERY: '/cloud_icons/GCP/core-products-icons/Unique Icons/BigQuery/SVG/BigQuery-512-color.svg',
  DATAFLOW: '/cloud_icons/GCP/google-cloud-legacy-icons/dataflow/dataflow.svg',
  DATAPROC: '/cloud_icons/GCP/google-cloud-legacy-icons/dataproc/dataproc.svg',

  // Management
  CLOUD_MONITORING: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_monitoring/cloud_monitoring.svg',
  CLOUD_LOGGING: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_logging/cloud_logging.svg',

  // Developer Tools
  CLOUD_BUILD: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_build/cloud_build.svg',
  CLOUD_SOURCE_REPOS: '/cloud_icons/GCP/google-cloud-legacy-icons/cloud_source_repositories/cloud_source_repositories.svg',

  // Machine Learning
  VERTEX_AI: '/cloud_icons/GCP/core-products-icons/Unique Icons/Vertex AI/SVG/VertexAI-512-color.svg',
};
```

---

## Step 3: Migrate a GCP Resource (Example: Compute Instance)

Create `shared/resource-catalog/src/gcp/compute/compute-instance.ts`:

```typescript
import type { ServiceDefinition } from '../../types';
import { GCP_ICONS } from '../icons';

export const gcpComputeInstance: ServiceDefinition = {
  id: 'compute_instance',
  terraform_resource: 'google_compute_instance',
  name: 'Compute Instance',
  description: 'A Google Compute Engine VM instance',
  icon: GCP_ICONS.COMPUTE_ENGINE,
  category: 'compute',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'A unique name for the resource',
        example: 'my-instance',
      },
      {
        name: 'machine_type',
        type: 'string',
        description: 'The machine type to create',
        example: 'e2-medium',
        options: ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'n1-standard-1'],
      },
      {
        name: 'zone',
        type: 'string',
        description: 'The zone that the machine should be created in',
        example: 'us-central1-a',
      },
    ],
    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'A brief description of this resource',
      },
      {
        name: 'labels',
        type: 'map(string)',
        description: 'Labels to apply to this instance',
      },
      {
        name: 'tags',
        type: 'list(string)',
        description: 'Network tags to attach to the instance',
      },
    ],
    blocks: [
      {
        name: 'boot_disk',
        description: 'The boot disk for the instance',
        required: true,
        multiple: false,
        attributes: [
          { name: 'auto_delete', type: 'bool', description: 'Auto-delete on instance termination', default: true },
          { name: 'device_name', type: 'string', description: 'Device name' },
        ],
      },
      {
        name: 'network_interface',
        description: 'Networks to attach to the instance',
        required: true,
        multiple: true,
        attributes: [
          { name: 'network', type: 'string', description: 'Network name or self_link' },
          { name: 'subnetwork', type: 'string', description: 'Subnetwork name or self_link' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Resource identifier' },
    { name: 'instance_id', type: 'string', description: 'Server-assigned instance ID' },
    { name: 'self_link', type: 'string', description: 'URI of the resource' },
  ],

  terraform: {
    resourceType: 'google_compute_instance',
    requiredArgs: ['name', 'machine_type', 'zone', 'boot_disk', 'network_interface'],
    referenceableAttrs: {
      id: 'id',
      self_link: 'self_link',
      instance_id: 'instance_id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'google_compute_network',
        apply: [], // VPC containment is informational
      },
    ],
  },
};
```

---

## Step 4: Update Backend Schema Loader for Multi-Provider

Edit `backend/app/services/terraform/schema_loader.py`:

```python
def _get_schema_paths(self, provider: str = "aws") -> List[Path]:
    """Get paths to schema JSON files for a specific provider."""
    base_path = Path(__file__).parent.parent.parent.parent.parent
    schema_dir = base_path / "shared" / "resource-catalog" / "dist" / "schemas" / provider

    if schema_dir.exists():
        return list(schema_dir.glob("*.schema.json"))
    return []

def get_all_resources(self, provider: str = "aws") -> List[Dict[str, Any]]:
    """Get all resource definitions for a provider."""
    # Filter by provider prefix
    prefix = self._get_provider_prefix(provider)
    return [r for r in self._resources_by_type.values()
            if r.get("terraform_resource", "").startswith(prefix)]

def _get_provider_prefix(self, provider: str) -> str:
    """Get the Terraform resource prefix for a provider."""
    return {
        "aws": "aws_",
        "gcp": "google_",
        "azure": "azurerm_",
    }.get(provider, "aws_")
```

---

## Step 5: Update Catalog API for Provider Filtering

Edit `backend/app/api/endpoints/catalog.py`:

```python
@router.get("/", response_model=CatalogResponse, tags=["catalog"])
async def get_resource_catalog(
    provider: str = Query(default="aws", description="Cloud provider (aws, gcp, azure)"),
    category: Optional[str] = Query(default=None),
    classification: Optional[str] = Query(default=None),
) -> CatalogResponse:
    """Get the resource catalog with optional filters."""
    schema_loader = get_schema_loader()

    # Validate provider
    if provider not in ["aws", "gcp", "azure"]:
        raise HTTPException(
            status_code=400,
            detail=f"Provider '{provider}' not supported. Use 'aws', 'gcp', or 'azure'."
        )

    # Get resources with provider filter
    resources = schema_loader.get_all_resources(provider=provider)

    # Apply additional filters
    if category:
        resources = [r for r in resources if r.get("category") == category]
    if classification:
        resources = [r for r in resources if r.get("classification") == classification]

    return CatalogResponse(
        version="5.x",
        provider=provider,
        category=category,
        resources=resources,
        total=len(resources),
    )
```

---

## Step 6: Create Frontend Catalog Hook

Create `frontend/src/lib/catalog/hooks.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

interface CatalogResponse {
  version: string;
  provider: string;
  resources: ServiceDefinition[];
  total: number;
}

export function useCatalog(provider: string = 'aws', category?: string) {
  return useQuery<CatalogResponse>({
    queryKey: ['catalog', provider, category],
    queryFn: async () => {
      const params = new URLSearchParams({ provider });
      if (category) params.append('category', category);
      const response = await api.get(`/api/catalog/?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useResource(terraformResource: string) {
  return useQuery({
    queryKey: ['resource', terraformResource],
    queryFn: async () => {
      const response = await api.get(`/api/catalog/${terraformResource}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## Step 7: Build and Test

```bash
# Build shared catalog
cd shared/resource-catalog
npm run build

# Restart backend to load new schemas
cd ../..
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose restart backend"

# Test API endpoints
curl "http://localhost:8000/api/catalog/?provider=aws" | jq '.total'
curl "http://localhost:8000/api/catalog/?provider=gcp" | jq '.total'
curl "http://localhost:8000/api/catalog/?provider=azure" | jq '.total'
```

---

## Verification Checklist

- [ ] GCP schemas compile without TypeScript errors
- [ ] Azure schemas compile without TypeScript errors
- [ ] `GET /api/catalog/?provider=gcp` returns GCP resources
- [ ] `GET /api/catalog/?provider=azure` returns Azure resources
- [ ] AWS catalog unchanged and functional
- [ ] Frontend Resource Palette displays provider-specific resources
- [ ] Inspector Panel renders correct input forms for each provider

---

## Next Steps

1. Migrate remaining 11 GCP categories to shared catalog
2. Create 21 Azure resources across 5 categories
3. Update ResourcePalette to use useCatalog hook
4. Remove deprecated frontend schema files
5. Add integration tests for multi-provider catalog
