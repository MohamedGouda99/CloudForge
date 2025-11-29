import { X } from 'lucide-react';

interface InfracostProject {
  name: string;
  metadata: {
    path: string;
  };
  pastBreakdown?: {
    totalMonthlyCost: string;
  };
  breakdown: {
    totalMonthlyCost: string;
    resources: Array<{
      name: string;
      resourceType?: string;
      monthlyCost: string | null;
      costComponents?: Array<{
        name: string;
        monthlyCost: string | null;
        unit: string;
        hourlyQuantity: string | null;
        monthlyQuantity: string | null;
      }>;
    }>;
  };
  diff?: {
    totalMonthlyCost: string;
  };
}

interface InfracostData {
  version: string;
  currency: string;
  totalMonthlyCost: string;
  totalHourlyCost?: string;
  pastTotalMonthlyCost?: string;
  diffTotalMonthlyCost?: string;
  projects: InfracostProject[];
  timeGenerated: string;
}

interface InfracostReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: InfracostData | null;
  status: 'running' | 'success' | 'error' | null;
}

export default function InfracostReportPanel({ isOpen, onClose, data, status }: InfracostReportPanelProps) {
  if (!isOpen) return null;

  const formatCost = (cost: string | null | undefined): string => {
    if (!cost || cost === '0' || cost === 'null') return '$0.00';
    const numCost = parseFloat(cost);
    if (isNaN(numCost)) return '$0.00';
    return `$${numCost.toFixed(2)}`;
  };

  const getCostColor = (cost: string | null | undefined): string => {
    if (!cost || cost === '0' || cost === 'null') return 'text-gray-600';
    const numCost = parseFloat(cost);
    if (isNaN(numCost) || numCost === 0) return 'text-gray-600';
    if (numCost < 10) return 'text-green-600';
    if (numCost < 100) return 'text-yellow-600';
    if (numCost < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const totalCost = data?.totalMonthlyCost || '0';
  const totalCostColor = getCostColor(totalCost);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-teal-50 to-cyan-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Infrastructure Cost Estimate</h2>
            <p className="text-sm text-gray-600 mt-1">
              Powered by Infracost • Currency: {data?.currency || 'USD'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'running' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing infrastructure costs...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">Failed to generate cost estimate</p>
              <p className="text-sm text-red-500 mt-2">Please check your Infracost API key and try again</p>
            </div>
          )}

          {status === 'success' && data && (
            <div className="space-y-6">
              {/* Total Cost Summary */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-8 text-center shadow-sm">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
                  Total Monthly Cost
                </p>
                <p className={`text-6xl font-bold ${totalCostColor}`}>
                  {formatCost(totalCost)}
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  {data.projects?.length || 0} project(s) analyzed
                </p>
              </div>

              {/* Projects Breakdown */}
              {data.projects && data.projects.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-teal-600 rounded"></span>
                    Resources Breakdown
                  </h3>

                  {data.projects.map((project, projectIdx) => (
                    <div key={projectIdx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {/* Project Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{project.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{project.metadata?.path}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Project Cost</p>
                            <p className={`text-2xl font-bold ${getCostColor(project.breakdown?.totalMonthlyCost)}`}>
                              {formatCost(project.breakdown?.totalMonthlyCost)}/mo
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Resources */}
                      {project.breakdown?.resources && project.breakdown.resources.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {project.breakdown.resources.map((resource, resIdx) => {
                            const resourceCost = resource.monthlyCost;
                            const hasCostComponents = resource.costComponents && resource.costComponents.length > 0;

                            return (
                              <div key={resIdx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                      {resource.name}
                                    </p>
                                    {resource.resourceType && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Type: {resource.resourceType}
                                      </p>
                                    )}
                                  </div>
                                  <div className="ml-4 text-right">
                                    <p className={`text-lg font-bold ${getCostColor(resourceCost)}`}>
                                      {formatCost(resourceCost)}
                                    </p>
                                    <p className="text-xs text-gray-500">per month</p>
                                  </div>
                                </div>

                                {/* Cost Components */}
                                {hasCostComponents && (
                                  <div className="mt-3 ml-4 space-y-2">
                                    {resource.costComponents!.map((component, compIdx) => (
                                      <div
                                        key={compIdx}
                                        className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded"
                                      >
                                        <div className="flex-1">
                                          <p className="text-gray-700">{component.name}</p>
                                          {(component.monthlyQuantity || component.hourlyQuantity) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              {component.monthlyQuantity
                                                ? `${parseFloat(component.monthlyQuantity).toFixed(2)} ${component.unit}/month`
                                                : `${parseFloat(component.hourlyQuantity || '0').toFixed(2)} ${component.unit}/hour`
                                              }
                                            </p>
                                          )}
                                        </div>
                                        <p className={`font-semibold ${getCostColor(component.monthlyCost)}`}>
                                          {formatCost(component.monthlyCost)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                          <p>No resources with cost data found</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Legend */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Cost Color Guide
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <span className="text-gray-700">Free / $0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span className="text-gray-700">&lt; $10/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span className="text-gray-700">$10-$100/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <span className="text-gray-700">$100-$500/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-gray-700">&gt; $500/mo</span>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>Generated at: {data.timeGenerated ? new Date(data.timeGenerated).toLocaleString() : 'N/A'}</p>
                <p className="mt-1">Infracost Version: {data.version || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
