import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import VodafoneLogo, { VodafoneIcon } from '../../components/VodafoneLogo';

interface Project {
  id: number;
  name: string;
  cloud_provider: string;
  description: string;
  created_at: string;
  updated_at: string;
}

type FilterTab = 'all' | 'recent' | 'aws' | 'azure' | 'gcp';

export default function DashboardPageEnhanced() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, activeFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by provider
    if (activeFilter !== 'all' && activeFilter !== 'recent') {
      filtered = filtered.filter((p) => p.cloud_provider === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort recent first
    if (activeFilter === 'recent') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 10);
    }

    setFilteredProjects(filtered);
  };

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      aws: '☁️',
      azure: '🔷',
      gcp: '🔴',
    };
    return icons[provider] || '☁️';
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      aws: 'from-orange-500 to-orange-600',
      azure: 'from-blue-500 to-blue-600',
      gcp: 'from-red-500 to-red-600',
    };
    return colors[provider] || 'from-gray-500 to-gray-600';
  };

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      color: 'from-vodafone-red to-vodafone-red-dark',
    },
    {
      label: 'AWS Projects',
      value: projects.filter((p) => p.cloud_provider === 'aws').length,
      icon: '☁️',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Azure Projects',
      value: projects.filter((p) => p.cloud_provider === 'azure').length,
      icon: '🔷',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'GCP Projects',
      value: projects.filter((p) => p.cloud_provider === 'gcp').length,
      icon: '🔴',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-vodafone-red to-vodafone-red-dark text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.username}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Manage your cloud infrastructure projects with confidence
              </p>
            </div>
            <VodafoneIcon size={80} className="hidden lg:block opacity-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg text-2xl`}>
                  {typeof stat.icon === 'string' ? stat.icon : stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-vodafone-red focus:border-transparent transition-all"
            />
          </div>
          <Link
            to="/projects/new"
            className="w-full sm:w-auto px-6 py-3 bg-vodafone-red hover:bg-vodafone-red-dark text-white font-semibold rounded-lg shadow-lg shadow-vodafone-red/30 hover:shadow-xl hover:shadow-vodafone-red/40 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Projects', count: projects.length },
            { id: 'recent', label: 'Recent', count: Math.min(10, projects.length) },
            { id: 'aws', label: 'AWS', count: projects.filter(p => p.cloud_provider === 'aws').length },
            { id: 'azure', label: 'Azure', count: projects.filter(p => p.cloud_provider === 'azure').length },
            { id: 'gcp', label: 'GCP', count: projects.filter(p => p.cloud_provider === 'gcp').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterTab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-vodafone-red text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab.label} <span className="ml-2 opacity-75">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-vodafone-red mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first infrastructure project
            </p>
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-vodafone-red hover:bg-vodafone-red-dark text-white font-semibold rounded-lg shadow-lg shadow-vodafone-red/30 hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Provider Badge */}
                <div className={`h-2 bg-gradient-to-r ${getProviderColor(project.cloud_provider)}`}></div>
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getProviderColor(project.cloud_provider)} flex items-center justify-center text-2xl shadow-lg`}>
                        {getProviderIcon(project.cloud_provider)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-vodafone-red transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide">
                          {project.cloud_provider}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                    {project.description || 'No description provided'}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex-1 px-4 py-2 bg-vodafone-red hover:bg-vodafone-red-dark text-white font-medium rounded-lg transition-all text-center text-sm shadow-md hover:shadow-lg"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 font-medium rounded-lg transition-all text-sm"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <Link
              to="/projects/new"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-vodafone-red dark:hover:border-vodafone-red overflow-hidden min-h-[280px] flex items-center justify-center"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-vodafone-red to-vodafone-red-dark text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-vodafone-red transition-colors mb-2">
                  Create New Project
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start designing your cloud infrastructure
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

