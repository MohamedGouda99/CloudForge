# Research: AWS Compute Resource Enhancement

**Feature**: 005-aws-compute-enhancement
**Date**: 2026-01-15
**Purpose**: Resolve all NEEDS CLARIFICATION items and document architecture decisions

## Research Summary

| Topic | Decision | Status |
|-------|----------|--------|
| Schema Source Strategy | Hybrid (static + manual refresh) | Resolved |
| Provider Version Support | AWS Provider 5.x only | Resolved |
| Performance Target | < 3 seconds for 50 resources | Resolved |
| Duplication Elimination | Unified TypeScript catalog | Resolved |
| Icon Path Strategy | Unified /cloud_icons path | Resolved |

---

## 1. Schema Data Source Strategy

### Decision
**Hybrid approach**: Static embedded schemas with optional manual refresh

### Rationale
- **Reliability**: Static schemas work offline and don't fail when registry unavailable
- **Performance**: No runtime latency for schema fetching
- **Flexibility**: Manual refresh allows users to get latest attributes when needed
- **Maintainability**: Single update point via build-time embedding

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Dynamic only | Always current | External dependency, latency, offline failure | Violates reliability requirement |
| Static only | Simple, fast | Becomes stale | No update mechanism |
| **Hybrid** | Best of both | Slightly more complex | Selected |

### Implementation Notes
- Embed schemas in `shared/resource-catalog/src/aws/compute.ts` at build time
- Add `POST /api/resources/refresh` endpoint for manual refresh
- Display "Last updated: YYYY-MM-DD" in UI with refresh button
- Cache refreshed schemas in browser localStorage

---

## 2. Terraform Provider Version Support

### Decision
**AWS Provider 5.x only** (no backward compatibility with 4.x)

### Rationale
- **Simplicity**: Single schema version eliminates version-specific code paths
- **Adoption**: Provider 5.x stable since late 2023, most projects migrated
- **Maintenance**: Supporting 4.x doubles schema maintenance burden
- **Features**: 5.x includes critical improvements (ephemeral resources, better defaults)

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| 4.x + 5.x | Broader compatibility | 2x maintenance, version detection complexity | Not justified by user need |
| 4.x only | Legacy support | Missing 5.x features | Outdated |
| **5.x only** | Simple, modern | No legacy support | Selected |

### Implementation Notes
- Generate HCL with `required_providers { aws = { version = "~> 5.0" } }`
- Document 5.x requirement in quickstart.md
- Add validation warning if user project specifies 4.x provider

---

## 3. Frontend/Backend Duplication Elimination

### Decision
**Unified TypeScript catalog** in `shared/resource-catalog` package

### Rationale
- **DRY Compliance**: Constitution requires eliminating duplication (max 3 occurrences)
- **Type Safety**: TypeScript provides compile-time validation
- **Shared Relationships**: Frontend gains access to relationship rules
- **Build Integration**: JSON generation for Python is straightforward

### Current Duplication Analysis

| Location | Files | Lines | Purpose |
|----------|-------|-------|---------|
| Frontend | awsResources.ts, awsResourcesExpanded.ts | ~615 | UI rendering, field schemas |
| Backend Python | config.py, aws.py | ~656 | Defaults, supported types |
| Backend TypeScript | awsComputeWithRules.ts, awsComputeComplete.ts | ~1222 | Full schemas, relationships |
| **Total Duplicated** | | **~2493** | |

### Specific Inconsistencies Found

| Resource | Frontend | Backend Python | Backend TS | Issue |
|----------|----------|----------------|------------|-------|
| aws_instance | t2.micro default | t3.micro default | no default | Default mismatch |
| aws_lambda_function | No fields | python3.11, 128MB, 30s | Not in catalog | Missing frontend schema |
| aws_s3_bucket | 4 fields | No defaults | Not in catalog | Field/versioning mismatch |
| Icon paths | /api/icons/aws/ | N/A | /cloud_icons/AWS/ | Path inconsistency |

### Migration Plan

```
Phase 1: Create shared package
├── Define ServiceDefinition interface
├── Migrate awsComputeComplete.ts to shared/
├── Add icon path resolution
└── Generate JSON for Python

Phase 2: Frontend migration
├── Import from shared/resource-catalog
├── Remove awsResources.ts
├── Remove awsResourcesExpanded.ts
└── Update InspectorPanel imports

Phase 3: Backend migration
├── Python loads JSON at startup
├── Remove scattered defaults from config.py
├── Update generators/aws.py imports
└── Remove backend/src/terraform/catalog/

Phase 4: Validation
├── Run all existing tests
├── Add schema consistency tests
├── Verify HCL generation
└── Visual regression tests
```

### Alternatives Considered
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| REST API only | Dynamic | Latency, offline failure | Adds external dependency |
| JSON config | Language agnostic | No type safety, code gen needed | Less maintainable |
| Keep duplication | No migration | Violates DRY, sync issues | Constitution violation |
| **Unified TS** | Type safe, single source | Build step for Python | Selected |

---

## 4. Icon Path Strategy

### Decision
**Unified path**: `/cloud_icons/AWS/Architecture-Service-Icons_07312025/`

### Rationale
- **Consistency**: Single path across frontend and backend
- **Asset Location**: Icons already exist in Cloud_Services directory
- **Serving**: Backend can serve static files from this path

### Current Icon Path Analysis

