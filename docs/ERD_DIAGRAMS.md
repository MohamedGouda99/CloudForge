# Entity Relationship Diagrams

This document is the authoritative visual reference for CloudForge's data layer. Diagrams below are authored in [Mermaid](https://mermaid.js.org/) and render natively on GitHub. They're kept in sync with `backend/app/models/` — when a model changes, update the matching diagram in the same PR.

## Contents

- [Backend Database (SQLAlchemy)](#backend-database-erd-sqlalchemy-models)
- [Relationship Matrix](#relationship-matrix)
- [Key Design Decisions](#key-design-decisions)

---

## Backend Database ERD (SQLAlchemy Models)

```mermaid
erDiagram
    USER {
        int id PK
        string email UK "UNIQUE, INDEX"
        string username UK "UNIQUE, INDEX"
        string hashed_password
        string full_name
        boolean is_active
        boolean is_superuser
        datetime created_at
        datetime updated_at
    }

    PROJECT {
        int id PK
        int owner_id FK
        string name
        text description
        string cloud_provider "ENUM: aws|azure|gcp"
        json diagram_data "Visual designer state"
        string git_repo_url
        string git_branch
        datetime created_at
        datetime updated_at
    }

    RESOURCE {
        int id PK
        int project_id FK
        string resource_type
        string resource_name
        string node_id "Frontend node reference"
        int position_x
        int position_y
        json config "Terraform configuration"
        datetime created_at
        datetime updated_at
    }

    RESOURCE_CONNECTION {
        int id PK
        int source_id FK
        int target_id FK
        string connection_type "network|depends_on|security_group"
        datetime created_at
    }

    TERRAFORM_OUTPUT {
        int id PK
        int project_id FK
        text main_tf
        text variables_tf
        text outputs_tf
        text providers_tf
        int version
        datetime created_at
    }

    DRIFT_SCAN {
        int id PK
        int project_id FK
        string status "ENUM: pending|running|completed|failed"
        text result
        string error_message
        datetime started_at
        datetime completed_at
    }

    COST_ESTIMATE {
        int id PK
        int project_id FK "UNIQUE"
        float monthly_cost
        string currency
        int resources_count
        json cost_breakdown
        datetime created_at
        datetime updated_at
    }

    USER ||--o{ PROJECT : "owns"
    PROJECT ||--o{ RESOURCE : "contains"
    PROJECT ||--o{ TERRAFORM_OUTPUT : "generates"
    PROJECT ||--o{ DRIFT_SCAN : "has"
    PROJECT ||--o| COST_ESTIMATE : "has"
    RESOURCE ||--o{ RESOURCE_CONNECTION : "source"
    RESOURCE ||--o{ RESOURCE_CONNECTION : "target"
```

---

## Frontend Data Model ERD (TypeScript Interfaces)

```mermaid
erDiagram
    AUTH_STATE {
        string token "nullable"
        User user "nullable"
        boolean isAuthenticated
        function setAuth
        function logout
    }

    USER {
        string id
        string email
        string username
        string full_name "optional"
        boolean is_active
        boolean is_superuser
    }

    CLOUD_RESOURCE {
        string type "e.g. aws_instance"
        string label "Display name"
        string provider "aws|azure|gcp"
        string category "compute|storage|etc"
        string originalCategory
        string description
        string icon "Path to SVG"
        boolean isContainer "optional"
        boolean isDataSource "optional"
    }

    NODE {
        string id "Unique identifier"
        string type "NodeType enum"
        object position "x, y coordinates"
        NodeData data
        object style "CSS including zIndex"
        string extent "parent - for nesting"
        boolean expandParent "optional"
    }

    NODE_DATA {
        string label "optional"
        string displayName "optional"
        string resourceType "e.g. aws_instance"
        string resourceLabel "optional"
        string resourceCategory "optional"
        string resourceDescription "optional"
        object config "Terraform config"
        string icon "optional"
        string category "optional"
        object size "width, height"
        boolean isContainer "optional"
        boolean isDataSource "optional"
        boolean isLocked "optional"
        boolean isOmitted "optional"
    }

    EDGE {
        string id "edge-sourceId-targetId"
        string source "Source node ID"
        string target "Target node ID"
        string sourceHandle "source-Top|Bottom|etc"
        string targetHandle "target-Top|Bottom|etc"
        string type "Edge styling type"
        boolean animated "optional"
        object style "CSS properties"
    }

    AUTH_STATE ||--o| USER : "contains"
    NODE ||--|| NODE_DATA : "has"
    CLOUD_RESOURCE ||--o{ NODE : "creates"
```

---

## Resource Schema Types

```mermaid
erDiagram
    RESOURCE_SCHEMA {
        string resourceType
        string provider "aws|azure|gcp"
        string category
        string displayName
        string description
        string icon "optional"
        SchemaField[] fields
        SchemaBlock[] blocks "optional"
        SchemaOutput[] outputs "optional"
    }

    SCHEMA_FIELD {
        string name
        string type "string|number|boolean|select|etc"
        string label
        string description "optional"
        boolean required "optional"
        any default "optional"
        object[] options "For select types"
        object validation "pattern|min|max|etc"
        string group "basic|advanced|network"
        string referenceType "For reference fields"
        string dependsOn "Field dependency"
        object showWhen "Conditional display"
    }

    SCHEMA_BLOCK {
        string name
        string label
        boolean repeatable
        SchemaField[] fields
    }

    SCHEMA_OUTPUT {
        string name
        string attribute
        string description
    }

    RESOURCE_SCHEMA ||--o{ SCHEMA_FIELD : "contains"
    RESOURCE_SCHEMA ||--o{ SCHEMA_BLOCK : "contains"
    RESOURCE_SCHEMA ||--o{ SCHEMA_OUTPUT : "defines"
    SCHEMA_BLOCK ||--o{ SCHEMA_FIELD : "contains"
```

---

## API Data Flow

```mermaid
erDiagram
    FRONTEND_NODE {
        string id "aws_vpc_123"
        string type "vpc"
        object position "x, y"
        object data "NodeData"
    }

    API_RESOURCE {
        string node_id "aws_vpc_123"
        string resource_type "aws_vpc"
        int position_x
        int position_y
        string resource_name
        json config
    }

    DATABASE_MODEL {
        string node_id "VARCHAR"
        string resource_type "VARCHAR"
        int position_x "INTEGER"
        int position_y "INTEGER"
        string resource_name "VARCHAR"
        json config "JSON"
    }

    FRONTEND_EDGE {
        string id "edge-src-tgt"
        string source "node_123"
        string target "node_456"
    }

    API_CONNECTION {
        int source_id "FK"
        int target_id "FK"
        string connection_type
    }

    DB_CONNECTION {
        int source_id "FK INTEGER"
        int target_id "FK INTEGER"
        string connection_type "VARCHAR"
    }

    FRONTEND_NODE ||--|| API_RESOURCE : "transforms to"
    API_RESOURCE ||--|| DATABASE_MODEL : "persists as"
    FRONTEND_EDGE ||--|| API_CONNECTION : "transforms to"
    API_CONNECTION ||--|| DB_CONNECTION : "persists as"
```

---

## Z-Index Layer System

```mermaid
erDiagram
    LAYER_100_RESOURCES {
        string description "Top layer - clickable"
        string examples "aws_instance, aws_lambda, aws_s3_bucket"
        int zIndex "100"
    }

    LAYER_1_INNER_CONTAINERS {
        string description "Inner containers"
        string examples "subnet, availability_zone"
        int zIndex "1"
    }

    LAYER_0_OUTER_CONTAINERS {
        string description "Bottom layer - base containers"
        string examples "vpc, region, container"
        int zIndex "0"
    }

    LAYER_100_RESOURCES ||--o{ LAYER_1_INNER_CONTAINERS : "renders above"
    LAYER_1_INNER_CONTAINERS ||--o{ LAYER_0_OUTER_CONTAINERS : "renders above"
```

---

## AWS Resource Catalog Structure

```mermaid
erDiagram
    AWS_CATALOG {
        string provider "aws"
        CloudResource[] resources
    }

    COMPUTE_CATALOG {
        string category "compute"
        string[] types "aws_instance, aws_launch_template, aws_autoscaling_group"
    }

    STORAGE_CATALOG {
        string category "storage"
        string[] types "aws_s3_bucket, aws_efs_file_system, aws_ebs_volume"
    }

    DATABASE_CATALOG {
        string category "database"
        string[] types "aws_db_instance, aws_rds_cluster, aws_dynamodb_table"
    }

    NETWORKING_CATALOG {
        string category "networking"
        string[] types "aws_vpc, aws_subnet, aws_internet_gateway, aws_nat_gateway"
    }

    SECURITY_CATALOG {
        string category "security"
        string[] types "aws_security_group, aws_iam_role, aws_kms_key"
    }

    SERVERLESS_CATALOG {
        string category "serverless"
        string[] types "aws_lambda_function, aws_api_gateway_rest_api"
    }

    CONTAINERS_CATALOG {
        string category "containers"
        string[] types "aws_ecs_cluster, aws_eks_cluster, aws_ecr_repository"
    }

    MESSAGING_CATALOG {
        string category "messaging"
        string[] types "aws_sns_topic, aws_sqs_queue"
    }

    AWS_CATALOG ||--|| COMPUTE_CATALOG : "includes"
    AWS_CATALOG ||--|| STORAGE_CATALOG : "includes"
    AWS_CATALOG ||--|| DATABASE_CATALOG : "includes"
    AWS_CATALOG ||--|| NETWORKING_CATALOG : "includes"
    AWS_CATALOG ||--|| SECURITY_CATALOG : "includes"
    AWS_CATALOG ||--|| SERVERLESS_CATALOG : "includes"
    AWS_CATALOG ||--|| CONTAINERS_CATALOG : "includes"
    AWS_CATALOG ||--|| MESSAGING_CATALOG : "includes"
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
