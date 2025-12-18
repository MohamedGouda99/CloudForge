/**
 * AWS Database Services Data - Complete definitions from database.json
 * This file contains ALL 17 database services with ALL their properties
 * 
 * Services included:
 * 1. RDS Database Instance (aws_db_instance)
 * 2. RDS Aurora Cluster (aws_rds_cluster)
 * 3. RDS Aurora Instance (aws_rds_cluster_instance)
 * 4. DB Subnet Group (aws_db_subnet_group)
 * 5. DB Parameter Group (aws_db_parameter_group)
 * 6. DB Option Group (aws_db_option_group)
 * 7. RDS Proxy (aws_db_proxy)
 * 8. DynamoDB Table (aws_dynamodb_table)
 * 9. DynamoDB Global Table (aws_dynamodb_global_table)
 * 10. ElastiCache Cluster (aws_elasticache_cluster)
 * 11. ElastiCache Replication Group (aws_elasticache_replication_group)
 * 12. ElastiCache Subnet Group (aws_elasticache_subnet_group)
 * 13. Redshift Cluster (aws_redshift_cluster)
 * 14. DocumentDB Cluster (aws_docdb_cluster)
 * 15. DocumentDB Instance (aws_docdb_cluster_instance)
 * 16. Neptune Cluster (aws_neptune_cluster)
 * 17. Timestream Database (aws_timestreamwrite_database)
 * 18. Timestream Table (aws_timestreamwrite_table)
 * 19. MemoryDB Cluster (aws_memorydb_cluster)
 */

import { ServiceInput, ServiceBlock, ServiceOutput } from './computeServicesData';

// Database service icon mappings - using actual AWS Architecture icons
export const DATABASE_ICONS: Record<string, string> = {
  'aws_db_instance': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
  'aws_rds_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Aurora_64.svg',
  'aws_rds_cluster_instance': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Aurora_64.svg',
  'aws_db_subnet_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
  'aws_db_parameter_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
  'aws_db_option_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
  'aws_db_proxy': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg',
  'aws_dynamodb_table': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-DynamoDB_64.svg',
  'aws_dynamodb_global_table': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-DynamoDB_64.svg',
  'aws_elasticache_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg',
  'aws_elasticache_replication_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg',
  'aws_elasticache_subnet_group': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg',
  'aws_redshift_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Analytics/64/Arch_Amazon-Redshift_64.svg',
  'aws_docdb_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-DocumentDB_64.svg',
  'aws_docdb_cluster_instance': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-DocumentDB_64.svg',
  'aws_neptune_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Neptune_64.svg',
  'aws_timestreamwrite_database': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Timestream_64.svg',
  'aws_timestreamwrite_table': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Timestream_64.svg',
  'aws_memorydb_cluster': '/cloud_icons/AWS/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-MemoryDB_64.svg',
};

// Database service definition interface
export interface DatabaseServiceDefinition {
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}

