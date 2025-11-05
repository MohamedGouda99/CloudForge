import { useState, useEffect } from 'react';
import { Loader2, ClipboardList, AlertTriangle, CheckCircle2, Copy, X } from 'lucide-react';
import apiClient from '../lib/api/client';
import { useAuthStore } from '../lib/store/authStore';

interface PlanPreviewModalProps {
  projectId: string;
  credentials: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeploy: () => void;
}

export default function PlanPreviewModal({
  projectId,
  credentials,
  isOpen,
  onClose,
  onConfirmDeploy,
}: PlanPreviewModalProps) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [planOutput, setPlanOutput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (isOpen && credentials) {
      runPlan();
    }

    if (!isOpen) {
      setCopyStatus('idle');
    }
  }, [isOpen]);

  const runPlan = async () => {
    try {
      setLoading(true);
      setError('');
      setPlanOutput('');
      setCopyStatus('idle');

      const response = await apiClient.post(
        `/api/terraform/plan/${projectId}`,
        credentials,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPlanOutput(response.data.plan_output || '');
        setHasChanges(response.data.has_changes || false);
      } else {
        setError(response.data.error || 'Plan failed');
        setPlanOutput(response.data.output || '');
      }
    } catch (err: any) {
      console.error('Plan error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to run terraform plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (copyStatus === 'idle') {
      return;
    }

    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const handleCopy = async () => {
    if (!planOutput || loading) {
      return;
    }

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setCopyStatus('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(planOutput);
      setCopyStatus('copied');
    } catch (copyError) {
      console.error('Copy plan output failed:', copyError);
      setCopyStatus('error');
    }
  };

  if (!isOpen) return null;

  const copyLabel =
    copyStatus === 'copied'
      ? 'Copied'
      : copyStatus === 'error'
      ? 'Copy failed'
      : 'Copy plan';

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
                <p className="text-sm text-gray-600">
                  Review what will be created, modified, or destroyed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={loading || !planOutput}
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
        {!loading && !error && (
          <div
            className={`px-6 py-3 border-b ${
              hasChanges ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {hasChanges ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Changes detected - review below before applying
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    No changes - infrastructure is up to date
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Plan failed: {error}</span>
            </div>
          </div>
        )}

        {/* Plan Output */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Running terraform plan...</p>
              <p className="text-gray-500 text-xs mt-2">This may take a minute</p>
            </div>
          )}

          {!loading && planOutput && (
            <pre className="text-gray-300 whitespace-pre-wrap">{planOutput}</pre>
          )}

          {!loading && !planOutput && !error && (
            <div className="text-center py-12 text-gray-500">
              <p>No plan output available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-4">
          <div className="text-sm text-gray-600 flex-1">
            {hasChanges && !error && !loading && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Ready to apply changes?</p>
                  <p className="text-xs mt-1">
                    This will create, modify, or destroy real cloud resources.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            {hasChanges && !error && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmDeploy();
                }}
                disabled={loading}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                Apply Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
