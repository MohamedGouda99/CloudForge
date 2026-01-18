/**
 * GCP Compute Resources
 */

export { gcpComputeInstance } from './compute-instance';
export { gcpComputeDisk } from './disk';

import { gcpComputeInstance } from './compute-instance';
import { gcpComputeDisk } from './disk';

export const computeResources = [
  gcpComputeInstance,
  gcpComputeDisk,
];
