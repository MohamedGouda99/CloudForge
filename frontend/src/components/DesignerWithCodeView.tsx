import { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TerraformCodeEditor from './TerraformCodeEditor';
import { generateTerraformCode } from '../lib/terraform/codeGenerator';

interface DesignerWithCodeViewProps {
  nodes: Node[];
  edges: Edge[];
  provider: string;
  children: React.ReactNode;
  onCodeChange?: (code: string) => void;
  showCode?: boolean;
  onShowCodeChange?: (value: boolean) => void;
  floatingToggle?: boolean;
  defaultShowCode?: boolean;
}

export default function DesignerWithCodeView({
  nodes,
  edges,
  provider,
  children,
  onCodeChange,
  showCode,
  onShowCodeChange,
  floatingToggle = true,
  defaultShowCode = false,
}: DesignerWithCodeViewProps) {
  const isControlled = typeof showCode === 'boolean';
  const [internalShowCode, setInternalShowCode] = useState(defaultShowCode);
  const visible = isControlled ? (showCode as boolean) : internalShowCode;
  const [terraformCode, setTerraformCode] = useState('');

  // Generate Terraform code whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const code = generateTerraformCode(nodes, edges, provider);
      setTerraformCode(code);
      if (onCodeChange) {
        onCodeChange(code);
      }
    } else {
      setTerraformCode('# Add resources to the canvas to generate Terraform code');
    }
  }, [nodes, edges, provider, onCodeChange]);

  const resourceCount = useMemo(() => {
    return nodes.filter(n => n.type !== 'region' && n.data?.resourceType).length;
  }, [nodes]);

  useEffect(() => {
    if (isControlled) {
      setInternalShowCode(showCode as boolean);
    }
  }, [isControlled, showCode]);

  const updateVisibility = (value: boolean) => {
    if (!isControlled) {
      setInternalShowCode(value);
    }
    onShowCodeChange?.(value);
  };

  if (!visible) {
    return (
      <div className="relative h-full w-full">
        {children}

        {floatingToggle && (
          <button
            onClick={() => updateVisibility(true)}
            className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 z-10"
            title="Show Terraform Code"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium">View Code</span>
            {resourceCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {resourceCount}
              </span>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <PanelGroup direction="horizontal">
      {/* Canvas Panel */}
      <Panel defaultSize={50} minSize={30}>
        <div className="relative h-full w-full">
          {children}

          {/* Resource Count Badge */}
          <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 rounded-lg shadow-lg text-sm z-10">
            {resourceCount} Resource{resourceCount !== 1 ? 's' : ''}
          </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-blue-500 transition-colors cursor-col-resize" />

      {/* Code Editor Panel */}
      <Panel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col bg-gray-900">
          {/* Code Panel Header */}
          <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold">Terraform Configuration</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([terraformCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'main.tf';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors"
                title="Download Terraform file"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>

              <button
                onClick={() => updateVisibility(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Hide code view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Code Stats */}
          <div className="bg-gray-850 px-4 py-2 text-sm text-gray-400 border-b border-gray-700 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{provider.toUpperCase()}</span>
              <span>•</span>
              <span>{terraformCode.split('\n').filter(l => l.trim().startsWith('resource')).length} Resources</span>
              <span>•</span>
              <span>{terraformCode.split('\n').filter(l => l.trim().startsWith('output')).length} Outputs</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <TerraformCodeEditor
              code={terraformCode}
              readOnly={true}
              height="100%"
            />
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
}