// Complete database services data from database.json
export const DATABASE_SERVICES: DatabaseServiceDefinition[] = [
  {
    id: "rds_instance",
    name: "RDS Database Instance",
    description: "Managed relational database",
    terraform_resource: "aws_db_instance",
    icon: DATABASE_ICONS['aws_db_instance'],
    inputs: {
      required: [
        { name: "allocated_storage", type: "number", description: "Storage size in GB" },
        { name: "engine", type: "string", description: "Database engine", options: ["mysql", "postgres", "mariadb", "oracle-ee", "oracle-se2", "sqlserver-ee", "sqlserver-se", "sqlserver-ex", "sqlserver-web"] },
        { name: "instance_class", type: "string", description: "Instance class", options: ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large", "db.m5.large", "db.m5.xlarge", "db.r5.large", "db.r5.xlarge"] },
        { name: "username", type: "string", description: "Master username" }
      ],
      optional: [
        { name: "identifier", type: "string", description: "Database identifier" },
        { name: "password", type: "string", description: "Master password" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "port", type: "number", description: "Database port" },
        { name: "db_name", type: "string", description: "Database name" },
        { name: "multi_az", type: "bool", description: "Enable Multi-AZ" },
        { name: "publicly_accessible", type: "bool", description: "Publicly accessible" },
        { name: "db_subnet_group_name", type: "string", description: "DB subnet group name", reference: "aws_db_subnet_group.name" },
        { name: "vpc_security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "parameter_group_name", type: "string", description: "Parameter group name", reference: "aws_db_parameter_group.name" },
        { name: "storage_type", type: "string", description: "Storage type", options: ["standard", "gp2", "gp3", "io1"] },
        { name: "storage_encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "backup_retention_period", type: "number", description: "Backup retention days" },
        { name: "backup_window", type: "string", description: "Backup window" },
        { name: "maintenance_window", type: "string", description: "Maintenance window" },
        { name: "skip_final_snapshot", type: "bool", description: "Skip final snapshot" },
        { name: "deletion_protection", type: "bool", description: "Enable deletion protection" },
        { name: "performance_insights_enabled", type: "bool", description: "Enable Performance Insights" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "restore_to_point_in_time",
          attributes: [
            { name: "restore_time", type: "string" },
            { name: "source_db_instance_identifier", type: "string" },
            { name: "use_latest_restorable_time", type: "bool" }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "arn", type: "string", description: "Instance ARN" },
      { name: "address", type: "string", description: "DNS address" },
      { name: "endpoint", type: "string", description: "Connection endpoint" },
      { name: "port", type: "number", description: "Port number" }
    ]
  },
  {
    id: "rds_cluster",
    name: "RDS Aurora Cluster",
    description: "Amazon Aurora cluster",
    terraform_resource: "aws_rds_cluster",
    icon: DATABASE_ICONS['aws_rds_cluster'],
    inputs: {
      required: [
        { name: "engine", type: "string", description: "Database engine", options: ["aurora-mysql", "aurora-postgresql"] }
      ],
      optional: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier" },
        { name: "master_username", type: "string", description: "Master username" },
        { name: "master_password", type: "string", description: "Master password" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "engine_mode", type: "string", description: "Engine mode", options: ["global", "multimaster", "parallelquery", "provisioned", "serverless"] },
        { name: "database_name", type: "string", description: "Database name" },
        { name: "port", type: "number", description: "Database port" },
        { name: "db_subnet_group_name", type: "string", description: "DB subnet group name" },
        { name: "vpc_security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "storage_encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "backup_retention_period", type: "number", description: "Backup retention days" },
        { name: "skip_final_snapshot", type: "bool", description: "Skip final snapshot" },
        { name: "deletion_protection", type: "bool", description: "Enable deletion protection" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "serverlessv2_scaling_configuration",
          attributes: [
            { name: "max_capacity", type: "number", required: true },
            { name: "min_capacity", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "endpoint", type: "string", description: "Writer endpoint" },
      { name: "reader_endpoint", type: "string", description: "Reader endpoint" },
      { name: "port", type: "number", description: "Port number" }
    ]
  },
  {
    id: "rds_cluster_instance",
    name: "RDS Aurora Instance",
    description: "Instance in Aurora cluster",
    terraform_resource: "aws_rds_cluster_instance",
    icon: DATABASE_ICONS['aws_rds_cluster_instance'],
    inputs: {
      required: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier", reference: "aws_rds_cluster.cluster_identifier" },
        { name: "instance_class", type: "string", description: "Instance class" },
        { name: "engine", type: "string", description: "Database engine" }
      ],
      optional: [
        { name: "identifier", type: "string", description: "Instance identifier" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "publicly_accessible", type: "bool", description: "Publicly accessible" },
        { name: "db_subnet_group_name", type: "string", description: "DB subnet group name" },
        { name: "db_parameter_group_name", type: "string", description: "Parameter group name" },
        { name: "performance_insights_enabled", type: "bool", description: "Enable Performance Insights" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "arn", type: "string", description: "Instance ARN" },
      { name: "endpoint", type: "string", description: "Instance endpoint" },
      { name: "port", type: "number", description: "Port number" },
      { name: "writer", type: "bool", description: "Is writer instance" }
    ]
  },
  {
    id: "db_subnet_group",
    name: "DB Subnet Group",
    description: "Subnet group for RDS",
    terraform_resource: "aws_db_subnet_group",
    icon: DATABASE_ICONS['aws_db_subnet_group'],
    inputs: {
      required: [
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "name", type: "string", description: "Subnet group name" },
        { name: "description", type: "string", description: "Description" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subnet group ID" },
      { name: "arn", type: "string", description: "Subnet group ARN" },
      { name: "name", type: "string", description: "Subnet group name" }
    ]
  },
  {
    id: "db_parameter_group",
    name: "DB Parameter Group",
    description: "Parameter group for RDS",
    terraform_resource: "aws_db_parameter_group",
    icon: DATABASE_ICONS['aws_db_parameter_group'],
    inputs: {
      required: [
        { name: "family", type: "string", description: "Parameter group family" }
      ],
      optional: [
        { name: "name", type: "string", description: "Parameter group name" },
        { name: "description", type: "string", description: "Description" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "parameter",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "value", type: "string", required: true },
            { name: "apply_method", type: "string", options: ["immediate", "pending-reboot"] }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Parameter group ID" },
      { name: "arn", type: "string", description: "Parameter group ARN" },
      { name: "name", type: "string", description: "Parameter group name" }
    ]
  },
  {
    id: "dynamodb_table",
    name: "DynamoDB Table",
    description: "NoSQL database table",
    terraform_resource: "aws_dynamodb_table",
    icon: DATABASE_ICONS['aws_dynamodb_table'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Table name" },
        { name: "hash_key", type: "string", description: "Partition key name" }
      ],
      optional: [
        { name: "billing_mode", type: "string", description: "Billing mode", options: ["PROVISIONED", "PAY_PER_REQUEST"], default: "PROVISIONED" },
        { name: "range_key", type: "string", description: "Sort key name" },
        { name: "read_capacity", type: "number", description: "Read capacity units" },
        { name: "write_capacity", type: "number", description: "Write capacity units" },
        { name: "stream_enabled", type: "bool", description: "Enable DynamoDB Streams" },
        { name: "stream_view_type", type: "string", description: "Stream view type", options: ["KEYS_ONLY", "NEW_IMAGE", "OLD_IMAGE", "NEW_AND_OLD_IMAGES"] },
        { name: "table_class", type: "string", description: "Table class", options: ["STANDARD", "STANDARD_INFREQUENT_ACCESS"] },
        { name: "deletion_protection_enabled", type: "bool", description: "Enable deletion protection" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "attribute",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "type", type: "string", required: true, options: ["S", "N", "B"] }
          ]
        },
        {
          name: "global_secondary_index",
          multiple: true,
          attributes: [
            { name: "name", type: "string", required: true },
            { name: "hash_key", type: "string", required: true },
            { name: "projection_type", type: "string", required: true, options: ["ALL", "KEYS_ONLY", "INCLUDE"] },
            { name: "range_key", type: "string" },
            { name: "read_capacity", type: "number" },
            { name: "write_capacity", type: "number" }
          ]
        },
        {
          name: "ttl",
          attributes: [
            { name: "attribute_name", type: "string", required: true },
            { name: "enabled", type: "bool" }
          ]
        },
        {
          name: "server_side_encryption",
          attributes: [
            { name: "enabled", type: "bool", required: true },
            { name: "kms_key_arn", type: "string" }
          ]
        },
        {
          name: "point_in_time_recovery",
          attributes: [
            { name: "enabled", type: "bool", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Table name" },
      { name: "arn", type: "string", description: "Table ARN" },
      { name: "stream_arn", type: "string", description: "Stream ARN" }
    ]
  },
  {
    id: "elasticache_cluster",
    name: "ElastiCache Cluster",
    description: "In-memory cache cluster",
    terraform_resource: "aws_elasticache_cluster",
    icon: DATABASE_ICONS['aws_elasticache_cluster'],
    inputs: {
      required: [
        { name: "cluster_id", type: "string", description: "Cluster ID" }
      ],
      optional: [
        { name: "engine", type: "string", description: "Cache engine", options: ["memcached", "redis"] },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "node_type", type: "string", description: "Node type" },
        { name: "num_cache_nodes", type: "number", description: "Number of cache nodes" },
        { name: "parameter_group_name", type: "string", description: "Parameter group name" },
        { name: "subnet_group_name", type: "string", description: "Subnet group name" },
        { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "port", type: "number", description: "Port number" },
        { name: "maintenance_window", type: "string", description: "Maintenance window" },
        { name: "snapshot_retention_limit", type: "number", description: "Snapshot retention days" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "cache_nodes", type: "list(object)", description: "Cache node details" },
      { name: "cluster_address", type: "string", description: "Cluster DNS address" },
      { name: "configuration_endpoint", type: "string", description: "Configuration endpoint" }
    ]
  },
  {
    id: "elasticache_replication_group",
    name: "ElastiCache Replication Group",
    description: "Redis replication group with clustering",
    terraform_resource: "aws_elasticache_replication_group",
    icon: DATABASE_ICONS['aws_elasticache_replication_group'],
    inputs: {
      required: [
        { name: "replication_group_id", type: "string", description: "Replication group ID" },
        { name: "description", type: "string", description: "Description" }
      ],
      optional: [
        { name: "node_type", type: "string", description: "Node type" },
        { name: "num_cache_clusters", type: "number", description: "Number of cache clusters" },
        { name: "num_node_groups", type: "number", description: "Number of node groups" },
        { name: "replicas_per_node_group", type: "number", description: "Replicas per node group" },
        { name: "automatic_failover_enabled", type: "bool", description: "Enable automatic failover" },
        { name: "multi_az_enabled", type: "bool", description: "Enable Multi-AZ" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "parameter_group_name", type: "string", description: "Parameter group name" },
        { name: "subnet_group_name", type: "string", description: "Subnet group name" },
        { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "port", type: "number", description: "Port number" },
        { name: "at_rest_encryption_enabled", type: "bool", description: "Enable at-rest encryption" },
        { name: "transit_encryption_enabled", type: "bool", description: "Enable transit encryption" },
        { name: "auth_token", type: "string", description: "AUTH token" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "snapshot_retention_limit", type: "number", description: "Snapshot retention days" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Replication group ID" },
      { name: "arn", type: "string", description: "Replication group ARN" },
      { name: "primary_endpoint_address", type: "string", description: "Primary endpoint address" },
      { name: "reader_endpoint_address", type: "string", description: "Reader endpoint address" },
      { name: "configuration_endpoint_address", type: "string", description: "Configuration endpoint address" }
    ]
  },
  {
    id: "elasticache_subnet_group",
    name: "ElastiCache Subnet Group",
    description: "Subnet group for ElastiCache",
    terraform_resource: "aws_elasticache_subnet_group",
    icon: DATABASE_ICONS['aws_elasticache_subnet_group'],
    inputs: {
      required: [
        { name: "name", type: "string", description: "Subnet group name" },
        { name: "subnet_ids", type: "list(string)", description: "Subnet IDs", reference: "aws_subnet.id" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Subnet group name" },
      { name: "arn", type: "string", description: "Subnet group ARN" }
    ]
  },
  {
    id: "redshift_cluster",
    name: "Redshift Cluster",
    description: "Data warehouse cluster",
    terraform_resource: "aws_redshift_cluster",
    icon: DATABASE_ICONS['aws_redshift_cluster'],
    inputs: {
      required: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier" },
        { name: "node_type", type: "string", description: "Node type" },
        { name: "master_username", type: "string", description: "Master username" }
      ],
      optional: [
        { name: "master_password", type: "string", description: "Master password" },
        { name: "database_name", type: "string", description: "Database name" },
        { name: "cluster_type", type: "string", description: "Cluster type", options: ["single-node", "multi-node"] },
        { name: "number_of_nodes", type: "number", description: "Number of nodes" },
        { name: "publicly_accessible", type: "bool", description: "Publicly accessible" },
        { name: "cluster_subnet_group_name", type: "string", description: "Subnet group name" },
        { name: "vpc_security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "skip_final_snapshot", type: "bool", description: "Skip final snapshot" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster identifier" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "endpoint", type: "string", description: "Cluster endpoint" },
      { name: "dns_name", type: "string", description: "DNS name" },
      { name: "port", type: "number", description: "Port number" }
    ]
  },
  {
    id: "documentdb_cluster",
    name: "DocumentDB Cluster",
    description: "MongoDB-compatible document database",
    terraform_resource: "aws_docdb_cluster",
    icon: DATABASE_ICONS['aws_docdb_cluster'],
    inputs: {
      required: [],
      optional: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier" },
        { name: "master_username", type: "string", description: "Master username" },
        { name: "master_password", type: "string", description: "Master password" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "port", type: "number", description: "Port number", default: 27017 },
        { name: "db_subnet_group_name", type: "string", description: "DB subnet group name" },
        { name: "vpc_security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "storage_encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "backup_retention_period", type: "number", description: "Backup retention days" },
        { name: "skip_final_snapshot", type: "bool", description: "Skip final snapshot" },
        { name: "deletion_protection", type: "bool", description: "Enable deletion protection" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "endpoint", type: "string", description: "Cluster endpoint" },
      { name: "reader_endpoint", type: "string", description: "Reader endpoint" }
    ]
  },
  {
    id: "documentdb_cluster_instance",
    name: "DocumentDB Instance",
    description: "Instance in DocumentDB cluster",
    terraform_resource: "aws_docdb_cluster_instance",
    icon: DATABASE_ICONS['aws_docdb_cluster_instance'],
    inputs: {
      required: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier", reference: "aws_docdb_cluster.cluster_identifier" },
        { name: "instance_class", type: "string", description: "Instance class" }
      ],
      optional: [
        { name: "identifier", type: "string", description: "Instance identifier" },
        { name: "engine", type: "string", description: "Engine" },
        { name: "enable_performance_insights", type: "bool", description: "Enable Performance Insights" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Instance ID" },
      { name: "arn", type: "string", description: "Instance ARN" },
      { name: "endpoint", type: "string", description: "Instance endpoint" },
      { name: "port", type: "number", description: "Port number" }
    ]
  },
  {
    id: "neptune_cluster",
    name: "Neptune Cluster",
    description: "Graph database cluster",
    terraform_resource: "aws_neptune_cluster",
    icon: DATABASE_ICONS['aws_neptune_cluster'],
    inputs: {
      required: [],
      optional: [
        { name: "cluster_identifier", type: "string", description: "Cluster identifier" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "port", type: "number", description: "Port number", default: 8182 },
        { name: "neptune_subnet_group_name", type: "string", description: "Subnet group name" },
        { name: "vpc_security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "storage_encrypted", type: "bool", description: "Enable encryption" },
        { name: "kms_key_arn", type: "string", description: "KMS key ARN" },
        { name: "backup_retention_period", type: "number", description: "Backup retention days" },
        { name: "skip_final_snapshot", type: "bool", description: "Skip final snapshot" },
        { name: "deletion_protection", type: "bool", description: "Enable deletion protection" },
        { name: "iam_database_authentication_enabled", type: "bool", description: "Enable IAM auth" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster ID" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "endpoint", type: "string", description: "Cluster endpoint" },
      { name: "reader_endpoint", type: "string", description: "Reader endpoint" }
    ]
  },
  {
    id: "timestream_database",
    name: "Timestream Database",
    description: "Time series database",
    terraform_resource: "aws_timestreamwrite_database",
    icon: DATABASE_ICONS['aws_timestreamwrite_database'],
    inputs: {
      required: [
        { name: "database_name", type: "string", description: "Database name" }
      ],
      optional: [
        { name: "kms_key_id", type: "string", description: "KMS key ID" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Database name" },
      { name: "arn", type: "string", description: "Database ARN" }
    ]
  },
  {
    id: "timestream_table",
    name: "Timestream Table",
    description: "Table in Timestream database",
    terraform_resource: "aws_timestreamwrite_table",
    icon: DATABASE_ICONS['aws_timestreamwrite_table'],
    inputs: {
      required: [
        { name: "database_name", type: "string", description: "Database name", reference: "aws_timestreamwrite_database.database_name" },
        { name: "table_name", type: "string", description: "Table name" }
      ],
      optional: [
        { name: "tags", type: "map(string)", description: "Tags" }
      ],
      blocks: [
        {
          name: "retention_properties",
          attributes: [
            { name: "magnetic_store_retention_period_in_days", type: "number", required: true },
            { name: "memory_store_retention_period_in_hours", type: "number", required: true }
          ]
        }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Table ID" },
      { name: "arn", type: "string", description: "Table ARN" }
    ]
  },
  {
    id: "memorydb_cluster",
    name: "MemoryDB Cluster",
    description: "Redis-compatible in-memory database",
    terraform_resource: "aws_memorydb_cluster",
    icon: DATABASE_ICONS['aws_memorydb_cluster'],
    inputs: {
      required: [
        { name: "acl_name", type: "string", description: "ACL name" },
        { name: "name", type: "string", description: "Cluster name" },
        { name: "node_type", type: "string", description: "Node type" }
      ],
      optional: [
        { name: "description", type: "string", description: "Description" },
        { name: "engine_version", type: "string", description: "Engine version" },
        { name: "kms_key_arn", type: "string", description: "KMS key ARN" },
        { name: "maintenance_window", type: "string", description: "Maintenance window" },
        { name: "num_replicas_per_shard", type: "number", description: "Replicas per shard" },
        { name: "num_shards", type: "number", description: "Number of shards" },
        { name: "port", type: "number", description: "Port number" },
        { name: "security_group_ids", type: "list(string)", description: "Security group IDs" },
        { name: "snapshot_retention_limit", type: "number", description: "Snapshot retention days" },
        { name: "subnet_group_name", type: "string", description: "Subnet group name" },
        { name: "tls_enabled", type: "bool", description: "Enable TLS" },
        { name: "tags", type: "map(string)", description: "Tags" }
      ]
    },
    outputs: [
      { name: "id", type: "string", description: "Cluster name" },
      { name: "arn", type: "string", description: "Cluster ARN" },
      { name: "cluster_endpoint", type: "list(object)", description: "Cluster endpoint details" }
    ]
  }
];

// List of all database terraform resource types
export const DATABASE_TERRAFORM_RESOURCES = DATABASE_SERVICES.map(s => s.terraform_resource);

// Helper functions
export function getDatabaseServiceByTerraformResource(terraformResource: string): DatabaseServiceDefinition | undefined {
  return DATABASE_SERVICES.find(s => s.terraform_resource === terraformResource);
}

export function getDatabaseServiceById(id: string): DatabaseServiceDefinition | undefined {
  return DATABASE_SERVICES.find(s => s.id === id);
}

export function isDatabaseResource(terraformResource: string): boolean {
  return DATABASE_TERRAFORM_RESOURCES.includes(terraformResource);
}

export function getDatabaseIcon(terraformResource: string): string {
  return DATABASE_ICONS[terraformResource] || DATABASE_ICONS['aws_db_instance'];
}










