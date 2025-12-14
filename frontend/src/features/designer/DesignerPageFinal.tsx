import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  MiniMap,
  NodeDragHandler,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import type { Edge, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import {
  getResourcesForProvider,
  getCategoriesForProvider,
  CloudProvider,
  CloudResource,
  resolveResourceIcon,
} from '../../lib/resources';
import { buildCredentialsQuery } from '../../lib/utils/credentials';
import { nodeTypes } from '../../components/nodes';
import ResourceConfigModal from '../../components/ResourceConfigModal';
import CloudCredentialsModal from '../../components/CloudCredentialsModal';
import DeploymentLogsModal from '../../components/DeploymentLogsModal';
import PlanPreviewModal from '../../components/PlanPreviewModal';
import ExportModal from '../../components/ExportModal';
import DesignerWithCodeView from '../../components/DesignerWithCodeView';
import AssistantChatPanel from '../../components/AssistantChatPanel';
import TerraformLogsPanel from '../../components/TerraformLogsPanel';
import InfracostReportPanel from './InfracostReportPanel';
import ResourcePalette from '../../components/ResourcePalette';
import DesignerToolbar from '../../components/DesignerToolbar';
import BrainboardRightPanel from '../../components/BrainboardRightPanel';
import ResourceContextMenu from '../../components/ResourceContextMenu';

interface Project {
  id: number;
  name: string;
  description: string;
  cloud_provider: CloudProvider;
  diagram_data: any;
}

const GRID_SIZE = 10; // Grid size for snapping - larger values = more stable movement
type PlanStatus = 'idle' | 'running' | 'success' | 'error';
type DeployStatus = 'idle' | 'running' | 'success' | 'error';
const DEFAULT_RESOURCE_SIZE = 160;
const DEFAULT_EDGE_COLOR = '#2A8BFF';
const DEFAULT_EDGE_STYLE = { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5 } as const;
const DEFAULT_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color: DEFAULT_EDGE_COLOR,
} as const;
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: DEFAULT_EDGE_STYLE,
  markerEnd: DEFAULT_EDGE_MARKER,
} as const;
const decorateEdge = (edge: Edge): Edge => {
  const style = Object.assign({}, DEFAULT_EDGE_STYLE, edge.style ?? {});
  const markerEnd = edge.markerEnd ? Object.assign({}, DEFAULT_EDGE_MARKER, edge.markerEnd) : DEFAULT_EDGE_MARKER;
  return {
    ...edge,
    style,
    markerEnd,
  };
};
const decorateEdges = (edges: Edge[]) => edges.map(decorateEdge);

const sanitizeNodeForSave = (node: Node) => {
  const data = (node.data || {}) as any;
  const baseSize =
    data.size ??
    (node.type === 'default'
      ? {
          width: node.style?.width ?? DEFAULT_RESOURCE_SIZE,
          height: node.style?.height ?? DEFAULT_RESOURCE_SIZE,
        }
      : undefined);

  const sanitized: any = {
    id: node.id,
    type: node.type,
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
    data: {
      resourceType: data.resourceType,
      resourceLabel: data.resourceLabel ?? data.resourceType,
      resourceCategory: data.resourceCategory,
      resourceDescription: data.resourceDescription,
      displayName: data.displayName ?? data.resourceLabel ?? data.resourceType,
      config: data.config ?? {},
      size: baseSize,
    },
  };

  if (node.parentNode) {
    sanitized.parentNode = node.parentNode;
  }

  if (node.extent) {
    sanitized.extent = node.extent;
  }

  const width = node.style?.width ?? (node.type === 'default' ? baseSize?.width : baseSize?.width);
  const height = node.style?.height ?? (node.type === 'default' ? baseSize?.height : baseSize?.height);

  if (width !== undefined || height !== undefined) {
    sanitized.style = {} as any;
    if (width !== undefined) sanitized.style.width = width;
    if (height !== undefined) sanitized.style.height = height;
  }

  return sanitized;
};

const sanitizeEdgeForSave = (edge: Edge) => {
  const sanitized: any = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
  };

  if (edge.type) sanitized.type = edge.type;
  if (edge.sourceHandle) sanitized.sourceHandle = edge.sourceHandle;
  if (edge.targetHandle) sanitized.targetHandle = edge.targetHandle;
  if (edge.label) sanitized.label = edge.label;
  if (edge.data) sanitized.data = edge.data;

  return sanitized;
};


