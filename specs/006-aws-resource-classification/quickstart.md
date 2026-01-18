# Quickstart: AWS Resource Classification

**Feature**: 006-aws-resource-classification
**Date**: 2026-01-15

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- WSL2 (Windows)

## Local Development Setup

### 1. Start Infrastructure Services

```bash
# From Windows (uses WSL)
wsl.exe -d Ubuntu bash -c "cd '/mnt/c/Users/goda/Desktop/CloudForge' && docker compose up -d postgres redis"
```

### 2. Install Shared Catalog Dependencies

```bash
cd shared/resource-catalog
npm install
npm run build
```

### 3. Generate Catalog JSON (for backend)

```bash
cd shared/resource-catalog
npm run build:json
# Outputs: dist/catalog.json
```

### 4. Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verify Setup

### Test Catalog API

```bash
# Get all resources
curl http://localhost:8000/api/catalog

# Get containers only
curl http://localhost:8000/api/catalog?classification=container

# Get container list
curl http://localhost:8000/api/catalog/containers/list

# Validate containment
curl -X POST http://localhost:8000/api/catalog/validate-containment \
  -H "Content-Type: application/json" \
  -d '{"container_type": "aws_vpc", "child_type": "aws_subnet"}'
```

### Test Frontend Classification

1. Open http://localhost:3000
2. Navigate to Infrastructure Designer
3. Drag a VPC onto canvas → Should render as expandable container
4. Drag an EC2 instance → Should render as icon node
5. Drag EC2 into VPC → Should succeed with visual containment
6. Drag EC2 into Security Group → Should show warning indicator

## Running Tests

### Shared Catalog Tests

```bash
cd shared/resource-catalog
npm test

# Watch mode
npm run test:watch
```

### Backend Tests

```bash
cd backend
pytest tests/unit/test_catalog.py -v
pytest tests/integration/test_catalog_api.py -v
```

### Frontend Tests

```bash
cd frontend
npm test

# Specific test file
npm test -- nodeClassifier.test.ts
```

## Development Workflow

### Adding a New Container Resource

1. **Update catalog definition** in `shared/resource-catalog/src/aws/<category>/<resource>.ts`:
   ```typescript
   export const awsNewContainer: ServiceDefinition = {
     id: 'new_container',
     terraform_resource: 'aws_new_container',
     classification: 'container',  // Mark as container
     relations: {
       containmentRules: [{
         childTypes: ['aws_child_type_1', 'aws_child_type_2'],
         description: 'Resources that can be nested in this container'
       }]
     },
     // ... other fields
   };
   ```

2. **Export from category index**:
   ```typescript
   // In src/aws/<category>/index.ts
   export { awsNewContainer } from './new-container';
   ```

3. **Rebuild catalog**:
   ```bash
   cd shared/resource-catalog
   npm run build:all
   ```

4. **Restart backend** to pick up changes.

5. **Add test** in `shared/resource-catalog/tests/classification.test.ts`:
   ```typescript
   test('aws_new_container is classified as container', () => {
     const resource = catalog.getResource('aws_new_container');
     expect(resource.classification).toBe('container');
     expect(resource.relations?.containmentRules).toBeDefined();
   });
   ```

### Modifying Containment Rules

1. Update `containmentRules.childTypes` in the container's ServiceDefinition
2. Rebuild and restart as above
3. Frontend will automatically pick up changes on next catalog fetch

## Troubleshooting

### Catalog API returns 500

- Check that catalog JSON was generated: `ls shared/resource-catalog/dist/catalog.json`
- Check backend logs: `docker logs cloudforge-backend -f`
- Verify SchemaLoader loaded catalog: Check for "Loaded N resources" in logs

### Resources not showing correct classification

- Clear frontend cache: `localStorage.removeItem('catalog_cache')`
- Check browser Network tab for `/api/catalog` response
- Verify classification field in catalog JSON

### Warning indicator not appearing

- Check browser console for validation errors
- Verify containmentRules are defined for container
- Check `nodeClassifier.ts` for correct logic

## Architecture Notes

```
┌─────────────────────────────────────────────────────────────────┐
│                    shared/resource-catalog                       │
│  TypeScript source of truth for all resource definitions         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │ npm run build:json            │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Backend (Python)       │     │   Frontend (React)       │
│   - SchemaLoader         │     │   - lib/catalog          │
│   - /api/catalog         │     │   - nodeClassifier       │
│   - projects.py auto-wire│     │   - WarningIndicator     │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
                    ┌─────────────────┐
                    │  React Flow     │
                    │  Canvas         │
                    └─────────────────┘
```
