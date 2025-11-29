import { useState } from 'react';
import { Node, Edge } from 'reactflow';

interface ExportModalProps {
  projectId: string;
  projectName: string;
  nodes: Node[];
  edges: Edge[];
  cloudProvider: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({
  projectId,
  projectName,
  nodes,
  edges,
  cloudProvider,
  isOpen,
  onClose,
}: ExportModalProps) {
  const [exportType, setExportType] = useState<'markdown' | 'json' | 'png'>('markdown');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownDoc = () => {
    const providerName = cloudProvider.toUpperCase();
    let markdown = `# ${projectName}\n\n`;
    markdown += `**Cloud Provider:** ${providerName}\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    markdown += `---\n\n## Architecture Overview\n\n`;
    markdown += `This document describes the infrastructure architecture for the ${projectName} project.\n\n`;

    markdown += `### Resources (${nodes.length})\n\n`;

    // Group nodes by type
    const resourcesByType: { [key: string]: Node[] } = {};
    nodes.forEach(node => {
      const type = node.data.resourceType || 'unknown';
      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }
      resourcesByType[type].push(node);
    });

    for (const [type, resourceNodes] of Object.entries(resourcesByType)) {
      markdown += `#### ${type}\n\n`;
      resourceNodes.forEach(node => {
        const name = node.data.config?.name || node.data.label || node.id;
        markdown += `- **${name}**\n`;

        if (node.data.config && Object.keys(node.data.config).length > 0) {
          markdown += `  - Configuration:\n`;
          Object.entries(node.data.config).forEach(([key, value]) => {
            if (value && String(value).length < 100) {
              markdown += `    - ${key}: \`${value}\`\n`;
            }
          });
        }
        markdown += `\n`;
      });
    }

    markdown += `\n### Connections (${edges.length})\n\n`;
    if (edges.length > 0) {
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        const sourceName = sourceNode?.data.config?.name || sourceNode?.data.label || edge.source;
        const targetName = targetNode?.data.config?.name || targetNode?.data.label || edge.target;
        markdown += `- ${sourceName} → ${targetName}\n`;
      });
    } else {
      markdown += `*No connections defined*\n`;
    }

    markdown += `\n---\n\n`;
    markdown += `## Deployment Instructions\n\n`;
    markdown += `1. Download the Terraform configuration files\n`;
    markdown += `2. Configure your ${providerName} credentials\n`;
    markdown += `3. Run \`terraform init\` to initialize\n`;
    markdown += `4. Run \`terraform plan\` to preview changes\n`;
    markdown += `5. Run \`terraform apply\` to deploy\n\n`;

    markdown += `## Confluence Format\n\n`;
    markdown += `To import into Confluence, copy this markdown content or convert to Confluence Wiki Markup.\n\n`;

    return markdown;
  };

  const generateJSONExport = () => {
    return JSON.stringify({
      projectName,
      projectId,
      cloudProvider,
      exportDate: new Date().toISOString(),
      resources: nodes.map(node => ({
        id: node.id,
        type: node.data.resourceType,
        label: node.data.label,
        config: node.data.config,
        position: node.position,
      })),
      connections: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    }, null, 2);
  };

  const handleExport = () => {
    setExporting(true);

    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (exportType === 'markdown') {
        content = generateMarkdownDoc();
        filename = `${projectName.replace(/\s+/g, '-')}-documentation.md`;
        mimeType = 'text/markdown';
      } else if (exportType === 'json') {
        content = generateJSONExport();
        filename = `${projectName.replace(/\s+/g, '-')}-export.json`;
        mimeType = 'application/json';
      } else if (exportType === 'png') {
        // For PNG, we would need to use html2canvas
        // For now, show message that it's coming soon
        alert('PNG export coming soon! For now, use the browser screenshot feature or export as Markdown/JSON.');
        setExporting(false);
        return;
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      alert(`Successfully exported as ${exportType.toUpperCase()}!`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export Architecture</h2>
                <p className="text-sm text-gray-600">
                  Export diagrams and documentation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Export your architecture</p>
                <p className="mt-1">Choose a format to export your infrastructure design and documentation.</p>
              </div>
            </div>
          </div>

          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-3">
              {/* Markdown Option */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: exportType === 'markdown' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="exportType"
                  value="markdown"
                  checked={exportType === 'markdown'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span className="font-medium text-gray-900">Markdown Documentation</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete documentation with resource list, connections, and deployment instructions.
                    Compatible with Confluence, GitHub, and other markdown platforms.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • Resource inventory
                    • Configuration details
                    • Connection diagram (text)
                    • Deployment guide
                  </div>
                </div>
              </label>

              {/* JSON Option */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: exportType === 'json' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="exportType"
                  value="json"
                  checked={exportType === 'json'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💾</span>
                    <span className="font-medium text-gray-900">JSON Export</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Machine-readable format with all project data, resources, and configurations.
                    Use for backup, version control, or integration with other tools.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    • Complete project data
                    • All resource configurations
                    • Node positions and connections
                  </div>
                </div>
              </label>

              {/* PNG Option */}
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors opacity-60"
                style={{ borderColor: exportType === 'png' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="exportType"
                  value="png"
                  checked={exportType === 'png'}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🖼️</span>
                    <span className="font-medium text-gray-900">PNG Diagram</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Visual diagram export as PNG image for presentations and documentation.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{nodes.length}</div>
              <div className="text-xs text-gray-600">Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{edges.length}</div>
              <div className="text-xs text-gray-600">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{cloudProvider.toUpperCase()}</div>
              <div className="text-xs text-gray-600">Cloud Provider</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : `Export as ${exportType.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
