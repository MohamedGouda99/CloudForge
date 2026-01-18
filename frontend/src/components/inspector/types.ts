import { Node } from 'reactflow';

export type TabType = 'resources' | 'code' | 'issues' | 'deploy' | 'ai';

export interface InspectorPanelProps {
  nodes: Node[];
  terraformFiles: Record<string, string>;
  selectedNode: Node | null;
  onNodeSelect: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: any) => void;
  configPanelOpen?: boolean;
  onCloseConfigPanel?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  panelWidth?: number;
  onWidthChange?: (width: number) => void;
  deployStatus?: 'idle' | 'running' | 'success' | 'error';
  deployMode?: 'plan' | 'validate' | 'apply' | 'destroy';
  deployLogs?: string[];
  provider?: string;
  edges?: any[];
  onImportResources?: (resources: any[], connections: any[]) => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export interface ResourceGroup {
  type: string;
  label: string;
  icon: string;
  resources: Node[];
}

export interface PropertyDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'tags' | 'reference';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  description?: string;
  reference?: {
    resourceType: string;
    outputName: string;
  };
}

export interface TerraformReference {
  __ref: true;
  nodeId: string;
  resourceType: string;
  outputName: string;
}

// Check if a value is a structured reference
export const isStructuredReference = (value: unknown): value is TerraformReference => {
  return typeof value === 'object' && value !== null && '__ref' in value && (value as any).__ref === true;
};

// Sanitize name for Terraform identifier
export const sanitizeTerraformName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

// Resolve a reference to its current terraform string
export const resolveReferenceToTerraform = (ref: TerraformReference, nodes: Node[]): string => {
  const targetNode = nodes.find(n => n.id === ref.nodeId);
  if (!targetNode) return '';
  const nodeData = targetNode.data as any;
  const displayName = nodeData?.displayName || nodeData?.resourceLabel || targetNode.id;
  const sanitizedName = sanitizeTerraformName(displayName);
  return `${ref.resourceType}.${sanitizedName}.${ref.outputName}`;
};

// Get display value for a reference field (either structured or legacy string)
export const getReferenceDisplayValue = (value: unknown, nodes: Node[]): string => {
  if (isStructuredReference(value)) {
    return resolveReferenceToTerraform(value, nodes);
  }
  return typeof value === 'string' ? value : '';
};

// Helper to map schema field types to form field types
export function mapSchemaFieldType(schemaType: string): 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'tags' | 'reference' {
  switch (schemaType) {
    case 'number':
      return 'number';
    case 'boolean':
    case 'checkbox':
      return 'checkbox';
    case 'select':
      return 'select';
    case 'textarea':
      return 'textarea';
    case 'tags':
    case 'keyvalue':
      return 'tags';
    case 'reference':
      return 'reference';
    default:
      return 'text';
  }
}

// Panel sizing constants
export const MIN_PANEL_WIDTH = 280;
export const MAX_PANEL_WIDTH = 600;
export const DEFAULT_PANEL_WIDTH = 360;
