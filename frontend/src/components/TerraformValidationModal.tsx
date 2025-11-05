import { useMemo } from 'react';

interface TerraformValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Record<string, any> | null;
}

const formatStageLabel = (stage?: string) => {
  if (!stage) return 'terraform validate';
  return stage === 'init' ? 'terraform init' : `terraform ${stage}`;
};

export default function TerraformValidationModal({
  isOpen,
  onClose,
  result,
}: TerraformValidationModalProps) {
  const success = !!result?.success && result?.valid !== false;
  const diagnostics = useMemo(() => {
    const raw = result?.validation_output?.diagnostics;
    return Array.isArray(raw) ? raw : [];
  }, [result]);

  if (!isOpen || !result) {
    return null;
  }

  const stageLabel = formatStageLabel(result.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            success ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Terraform Validation {success ? 'Passed' : 'Failed'}
              </h2>
              <p className="text-sm text-slate-600">
                {success
                  ? result.message || 'Your Terraform configuration passed validation.'
                  : `Validation failed during ${stageLabel}. Review the diagnostics below.`}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Diagnostics */}
          {diagnostics.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50">
              <div className="px-4 py-2 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-700">Diagnostics</span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    {diagnostics.length}
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-amber-200">
                {diagnostics.map((diag, index) => (
                  <li key={index} className="px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">
                        {diag.summary || diag.detail || 'Unknown issue'}
                      </span>
                      {diag.severity && (
                        <span className="text-xs uppercase tracking-wide text-amber-600 font-semibold">
                          {diag.severity}
                        </span>
                      )}
                    </div>
                    {diag.range && (
                      <p className="mt-1 text-xs text-amber-700 font-mono">
                        {diag.range.filename}:{diag.range.start?.line ?? '?'}
                      </p>
                    )}
                    {diag.detail && (
                      <p className="mt-2 text-sm text-amber-800 whitespace-pre-wrap">{diag.detail}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}


          {result.error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p className="font-semibold">Error Output</p>
              <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{result.error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {success ? 'No issues detected.' : 'Resolve issues above and re-run validation.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

