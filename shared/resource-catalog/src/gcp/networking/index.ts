/**
 * GCP Networking Resources
 */

export { gcpComputeNetwork } from './vpc';
export { gcpComputeSubnetwork } from './subnet';
export { gcpComputeFirewall } from './firewall';

import { gcpComputeNetwork } from './vpc';
import { gcpComputeSubnetwork } from './subnet';
import { gcpComputeFirewall } from './firewall';

export const networkingResources = [
  gcpComputeNetwork,
  gcpComputeSubnetwork,
  gcpComputeFirewall,
];
