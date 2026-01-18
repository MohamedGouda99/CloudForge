# Contracts: AWS Database Schema Enhancement

**Feature**: 008-aws-database-enhancement

## No API Contracts Required

This feature is a **frontend-only schema update**. It modifies TypeScript data definitions in `databaseServicesData.ts` that describe AWS database resources for the Inspector Panel.

### Why No Contracts?

1. **No Backend Changes**: The feature only updates frontend TypeScript files
2. **No API Endpoints**: No new REST endpoints are created
3. **No Database Changes**: No database schema modifications
4. **Static Data**: Schema definitions are compile-time constants, not runtime API responses

### Data Flow

```
databaseServicesData.ts (source of truth)
       ↓
databaseCatalog.ts (derives catalog entries)
       ↓
resourceSchemas.ts (converts to ResourceSchema)
       ↓
InspectorPanel.tsx (displays in UI)
```

### Verification

The "contract" for this feature is the TypeScript interface compliance:

```typescript
interface DatabaseServiceDefinition {
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  };
  outputs: ServiceOutput[];
}
```

All added/modified services must conform to this interface.

### Testing Contract Compliance

```bash
cd frontend
npx tsc --noEmit
```

If this passes, all schema definitions conform to the TypeScript interfaces.
