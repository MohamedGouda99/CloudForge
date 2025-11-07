import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import {
  getResourcesForProvider,
  getCategoriesForProvider,
  CloudProvider,
  CloudResource,
  getProviderLabel,
  getProviderIcon,
} from '../../lib/resources';
import ResourceConfigModal from '../../components/ResourceConfigModal';
import CloudCredentialsModal from '../../components/CloudCredentialsModal';

interface Project {
  id: number;
  name: string;
  description: string;
  cloud_provider: CloudProvider;
  diagram_data: any;
}

export default function DesignerPageComplete() {
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
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);

  // Credentials state
  const [credentials, setCredentials] = useState<any>(null);

  // Resources
  const resources = project ? getResourcesForProvider(project.cloud_provider) : [];
  const categories = project ? getCategoriesForProvider(project.cloud_provider) : [];

  // Load project
  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Load credentials from localStorage
  useEffect(() => {
    if (project) {
      const savedCreds = localStorage.getItem(`credentials_${project.cloud_provider}`);
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
        const diagram = JSON.parse(projectData.diagram_data);
        if (diagram.nodes) setNodes(diagram.nodes);
        if (diagram.edges) setEdges(diagram.edges);
      }
    } catch (error: any) {
      console.error('Failed to load project:', error);
      alert('Failed to load project: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (resource: CloudResource) => {
      const id = `${resource.type}_${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'default',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: `${resource.label}\n(${resource.type})`,
          resourceType: resource.type,
          resourceLabel: resource.label,
          config: {},
        },
        style: {
          background: '#fff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          width: 180,
        },
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
      setConfigModalOpen(true);
    },
    []
  );

  const handleConfigSave = (config: any) => {
    if (!selectedNode) return;

    const resourceName = config.name || config.resource_name || selectedNode.id;
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config,
        label: `${resourceName}\n(${selectedNode.data.resourceType})`,
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
    localStorage.setItem(`credentials_${project?.cloud_provider}`, JSON.stringify(creds));
    setCredentialsModalOpen(false);
  };

  const saveProject = async () => {
    try {
      setSaving(true);

      // Save diagram data
      const diagramData = JSON.stringify({ nodes, edges });

      await apiClient.put(
        `/api/projects/${projectId}`,
        {
          name: project?.name,
          description: project?.description,
          cloud_provider: project?.cloud_provider,
          diagram_data: diagramData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Save resources to backend
      for (const node of nodes) {
        if (node.data.config && Object.keys(node.data.config).length > 0) {
          await apiClient.post(
            '/api/resources/',
            {
              project_id: parseInt(projectId!),
              resource_type: node.data.resourceType,
              name: node.data.config.name || node.id,
              config: node.data.config,
              position_x: node.position.x,
              position_y: node.position.y,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }

      alert('Project saved successfully!');
    } catch (error: any) {
      console.error('Failed to save project:', error);
      alert('Failed to save project: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const generateAndDownloadTerraform = async () => {
    try {
      // First save
      await saveProject();

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
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      resource.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Resource Palette */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {getProviderIcon(project.cloud_provider)} {getProviderLabel(project.cloud_provider)}
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
              title="Back to Dashboard"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredResources.map((resource) => (
              <button
                key={resource.type}
                onClick={() => addNode(resource)}
                className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{resource.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{resource.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{resource.type}</p>
                  </div>
                </div>
              </button>
            ))}

            {filteredResources.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No resources found</p>
                <p className="text-xs mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveProject}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                type="button"
                onClick={() => setCredentialsModalOpen(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                {credentials ? 'Update Credentials' : 'Set Credentials'}
              </button>

              <button
                onClick={generateAndDownloadTerraform}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Download Terraform
              </button>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={handleNodeDoubleClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-left" className="bg-white p-2 rounded shadow text-xs">
              <p className="font-semibold">Tips:</p>
              <ul className="mt-1 space-y-1 text-gray-600">
                <li>• Click resource to add to canvas</li>
                <li>• Double-click node to configure</li>
                <li>• Drag to connect resources</li>
              </ul>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
}
