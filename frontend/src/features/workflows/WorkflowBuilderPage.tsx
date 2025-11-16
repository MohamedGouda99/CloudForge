import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { workflowApi, Workflow } from '../../lib/api/workflowClient';
import { useParams } from 'react-router-dom';
import { Drawer } from '../../components/Drawer';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 80 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 200, height: 80 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  return nodes.map((node) => {
    const position = dagreGraph.node(node.id);
    return { ...node, position: { x: position.x, y: position.y } };
  });
};

const palette = [
  { type: 'terraform_validate', label: 'Terraform Validate' },
  { type: 'infracost', label: 'Cost estimation' },
  { type: 'tfsec', label: 'Tfsec' },
  { type: 'slack_notification', label: 'Slack Notification' },
];

export default function WorkflowBuilderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!projectId) return;
    workflowApi.list(Number(projectId)).then((items) => {
      if (items.length) {
        const wf = items[0];
        setWorkflow(wf);
        const flowNodes = wf.nodes.map((n) => ({
          id: n.node_id,
          data: { label: n.label, type: n.node_type },
          position: { x: n.position_x, y: n.position_y },
        }));
        const flowEdges = wf.edges.map((e) => ({
          id: e.edge_id,
          source: e.source_node_id,
          target: e.target_node_id,
        }));
        setNodes(getLayoutedElements(flowNodes, flowEdges));
        setEdges(flowEdges);
      }
    });
  }, [projectId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = (type: string, label: string) => {
    const id = `${type}-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: 0, y: nds.length * 100 },
        data: { label, type },
      },
    ]);
  };

  const saveWorkflow = async () => {
    if (!projectId) return;
    const payload = {
      project_id: Number(projectId),
      name: workflow?.name || 'Workflow',
      description: workflow?.description || '',
      nodes: nodes.map((n) => ({
        node_id: n.id,
        label: n.data?.label || '',
        node_type: n.data?.type || 'custom_script',
        config: {},
        position_x: n.position.x,
        position_y: n.position.y,
      })),
      edges: edges.map((e) => ({
        edge_id: e.id || `${e.source}-${e.target}`,
        source_node_id: e.source,
        target_node_id: e.target,
      })),
    };
    if (workflow) {
      const updated = await workflowApi.update(workflow.id, payload);
      setWorkflow(updated);
    } else {
      const created = await workflowApi.create(payload);
      setWorkflow(created);
    }
  };

  const runWorkflow = async () => {
    if (!workflow) return;
    await workflowApi.run(workflow.id);
  };

  const sidebar = useMemo(
    () => (
      <div className="w-64 border-r bg-white p-4 space-y-3">
        <div className="font-semibold text-gray-700">Nodes</div>
        {palette.map((item) => (
          <button
            key={item.type}
            className="w-full rounded border px-3 py-2 text-left hover:bg-gray-50"
            onClick={() => addNode(item.type, item.label)}
          >
            {item.label}
          </button>
        ))}
        <div className="space-y-2 pt-6">
          <button className="w-full bg-indigo-600 text-white rounded px-3 py-2" onClick={saveWorkflow}>
            Save Workflow
          </button>
          <button className="w-full bg-green-600 text-white rounded px-3 py-2" onClick={runWorkflow} disabled={!workflow}>
            Run Workflow
          </button>
        </div>
      </div>
    ),
    [addNode, runWorkflow, saveWorkflow, workflow],
  );

  return (
    <div className="flex h-screen">
      {sidebar}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          onNodeClick={(_, node) => setSelected(node)}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.data?.label || 'Node'}>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Type</div>
            <div className="font-medium">{selected?.data?.type}</div>
            <p className="text-xs text-gray-500">
              Extend this drawer to configure node-specific settings (Terraform path, Slack channel, etc.).
            </p>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
