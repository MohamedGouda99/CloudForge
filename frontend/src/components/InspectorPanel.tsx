import { useState, useEffect, useCallback, useRef } from 'react';
import { Node } from 'reactflow';
import {
  ChevronRight,
  Code2,
  Layout,
  Rocket,
  Sparkles,
  FileCode,
} from 'lucide-react';
import AIInspectorPanel from './AIInspectorPanel';
import {
  PropertyEditor,
  TerraformPreview,
  DeploymentStatus,
  ResourceList,
  TabType,
  MIN_PANEL_WIDTH,
  MAX_PANEL_WIDTH,
  DEFAULT_PANEL_WIDTH,
} from './inspector';

interface InspectorPanelProps {
  nodes: Node[];
  terraformFiles: Record<string, string>;
  selectedNode: Node | null;
  onNodeSelect: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: any) => void;
  configPanelOpen?: boolean;
  onCloseConfigPanel?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  panelWidth?: number;
  onWidthChange?: (width: number) => void;
  deployStatus?: 'idle' | 'running' | 'success' | 'error';
  deployMode?: 'plan' | 'validate' | 'apply' | 'destroy';
  deployLogs?: string[];
  provider?: string;
  edges?: any[];
  onImportResources?: (resources: any[], connections: any[]) => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function InspectorPanel({
  nodes,
  terraformFiles,
  selectedNode,
  onNodeSelect,
  onUpdateNode,
  configPanelOpen = false,
  onCloseConfigPanel,
  isCollapsed = false,
  onToggleCollapse,
  panelWidth = DEFAULT_PANEL_WIDTH,
  onWidthChange,
  deployStatus = 'idle',
  deployMode = 'plan',
  deployLogs = [],
  provider = 'aws',
  edges = [],
  onImportResources,
  activeTab: controlledActiveTab,
  onTabChange,
}: InspectorPanelProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('resources');
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Support both controlled and uncontrolled mode
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Auto-switch to Deploy tab when deployment starts
  useEffect(() => {
    if (deployStatus === 'running') {
      setActiveTab('deploy');
    }
  }, [deployStatus]);

  // Switch to resources tab when config panel opens
  useEffect(() => {
    if (configPanelOpen && selectedNode) {
      setActiveTab('resources');
    }
  }, [configPanelOpen, selectedNode?.id]);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!onWidthChange) return;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const windowWidth = window.innerWidth;
        const newWidth = windowWidth - e.clientX;
        const clampedWidth = Math.min(Math.max(newWidth, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
        onWidthChange(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafId);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  // Only 'region' and 'container' are pure containers
  const containerNodes = nodes.filter(n => ['region', 'container'].includes(n.type || ''));
  const resourceNodes = nodes.filter(n => !['region', 'container'].includes(n.type || ''));

  // Calculate current width based on collapsed state
  const currentWidth = isCollapsed ? 0 : panelWidth;

  return (
    <div className="h-full relative flex">
      {/* Toggle Arrow Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l-md shadow-sm flex items-center justify-center hover:bg-[#714EFF] hover:border-[#714EFF] transition-all duration-300 group"
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        <ChevronRight
          className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-all duration-300"
          style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </button>

      {/* Main Panel */}
      <div
        ref={panelRef}
        style={{
          width: currentWidth,
          minWidth: isCollapsed ? 0 : MIN_PANEL_WIDTH,
          transition: isResizing ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col relative shadow-lg overflow-hidden"
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-10 ${isResizing ? 'bg-[#714EFF]' : 'bg-transparent hover:bg-[#714EFF]/50'} transition-colors`}
          />
        )}

        {/* Panel Content */}
        <div
          className="flex flex-col h-full"
          style={{
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 200ms ease-in-out',
            transitionDelay: isCollapsed ? '0ms' : '150ms',
            pointerEvents: isCollapsed ? 'none' : 'auto'
          }}
        >
          {/* Panel Header */}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-center px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#714EFF] animate-pulse" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Inspector</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-2 pb-2 gap-1">
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'resources'
                    ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Resources
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'code'
                    ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code
              </button>
              <button
                onClick={() => setActiveTab('deploy')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'deploy'
                    ? 'text-white bg-[#714EFF] shadow-md shadow-[#714EFF]/25'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'ai'
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-500/25'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Resources Tab */}
            {activeTab === 'resources' && !configPanelOpen && (
              <ResourceList
                nodes={nodes}
                selectedNode={selectedNode}
                onNodeSelect={onNodeSelect}
              />
            )}

            {/* Config Panel */}
            {activeTab === 'resources' && configPanelOpen && selectedNode && (
              <PropertyEditor
                selectedNode={selectedNode}
                nodes={nodes}
                onUpdateNode={onUpdateNode}
                onClose={onCloseConfigPanel}
              />
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <TerraformPreview terraformFiles={terraformFiles} />
            )}

            {/* Deploy Tab */}
            {activeTab === 'deploy' && (
              <div className="p-4 h-full flex flex-col overflow-y-auto">
                <DeploymentStatus
                  deployStatus={deployStatus}
                  deployMode={deployMode}
                  deployLogs={deployLogs}
                />
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <AIInspectorPanel
                provider={provider}
                currentCanvas={{ nodes, edges }}
                onImportResources={onImportResources}
              />
            )}
          </div>

          {/* Footer */}
          {activeTab !== 'ai' && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{resourceNodes.length} resources</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{containerNodes.length} regions</span>
                  </div>
                </div>
                {activeTab === 'code' && Object.keys(terraformFiles).length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{Object.keys(terraformFiles).length} files</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
