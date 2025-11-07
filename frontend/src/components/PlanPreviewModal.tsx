import { useEffect, useMemo, useState } from 'react';
import { Loader2, ClipboardList, AlertTriangle, CheckCircle2, Copy, X } from 'lucide-react';
import { ansiToHtml } from '../lib/utils/ansi';

type PlanStatus = 'idle' | 'running' | 'success' | 'error';

interface PlanPreviewModalProps {
  isOpen: boolean;
  status: PlanStatus;
  hasChanges: boolean | null;
  error: string;
  content: string;
  onClose: () => void;
  onConfirmDeploy: () => void;
}

export default function PlanPreviewModal({
  isOpen,
  status,
  hasChanges,
  error,
  content,
  onClose,
  onConfirmDeploy,
}: PlanPreviewModalProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (!isOpen) {
      setCopyStatus('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const statusSummary = useMemo(() => {
    if (status === 'error') {
      return 'Plan failed - review the logs below';
    }
    if (status === 'success') {
      if (hasChanges) {
        return 'Changes detected - review before applying';
      }
      if (hasChanges === false) {
        return 'No changes detected';
      }
    }
    return 'Running terraform plan...';
  }, [status, hasChanges]);

  const renderedContent = useMemo(() => {
    if (!content) return [];
    return content.split('\n').map((line, index) => (
      <div
        key={`${line}-${index}`}
        className="text-gray-200 whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: ansiToHtml(line) }}
      />
    ));
  }, [content]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!content || status === 'running') {
      return;
    }

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setCopyStatus('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('copied');
    } catch (copyError) {
      console.error('Copy plan output failed:', copyError);
      setCopyStatus('error');
    }
  };

  const copyLabel =
    copyStatus === 'copied'
      ? 'Copied'
      : copyStatus === 'error'
      ? 'Copy failed'
      : 'Copy plan';
  const loading = status === 'running';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Preview Changes</h2>
                <p className="text-sm text-gray-600">Review what will be created, modified, or destroyed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={loading || !content}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                <span>{copyLabel}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-transparent p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Close plan preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 border-b" data-status={status}>
          <div className="flex items-center gap-2">
            {status === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {status === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-medium text-gray-900">{statusSummary}</span>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Plan Output */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-3 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="text-sm font-medium">
                <p>Streaming terraform plan output...</p>
                <p className="text-xs text-blue-300/70">Keep this window open while the plan runs.</p>
              </div>
            </div>
          )}

          {content ? (
            <div className="space-y-1">{renderedContent}</div>
          ) : (
            !loading &&
            !error && (
              <div className="text-center py-12 text-gray-500">
                <p>No plan output yet</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            {status === 'running' && 'Streaming live terraform output...'}
            {status === 'success' && hasChanges && 'Review changes before applying.'}
            {status === 'success' && hasChanges === false && 'Infrastructure is up to date.'}
            {status === 'error' && 'Terraform plan encountered issues.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmDeploy}
              disabled={status !== 'success'}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
