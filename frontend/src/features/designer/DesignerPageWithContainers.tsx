import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import apiClient from '../../lib/api/client';
import {
  getResourcesByCategory,
  getResourceDefinition,
  canPlaceResourceIn,
  ResourceDefinition,
} from '../../lib/resources/resourceDefinitions';
import ContainerNode from '../../components/nodes/ContainerNode';
import ResourceNode from '../../components/nodes/ResourceNode';

// Register custom node types
const nodeTypes: NodeTypes = {
  container: ContainerNode,
  resource: ResourceNode,
};

interface Project {
  id: number;
  name: string;
  cloud_provider: string;
  description: string;
  diagram_data: any;
}

export default function DesignerPageWithContainers() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('container');

  const provider = (project?.cloud_provider as 'aws' | 'azure' | 'gcp') || 'aws';
  const resourcesByCategory = getResourcesByCategory(provider);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}`);
      setProject(response.data);

      // Load diagram data if exists
      if (response.data.diagram_data?.nodes) {
        setNodes(response.data.diagram_data.nodes);
        setEdges(response.data.diagram_data.edges || []);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
      alert('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (resource: ResourceDefinition) => {
    const nodeId = `node-${Date.now()}`;
    const isContainer = resource.isContainer;

    const newNode: Node = {
      id: nodeId,
      type: isContainer ? 'container' : 'resource',
      position: { x: 250, y: 100 },
      data: {
        label: resource.label,
        resourceType: resource.type,
        icon: resource.icon,
        config: {},
      },
      style: {
        width: isContainer ? 300 : 180,
        height: isContainer ? 200 : 'auto',
      },
      // Make containers able to have children
      ...(isContainer && {
        style: {
          ...{ width: 300, height: 200 },
          padding: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      }),
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      // Check if node was dropped on a container
      const containerNode = nodes.find(
        (n) =>
          n.id !== node.id &&
          n.type === 'container' &&
          node.position.x >= n.position.x &&
          node.position.x <= n.position.x + (n.style?.width as number || 300) &&
          node.position.y >= n.position.y &&
          node.position.y <= n.position.y + (n.style?.height as number || 200)
      );

      if (containerNode) {
        const canPlace = canPlaceResourceIn(
          node.data.resourceType,
          containerNode.data.resourceType
        );

        if (canPlace) {
          // Set parent relationship
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    parentNode: containerNode.id,
                    extent: 'parent' as const,
                    position: {
                      x: node.position.x - containerNode.position.x,
                      y: node.position.y - containerNode.position.y,
                    },
                  }
                : n
            )
          );
        } else {
          const resource = getResourceDefinition(node.data.resourceType);
          const container = getResourceDefinition(containerNode.data.resourceType);
          alert(
            `Cannot place ${resource?.label} inside ${container?.label}.\n\n` +
              (resource?.mustBeIn
                ? `${resource.label} must be placed in: ${resource.mustBeIn.join(', ')}`
                : '')
          );
        }
      }
    },
    [nodes, setNodes]
  );

  const saveProject = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/api/projects/${projectId}`, {
        diagram_data: { nodes, edges },
      });
      alert('Project saved successfully!');
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      alert('No nodes selected');
      return;
    }

    if (
      window.confirm(
        `Delete ${selectedNodes.length} selected node(s)? This action cannot be undone.`
      )
    ) {
      const selectedIds = new Set(selectedNodes.map((n) => n.id));
      setNodes((nds) => nds.filter((n) => !selectedIds.has(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target))
      );
    }
  }, [nodes, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
            <p className="text-sm text-gray-600">
              {project?.description} • {provider.toUpperCase()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Dashboard
            </button>
            <button
              onClick={deleteSelected}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              title="Delete selected nodes (Del key)"
            >
              🗑️ Delete
            </button>
            <button
              onClick={saveProject}
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : '💾 Save'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Resource Palette */}
        <aside className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-bold text-gray-900 mb-3 text-lg">Resources</h2>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(resourcesByCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {resourcesByCategory[category].length > 0 &&
                    ` (${resourcesByCategory[category].length})`}
                </button>
              ))}
            </div>

            {/* Resource List */}
            <div className="space-y-2">
              {resourcesByCategory[selectedCategory]?.map((resource) => (
                <button
                  key={resource.type}
                  onClick={() => addNode(resource)}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                    resource.isContainer
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: resource.color,
                  }}
                >
                  <span className="text-2xl">{resource.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                      {resource.label}
                      {resource.isContainer && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded font-semibold">
                          CONTAINER
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{resource.type}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Help Section */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">💡 Quick Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Containers have dashed borders</li>
                <li>• Drag resources into containers</li>
                <li>• Connect resources with edges</li>
                <li>• Click nodes to select</li>
                <li>• Del key to delete selected</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#3B82F6', strokeWidth: 2 },
            }}
          >
            <Background color="#E5E7EB" gap={15} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const resource = getResourceDefinition(node.data.resourceType);
                return resource?.color || '#3B82F6';
              }}
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-lg">
              <div className="text-sm space-y-1">
                <div className="font-bold text-gray-900 text-base mb-2">
                  {project?.cloud_provider.toUpperCase()} Designer
                </div>
                <div className="text-gray-600">
                  <strong>Nodes:</strong> {nodes.length}
                </div>
                <div className="text-gray-600">
                  <strong>Connections:</strong> {edges.length}
                </div>
                <div className="text-gray-600">
                  <strong>Containers:</strong>{' '}
                  {nodes.filter((n) => n.type === 'container').length}
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
