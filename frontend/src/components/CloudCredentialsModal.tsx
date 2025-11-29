import { useMemo, useState, useEffect } from 'react';
import CloudIcon from './CloudIcon';
import { getProviderIcon, getProviderLabel } from '../lib/resources';

type CloudProvider = 'aws' | 'azure' | 'gcp';

interface CloudCredentialsModalProps {
  cloudProvider: CloudProvider;
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: any) => void;
  initialCredentials?: any;
}

export default function CloudCredentialsModal({
  cloudProvider,
  isOpen,
  onClose,
  onSave,
  initialCredentials,
}: CloudCredentialsModalProps) {
  const [credentials, setCredentials] = useState<any>(initialCredentials || {});
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    // Initialize with defaults based on provider
    if (!initialCredentials) {
      switch (cloudProvider) {
        case 'aws':
          setCredentials({
            aws_region: 'us-east-1',
            aws_access_key_id: '',
            aws_secret_access_key: '',
          });
          break;
        case 'azure':
          setCredentials({
            azure_subscription_id: '',
            azure_tenant_id: '',
            azure_client_id: '',
            azure_client_secret: '',
            azure_location: 'eastus',
          });
          break;
        case 'gcp':
          setCredentials({
            gcp_project_id: '',
            gcp_region: 'us-central1',
            gcp_credentials_json: '',
          });
          break;
      }
    }
  }, [cloudProvider, initialCredentials]);

  const providerInfo = useMemo(() => {
    switch (cloudProvider) {
      case 'aws':
        return {
          title: 'AWS Credentials',
          description: 'Provide access keys for the AWS account or role you want to deploy into.',
          docsUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
        };
      case 'azure':
        return {
          title: 'Azure Credentials',
          description: 'Use a service principal with sufficient permissions for Azure resource deployment.',
          docsUrl: 'https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure',
        };
      case 'gcp':
        return {
          title: 'GCP Credentials',
          description: 'Paste a service account JSON credential for the target GCP project.',
          docsUrl: 'https://cloud.google.com/docs/authentication/getting-started',
        };
      default:
        return {
          title: 'Cloud Credentials',
          description: 'Provide credentials for your cloud account.',
          docsUrl: '#',
        };
    }
  }, [cloudProvider]);

  const providerIcon = useMemo(() => getProviderIcon(cloudProvider), [cloudProvider]);
  const providerLabel = useMemo(() => getProviderLabel(cloudProvider), [cloudProvider]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(credentials);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                <CloudIcon icon={providerIcon} size={32} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{providerInfo.title}</h2>
                <p className="text-sm text-gray-600">{providerInfo.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Connected provider: {providerLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Security Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>Your credentials are stored locally in your browser and used only for deploying infrastructure. Never share your credentials.</p>
              </div>
            </div>
          </div>

          {/* AWS Fields */}
          {cloudProvider === 'aws' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AWS Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={credentials.aws_region || ''}
                  onChange={(e) => setCredentials({ ...credentials, aws_region: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-east-2">US East (Ohio)</option>
                  <option value="us-west-1">US West (N. California)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="eu-central-1">Europe (Frankfurt)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AWS Access Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.aws_access_key_id || ''}
                  onChange={(e) => setCredentials({ ...credentials, aws_access_key_id: e.target.value })}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AWS Secret Access Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.aws_secret_access_key || ''}
                    onChange={(e) => setCredentials({ ...credentials, aws_secret_access_key: e.target.value })}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Azure Fields */}
          {cloudProvider === 'azure' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azure Subscription ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.azure_subscription_id || ''}
                  onChange={(e) => setCredentials({ ...credentials, azure_subscription_id: e.target.value })}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Find in Azure Portal → Subscriptions</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.azure_tenant_id || ''}
                  onChange={(e) => setCredentials({ ...credentials, azure_tenant_id: e.target.value })}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID (Application ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.azure_client_id || ''}
                  onChange={(e) => setCredentials({ ...credentials, azure_client_id: e.target.value })}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.azure_client_secret || ''}
                    onChange={(e) => setCredentials({ ...credentials, azure_client_secret: e.target.value })}
                    placeholder="Your service principal secret"
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={credentials.azure_location || ''}
                  onChange={(e) => setCredentials({ ...credentials, azure_location: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="eastus">East US</option>
                  <option value="westus">West US</option>
                  <option value="centralus">Central US</option>
                  <option value="westeurope">West Europe</option>
                  <option value="northeurope">North Europe</option>
                  <option value="southeastasia">Southeast Asia</option>
                </select>
              </div>
            </>
          )}

          {/* GCP Fields */}
          {cloudProvider === 'gcp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GCP Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={credentials.gcp_project_id || ''}
                  onChange={(e) => setCredentials({ ...credentials, gcp_project_id: e.target.value })}
                  placeholder="my-gcp-project"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Find in GCP Console → Project Info</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Region <span className="text-red-500">*</span>
                </label>
                <select
                  value={credentials.gcp_region || ''}
                  onChange={(e) => setCredentials({ ...credentials, gcp_region: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="us-central1">us-central1 (Iowa)</option>
                  <option value="us-east1">us-east1 (South Carolina)</option>
                  <option value="us-west1">us-west1 (Oregon)</option>
                  <option value="europe-west1">europe-west1 (Belgium)</option>
                  <option value="asia-east1">asia-east1 (Taiwan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Account JSON <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={credentials.gcp_credentials_json || ''}
                  onChange={(e) => setCredentials({ ...credentials, gcp_credentials_json: e.target.value })}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                />
                <p className="mt-1 text-xs text-gray-500">Paste the contents of your service account JSON key file</p>
              </div>
            </>
          )}

          {/* Help Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need help finding your credentials?</p>
                <a
                  href={providerInfo.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  View {providerInfo.title.split(' ')[0]} documentation →
                </a>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
