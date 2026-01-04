# CloudForge Entity Relationship Diagrams

## Backend Database ERD (SQLAlchemy Models)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND DATABASE ERD                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│          USER            │
├──────────────────────────┤
│ PK  id: Integer          │
│     email: String        │◄─── UNIQUE, INDEX
│     username: String     │◄─── UNIQUE, INDEX
│     hashed_password: Str │
│     full_name: String    │
│     is_active: Boolean   │
│     is_superuser: Boolean│
│     created_at: DateTime │
│     updated_at: DateTime │
└──────────┬───────────────┘
           │
           │ 1:N (One user owns many projects)
           │
           ▼
┌──────────────────────────┐
│         PROJECT          │
├──────────────────────────┤
│ PK  id: Integer          │
│ FK  owner_id: Integer    │───────► USER.id
│     name: String         │
│     description: Text    │
│     cloud_provider: Enum │◄─── AWS | AZURE | GCP
│     diagram_data: JSON   │◄─── Visual designer state
│     git_repo_url: String │
│     git_branch: String   │
│     created_at: DateTime │
│     updated_at: DateTime │
└──────────┬───────────────┘
           │
           ├─────────────────────────────────────────────────────────────────┐
           │                          │                    │                 │
           │ 1:N                      │ 1:N               │ 1:N            │ 1:1
           ▼                          ▼                    ▼                 ▼
┌──────────────────────┐  ┌────────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      RESOURCE        │  │  TERRAFORM_OUTPUT  │  │   DRIFT_SCAN    │  │  COST_ESTIMATE  │
├──────────────────────┤  ├────────────────────┤  ├─────────────────┤  ├─────────────────┤
│ PK id: Integer       │  │ PK id: Integer     │  │ PK id: Integer  │  │ PK id: Integer  │
│ FK project_id: Int   │  │ FK project_id: Int │  │ FK project_id   │  │ FK project_id   │◄── UNIQUE
│    resource_type: Str│  │    main_tf: Text   │  │    status: Enum │  │    monthly_cost │
│    resource_name: Str│  │    variables_tf    │  │    result: Text │  │    currency: Str│
│    node_id: String   │◄─┤    outputs_tf      │  │    error_message│  │    resources_cnt│
│    position_x: Int   │  │    providers_tf    │  │    started_at   │  │    cost_breakdown│
│    position_y: Int   │  │    version: Int    │  │    completed_at │  │    created_at   │
│    config: JSON      │  │    created_at      │  └─────────────────┘  │    updated_at   │
│    created_at        │  └────────────────────┘                       └─────────────────┘
│    updated_at        │
└──────────┬───────────┘
           │
           │ 1:N (One resource has many outgoing connections)
           │
           ▼
┌────────────────────────────┐
│   RESOURCE_CONNECTION      │
├────────────────────────────┤
│ PK id: Integer             │
│ FK source_id: Integer      │───────► RESOURCE.id
│ FK target_id: Integer      │───────► RESOURCE.id
│    connection_type: String │◄─── "network" | "depends_on" | "security_group"
│    created_at: DateTime    │
└────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════
                                     ENUM DEFINITIONS
═══════════════════════════════════════════════════════════════════════════════════════════

┌─────────────────────┐     ┌─────────────────────────┐
│   CloudProvider     │     │    DriftScanStatus      │
├─────────────────────┤     ├─────────────────────────┤
│ • AWS   = "aws"     │     │ • PENDING   = "pending" │
│ • AZURE = "azure"   │     │ • RUNNING   = "running" │
│ • GCP   = "gcp"     │     │ • COMPLETED = "completed"│
└─────────────────────┘     │ • FAILED    = "failed"  │
                            └─────────────────────────┘
