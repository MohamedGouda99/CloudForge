import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, PlayCircle, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DeploymentLogsModalProps {
  projectId: string;
  credentials: any;
  cloudProvider: string;
  isOpen: boolean;
  onClose: () => void;
  mode: 'deploy' | 'destroy';
}

const operationMeta = {
  deploy: {
    title: 'Deployment Logs',
    runningLabel: 'Deploying...',
    successLabel: 'Deployment completed successfully!',
    idleLabel: 'Ready to deploy',
    icon: PlayCircle,
  },
  destroy: {
    title: 'Destroy Logs',
    runningLabel: 'Destroying...',
    successLabel: 'Destroy completed successfully!',
    idleLabel: 'Ready to destroy',
    icon: Trash2,
  },
};

export default function DeploymentLogsModal({
  projectId,
  credentials,
  cloudProvider,
  isOpen,
  onClose,
  mode,
}: DeploymentLogsModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const meta = operationMeta[mode];
  const Icon = meta.icon;

  useEffect(() => {
    if (isOpen && credentials) {
      startStreaming();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startStreaming = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setHasError(false);
    setLogs([]);

    try {
      const params = buildQueryParams();
      const endpoint = mode === 'deploy' ? 'deploy' : 'destroy';
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api/terraform/${endpoint}/stream/${projectId}?${params}`;

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = event.data;

        if (data === '[DONE]') {
          setIsRunning(false);
          setIsComplete(true);
          eventSource.close();
        } else if (data.startsWith('ERROR:')) {
          setLogs((prev) => [...prev, data]);
          setHasError(true);
        } else {
          setLogs((prev) => [...prev, data]);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setLogs((prev) => [...prev, 'Connection error occurred']);
        setHasError(true);
        setIsRunning(false);
        eventSource.close();
      };
    } catch (error: any) {
      console.error('Terraform streaming error:', error);
      setLogs((prev) => [...prev, `Error: ${error.message}`]);
      setHasError(true);
      setIsRunning(false);
    }
  };

  const buildQueryParams = () => {
    if (cloudProvider === 'aws') {
      return new URLSearchParams({
        aws_region: credentials.aws_region,
        aws_access_key_id: credentials.aws_access_key_id,
        aws_secret_access_key: credentials.aws_secret_access_key,
      }).toString();
    }

    if (cloudProvider === 'azure') {
      return new URLSearchParams({
        azure_subscription_id: credentials.azure_subscription_id,
        azure_tenant_id: credentials.azure_tenant_id,
        azure_client_id: credentials.azure_client_id,
        azure_client_secret: credentials.azure_client_secret,
        azure_location: credentials.azure_location,
      }).toString();
    }

    if (cloudProvider === 'gcp') {
      return new URLSearchParams({
        gcp_project_id: credentials.gcp_project_id,
        gcp_region: credentials.gcp_region,
        gcp_credentials_json: credentials.gcp_credentials_json,
      }).toString();
    }

    return '';
  };

  const handleClose = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    onClose();
  };

  if (!isOpen) return null;

  const statusMessage = useMemo(() => {
    if (isRunning) return meta.runningLabel;
    if (isComplete && !hasError) return meta.successLabel;
    if (hasError) return 'Operation failed';
    return meta.idleLabel;
  }, [hasError, isComplete, isRunning, meta]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-100 text-indigo-600 p-2">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{meta.title}</h2>
                <p className="text-sm text-gray-600">{statusMessage}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isRunning}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{meta.runningLabel}</span>
              </div>
            )}
            {isComplete && !hasError && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">{meta.successLabel}</span>
              </div>
            )}
            {hasError && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">An error occurred</span>
              </div>
            )}
            <div className="ml-auto text-xs text-gray-500">{logs.length} log lines</div>
          </div>
        </div>

        {/* Logs Display */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm">
          {logs.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              <p>Connecting to terraform {mode} stream...</p>
            </div>
          )}
          {logs.map((log, index) => (
            <div
              key={index}
              className={`py-0.5 ${
                log.includes('ERROR') || log.includes('Error')
                  ? 'text-red-400'
                  : log.includes('===')
                  ? 'text-yellow-400 font-bold'
                  : log.includes('Successfully') || log.includes('complete')
                  ? 'text-green-400'
                  : 'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {isRunning && 'Streaming real-time output. Keep this window open...'}
            {isComplete && !hasError && 'Operation finished successfully.'}
            {hasError && 'Terraform encountered issues. Review the logs above.'}
          </div>
          <button
            onClick={handleClose}
            disabled={isRunning}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Working...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
