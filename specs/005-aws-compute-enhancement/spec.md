# Feature Specification: AWS Compute Resource Enhancement

**Feature Branch**: `005-aws-compute-enhancement`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Enhance AWS Compute by fetching valid attributes, arguments, inputs, outputs, and data types for each resource from Terraform Registry, use correct icons, classify as icon or container nodes, generate valid HCL, add tests as baseline."

## Clarifications

### Session 2026-01-14

- Q: Should resource schemas be embedded statically, fetched dynamically, or hybrid? → A: Hybrid (static default + optional manual refresh)
- Q: What is the performance target for HCL generation? → A: Under 3 seconds for typical diagrams (up to 50 resources)
- Q: Which Terraform AWS provider versions should be supported? → A: Only AWS provider 5.x (no backward compatibility with 4.x)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design EC2 Infrastructure with Complete Attributes (Priority: P1)

As an infrastructure designer, I want to drag an EC2 Instance onto the canvas and configure it with all valid Terraform attributes so that I can generate production-ready infrastructure code without consulting external documentation.

**Why this priority**: EC2 Instance is the most commonly used AWS compute resource. Having complete, accurate attribute definitions directly impacts the majority of users and enables the core value proposition of visual infrastructure design.

**Independent Test**: Can be fully tested by dragging an EC2 instance onto the canvas, configuring all available fields, and verifying the generated Terraform code matches valid HCL syntax that can be validated by `terraform validate`.

**Acceptance Scenarios**:

1. **Given** a blank design canvas, **When** I drag an EC2 Instance from the resource palette, **Then** the inspector panel displays all valid EC2 attributes organized by category (basic, networking, storage, security, advanced).

2. **Given** an EC2 Instance on canvas, **When** I configure required fields (AMI, instance type) and optional fields (subnet, security groups, key pair), **Then** the system validates input formats and shows helpful error messages for invalid values.

3. **Given** a configured EC2 Instance, **When** I generate Terraform code, **Then** the output includes all configured attributes with correct data types (strings, lists, maps, booleans) and valid HCL syntax.

4. **Given** generated Terraform code for EC2, **When** I run `terraform validate`, **Then** the code passes validation with no errors.

---

### User Story 2 - Configure Lambda Functions with Complete Schema (Priority: P1)

As a serverless architect, I want to design Lambda functions with all supported runtime options, memory configurations, and timeout settings so that I can create serverless infrastructure visually.

**Why this priority**: Lambda is the second most critical compute resource after EC2. Complete attribute support enables serverless architecture design within the platform.

**Independent Test**: Can be fully tested by creating a Lambda function with all available configurations and verifying the generated Terraform code includes proper IAM role creation and all Lambda attributes.

**Acceptance Scenarios**:

1. **Given** the resource palette, **When** I select Lambda Function, **Then** I see all supported runtimes (Node.js 18.x/20.x, Python 3.9/3.10/3.11/3.12, Java 11/17/21, Go, .NET, Ruby) as selectable options.

2. **Given** a Lambda on canvas, **When** I configure memory (128-10240 MB), timeout (1-900 seconds), and environment variables, **Then** the inspector validates ranges and formats correctly.

3. **Given** a Lambda with IAM role connection, **When** I generate Terraform, **Then** the code includes the Lambda function, IAM role with assume role policy, and any role policy attachments.

---

### User Story 3 - Design Container Workloads with ECS/EKS (Priority: P2)

As a container platform engineer, I want to design ECS clusters, services, and task definitions visually so that I can create container orchestration infrastructure without manual Terraform authoring.

**Why this priority**: Container workloads are increasingly common but more complex than EC2/Lambda. This enables users to design modern containerized applications.

**Independent Test**: Can be fully tested by creating an ECS cluster with a service and task definition, then verifying the generated Terraform includes proper container definitions and networking.

**Acceptance Scenarios**:

1. **Given** the resource palette, **When** I drag an ECS Cluster, **Then** I can configure capacity providers (FARGATE, FARGATE_SPOT, EC2) and cluster settings (Container Insights enabled/disabled).

2. **Given** an ECS Cluster on canvas, **When** I add an ECS Service inside it, **Then** the service inherits the cluster reference and I can configure desired count, deployment configuration, and network mode.

