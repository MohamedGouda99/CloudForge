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
import TerraformLogsPanel from '../../components/TerraformLogsPanel';
import InfracostReportPanel from './InfracostReportPanel';
import ResourcePalette from '../../components/ResourcePalette';
import DesignerToolbar from '../../components/DesignerToolbar';
import InspectorPanel from '../../components/InspectorPanel';
import ResourceContextMenu from '../../components/ResourceContextMenu';
import ConfirmationModal from '../../components/ConfirmationModal';
import InputModal from '../../components/InputModal';
import { createNode, getNodeTypeConfig, NODE_CONFIG } from '../../lib/nodeFactory';

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
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default 288px (w-72)
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
  const [deployMode, setDeployMode] = useState<'plan' | 'validate' | 'apply' | 'destroy'>('apply');
  const [terraformAction, setTerraformAction] = useState<'download' | 'plan' | 'apply' | 'destroy' | 'validate' | 'tfsec' | 'terrascan' | 'infracost' | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'resources' | 'code' | 'issues' | 'deploy' | 'ai'>('resources');
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

  // Edit title modal state
  const [editTitleModal, setEditTitleModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    currentTitle: string;
  }>({ isOpen: false, nodeId: '', currentTitle: '' });

  // Right panel state (resizable and collapsible)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);

  // Credentials state
  const [credentials, setCredentials] = useState<any>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    actionType: 'apply' | 'destroy' | 'warning';
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    actionType: 'warning',
    onConfirm: () => {},
    isLoading: false,
  });
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialLoadRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef<string | null>(null);
  const deployHistoryLoadedRef = useRef(false);

  const provider = (project?.cloud_provider as CloudProvider) || 'aws';

  // Load deployment history from localStorage on mount
  useEffect(() => {
    if (!projectId || deployHistoryLoadedRef.current) return;

    try {
      const stored = localStorage.getItem(`deploy_history_${projectId}`);
      if (stored) {
        const history = JSON.parse(stored);
        if (history.status && history.status !== 'running') {
          setDeployStatus(history.status);
          setDeployMode(history.mode === 'deploy' ? 'apply' : (history.mode || 'apply'));
          setDeployLogs(history.logs || []);
        }
      }
      deployHistoryLoadedRef.current = true;
    } catch (e) {
      console.error('Failed to load deployment history:', e);
    }
  }, [projectId]);

  // Save deployment history to localStorage when it changes
  useEffect(() => {
    if (!projectId || deployStatus === 'idle' || deployStatus === 'running') return;

    try {
      const history = {
        status: deployStatus,
        mode: deployMode,
        logs: deployLogs.slice(-50), // Keep last 50 lines
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`deploy_history_${projectId}`, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save deployment history:', e);
    }
  }, [projectId, deployStatus, deployMode, deployLogs]);

  // Helper function to get region config from credentials for Terraform generation
  const getRegionConfig = useCallback(() => {
    // Try to get credentials from state or localStorage
    const creds = credentials || (() => {
      try {
        const stored = localStorage.getItem(`credentials_${provider}`);
        console.log('[DEBUG] getRegionConfig - falling back to localStorage:', stored);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

    console.log('[DEBUG] getRegionConfig - creds source:', credentials ? 'state' : 'localStorage');
    console.log('[DEBUG] getRegionConfig - creds.aws_endpoint_url:', creds?.aws_endpoint_url);

    if (!creds) return {};

    const config: Record<string, string> = {};

    if (provider === 'aws') {
      if (creds.aws_region) config.aws_region = creds.aws_region;
      if (creds.aws_endpoint_url) config.aws_endpoint_url = creds.aws_endpoint_url;
    } else if (provider === 'azure' && creds.azure_location) {
      config.azure_location = creds.azure_location;
    } else if (provider === 'gcp') {
      if (creds.gcp_region) config.gcp_region = creds.gcp_region;
      if (creds.gcp_project_id) config.gcp_project = creds.gcp_project_id;
    }

    console.log('[DEBUG] getRegionConfig - returning config:', JSON.stringify(config));
    return config;
  }, [credentials, provider]);

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

  // Terminate running Terraform process on the backend
  const terminateTerraform = useCallback(async () => {
    if (!projectId || !token) return;

    try {
      appendDeployLogs('[INFO] Terminating Terraform process...');
      appendTerraformLogs('[INFO] Terminating Terraform process...', { includePreview: false });

      const response = await apiClient.post(
        `/api/terraform/terminate/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        appendDeployLogs('[INFO] ' + response.data.message);
        appendTerraformLogs('[INFO] ' + response.data.message, { includePreview: false });
        // Close the event source
        stopDeployStream();
        setDeployStatus('error');
        setLogsPanelStatus('error');
      } else {
        appendDeployLogs('[WARNING] ' + response.data.message);
        appendTerraformLogs('[WARNING] ' + response.data.message, { includePreview: false });
      }
    } catch (error: any) {
      console.error('Failed to terminate Terraform process:', error);
      appendDeployLogs('[ERROR] Failed to terminate process: ' + (error.message || 'Unknown error'));
      appendTerraformLogs('[ERROR] Failed to terminate process: ' + (error.message || 'Unknown error'), { includePreview: false });
    }
  }, [projectId, token, appendDeployLogs, appendTerraformLogs, stopDeployStream]);

  const startPlanStream = useCallback(() => {
    if (!projectId || !project) {
      appendDeployLogs('[ERROR] Missing project context for terraform plan.');
      setDeployStatus('error');
      return;
    }

    if (!credentials) {
      appendDeployLogs('[ERROR] Cloud credentials are required to run terraform plan.');
      setDeployStatus('error');
      return;
    }

    if (!token) {
      appendDeployLogs('[ERROR] Authentication token missing for terraform plan.');
      setDeployStatus('error');
      return;
    }

    // DEBUG: Log credentials being used for plan
    console.log('[DEBUG] startPlanStream - credentials:', JSON.stringify(credentials, null, 2));
    console.log('[DEBUG] startPlanStream - aws_endpoint_url:', credentials.aws_endpoint_url);

    const credsQuery = buildCredentialsQuery(project.cloud_provider as CloudProvider, credentials);
    console.log('[DEBUG] startPlanStream - credsQuery:', credsQuery);
    if (!credsQuery) {
      appendDeployLogs('[ERROR] Credentials are incomplete for the selected provider.');
      setDeployStatus('error');
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

        // Update deploy status based on plan result
        setDeployStatus(isSuccess ? 'success' : 'error');

        appendDeployLogs(
          isSuccess
            ? hasChangesFlag
              ? '\n✓ Terraform plan completed with changes.'
              : '\n✓ Terraform plan completed. No changes detected.'
            : '\n✗ Terraform plan failed.'
        );
        return;
      }

      // Append plan output to deploy logs
      appendDeployLogs(data);
    };

    eventSource.onerror = (error) => {
      console.error('Terraform plan stream error:', error);
      appendDeployLogs('[ERROR] Connection to terraform plan stream lost.');
      setDeployStatus('error');
      stopPlanStream();
    };
  }, [appendDeployLogs, credentials, project, projectId, stopPlanStream, token]);

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
      // Deploy logs are now shown only in Deploy tab of Inspector panel
      // No need to open TerraformLogsPanel for apply/destroy

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
          // Add completion message to deploy logs for Deploy tab
          appendDeployLogs(
            finalStatus === 'error'
              ? mode === 'deploy'
                ? '[ERROR] Terraform apply failed.'
                : '[ERROR] Terraform destroy failed.'
              : mode === 'deploy'
                ? '[OK] Terraform apply completed.'
                : '[OK] Terraform destroy completed.'
          );
          return;
        }

        if (data.startsWith('ERROR:')) {
          encounteredError = true;
          setDeployStatus('error');
        }

        // Stream logs to Deploy tab only
        appendDeployLogs(data);
      };

      eventSource.onerror = (error) => {
        console.error('Terraform deploy stream error:', error);
        appendDeployLogs('[ERROR] Connection to terraform deploy stream lost.');
        encounteredError = true;
        setDeployStatus('error');
        stopDeployStream();
      };
    },
    [
      appendDeployLogs,
      credentials,
      project,
      projectId,
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
      console.log('[DEBUG] Loading credentials from localStorage:', storageKey, savedCreds);
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        console.log('[DEBUG] Parsed credentials - aws_endpoint_url:', parsed.aws_endpoint_url);
        setCredentials(parsed);
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

      // Fetch existing Terraform files for this project
      try {
        const filesResponse = await apiClient.get(
          `/api/terraform/files/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (filesResponse.data && Object.keys(filesResponse.data).length > 0) {
          setTerraformFiles(filesResponse.data);
        }
      } catch (tfError) {
        // Terraform files might not exist yet, that's okay
        console.log('No existing Terraform files found');
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
      // Resource nodes get high z-index (100) so they render on top of containers
      let nodeType = 'default';
      let nodeStyle: Record<string, unknown> | undefined = {
        width: DEFAULT_RESOURCE_SIZE,
        height: DEFAULT_RESOURCE_SIZE,
        zIndex: 100,
      };
      let initialSize: number | { width: number; height: number } | undefined = DEFAULT_RESOURCE_SIZE;

      // Check if resource is marked as a container
      // Container nodes get lower z-index so resource nodes render on top
      if (resource.isContainer) {
        nodeType = 'container';
        nodeStyle = { width: 480, height: 340, zIndex: 0 };
        initialSize = { width: 480, height: 340 };
      } else if (resource.type === 'aws_region' || resource.type === 'azure_resource_group' || resource.type === 'google_project') {
        nodeType = 'region';
        nodeStyle = { width: 560, height: 420, zIndex: 0 };
        initialSize = { width: 560, height: 420 };
      } else if (resource.type === 'aws_availability_zone') {
        nodeType = 'availability_zone';
        nodeStyle = { width: 420, height: 300, zIndex: 1 };
        initialSize = { width: 420, height: 300 };
      } else if (resource.type === 'aws_vpc' || resource.type === 'azurerm_virtual_network' || resource.type === 'google_compute_network') {
        nodeType = 'vpc';
        nodeStyle = { width: 480, height: 340, zIndex: 0 };
        initialSize = { width: 480, height: 340 };
      } else if (resource.type === 'aws_subnet' || resource.type === 'azurerm_subnet' || resource.type === 'google_compute_subnetwork') {
        nodeType = 'subnet';
        nodeStyle = { width: 360, height: 240, zIndex: 1 };
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
    if (contextMenu) {
      const node = nodes.find((n) => n.id === contextMenu.nodeId);
      if (node) {
        setSelectedNode(node);
        setConfigPanelOpen(true);
      }
    }
  }, [contextMenu, nodes]);

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

  const handleContextMenuLock = useCallback(() => {
    if (contextMenu) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === contextMenu.nodeId) {
            const isCurrentlyLocked = (n.data as any).isLocked || false;
            return {
              ...n,
              draggable: isCurrentlyLocked, // Toggle draggable (opposite of locked)
              data: {
                ...n.data,
                isLocked: !isCurrentlyLocked,
              },
            };
          }
          return n;
        })
      );
    }
  }, [contextMenu, setNodes]);

  const handleContextMenuEditTitle = useCallback(() => {
    if (contextMenu) {
      const node = nodes.find((n) => n.id === contextMenu.nodeId);
      if (node) {
        const currentTitle = (node.data as any).displayName || (node.data as any).resourceLabel || '';
        setEditTitleModal({
          isOpen: true,
          nodeId: contextMenu.nodeId,
          currentTitle,
        });
      }
    }
  }, [contextMenu, nodes]);

  const handleEditTitleConfirm = useCallback((newTitle: string) => {
    if (editTitleModal.nodeId) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === editTitleModal.nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                displayName: newTitle,
              },
            };
          }
          return n;
        })
      );
    }
  }, [editTitleModal.nodeId, setNodes]);

  const handleContextMenuOmitFromCode = useCallback(() => {
    if (contextMenu) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === contextMenu.nodeId) {
            const isCurrentlyOmitted = (n.data as any).omitFromCode || false;
            return {
              ...n,
              data: {
                ...n.data,
                omitFromCode: !isCurrentlyOmitted,
              },
              style: {
                ...n.style,
                opacity: isCurrentlyOmitted ? 1 : 0.5, // Dim if omitted
              },
            };
          }
          return n;
        })
      );
    }
  }, [contextMenu, setNodes]);

  // Handle node drag to support nesting + snap to grid on release
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node, nodes) => {
      // Snap position to grid for clean alignment
      const snappedX = Math.round(node.position.x / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(node.position.y / GRID_SIZE) * GRID_SIZE;

      // Find if the node was dropped inside a container
      const containerTypes = ['region', 'vpc', 'subnet'];

      // Get all container nodes
      const containers = nodes.filter(n => containerTypes.includes(n.type || ''));

      // Check if node is inside any container
      for (const container of containers) {
        if (container.id === node.id) continue; // Skip self

        const nodeX = snappedX;
        const nodeY = snappedY;
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
          // Set the node's parent with snapped position
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  parentNode: container.id,
                  extent: 'parent' as const,
                  // Adjust position to be relative to parent (snapped)
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

      // If not in any container, snap position and remove parent if it had one
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            if (node.parentNode) {
              const { parentNode, extent, ...rest } = n;
              return {
                ...rest,
                position: { x: snappedX, y: snappedY },
              };
            }
            return {
              ...n,
              position: { x: snappedX, y: snappedY },
            };
          }
          return n;
        })
      );
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

  const handleCredentialsSave = async (creds: any) => {
    // DEBUG: Log what credentials are being saved
    console.log('[DEBUG] handleCredentialsSave - creds received:', JSON.stringify(creds, null, 2));
    console.log('[DEBUG] handleCredentialsSave - aws_endpoint_url:', creds.aws_endpoint_url);

    // Update credentials in state and localStorage
    setCredentials(creds);
    localStorage.setItem(`credentials_${provider}`, JSON.stringify(creds));
    setCredentialsModalOpen(false);

    // Build region config from the new credentials IMMEDIATELY
    const regionConfig: Record<string, string> = {};
    if (provider === 'aws') {
      if (creds.aws_region) regionConfig.aws_region = creds.aws_region;
      if (creds.aws_endpoint_url) regionConfig.aws_endpoint_url = creds.aws_endpoint_url;
    } else if (provider === 'azure' && creds.azure_location) {
      regionConfig.azure_location = creds.azure_location;
    } else if (provider === 'gcp') {
      if (creds.gcp_region) regionConfig.gcp_region = creds.gcp_region;
      if (creds.gcp_project_id) regionConfig.gcp_project = creds.gcp_project_id;
    }

    // Regenerate Terraform code with the new credentials/region
    if (projectId && nodes.length > 0) {
      // Cancel any pending autosave to avoid race conditions
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      // Wait for any in-progress save to complete
      while (isSavingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        // Save project and regenerate Terraform with the NEW region config
        // Pass regionConfig directly to avoid stale state issues
        await saveProject({ silent: true, regionConfig });
      } catch (error) {
        console.error('Failed to regenerate Terraform with new credentials:', error);
      }
    }
  };

  const saveProject = useCallback(
    async (options?: { silent?: boolean; regionConfig?: Record<string, string>; skipTerraformGeneration?: boolean }) => {
      if (isSavingRef.current) return;

      const diagramData = JSON.parse(
        JSON.stringify({
          nodes: nodes.map(sanitizeNodeForSave),
          edges: edges.map(sanitizeEdgeForSave),
        })
      );

      const dataStr = JSON.stringify(diagramData);
      // Don't skip if regionConfig is provided - we need to regenerate Terraform with new region
      const hasRegionConfigUpdate = options?.regionConfig && Object.keys(options.regionConfig).length > 0;
      if (options?.silent && lastSavedDataRef.current === dataStr && !hasRegionConfigUpdate) {
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

        // Auto-generate Terraform in real-time after saving (unless skipped)
        if (nodes.length > 0 && !options?.skipTerraformGeneration) {
          try {
            // Use provided regionConfig or fall back to getRegionConfig()
            const regionToUse = options?.regionConfig ?? getRegionConfig();

            await apiClient.post(
              `/api/terraform/generate/${projectId}`,
              regionToUse,
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
        getRegionConfig(),
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

      // Switch to Deploy tab and show logs instead of modal
      setDeployMode('plan');
      setDeployLogs(['Starting terraform plan...', '']);
      setDeployStatus('running');
      setInspectorTab('deploy');
      setRightPanelCollapsed(false);

      await saveProject({ silent: true });
      setDeployLogs(prev => [...prev, '✓ Project saved', '']);

      // DEBUG: Log what region config is being sent for terraform generation
      const regionConfigForGenerate = getRegionConfig();
      console.log('[DEBUG] showPlanPreview - regionConfig for generate:', JSON.stringify(regionConfigForGenerate));

      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        regionConfigForGenerate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeployLogs(prev => [...prev, '✓ Terraform code generated', '', '=== Running terraform plan ===', '']);

      startPlanStream();
    } catch (error: any) {
      console.error('Failed to prepare plan preview:', error);
      const detail = error.response?.data?.detail || error.message || 'Unknown error';
      setDeployStatus('error');
      setDeployLogs(prev => [...prev, '', '✗ Failed to prepare Terraform plan:', detail]);
    } finally {
      setTerraformAction(null);
    }
  };

  const handlePlanPreviewClose = useCallback(() => {
    stopPlanStream();
    setPlanPreviewModalOpen(false);
  }, [stopPlanStream]);

  const executeApply = async (options?: { skipSave?: boolean; skipGenerate?: boolean }) => {
    try {
      setTerraformAction('apply');
      if (!options?.skipSave) {
        await saveProject({ silent: true });
      }
      if (!options?.skipGenerate) {
        await apiClient.post(
          `/api/terraform/generate/${projectId}`,
          getRegionConfig(),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setDeployMode('apply');
      setDeployLogs([]);
      setDeployStatus('running');
      // Logs now shown only in Deploy tab of Inspector panel
      startDeployStream('deploy');
    } catch (error: any) {
      console.error('Failed to start Terraform apply:', error);
      alert('Failed to start Terraform apply: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTerraformAction(null);
    }
  };

  const applyInfrastructure = async (options?: { skipConfirm?: boolean; skipSave?: boolean; skipGenerate?: boolean }) => {
    if (!credentials) {
      alert('Please configure cloud credentials first!');
      setCredentialsModalOpen(true);
      return;
    }

    if (!options?.skipConfirm) {
      setConfirmModal({
        isOpen: true,
        title: 'Apply Infrastructure',
        message: 'This will create or modify real resources in your cloud account. Are you sure you want to proceed?',
        confirmText: 'Apply',
        actionType: 'apply',
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          executeApply({ skipSave: options?.skipSave, skipGenerate: options?.skipGenerate });
        },
        isLoading: false,
      });
      return;
    }

    await executeApply({ skipSave: options?.skipSave, skipGenerate: options?.skipGenerate });
  };

  const executeDestroy = async () => {
    try {
      setTerraformAction('destroy');
      await saveProject({ silent: true });
      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        getRegionConfig(),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeployMode('destroy');
      setDeployLogs([]);
      setDeployStatus('running');
      // Logs now shown only in Deploy tab of Inspector panel
      startDeployStream('destroy');
    } catch (error: any) {
      console.error('Failed to start Terraform destroy:', error);
      alert('Failed to start Terraform destroy: ' + (error.response?.data?.detail || error.message));
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

    setConfirmModal({
      isOpen: true,
      title: 'Destroy Infrastructure',
      message: 'This will permanently delete all Terraform-managed resources. This action cannot be undone. Are you sure?',
      confirmText: 'Destroy',
      actionType: 'destroy',
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        executeDestroy();
      },
      isLoading: false,
    });
  };

  const validateTerraform = async () => {
    try {
      setTerraformAction('validate');

      // Switch to Deploy tab and show logs
      setDeployMode('validate');
      setDeployLogs(['Starting terraform validate...', '']);
      setDeployStatus('running');
      setInspectorTab('deploy');
      setRightPanelCollapsed(false);

      // Save and generate first
      await saveProject({ silent: true });
      setDeployLogs(prev => [...prev, '✓ Project saved', '']);

      await apiClient.post(
        `/api/terraform/generate/${projectId}`,
        getRegionConfig(),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeployLogs(prev => [...prev, '✓ Terraform code generated', '', 'Running terraform validate...', '']);

      // Run validation
      const response = await apiClient.post(
        `/api/terraform/validate/${projectId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show result in Deploy tab
      if (response.data.success && response.data.valid) {
        setDeployStatus('success');
        setDeployLogs(prev => [...prev, '', '✓ Terraform validation successful!', 'Your configuration is valid.']);
      } else {
        setDeployStatus('error');
        const errorOutput = response.data.error || response.data.output || 'Validation failed';
        setDeployLogs(prev => [...prev, '', '✗ Terraform validation failed', '', errorOutput]);
      }
    } catch (error: any) {
      console.error('Terraform validation failed:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      const errorDetails = error.response?.data?.error || '';
      setDeployStatus('error');
      setDeployLogs(prev => [...prev, '', '✗ Terraform validation failed:', errorMessage, errorDetails].filter(Boolean));
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

        // Resource nodes get high z-index (100) so they render on top of containers
        let nodeType = 'default';
        let nodeStyle: Record<string, unknown> | undefined = {
          width: DEFAULT_RESOURCE_SIZE,
          height: DEFAULT_RESOURCE_SIZE,
          zIndex: 100,
        };
        let initialSize: number | { width: number; height: number } | undefined = DEFAULT_RESOURCE_SIZE;

        // Container nodes get lower z-index so resource nodes render on top
        if (resource.isContainer) {
          nodeType = 'container';
          nodeStyle = { width: 480, height: 340, zIndex: 0 };
          initialSize = { width: 480, height: 340 };
        } else if (resource.type === 'aws_region' || resource.type === 'azure_resource_group' || resource.type === 'google_project') {
          nodeType = 'region';
          nodeStyle = { width: 560, height: 420, zIndex: 0 };
          initialSize = { width: 560, height: 420 };
        } else if (resource.type === 'aws_availability_zone') {
          nodeType = 'availability_zone';
          nodeStyle = { width: 420, height: 300, zIndex: 1 };
          initialSize = { width: 420, height: 300 };
        } else if (resource.type === 'aws_vpc' || resource.type === 'azurerm_virtual_network' || resource.type === 'google_compute_network') {
          nodeType = 'vpc';
          nodeStyle = { width: 480, height: 340, zIndex: 0 };
          initialSize = { width: 480, height: 340 };
        } else if (resource.type === 'aws_subnet' || resource.type === 'azurerm_subnet' || resource.type === 'google_compute_subnetwork') {
          nodeType = 'subnet';
          nodeStyle = { width: 360, height: 240, zIndex: 1 };
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
        showAssistant={inspectorTab === 'ai'}
        terraformAction={terraformAction}
        zoom={zoom}
        onSave={() => saveProject()}
        onCredentials={() => setCredentialsModalOpen(true)}
        onToggleCode={() => setShowCodePanel((prev) => !prev)}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onOpenAssistant={() => {
          setInspectorTab('ai');
          setRightPanelCollapsed(false);
        }}
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
          panelWidth={sidebarWidth}
          onWidthChange={setSidebarWidth}
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
                snapToGrid={false}
                minZoom={0.25}
                maxZoom={1.75}
                fitView
                deleteKeyCode="Backspace"
                // Performance optimizations - critical for smooth drag
                elevateNodesOnSelect={false}
                selectNodesOnDrag={false}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                autoPanOnNodeDrag={true}
                zoomOnScroll={true}
                panOnDrag={true}
                // Disable attribution for cleaner UI
                proOptions={{ hideAttribution: true }}
              >
                <Background gap={20} size={1} color="#e0e0e0" variant={BackgroundVariant.Dots} style={{ backgroundColor: '#ffffff' }} />
                <Controls showZoom={false} showFitView={false} />
                {showMinimap && <MiniMap />}
                
                {/* Node counter */}
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

          {/* Right Sidebar - Inspector Panel */}
          <InspectorPanel
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
            isCollapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            panelWidth={rightPanelWidth}
            onWidthChange={setRightPanelWidth}
            deployStatus={deployStatus}
            deployMode={deployMode}
            deployLogs={deployLogs}
            provider={project.cloud_provider}
            edges={edges}
            onImportResources={(resources, connections) => {
              // Convert AI resources to nodes
              const newNodes = resources.map((res: any, idx: number) => ({
                id: `ai_${res.name || res.type}_${Date.now()}_${idx}`,
                type: 'resourceNode',
                position: { x: 200 + idx * 200, y: 200 + Math.floor(idx / 3) * 150 },
                data: {
                  label: res.name || res.type,
                  displayName: res.name || res.type,
                  resourceType: res.type,
                  resourceLabel: res.name || res.type,
                  config: res.config || {},
                },
              }));

              // Merge with existing nodes
              const byId: Record<string, boolean> = {};
              nodes.forEach((n) => (byId[n.id] = true));
              const mergedNodes = [...nodes, ...newNodes.filter((n: any) => !byId[n.id])];
              setNodes(mergedNodes);

              // Handle connections if provided
              if (connections && connections.length > 0) {
                const newEdges = connections.map((conn: any, idx: number) => ({
                  id: `ai_edge_${Date.now()}_${idx}`,
                  source: conn.from,
                  target: conn.to,
                  type: 'smoothstep',
                }));
                const byEdge: Record<string, boolean> = {};
                edges.forEach((e) => (byEdge[e.id] = true));
                const mergedEdges = [...edges, ...decorateEdges(newEdges.filter((e: any) => !byEdge[e.id]))];
                setEdges(mergedEdges);
              }

              saveProject({ silent: true });
            }}
            activeTab={inspectorTab}
            onTabChange={setInspectorTab}
          />

        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (() => {
        const contextNode = nodes.find((n) => n.id === contextMenu.nodeId);
        return (
        <ResourceContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isLocked={(contextNode?.data as any)?.isLocked || false}
          isOmitted={(contextNode?.data as any)?.omitFromCode || false}
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
          onLock={handleContextMenuLock}
          onEditTitle={handleContextMenuEditTitle}
          onState={() => {
            // State management (import/export terraform state) - advanced feature
            console.log('State management - coming soon');
          }}
          onEditTFFilename={() => {
            // Edit terraform filename - advanced feature
            console.log('Edit TF filename - coming soon');
          }}
          onHighlightConnections={handleContextMenuHighlightConnections}
          onOmitFromCode={handleContextMenuOmitFromCode}
        />
        );
      })()}

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
          // Don't reset deployStatus and deployLogs - preserve for Deploy tab history
        }}
        mode={deployMode}
        logs={deployLogs}
        status={deployStatus}
        onTerminate={terminateTerraform}
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

      {/* Edit Title Modal */}
      <InputModal
        isOpen={editTitleModal.isOpen}
        onClose={() => setEditTitleModal({ isOpen: false, nodeId: '', currentTitle: '' })}
        onConfirm={handleEditTitleConfirm}
        title="Edit Resource Title"
        label="Resource Title"
        placeholder="Enter resource title..."
        defaultValue={editTitleModal.currentTitle}
        confirmText="Save"
        cancelText="Cancel"
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        actionType={confirmModal.actionType}
        isLoading={confirmModal.isLoading}
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
