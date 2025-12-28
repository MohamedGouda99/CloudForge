import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import apiClient from '../../lib/api/client';
import MetricsCard, { MetricsGrid } from '../../components/MetricsCard';
import ProjectCard, { ProjectCardSkeleton } from '../../components/ProjectCard';
import ActivityFeed from '../../components/ActivityFeed';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { toast } from '../../components/Toast';
import {
  Plus,
  Folder,
  Cloud,
  DollarSign,
  Users,
  Search,
  BarChart3,
  Download,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  cloud_provider: 'aws' | 'azure' | 'gcp';
  description: string;
  created_at: string;
  updated_at: string;
  resource_count?: number;
  status?: 'active' | 'archived' | 'draft';
}

interface DashboardStats {
  total_projects: number;
  total_resources: number;
  total_cost: number;
  currency: string;
  team_members: number;
}

export default function EnhancedDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: number | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: '',
  });

  // Dashboard stats from API
  const [stats, setStats] = useState<DashboardStats>({
    total_projects: 0,
    total_resources: 0,
    total_cost: 0,
    currency: 'USD',
    team_members: 1,
  });

  useEffect(() => {
    loadProjects();
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/projects/');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterProvider === 'all' || project.cloud_provider === filterProvider;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteProject = async (id: number) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    setDeleteModal({
      isOpen: true,
      projectId: id,
      projectName: project.name,
    });
  };

  const confirmDeleteProject = async () => {
    if (!deleteModal.projectId) return;

    const projectName = deleteModal.projectName;

    try {
      await apiClient.delete(`/api/projects/${deleteModal.projectId}`);
      toast.success('Project deleted', `"${projectName}" has been removed`);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project', 'Please try again');
    }
  };

  const handleDuplicateProject = async (id: number) => {
    try {
      const original = projects.find(p => p.id === id);
      if (!original) return;

      // Get the full project data including diagram
      const response = await apiClient.get(`/api/projects/${id}`);
      const projectData = response.data;

      // Create the new project first (without diagram_data)
      // Note: Backend only allows letters, numbers, spaces, underscores and hyphens
      const newName = `${original.name} Copy`;
      const createResponse = await apiClient.post('/api/projects/', {
        name: newName,
        description: original.description || '',
        cloud_provider: original.cloud_provider,
      });

      const newProjectId = createResponse.data.id;

      // Update the new project with the diagram data (with new node IDs)
      if (projectData.diagram_data) {
        const diagramData = projectData.diagram_data;

        // Generate new unique node IDs for all nodes to avoid conflicts
        const idMapping: Record<string, string> = {};
        const newNodes = diagramData.nodes?.map((node: any) => {
          const newId = `${node.data?.resourceType || 'node'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          idMapping[node.id] = newId;
          return {
            ...node,
            id: newId,
          };
        }) || [];

        // Update edges to use new node IDs
        const newEdges = diagramData.edges?.map((edge: any) => ({
          ...edge,
          id: `${idMapping[edge.source] || edge.source}-${idMapping[edge.target] || edge.target}`,
          source: idMapping[edge.source] || edge.source,
          target: idMapping[edge.target] || edge.target,
        })) || [];

        await apiClient.put(`/api/projects/${newProjectId}`, {
          diagram_data: {
            ...diagramData,
            nodes: newNodes,
            edges: newEdges,
          },
        });
      }

      toast.success('Project duplicated!', `Created "${newName}"`);
      loadProjects();
    } catch (error: any) {
      console.error('Failed to duplicate project:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Please try again';
      toast.error('Failed to duplicate project', errorMsg);
    }
  };

  const handleExportProject = async (id: number) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      const response = await apiClient.get(`/api/projects/${id}`);
      const projectData = response.data;

      // Create export data
      const exportData = {
        name: projectData.name,
        description: projectData.description,
        cloud_provider: projectData.cloud_provider,
        diagram_data: projectData.diagram_data,
        exported_at: new Date().toISOString(),
        version: '1.0',
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${project.name.replace(/\s+/g, '_')}_export.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Project exported!', `Downloaded as ${filename}`);
    } catch (error) {
      console.error('Failed to export project:', error);
      toast.error('Failed to export project', 'Please try again');
    }
  };

  const handleShareProject = async (id: number) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      // Generate shareable link (in production, this would create a share token)
      const shareUrl = `${window.location.origin}/projects/${id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show silent toast notification
      toast.success('Link copied to clipboard!', shareUrl);
    } catch (error) {
      console.error('Failed to share project:', error);
      toast.error('Failed to copy link', 'Please try again');
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch analytics data for comprehensive export
      const analyticsResponse = await apiClient.get('/api/dashboard/analytics');
      const analytics = analyticsResponse.data;

      // Create CSV content
      const headers = ['Project', 'Cloud Provider', 'Resources', 'Monthly Cost (USD)'];
      const rows = analytics.projects.map((p: any) => [
        p.name,
        p.cloud_provider.toUpperCase(),
        p.resource_count,
        `$${p.monthly_cost}`,
      ]);

      const csvContent = [
        '# CloudForge Dashboard Export',
        `# Generated: ${new Date().toISOString()}`,
        `# User: ${user?.username || 'Unknown'}`,
        '',
        '## Summary',
        `Total Projects,${analytics.summary.total_projects}`,
        `Total Resources,${analytics.summary.total_resources}`,
        `Total Cost,$${analytics.summary.total_cost}`,
        '',
        '## Projects',
        headers.join(','),
        ...rows.map((r: any[]) => r.join(',')),
        '',
        '## Cost by Provider',
        'Provider,Cost',
        ...analytics.by_provider.map((p: any) => `${p.provider},$${p.cost}`),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloudforge-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export complete!', 'Dashboard data downloaded as CSV');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data', 'Please try again');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username || 'User'}! 👋</h1>
            <p className="text-red-100 text-lg">Vodafone CloudForge Enterprise Platform</p>
            <p className="text-red-200 mt-2">Manage your cloud infrastructure with ease</p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <img src="/vodafone.png" alt="Vodafone" className="h-16 w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <MetricsGrid>
        <MetricsCard
          title="Total Projects"
          value={projects.length}
          change={12}
          trend="up"
          icon={Folder}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          description="Active infrastructure projects"
          loading={loading}
        />
        <MetricsCard
          title="Active Resources"
          value={stats.total_resources}
          change={8}
          trend="up"
          icon={Cloud}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
          description="Deployed cloud resources"
          loading={loading}
        />
        <MetricsCard
          title="Total Cost"
          value={`$${stats.total_cost.toLocaleString()}`}
          change={-5}
          trend="down"
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          description="Estimated cloud spending"
          loading={loading}
        />
        <MetricsCard
          title="Team Members"
          value={stats.team_members}
          change={2}
          trend="up"
          icon={Users}
          iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
          description="Vodafone team access"
          loading={loading}
        />
      </MetricsGrid>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border-2 border-dashed border-red-300 dark:border-red-700"
          >
            <div className="bg-red-600 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white">New Project</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Create infrastructure</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white">View Analytics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost & usage reports</div>
            </div>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="bg-purple-600 p-2 rounded-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white">Export Data</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Download reports</div>
            </div>
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent
                           focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              {/* Filter */}
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent
                         focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="all">All Providers</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">GCP</option>
              </select>

              <button
                onClick={() => navigate('/projects/new')}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first infrastructure project</p>
              <button
                onClick={() => navigate('/projects/new')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onDuplicate={handleDuplicateProject}
                  onExport={handleExportProject}
                  onShare={handleShareProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              This Month
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deployments</span>
                  <span className="font-bold text-gray-900 dark:text-white">12</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Security Score</span>
                  <span className="font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost Efficiency</span>
                  <span className="font-bold text-blue-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vodafone Support */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white shadow-xl">
            <img src="/vodafone.png" alt="Vodafone" className="h-8 w-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-red-100 text-sm mb-4">
              Our enterprise support team is available 24/7
            </p>
            <button className="w-full px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Vodafone Branding Footer */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <img src="/vodafone.png" alt="Vodafone" className="h-12 w-auto" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Vodafone Enterprise Cloud Platform</h3>
              <p className="text-gray-300 text-base">Secure, scalable, and reliable infrastructure management for global enterprises</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium">Documentation</a>
            <a href="#" className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-lg">Get Support</a>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: null, projectName: '' })}
        onConfirm={confirmDeleteProject}
        projectName={deleteModal.projectName}
      />
    </div>
  );
}

