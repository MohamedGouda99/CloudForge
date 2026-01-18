# Research: AWS Resource Classification Audit

**Feature**: 006-aws-resource-classification
**Date**: 2026-01-15
**Status**: Complete

## Research Summary

This document captures the research findings and decisions made during the planning phase for the AWS Resource Classification feature.

---

## R1: Container vs Icon Classification Criteria

**Question**: How do we determine whether an AWS resource should be classified as "container" or "icon"?

**Decision**: A resource is classified as "container" if it architecturally and visually contains other resources in typical AWS deployments.

**Rationale**:
- AWS resources have natural hierarchical relationships (VPC → Subnet → EC2)
- The visual designer should reflect these relationships through containment
- Container classification enables drag-and-drop nesting in React Flow

**Alternatives Considered**:
1. **Only network boundaries** (VPC, Subnet) - Too restrictive, misses logical containers like ECS Cluster
2. **Any parent-child relationship** - Too broad, would make every resource a container
3. **User-defined** - Added complexity, inconsistent experience

**Final Criteria**:
- Resource commonly contains other resources in AWS architecture diagrams
- Terraform supports nested/associated resources
- Visual containment improves diagram clarity

---

## R2: Containment Validation Strategy

**Question**: How should the system handle invalid containment (resource placed in wrong container)?

**Decision**: Warn but Allow - Show visual warning indicator but permit placement.

**Rationale**:
- Users may have legitimate non-standard architectures
- Strict enforcement would frustrate users
- Warning provides guidance without blocking work

**Implementation**:
- Yellow warning border on invalidly-placed resources
- Toast notification explaining the issue
- Warning persists until resolved or dismissed

---

## R3: Migration from Hardcoded Rules

**Question**: How should we handle the existing hardcoded containment rules in projects.py (~300 lines)?

**Decision**: Complete replacement - Remove all hardcoded rules, use catalog as sole source.

**Rationale**:
- Maintaining two systems creates inconsistency risk
- Catalog is designed to be single source of truth
- Cleaner codebase, easier maintenance

**Migration Steps**:
1. Add containmentRules to all container ServiceDefinitions in catalog
2. Update SchemaLoader to expose containment lookup methods
3. Refactor projects.py auto-wiring to use SchemaLoader
4. Remove hardcoded resource lists
5. Add tests to verify behavior matches original

---

## R4: Catalog Unavailability Handling

**Question**: How should the system behave when catalog API is unavailable?

**Decision**: Cached Fallback - Use last cached classification data with stale indicator.

**Rationale**:
- Complete failure is too disruptive
- Users should be able to continue working
- Stale indicator maintains transparency

**Implementation**:
- Frontend caches catalog data in localStorage
- Cache has 24-hour TTL for freshness
- "Stale data" banner shown when using cache
- Automatic retry on reconnection

---

## R5: Unknown Resource Type Handling

**Question**: How should the system handle resource types not in the catalog?

**Decision**: Default Icon + Warning - Treat as icon, show "unknown resource" indicator.

**Rationale**:
- New AWS services released regularly
- Typos in resource types shouldn't break designer
- Warning alerts developers to add to catalog

**Implementation**:
- Default classification: "icon"
- Orange badge on unknown resources
- Log warning to console for debugging
- List unknown resources in project validation report

---

## R6: AWS Service Category Coverage

**Question**: Which AWS service categories need classification?

**Decision**: All 12 major categories currently in CloudForge.

**Categories**:
1. Compute (EC2, Lambda, ASG, Batch, etc.)
2. Networking (VPC, Subnet, Security Groups, Load Balancers, etc.)
3. Storage (S3, EFS, EBS, etc.)
4. Database (RDS, DynamoDB, ElastiCache, etc.)
5. Containers (ECS, EKS, ECR)
6. Serverless (Lambda, API Gateway, Step Functions)
7. Security (IAM, KMS, Secrets Manager, etc.)
8. Analytics (Redshift, Kinesis, Glue)
9. Developer Tools (CodePipeline, CodeBuild)
10. Management (CloudWatch, EventBridge)
11. Messaging (SNS, SQS)
12. Machine Learning (SageMaker)

**Container Resources Identified**: 30+ resources across categories (see spec.md Resource Classification Matrix)

---

## R7: React Flow Node Type Mapping

**Question**: How do classifications map to React Flow node types?

**Decision**:
- `container` → GroupNode (expandable boundary, accepts children)
- `icon` → CustomNode (fixed size, no children)

**Rationale**:
- React Flow's GroupNode already supports containment
- Consistent with existing designer implementation
- No new node types required

---

## R8: Performance Considerations

**Question**: What performance targets apply to classification lookups?

**Decision**:
- Catalog API response: < 200ms p95
- Frontend cache lookup: < 5ms
- Canvas render with 100 nodes: 60 FPS

**Rationale**:
- Constitution requires < 200ms for simple CRUD
- Drag-and-drop needs instant feedback
- Canvas performance is constitution requirement

**Implementation**:
- Backend: In-memory catalog cache (refreshed on startup)
- Frontend: Preload catalog on app init
- Classification lookup via Map for O(1) access

---

## Conclusions

All NEEDS CLARIFICATION items have been resolved through stakeholder input and technical research. The implementation can proceed with:

1. Clear classification criteria based on AWS architectural patterns
2. User-friendly validation approach (warn, don't block)
3. Clean migration strategy (complete replacement)
4. Robust fallback mechanisms (caching, defaults)
5. Comprehensive category coverage (12 categories, 150+ resources)
