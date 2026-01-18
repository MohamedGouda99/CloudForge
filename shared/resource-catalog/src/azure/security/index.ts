/**
 * Azure Security Resources
 */

export { azureResourceGroup } from './resource-group';
export { azureKeyVault } from './key-vault';

import { azureResourceGroup } from './resource-group';
import { azureKeyVault } from './key-vault';

export const securityResources = [
  azureResourceGroup,
  azureKeyVault,
];
