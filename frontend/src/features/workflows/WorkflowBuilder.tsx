import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronRight, Loader2, Plus, Zap } from 'lucide-react';
import { workflowApi, NodeType } from '../../lib/api/workflowClient';
import CustomWorkflowNode from './CustomWorkflowNode';
import NodeConfigDrawer from './NodeConfigDrawer';
import TaskPaletteDrawer from './TaskPaletteDrawer';
import { ConnectionDirection } from './types';
import { AnsiUp } from 'ansi_up';

const nodeTypes: NodeTypes = {
  workflowNode: CustomWorkflowNode,
};

const FINAL_RUN_STATUSES = ['success', 'failed', 'cancelled'];
const oppositeDirection: Record<ConnectionDirection, ConnectionDirection> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

const tryParseJson = (value: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed[0] !== '{' && trimmed[0] !== '[') return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

type PendingConnection = {
  sourceId?: string;
  direction?: ConnectionDirection;
} | null;

const WorkflowBuilder: React.FC<{ projectId?: number; workflowId?: number }> = (props) => {
  const navigate = useNavigate();
  const { projectId: routeProjectId, workflowId: routeWorkflowId } = useParams<{
    projectId: string;
    workflowId: string;
  }>();

  const projectId = props.projectId || parseInt(routeProjectId || '0', 10);
  const initialWorkflowId = props.workflowId || (routeWorkflowId ? parseInt(routeWorkflowId, 10) : undefined);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [availableNodeTypes, setNodeTypesAvailable] = useState<NodeType[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('New workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | undefined>(initialWorkflowId);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runStatus, setRunStatus] = useState<string>('idle');
  const logSourceRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const [logPanelHeight, setLogPanelHeight] = useState(300);
  const isResizingLogsRef = useRef(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('All changes saved');
  const workflowLoadedRef = useRef(false);
  const lastSavedSignatureRef = useRef<string>('');
  const ansiFormatter = useMemo(() => new AnsiUp(), []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const openConfigurationPanel = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const openTaskDrawer = useCallback((sourceId?: string, direction: ConnectionDirection = 'right') => {
    setPendingConnection(sourceId ? { sourceId, direction } : null);
    setTaskDrawerOpen(true);
  }, []);

  const closeTaskDrawer = useCallback(() => {
    setTaskDrawerOpen(false);
    setPendingConnection(null);
  }, []);

  const startResizeLogs = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isResizingLogsRef.current = true;
  }, []);

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId((prev) => (prev === nodeId ? null : prev));
    },
    [setEdges, setNodes]
  );

  const attachNodeInteractions = useCallback(
    (node: Node): Node => ({
      ...node,
      data: {
        ...node.data,
        onRequestAddTask: (direction?: ConnectionDirection) => openTaskDrawer(node.id, direction || 'right'),
        onRequestConfigure: () => openConfigurationPanel(node.id),
        onRequestDelete: () => onDeleteNode(node.id),
      },
    }),
    [openTaskDrawer, onDeleteNode, openConfigurationPanel]
  );

  const enhanceNodes = useCallback((rawNodes: Node[]) => rawNodes.map(attachNodeInteractions), [attachNodeInteractions]);

  const calculatePosition = useCallback(
    (currentNodes: Node[], connection?: PendingConnection): { x: number; y: number } => {
      if (connection?.sourceId) {
        const source = currentNodes.find((n) => n.id === connection.sourceId);
        if (source) {
          const gapX = 320;
          const gapY = 220;
          const direction = connection.direction || 'right';
          const siblingCount = edges.filter(
            (edge) => edge.source === connection.sourceId && (edge.data?.direction || 'right') === direction
          ).length;

          switch (direction) {
            case 'top':
              return { x: source.position.x, y: source.position.y - gapY };
            case 'bottom':
              return { x: source.position.x, y: source.position.y + gapY };
            case 'left':
              return { x: source.position.x - gapX, y: source.position.y + siblingCount * gapY };
            case 'right':
            default:
              return { x: source.position.x + gapX, y: source.position.y + siblingCount * gapY };
          }
        }
      }

      const col = currentNodes.length % 3;
      const row = Math.floor(currentNodes.length / 3);
      return { x: col * 260, y: row * 190 };
    },
    [edges]
  );

  const addNodeFromType = useCallback(
    (nodeType: NodeType, connection?: PendingConnection) => {
      const newNodeId = `node_${Date.now()}`;
      setNodes((nds) => {
        const newNode: Node = {
          id: newNodeId,
          type: 'workflowNode',
          position: calculatePosition(nds, connection),
          data: {
            label: nodeType.display_name,
            nodeType: nodeType.type_id,
            config: {},
          },
        };
        return [...nds, attachNodeInteractions(newNode)];
      });

      if (connection?.sourceId) {
        const direction = connection.direction || 'right';
        setEdges((eds) => [
          ...eds,
          {
            id: `edge_${Date.now()}`,
            source: connection.sourceId!,
            target: newNodeId,
            animated: true,
            sourceHandle: `source-${direction}`,
            targetHandle: `target-${oppositeDirection[direction]}`,
            data: { direction },
          },
        ]);
      }
    },
    [attachNodeInteractions, calculatePosition, setEdges, setNodes]
  );

  const handleTaskSelected = useCallback(
    (nodeType: NodeType) => {
      addNodeFromType(nodeType, pendingConnection);
      closeTaskDrawer();
    },
    [addNodeFromType, closeTaskDrawer, pendingConnection]
  );

  useEffect(() => {
    const loadNodeTypes = async () => {
      try {
        console.log('[WorkflowBuilder] Loading node types...');
        const { node_types } = await workflowApi.listNodeTypes();
        console.log('[WorkflowBuilder] Loaded node types:', node_types.length);
        setNodeTypesAvailable(node_types);
      } catch (error: any) {
        console.error('[WorkflowBuilder] Failed to load node types:', error);
        alert(`Failed to load node types: ${error.message}. The pipeline-api may not be running.`);
      }
    };
    loadNodeTypes();
  }, []);

  useEffect(() => {
    setCurrentWorkflowId(initialWorkflowId);
  }, [initialWorkflowId]);

  useEffect(() => {
    if (!currentWorkflowId) {
      setNodes([]);
      setEdges([]);
      workflowLoadedRef.current = true;
      lastSavedSignatureRef.current = JSON.stringify({ workflowName: 'New workflow', nodes: [], edges: [] });
      return;
    }

    const loadWorkflow = async () => {
      const workflow = await workflowApi.getWorkflow(currentWorkflowId);
      setWorkflowName(workflow.name);

      const flowNodes: Node[] = workflow.nodes.map((n) => ({
        id: n.node_id,
        type: 'workflowNode',
        position: { x: n.position_x, y: n.position_y },
        data: {
          label: n.label,
          nodeType: n.node_type,
          config: n.config,
        },
      }));

      const nodeLookup = Object.fromEntries(workflow.nodes.map((n) => [n.node_id, n]));
      const flowEdges: Edge[] = workflow.edges.map((e) => {
        const sourceNode = nodeLookup[e.source_node_id];
        const targetNode = nodeLookup[e.target_node_id];
        let direction: ConnectionDirection = 'right';
        if (sourceNode && targetNode) {
          const dx = targetNode.position_x - sourceNode.position_x;
          const dy = targetNode.position_y - sourceNode.position_y;
          if (Math.abs(dx) >= Math.abs(dy)) {
            direction = dx >= 0 ? 'right' : 'left';
          } else {
            direction = dy >= 0 ? 'bottom' : 'top';
          }
        }

        return {
          id: e.edge_id,
          source: e.source_node_id,
          target: e.target_node_id,
          label: e.label || undefined,
          animated: true,
          data: { direction },
          sourceHandle: `source-${direction}`,
          targetHandle: `target-${oppositeDirection[direction]}`,
        };
      });

      setNodes(enhanceNodes(flowNodes));
      setEdges(flowEdges);
      workflowLoadedRef.current = true;
      lastSavedSignatureRef.current = JSON.stringify({
        workflowName: workflow.name,
        nodes: workflow.nodes.map((n) => ({
          node_id: n.node_id,
          node_type: n.node_type,
          label: n.label,
          position_x: n.position_x,
          position_y: n.position_y,
          config: n.config || {},
        })),
        edges: workflow.edges.map((e) => ({
          edge_id: e.edge_id,
          source_node_id: e.source_node_id,
          target_node_id: e.target_node_id,
          label: e.label || undefined,
        })),
      });
      setAutoSaveMessage('All changes saved');
    };

    loadWorkflow();
  }, [currentWorkflowId, enhanceNodes, setEdges, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const direction =
        (params.sourceHandle?.replace('source-', '') as ConnectionDirection | undefined) ?? 'right';
      const targetHandle =
        params.targetHandle ?? `target-${oppositeDirection[direction]}`;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: params.source ? `${params.source}-${params.target}-${Date.now()}` : `edge_${Date.now()}`,
            animated: true,
            sourceHandle: params.sourceHandle ?? `source-${direction}`,
            targetHandle,
            data: { direction },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onUpdateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, any>, label?: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config,
                  label: label !== undefined ? label : node.data.label,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const onAutoLayout = useCallback(() => {
    setNodes((nds) =>
      nds.map((node, idx) => ({
        ...node,
        position: calculatePosition(nds.slice(0, idx), null),
      }))
    );
  }, [calculatePosition, setNodes]);

  const renderLogLine = useCallback(
    (line: string, index: number) => {
      const trimmed = line.trim();
      const nodeMatch = trimmed.match(/^\[Node\s+(\d+)\]\s*(.*)$/);
      const payload = nodeMatch ? nodeMatch[2] : trimmed;
      const jsonPayload = tryParseJson(payload);
      const tone = (() => {
        const lower = trimmed.toLowerCase();
        if (lower.includes('error')) return 'text-red-300';
        if (lower.includes('success')) return 'text-emerald-300';
        if (lower.startsWith('status') || lower.startsWith('run')) return 'text-sky-300';
        return 'text-gray-200';
      })();

      if (jsonPayload) {
        return (
          <div key={`log-${index}`} className={`py-1 text-xs ${tone}`}>
            {nodeMatch && (
              <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded-full bg-purple-500/20 text-purple-100 text-[10px]">
                Node {nodeMatch[1]}
              </span>
            )}
            <details className="inline-block cursor-pointer">
              <summary className="text-[11px] text-purple-200">JSON payload</summary>
              <pre className="mt-1 text-[11px] text-slate-200 bg-black/40 rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(jsonPayload, null, 2)}
              </pre>
            </details>
          </div>
        );
      }

      return (
        <div key={`log-${index}`} className={`py-0.5 whitespace-pre-wrap text-[11px] leading-snug ${tone}`}>
          {nodeMatch && (
            <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded-full bg-purple-500/20 text-purple-100 text-[10px]">
              Node {nodeMatch[1]}
            </span>
          )}
          <span dangerouslySetInnerHTML={{ __html: ansiFormatter.ansi_to_html(payload || '&nbsp;') }} />
        </div>
      );
    },
    [ansiFormatter]
  );

  const buildWorkflowPayload = useCallback(() => {
    const backendNodes = nodes.map((n) => ({
      node_id: n.id,
      node_type: n.data.nodeType,
      label: n.data.label,
      position_x: n.position.x,
      position_y: n.position.y,
      config: n.data.config || {},
    }));

    const backendEdges = edges.map((e) => ({
      edge_id: e.id,
      source_node_id: e.source,
      target_node_id: e.target,
      label: e.label as string | undefined,
    }));

    const signature = JSON.stringify({
      workflowName,
      nodes: backendNodes,
      edges: backendEdges,
    });

    return { backendNodes, backendEdges, signature };
  }, [edges, nodes, workflowName]);

  const persistWorkflow = useCallback(
    async ({ silent = false, nextSignature }: { silent?: boolean; nextSignature?: string } = {}) => {
      if (!projectId) {
        console.warn('Missing project id, skipping save.');
        return;
      }
      const { backendNodes, backendEdges, signature } = buildWorkflowPayload();
      const snapshotSignature = nextSignature ?? signature;

      if (!silent) {
        setIsSaving(true);
      }

      try {
        if (currentWorkflowId) {
          await workflowApi.updateWorkflow(currentWorkflowId, {
            name: workflowName,
            nodes: backendNodes,
            edges: backendEdges,
          });
        } else {
          const created = await workflowApi.createWorkflow({
            project_id: projectId,
            name: workflowName,
            nodes: backendNodes,
            edges: backendEdges,
          });
          setCurrentWorkflowId(created.id);
          navigate(`/projects/${projectId}/workflows/${created.id}`, { replace: true });
        }
        lastSavedSignatureRef.current = snapshotSignature;
        if (silent) {
          setAutoSaveMessage(`Saved automatically at ${new Date().toLocaleTimeString()}`);
        } else {
          alert('Workflow saved successfully!');
          setAutoSaveMessage('All changes saved');
        }
      } catch (error: any) {
        console.error('Failed to save workflow:', error);
        if (silent) {
          setAutoSaveMessage('Auto-save failed. Check logs.');
        } else {
          alert(`Failed to save workflow: ${error.response?.data?.detail || error.message}`);
        }
      } finally {
        if (!silent) {
          setIsSaving(false);
        }
      }
    },
    [buildWorkflowPayload, currentWorkflowId, navigate, projectId, workflowName]
  );

  const onSaveWorkflow = useCallback(() => {
    persistWorkflow();
  }, [persistWorkflow]);

  const autoSaveSignature = useMemo(() => buildWorkflowPayload().signature, [buildWorkflowPayload]);

  useEffect(() => {
    if (!workflowLoadedRef.current) {
      return;
    }
    if (autoSaveSignature === lastSavedSignatureRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      persistWorkflow({ silent: true, nextSignature: autoSaveSignature });
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [autoSaveSignature, persistWorkflow]);

  useEffect(() => {
    return () => {
      workflowLoadedRef.current = false;
    };
  }, []);

  const onValidateWorkflow = useCallback(async () => {
    if (!currentWorkflowId) {
      alert('Save the workflow before validating.');
      return;
    }

    try {
      const result = await workflowApi.validateWorkflow(currentWorkflowId);
      setValidationResult(result);
    } catch (error: any) {
      alert(`Validation error: ${error.message}`);
    }
  }, [currentWorkflowId]);

  const handleRunPipeline = useCallback(async () => {
    if (!currentWorkflowId) {
      alert('Please save the workflow first');
      return;
    }

    try {
      const response = await workflowApi.triggerWorkflowRun(currentWorkflowId, 1);

      setRunStatus(response.status);
      setRunLogs([`Workflow execution started (status: ${response.status})`]);
      setLogDrawerOpen(true);

      if (logSourceRef.current) {
        logSourceRef.current.close();
      }

      const source = workflowApi.streamWorkflowLogs(response.id);
      logSourceRef.current = source;

      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'status_update') {
            setRunStatus(payload.status);
            if (payload.message) {
              setRunLogs((prev) => [...prev, `Status: ${payload.status} — ${payload.message}`]);
            } else {
              setRunLogs((prev) => [...prev, `Status: ${payload.status}`]);
            }
            if (FINAL_RUN_STATUSES.includes(payload.status)) {
              source.close();
              logSourceRef.current = null;
            }
            return;
          }
          if (payload.type === 'node_log') {
            setRunLogs((prev) => [...prev, `[Node ${payload.node_execution_id}] ${payload.message}`]);
            return;
          }
          if (payload.type === 'node_status') {
            setRunLogs((prev) => [...prev, `[Node ${payload.node_execution_id}] status → ${payload.status}`]);
            return;
          }
          if (payload.type === 'connected') {
            setRunLogs((prev) => [...prev, 'Connected to log stream']);
            return;
          }
          if (payload.type === 'completed') {
            setRunStatus(payload.status ?? runStatus);
            setRunLogs((prev) => [...prev, `Run completed (${payload.status})`]);
            source.close();
            logSourceRef.current = null;
            return;
          }
        } catch {
          // not JSON, append raw line
        }
        setRunLogs((prev) => [...prev, event.data]);
      };

      source.onerror = () => {
        setRunLogs((prev) => [...prev, 'Log stream disconnected.']);
        source.close();
        logSourceRef.current = null;
      };
    } catch (error) {
      console.error('Failed to run workflow:', error);
      alert('Failed to start workflow execution. Check console for details.');
    }
  }, [currentWorkflowId, runStatus]);

  const handleCloseLogs = useCallback(() => {
    setLogDrawerOpen(false);
    if (logSourceRef.current) {
      logSourceRef.current.close();
      logSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (logSourceRef.current) {
        logSourceRef.current.close();
        logSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingLogsRef.current) return;
      const minHeight = 180;
      const maxHeight = Math.max(minHeight, window.innerHeight - 120);
      const desired = window.innerHeight - event.clientY;
      const clamped = Math.min(Math.max(desired, minHeight), maxHeight);
      setLogPanelHeight(clamped);
    };

    const stopResize = () => {
      isResizingLogsRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingLogsRef.current) return;
      const minHeight = 180;
      const maxHeight = Math.max(minHeight, window.innerHeight - 160);
      const proposed = window.innerHeight - event.clientY;
      const clamped = Math.min(Math.max(proposed, minHeight), maxHeight);
      setLogPanelHeight(clamped);
    };

    const stopResize = () => {
      isResizingLogsRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

  useEffect(() => {
    if (logDrawerOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logDrawerOpen, runLogs]);

  const layoutNodes = useMemo(() => nodes, [nodes]);

  const renderBlankState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.6;
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
      `}</style>
      <div className="relative inline-flex items-center gap-3 pointer-events-auto">
        <div className="relative" style={{ width: '80px', height: '80px' }}>
          <div 
            className="absolute left-1/2 top-1/2 animate-pulse-glow pointer-events-none"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.15) 40%, rgba(167, 139, 250, 0.05) 70%, transparent 100%)',
              filter: 'blur(8px)'
            }}>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.2 }}>
            <Zap size={36} className="text-purple-500" strokeWidth={2.5} />
          </div>
          <button
            onClick={() => openTaskDrawer()}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4), 0 2px 10px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 58, 237, 0.5), 0 3px 14px rgba(139, 92, 246, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.4), 0 2px 10px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.25)';
            }}
          >
            <div 
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
                filter: 'blur(12px)',
                transform: 'scale(1.5)',
                transition: 'opacity 0.3s ease'
              }}>
            </div>
            <Plus size={24} className="text-white relative z-10" strokeWidth={2.5} />
          </button>
        </div>
        <span 
          className="text-[15px] font-medium text-purple-600 hover:text-purple-700 transition-colors cursor-pointer select-none"
          onClick={() => openTaskDrawer()}>
          Start by adding a task
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f6f2ff]">
      <aside className="w-64 bg-white border-r border-purple-50 px-6 py-8 flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-500 font-semibold">CI/CD Engine</p>
          <div className="mt-5 space-y-2">
            <p className="text-[13px] text-gray-500">CI/CD Designer</p>
            <button className="w-full text-left px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold">
              {workflowName}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Pipelines</p>
          <button className="mt-3 w-full text-left px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-500" disabled>
            Coming soon
          </button>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Templates</p>
          <button className="mt-3 w-full text-left px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-500" disabled>
            Browse gallery
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-purple-50 px-10 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => navigate(`/projects/${projectId}/workflows`)} className="text-sm text-purple-600 font-medium">
                ← All workflows
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <span>All workflows</span>
                <ChevronRight size={14} />
                <span className="font-semibold text-gray-900">{workflowName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl border border-purple-100 text-gray-600 hover:bg-purple-50">
                Create template
              </button>
              <button className="px-4 py-2 rounded-xl bg-purple-600 text-white shadow hover:bg-purple-700" onClick={handleRunPipeline}>
                Run pipeline
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button onClick={onAutoLayout} className="px-4 py-2 rounded-xl border border-purple-100 text-gray-700 hover:bg-purple-50">
              Auto layout
            </button>
            <button
              onClick={onValidateWorkflow}
              className="px-4 py-2 rounded-xl border border-purple-100 text-gray-700 hover:bg-purple-50"
              disabled={!currentWorkflowId}
            >
              Validate
            </button>
            <button
              onClick={onSaveWorkflow}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white flex items-center gap-2 hover:bg-purple-700"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save workflow
            </button>
            <span className="text-xs text-gray-500">{autoSaveMessage}</span>
          </div>
        </div>

        <div className="flex-1 relative">
          {layoutNodes.length === 0 ? (
            <div className="h-full bg-gradient-to-b from-purple-50/40 to-white relative">{renderBlankState()}</div>
          ) : (
            <ReactFlow
              nodes={layoutNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#f7f4ff]"
            >
              <Background color="#e5dbff" gap={20} />
              {validationResult?.valid && (
                <Panel position="top-right" className="bg-white/90 rounded-xl shadow px-4 py-2 text-sm text-green-600">
                  Workflow validated
                </Panel>
              )}
            </ReactFlow>
          )}

          <button
            onClick={() => openTaskDrawer()}
            className="absolute bottom-8 right-8 bg-white border border-purple-100 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-purple-700"
          >
            <Plus size={18} /> Add task
          </button>
        </div>
      </div>

      <TaskPaletteDrawer open={taskDrawerOpen} nodeTypes={availableNodeTypes} onClose={closeTaskDrawer} onSelect={handleTaskSelected} />

      {selectedNode && (
        <NodeConfigDrawer node={selectedNode} nodeTypes={availableNodeTypes} onClose={() => setSelectedNodeId(null)} onSave={onUpdateNodeConfig} />
      )}

      {logDrawerOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 shadow-2xl z-50 flex flex-col"
          style={{ height: logPanelHeight }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Workflow run</p>
              <p className="text-xs text-gray-500">Status: {runStatus}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100"
                onClick={handleCloseLogs}
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="h-2 bg-gradient-to-r from-purple-200/60 via-purple-300/60 to-purple-200/60 cursor-ns-resize"
            onMouseDown={startResizeLogs}
          />
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto bg-gray-950 text-green-100 font-mono border-t border-gray-800 px-5 py-3 space-y-1"
          >
            {runLogs.map(renderLogLine)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
