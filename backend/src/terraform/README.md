# CloudForge Terraform Generator

**Data-Driven, Generic, Cloud-Agnostic Terraform Code Generation Engine**

## Overview

This is a **completely generic**, **data-driven** Terraform generator that contains **ZERO cloud-specific logic**. All intelligence lives in the service catalog as relationship rules.

### Key Principles

1. **Generic Engine**: No AWS/Azure/GCP-specific code in the engine
2. **Data-Driven Rules**: All relationship intelligence in service catalog
3. **Three Relationship Sources**:
   - Containment (parentId in diagram)
   - Explicit Edges (user-drawn connections)
   - Auto-Inference (safe, rule-based dependency resolution)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Diagram Input                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐      │
│  │  Nodes   │    │  Edges   │    │  Containment     │      │
│  │ (VPC, EC2)│   │(connect) │    │  (EC2 in Subnet) │      │
│  └──────────┘    └──────────┘    └──────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Graph Builder                             │
│  • Build containment tree from parentId                      │
│  • Build edge graph from connections                         │
│  • Generate stable Terraform identifiers                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Inference Engine                            │
│  Rule Application Order (MANDATORY):                         │
│  1. Containment rules                                        │
│  2. Edge rules (with scoring for disambiguation)             │
│  3. AutoResolve rules (only for missing required args)       │
│  4. Default values                                           │
│                                                              │
│  Precedence: edge > containment > autoResolve > default      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    HCL Renderer                              │
│  • Format arguments (literals vs references)                 │
│  • Render nested blocks                                      │
│  • Generate association resources                            │
│  • Produce clean, idiomatic HCL                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    main.tf output
```

## File Structure

```
backend/src/terraform/
├── types.ts              # ALL type definitions
├── registry.ts           # Service catalog registry
├── graph.ts              # Graph builder (containment + edges)
├── infer.ts              # Inference engine (rule application)
├── render.ts             # HCL renderer
├── generate.ts           # Main orchestrator (entry point)
├── index.ts              # Public API exports
├── catalog/              # Service definitions with rules
│   └── awsComputeWithRules.ts
├── __tests__/
│   └── generator.test.ts # Comprehensive test suite
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Service Catalog Extension

Existing frontend catalogs are extended with **two optional fields**:

```typescript
interface ServiceDefinition {
  // Existing fields (unchanged)
  id: string;
  name: string;
  terraform_resource: string;
  inputs: { required, optional, blocks };
  outputs: [...];

  // NEW (optional - backward compatible)
  terraform?: {
    resourceType: string;
    requiredArgs?: string[];
    referenceableAttrs?: Record<string, string>;
  };

  relations?: {
    containmentRules?: [...];
    edgeRules?: [...];
    autoResolveRules?: [...];
  };
}
```

### Example: EC2 Instance

```typescript
const ec2Service: ServiceDefinition = {
  id: "ec2_instance",
  name: "EC2 Instance",
  terraform_resource: "aws_instance",
  // ... existing fields ...

  terraform: {
    resourceType: "aws_instance",
    requiredArgs: ["ami", "instance_type"],
    referenceableAttrs: { id: "id", arn: "arn" },
  },

  relations: {
    // When EC2 is placed inside a Subnet
    containmentRules: [
      {
        whenParentResourceType: "aws_subnet",
        apply: [{ setArg: "subnet_id", toParentAttr: "id" }],
      },
    ],

    // When user draws EC2 -> Security Group edge
    edgeRules: [
      {
        whenEdgeKind: "connect",
        direction: "outbound",
        toResourceType: "aws_security_group",
        apply: [
          { pushToListArg: "vpc_security_group_ids", toTargetAttr: "id" },
        ],
      },
    ],

    // If subnet_id is missing, search ancestors
    autoResolveRules: [
      {
        requiredArg: "subnet_id",
        acceptsResourceTypes: ["aws_subnet"],
        search: [{ type: "containment_ancestors" }],
        onMissing: {
          level: "error",
          message: "EC2 requires a subnet",
          fixHint: "Place EC2 inside a subnet",
        },
      },
    ],
  },
};
```

## Relationship Types

### 1. Containment Rules

Applied when node has `parentId` (dragged inside another node).

```typescript
{
  whenParentResourceType: "aws_vpc",
  apply: [
    { setArg: "vpc_id", toParentAttr: "id" },
  ],
}
```

**Generates**: `vpc_id = aws_vpc.main.id`

### 2. Edge Rules

Applied when user draws connections with specific `kind`.

```typescript
{
  whenEdgeKind: "attach",
  direction: "outbound",
  toResourceType: "aws_iam_role",
  apply: [
    { setArg: "role", toTargetAttr: "name" },
  ],
}
```

