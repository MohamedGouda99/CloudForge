import { useEffect, useRef } from 'react';
import {
  Rocket,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface DeploymentStatusProps {
  deployStatus: 'idle' | 'running' | 'success' | 'error';
  deployMode: 'plan' | 'validate' | 'apply' | 'destroy';
  deployLogs: string[];
}

export default function DeploymentStatus({
  deployStatus,
  deployMode,
  deployLogs,
}: DeploymentStatusProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (deployStatus === 'running' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deployLogs, deployStatus]);

  if (deployStatus === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse" />
          <Rocket className="relative w-24 h-24 text-gray-300 dark:text-gray-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-3">Ready to Deploy</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">
          Use the toolbar to plan, apply, or destroy your infrastructure
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
      {/* Status Card - Compact but prominent */}
      <div className={`flex-shrink-0 relative overflow-hidden rounded-2xl border-2 transition-all duration-500 shadow-xl ${
        deployStatus === 'running'
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400'
          : deployStatus === 'success'
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400'
          : 'bg-gradient-to-r from-red-500 to-orange-600 border-red-400'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-5">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {deployStatus === 'running' ? (
                <Loader2 className="w-9 h-9 text-white animate-spin" />
              ) : deployStatus === 'success' ? (
                <CheckCircle2 className="w-9 h-9 text-white" />
              ) : (
                <XCircle className="w-9 h-9 text-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white">
                {deployStatus === 'running'
                  ? deployMode === 'plan' ? 'Planning...'
                    : deployMode === 'validate' ? 'Validating...'
                    : deployMode === 'apply' ? 'Deploying...'
                    : 'Destroying...'
                  : deployStatus === 'success'
                  ? deployMode === 'plan' ? 'Plan Complete!'
                    : deployMode === 'validate' ? 'Validated!'
                    : deployMode === 'apply' ? 'Deployed!'
                    : 'Destroyed!'
                  : deployMode === 'plan' ? 'Plan Failed'
                    : deployMode === 'validate' ? 'Validation Failed'
                    : deployMode === 'apply' ? 'Deploy Failed'
                    : 'Destroy Failed'
                }
              </h3>
              <p className="text-lg text-white/80 mt-1">
                {deployStatus === 'running'
                  ? deployMode === 'plan' ? 'Terraform is analyzing changes...'
                    : deployMode === 'validate' ? 'Terraform is checking configuration...'
                    : deployMode === 'apply' ? 'Terraform is executing changes...'
                    : 'Terraform is removing infrastructure...'
                  : deployStatus === 'success'
                  ? deployMode === 'plan' ? 'Plan executed successfully'
                    : deployMode === 'validate' ? 'Configuration is valid'
                    : deployMode === 'apply' ? 'All changes applied successfully'
                    : 'Infrastructure destroyed successfully'
                  : 'Check logs for details'
                }
              </p>
            </div>
          </div>

          {/* Progress bar for running */}
          {deployStatus === 'running' && (
            <div className="mt-5 h-3 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full"
                   style={{ width: '60%', animation: 'progress 2s ease-in-out infinite' }} />
            </div>
          )}

          {/* Resource Summary - Inline in status card */}
          {deployStatus === 'success' && deployLogs.length > 0 && (() => {
            const logsText = deployLogs.join('\n');
            const addedMatch = logsText.match(/(\d+)\s+added/);
            const changedMatch = logsText.match(/(\d+)\s+changed/);
            const destroyedMatch = logsText.match(/(\d+)\s+destroyed/);
            const added = addedMatch ? parseInt(addedMatch[1]) : 0;
            const changed = changedMatch ? parseInt(changedMatch[1]) : 0;
            const destroyed = destroyedMatch ? parseInt(destroyedMatch[1]) : 0;

            return (
              <div className="flex gap-6 mt-5 pt-5 border-t border-white/20">
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{added}</p>
                  <p className="text-base text-white/70 font-semibold">Added</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{changed}</p>
                  <p className="text-base text-white/70 font-semibold">Changed</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{destroyed}</p>
                  <p className="text-base text-white/70 font-semibold">Destroyed</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Logs Preview - Fills remaining space */}
      {deployLogs.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">Output Log</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{deployLogs.length} lines</span>
          </div>
          <div className="flex-1 bg-gray-900 dark:bg-black rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col min-h-0">
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs text-gray-400 font-semibold">terraform</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-0.5 font-mono text-xs leading-relaxed">
                {deployLogs.map((log, idx) => {
                  const cleanLog = log.replace(/\x1b\[[0-9;]*m/g, '').replace(/\[0m/g, '').replace(/\[1m/g, '');
                  if (!cleanLog.trim()) return null;

                  let textColor = 'text-gray-300';
                  if (cleanLog.includes('Creation complete') || cleanLog.includes('created')) {
                    textColor = 'text-emerald-400';
                  } else if (cleanLog.includes('Destruction complete') || cleanLog.includes('destroyed')) {
                    textColor = 'text-red-400';
                  } else if (cleanLog.includes('Modifying') || cleanLog.includes('modified')) {
                    textColor = 'text-amber-400';
                  } else if (cleanLog.includes('Error') || cleanLog.includes('error')) {
                    textColor = 'text-red-500 font-bold';
                  } else if (cleanLog.includes('Apply complete') || cleanLog.includes('Destroy complete')) {
                    textColor = 'text-cyan-400 font-bold';
                  }

                  return (
                    <div key={idx} className={textColor}>
                      {cleanLog}
                    </div>
                  );
                })}
                {/* Auto-scroll target for live logs */}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
