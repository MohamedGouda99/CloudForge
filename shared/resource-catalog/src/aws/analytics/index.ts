/**
 * AWS Analytics Resources Index
 */

// Icon resources
export { awsKinesisStream } from './kinesis-stream';
export { awsKinesisFirehoseDeliveryStream } from './kinesis-firehose';
export { awsAthenaWorkgroup } from './athena-workgroup';
export { awsGlueCatalogDatabase } from './glue-catalog-database';

// Aggregate all analytics resources
import { awsKinesisStream } from './kinesis-stream';
import { awsKinesisFirehoseDeliveryStream } from './kinesis-firehose';
import { awsAthenaWorkgroup } from './athena-workgroup';
import { awsGlueCatalogDatabase } from './glue-catalog-database';

export const analyticsResources = [
  awsKinesisStream,
  awsKinesisFirehoseDeliveryStream,
  awsAthenaWorkgroup,
  awsGlueCatalogDatabase,
];