3. **Given** an ECS Service, **When** I define a task definition, **Then** I can configure container definitions with image, port mappings, CPU/memory, and environment variables.

4. **Given** a complete ECS architecture, **When** I generate Terraform, **Then** the code includes cluster, service, task definition, and necessary IAM roles with correct dependency ordering.

---

### User Story 4 - Visual Node Classification (Icon vs Container) (Priority: P2)

As a visual designer, I want resources to render appropriately as either standalone icons or expandable containers so that my infrastructure diagram accurately represents hierarchical relationships.

**Why this priority**: Visual clarity is essential for understanding infrastructure topology. Container nodes (VPC, Subnet, ECS Cluster) should visually contain child resources.

**Independent Test**: Can be fully tested by placing resources on canvas and verifying VPC/Subnet/ECS Cluster render as containers that can hold child resources, while EC2/Lambda render as icons.

**Acceptance Scenarios**:

1. **Given** an ECS Cluster on canvas, **When** I drag an ECS Service onto it, **Then** the service is visually contained within the cluster boundaries and inherits the cluster reference automatically.

2. **Given** a VPC container node, **When** I place a Subnet inside it, **Then** the subnet is visually contained and its VPC ID is automatically set.

3. **Given** the resource palette, **When** I view compute resources, **Then** container-type resources (ECS Cluster, EKS Cluster) display a distinct visual indicator differentiating them from icon-type resources (EC2, Lambda).

---

### User Story 5 - Auto Scaling Configuration (Priority: P3)

As an operations engineer, I want to configure Auto Scaling Groups with launch templates, scaling policies, and target tracking so that I can design self-scaling infrastructure.

**Why this priority**: Auto Scaling is important for production workloads but depends on EC2 and networking being fully functional first.

**Independent Test**: Can be fully tested by creating a Launch Template, Auto Scaling Group, and scaling policies, then verifying the generated Terraform includes correct launch template references and scaling configurations.

**Acceptance Scenarios**:

1. **Given** a Launch Template on canvas, **When** I configure AMI, instance type, and user data, **Then** these values are stored and can be referenced by Auto Scaling Groups.

2. **Given** an Auto Scaling Group connected to a Launch Template, **When** I set min/max/desired capacity, **Then** the generated Terraform includes proper launch_template block with version reference.

3. **Given** an ASG with target tracking policy, **When** I configure CPU or request count target, **Then** the generated code includes aws_autoscaling_policy with correct target_tracking_configuration.

---

### Edge Cases

- What happens when a user configures an EC2 instance without selecting a subnet? The system displays a validation warning but allows saving; Terraform generation includes a comment indicating the missing subnet.
- How does the system handle deprecated instance types or runtimes? The system displays a deprecation warning in the UI but still allows selection and generation.
- What happens when required fields are left empty? The system highlights missing required fields and prevents Terraform generation until they are completed.
- How does the system handle circular dependencies between resources? The system detects cycles during graph analysis and displays an error message with the affected resources.
- What happens when the Terraform Registry data is outdated? The system uses cached/embedded schema data and displays the last-updated date; users can manually trigger a refresh.

## Requirements *(mandatory)*

### Functional Requirements

#### Resource Schema & Attributes
- **FR-001**: System MUST provide complete attribute schemas for all AWS compute resources (EC2, Lambda, ECS, EKS, Auto Scaling, Elastic Beanstalk, App Runner, Batch) matching Terraform Registry definitions.
- **FR-002**: System MUST categorize each attribute as required or optional, matching Terraform provider requirements.
- **FR-003**: System MUST specify correct data types for all attributes (string, number, boolean, list, map, set, block).
- **FR-004**: System MUST display helpful descriptions for each attribute to guide users in configuration.
- **FR-005**: System MUST provide sensible default values for common optional attributes (e.g., t3.micro for instance_type).
- **FR-005a**: System MUST bundle static schema definitions at build time for offline capability and reliability.
- **FR-005b**: System MUST provide an optional manual refresh mechanism allowing users to update schemas from Terraform Registry on demand.

#### Visual Classification
- **FR-006**: System MUST classify each compute resource as either "icon" (standalone visual element) or "container" (can contain child resources).
- **FR-007**: Container resources (ECS Cluster, EKS Cluster) MUST visually render with boundaries that can contain child resources.
- **FR-008**: Icon resources (EC2, Lambda, EBS) MUST render as fixed-size visual elements with connection points for edges.

