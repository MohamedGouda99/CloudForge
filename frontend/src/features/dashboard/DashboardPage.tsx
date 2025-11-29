import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import {
  Search,
  Plus,
  FolderOpen,
  Copy,
  Trash2,
  Cloud,
  RefreshCw,
  LayoutTemplate,
  Clock,
  Box,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  cloud_provider: string;
  created_at: string;
  updated_at?: string;
  resource_count?: number;
}

type FilterTab = 'all' | 'recent' | 'aws' | 'azure' | 'gcp';

const PROVIDER_CONFIG = {
  aws: {
    label: 'AWS',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  azure: {
    label: 'Azure',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  gcp: {
    label: 'GCP',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
  },
};

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="glass-panel rounded-xl p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div>
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-6 w-14 bg-muted rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-muted rounded-lg" />
            <div className="h-9 w-9 bg-muted rounded-lg" />
            <div className="h-9 w-9 bg-muted rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  onDelete: (id: number, name: string) => void;
  onDuplicate: (project: Project) => void;
}) {
  const navigate = useNavigate();
  const provider = project.cloud_provider?.toLowerCase() as keyof typeof PROVIDER_CONFIG;
  const config = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG.aws;

  const lastModified = project.updated_at || project.created_at;
  const relativeTime = formatDistanceToNow(new Date(lastModified), { addSuffix: true });

  return (
    <div
      className="glass-panel rounded-xl p-6 group hover:shadow-lg hover:shadow-primary/5 
                 transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-transparent
                 hover:border-primary/20"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
            <Cloud className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground">{config.label} Project</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.color} text-white shadow-sm`}
        >
          {config.label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
        {project.description || 'No description provided'}
      </p>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Box className="w-3.5 h-3.5" />
          <span>{project.resource_count ?? 0} resources</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{relativeTime}</span>
        </div>
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground 
                     px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <FolderOpen className="w-4 h-4" />
          Open
        </Link>
        <button
          onClick={() => onDuplicate(project)}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground 
                     transition-colors"
          title="Duplicate project"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(project.id, project.name)}
          className="p-2 rounded-lg bg-secondary hover:bg-destructive hover:text-destructive-foreground 
                     text-secondary-foreground transition-colors"
          title="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterTab }) {
  const message =
    filter === 'all'
      ? "You haven't created any projects yet"
      : filter === 'recent'
      ? 'No recently modified projects'
      : `No ${filter.toUpperCase()} projects found`;

  return (
    <div className="glass-panel rounded-xl p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Cloud className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {filter === 'all'
          ? 'Get started by creating your first cloud infrastructure project. Design, visualize, and deploy your infrastructure with ease.'
          : 'Try adjusting your filters or create a new project to get started.'}
      </p>
      <Link
        to="/projects/new"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 
                   rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        Create New Project
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="glass-panel rounded-xl p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load projects</h3>
      <p className="text-muted-foreground mb-6">
        Something went wrong while fetching your projects. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 
                   rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        <RefreshCw className="w-5 h-5" />
        Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/projects/');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err: any) {
      console.error('Failed to delete project', err);
      alert(err.response?.data?.detail || 'Failed to delete project. Please try again.');
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const res = await apiClient.post('/api/projects/', {
        name: `${project.name} (Copy)`,
        description: project.description,
        cloud_provider: project.cloud_provider,
      });
      setProjects([res.data, ...projects]);
    } catch (err: any) {
      console.error('Failed to duplicate project', err);
      alert(err.response?.data?.detail || 'Failed to duplicate project. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const total = projects.length;
    const byProvider = {
      aws: projects.filter((p) => p.cloud_provider?.toLowerCase() === 'aws').length,
      azure: projects.filter((p) => p.cloud_provider?.toLowerCase() === 'azure').length,
      gcp: projects.filter((p) => p.cloud_provider?.toLowerCase() === 'gcp').length,
    };
    return { total, byProvider };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (activeFilter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((p) => new Date(p.updated_at || p.created_at) > oneWeekAgo);
      result.sort((a, b) => 
        new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      );
    } else if (activeFilter !== 'all') {
      result = result.filter((p) => p.cloud_provider?.toLowerCase() === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.cloud_provider?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, activeFilter, searchQuery]);

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Projects', count: stats.total },
    { id: 'recent', label: 'Recent' },
    { id: 'aws', label: 'AWS', count: stats.byProvider.aws },
    { id: 'azure', label: 'Azure', count: stats.byProvider.azure },
    { id: 'gcp', label: 'GCP', count: stats.byProvider.gcp },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {getGreeting()}, {user?.username || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your cloud infrastructure projects
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border 
                           text-foreground placeholder:text-muted-foreground focus:outline-none 
                           focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground 
                         px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm
                         hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Projects"
            value={stats.total}
            icon={Cloud}
            color="bg-primary"
          />
          <StatCard
            label="AWS Projects"
            value={stats.byProvider.aws}
            icon={Cloud}
            color="bg-orange-500"
          />
          <StatCard
            label="Azure Projects"
            value={stats.byProvider.azure}
            icon={Cloud}
            color="bg-blue-500"
          />
          <div
            className="glass-panel rounded-xl p-4 flex items-center gap-4 cursor-pointer 
                       hover:shadow-lg transition-all group"
            onClick={() => navigate('/projects/new')}
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-105 transition-transform">
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Create from Template</p>
              <p className="text-sm text-muted-foreground">Quick start</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  activeFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${
                      activeFilter === tab.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {error ? (
          <ErrorState onRetry={fetchProjects} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : filteredProjects.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onDuplicate={handleDuplicateProject}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </div>
    </div>
  );
}
