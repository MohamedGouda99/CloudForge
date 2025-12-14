import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import apiClient from '../../lib/api/client';
import { toast } from '../../components/Toast';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Zap,
  Info,
} from 'lucide-react';

type CloudProvider = 'aws' | 'azure' | 'gcp';

const providers = [
  {
    id: 'aws' as CloudProvider,
    name: 'Amazon Web Services',
    shortName: 'AWS',
    description: 'Industry-leading cloud platform with 200+ services',
    icon: '☁️',
    logo: '/api/icons/AWS/aws.png',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
  {
    id: 'azure' as CloudProvider,
    name: 'Microsoft Azure',
    shortName: 'Azure',
    description: 'Enterprise cloud for hybrid solutions',
    icon: '🔷',
    logo: '/api/icons/Azure/azure.png',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    textColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    id: 'gcp' as CloudProvider,
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    description: 'Data analytics and machine learning focused',
    icon: '🔴',
    logo: '/api/icons/GCP/gcp.png',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-red-700 dark:text-red-400',
  },
];

export default function EnhancedNewProjectPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('aws');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post(
        '/api/projects/',
        {
          name: projectName,
          description,
          cloud_provider: cloudProvider,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Project Created!', 'Your new infrastructure project is ready.');
      navigate(`/projects/${response.data.id}`);
    } catch (error: any) {
      toast.error('Failed to create project', error.response?.data?.detail || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <img src="/vodafone.png" alt="Vodafone" className="h-10 w-auto" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Create New Project
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Design your cloud infrastructure in minutes with CloudForge Enterprise
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Project Details' },
              { num: 2, label: 'Cloud Provider' },
              { num: 3, label: 'Review & Create' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-900/30'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    step >= s.num ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                    step > s.num ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Project Details */}
            {step === 1 && (
              <div className="p-8 animate-fade-in">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Project Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., Production Web Infrastructure"
                      required
                      className="input-vodafone"
                      autoFocus
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Choose a descriptive name for your infrastructure project
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose and scope of this infrastructure..."
                      rows={4}
                      className="input-vodafone resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                      <p className="font-semibold mb-1">Enterprise Best Practices</p>
                      <p>Use clear, descriptive names and document your infrastructure purpose for team collaboration.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Cloud Provider */}
            {step === 2 && (
              <div className="p-8 animate-fade-in">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Select Cloud Provider
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    Choose the cloud platform for your infrastructure
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => setCloudProvider(provider.id)}
                        className={`relative p-6 rounded-xl cursor-pointer transition-all border-2 ${
                          cloudProvider === provider.id
                            ? `${provider.borderColor} ${provider.bgColor} shadow-lg scale-105`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {/* Selection Indicator */}
                        {cloudProvider === provider.id && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle2 className={`w-6 h-6 ${provider.textColor}`} />
                          </div>
                        )}

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-4">
                            <div className="bg-white dark:bg-gray-100 rounded-xl p-4 shadow-sm">
                              <img
                                src={provider.logo}
                                alt={provider.name}
                                className="w-16 h-16 object-contain"
                              />
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                            {provider.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {provider.description}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Shield className="w-3 h-3" />
                            Enterprise Security
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Zap className="w-3 h-3" />
                            Auto-scaling
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Sparkles className="w-3 h-3" />
                            AI-powered
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="p-8 animate-fade-in">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Review Your Project
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    Verify the details before creating your project
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Project Name</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{projectName}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Description</label>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">{description || 'No description provided'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Cloud Provider</label>
                      <div className="flex items-center gap-3 mt-2">
                        <img
                          src={providers.find((p) => p.id === cloudProvider)?.logo}
                          alt={providers.find((p) => p.id === cloudProvider)?.name}
                          className="w-8 h-8 object-contain"
                        />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {providers.find((p) => p.id === cloudProvider)?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-900 dark:text-green-200">
                        <p className="font-semibold mb-1">Ready to Create</p>
                        <p>Your project will be created with Vodafone enterprise security and compliance standards.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
                className="btn-secondary"
              >
                {step === 1 ? 'Cancel' : 'Previous'}
              </button>

              <div className="flex items-center gap-2">
                <img src="/vodafone.png" alt="Vodafone" className="h-5 w-auto" />
                <span className="text-xs text-gray-500">Enterprise Edition</span>
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !projectName}
                  className="btn-vodafone flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-vodafone flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise Security</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Bank-grade encryption and compliance</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Zap className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Instant Deployment</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Deploy to cloud in seconds</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Sparkles className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI-Powered</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Intelligent resource suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

