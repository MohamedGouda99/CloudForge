import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pipelineApi, Pipeline, PipelineRun } from '../../lib/api/pipelineClient';
import TerraformLogsPanel from '../../components/TerraformLogsPanel';
import { useAuthStore } from '../../lib/store/authStore';

export default function CICDPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id ?? 1;
  const projectId = parseInt(id || '0');
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [currentRun, setCurrentRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logsPanelOpen, setLogsPanelOpen] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [pipelineLogStatus, setPipelineLogStatus] = useState<'running' | 'success' | 'error' | 'idle'>('idle');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const logSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    loadPipeline();
  }, [projectId]);

  const loadPipeline = async (retryCount = 0) => {
    try {
      setLoading(true);
      const data = await pipelineApi.getPipeline(projectId);
      setPipeline(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load pipeline:', err);

      // Retry logic: if it's a network/timeout error and we haven't retried too many times
      if (retryCount < 2 && (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error'))) {
        console.log(`Retrying pipeline connection (attempt ${retryCount + 1})...`);
        setTimeout(() => loadPipeline(retryCount + 1), 2000);
        return;
      }

      setError(err.response?.data?.detail || 'Failed to connect to pipeline service');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!pipeline) return;

    try {
      if (logSourceRef.current) {
        logSourceRef.current.close();
        logSourceRef.current = null;
      }
      const run = await pipelineApi.triggerRun(pipeline.id, currentUserId);
      setCurrentRun(run);
      setPipelineLogs([`> Starting pipeline run #${run.id}`]);
      setPipelineLogStatus('running');
      setLogsPanelOpen(true);
    } catch (err: any) {
      alert('Failed to start pipeline: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Connect to pipeline log stream whenever there is an active run.
  useEffect(() => {
    if (!currentRun) {
      if (logSourceRef.current) {
        logSourceRef.current.close();
        logSourceRef.current = null;
      }
      return;
    }

    setLogsPanelOpen(true);
    const source = pipelineApi.streamLogs(currentRun.id);
    logSourceRef.current = source;

    source.onmessage = (event) => {
      const raw = event.data;
      let message = raw;
      try {
        const payload = JSON.parse(raw);
        if (payload?.message) {
          message = payload.message;
        }
      } catch {
        // keep raw message
      }
      setPipelineLogs((prev) => [...prev, message]);
    };

    source.onerror = () => {
      setPipelineLogStatus((prev) => (prev === 'success' ? prev : 'error'));
      source.close();
    };

    return () => {
      source.close();
      logSourceRef.current = null;
    };
  }, [currentRun?.id]);

  // Poll run status while it is in progress.
  useEffect(() => {
    if (!currentRun) {
      return;
    }

    const finalStates = ['success', 'failed', 'cancelled'];
    if (finalStates.includes(currentRun.status)) {
      setPipelineLogStatus(currentRun.status === 'success' ? 'success' : 'error');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await pipelineApi.getRunStatus(currentRun.id);
        setCurrentRun(updated);
        if (finalStates.includes(updated.status)) {
          setPipelineLogStatus(updated.status === 'success' ? 'success' : 'error');
        }
      } catch (err) {
        console.error('Failed to refresh pipeline run:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentRun]);

  const formatStatus = (value?: string) => {
    if (!value) return 'pending';
    return value.replace(/_/g, ' ').toLowerCase();
  };

  const stageStatus = (stageName: string) => {
    const stage = currentRun?.stage_runs?.find((s) => s.stage_name === stageName);
    return formatStatus(stage?.status);
  };

  const approvalStage = currentRun?.stage_runs?.find((s) => s.stage_name === 'approval');
  const approvalStageStatus = approvalStage?.status?.toLowerCase();
  const awaitingApproval =
    currentRun?.status === 'waiting_approval' ||
    (approvalStageStatus ? ['pending', 'running', 'waiting', 'waiting_approval'].includes(approvalStageStatus) : false);

  const submitApprovalAction = async (action: 'approve' | 'reject') => {
    if (!approvalStage) return;
    setApprovalAction(action);
    setApprovalError(null);

    try {
      if (action === 'approve') {
        await pipelineApi.approveStage(approvalStage.id, currentUserId);
        setPipelineLogs((prev) => [...prev, `> Approval granted by ${user?.full_name || 'user'} (${currentUserId})`]);
      } else {
        const reason = window.prompt('Optional: provide a reason for rejection', '') || undefined;
        await pipelineApi.rejectStage(approvalStage.id, currentUserId, reason);
        setPipelineLogs((prev) => [
          ...prev,
          `> Approval rejected by ${user?.full_name || 'user'} (${currentUserId})${reason ? `: ${reason}` : ''}`,
        ]);
      }
    } catch (err: any) {
      setApprovalError(err.response?.data?.detail || err.message || 'Failed to submit approval action');
    } finally {
      setApprovalAction(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CI/CD Pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-center text-gray-900">Pipeline Service Unavailable</h3>
          <p className="mt-2 text-sm text-center text-gray-600">{error}</p>
          <p className="mt-4 text-xs text-center text-gray-500">
            Make sure the pipeline-api and pipeline-worker containers are running.
          </p>
          <button
            onClick={() => loadPipeline()}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CI/CD Pipeline</h1>
              <p className="text-sm text-gray-600 mt-1">
                Automated Terraform validation, security scanning, cost analysis, and deployment
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRunPipeline}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Pipeline
              </button>
              <button
                onClick={() => setLogsPanelOpen(true)}
                disabled={pipelineLogs.length === 0}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Pipeline Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Status</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{pipeline?.enabled ? 'Enabled' : 'Disabled'}</div>
                  <div className="text-sm text-gray-600 mt-1">Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{currentRun?.id || '-'}</div>
                  <div className="text-sm text-gray-600 mt-1">Latest Run</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{currentRun?.status || 'N/A'}</div>
                  <div className="text-sm text-gray-600 mt-1">Run Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">4</div>
                  <div className="text-sm text-gray-600 mt-1">Stages</div>
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Stages</h2>

              <div className="flex items-center justify-between">
                {/* Stage 1: Validate */}
                <div className="flex-1">
                  <div className="bg-blue-100 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">Terraform Validate</div>
                    <div className="text-sm text-gray-600 mt-1">Init & Validate</div>
                    <div className="text-xs text-gray-500 mt-2 capitalize">Status: {stageStatus('validate')}</div>
                  </div>
                </div>

                <div className="w-8 flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Stage 2: Analysis (Parallel) */}
                <div className="flex-1">
                  <div className="bg-purple-100 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">Security & Cost</div>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      <div>- Tfsec: {stageStatus('tfsec')}</div>
                      <div>- Terrascan: {stageStatus('terrascan')}</div>
                      <div>- Infracost: {stageStatus('infracost')}</div>
                    </div>
                  </div>
                </div>

                <div className="w-8 flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Stage 3: Approval */}
                <div className="flex-1">
                  <div className="bg-orange-100 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-orange-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">Manual Approval</div>
                    <div className="text-sm text-gray-600 mt-1">Review & Approve</div>
                    <div className="text-xs text-gray-500 mt-2 capitalize">Status: {stageStatus('approval')}</div>
                  </div>
                </div>

                <div className="w-8 flex justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Stage 4: Apply */}
                <div className="flex-1">
                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full mx-auto flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">Terraform Apply</div>
                    <div className="text-sm text-gray-600 mt-1">Deploy Infrastructure</div>
                    <div className="text-xs text-gray-500 mt-2 capitalize">Status: {stageStatus('apply')}</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">CI/CD Pipeline Active</h3>
                <p className="text-sm text-blue-700 mt-1">
                  The pipeline service is running. Click "Run Pipeline" to execute Terraform validation, security scans (tfsec, Terrascan),
                  cost analysis (Infracost), and deployment with manual approval.
                </p>
              </div>
            </div>
          </div>

          {awaitingApproval && approvalStage && (
            <div className="mt-6 border border-yellow-300 rounded-lg p-5 bg-yellow-50">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18h.01" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14" />
                    </svg>
                    Manual approval required
                  </div>
                  <p className="text-sm text-yellow-900 mt-1">
                    Review the security/cost findings and approve to continue, or reject to cancel run #{currentRun?.id}.
                  </p>
                  <div className="text-xs text-yellow-900 mt-2">
                    Stage ID: {approvalStage.id} • Requested at:{' '}
                    {approvalStage.started_at ? new Date(approvalStage.started_at).toLocaleString() : '-'}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => submitApprovalAction('approve')}
                    disabled={approvalAction === 'approve'}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {approvalAction === 'approve' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => submitApprovalAction('reject')}
                    disabled={approvalAction === 'reject'}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {approvalAction === 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
              {approvalError && <p className="text-sm text-red-600 mt-3">{approvalError}</p>}
            </div>
          )}
        </div>
      </div>
      </div>

      <TerraformLogsPanel
        isOpen={logsPanelOpen}
        onClose={() => setLogsPanelOpen(false)}
        logs={pipelineLogs}
        operation="pipeline"
        status={pipelineLogStatus}
      />
    </>
  );
}
