import { useEffect, useRef } from 'react';
import { X, Terminal, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ansiToHtml } from '../lib/utils/ansi';

interface TerraformLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  operation: 'validate' | 'plan' | 'apply' | 'destroy' | 'pipeline' | 'tfsec' | 'terrascan' | null;
  status: 'running' | 'success' | 'error' | 'idle';
}

export default function TerraformLogsPanel({
  isOpen,
  onClose,
  logs,
  operation,
  status,
}: TerraformLogsPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isOpen) return null;

  type OperationType = Exclude<TerraformLogsPanelProps['operation'], null>;

  const operationTitles: Record<OperationType, string> = {
    validate: 'Terraform Validate',
    plan: 'Terraform Plan',
    apply: 'Terraform Apply',
    destroy: 'Terraform Destroy',
    pipeline: 'Pipeline Logs',
    tfsec: 'Tfsec Security Scan',
    terrascan: 'Terrascan Security Scan',
  };

  const operationHeaderClasses: Record<OperationType, string> = {
    validate: 'bg-indigo-600',
    plan: 'bg-purple-600',
    apply: 'bg-green-600',
    destroy: 'bg-red-600',
    pipeline: 'bg-blue-600',
    tfsec: 'bg-orange-600',
    terrascan: 'bg-amber-600',
  };

  const headerBgClass = operation ? operationHeaderClasses[operation] : 'bg-gray-800';

  const StatusIcon = () => {
    if (status === 'running') {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (status === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (status === 'error') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Terminal className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-[500px] bg-gray-900 border-l border-gray-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className={`${headerBgClass} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <StatusIcon />
          <div>
            <h3 className="text-white font-semibold">
              {operation ? operationTitles[operation] : 'Terraform Logs'}
            </h3>
            <p className="text-xs text-white/80">
              {status === 'running' && 'Executing...'}
              {status === 'success' && 'Completed successfully'}
              {status === 'error' && 'Failed with errors'}
              {status === 'idle' && 'Ready'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close logs panel"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Logs Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-900">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No logs yet</p>
              <p className="text-xs mt-1">Run a Terraform operation to see output</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => {
              const normalized = log.toLowerCase();
              const lineClass =
                normalized.includes('error') || normalized.includes('fail')
                  ? 'text-red-400'
                  : normalized.includes('success') || normalized.includes('complete')
                  ? 'text-green-400'
                  : normalized.includes('warning')
                  ? 'text-yellow-400'
                  : log.startsWith('>')
                  ? 'text-blue-400 font-semibold'
                  : 'text-gray-300';

              return (
                <div
                  key={index}
                  className={`whitespace-pre-wrap break-words ${lineClass}`}
                  dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }}
                />
              );
            })}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{logs.length} lines</span>
          {status === 'running' && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Streaming...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
