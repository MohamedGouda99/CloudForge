/**
 * Azure Database Resources
 */

export { azureSqlServer } from './sql-server';
export { azureSqlDatabase } from './sql-database';
export { azureCosmosdbAccount } from './cosmosdb-account';

import { azureSqlServer } from './sql-server';
import { azureSqlDatabase } from './sql-database';
import { azureCosmosdbAccount } from './cosmosdb-account';

export const databaseResources = [
  azureSqlServer,
  azureSqlDatabase,
  azureCosmosdbAccount,
];