| Source | Pattern | Example |
|--------|---------|---------|
| Frontend expanded | /api/icons/aws/Arch_Compute/64/ | Arch_Amazon-EC2_64.svg |
| Backend catalog | /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/ | Arch_Amazon-EC2_64.svg |

### Unified Pattern
```
/cloud_icons/AWS/Architecture-Service-Icons_07312025/{Category}/64/{Icon}

Examples:
- /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg
- /cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-ECS_64.svg
```

### Implementation Notes
- Add icon path to shared ServiceDefinition
- Frontend serves icons via configured base URL
- Backend includes icon in API response for catalog endpoint
- Create icon resolver utility in shared package

---

## 5. Container vs Icon Node Classification

### Decision
**Classification embedded in ServiceDefinition** with `classification: "icon" | "container"` field

### Classification Rules

| Rule | Classification | Examples |
|------|---------------|----------|
| Can contain child resources | Container | VPC, Subnet, ECS Cluster, EKS Cluster |
| Has children defined in relationship rules | Container | Resources with containmentRules |
| Standalone compute unit | Icon | EC2, Lambda, ASG |
| Must be inside a container | Icon | ECS Service (inside ECS Cluster) |

### AWS Compute Resources Classification

| Resource | Classification | Parent Container |
|----------|---------------|------------------|
| aws_instance | icon | aws_subnet |
| aws_lambda_function | icon | (none) |
| aws_launch_template | icon | (none) |
| aws_autoscaling_group | icon | aws_subnet |
| aws_ecs_cluster | **container** | aws_vpc |
| aws_ecs_service | icon | aws_ecs_cluster |
| aws_ecs_task_definition | icon | (none, referenced) |
| aws_eks_cluster | **container** | aws_vpc |
| aws_eks_node_group | icon | aws_eks_cluster |
| aws_elastic_beanstalk_application | icon | (none) |
| aws_apprunner_service | icon | (none) |
| aws_batch_job_definition | icon | (none) |

### Implementation Notes
- Add `classification` field to ServiceDefinition type
- Frontend nodeClassifier.ts reads classification from schema
- React Flow uses IconNode or ContainerNode based on classification
- Container nodes have min-width/min-height and accept drops

---

## 6. Terraform Registry Data Accuracy

### Research: EC2 Instance Attributes (AWS Provider 5.x)

**Required Arguments:**
- `ami` (string) - AMI ID
- `instance_type` (string) - Instance type (t3.micro, m5.large, etc.)

**Key Optional Arguments:**
- `availability_zone` (string)
- `subnet_id` (string)
- `vpc_security_group_ids` (list of string)
- `key_name` (string)
- `iam_instance_profile` (string)
- `associate_public_ip_address` (bool)
- `monitoring` (bool)
- `user_data` (string)
- `tags` (map of string)

**Block Arguments:**
- `root_block_device` { volume_type, volume_size, encrypted, delete_on_termination }
- `ebs_block_device` { device_name, volume_type, volume_size, encrypted }
- `network_interface` { network_interface_id, device_index }

**Exported Attributes:**
- `id` (string) - Instance ID
- `arn` (string) - Instance ARN
- `public_ip` (string) - Public IP address
- `private_ip` (string) - Private IP address
- `public_dns` (string) - Public DNS name
- `private_dns` (string) - Private DNS name

### Research: Lambda Function Attributes (AWS Provider 5.x)

**Required Arguments:**
- `function_name` (string)
- `role` (string) - IAM role ARN
- One of: `filename`, `s3_bucket`+`s3_key`, `image_uri`

**Key Optional Arguments:**
- `runtime` (string) - nodejs20.x, python3.12, java21, etc.
- `handler` (string) - Function entry point
- `memory_size` (number) - 128-10240 MB
- `timeout` (number) - 1-900 seconds
- `architectures` (list) - x86_64, arm64
- `environment` (block) - Environment variables

**Exported Attributes:**
- `arn` (string)
- `invoke_arn` (string)
- `qualified_arn` (string)
- `version` (string)

---

## 7. Test Strategy Research

### Contract Testing with terraform validate

**Approach:**
1. Generate minimal HCL for each resource type
2. Write to temp directory with provider config
3. Run `terraform init` and `terraform validate`
4. Assert exit code 0

**Sample Test Structure:**
```
tests/contract/
├── fixtures/
│   ├── aws_instance.tf.json      # Minimal valid config
│   ├── aws_lambda_function.tf.json
│   └── ...
├── test_hcl_generation.py
└── conftest.py                   # terraform binary fixture
```

**Requirements:**
- Terraform CLI installed in CI
- AWS provider downloadable (no AWS credentials needed for validate)
- Test isolation via temp directories

### Visual Regression Testing

**Tool**: Playwright with screenshot comparison

**Approach:**
1. Render each compute resource on canvas
2. Screenshot the node
3. Compare against baseline
4. Fail on significant diff (>1% pixel difference)

---

## Conclusion

All NEEDS CLARIFICATION items have been resolved. Key decisions:

1. **Hybrid schema source** - Static defaults + manual refresh
2. **Provider 5.x only** - Simplifies maintenance
3. **Unified TypeScript catalog** - Eliminates 3-way duplication
4. **Unified icon paths** - /cloud_icons/AWS/ pattern
5. **Classification in schema** - icon vs container field

Ready to proceed to Phase 1: Data Model & Contracts.
