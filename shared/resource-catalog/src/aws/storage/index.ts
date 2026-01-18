/**
 * AWS Storage Resources Index
 */

// Container resources
export { awsS3Bucket } from './s3-bucket';
export { awsEfsFileSystem } from './efs';

// Icon resources
export { awsS3Object } from './s3-object';
export { awsEbsVolume } from './ebs-volume';
export { awsS3BucketVersioning } from './s3-bucket-versioning';
export { awsS3BucketLifecycleConfiguration } from './s3-bucket-lifecycle';
export { awsEfsMountTarget } from './efs-mount-target';
export { awsEfsAccessPoint } from './efs-access-point';

// Aggregate all storage resources
import { awsS3Bucket } from './s3-bucket';
import { awsEfsFileSystem } from './efs';
import { awsS3Object } from './s3-object';
import { awsEbsVolume } from './ebs-volume';
import { awsS3BucketVersioning } from './s3-bucket-versioning';
import { awsS3BucketLifecycleConfiguration } from './s3-bucket-lifecycle';
import { awsEfsMountTarget } from './efs-mount-target';
import { awsEfsAccessPoint } from './efs-access-point';

export const storageResources = [
  awsS3Bucket,
  awsEfsFileSystem,
  awsS3Object,
  awsEbsVolume,
  awsS3BucketVersioning,
  awsS3BucketLifecycleConfiguration,
  awsEfsMountTarget,
  awsEfsAccessPoint,
];
