import { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TerraformCodeEditor from './TerraformCodeEditor';
import * as codeGen from '../lib/terraform/codeGenerator';
import apiClient from '../lib/api/client';
import { useAuthStore } from '../lib/store/authStore';

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
  projectId?: string;
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
  projectId,
}: DesignerWithCodeViewProps) {
  const isControlled = typeof showCode === 'boolean';
  const [internalShowCode, setInternalShowCode] = useState(defaultShowCode);
  const visible = isControlled ? (showCode as boolean) : internalShowCode;
  const [terraformCode, setTerraformCode] = useState('');
  const [fileList, setFileList] = useState<{ name: string; content: string }[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Generate Terraform code whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      const generator = (codeGen as any).generateTerraformCode
        ? (codeGen as any).generateTerraformCode
        : (_nodes: any[], _edges: any[], prov: string) => `terraform {\n}\n\nprovider "${prov || 'aws'}" {}\n`;
      const code = generator(nodes, edges, provider);
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

  useEffect(() => {
    // Get region config from localStorage credentials
  const getRegionConfig = (): Record<string, string> => {
    const credStr = localStorage.getItem(`credentials_${provider}`);
    if (!credStr) return {};
    try {
      const creds = JSON.parse(credStr);
      const config: Record<string, string> = {};
      if (provider === 'aws') {
        if (creds.aws_region) config.aws_region = creds.aws_region;
        if (creds.aws_endpoint_url) config.aws_endpoint_url = creds.aws_endpoint_url;
      } else if (provider === 'azure' && creds.azure_location) {
        config.azure_location = creds.azure_location;
      } else if (provider === 'gcp') {
        if (creds.gcp_region) config.gcp_region = creds.gcp_region;
        if (creds.gcp_project_id) config.gcp_project = creds.gcp_project_id;
      }
      return config;
    } catch {
      return {};
    }
  };

  const fetchFiles = async () => {
      if (!visible || !projectId || !token) {
        setFileList([]);
        setActiveFile(null);
        return;
      }

      setLoadingFiles(true);
      try {
        // Ensure generation is up to date in the backend with region config
        await apiClient.post(
          `/api/terraform/generate/${projectId}`,
          getRegionConfig(),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const response = await apiClient.get<Record<string, string>>(
          `/api/terraform/files/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const entries = Object.entries(response.data || {}).map(([name, content]) => ({
          name,
          content,
        }));

        // Sort so root files appear first
        entries.sort((a, b) => a.name.localeCompare(b.name));

        setFileList(entries);
        setActiveFile((prev) => prev && entries.find((f) => f.name === prev) ? prev : entries[0]?.name ?? null);
      } catch (error) {
        console.error('Failed to load Terraform files', error);
        setFileList([]);
        setActiveFile(null);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [visible, projectId, token, nodes.length, edges.length]);

  const updateVisibility = (value: boolean) => {
    if (!isControlled) {
      setInternalShowCode(value);
    }
    onShowCodeChange?.(value);
  };

  const showingBackendFiles = fileList.length > 0 && activeFile;
  const displayedCode = showingBackendFiles
    ? fileList.find((f) => f.name === activeFile)?.content || ''
    : terraformCode;

  if (!visible) {
    return (
      <div className="relative h-full w-full">
        {children}

        {floatingToggle && (
          <button
            onClick={() => updateVisibility(true)}
            className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:brightness-105 transition-colors flex items-center gap-2 z-10"
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
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full shadow-lg text-xs z-10 bg-card/90 text-foreground border border-border">
            {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
          </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-2 bg-transparent hover:bg-primary/40 transition-colors cursor-col-resize" />

      {/* Code Editor Panel */}
      <Panel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col bg-[#0f172a]">
          {/* Code Panel Header */}
          <div className="bg-[#111827] text-white px-4 py-2 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold">Terraform Configuration</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const content = displayedCode || '';
                  if (!content) return;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = showingBackendFiles ? (activeFile || 'main.tf') : 'main.tf';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded transition-colors"
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

          {showingBackendFiles && (
            <div className="flex items-center gap-2 overflow-x-auto bg-[#0b1224] px-4 py-2 border-b border-gray-800">
              {fileList.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    activeFile === file.name ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {file.name}
                </button>
              ))}
              {loadingFiles && <span className="text-xs text-gray-400">Refreshing…</span>}
            </div>
          )}

          {/* Code Stats */}
          <div className="bg-[#0b1224] px-4 py-2 text-sm text-gray-400 border-b border-gray-800 flex items-center gap-4">
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
              code={displayedCode}
              readOnly={true}
              height="100%"
            />
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
}
