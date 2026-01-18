/**
 * JSON Schema Generator
 *
 * Converts TypeScript resource definitions to JSON for Python backend consumption.
 * Supports multiple cloud providers: AWS, GCP, Azure.
 * Run with: npm run build:json
 */

const fs = require('fs');
const path = require('path');

// Define provider categories to export
const PROVIDERS = {
  aws: {
    categories: [
      { name: 'compute', exportName: 'awsComputeServices' },
      { name: 'containers', exportName: 'awsContainerServices' },
      { name: 'networking', exportName: 'networkingResources' },
      { name: 'storage', exportName: 'storageResources' },
      { name: 'database', exportName: 'databaseResources' },
      { name: 'security', exportName: 'securityResources' },
      { name: 'messaging', exportName: 'messagingResources' },
      { name: 'management', exportName: 'managementResources' },
      { name: 'developer-tools', exportName: 'developerToolsResources' },
      { name: 'analytics', exportName: 'analyticsResources' },
      { name: 'machine-learning', exportName: 'machineLearningResources' },
      { name: 'serverless', exportName: 'serverlessResources' },
    ],
  },
  gcp: {
    categories: [
      { name: 'compute', exportName: 'computeResources' },
      { name: 'networking', exportName: 'networkingResources' },
      { name: 'storage', exportName: 'storageResources' },
      { name: 'database', exportName: 'databaseResources' },
      { name: 'security', exportName: 'securityResources' },
      { name: 'containers', exportName: 'containersResources' },
      { name: 'serverless', exportName: 'serverlessResources' },
      { name: 'analytics', exportName: 'analyticsResources' },
      { name: 'messaging', exportName: 'messagingResources' },
      { name: 'management', exportName: 'managementResources' },
      { name: 'developer-tools', exportName: 'developerToolsResources' },
      { name: 'machine-learning', exportName: 'machineLearningResources' },
    ],
  },
  azure: {
    categories: [
      { name: 'compute', exportName: 'computeResources' },
      { name: 'storage', exportName: 'storageResources' },
      { name: 'database', exportName: 'databaseResources' },
      { name: 'networking', exportName: 'networkingResources' },
      { name: 'security', exportName: 'securityResources' },
    ],
  },
};

async function generateSchemasForProvider(
  provider: string,
  categories: { name: string; exportName: string }[],
  distDir: string,
  outputDir: string
): Promise<unknown[]> {
  const providerResources: unknown[] = [];

  console.log(`\nGenerating schemas for ${provider.toUpperCase()}...`);

  for (const category of categories) {
    try {
      const modulePath = path.join(distDir, provider, category.name, 'index.js');

      if (!fs.existsSync(modulePath)) {
        console.log(`  Skipping ${category.name} (module not found)`);
        continue;
      }

      // Clear require cache and import
      delete require.cache[require.resolve(modulePath)];
      const module = require(modulePath);

      const resources = module[category.exportName];

      if (resources && Array.isArray(resources)) {
        // Add provider info to each resource
        const resourcesWithProvider = resources.map((r: Record<string, unknown>) => ({
          ...r,
          provider: provider,
        }));

        const schema = {
          version: '5.x',
          lastUpdated: new Date().toISOString(),
          provider: provider,
          category: category.name,
          resources: resourcesWithProvider,
        };

        const outputPath = path.join(outputDir, `${provider}-${category.name}.schema.json`);
        fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
        console.log(`  Generated: ${provider}-${category.name}.schema.json (${resources.length} resources)`);

        providerResources.push(...resourcesWithProvider);
      } else {
        console.log(`  Warning: ${category.exportName} not found in ${category.name}`);
      }
    } catch (error: unknown) {
      console.error(`  Error loading ${category.name}:`, error instanceof Error ? error.message : error);
    }
  }

  // Generate provider catalog
  if (providerResources.length > 0) {
    const catalogSchema = {
      version: '5.x',
      lastUpdated: new Date().toISOString(),
      provider: provider,
      resources: providerResources,
    };

    const catalogOutputPath = path.join(outputDir, `${provider}-catalog.schema.json`);
    fs.writeFileSync(catalogOutputPath, JSON.stringify(catalogSchema, null, 2));
    console.log(`  Generated: ${provider}-catalog.schema.json (${providerResources.length} total resources)`);
  }

  return providerResources;
}

async function generateSchemas(): Promise<void> {
  const distDir = path.join(__dirname, '..', 'dist');
  const outputDir = path.join(distDir, 'schemas');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating JSON schemas for Python backend...');

  const allResources: unknown[] = [];
  const providerStats: { [key: string]: number } = {};

  // Generate schemas for each provider
  for (const [provider, config] of Object.entries(PROVIDERS)) {
    const resources = await generateSchemasForProvider(
      provider,
      config.categories,
      distDir,
      outputDir
    );
    allResources.push(...resources);
    providerStats[provider] = resources.length;
  }

  // Generate combined multi-cloud catalog
  if (allResources.length > 0) {
    const combinedCatalog = {
      version: '5.x',
      lastUpdated: new Date().toISOString(),
      providers: Object.keys(PROVIDERS),
      providerStats: providerStats,
      resources: allResources,
    };

    const combinedOutputPath = path.join(outputDir, 'all-providers-catalog.schema.json');
    fs.writeFileSync(combinedOutputPath, JSON.stringify(combinedCatalog, null, 2));
    console.log(`\nGenerated: all-providers-catalog.schema.json`);
  }

  console.log(`\n=== JSON Schema Generation Complete ===`);
  console.log(`Total resources: ${allResources.length}`);
  for (const [provider, count] of Object.entries(providerStats)) {
    console.log(`  ${provider.toUpperCase()}: ${count} resources`);
  }
}

generateSchemas().catch((error) => {
  console.error('Error generating schemas:', error);
  process.exit(1);
});