**Edge Matching**: Uses scoring for disambiguation
- Exact port match (highest)
- Edge kind match
- Exact type match
- Category match (lowest)

### 3. Association Resources

Some Terraform relationships require intermediate resources:

```typescript
{
  whenEdgeKind: "attach",
  direction: "outbound",
  toResourceType: "aws_iam_policy",
  apply: {
    createAssociationResource: {
      type: "aws_iam_role_policy_attachment",
      nameTemplate: "${this.name}_${target.name}_attachment",
      args: {
        role: "${this.name}",
        policy_arn: "${target.arn}",
      },
    },
  },
}
```

**Generates**:
```hcl
resource "aws_iam_role_policy_attachment" "app_role_s3_policy_attachment" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_policy.arn
}
```

### 4. Auto-Resolve Rules

Fill missing required arguments using search strategies:

```typescript
{
  requiredArg: "subnet_id",
  acceptsResourceTypes: ["aws_subnet"],
  search: [
    { type: "containment_ancestors" },
    { type: "connected_edges", edgeKind: "connect" },
  ],
  onMissing: {
    level: "error",
    message: "Missing subnet_id",
  },
}
```

## Usage

### Basic Usage

```typescript
import { TerraformGenerator, ServiceRegistry } from "@cloudforge/terraform-generator";
import { awsComputeServicesWithRules } from "@cloudforge/terraform-generator";

// Setup
const registry = new ServiceRegistry();
registry.registerBulk(awsComputeServicesWithRules);

const generator = new TerraformGenerator(registry);

// Define diagram
const diagram = {
  nodes: [
    {
      id: "vpc1",
      provider: "aws",
      type: "aws_vpc",
      name: "main",
      properties: { cidr_block: "10.0.0.0/16" },
    },
    {
      id: "subnet1",
      provider: "aws",
      type: "aws_subnet",
      name: "public",
      parentId: "vpc1", // containment
      properties: { cidr_block: "10.0.1.0/24" },
    },
    {
      id: "ec2_1",
      provider: "aws",
      type: "aws_instance",
      name: "web",
      parentId: "subnet1", // containment
      properties: { ami: "ami-12345", instance_type: "t3.micro" },
    },
  ],
  edges: [],
};

// Generate
const result = generator.generate(diagram);

console.log(result.mainTf);
console.log(result.diagnostics);
```

### Output

```hcl
# Generated by CloudForge

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "public"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "web"
  }
}
```

## Conflict Handling

When multiple rules set the same argument, precedence is:

1. **Explicit edge** (highest)
2. **Containment**
3. **AutoResolve**
4. **Default** (lowest)

Conflicts at same level emit warnings.

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Scenarios

1. ✅ Containment-based relationship (EC2 in Subnet)
2. ✅ Edge-based relationship (EC2 -> IAM Role)
3. ✅ Association resource creation (IAM Role Policy Attachment)
4. ✅ AutoResolve for missing dependencies
5. ✅ Conflict detection and precedence
6. ✅ Load Balancer -> Target Group attachment

## Diagnostics

The generator returns diagnostics for:

- Missing required arguments
- Unmatched edge rules
- Ambiguous rule matches
- Conflicting values
- Unknown resource types

```typescript
interface Diagnostic {
  level: "error" | "warn" | "info";
  message: string;
  nodeId?: string;
  edgeId?: string;
  fieldName?: string;
  fixHint?: string;
}
```

## Extending to New Cloud Providers

**No code changes needed!** Just add service definitions:

```typescript
// Azure example
const azureVMService: ServiceDefinition = {
  id: "azure_vm",
  name: "Virtual Machine",
  terraform_resource: "azurerm_virtual_machine",
  // ... inputs, outputs ...
  terraform: {
    resourceType: "azurerm_virtual_machine",
    requiredArgs: ["name", "location"],
  },
  relations: {
    containmentRules: [...],
    edgeRules: [...],
  },
};
```

## Migration from Python Backend

The existing Python generator (`backend/app/services/terraform/generator.py`) should be replaced with this TypeScript implementation. The FastAPI endpoint can call the TypeScript generator via:

1. **Option A**: Subprocess call to Node.js
2. **Option B**: Rewrite FastAPI backend in Node.js/Express
3. **Option C**: Use this as a separate microservice

## Contributing

When adding new services:

1. Define service in catalog with full schema
2. Add `terraform` metadata (required args, referenceable attrs)
3. Add `relations` rules (containment, edge, autoResolve)
4. Write tests demonstrating the relationships
5. Update documentation with examples

## License

MIT
