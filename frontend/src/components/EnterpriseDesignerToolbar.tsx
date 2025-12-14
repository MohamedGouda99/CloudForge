import { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Eye,
  Code,
  Play,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Shield,
  GitBranch,
  Share2,
  MoreHorizontal,
} from 'lucide-react';

interface EnterpriseDesignerToolbarProps {
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleGrid?: () => void;
  onToggleCode?: () => void;
  onValidate?: () => void;
  onDeploy?: () => void;
  onCostEstimate?: () => void;
  projectName?: string;
  cloudProvider?: string;
  lastSaved?: string;
  hasUnsavedChanges?: boolean;
}

export default function EnterpriseDesignerToolbar({
  onSave,
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onToggleCode,
  onValidate,
  onDeploy,
  onCostEstimate,
  projectName = 'Untitled Project',
  cloudProvider = 'aws',
  lastSaved,
  hasUnsavedChanges = false,
}: EnterpriseDesignerToolbarProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const providerColors = {
    aws: 'bg-orange-100 text-orange-700 border-orange-300',
    azure: 'bg-blue-100 text-blue-700 border-blue-300',
    gcp: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Project Info */}
        <div className="flex items-center gap-4">
          <img src="/vodafone.png" alt="Vodafone" className="h-8 w-auto" />
          <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{projectName}</h2>
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lastSaved ? `Last saved ${lastSaved}` : 'Not saved yet'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${providerColors[cloudProvider as keyof typeof providerColors] || providerColors.aws}`}>
            {cloudProvider.toUpperCase()}
          </span>
        </div>

        {/* Right: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onDeploy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Deploy</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={onImport}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Diagram
                </button>
                <button
                  onClick={onExport}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Terraform
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={onCostEstimate}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Cost Estimate
                </button>
                <button
                  onClick={onValidate}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Security Scan
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Version History
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
        {/* Left: View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onFitView}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Fit to View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
          
          <button
            onClick={onToggleGrid}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleCode}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
            title="Toggle Code View"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 dark:text-gray-400">Connected</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Validated</span>
          </div>
        </div>

        {/* Right: Vodafone Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Powered by</span>
          <img src="/vodafone.png" alt="Vodafone" className="h-4 w-auto" />
        </div>
      </div>
    </div>
  );
}

