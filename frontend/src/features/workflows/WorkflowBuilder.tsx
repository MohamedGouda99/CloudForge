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

const nodeTypes: NodeTypes = {
  workflowNode: CustomWorkflowNode,
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
  const workflowId = props.workflowId || (routeWorkflowId ? parseInt(routeWorkflowId, 10) : undefined);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [availableNodeTypes, setNodeTypesAvailable] = useState<NodeType[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection>(null);

  const nodesRef = useRef<Node[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const openConfigurationPanel = useCallback(
    (nodeId: string) => {
      const current = nodesRef.current.find((n) => n.id === nodeId);
      if (current) {
        setSelectedNode(current);
      }
    },
    []
  );

  const openTaskDrawer = useCallback((sourceId?: string, direction: ConnectionDirection = 'right') => {
    setPendingConnection(sourceId ? { sourceId, direction } : null);
    setTaskDrawerOpen(true);
  }, []);

  const closeTaskDrawer = useCallback(() => {
    setTaskDrawerOpen(false);
    setPendingConnection(null);
  }, []);

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [selectedNode, setEdges, setNodes]
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
          const gap = 260;
          switch (connection.direction) {
            case 'top':
              return { x: source.position.x, y: source.position.y - gap };
            case 'bottom':
              return { x: source.position.x, y: source.position.y + gap };
            case 'left':
              return { x: source.position.x - gap, y: source.position.y };
            case 'right':
            default:
              return { x: source.position.x + gap, y: source.position.y };
          }
        }
      }

      const col = currentNodes.length % 3;
      const row = Math.floor(currentNodes.length / 3);
      return { x: col * 260, y: row * 190 };
    },
    []
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
        setEdges((eds) => [
          ...eds,
          {
            id: `edge_${Date.now()}`,
            source: connection.sourceId!,
            target: newNodeId,
            animated: true,
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
      const { node_types } = await workflowApi.listNodeTypes();
      setNodeTypesAvailable(node_types);
    };
    loadNodeTypes();
  }, []);

  useEffect(() => {
    if (!workflowId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const loadWorkflow = async () => {
      const workflow = await workflowApi.getWorkflow(workflowId);
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

      const flowEdges: Edge[] = workflow.edges.map((e) => ({
        id: e.edge_id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.label || undefined,
        animated: true,
      }));

      setNodes(enhanceNodes(flowNodes));
      setEdges(flowEdges);
    };

    loadWorkflow();
  }, [enhanceNodes, setEdges, setNodes, workflowId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
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
                  ...(label && { label }),
                },
              }
            : node
        )
      );
      setSelectedNode(null);
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

  const onSaveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
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

      if (workflowId) {
        await workflowApi.updateWorkflow(workflowId, {
          name: workflowName,
          nodes: backendNodes,
          edges: backendEdges,
        });
      } else {
        await workflowApi.createWorkflow({
          project_id: projectId,
          name: workflowName,
          nodes: backendNodes,
          edges: backendEdges,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [edges, nodes, projectId, workflowId, workflowName]);

  const onValidateWorkflow = useCallback(async () => {
    if (!workflowId) {
      alert('Save the workflow before validating.');
      return;
    }

    try {
      const result = await workflowApi.validateWorkflow(workflowId);
      setValidationResult(result);
    } catch (error: any) {
      alert(`Validation error: ${error.message}`);
    }
  }, [workflowId]);

  const handleRunPipeline = useCallback(() => {
    alert('Pipeline execution will be available once this workflow is attached to a project pipeline.');
  }, []);

  const layoutNodes = useMemo(() => nodes, [nodes]);

  const renderBlankState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="flex items-center gap-3 bg-white/80 border border-purple-100 shadow-xl rounded-full px-6 py-3 pointer-events-auto">
        <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          <Zap size={18} />
        </span>
        <button onClick={() => openTaskDrawer()} className="text-sm font-semibold text-purple-700">
          Start by adding a task
        </button>
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
              disabled={!workflowId}
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
              onNodeClick={(_, node) => setSelectedNode(node)}
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
        <NodeConfigDrawer node={selectedNode} nodeTypes={availableNodeTypes} onClose={() => setSelectedNode(null)} onSave={onUpdateNodeConfig} onDelete={onDeleteNode} />
      )}
    </div>
  );
};

export default WorkflowBuilder;
