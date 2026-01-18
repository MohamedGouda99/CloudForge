# Data Model: Production Readiness & Comprehensive Testing

**Feature**: 002-production-readiness-testing
**Date**: 2026-01-14

## Overview

This document defines the data entities introduced or modified for production readiness and testing infrastructure. Most changes extend existing models rather than creating new tables.

## Entities

### 1. Migration (NEW - Alembic managed)

Database migration tracking for schema versioning.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| version_num | VARCHAR(32) | PK | Migration version identifier |
| description | TEXT | | Migration description |
| applied_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When migration was applied |

**Notes**: This is Alembic's standard `alembic_version` table, auto-managed.

### 2. AppMetric (NEW)

Application performance metrics for observability.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique metric identifier |
| metric_name | VARCHAR(100) | NOT NULL, INDEX | Metric name (e.g., "api_request_duration") |
| metric_value | FLOAT | NOT NULL | Numeric value |
| metric_labels | JSONB | | Key-value labels (endpoint, method, status) |
| recorded_at | TIMESTAMP | NOT NULL, INDEX | When metric was recorded |

**Notes**: Used for internal metrics storage. Prometheus scrapes from `/metrics` endpoint, but this provides historical data for dashboards.

### 3. ConfigValidation (NEW)

Runtime configuration validation records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique validation record |
| config_key | VARCHAR(100) | NOT NULL | Configuration key validated |
| validation_status | ENUM | NOT NULL | 'valid', 'missing', 'invalid' |
| validation_message | TEXT | | Error message if invalid |
| validated_at | TIMESTAMP | NOT NULL | When validation occurred |
| environment | VARCHAR(20) | NOT NULL | 'development', 'staging', 'production' |

**Notes**: Records startup configuration validation for audit trail.

### 4. TestRun (NEW)

Test execution tracking for CI/CD visibility.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique test run identifier |
| run_type | ENUM | NOT NULL | 'unit', 'integration', 'e2e', 'load', 'accessibility', 'security' |
| started_at | TIMESTAMP | NOT NULL | Test run start time |
| completed_at | TIMESTAMP | | Test run completion time |
| status | ENUM | NOT NULL | 'running', 'passed', 'failed', 'error' |
| total_tests | INTEGER | | Total test count |
| passed_tests | INTEGER | | Passed test count |
| failed_tests | INTEGER | | Failed test count |
| coverage_percent | FLOAT | | Code coverage percentage |
| report_url | VARCHAR(500) | | Link to detailed report |
| triggered_by | VARCHAR(100) | | User or CI system that triggered |

**Notes**: Optional entity for tracking test runs in dashboard. Can be populated by CI webhooks.

### 5. Project (MODIFIED - existing)

Add fields for migration and deployment tracking.

| New Field | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| schema_version | INTEGER | DEFAULT 1 | Schema version for diagram_data format |
| last_validated_at | TIMESTAMP | | Last successful validation timestamp |
| validation_errors | JSONB | | Cached validation errors |

**Notes**: Supports schema migration for existing projects when data format changes.

### 6. User (MODIFIED - existing)

Add audit fields for production compliance.

| New Field | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| last_login_at | TIMESTAMP | | Last successful login |
| failed_login_count | INTEGER | DEFAULT 0 | Consecutive failed logins |
| locked_until | TIMESTAMP | | Account lockout expiry |

**Notes**: Supports security monitoring and brute-force protection.

## Relationships

```
User (1) ──────── (N) Project
                      │
                      │ schema_version tracks data format
                      │
Project (1) ────── (N) Resource (existing)
                      │
                      │
TestRun (independent) - tracks CI/CD test executions
AppMetric (independent) - time-series metrics
ConfigValidation (independent) - startup audit log
Migration (independent) - Alembic version tracking
```

## State Transitions

### TestRun.status

```
[created] → running → passed
                   → failed
                   → error (infrastructure failure)
```

### ConfigValidation.validation_status

```
[startup] → valid (proceed)
         → missing (fail fast with error)
         → invalid (fail fast with error)
```

### User.locked_until (Security)

```
[normal] → (5 failed logins) → locked (30 minutes)
                             → (time expires) → [normal]
```

## Validation Rules

### AppMetric
- `metric_name` must match pattern: `[a-z_]+` (lowercase with underscores)
- `metric_value` must be non-negative
- `recorded_at` must not be in the future

### ConfigValidation
- `config_key` must be non-empty
- `environment` must be one of: development, staging, production

### TestRun
- `completed_at` must be >= `started_at` when set
- `passed_tests + failed_tests` must equal `total_tests`
- `coverage_percent` must be between 0 and 100

### User (new fields)
- `failed_login_count` resets to 0 on successful login
- `locked_until` set to NOW() + 30 minutes when `failed_login_count` reaches 5

## Data Volume Estimates

| Entity | Expected Records | Retention |
|--------|------------------|-----------|
| Migration | ~50 total | Permanent |
| AppMetric | ~1M/day at scale | 30 days rolling |
| ConfigValidation | ~10/day | 90 days |
| TestRun | ~100/day (CI) | 90 days |
| Project (modified) | Existing | Permanent |
| User (modified) | Existing | Permanent |

## Migration Strategy

### Existing Data
1. Add new columns to Project and User with DEFAULT values
2. Backfill `schema_version = 1` for all existing projects
3. No data transformation required for existing records

### New Tables
1. Create tables in order: Migration → AppMetric → ConfigValidation → TestRun
2. No foreign keys to existing tables (independent entities)
3. Add indexes for query patterns (metric_name, recorded_at, etc.)

## Indexes

```sql
-- AppMetric (time-series queries)
CREATE INDEX idx_appmetric_name_time ON app_metric(metric_name, recorded_at DESC);

-- ConfigValidation (audit queries)
CREATE INDEX idx_configvalidation_env_time ON config_validation(environment, validated_at DESC);

-- TestRun (dashboard queries)
CREATE INDEX idx_testrun_type_time ON test_run(run_type, started_at DESC);
CREATE INDEX idx_testrun_status ON test_run(status) WHERE status = 'running';

-- User (security queries)
CREATE INDEX idx_user_locked ON users(locked_until) WHERE locked_until IS NOT NULL;
```
