# Data Model: Testing Infrastructure & CI/CD

**Feature**: 003-testing-infrastructure-cicd
**Date**: 2026-01-14

## Overview

This document defines the data entities for the testing infrastructure. These are primarily configuration and runtime entities, not database models.

## Entities

### 1. TestSuite

Represents a collection of related tests with shared configuration.

```typescript
interface TestSuite {
  name: string;                    // e.g., "backend-unit", "frontend-e2e"
  type: TestType;                  // unit | integration | e2e | performance | security | accessibility
  path: string;                    // Directory containing tests
  command: string;                 // CLI command to execute
  timeout: number;                 // Max execution time in seconds
  coverageTarget?: number;         // Min coverage percentage (0-100)
  retryCount: number;              // Max retries for flaky tests (default: 2)
  parallelism: number;             // Concurrent test runners (default: 1)
  dependencies: string[];          // Other suites that must pass first
  artifacts: ArtifactConfig[];     // What to capture on completion
}

enum TestType {
  UNIT = "unit",
  INTEGRATION = "integration",
  E2E = "e2e",
  PERFORMANCE = "performance",
  SECURITY = "security",
  ACCESSIBILITY = "accessibility"
}
```

### 2. TestResult

Represents the outcome of a single test execution.

```typescript
interface TestResult {
  id: string;                      // Unique identifier
  suiteName: string;               // Parent test suite
  testName: string;                // Individual test name
  status: TestStatus;              // passed | failed | skipped | error
  duration: number;                // Execution time in milliseconds
  errorMessage?: string;           // Failure reason if applicable
  errorStack?: string;             // Stack trace if applicable
  artifacts: ArtifactRef[];        // Screenshots, logs, traces
  timestamp: Date;                 // When test completed
  retryAttempt: number;            // Which attempt (0 = first)
}

enum TestStatus {
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
  ERROR = "error"
}
```

### 3. PipelineRun

Represents a single execution of the CI/CD pipeline.

```typescript
interface PipelineRun {
  id: string;                      // Unique run identifier
  triggerType: TriggerType;        // push | pull_request | schedule | manual
  branch: string;                  // Source branch
  commit: string;                  // Git commit SHA
  prNumber?: number;               // PR number if applicable
  stages: PipelineStage[];         // Ordered list of stages
  status: PipelineStatus;          // pending | running | passed | failed | cancelled
  startedAt: Date;                 // Pipeline start time
  completedAt?: Date;              // Pipeline end time
  duration?: number;               // Total duration in seconds
  triggeredBy: string;             // User or system that triggered
}

enum TriggerType {
  PUSH = "push",
  PULL_REQUEST = "pull_request",
  SCHEDULE = "schedule",
  MANUAL = "manual"
}

enum PipelineStatus {
  PENDING = "pending",
  RUNNING = "running",
  PASSED = "passed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}
```

### 4. PipelineStage

Represents a single stage within a pipeline run.

```typescript
interface PipelineStage {
  name: string;                    // e.g., "lint", "test-unit", "deploy-staging"
  status: PipelineStatus;          // Stage-level status
  jobs: PipelineJob[];             // Parallel jobs within stage
  startedAt?: Date;                // Stage start time
  completedAt?: Date;              // Stage end time
  duration?: number;               // Stage duration in seconds
  dependsOn: string[];             // Stages that must complete first
  continueOnError: boolean;        // Whether failure blocks pipeline
}
```

### 5. PipelineJob

Represents a single job (execution unit) within a stage.

```typescript
interface PipelineJob {
  name: string;                    // e.g., "backend-unit-py311"
  runner: string;                  // e.g., "ubuntu-latest"
  status: PipelineStatus;          // Job-level status
  steps: JobStep[];                // Sequential steps within job
  matrix?: Record<string, string>; // Matrix values if applicable
  startedAt?: Date;                // Job start time
  completedAt?: Date;              // Job end time
  logs: string;                    // URL to job logs
  artifacts: ArtifactRef[];        // Uploaded artifacts
}
```

### 6. SecurityFinding

Represents a vulnerability or security issue found by scanning.

```typescript
interface SecurityFinding {
  id: string;                      // Unique finding identifier
  source: SecuritySource;          // Which scanner found it
  severity: Severity;              // critical | high | medium | low | info
  title: string;                   // Short description
  description: string;             // Detailed explanation
  location: FindingLocation;       // Where the issue exists
  remediation?: string;            // How to fix it
  cveId?: string;                  // CVE identifier if applicable
  cweId?: string;                  // CWE identifier if applicable
  falsePositive: boolean;          // Marked as false positive
  suppressedUntil?: Date;          // Temporary suppression date
}

enum SecuritySource {
  PIP_AUDIT = "pip-audit",
  NPM_AUDIT = "npm-audit",
  TFSEC = "tfsec",
  TERRASCAN = "terrascan"
}

enum Severity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info"
}

interface FindingLocation {
  file: string;                    // File path
  line?: number;                   // Line number
  package?: string;                // Package name for dependencies
  version?: string;                // Package version
}
```

