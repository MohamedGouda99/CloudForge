import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import VodafoneLogo from '../../components/VodafoneLogo';

type CloudProvider = 'aws' | 'azure' | 'gcp';

interface Template {
  id: string;
  name: string;
  description: string;
  provider: CloudProvider;
  icon: string;
  resources: number;
}

const templates: Template[] = [
  {
    id: 'web-app-aws',
    name: 'Web Application (AWS)',
    description: 'VPC, ALB, EC2 Auto Scaling, RDS, S3',
    provider: 'aws',
    icon: '🌐',
    resources: 8,
  },
  {
    id: 'serverless-aws',
    name: 'Serverless API (AWS)',
    description: 'API Gateway, Lambda, DynamoDB, CloudWatch',
    provider: 'aws',
    icon: '⚡',
    resources: 6,
  },
  {
    id: 'kubernetes-aws',
    name: 'Kubernetes Cluster (EKS)',
    description: 'EKS, VPC, Load Balancer, ECR',
    provider: 'aws',
    icon: '🚢',
    resources: 10,
  },
  {
    id: 'web-app-azure',
    name: 'Web Application (Azure)',
    description: 'VNet, App Service, SQL Database, Storage',
    provider: 'azure',
    icon: '🌐',
    resources: 7,
  },
  {
    id: 'kubernetes-azure',
    name: 'Kubernetes Cluster (AKS)',
    description: 'AKS, VNet, Load Balancer, ACR',
    provider: 'azure',
    icon: '🚢',
    resources: 9,
  },
  {
    id: 'web-app-gcp',
    name: 'Web Application (GCP)',
    description: 'VPC, Cloud Run, Cloud SQL, Cloud Storage',
    provider: 'gcp',
    icon: '🌐',
    resources: 7,
  },
];

export default function NewProjectPageEnhanced() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('aws');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const providers = [
    { id: 'aws', name: 'Amazon Web Services', icon: '☁️', color: 'from-orange-500 to-orange-600' },
    { id: 'azure', name: 'Microsoft Azure', icon: '🔷', color: 'from-blue-500 to-blue-600' },
    { id: 'gcp', name: 'Google Cloud Platform', icon: '🔴', color: 'from-purple-500 to-purple-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/projects/', {
        name: projectName,
        description,
        cloud_provider: selectedProvider,
        template_id: selectedTemplate,
      });

      navigate(`/projects/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => t.provider === selectedProvider);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-vodafone-red to-vodafone-red-dark text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Create New Project</h1>
              <p className="text-white/90 text-lg mt-1">
                Design and deploy your cloud infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-vodafone-red text-white flex items-center justify-center text-sm font-bold">1</span>
              Project Details
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project Name <span className="text-vodafone-red">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-vodafone-red focus:border-transparent transition-all"
                  placeholder="e.g., Production Web Application"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-vodafone-red focus:border-transparent transition-all resize-none"
                  placeholder="Brief description of your project"
                />
              </div>
            </div>
          </div>

          {/* Cloud Provider Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-vodafone-red text-white flex items-center justify-center text-sm font-bold">2</span>
              Select Cloud Provider
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setSelectedProvider(provider.id as CloudProvider)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedProvider === provider.id
                      ? 'border-vodafone-red bg-vodafone-red/5 shadow-lg shadow-vodafone-red/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                    {provider.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.id.toUpperCase()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-vodafone-red text-white flex items-center justify-center text-sm font-bold">3</span>
              Choose Template (Optional)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 ml-10">
              Start with a pre-configured architecture or build from scratch
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Blank Template */}
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedTemplate === null
                    ? 'border-vodafone-red bg-vodafone-red/5 shadow-lg shadow-vodafone-red/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl mb-3">
                  📄
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Blank Project
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start from scratch
                </p>
              </button>

              {/* Templates */}
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-vodafone-red bg-vodafone-red/5 shadow-lg shadow-vodafone-red/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-vodafone-red to-vodafone-red-dark text-white flex items-center justify-center text-2xl mb-3 shadow-md">
                    {template.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <p className="text-xs text-vodafone-red font-medium">
                    {template.resources} resources
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !projectName}
              className="px-8 py-3 bg-vodafone-red hover:bg-vodafone-red-dark text-white font-semibold rounded-lg shadow-lg shadow-vodafone-red/30 hover:shadow-xl hover:shadow-vodafone-red/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