```

---

## Frontend Data Model ERD (TypeScript Interfaces)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND DATA MODEL ERD                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────────────┐
                              │         AuthState           │◄─── Zustand Store
                              ├─────────────────────────────┤
                              │   token: string | null      │
                              │   user: User | null         │
                              │   isAuthenticated: boolean  │
                              │   setAuth(): void           │
                              │   logout(): void            │
                              └──────────────┬──────────────┘
                                             │
                                             │ contains
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                         User                                              │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│   id: string                                                                              │
│   email: string                                                                           │
│   username: string                                                                        │
│   full_name?: string                                                                      │
│   is_active: boolean                                                                      │
│   is_superuser: boolean                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════
                                  RESOURCE PALETTE TYPES
═══════════════════════════════════════════════════════════════════════════════════════════

┌────────────────────────────┐
│      CloudProvider         │◄─── Type alias
├────────────────────────────┤
│ "aws" | "azure" | "gcp"    │
└────────────────────────────┘
              │
              │ used by
              ▼
┌────────────────────────────────────────────────────────────────────┐
│                        CloudResource                                │
├────────────────────────────────────────────────────────────────────┤
│   type: string              │◄─── e.g., "aws_instance", "aws_vpc"  │
│   label: string             │◄─── Display name                      │
│   provider: CloudProvider   │                                       │
│   category: string          │◄─── "compute" | "storage" | etc.     │
│   originalCategory: string  │                                       │
│   description: string       │                                       │
│   icon: string              │◄─── Path to icon SVG                  │
│   isContainer?: boolean     │◄─── VPC, Subnet, AZ are containers   │
│   isDataSource?: boolean    │                                       │
└────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════
                                   REACTFLOW NODE TYPES
═══════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Node (ReactFlow)                                       │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│   id: string                │◄─── Unique node identifier                                 │
│   type: NodeType            │◄─── "vpc" | "subnet" | "region" | "availability_zone" |   │
│                             │     "container" | "resource" | "default"                   │
│   position: { x, y }        │                                                            │
│   data: NodeData            │───────────────────────────────────────────┐               │
│   style?: CSSProperties     │◄─── Contains zIndex for layering          │               │
│   extent?: "parent"         │◄─── For nested containers                 │               │
│   expandParent?: boolean    │                                            │               │
└──────────────────────────────────────────────────────────────────────────┼───────────────┘
                                                                           │
                                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                       NodeData                                            │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│   label?: string                                                                          │
│   displayName?: string                                                                    │
│   resourceType: string          │◄─── e.g., "aws_instance"                               │
│   resourceLabel?: string                                                                  │
│   resourceCategory?: string                                                               │
│   resourceDescription?: string                                                            │
│   config?: Record<string, any>  │◄─── Terraform configuration                            │
│   icon?: string                                                                           │
│   category?: string                                                                       │
│   size?: number | { width, height }                                                       │
│   isContainer?: boolean                                                                   │
│   isDataSource?: boolean                                                                  │
│   isLocked?: boolean            │◄─── Prevents dragging                                  │
│   isOmitted?: boolean           │◄─── Excluded from Terraform                            │
└──────────────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Edge (ReactFlow)                                       │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│   id: string                │◄─── Format: "edge-{sourceId}-{targetId}"                   │
│   source: string            │◄─── Source node ID                                         │
│   target: string            │◄─── Target node ID                                         │
│   sourceHandle?: string     │◄─── "source-Top" | "source-Bottom" | etc.                 │
│   targetHandle?: string     │◄─── "target-Top" | "target-Bottom" | etc.                 │
│   type?: string             │◄─── Edge type for styling                                  │
│   animated?: boolean        │                                                            │
│   style?: CSSProperties     │                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════
                                NODE TYPE HIERARCHY (Z-INDEX)
═══════════════════════════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────────┐
                    │           Z-INDEX LAYERS                 │
                    └─────────────────────────────────────────┘

    Layer 100 ──►  ┌─────────────────────────────────────────┐
    (Top)          │      RESOURCE NODES (default)           │
                   │   aws_instance, aws_lambda, etc.        │
                   └─────────────────────────────────────────┘
                                       │
    Layer 1 ────►  ┌─────────────────────────────────────────┐
                   │    INNER CONTAINERS                      │
                   │   subnet, availability_zone              │
                   └─────────────────────────────────────────┘
                                       │
    Layer 0 ────►  ┌─────────────────────────────────────────┐
    (Bottom)       │    OUTER CONTAINERS                      │
                   │   vpc, region, container                 │
                   └─────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════════════
                                 RESOURCE SCHEMA TYPES
═══════════════════════════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SchemaField                                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│   name: string                                                                          │
│   type: "string" | "number" | "boolean" | "select" | "multiselect" | "textarea" |      │
│         "tags" | "cidr" | "reference" | "json" | "array"                               │
│   label: string                                                                         │
│   description?: string                                                                  │
│   required?: boolean                                                                    │
│   default?: any                                                                         │
│   options?: { value: string, label: string }[]  │◄─── For select types                │
│   validation?: {                                                                        │
│       pattern?: string                                                                  │
│       min?: number                                                                      │
│       max?: number                                                                      │
│       minLength?: number                                                                │
│       maxLength?: number                                                                │
│   }                                                                                     │
│   group?: string                    │◄─── "basic" | "advanced" | "network" | etc.      │
│   referenceType?: string            │◄─── For reference fields (e.g., "aws_vpc")       │
│   dependsOn?: string                │◄─── Field dependency                             │
│   showWhen?: { field: string, value: any }                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ contained in
                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ResourceSchema                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│   resourceType: string                                                                  │
│   provider: CloudProvider                                                               │
│   category: string                                                                      │
│   displayName: string                                                                   │
│   description: string                                                                   │
│   icon?: string                                                                         │
│   fields: SchemaField[]                                                                 │
│   blocks?: SchemaBlock[]                                                                │
│   outputs?: SchemaOutput[]                                                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Data Flow ERD

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  API DATA FLOW                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐           ┌──────────────────┐           ┌─────────────────────┐
│    FRONTEND     │           │      API         │           │      DATABASE       │
│   (React/TS)    │           │   (FastAPI)      │           │    (SQLAlchemy)     │
└────────┬────────┘           └────────┬─────────┘           └──────────┬──────────┘
         │                             │                                │
         │  POST /api/auth/login       │                                │
         │ ─────────────────────────►  │                                │
         │                             │  Query User                    │
         │                             │ ─────────────────────────────► │
         │                             │ ◄───────────────────────────── │
         │  { token, user }            │                                │
         │ ◄─────────────────────────  │                                │
         │                             │                                │
         │  GET /api/projects          │                                │
         │ ─────────────────────────►  │                                │
         │                             │  Query Projects + Resources    │
         │                             │ ─────────────────────────────► │
         │                             │ ◄───────────────────────────── │
         │  { projects[] }             │                                │
         │ ◄─────────────────────────  │                                │
         │                             │                                │
         │  PUT /api/projects/{id}     │                                │
         │  { nodes[], edges[] }       │                                │
         │ ─────────────────────────►  │                                │
         │                             │  Update Resources              │
         │                             │  Update Connections            │
         │                             │ ─────────────────────────────► │
         │                             │ ◄───────────────────────────── │
         │  { project }                │                                │
         │ ◄─────────────────────────  │                                │
         │                             │                                │
         │  POST /api/terraform/generate/{id}                           │
         │ ─────────────────────────►  │                                │
         │                             │  Generate Terraform            │
         │                             │  Store TerraformOutput         │
         │                             │ ─────────────────────────────► │
         │                             │ ◄───────────────────────────── │
         │  { files: {...} }           │                                │
         │ ◄─────────────────────────  │                                │
         │                             │                                │


═══════════════════════════════════════════════════════════════════════════════════════════
                              DATA TRANSFORMATION FLOW
═══════════════════════════════════════════════════════════════════════════════════════════

┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│   Frontend Node      │        │    API Resource      │        │   Database Model     │
│   (ReactFlow)        │        │    (Pydantic)        │        │   (SQLAlchemy)       │
├──────────────────────┤        ├──────────────────────┤        ├──────────────────────┤
│ id: "aws_vpc_123"    │   ──►  │ node_id: "aws_vpc.." │   ──►  │ node_id: "aws_vpc.." │
│ type: "vpc"          │        │ resource_type:"aws.."│        │ resource_type:"aws.."│
│ position: {x, y}     │        │ position_x: number   │        │ position_x: INT      │
│ data: {              │        │ position_y: number   │        │ position_y: INT      │
│   resourceType:"..."│        │ resource_name: "..."│        │ resource_name: STR   │
│   config: {...}      │        │ config: {...}        │        │ config: JSON         │
│ }                    │        │                      │        │                      │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│   Frontend Edge      │        │   API Connection     │        │   Database Model     │
│   (ReactFlow)        │        │   (Pydantic)         │        │   (SQLAlchemy)       │
├──────────────────────┤        ├──────────────────────┤        ├──────────────────────┤
│ id: "edge-src-tgt"   │   ──►  │ source_id: number    │   ──►  │ source_id: FK(INT)   │
│ source: "node_123"   │        │ target_id: number    │        │ target_id: FK(INT)   │
│ target: "node_456"   │        │ connection_type:"..."│        │ connection_type: STR │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

---

## Category Catalogs Structure

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           AWS RESOURCE CATALOG STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────────┐
                              │    CloudResource[]      │
                              │    (All AWS Services)   │
                              └───────────┬─────────────┘
                                          │
          ┌───────────┬───────────┬───────┴───────┬───────────┬───────────┐
          ▼           ▼           ▼               ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  COMPUTE    │ │  STORAGE    │ │  DATABASE   │ │ NETWORKING  │ │  SECURITY   │
│  CATALOG    │ │  CATALOG    │ │  CATALOG    │ │  CATALOG    │ │  CATALOG    │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ aws_instance│ │ aws_s3_     │ │ aws_db_     │ │ aws_vpc     │ │ aws_security│
│ aws_launch_ │ │   bucket    │ │   instance  │ │ aws_subnet  │ │   _group    │
│   template  │ │ aws_efs_    │ │ aws_rds_    │ │ aws_internet│ │ aws_iam_    │
│ aws_auto    │ │   file_sys  │ │   cluster   │ │   _gateway  │ │   role      │
│   scaling_  │ │ aws_ebs_    │ │ aws_dynamo  │ │ aws_nat_    │ │ aws_kms_key │
│   group     │ │   volume    │ │   db_table  │ │   gateway   │ │ aws_waf     │
│ ...         │ │ ...         │ │ ...         │ │ ...         │ │ ...         │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
          │           │           │               │           │
          └───────────┴───────────┴───────┬───────┴───────────┘
                                          │
                                          ▼
                    ┌─────────────────────────────────────────┐
                    │         Additional Catalogs             │
                    ├─────────────────────────────────────────┤
                    │ • CONTAINERS_CATALOG    (ECS, EKS, ECR) │
                    │ • SERVERLESS_CATALOG    (Lambda, API GW)│
                    │ • ANALYTICS_CATALOG     (Kinesis, EMR)  │
                    │ • MESSAGING_CATALOG     (SNS, SQS)      │
                    │ • MACHINE_LEARNING_CAT  (SageMaker)     │
                    │ • MANAGEMENT_CATALOG    (CloudWatch)    │
                    │ • DEVELOPER_TOOLS_CAT   (CodePipeline)  │
                    └─────────────────────────────────────────┘
```

---

## Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Project | 1:N | One user owns many projects |
| Project → Resource | 1:N | One project contains many resources |
| Project → TerraformOutput | 1:N | One project has version history |
| Project → DriftScan | 1:N | One project has scan history |
| Project → CostEstimate | 1:1 | One project has one cost estimate |
| Resource → ResourceConnection | 1:N | One resource has many outgoing connections |
| ResourceConnection → Resource | N:1 | Many connections point to one target |

---

## Key Design Decisions

1. **JSON Storage for Flexibility**
   - `diagram_data` in Project stores entire ReactFlow state
   - `config` in Resource stores Terraform configuration
   - `cost_breakdown` stores full Infracost output

2. **Soft References**
   - Frontend uses string IDs (`node_id`)
   - Backend converts to integer foreign keys
   - Enables canvas state persistence

3. **Layered Z-Index System**
   - Containers: z-index 0-1
   - Resources: z-index 100
   - Ensures click-through behavior

4. **Category-Based Organization**
   - 12 AWS categories
   - Separate catalog files per category
   - Icon mapping per service type