### 7. Deployment

Represents a deployment to an environment.

```typescript
interface Deployment {
  id: string;                      // Unique deployment identifier
  environment: Environment;        // staging | production
  version: string;                 // Application version or commit
  status: DeploymentStatus;        // pending | deploying | deployed | failed | rolled_back
  pipelineRunId: string;           // Associated pipeline run
  deployedAt?: Date;               // When deployment completed
  deployedBy: string;              // User who approved/triggered
  healthCheckPassed: boolean;      // Post-deploy health status
  rollbackAvailable: boolean;      // Can be rolled back
  previousVersion?: string;        // Version before this deployment
}

enum Environment {
  STAGING = "staging",
  PRODUCTION = "production"
}

enum DeploymentStatus {
  PENDING = "pending",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back"
}
```

### 8. ApprovalGate

Represents an approval checkpoint in the deployment process.

```typescript
interface ApprovalGate {
  id: string;                      // Unique gate identifier
  deploymentId: string;            // Deployment awaiting approval
  environment: Environment;        // Target environment
  status: ApprovalStatus;          // pending | approved | rejected | expired
  requiredApprovers: string[];     // Who can approve
  approvedBy?: string;             // Who approved
  approvedAt?: Date;               // When approved
  expiresAt: Date;                 // When gate expires (24h)
  comment?: string;                // Approval/rejection comment
}

enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired"
}
```

### 9. CoverageReport

Represents test coverage metrics.

```typescript
interface CoverageReport {
  id: string;                      // Unique report identifier
  pipelineRunId: string;           // Associated pipeline run
  suiteType: "backend" | "frontend";
  lineCoverage: number;            // Percentage (0-100)
  branchCoverage: number;          // Percentage (0-100)
  functionCoverage: number;        // Percentage (0-100)
  uncoveredFiles: UncoveredFile[]; // Files below threshold
  generatedAt: Date;               // Report generation time
  artifactUrl: string;             // URL to full report
}

interface UncoveredFile {
  path: string;                    // File path
  lineCoverage: number;            // File-level coverage
  uncoveredLines: number[];        // Line numbers not covered
}
```

### 10. LoadTestResult

Represents results from a performance/load test.

```typescript
interface LoadTestResult {
  id: string;                      // Unique result identifier
  pipelineRunId?: string;          // Associated pipeline run
  scenario: string;                // Test scenario name
  userCount: number;               // Virtual user count
  duration: number;                // Test duration in seconds
  rampUp: number;                  // Ramp-up time in seconds
  metrics: LoadTestMetrics;        // Performance metrics
  passed: boolean;                 // Met thresholds
  thresholdViolations: string[];   // Which thresholds failed
  executedAt: Date;                // When test ran
  reportUrl: string;               // URL to detailed report
}

interface LoadTestMetrics {
  requestCount: number;            // Total requests made
  failureCount: number;            // Failed requests
  failureRate: number;             // Percentage (0-100)
  avgResponseTime: number;         // Milliseconds
  p50ResponseTime: number;         // 50th percentile ms
  p95ResponseTime: number;         // 95th percentile ms
  p99ResponseTime: number;         // 99th percentile ms
  maxResponseTime: number;         // Maximum ms
  requestsPerSecond: number;       // Throughput
}
```

## Relationships

```
PipelineRun 1:N PipelineStage (stages)
PipelineStage 1:N PipelineJob (jobs)
PipelineRun 1:N TestResult (via suite execution)
PipelineRun 1:N SecurityFinding (via scans)
PipelineRun 1:N CoverageReport (backend + frontend)
PipelineRun 0:1 LoadTestResult (optional)
PipelineRun 1:N Deployment (staging, production)
Deployment 1:1 ApprovalGate (for production)
```

## Validation Rules

1. **TestSuite.timeout**: Must be positive, max 3600 seconds
2. **TestSuite.coverageTarget**: 0-100, optional
3. **TestSuite.retryCount**: 0-3
4. **TestResult.duration**: Must be non-negative
5. **SecurityFinding.severity**: CRITICAL/HIGH block pipeline, MEDIUM/LOW warn
6. **ApprovalGate.expiresAt**: Must be within 24 hours of creation
7. **CoverageReport.lineCoverage**: Must meet constitution threshold (80%+)