export default function DesignerPageFinal() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [zoom, setZoom] = useState(100);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Modal states
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [deployLogsModalOpen, setDeployLogsModalOpen] = useState(false);
  const [planPreviewModalOpen, setPlanPreviewModalOpen] = useState(false);
  const [planPreviewContent, setPlanPreviewContent] = useState('');
  const [planPreviewStatus, setPlanPreviewStatus] = useState<PlanStatus>('idle');
  const [planPreviewHasChanges, setPlanPreviewHasChanges] = useState<boolean | null>(null);
  const [planPreviewError, setPlanPreviewError] = useState('');
  const planEventSourceRef = useRef<EventSource | null>(null);
  const deployEventSourceRef = useRef<EventSource | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deployMode, setDeployMode] = useState<'deploy' | 'destroy'>('deploy');
  const [terraformAction, setTerraformAction] = useState<'download' | 'plan' | 'apply' | 'destroy' | 'validate' | 'tfsec' | 'terrascan' | 'infracost' | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Terraform logs panel state
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [terraformLogs, setTerraformLogs] = useState<string[]>([]);
  const [logsPanelOperation, setLogsPanelOperation] = useState<'validate' | 'plan' | 'apply' | 'destroy' | null>(null);
  const [logsPanelStatus, setLogsPanelStatus] = useState<'running' | 'success' | 'error' | 'idle'>('idle');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');

  // Infracost report panel state
  const [infracostReportOpen, setInfracostReportOpen] = useState(false);
  const [infracostData, setInfracostData] = useState<any>(null);
  const [infracostStatus, setInfracostStatus] = useState<'running' | 'success' | 'error' | null>(null);

  // Terraform files state
  const [terraformFiles, setTerraformFiles] = useState<Record<string, string>>({});

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  // Credentials state
  const [credentials, setCredentials] = useState<any>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialLoadRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);

  const provider = (project?.cloud_provider as CloudProvider) || 'aws';

  const appendTerraformLogs = useCallback(
    (lines: string | string[], options?: { includePreview?: boolean }) => {
      const entries = Array.isArray(lines) ? lines : [lines];
      const flattened = entries.flatMap((raw) => {
        if (typeof raw !== 'string') return [];
        return raw.split('\n').map((line) => line.replace(/\r/g, ''));
      });

      if (flattened.length === 0) {
        return;
      }

      setTerraformLogs((prev) => [...prev, ...flattened]);

      if (options?.includePreview === false) {
        return;
      }

      const previewEligible = flattened.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('PLAN_RESULT:')) return false;
        if (trimmed === '[DONE]') return false;
        if (trimmed.startsWith('>')) return false;
        if (trimmed.startsWith('[INFO]')) return false;
        return true;
      });

      if (previewEligible.length === 0) {
        return;
      }

      const joined = previewEligible.join('\n');
      setPlanPreviewContent((prev) => (prev ? `${prev}\n${joined}` : joined));
    },
    []
  );

  const appendDeployLogs = useCallback((lines: string | string[]) => {
    const entries = Array.isArray(lines) ? lines : [lines];
    const flattened = entries.flatMap((raw) => {
      if (typeof raw !== 'string') return [];
      return raw.split('\n').map((line) => line.replace(/\r/g, ''));
    });

    if (flattened.length === 0) {
      return;
    }

    setDeployLogs((prev) => [...prev, ...flattened]);
  }, []);

  const stopPlanStream = useCallback(() => {
    if (planEventSourceRef.current) {
      planEventSourceRef.current.close();
      planEventSourceRef.current = null;
    }
  }, []);

  const stopDeployStream = useCallback(() => {
    if (deployEventSourceRef.current) {
      deployEventSourceRef.current.close();
      deployEventSourceRef.current = null;
    }
  }, []);

  const startPlanStream = useCallback(() => {
    if (!projectId || !project) {
      appendTerraformLogs('[ERROR] Missing project context for terraform plan.');
      setPlanPreviewStatus('error');
      setPlanPreviewError('Missing project context. Please refresh and try again.');
      setLogsPanelStatus('error');
      return;
    }

    if (!credentials) {
      appendTerraformLogs('[ERROR] Cloud credentials are required to run terraform plan.');
      setPlanPreviewStatus('error');
      setPlanPreviewError('Cloud credentials are required to run terraform plan.');
      setLogsPanelStatus('error');
      return;
    }

    if (!token) {
      appendTerraformLogs('[ERROR] Authentication token missing for terraform plan.');
      setPlanPreviewStatus('error');
      setPlanPreviewError('Authentication token missing. Please sign in again.');
      setLogsPanelStatus('error');
      return;
    }

    const credsQuery = buildCredentialsQuery(project.cloud_provider as CloudProvider, credentials);
    if (!credsQuery) {
      appendTerraformLogs('[ERROR] Credentials are incomplete for the selected provider.');
      setPlanPreviewStatus('error');
      setPlanPreviewError('Incomplete credentials for the selected provider.');
      setLogsPanelStatus('error');
      return;
    }

    stopPlanStream();

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/api/terraform/plan/stream/${projectId}?${credsQuery}&token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url);
    planEventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (!data) {
        return;
      }

      if (data === '[DONE]') {
        stopPlanStream();
        return;
      }

      if (data.startsWith('PLAN_RESULT:')) {
        const payload = data.replace('PLAN_RESULT:', '').trim();
        const [statusPart = '', changePart = ''] = payload.split('|');
        const isSuccess = statusPart.includes('success');
        const hasChangesFlag = changePart.split('=').pop() === 'true';

        setPlanPreviewHasChanges(isSuccess ? hasChangesFlag : null);
        setPlanPreviewStatus(isSuccess ? 'success' : 'error');
        setPlanPreviewError(isSuccess ? '' : 'Terraform plan failed. Review the logs for details.');
        setLogsPanelStatus(isSuccess ? 'success' : 'error');

        appendTerraformLogs(
          isSuccess
            ? hasChangesFlag
              ? '[OK] Terraform plan completed with changes.'
              : '[OK] Terraform plan completed. No changes detected.'
            : '[ERROR] Terraform plan failed.',
          { includePreview: false }
        );
        return;
      }

      appendTerraformLogs(data);
    };

    eventSource.onerror = (error) => {
      console.error('Terraform plan stream error:', error);
      appendTerraformLogs('[ERROR] Connection to terraform plan stream lost.');
      setPlanPreviewStatus('error');
      setPlanPreviewError('Connection lost while streaming terraform plan.');
      setLogsPanelStatus('error');
      stopPlanStream();
    };
  }, [appendTerraformLogs, credentials, project, projectId, setLogsPanelStatus, stopPlanStream, token]);

  const startDeployStream = useCallback(
    (mode: 'deploy' | 'destroy') => {
      if (!projectId || !project) {
        appendDeployLogs('[ERROR] Missing project context for terraform apply/destroy.');
        setDeployStatus('error');
        setLogsPanelStatus('error');
        return;
      }

      if (!credentials) {
        appendDeployLogs('[ERROR] Cloud credentials are required to run terraform apply/destroy.');
        setDeployStatus('error');
        setLogsPanelStatus('error');
        return;
      }

      if (!token) {
        appendDeployLogs('[ERROR] Authentication token missing for terraform operation.');
        setDeployStatus('error');
        setLogsPanelStatus('error');
        return;
      }

      const credsQuery = buildCredentialsQuery(project.cloud_provider as CloudProvider, credentials);
      if (!credsQuery) {
        appendDeployLogs('[ERROR] Credentials are incomplete for the selected provider.');
        setDeployStatus('error');
        setLogsPanelStatus('error');
        return;
      }

      stopDeployStream();

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const endpoint = mode === 'deploy' ? 'deploy' : 'destroy';
      const url = `${baseUrl}/api/terraform/${endpoint}/stream/${projectId}?${credsQuery}&token=${encodeURIComponent(token)}`;

      const eventSource = new EventSource(url);
      deployEventSourceRef.current = eventSource;
      setLogsPanelOpen(true);
      setLogsPanelOperation(mode === 'deploy' ? 'apply' : 'destroy');
      setLogsPanelStatus('running');
      setTerraformLogs([]);
      appendTerraformLogs(
        mode === 'deploy' ? '> Streaming terraform apply output...' : '> Streaming terraform destroy output...',
        { includePreview: false }
      );

      let encounteredError = false;

      eventSource.onmessage = (event) => {
        const data = event.data;
        if (!data) {
          return;
        }

        if (data === '[DONE]') {
          stopDeployStream();
          const finalStatus = encounteredError ? 'error' : 'success';
          setDeployStatus(finalStatus);
          setLogsPanelStatus(finalStatus === 'error' ? 'error' : 'success');
          appendTerraformLogs(
            finalStatus === 'error'
              ? mode === 'deploy'
                ? '[ERROR] Terraform apply failed.'
                : '[ERROR] Terraform destroy failed.'
              : mode === 'deploy'
                ? '[OK] Terraform apply completed.'
                : '[OK] Terraform destroy completed.',
            { includePreview: false }
          );
          return;
        }

        if (data.startsWith('ERROR:')) {
          encounteredError = true;
          setDeployStatus('error');
          setLogsPanelStatus('error');
        }

        appendDeployLogs(data);
        appendTerraformLogs(data, { includePreview: false });
      };

      eventSource.onerror = (error) => {
        console.error('Terraform deploy stream error:', error);
        appendDeployLogs('[ERROR] Connection to terraform deploy stream lost.');
        appendTerraformLogs('[ERROR] Connection to terraform deploy stream lost.', { includePreview: false });
        encounteredError = true;
        setDeployStatus('error');
        setLogsPanelStatus('error');
        stopDeployStream();
      };
    },
    [
      appendDeployLogs,
      appendTerraformLogs,
      credentials,
      project,
      projectId,
      setLogsPanelOpen,
      stopDeployStream,
      token,
    ]
  );

  // Resources
  const resources = useMemo(() => getResourcesForProvider(provider), [provider]);
  const categories = useMemo(() => getCategoriesForProvider(provider), [provider]);

  // Load project
  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Load credentials from localStorage
  useEffect(() => {
    if (project) {
      const storageKey = `credentials_${project.cloud_provider}`;
      const savedCreds = localStorage.getItem(storageKey);
      if (savedCreds) {
        setCredentials(JSON.parse(savedCreds));
      }
    }
  }, [project]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectData = response.data;
      setProject(projectData);

      // Load diagram data if exists
      if (projectData.diagram_data) {
        try {
          const diagram =
            typeof projectData.diagram_data === 'string'
              ? JSON.parse(projectData.diagram_data)
              : projectData.diagram_data;

          const catalog = getResourcesForProvider(projectData.cloud_provider);
          const lookup = new Map(catalog.map((resource) => [resource.type, resource]));

          if (diagram.nodes) {
            const normalizedNodes = (diagram.nodes as Node[]).map((rawNode: any) => {
              const node = { ...rawNode } as Node;
              const data = { ...(node.data || {}) };
              const resourceType = data.resourceType;
              const catalogEntry = resourceType ? lookup.get(resourceType) : undefined;
              const icon = data.icon || resolveResourceIcon(resourceType, catalogEntry?.icon);
              const category = data.category || catalogEntry?.category || 'other';
              const displayName =
                data.displayName ||
                data.config?.name ||
                data.resourceLabel ||
                (typeof data.label === 'string' ? data.label.split('\n')[0] : data.label) ||
                resourceType;

              const style = { ...(node.style || {}) };

              if (typeof data.size === 'number') {
                style.width = data.size;
                style.height = data.size;
              } else if (data.size && typeof data.size === 'object') {
                const { width, height } = data.size as { width?: number; height?: number };
                if (width) style.width = width;
                if (height) style.height = height;
              } else if (!style.width && !style.height && (!node.type || node.type === 'default')) {
                style.width = DEFAULT_RESOURCE_SIZE;
                style.height = DEFAULT_RESOURCE_SIZE;
              }

              const styleWidth = typeof style.width === 'number' ? style.width : Number(style.width);
              const styleHeight = typeof style.height === 'number' ? style.height : Number(style.height);
              const isContainerType = ['region', 'vpc', 'subnet', 'container'].includes((node.type || '').toLowerCase());
              const existingSize = data.size as any;
              const normalizedSize = isContainerType
                ? {
                    width: Number.isFinite(styleWidth)
                      ? styleWidth
                      : typeof existingSize?.width === 'number'
                        ? existingSize.width
                        : DEFAULT_RESOURCE_SIZE,
                    height: Number.isFinite(styleHeight)
                      ? styleHeight
                      : typeof existingSize?.height === 'number'
                        ? existingSize.height
                        : DEFAULT_RESOURCE_SIZE,
                  }
                : (Number.isFinite(styleWidth)
                    ? styleWidth
                    : Number.isFinite(styleHeight)
                      ? styleHeight
                      : typeof existingSize === 'number'
                        ? existingSize
                        : DEFAULT_RESOURCE_SIZE);

              const normalized: Node = {
                ...node,
                data: {
                  ...data,
                  icon,
                  category,
                  displayName,
                  resourceDescription: data.resourceDescription || catalogEntry?.description,
                  size: normalizedSize,
                },
                style,
              };

              if (isContainerType) {
                normalized.extent = 'parent';
                (normalized as any).expandParent = true;
              }

              return normalized;
            });

            setNodes(normalizedNodes);
          }

          if (diagram.edges) {
            setEdges(decorateEdges(diagram.edges as Edge[]));
          }
          
          lastSavedDataRef.current = JSON.stringify({
            nodes: (diagram.nodes || []).map(sanitizeNodeForSave),
            edges: (diagram.edges || []).map(sanitizeEdgeForSave),
          });
        } catch (e) {
          console.error('Failed to parse diagram data:', e);
        }
      }
    } catch (error: any) {
      console.error('Failed to load project:', error);
      alert('Failed to load project: ' + (error.response?.data?.detail || error.message));
    } finally {
      hasInitialLoadRef.current = true;
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            style: DEFAULT_EDGE_STYLE,
            markerEnd: DEFAULT_EDGE_MARKER,
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = useCallback(
    (resource: CloudResource) => {
      const id = `${resource.type}_${Date.now()}`;

      // Determine node type based on resource
      let nodeType = 'default';
      let nodeStyle: Record<string, unknown> | undefined = {
        width: DEFAULT_RESOURCE_SIZE,
        height: DEFAULT_RESOURCE_SIZE,
      };
      let initialSize: number | { width: number; height: number } | undefined = DEFAULT_RESOURCE_SIZE;

      // Check if resource is marked as a container
      if (resource.isContainer) {
        nodeType = 'container';
        nodeStyle = { width: 480, height: 340 };
        initialSize = { width: 480, height: 340 };
      } else if (resource.type === 'aws_region' || resource.type === 'azure_resource_group' || resource.type === 'google_project') {
        nodeType = 'region';
        nodeStyle = { width: 560, height: 420 };
        initialSize = { width: 560, height: 420 };
      } else if (resource.type === 'aws_vpc' || resource.type === 'azurerm_virtual_network' || resource.type === 'google_compute_network') {
        nodeType = 'vpc';
        nodeStyle = { width: 480, height: 340 };
        initialSize = { width: 480, height: 340 };
      } else if (resource.type === 'aws_subnet' || resource.type === 'azurerm_subnet' || resource.type === 'google_compute_subnetwork') {
        nodeType = 'subnet';
        nodeStyle = { width: 360, height: 240 };
        initialSize = { width: 360, height: 240 };
      }

      const newNode: Node = {
        id,
        type: nodeType,
        position: {
          x: Math.round((Math.random() * 400 + 100) / GRID_SIZE) * GRID_SIZE,
          y: Math.round((Math.random() * 400 + 100) / GRID_SIZE) * GRID_SIZE,
        },
        data: {
          label: resource.label,
          resourceType: resource.type,
          resourceLabel: resource.label,
          config: {},
          icon: resolveResourceIcon(resource.type, resource.icon),
          category: resource.category,
          resourceDescription: resource.description,
          displayName: resource.label,
          size: initialSize,
          isContainer: resource.isContainer,
          isDataSource: resource.isDataSource,
        },
        style: nodeStyle,
        // For container nodes, allow them to be parents
        ...(nodeType !== 'default' && {
          extent: 'parent' as const,
          expandParent: true,
        }),
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode);
      setConfigModalOpen(true);
    },
    [setNodes]
  );

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setConfigPanelOpen(true);
    },
    []
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
      setSelectedNode(node);
    },
    []
  );

  // Context menu action handlers
  const handleContextMenuCloudConfig = useCallback(() => {
    if (selectedNode) {
      setConfigPanelOpen(true);
    }
  }, [selectedNode]);

  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu) {
      setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId));
    }
  }, [contextMenu, setNodes, setEdges]);

  const handleContextMenuDuplicate = useCallback(() => {
    if (contextMenu) {
      const nodeToDuplicate = nodes.find((n) => n.id === contextMenu.nodeId);
      if (nodeToDuplicate) {
        const newNode = {
          ...nodeToDuplicate,
          id: `${nodeToDuplicate.id}-copy-${Date.now()}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
          data: {
            ...nodeToDuplicate.data,
            displayName: `${(nodeToDuplicate.data as any).displayName || (nodeToDuplicate.data as any).resourceLabel} (Copy)`,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    }
  }, [contextMenu, nodes, setNodes]);

  const handleContextMenuHighlightConnections = useCallback(() => {
    if (contextMenu) {
      const connectedEdges = edges.filter(
        (e) => e.source === contextMenu.nodeId || e.target === contextMenu.nodeId
      );
      setEdges((eds) =>
        eds.map((e) => {
          if (connectedEdges.find((ce) => ce.id === e.id)) {
            return {
              ...e,
              style: { ...e.style, stroke: '#714EFF', strokeWidth: 3 },
              animated: true,
            };
          }
          return e;
        })
      );
      // Reset after 3 seconds
      setTimeout(() => {
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            style: { ...e.style, stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5 },
            animated: false,
          }))
        );
      }, 3000);
    }
  }, [contextMenu, edges, setEdges]);

  // Handle node drag to support nesting
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node, nodes) => {
      // Find if the node was dropped inside a container
      const containerTypes = ['region', 'vpc', 'subnet'];

      // Get all container nodes
      const containers = nodes.filter(n => containerTypes.includes(n.type || ''));

      // Check if node is inside any container
      for (const container of containers) {
        if (container.id === node.id) continue; // Skip self

        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const containerX = container.position.x;
        const containerY = container.position.y;

        const containerWidth =
          (container.style && typeof container.style.width === 'number'
            ? container.style.width
            : container.width) ??
          (container.type === 'region' ? 560 : container.type === 'vpc' ? 480 : 360);

        const containerHeight =
          (container.style && typeof container.style.height === 'number'
            ? container.style.height
            : container.height) ??
          (container.type === 'region' ? 400 : container.type === 'vpc' ? 320 : 240);

        // Check if node center is inside container bounds
        if (
          nodeX > containerX &&
          nodeX < containerX + containerWidth &&
          nodeY > containerY + 50 && // Account for header
          nodeY < containerY + containerHeight
        ) {
          // Set the node's parent
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  parentNode: container.id,
                  extent: 'parent' as const,
                  // Adjust position to be relative to parent
                  position: {
                    x: nodeX - containerX,
                    y: nodeY - containerY,
                  },
                };
              }
              return n;
            })
          );
          return;
        }
      }

      // If not in any container, remove parent if it had one
      if (node.parentNode) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              const { parentNode, extent, ...rest } = n;
              return rest;
            }
            return n;
          })
        );
      }
    },
    [setNodes]
  );

  const handleConfigSave = (config: any) => {
    if (!selectedNode) return;

    const resourceName =
      (typeof config.name === 'string' && config.name.trim()) ||
      (typeof config.resource_name === 'string' && config.resource_name.trim()) ||
      (typeof selectedNode.data?.displayName === 'string' && selectedNode.data.displayName.trim()) ||
      (typeof selectedNode.data?.resourceLabel === 'string' && selectedNode.data.resourceLabel.trim()) ||
      selectedNode.id;

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config,
        label: resourceName,
        displayName: resourceName,
        resourceLabel: resourceName,
      },
    };

    setNodes((nds) =>
      nds.map((node) => (node.id === selectedNode.id ? updatedNode : node))
    );
    setConfigModalOpen(false);
    setSelectedNode(null);
  };

  const handleCredentialsSave = (creds: any) => {
    setCredentials(creds);
    localStorage.setItem(`credentials_${provider}`, JSON.stringify(creds));
    setCredentialsModalOpen(false);
  };

  const saveProject = useCallback(
    async (options?: { silent?: boolean }) => {
      if (isSavingRef.current) return;
      
      const diagramData = JSON.parse(
        JSON.stringify({
          nodes: nodes.map(sanitizeNodeForSave),
          edges: edges.map(sanitizeEdgeForSave),
        })
      );

      const dataStr = JSON.stringify(diagramData);
      if (options?.silent && lastSavedDataRef.current === dataStr) {
        return;
      }
      
      try {
        isSavingRef.current = true;
        setSaving(true);

        await apiClient.put(
          `/api/projects/${projectId}`,
          {
            name: project?.name,
            description: project?.description,
            cloud_provider: project?.cloud_provider ?? provider,
            diagram_data: diagramData,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        lastSavedDataRef.current = dataStr;

        // Auto-generate Terraform in real-time after saving
        if (nodes.length > 0) {
          try {
            await apiClient.post(
              `/api/terraform/generate/${projectId}`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Auto-fetch the generated Terraform files
            const filesResponse = await apiClient.get(
              `/api/terraform/files/${projectId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (filesResponse.data) {
              setTerraformFiles(filesResponse.data);
            }
          } catch (tfError) {
            console.warn('Auto Terraform generation failed:', tfError);
            // Don't block the save operation if Terraform generation fails
          }
        }

        if (!options?.silent) {
          console.info('Project saved', diagramData);
          setProject((prev) =>
            prev
              ? {
                  ...prev,
                  diagram_data: diagramData,
                }
              : prev
          );
        }
      } catch (error: any) {
        console.error('Failed to save project:', error);
        if (!options?.silent) {
          const detail = error.response?.data?.detail;
          const message = detail ? JSON.stringify(detail) : error.message;
          alert('Failed to save project: ' + message);
        }
      } finally {
        isSavingRef.current = false;
        setSaving(false);
      }
    },
    [edges, nodes, project, projectId, provider, token]
  );

  const saveProjectRef = useRef(saveProject);
  saveProjectRef.current = saveProject;

  useEffect(() => {
    if (!projectId || !token) return;
    if (!hasInitialLoadRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const dataStr = JSON.stringify({
      nodes: nodes.map(sanitizeNodeForSave),
      edges: edges.map(sanitizeEdgeForSave),
    });
    
    if (lastSavedDataRef.current === dataStr) {
      return;
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveProjectRef.current({ silent: true }).catch((err) => {
        console.error('Autosave failed', err);
      });
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [nodes, edges, projectId, token]);

  useEffect(
    () => () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      stopPlanStream();
      stopDeployStream();
    },
    [stopDeployStream, stopPlanStream]
  );
  const generateAndDownloadTerraform = async () => {
    try {
      setTerraformAction('download');
      // First save silently
      await saveProject({ silent: true });

      // Generate
      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Download
      const response = await apiClient.get(`/api/terraform/download/${projectId}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `terraform-project-${projectId}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);

      alert('Terraform code generated and downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to generate Terraform:', error);
      alert('Failed to generate Terraform: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTerraformAction(null);
    }
  };

  const showPlanPreview = async () => {
    if (!credentials) {
      alert('Please configure cloud credentials first!');
      setCredentialsModalOpen(true);
      return;
    }

    try {
      setTerraformAction('plan');
      setPlanPreviewModalOpen(true);
      setPlanPreviewStatus('running');
      setPlanPreviewHasChanges(null);
      setPlanPreviewError('');
      setPlanPreviewContent('');

      setLogsPanelOpen(true);
      setLogsPanelOperation('plan');
      setLogsPanelStatus('running');
      setTerraformLogs([]);

      appendTerraformLogs('> Saving project state...', { includePreview: false });
      await saveProject({ silent: true });
      appendTerraformLogs('[OK] Project saved.', { includePreview: false });
      appendTerraformLogs('> Generating Terraform files...', { includePreview: false });
      setPlanPreviewContent('Starting terraform plan...\n');
      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      appendTerraformLogs('[OK] Terraform files generated.', { includePreview: false });
      appendTerraformLogs('> Streaming terraform plan output...', { includePreview: false });

      startPlanStream();
    } catch (error: any) {
      console.error('Failed to prepare plan preview:', error);
      const detail = error.response?.data?.detail || error.message || 'Unknown error';
      setPlanPreviewStatus('error');
      setPlanPreviewError(`Failed to prepare Terraform plan: ${detail}`);
      setLogsPanelStatus('error');
      appendTerraformLogs(`[ERROR] Failed to prepare Terraform plan: ${detail}`);
      alert('Failed to prepare Terraform plan: ' + detail);
    } finally {
      setTerraformAction(null);
    }
  };

  const handlePlanPreviewClose = useCallback(() => {
    stopPlanStream();
    setPlanPreviewModalOpen(false);
  }, [stopPlanStream]);

  const applyInfrastructure = async (options?: { skipConfirm?: boolean; skipSave?: boolean; skipGenerate?: boolean }) => {
    if (!credentials) {
      alert('Please configure cloud credentials first!');
      setCredentialsModalOpen(true);
      return;
    }

    if (!options?.skipConfirm) {
      const confirmed = window.confirm(
        'Apply Terraform changes? This will create or modify real resources in your cloud account.'
      );
      if (!confirmed) return;
    }

    try {
      setTerraformAction('apply');
      if (!options?.skipSave) {
        await saveProject({ silent: true });
      }
      if (!options?.skipGenerate) {
        await apiClient.post(
          `/api/terraform/generate/${projectId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setDeployMode('deploy');
      setDeployLogs([]);
      setDeployStatus('running');
      setDeployLogsModalOpen(true);
      startDeployStream('deploy');
    } catch (error: any) {
      console.error('Failed to start Terraform apply:', error);
      alert('Failed to start Terraform apply: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTerraformAction(null);
    }
  };

  const destroyInfrastructure = async () => {
    if (!credentials) {
      alert('Please configure cloud credentials first!');
      setCredentialsModalOpen(true);
      return;
    }

    const confirmed = window.confirm(
      'Destroy Terraform-managed infrastructure? This will delete the resources that were previously created.'
    );

    if (!confirmed) return;

    try {
      setTerraformAction('destroy');
      await saveProject({ silent: true });
      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeployMode('destroy');
      setDeployLogs([]);
      setDeployStatus('running');
      setDeployLogsModalOpen(true);
      startDeployStream('destroy');
    } catch (error: any) {
      console.error('Failed to start Terraform destroy:', error);
      alert('Failed to start Terraform destroy: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTerraformAction(null);
    }
  };

  const validateTerraform = async () => {
    try {
      setTerraformAction('validate');

      // Open logs panel and set to running state
      setLogsPanelOpen(true);
      setLogsPanelOperation('validate');
      setLogsPanelStatus('running');
      setTerraformLogs([]);

      // Add initial log
      setTerraformLogs(prev => [...prev, '> Starting Terraform validation...', '']);

      await saveProject({ silent: true });
      setTerraformLogs(prev => [...prev, '✓ Project saved', '']);

      setTerraformLogs(prev => [...prev, '> Generating Terraform files...']);
      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTerraformLogs(prev => [...prev, '✓ Terraform files generated', '']);

      setTerraformLogs(prev => [...prev, '> Running terraform init...']);
      setTerraformLogs(prev => [...prev, '> Running terraform validate...']);

      const response = await apiClient.post(
        `/api/terraform/validate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add validation output to logs
      if (response.data.success && response.data.valid) {
        setLogsPanelStatus('success');
        setTerraformLogs(prev => [...prev, '', '✓ Validation completed successfully!']);
      } else {
        setLogsPanelStatus('error');
        setTerraformLogs(prev => [...prev, '', '✗ Validation failed']);
      }
    } catch (error: any) {
      console.error('Terraform validation failed:', error);
      setLogsPanelStatus('error');
      setTerraformLogs(prev => [...prev, '', '✗ Error: ' + (error.response?.data?.detail || error.message)]);

      if (error.response?.data?.error) {
        setTerraformLogs(prev => [...prev, '', error.response.data.error]);
      }

      alert('Terraform validation failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTerraformAction(null);
    }
  };

  const runTfsecScan = async () => {
    try {
      setTerraformAction('tfsec');
      setLogsPanelOpen(true);
      setLogsPanelOperation('tfsec');
      setLogsPanelStatus('running');
      setTerraformLogs([]);
      setTerraformLogs(prev => [...prev, '> Running Tfsec security scan...', '']);

      await saveProject({ silent: true });
      setTerraformLogs(prev => [...prev, '✓ Project saved', '']);

      const response = await apiClient.post(
        `/api/terraform/tfsec/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (response.data.has_issues) {
          setLogsPanelStatus('error');
          setTerraformLogs(prev => [...prev, '', `✗ Found ${response.data.issues_count} security issues`, '']);
        } else {
          setLogsPanelStatus('success');
          setTerraformLogs(prev => [...prev, '', '✓ No security issues found!']);
        }
        setTerraformLogs(prev => [...prev, JSON.stringify(response.data.scan_output, null, 2)]);
      }
    } catch (error: any) {
      console.error('Tfsec scan failed:', error);
      setLogsPanelStatus('error');
      setTerraformLogs(prev => [...prev, '', '✗ Error: ' + (error.response?.data?.detail || error.message)]);
    } finally {
      setTerraformAction(null);
    }
  };

  const runTerrascanScan = async () => {
    try {
      setTerraformAction('terrascan');
      setLogsPanelOpen(true);
      setLogsPanelOperation('terrascan');
      setLogsPanelStatus('running');
      setTerraformLogs([]);
      setTerraformLogs(prev => [...prev, '> Running Terrascan security scan...', '']);

      await saveProject({ silent: true });
      setTerraformLogs(prev => [...prev, '✓ Project saved', '']);

      const response = await apiClient.post(
        `/api/terraform/terrascan/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (response.data.has_issues) {
          setLogsPanelStatus('error');
          setTerraformLogs(prev => [...prev, '', `✗ Found ${response.data.issues_count} violations`, '']);
        } else {
          setLogsPanelStatus('success');
          setTerraformLogs(prev => [...prev, '', '✓ No violations found!']);
        }
        setTerraformLogs(prev => [...prev, JSON.stringify(response.data.scan_output, null, 2)]);
      }
    } catch (error: any) {
      console.error('Terrascan scan failed:', error);
      setLogsPanelStatus('error');
      setTerraformLogs(prev => [...prev, '', '✗ Error: ' + (error.response?.data?.detail || error.message)]);
    } finally {
      setTerraformAction(null);
    }
  };

  const runInfracostEstimate = async () => {
    try {
      setTerraformAction('infracost');
      setInfracostReportOpen(true);
      setInfracostStatus('running');
      setInfracostData(null);

      await saveProject({ silent: true});

      const response = await apiClient.post(
        `/api/terraform/infracost/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setInfracostStatus('success');
        setInfracostData(response.data.cost_output);
      } else {
        setInfracostStatus('error');
      }
    } catch (error: any) {
      console.error('Infracost estimation failed:', error);
      setInfracostStatus('error');
    } finally {
      setTerraformAction(null);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return matchesCategory;
    }

    const label = resource.label?.toLowerCase() ?? '';
    const type = resource.type?.toLowerCase() ?? '';
    const description = resource.description?.toLowerCase() ?? '';

    const matchesSearch =
      label.includes(search) ||
      type.includes(search) ||
      description.includes(search);

    return matchesCategory && matchesSearch;
  });

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ resource: CloudResource; x: number; y: number } | null>(null);

  const handleDragStart = useCallback(
    (event: React.DragEvent, _resourceType: string, resource: CloudResource) => {
      setDragPreview({ resource, x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
    if (dragPreview) {
      setDragPreview(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
    }
  }, [dragPreview]);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragPreview(null);
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragPreview(null);
      setIsDraggingOver(false);

      const resourceData = event.dataTransfer.getData('application/json');
      if (!resourceData) {
        return;
      }

      try {
        const resource = JSON.parse(resourceData) as CloudResource;
        
        if (!reactFlowInstance.current) {
          addNode(resource);
          return;
        }

        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const id = `${resource.type}_${Date.now()}`;
        
        let nodeType = 'default';
        let nodeStyle: Record<string, unknown> | undefined = {
          width: DEFAULT_RESOURCE_SIZE,
          height: DEFAULT_RESOURCE_SIZE,
        };
        let initialSize: number | { width: number; height: number } | undefined = DEFAULT_RESOURCE_SIZE;

        if (resource.isContainer) {
          nodeType = 'container';
          nodeStyle = { width: 480, height: 340 };
          initialSize = { width: 480, height: 340 };
        } else if (resource.type === 'aws_region' || resource.type === 'azure_resource_group' || resource.type === 'google_project') {
          nodeType = 'region';
          nodeStyle = { width: 560, height: 420 };
          initialSize = { width: 560, height: 420 };
        } else if (resource.type === 'aws_vpc' || resource.type === 'azurerm_virtual_network' || resource.type === 'google_compute_network') {
          nodeType = 'vpc';
          nodeStyle = { width: 480, height: 340 };
          initialSize = { width: 480, height: 340 };
        } else if (resource.type === 'aws_subnet' || resource.type === 'azurerm_subnet' || resource.type === 'google_compute_subnetwork') {
          nodeType = 'subnet';
          nodeStyle = { width: 360, height: 240 };
          initialSize = { width: 360, height: 240 };
        }

        const newNode: Node = {
          id,
          type: nodeType,
          position: {
            x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
          },
          data: {
            label: resource.label,
            resourceType: resource.type,
            resourceLabel: resource.label,
            config: {},
            icon: resolveResourceIcon(resource.type, resource.icon),
            category: resource.category,
            resourceDescription: resource.description,
            displayName: resource.label,
            size: initialSize,
            isContainer: resource.isContainer,
            isDataSource: resource.isDataSource,
          },
          style: nodeStyle,
          ...(nodeType !== 'default' && {
            extent: 'parent' as const,
            expandParent: true,
          }),
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNode(newNode);
        setPropertiesPanelOpen(true);
      } catch (err) {
        console.error('Failed to parse dropped resource:', err);
      }
    },
    [setNodes]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
                config: {
                  ...(node.data.config || {}),
                  ...(data.config || {}),
                },
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode) {
      return { incoming: [], outgoing: [] };
    }
    return {
      incoming: edges.filter((e) => e.target === selectedNode.id),
      outgoing: edges.filter((e) => e.source === selectedNode.id),
    };
  }, [selectedNode, edges]);

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance.current) {
      const currentZoom = reactFlowInstance.current.getZoom();
      reactFlowInstance.current.zoomTo(Math.min(currentZoom * 1.2, 1.75));
      setZoom(Math.round(Math.min(currentZoom * 1.2, 1.75) * 100));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance.current) {
      const currentZoom = reactFlowInstance.current.getZoom();
      reactFlowInstance.current.zoomTo(Math.max(currentZoom / 1.2, 0.25));
      setZoom(Math.round(Math.max(currentZoom / 1.2, 0.25) * 100));
    }
  }, []);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.1 });
      setZoom(Math.round(reactFlowInstance.current.getZoom() * 100));
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (cmdOrCtrl && event.key === 's') {
        event.preventDefault();
        saveProject();
      } else if (cmdOrCtrl && event.key === 'b') {
        event.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setSelectedNode(null);
        setPropertiesPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  const handleImportDiagram = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const parsedNodes = Array.isArray(parsed?.nodes)
        ? parsed.nodes
        : Array.isArray(parsed?.resources)
        ? parsed.resources.map((r: any) => {
            const resourceType = r.type || r.resourceType || r.data?.resourceType;
            const baseType =
              resourceType?.includes('vpc') ? 'vpc' :
              resourceType?.includes('subnet') ? 'subnet' :
              resourceType === 'aws_region' ? 'region' :
              'resource';
            return {
              id: r.id || r.node_id || r.config?.name || r.type || crypto.randomUUID(),
              type: baseType,
              position: {
                x: Number(r.position?.x) || 0,
                y: Number(r.position?.y) || 0,
              },
              data: {
                resourceType,
                resourceLabel: r.config?.name || r.label || r.id,
                resourceCategory: r.category,
                config: r.config || r.data?.config || {},
                displayName: r.config?.name || r.label || r.id,
              },
            };
          })
        : [];

      const parsedEdges = Array.isArray(parsed?.edges)
        ? parsed.edges
        : Array.isArray(parsed?.connections)
        ? parsed.connections.map((c: any, idx: number) => ({
            id: c.id || `edge-${idx}`,
            source: c.source || c.source_id,
            target: c.target || c.target_id,
            type: c.type || 'smoothstep',
          }))
        : [];

      const sanitizedNodes = parsedNodes
        .filter((n: any) => n?.id && n?.position)
        .map((n: any) => ({
          ...n,
          position: {
            x: Number(n.position?.x) || 0,
            y: Number(n.position?.y) || 0,
          },
          data: {
            resourceType: n.data?.resourceType,
            resourceLabel: n.data?.resourceLabel || n.id,
            resourceCategory: n.data?.resourceCategory,
            config: n.data?.config || {},
            displayName: n.data?.displayName || n.data?.resourceLabel || n.id,
          },
        }));

      const sanitizedEdges = parsedEdges
        .filter((e: any) => e?.source && e?.target)
        .map((e: any, idx: number) => ({
          id: e.id || `edge-${idx}`,
          source: e.source,
          target: e.target,
          type: e.type || 'smoothstep',
          markerEnd: e.markerEnd,
          style: e.style,
        }));

      if (sanitizedNodes.length === 0) {
        throw new Error('No nodes found in import file');
      }

      setNodes(sanitizedNodes);
      setEdges(decorateEdges(sanitizedEdges));
      await saveProject({ silent: true });
      alert(`Imported ${sanitizedNodes.length} node(s) and ${sanitizedEdges.length} edge(s).`);
    } catch (err) {
      console.error('Failed to import diagram', err);
      alert('Invalid import file. Please provide a JSON with "nodes"/"edges" or "resources"/"connections".');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Project not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Toolbar - Full Width */}
      <DesignerToolbar
        projectName={project.name}
        projectDescription={project.description}
        provider={project.cloud_provider}
        isSaving={saving}
        hasCredentials={!!credentials}
        showCode={showCodePanel}
        showMinimap={showMinimap}
        showAssistant={assistantOpen}
        terraformAction={terraformAction}
        zoom={zoom}
        onSave={() => saveProject()}
        onCredentials={() => setCredentialsModalOpen(true)}
        onToggleCode={() => setShowCodePanel((prev) => !prev)}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onToggleAssistant={() => setAssistantOpen((prev) => !prev)}
        onValidate={validateTerraform}
        onPlan={showPlanPreview}
        onApply={() => applyInfrastructure()}
        onDestroy={destroyInfrastructure}
        onTfsec={runTfsecScan}
        onTerrascan={runTerrascanScan}
        onInfracost={runInfracostEstimate}
        onExport={() => setExportModalOpen(true)}
        onDownload={generateAndDownloadTerraform}
        onImport={() => fileInputRef.current?.click()}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onDelete={handleDeleteSelected}
        onBack={() => navigate('/dashboard')}
      />

      {/* Main Content Row */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Resource Palette */}
        <ResourcePalette
          provider={project.cloud_provider}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onDragStart={handleDragStart}
          onResourceClick={addNode}
        />

        {/* Center - React Flow Canvas */}
        <div className="flex-1 min-h-0 flex">
          <div 
            className={`flex-1 min-h-0 transition-all duration-300 relative ${
              propertiesPanelOpen && selectedNode ? '' : 'flex-1'
            } ${isDraggingOver ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
          >
            <DesignerWithCodeView
              nodes={nodes}
              edges={edges}
              provider={provider}
              projectId={projectId!}
              showCode={showCodePanel}
              onShowCodeChange={setShowCodePanel}
              floatingToggle={false}
            >
              <ReactFlow
                defaultEdgeOptions={defaultEdgeOptions}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onNodeClick={(_, node) => {
                  setSelectedNode(node);
                  setPropertiesPanelOpen(true);
                }}
                onNodeDoubleClick={handleNodeDoubleClick}
                onNodeContextMenu={handleNodeContextMenu}
                onNodeDragStop={onNodeDragStop}
                onPaneClick={() => {
                  setSelectedNode(null);
                }}
                onInit={(instance) => {
                  reactFlowInstance.current = instance;
                  setZoom(Math.round(instance.getZoom() * 100));
                }}
                onMove={(_, viewport) => {
                  setZoom(Math.round(viewport.zoom * 100));
                }}
                nodeTypes={nodeTypes}
                snapToGrid
                snapGrid={[GRID_SIZE, GRID_SIZE]}
                minZoom={0.25}
                maxZoom={1.75}
                fitView
                deleteKeyCode="Backspace"
              >
                <Background gap={20} size={1} color="#e0e0e0" variant={BackgroundVariant.Dots} style={{ backgroundColor: '#ffffff' }} />
                <Controls showZoom={false} showFitView={false} />
                {showMinimap && <MiniMap />}
                
                {/* Node counter - Brainboard style */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs font-medium">
                  <span className="text-gray-500 dark:text-gray-400">Nodes:</span>
                  <span className="text-primary font-bold">{nodes.length}</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-gray-500 dark:text-gray-400">Edges:</span>
                  <span className="text-primary font-bold">{edges.length}</span>
                </div>
              </ReactFlow>
            </DesignerWithCodeView>
          </div>

          {/* Right Sidebar - Brainboard-style Panel */}
          <BrainboardRightPanel
            nodes={nodes}
            terraformFiles={terraformFiles}
            selectedNode={selectedNode}
            onNodeSelect={(nodeId) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (node) {
                setSelectedNode(node);
              }
            }}
            onUpdateNode={handleUpdateNode}
            configPanelOpen={configPanelOpen}
            onCloseConfigPanel={() => setConfigPanelOpen(false)}
          />

          {/* AI Assistant Panel */}
          {assistantOpen && (
            <AssistantChatPanel
              projectId={Number(projectId)}
              provider={project.cloud_provider}
              onImport={(diagram) => {
                const dn = Array.isArray(diagram?.nodes) ? diagram.nodes : [];
                const de = Array.isArray(diagram?.edges) ? diagram.edges : [];
                const byId: Record<string, boolean> = {};
                nodes.forEach((n) => (byId[n.id] = true));
                const mergedNodes = [...nodes, ...dn.filter((n: any) => !byId[n.id])];
                const byEdge: Record<string, boolean> = {};
                edges.forEach((e) => (byEdge[e.id] = true));
                const mergedEdges = [...edges, ...de.filter((e: any) => !byEdge[e.id])];
                setNodes(mergedNodes);
                setEdges(decorateEdges(mergedEdges));
                saveProject({ silent: true });
              }}
            />
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ResourceContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCloudConfig={handleContextMenuCloudConfig}
          onSwitchToData={() => {
            console.log('Switch to data - not implemented yet');
          }}
          onSwitchToContainer={() => {
            console.log('Switch to container - not implemented yet');
          }}
          onDelete={handleContextMenuDelete}
          onDuplicate={handleContextMenuDuplicate}
          onLock={() => {
            console.log('Lock - not implemented yet');
          }}
          onEditTitle={() => {
            console.log('Edit title - not implemented yet');
          }}
          onState={() => {
            console.log('State - not implemented yet');
          }}
          onEditTFFilename={() => {
            console.log('Edit TF filename - not implemented yet');
          }}
          onHighlightConnections={handleContextMenuHighlightConnections}
          onOmitFromCode={() => {
            console.log('Omit from code - not implemented yet');
          }}
        />
      )}

      {/* Modals */}
      <input
        type="file"
        accept="application/json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportDiagram}
      />

      {selectedNode && (
        <ResourceConfigModal
          resource={
            resources.find((r) => r.type === selectedNode.data.resourceType) || resources[0]
          }
          initialConfig={selectedNode.data.config || {}}
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setSelectedNode(null);
          }}
          onSave={handleConfigSave}
        />
      )}

      <CloudCredentialsModal
        cloudProvider={project.cloud_provider}
        isOpen={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        onSave={handleCredentialsSave}
        initialCredentials={credentials}
      />

      <DeploymentLogsModal
        isOpen={deployLogsModalOpen}
        onClose={() => {
          stopDeployStream();
          setDeployLogsModalOpen(false);
          setDeployStatus('idle');
          setDeployLogs([]);
        }}
        mode={deployMode}
        logs={deployLogs}
        status={deployStatus}
      />

      <PlanPreviewModal
        isOpen={planPreviewModalOpen}
        status={planPreviewStatus}
        hasChanges={planPreviewHasChanges}
        error={planPreviewError}
        content={planPreviewContent}
        onClose={handlePlanPreviewClose}
        onConfirmDeploy={async () => {
          handlePlanPreviewClose();
          await applyInfrastructure({ skipConfirm: true, skipSave: true, skipGenerate: true });
        }}
      />

      <ExportModal
        projectId={projectId!}
        projectName={project.name}
        nodes={nodes}
        edges={edges}
        cloudProvider={project.cloud_provider}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      {/* Validation results now shown only in logs panel */}

      {/* Terraform Logs Panel */}
      <TerraformLogsPanel
        isOpen={logsPanelOpen}
        onClose={() => setLogsPanelOpen(false)}
        logs={terraformLogs}
        operation={logsPanelOperation}
        status={logsPanelStatus}
      />

      {/* Infracost Report Panel */}
      <InfracostReportPanel
        isOpen={infracostReportOpen}
        onClose={() => {
          setInfracostReportOpen(false);
          setInfracostData(null);
          setInfracostStatus(null);
        }}
        data={infracostData}
        status={infracostStatus}
      />

      {/* Drag Preview Overlay */}
      {dragPreview && (
        <div
          className="fixed pointer-events-none z-[9999] flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-white dark:bg-gray-800 border-2 border-primary shadow-lg
                     transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
          }}
        >
          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-md">
            <span className="text-primary text-lg font-bold">+</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{dragPreview.resource.label}</p>
            <p className="text-xs text-muted-foreground">{dragPreview.resource.type}</p>
          </div>
        </div>
      )}
    </div>
  );
}
