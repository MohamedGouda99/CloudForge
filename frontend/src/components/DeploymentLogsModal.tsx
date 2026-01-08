import { useEffect, useRef, useState } from 'react';
import { Loader2, PlayCircle, Trash2, CheckCircle2, AlertTriangle, StopCircle } from 'lucide-react';
import { ansiToHtml } from '../lib/utils/ansi';

type DeployStatus = 'running' | 'success' | 'error' | 'idle';

interface DeploymentLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'plan' | 'validate' | 'apply' | 'destroy';
  logs: string[];
  status: DeployStatus;
  onTerminate?: () => Promise<void>;
}

const operationMeta = {
  plan: {
    title: 'Plan Logs',
    runningLabel: 'Planning...',
    successLabel: 'Plan completed successfully!',
    idleLabel: 'Ready to plan',
    icon: PlayCircle,
  },
  validate: {
    title: 'Validation Logs',
    runningLabel: 'Validating...',
    successLabel: 'Validation completed successfully!',
    idleLabel: 'Ready to validate',
    icon: PlayCircle,
  },
  apply: {
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
  isOpen,
  onClose,
  mode,
  logs,
  status,
  onTerminate,
}: DeploymentLogsModalProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const meta = operationMeta[mode];
  const Icon = meta.icon;
  const isRunning = status === 'running';
  const hasError = status === 'error';
  const statusMessage = isRunning
    ? meta.runningLabel
    : status === 'success'
    ? meta.successLabel
    : hasError
    ? 'Operation failed'
    : meta.idleLabel;

  const handleTerminate = async () => {
    if (!onTerminate || isTerminating) return;
    setIsTerminating(true);
    try {
      await onTerminate();
    } finally {
      setIsTerminating(false);
    }
  };

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
              onClick={onClose}
              disabled={isRunning}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close deployment logs"
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
            {status === 'success' && (
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
            <div className="ml-auto flex items-center gap-3">
              {isRunning && onTerminate && (
                <button
                  onClick={handleTerminate}
                  disabled={isTerminating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTerminating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StopCircle className="w-4 h-4" />
                  )}
                  {isTerminating ? 'Stopping...' : 'Stop'}
                </button>
              )}
              <span className="text-xs text-gray-500">{logs.length} log lines</span>
            </div>
          </div>
        </div>

        {/* Logs Display */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>Connecting to terraform {mode} stream...</p>
            </div>
          ) : (
            <>
              {logs.map((log, index) => (
                <div
                  key={`${log}-${index}`}
                  className="py-0.5 text-gray-200 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }}
                />
              ))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {isRunning && 'Streaming real-time output. Keep this window open...'}
            {status === 'success' && 'Operation finished successfully.'}
            {hasError && 'Terraform encountered issues. Review the logs above.'}
            {status === 'idle' && 'Ready to start the operation.'}
          </div>
          <button
            onClick={onClose}
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
