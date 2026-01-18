/**
 * Azure Compute Resources
 */

export { azureVirtualMachine } from './virtual-machine';
export { azureFunctionApp } from './function-app';

import { azureVirtualMachine } from './virtual-machine';
import { azureFunctionApp } from './function-app';

export const computeResources = [
  azureVirtualMachine,
  azureFunctionApp,
];
