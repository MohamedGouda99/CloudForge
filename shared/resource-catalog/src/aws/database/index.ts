/**
 * AWS Database Resources Index
 */

// Icon resources (all database resources are icons, not containers)
export { awsRdsCluster } from './rds-cluster';
export { awsDynamodbTable } from './dynamodb-table';
export { awsDbInstance } from './rds-instance';
export { awsElasticacheCluster } from './elasticache';
export { awsRdsClusterInstance } from './rds-cluster-instance';
export { awsDbSubnetGroup } from './db-subnet-group';
export { awsDbParameterGroup } from './db-parameter-group';
export { awsElasticacheReplicationGroup } from './elasticache-replication-group';

// Aggregate all database resources
import { awsRdsCluster } from './rds-cluster';
import { awsDynamodbTable } from './dynamodb-table';
import { awsDbInstance } from './rds-instance';
import { awsElasticacheCluster } from './elasticache';
import { awsRdsClusterInstance } from './rds-cluster-instance';
import { awsDbSubnetGroup } from './db-subnet-group';
import { awsDbParameterGroup } from './db-parameter-group';
import { awsElasticacheReplicationGroup } from './elasticache-replication-group';

export const databaseResources = [
  awsRdsCluster,
  awsDynamodbTable,
  awsDbInstance,
  awsElasticacheCluster,
  awsRdsClusterInstance,
  awsDbSubnetGroup,
  awsDbParameterGroup,
  awsElasticacheReplicationGroup,
];