#### HCL Generation
- **FR-009**: System MUST generate syntactically valid HCL (HashiCorp Configuration Language) for all compute resources.
- **FR-010**: Generated HCL MUST pass `terraform validate` when all required attributes are provided.
- **FR-011**: System MUST correctly handle nested blocks (root_block_device, ebs_block_device, network_interface) in HCL generation.
- **FR-012**: System MUST generate proper Terraform resource references (e.g., aws_subnet.main.id) for connected resources.
- **FR-013**: System MUST order resources correctly based on dependency graph to ensure Terraform can plan/apply without errors.

#### Icons & Visual Elements
- **FR-014**: System MUST display correct AWS Architecture icons for each compute resource matching official AWS icon guidelines.
- **FR-015**: Icons MUST be high-resolution (64x64 or scalable SVG) and render clearly at all zoom levels.
- **FR-016**: Icon paths MUST resolve correctly in both development and production environments.

#### Validation & Error Handling
- **FR-017**: System MUST validate user inputs against attribute constraints (ranges, patterns, allowed values).
- **FR-018**: System MUST display clear, actionable error messages when validation fails.
- **FR-019**: System MUST prevent Terraform generation when required fields are missing.

#### Testing Baseline
- **FR-020**: System MUST include automated tests that verify HCL generation produces valid output for each compute resource.
- **FR-021**: System MUST include tests that verify resource schemas match expected attribute definitions.
- **FR-022**: System MUST include visual regression tests for icon rendering and container node behavior.

### Key Entities

- **Resource Definition**: Represents a compute resource type with its schema (type, label, description, category, icon path, isContainer flag, inputs, outputs).
- **Input Attribute**: Represents a configurable property with name, data type, required/optional status, default value, validation rules, and description.
- **Output Attribute**: Represents an exported value from a resource that can be referenced by other resources (id, arn, public_ip, etc.).
- **Relationship Rule**: Defines how resources can connect (containment, edge connection, auto-resolution) and what Terraform code results from connections.
- **Node Classification**: Categorization of a resource as either "icon" (standalone) or "container" (can hold children) for visual rendering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of AWS compute resources (EC2, Lambda, ECS Cluster, ECS Service, ECS Task Definition, EKS Cluster, EKS Node Group, Launch Template, Auto Scaling Group, Elastic Beanstalk, App Runner, Batch) have complete attribute schemas matching Terraform Registry.
- **SC-002**: Generated Terraform code passes `terraform validate` for 100% of supported resource configurations.
- **SC-003**: All compute resources display correct AWS official icons that match the service category (Compute, Containers).
- **SC-004**: Users can visually distinguish container nodes from icon nodes at a glance without consulting documentation.
- **SC-005**: Test coverage for HCL generation reaches 90% for all compute resource types.
- **SC-006**: Users can configure and generate Terraform for a basic EC2 instance in under 2 minutes.
- **SC-007**: Users can configure and generate Terraform for an ECS Fargate service in under 5 minutes.
- **SC-008**: Zero runtime errors occur when dragging, configuring, or connecting any compute resource.
- **SC-009**: Terraform code generation completes in under 3 seconds for diagrams containing up to 50 resources.

## Assumptions

- Terraform AWS provider version 5.x is the only supported version; provider 4.x and earlier are explicitly not supported
- AWS official Architecture Icons (July 2025 or later) are available in the Cloud_Services directory
- Users have basic understanding of AWS compute concepts (EC2, Lambda, ECS)
- The existing React Flow canvas supports both icon and container node rendering
- Backend Terraform generators can be extended to support additional attributes
- Frontend resource definitions can be enhanced without breaking existing functionality

## Dependencies

- AWS Terraform provider documentation (registry.terraform.io/providers/hashicorp/aws/latest)
- AWS Architecture Icon library (Cloud_Services directory)
- Existing React Flow infrastructure canvas
- Existing Terraform generation pipeline (backend/app/services/terraform/)
- Existing TypeScript catalog (backend/src/terraform/catalog/)

## Out of Scope

- Azure and GCP compute resources (separate feature)
- Terraform state management
- Real-time cost estimation during design
- Integration with AWS accounts for live resource validation
- Custom AMI management or image building
