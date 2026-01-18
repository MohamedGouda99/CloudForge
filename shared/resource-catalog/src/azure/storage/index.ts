/**
 * Azure Storage Resources
 */

export { azureStorageAccount } from './storage-account';
export { azureStorageContainer } from './storage-container';

import { azureStorageAccount } from './storage-account';
import { azureStorageContainer } from './storage-container';

export const storageResources = [
  azureStorageAccount,
  azureStorageContainer,
];
