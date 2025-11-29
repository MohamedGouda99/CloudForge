import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowApi, Workflow } from '../../lib/api/workflowClient';

const WorkflowListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadWorkflows();
    }
  }, [projectId]);

  const loadWorkflows = async (retryCount = 0) => {
    try {
      setIsLoading(true);
      const data = await workflowApi.listWorkflows(parseInt(projectId!));
      setWorkflows(data);
    } catch (error: any) {
      console.error('Failed to load workflows:', error);
      // Retry logic: if it's a network/timeout error and we haven't retried too many times
      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error'))) {
        console.log(`Retrying workflows load (attempt ${retryCount + 1})...`);
        setTimeout(() => loadWorkflows(retryCount + 1), 2000);
        return; // Don't set loading to false yet
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate(`/projects/${projectId}/workflows/new`);
  };

  const handleEditWorkflow = (workflowId: number) => {
    navigate(`/projects/${projectId}/workflows/${workflowId}/edit`);
  };

  const handleDeleteWorkflow = async (workflowId: number, workflowName: string) => {
    if (confirm(`Are you sure you want to delete workflow "${workflowName}"?`)) {
      try {
        await workflowApi.deleteWorkflow(workflowId);
        loadWorkflows();
      } catch (error: any) {
        alert(`Failed to delete workflow: ${error.message}`);
      }
    }
  };

  const handleRunWorkflow = async (workflowId: number) => {
    try {
      const result = await workflowApi.triggerWorkflowRun(workflowId, 1);
      navigate(`/projects/${projectId}/workflows/${workflowId}/runs/${result.id}`);
    } catch (error: any) {
      alert(`Failed to trigger workflow: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CI/CD Workflows</h1>
            <p className="text-gray-600 mt-1">Build and manage custom deployment workflows</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Workflow
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">No workflows yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first workflow to automate Terraform deployments
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {workflow.description || 'No description'}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      workflow.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {workflow.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{workflow.nodes.length} nodes</span>
                  <span>•</span>
                  <span>{workflow.edges.length} connections</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunWorkflow(workflow.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!workflow.enabled}
                  >
                    ▶ Run
                  </button>
                  <button
                    onClick={() => handleEditWorkflow(workflow.id)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowListPage;
