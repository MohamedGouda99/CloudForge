import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Node } from 'reactflow';
import {
  ChevronRight,
  ChevronDown,
  Code2,
  Layout,
  FileCode,
  X,
  Save,
  CheckCircle2,
  Rocket,
  Link2,
  Plus,
  Layers,
  Trash2,
} from 'lucide-react';
import CloudIcon from './CloudIcon';
import { getCloudIconPath } from '../lib/resources/cloudIconsComplete';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getResourceSchema, hasRichSchema, SchemaBlock as ServiceBlockField } from '../lib/resources/resourceSchemas';

interface BrainboardRightPanelProps {
  nodes: Node[];
  terraformFiles: Record<string, string>;
  selectedNode: Node | null;
  onNodeSelect: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: any) => void;
  configPanelOpen?: boolean;
  onCloseConfigPanel?: () => void;
  // New props for resizable and collapsible panel
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  panelWidth?: number;
  onWidthChange?: (width: number) => void;
}

// Constants for panel sizing
const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 360;

type TabType = 'resources' | 'code' | 'issues' | 'deploy';

interface ResourceGroup {
  type: string;
  label: string;
  icon: string;
  resources: Node[];
}

// Resource property definitions for common AWS/Azure/GCP resources
const RESOURCE_PROPERTIES: Record<string, Array<{
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'tags';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  description?: string;
}>> = {
  aws_instance: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'my-instance', required: true },
    { name: 'instance_type', label: 'Instance Type', type: 'select', options: [
      { value: 't2.micro', label: 't2.micro (1 vCPU, 1 GiB)' },
      { value: 't2.small', label: 't2.small (1 vCPU, 2 GiB)' },
      { value: 't2.medium', label: 't2.medium (2 vCPU, 4 GiB)' },
      { value: 't3.micro', label: 't3.micro (2 vCPU, 1 GiB)' },
      { value: 't3.small', label: 't3.small (2 vCPU, 2 GiB)' },
      { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GiB)' },
      { value: 'm5.large', label: 'm5.large (2 vCPU, 8 GiB)' },
      { value: 'm5.xlarge', label: 'm5.xlarge (4 vCPU, 16 GiB)' },
    ]},
    { name: 'ami', label: 'AMI ID', type: 'text', placeholder: 'ami-xxxxxxxxx' },
    { name: 'key_name', label: 'Key Pair', type: 'text', placeholder: 'my-key-pair' },
    { name: 'associate_public_ip', label: 'Associate Public IP', type: 'checkbox' },
  ],
  aws_s3_bucket: [
    { name: 'name', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
    { name: 'acl', label: 'ACL', type: 'select', options: [
      { value: 'private', label: 'Private' },
      { value: 'public-read', label: 'Public Read' },
      { value: 'public-read-write', label: 'Public Read/Write' },
    ]},
    { name: 'versioning', label: 'Enable Versioning', type: 'checkbox' },
    { name: 'encryption', label: 'Enable Encryption', type: 'checkbox' },
  ],
  aws_vpc: [
    { name: 'name', label: 'VPC Name', type: 'text', placeholder: 'my-vpc', required: true },
    { name: 'cidr_block', label: 'CIDR Block', type: 'text', placeholder: '10.0.0.0/16', required: true },
    { name: 'enable_dns_hostnames', label: 'Enable DNS Hostnames', type: 'checkbox' },
    { name: 'enable_dns_support', label: 'Enable DNS Support', type: 'checkbox' },
  ],
  aws_subnet: [
    { name: 'name', label: 'Subnet Name', type: 'text', placeholder: 'my-subnet', required: true },
    { name: 'cidr_block', label: 'CIDR Block', type: 'text', placeholder: '10.0.1.0/24', required: true },
    { name: 'availability_zone', label: 'Availability Zone', type: 'text', placeholder: 'us-east-1a' },
    { name: 'map_public_ip_on_launch', label: 'Map Public IP on Launch', type: 'checkbox' },
  ],
  aws_security_group: [
    { name: 'name', label: 'Security Group Name', type: 'text', placeholder: 'my-sg', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Security group description' },
  ],
  aws_rds_instance: [
    { name: 'name', label: 'DB Identifier', type: 'text', placeholder: 'my-database', required: true },
    { name: 'engine', label: 'Engine', type: 'select', options: [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgres', label: 'PostgreSQL' },
      { value: 'mariadb', label: 'MariaDB' },
      { value: 'sqlserver-ex', label: 'SQL Server Express' },
    ]},
    { name: 'instance_class', label: 'Instance Class', type: 'select', options: [
      { value: 'db.t3.micro', label: 'db.t3.micro' },
      { value: 'db.t3.small', label: 'db.t3.small' },
      { value: 'db.t3.medium', label: 'db.t3.medium' },
      { value: 'db.r5.large', label: 'db.r5.large' },
    ]},
    { name: 'allocated_storage', label: 'Storage (GB)', type: 'number', placeholder: '20' },
    { name: 'multi_az', label: 'Multi-AZ Deployment', type: 'checkbox' },
  ],
  aws_lambda_function: [
    { name: 'name', label: 'Function Name', type: 'text', placeholder: 'my-function', required: true },
    { name: 'runtime', label: 'Runtime', type: 'select', options: [
      { value: 'nodejs18.x', label: 'Node.js 18.x' },
      { value: 'nodejs20.x', label: 'Node.js 20.x' },
      { value: 'python3.11', label: 'Python 3.11' },
      { value: 'python3.12', label: 'Python 3.12' },
      { value: 'java17', label: 'Java 17' },
      { value: 'go1.x', label: 'Go 1.x' },
    ]},
    { name: 'memory_size', label: 'Memory (MB)', type: 'number', placeholder: '128' },
    { name: 'timeout', label: 'Timeout (seconds)', type: 'number', placeholder: '30' },
  ],
};

// Default properties for unknown resource types
const DEFAULT_PROPERTIES = [
  { name: 'name', label: 'Name', type: 'text' as const, placeholder: 'Resource name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' as const, placeholder: 'Optional description' },
];

// Sanitize name for Terraform identifier
const sanitizeTerraformName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

// Reference object structure for ID-based references
interface TerraformReference {
  __ref: true;
  nodeId: string;
  resourceType: string;
  outputName: string;
}

// Check if a value is a structured reference
const isStructuredReference = (value: unknown): value is TerraformReference => {
  return typeof value === 'object' && value !== null && '__ref' in value && (value as any).__ref === true;
};

// Resolve a reference to its current terraform string
const resolveReferenceToTerraform = (ref: TerraformReference, nodes: Node[]): string => {
  const targetNode = nodes.find(n => n.id === ref.nodeId);
  if (!targetNode) return '';
  const nodeData = targetNode.data as any;
  const displayName = nodeData?.displayName || nodeData?.resourceLabel || targetNode.id;
  const sanitizedName = sanitizeTerraformName(displayName);
  return `${ref.resourceType}.${sanitizedName}.${ref.outputName}`;
};

// Get display value for a reference field (either structured or legacy string)
const getReferenceDisplayValue = (value: unknown, nodes: Node[]): string => {
  if (isStructuredReference(value)) {
    return resolveReferenceToTerraform(value, nodes);
  }
  // Legacy: already a terraform string
  return typeof value === 'string' ? value : '';
};

// Helper to map schema field types to form field types
function mapSchemaFieldType(schemaType: string): 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'tags' | 'reference' {
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

export default function BrainboardRightPanel({
  nodes,
  terraformFiles,
  selectedNode,
  onNodeSelect,
  onUpdateNode,
  configPanelOpen = false,
  onCloseConfigPanel,
  isCollapsed = false,
  onToggleCollapse,
  panelWidth = DEFAULT_PANEL_WIDTH,
  onWidthChange,
}: BrainboardRightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['compute', 'network', 'storage']));
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [configFormData, setConfigFormData] = useState<Record<string, any>>({});
  const [blockFormData, setBlockFormData] = useState<Record<string, any[]>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedTerraformFile, setSelectedTerraformFile] = useState<string>('main.tf');

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!onWidthChange) return;

      // Use requestAnimationFrame for smooth 60fps performance
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const windowWidth = window.innerWidth;
        const newWidth = windowWidth - e.clientX;
        const clampedWidth = Math.min(Math.max(newWidth, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
        onWidthChange(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafId);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  // Get properties for the selected resource type - now uses schema-based approach
  const resourceSchema = useMemo(() => {
    if (!selectedNode) return null;
    const resourceType = (selectedNode.data as any)?.resourceType || '';
    return getResourceSchema(resourceType);
  }, [selectedNode]);

  // Convert schema fields to the existing format for backward compatibility
  const resourceProperties = useMemo(() => {
    if (!selectedNode) return DEFAULT_PROPERTIES;
    const resourceType = (selectedNode.data as any)?.resourceType || '';
    
    // Check if we have a rich schema from AWS service definitions
    if (hasRichSchema(resourceType) && resourceSchema) {
      return resourceSchema.fields.map(field => ({
        name: field.name,
        label: field.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: mapSchemaFieldType(field.type),
        placeholder: field.placeholder || field.description,
        options: field.options,
        required: field.required,
        description: field.description,
        reference: field.reference,
      }));
    }
    
    // Fall back to static definitions
    return RESOURCE_PROPERTIES[resourceType] || DEFAULT_PROPERTIES;
  }, [selectedNode, resourceSchema]);

  // Get blocks from schema for AWS resources
  const resourceBlocks = useMemo(() => {
    return resourceSchema?.blocks || [];
  }, [resourceSchema]);

  // Get outputs from schema for AWS resources
  const resourceOutputs = useMemo(() => {
    return resourceSchema?.outputs || [];
  }, [resourceSchema]);

  // When config panel opens, populate form with existing config
  useEffect(() => {
    if (configPanelOpen && selectedNode) {
      setActiveTab('resources');
      const nodeData = selectedNode.data as any;
      const existingConfig = nodeData?.config || {};

      // Initialize form with existing config and defaults
      const initialData: Record<string, any> = {};
      resourceProperties.forEach(prop => {
        if (existingConfig[prop.name] !== undefined) {
          initialData[prop.name] = existingConfig[prop.name];
        } else if (prop.type === 'checkbox') {
          initialData[prop.name] = false;
        } else {
          initialData[prop.name] = '';
        }
      });
      // Also include displayName
      initialData.displayName = nodeData?.displayName || existingConfig.name || '';

      setConfigFormData(initialData);

      // Initialize block form data from existing config
      const initialBlocks: Record<string, any[]> = {};
      resourceBlocks.forEach(block => {
        const blockData = existingConfig[block.name];
        if (Array.isArray(blockData) && blockData.length > 0) {
          initialBlocks[block.name] = blockData;
        } else if (block.multiple) {
          // For multiple blocks, start with empty array
          initialBlocks[block.name] = [];
        } else {
          // For single blocks, start with empty object in array
          initialBlocks[block.name] = [{}];
        }
      });
      setBlockFormData(initialBlocks);
      // Expand blocks that have data
      const blocksWithData = new Set<string>();
      resourceBlocks.forEach(block => {
        if (initialBlocks[block.name]?.length > 0 &&
            initialBlocks[block.name].some((inst: any) => Object.keys(inst).length > 0)) {
          blocksWithData.add(block.name);
        }
      });
      setExpandedBlocks(blocksWithData);
    }
  }, [configPanelOpen, selectedNode?.id, resourceProperties, resourceBlocks]);

  // Group resources by category
  const groupedResources = useMemo(() => {
    const groups: Record<string, ResourceGroup> = {};

    nodes.forEach((node) => {
      const data = node.data as any;
      const resourceType = data?.resourceType || '';
      const nodeType = node.type || 'default';

      // Skip pure container nodes (region, container) - VPC and Subnet are networking resources
      if (['region', 'container'].includes(nodeType)) return;

      // Determine group based on resource type
      let groupKey = 'other';
      let groupLabel = 'Other';
      let groupIcon = 'lucide:box';

      if (resourceType.includes('region') || resourceType.includes('availability_zone')) {
        groupKey = 'region';
        groupLabel = 'Regions & Zones';
        groupIcon = 'lucide:map-pin';
      } else if (resourceType.includes('vpc') || resourceType.includes('subnet') ||
                 resourceType.includes('security_group') || resourceType.includes('gateway') ||
                 resourceType.includes('route') || resourceType.includes('network') ||
                 resourceType.includes('cloudfront') || resourceType.includes('route53') ||
                 resourceType.includes('elb') || resourceType.includes('alb') || resourceType.includes('nlb') ||
                 resourceType.includes('elastic_ip') || resourceType.includes('eip') ||
                 resourceType.includes('vpn') || resourceType.includes('transit_gateway') ||
                 resourceType.includes('endpoint') || resourceType.includes('nacl') ||
                 resourceType.includes('virtual_network') || resourceType.includes('vnet')) {
        groupKey = 'network';
        groupLabel = 'Networking';
        groupIcon = 'lucide:network';
      } else if (resourceType.includes('instance') || resourceType.includes('lambda') ||
                 resourceType.includes('compute') || resourceType.includes('autoscaling') ||
                 resourceType.includes('launch_template') || resourceType.includes('ami') ||
                 resourceType.includes('batch') || resourceType.includes('lightsail') ||
                 resourceType.includes('function') || resourceType.includes('app_runner')) {
        groupKey = 'compute';
        groupLabel = 'Compute';
        groupIcon = 'lucide:cpu';
      } else if (resourceType.includes('ecs') || resourceType.includes('eks') ||
                 resourceType.includes('ecr') || resourceType.includes('fargate') ||
                 resourceType.includes('kubernetes') || resourceType.includes('aks') ||
                 resourceType.includes('gke') || resourceType.includes('container')) {
        groupKey = 'containers';
        groupLabel = 'Containers';
        groupIcon = 'lucide:box';
      } else if (resourceType.includes('s3') || resourceType.includes('ebs') ||
                 resourceType.includes('efs') || resourceType.includes('storage') ||
                 resourceType.includes('glacier') || resourceType.includes('fsx') ||
                 resourceType.includes('backup') || resourceType.includes('blob')) {
        groupKey = 'storage';
        groupLabel = 'Storage';
        groupIcon = 'lucide:hard-drive';
      } else if (resourceType.includes('rds') || resourceType.includes('dynamodb') ||
                 resourceType.includes('database') || resourceType.includes('aurora') ||
                 resourceType.includes('documentdb') || resourceType.includes('neptune') ||
                 resourceType.includes('elasticache') || resourceType.includes('redis') ||
                 resourceType.includes('memcached') || resourceType.includes('timestream') ||
                 resourceType.includes('keyspaces') || resourceType.includes('cosmos') ||
                 resourceType.includes('sql') || resourceType.includes('mongo')) {
        groupKey = 'database';
        groupLabel = 'Database';
        groupIcon = 'lucide:database';
      } else if (resourceType.includes('iam') || resourceType.includes('cognito') ||
                 resourceType.includes('kms') || resourceType.includes('secret') ||
                 resourceType.includes('acm') || resourceType.includes('certificate') ||
                 resourceType.includes('waf') || resourceType.includes('shield') ||
                 resourceType.includes('guardduty') || resourceType.includes('inspector') ||
                 resourceType.includes('macie') || resourceType.includes('firewall') ||
                 resourceType.includes('security_hub') || resourceType.includes('key_vault')) {
        groupKey = 'security';
        groupLabel = 'Security & Identity';
        groupIcon = 'lucide:shield';
      } else if (resourceType.includes('sns') || resourceType.includes('sqs') ||
                 resourceType.includes('eventbridge') || resourceType.includes('mq') ||
                 resourceType.includes('kinesis') || resourceType.includes('kafka') ||
                 resourceType.includes('msk') || resourceType.includes('event_hub') ||
                 resourceType.includes('service_bus') || resourceType.includes('pub_sub')) {
        groupKey = 'messaging';
        groupLabel = 'Messaging';
        groupIcon = 'lucide:mail';
      } else if (resourceType.includes('cloudwatch') || resourceType.includes('cloudtrail') ||
                 resourceType.includes('log') || resourceType.includes('metric') ||
                 resourceType.includes('xray') || resourceType.includes('monitor') ||
                 resourceType.includes('alarm') || resourceType.includes('dashboard') ||
                 resourceType.includes('insight') || resourceType.includes('application_insights')) {
        groupKey = 'monitoring';
        groupLabel = 'Monitoring';
        groupIcon = 'lucide:activity';
      } else if (resourceType.includes('api_gateway') || resourceType.includes('appsync') ||
                 resourceType.includes('step_function') || resourceType.includes('sfn') ||
                 resourceType.includes('appflow') || resourceType.includes('glue') ||
                 resourceType.includes('data_pipeline') || resourceType.includes('logic_app') ||
                 resourceType.includes('api_management')) {
        groupKey = 'integration';
        groupLabel = 'Integration';
        groupIcon = 'lucide:git-branch';
      } else if (resourceType.includes('athena') || resourceType.includes('emr') ||
                 resourceType.includes('redshift') || resourceType.includes('quicksight') ||
                 resourceType.includes('data_lake') || resourceType.includes('lake_formation') ||
                 resourceType.includes('synapse') || resourceType.includes('databricks') ||
                 resourceType.includes('bigquery') || resourceType.includes('dataflow')) {
        groupKey = 'analytics';
        groupLabel = 'Analytics';
        groupIcon = 'lucide:bar-chart-2';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          type: groupKey,
          label: groupLabel,
          icon: groupIcon,
          resources: [],
        };
      }

      groups[groupKey].resources.push(node);
    });

    // Sort groups by priority
    const order = ['compute', 'containers', 'network', 'storage', 'database', 'messaging', 'integration', 'monitoring', 'analytics', 'security', 'region', 'other'];
    return Object.values(groups).sort((a, b) => {
      return order.indexOf(a.type) - order.indexOf(b.type);
    });
  }, [nodes]);

  const toggleGroup = useCallback((groupType: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupType)) {
        next.delete(groupType);
      } else {
        next.add(groupType);
      }
      return next;
    });
  }, []);

  const toggleResource = useCallback((nodeId: string) => {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setConfigFormData(prev => ({ ...prev, [fieldName]: value }));
    setSaveStatus('idle');
  }, []);

  // Block field handlers
  const toggleBlockExpand = useCallback((blockName: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockName)) {
        next.delete(blockName);
      } else {
        next.add(blockName);
      }
      return next;
    });
  }, []);

  const addBlockInstance = useCallback((blockName: string) => {
    setBlockFormData(prev => ({
      ...prev,
      [blockName]: [...(prev[blockName] || []), {}],
    }));
    setExpandedBlocks(prev => new Set([...prev, blockName]));
    setSaveStatus('idle');
  }, []);

  const removeBlockInstance = useCallback((blockName: string, index: number) => {
    setBlockFormData(prev => ({
      ...prev,
      [blockName]: (prev[blockName] || []).filter((_, i) => i !== index),
    }));
    setSaveStatus('idle');
  }, []);

  const updateBlockField = useCallback((blockName: string, index: number, fieldName: string, value: any) => {
    setBlockFormData(prev => ({
      ...prev,
      [blockName]: (prev[blockName] || []).map((instance, i) =>
        i === index ? { ...instance, [fieldName]: value } : instance
      ),
    }));
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedNode || !onUpdateNode) return;

    setSaveStatus('saving');

    const { displayName, ...configData } = configFormData;

    // Merge config data with block data
    // Filter out empty block instances
    const cleanedBlocks: Record<string, any[]> = {};
    for (const [blockName, instances] of Object.entries(blockFormData)) {
      const nonEmptyInstances = instances.filter((inst: any) => {
        // Keep instances that have at least one non-empty value
        return Object.values(inst).some(v =>
          v !== undefined && v !== null && v !== '' &&
          !(Array.isArray(v) && v.length === 0)
        );
      });
      if (nonEmptyInstances.length > 0) {
        cleanedBlocks[blockName] = nonEmptyInstances;
      }
    }

    const fullConfig = {
      ...configData,
      ...cleanedBlocks,
    };

    onUpdateNode(selectedNode.id, {
      displayName: displayName || configData.name || (selectedNode.data as any)?.resourceLabel,
      config: fullConfig,
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  }, [selectedNode, onUpdateNode, configFormData, blockFormData]);

  const renderResourceProperties = useCallback((node: Node) => {
    const data = node.data as any;
    const config = data?.config || {};

    const properties = Object.entries(config).filter(([_, value]) => {
      return value !== null && value !== undefined && value !== '' && typeof value !== 'object';
    });

    if (properties.length === 0) {
      return <p className="text-xs text-gray-400 italic ml-8 mt-1">No properties configured</p>;
    }

    return (
      <div className="ml-8 mt-1 space-y-1 bg-gray-50 rounded-md p-2">
        {properties.slice(0, 5).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium capitalize min-w-[80px]">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-700 font-mono truncate" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ))}
        {properties.length > 5 && (
          <p className="text-xs text-gray-400 italic">+{properties.length - 5} more</p>
        )}
      </div>
    );
  }, []);

  // Get ordered list of terraform files for display
  const sortedTerraformFiles = useMemo(() => {
    const files = Object.keys(terraformFiles);
    if (files.length === 0) return [];

    // Priority order for displaying files (main.tf first to show resources)
    const priority = [
      'main.tf',
      'providers.tf',
      'variables.tf',
      'outputs.tf',
      'terraform.tfvars',
    ];

    return files.sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [terraformFiles]);

  // Get content of selected file
  const selectedFileContent = useMemo(() => {
    if (sortedTerraformFiles.length === 0) {
      return '# No Terraform code generated yet\n# Add resources and save to generate code';
    }
    // If selected file doesn't exist, default to first file
    const fileToShow = terraformFiles[selectedTerraformFile]
      ? selectedTerraformFile
      : sortedTerraformFiles[0];
    return terraformFiles[fileToShow] || '# File content not available';
  }, [terraformFiles, selectedTerraformFile, sortedTerraformFiles]);

  const mainTerraformFile = terraformFiles['modules/infrastructure/main.tf'] ||
                            terraformFiles['main.tf'] ||
                            '# No Terraform code generated yet\n# Add resources and save to generate code';

  // Only 'region' and 'container' are pure containers; VPC and Subnet are networking resources
  const containerNodes = nodes.filter(n => ['region', 'container'].includes(n.type || ''));
  const resourceNodes = nodes.filter(n => !['region', 'container'].includes(n.type || ''));

  // Calculate current width based on collapsed state
  const currentWidth = isCollapsed ? 0 : panelWidth;

  return (
    <div className="h-full relative flex">
      {/* Toggle Arrow Button - Outside panel for proper positioning */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l-md shadow-sm flex items-center justify-center hover:bg-[#714EFF] hover:border-[#714EFF] transition-all duration-300 group"
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
        style={{
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <ChevronRight
          className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-all duration-300"
          style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </button>

      {/* Main Panel */}
      <div
        ref={panelRef}
        style={{
          width: currentWidth,
          minWidth: isCollapsed ? 0 : MIN_PANEL_WIDTH,
          transition: isResizing ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col relative shadow-lg overflow-hidden"
      >
        {/* Resize Handle - only show when expanded */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-10 ${isResizing ? 'bg-[#714EFF]' : 'bg-transparent hover:bg-[#714EFF]/50'} transition-colors`}
          />
        )}

        {/* Panel Content - with opacity transition */}
        <div
          className="flex flex-col h-full"
          style={{
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 200ms ease-in-out',
            transitionDelay: isCollapsed ? '0ms' : '150ms',
            pointerEvents: isCollapsed ? 'none' : 'auto'
          }}
        >

      {/* Panel Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#714EFF] animate-pulse" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Inspector</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 pb-2 gap-1">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'resources'
                ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Resources
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'code'
                ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'deploy'
                ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Deploy
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Resources Tab */}
        {activeTab === 'resources' && !configPanelOpen && (
          <div className="p-3 space-y-2">
            {/* Regions Section - Layout containers for organizing resources */}
            {containerNodes.length > 0 && (
              <div className="mb-3">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  Regions ({containerNodes.length})
                </h3>
                {containerNodes.map(node => {
                  const data = node.data as any;
                  const icon = data?.icon || getCloudIconPath(data?.resourceType);
                  const displayName = data?.displayName || data?.resourceLabel || data?.resourceType;
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => onNodeSelect(node.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors mb-1 ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <CloudIcon icon={icon} size={18} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">
                          {data?.resourceType}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Resources by Group */}
            {groupedResources.length === 0 && containerNodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileCode className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">No resources yet</p>
                <p className="text-xs mt-1 text-gray-400">Drag resources from the left panel</p>
              </div>
            ) : (
              groupedResources.map((group) => (
                <div key={group.type} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group.type)}
                    className="w-full flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {expandedGroups.has(group.type) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{group.label}</span>
                    <span className="ml-auto text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                      {group.resources.length}
                    </span>
                  </button>

                  {expandedGroups.has(group.type) && (
                    <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                      {group.resources.map((node) => {
                        const data = node.data as any;
                        const icon = data?.icon || getCloudIconPath(data?.resourceType);
                        const displayName = data?.displayName || data?.resourceLabel || data?.resourceType;
                        const isExpanded = expandedResources.has(node.id);
                        const isSelected = selectedNode?.id === node.id;

                        return (
                          <div key={node.id}>
                            <button
                              onClick={() => {
                                toggleResource(node.id);
                                onNodeSelect(node.id);
                              }}
                              className={`w-full flex items-center gap-2 p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors ${
                                isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-[#714EFF]' : 'border-l-2 border-transparent'
                              }`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                <CloudIcon icon={icon} size={18} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {displayName}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono truncate">
                                  {data?.resourceType}
                                </p>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-2 pb-2">
                                {renderResourceProperties(node)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Config Panel - Brainboard Style */}
        {activeTab === 'resources' && configPanelOpen && selectedNode && (
          <div className="flex flex-col h-full">
            {/* Config Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <CloudIcon
                  icon={(selectedNode.data as any)?.icon || getCloudIconPath((selectedNode.data as any)?.resourceType)}
                  size={24}
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {(selectedNode.data as any)?.displayName || (selectedNode.data as any)?.resourceLabel || 'Configuration'}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {(selectedNode.data as any)?.resourceType}
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseConfigPanel}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Config Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configFormData.displayName || ''}
                  onChange={(e) => handleFieldChange('displayName', e.target.value)}
                  placeholder="Resource display name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]
                           placeholder:text-gray-400"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Properties
                </h4>
              </div>

              {/* Resource-specific Properties */}
              {resourceProperties.map((prop) => (
                <div key={prop.name} className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {prop.label}
                    {prop.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {prop.type === 'text' && (
                    <input
                      type="text"
                      value={configFormData[prop.name] || ''}
                      onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                      placeholder={prop.placeholder}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]
                               placeholder:text-gray-400"
                    />
                  )}
                  
                  {prop.type === 'number' && (
                    <input
                      type="number"
                      value={configFormData[prop.name] || ''}
                      onChange={(e) => handleFieldChange(prop.name, e.target.value ? Number(e.target.value) : '')}
                      placeholder={prop.placeholder}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]
                               placeholder:text-gray-400"
                    />
                  )}
                  
                  {prop.type === 'select' && (
                    <select
                      value={configFormData[prop.name] || ''}
                      onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]"
                    >
                      <option value="">Select {prop.label}</option>
                      {prop.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  
                  {prop.type === 'checkbox' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={!!configFormData[prop.name]}
                          onChange={(e) => handleFieldChange(prop.name, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-[#714EFF] transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {configFormData[prop.name] ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  )}
                  
                  {prop.type === 'textarea' && (
                    <textarea
                      value={configFormData[prop.name] || ''}
                      onChange={(e) => handleFieldChange(prop.name, e.target.value)}
                      placeholder={prop.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]
                               placeholder:text-gray-400 resize-y"
                    />
                  )}

                  {prop.type === 'reference' && (
                    <div className="space-y-1">
                      <select
                        value={(() => {
                          // Get the current value and extract nodeId for matching
                          const currentValue = configFormData[prop.name];
                          if (isStructuredReference(currentValue)) {
                            return currentValue.nodeId;
                          }
                          // Legacy string format - try to find matching node
                          return '';
                        })()}
                        onChange={(e) => {
                          const selectedNodeId = e.target.value;
                          if (!selectedNodeId || !prop.reference) {
                            handleFieldChange(prop.name, '');
                            return;
                          }
                          // Store as structured reference with nodeId
                          const structuredRef: TerraformReference = {
                            __ref: true,
                            nodeId: selectedNodeId,
                            resourceType: prop.reference.resourceType,
                            outputName: prop.reference.outputName,
                          };
                          handleFieldChange(prop.name, structuredRef);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]"
                      >
                        <option value="">Select resource...</option>
                        {nodes
                          .filter(n => {
                            const nData = n.data as any;
                            return prop.reference && nData?.resourceType === prop.reference.resourceType && n.id !== selectedNode?.id;
                          })
                          .map(n => {
                            const nData = n.data as any;
                            const displayName = nData?.displayName || nData?.resourceLabel || n.id;
                            // Compute current terraform reference for display
                            const sanitizedName = sanitizeTerraformName(displayName);
                            const terraformRef = `${prop.reference?.resourceType}.${sanitizedName}.${prop.reference?.outputName}`;
                            return (
                              <option key={n.id} value={n.id}>
                                {displayName} ({terraformRef})
                              </option>
                            );
                          })}
                      </select>
                      {/* Show current resolved reference */}
                      {configFormData[prop.name] && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          {getReferenceDisplayValue(configFormData[prop.name], nodes)}
                        </p>
                      )}
                      {prop.reference && (
                        <p className="text-[10px] text-blue-500 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          References: {prop.reference.resourceType}.{prop.reference.outputName}
                        </p>
                      )}
                    </div>
                  )}

                  {'description' in prop && prop.description && (
                    <p className="text-[10px] text-gray-400">{prop.description}</p>
                  )}
                </div>
              ))}

              {/* Blocks Section */}
              {resourceBlocks.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Configuration Blocks
                  </h4>
                  <div className="space-y-2">
                    {resourceBlocks.map(block => {
                      const instances = blockFormData[block.name] || [];
                      const isExpanded = expandedBlocks.has(block.name);

                      return (
                        <div key={block.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                          {/* Block Header */}
                          <button
                            onClick={() => toggleBlockExpand(block.name)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              )}
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {block.label}
                                {block.multiple && (
                                  <span className="ml-1 text-gray-400">({instances.length})</span>
                                )}
                              </span>
                            </div>
                            {block.multiple && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addBlockInstance(block.name);
                                }}
                                className="p-1 rounded hover:bg-[#714EFF]/20 text-[#714EFF]"
                                title={`Add ${block.label}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </button>

                          {/* Block Content - expanded */}
                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-3">
                              {block.description && (
                                <p className="text-[10px] text-gray-400">{block.description}</p>
                              )}

                              {instances.length === 0 ? (
                                <div className="text-center py-3 text-xs text-gray-400">
                                  <p>No {block.label.toLowerCase()} configured</p>
                                  <button
                                    onClick={() => addBlockInstance(block.name)}
                                    className="mt-1 text-[#714EFF] hover:underline"
                                  >
                                    Add {block.label}
                                  </button>
                                </div>
                              ) : (
                                instances.map((instance: any, index: number) => (
                                  <div
                                    key={index}
                                    className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 space-y-2"
                                  >
                                    {/* Instance header with delete button */}
                                    <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
                                      <span className="text-[10px] font-medium text-gray-500">
                                        {block.label} #{index + 1}
                                      </span>
                                      <button
                                        onClick={() => removeBlockInstance(block.name, index)}
                                        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                        title="Remove"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* All fields for this instance */}
                                    {block.fields.map(field => (
                                      <div key={field.name} className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500 min-w-[80px] truncate" title={field.label}>
                                          {field.label}
                                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                        </span>
                                        {field.type === 'number' ? (
                                          <input
                                            type="number"
                                            value={instance[field.name] ?? ''}
                                            onChange={(e) => updateBlockField(
                                              block.name, index, field.name,
                                              e.target.valueAsNumber || 0
                                            )}
                                            placeholder={field.description || field.label}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                          />
                                        ) : field.type === 'boolean' || field.type === 'checkbox' ? (
                                          <input
                                            type="checkbox"
                                            checked={!!instance[field.name]}
                                            onChange={(e) => updateBlockField(
                                              block.name, index, field.name, e.target.checked
                                            )}
                                            className="w-4 h-4 rounded border-gray-300 text-[#714EFF]"
                                          />
                                        ) : field.type === 'list' ? (
                                          <input
                                            type="text"
                                            value={Array.isArray(instance[field.name])
                                              ? instance[field.name].join(', ')
                                              : instance[field.name] || ''
                                            }
                                            onChange={(e) => {
                                              const arrayValue = e.target.value
                                                .split(',')
                                                .map(s => s.trim())
                                                .filter(s => s.length > 0);
                                              updateBlockField(block.name, index, field.name, arrayValue);
                                            }}
                                            placeholder={field.description || 'Comma-separated values'}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                          />
                                        ) : field.options ? (
                                          <select
                                            value={instance[field.name] || ''}
                                            onChange={(e) => updateBlockField(
                                              block.name, index, field.name, e.target.value
                                            )}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                          >
                                            <option value="">Select...</option>
                                            {field.options.map(opt => (
                                              <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            type="text"
                                            value={instance[field.name] || ''}
                                            onChange={(e) => updateBlockField(
                                              block.name, index, field.name, e.target.value
                                            )}
                                            placeholder={field.description || field.label}
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outputs Section */}
              {resourceOutputs.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" />
                    Available Outputs
                  </h4>
                  <div className="space-y-1">
                    {resourceOutputs.slice(0, 5).map(output => (
                      <div key={output.name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <code className="text-[#714EFF] font-mono">{output.name}</code>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-500 truncate">{output.description}</span>
                      </div>
                    ))}
                    {resourceOutputs.length > 5 && (
                      <p className="text-[10px] text-gray-400 text-center">+{resourceOutputs.length - 5} more outputs</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {saveStatus === 'saving' && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 bg-[#714EFF] rounded-full animate-pulse" />
                      Saving...
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                           bg-[#714EFF] text-white hover:bg-[#5E3FD9] 
                           transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'code' && (
          <div className="h-full flex flex-col">
            {Object.keys(terraformFiles).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <Code2 className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium">No code generated</p>
                <p className="text-xs mt-2 text-center text-gray-400">
                  Add resources and save to generate Terraform code
                </p>
              </div>
            ) : (
              <>
                {/* File selector tabs */}
                <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto hide-scrollbar">
                    {sortedTerraformFiles.map((file) => {
                      const shortName = file.split('/').pop() || file;
                      const isSelected = selectedTerraformFile === file ||
                        (!terraformFiles[selectedTerraformFile] && file === sortedTerraformFiles[0]);
                      return (
                        <button
                          key={file}
                          onClick={() => setSelectedTerraformFile(file)}
                          className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                            isSelected
                              ? 'bg-[#714EFF] text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                          }`}
                          title={file}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* File content */}
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language="hcl"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: '11px',
                      lineHeight: '1.5',
                      minHeight: '100%',
                    }}
                    showLineNumbers
                  >
                    {selectedFileContent}
                  </SyntaxHighlighter>
                </div>
              </>
            )}
          </div>
        )}

        {/* Deploy Tab */}
        {activeTab === 'deploy' && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <Rocket className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">Deployment</p>
              <p className="text-xs mt-2 text-gray-400">
                Use the toolbar to plan, apply, or destroy infrastructure
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{resourceNodes.length} resources</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{containerNodes.length} regions</span>
            </div>
          </div>
          {activeTab === 'code' && Object.keys(terraformFiles).length > 0 && (
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{Object.keys(terraformFiles).length} files</span>
            </div>
          )}
        </div>
      </div>
      </div>{/* End Panel Content wrapper */}
      </div>{/* End Main Panel */}
    </div>
  );
}
