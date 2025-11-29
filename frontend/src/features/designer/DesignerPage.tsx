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
} from 'reactflow';
import 'reactflow/dist/style.css';
import apiClient from '../../lib/api/client';

// AWS Resource Types
const AWS_RESOURCES = [
  { type: 'aws_instance', label: 'EC2 Instance', icon: '🖥️' },
  { type: 'aws_s3_bucket', label: 'S3 Bucket', icon: '🪣' },
  { type: 'aws_rds_instance', label: 'RDS Instance', icon: '🗄️' },
  { type: 'aws_vpc', label: 'VPC', icon: '🌐' },
  { type: 'aws_lambda_function', label: 'Lambda', icon: '⚡' },
];

interface Project {
  id: number;
  name: string;
  cloud_provider: string;
  description: string;
  diagram_data: any;
}

export default function DesignerPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const addNode = (resourceType: string, label: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: 250, y: 100 },
      data: {
        label: `${label}\n(${resourceType})`,
        resourceType,
      },
      style: {
        background: '#fff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

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

  const generateTerraform = async () => {
    if (nodes.length === 0) {
      alert('Please add some resources before generating Terraform code');
      return;
    }

    setGenerating(true);
    try {
      // First save the current state
      await apiClient.put(`/api/projects/${projectId}`, {
        diagram_data: { nodes, edges },
      });

      // Create resources in backend
      for (const node of nodes) {
        try {
          await apiClient.post('/api/resources/', {
            project_id: parseInt(projectId!),
            node_id: node.id,
            resource_type: node.data.resourceType || 'aws_instance',
            resource_name: node.data.label.split('\n')[0],
            position_x: Math.round(node.position.x),
            position_y: Math.round(node.position.y),
            config: {},
          });
        } catch (err: any) {
          // Skip if resource already exists
          if (err.response?.status !== 400) {
            throw err;
          }
        }
      }

      // Generate Terraform
      const response = await apiClient.post(`/api/terraform/generate/${projectId}`);

      // Show generated code
      const mainTf = response.data['main.tf'];
      alert(`Terraform code generated!\n\nPreview:\n${mainTf.substring(0, 500)}...`);
    } catch (err: any) {
      console.error('Failed to generate Terraform:', err);
      alert(err.response?.data?.detail || 'Failed to generate Terraform code');
    } finally {
      setGenerating(false);
    }
  };

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
            <p className="text-sm text-gray-600">{project?.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Dashboard
            </button>
            <button
              onClick={saveProject}
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={generateTerraform}
              disabled={generating || nodes.length === 0}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {generating ? 'Generating...' : 'Generate Terraform'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Resource Palette */}
        <aside className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Resources</h2>
            <div className="space-y-2">
              {AWS_RESOURCES.map((resource) => (
                <button
                  key={resource.type}
                  onClick={() => addNode(resource.type, resource.label)}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{resource.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {resource.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{resource.type}</div>
                  </div>
                </button>
              ))}
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
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
              <div className="text-sm space-y-1">
                <div className="font-semibold text-gray-900">Quick Help</div>
                <div className="text-gray-600">• Click resources to add</div>
                <div className="text-gray-600">• Drag to connect</div>
                <div className="text-gray-600">• Nodes: {nodes.length}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
