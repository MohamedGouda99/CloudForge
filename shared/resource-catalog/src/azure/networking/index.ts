/**
 * Azure Networking Resources
 */

export { azureVirtualNetwork } from './virtual-network';
export { azureSubnet } from './subnet';
export { azureNetworkSecurityGroup } from './network-security-group';

import { azureVirtualNetwork } from './virtual-network';
import { azureSubnet } from './subnet';
import { azureNetworkSecurityGroup } from './network-security-group';

export const networkingResources = [
  azureVirtualNetwork,
  azureSubnet,
  azureNetworkSecurityGroup,
];
