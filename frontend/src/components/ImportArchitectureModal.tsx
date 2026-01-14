import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileJson,
  X,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Layers,
  GitBranch,
  Info,
} from 'lucide-react';

// CloudForge Architecture JSON Schema Types
export interface CloudForgeArchitecture {
  version: string;
  metadata: {
    name: string;
    description?: string;
    cloud_provider: 'aws' | 'azure' | 'gcp';
    author?: string;
    tags?: string[];
    created_at?: string;
  };
  resources: CloudForgeResource[];
  connections?: CloudForgeConnection[];
  groups?: CloudForgeGroup[];
}

export interface CloudForgeResource {
  id: string;
  type: string;
  name: string;
  properties?: Record<string, any>;
  position?: { x: number; y: number };
  parent?: string;
}

export interface CloudForgeConnection {
  id?: string;
  from: string;
  to: string;
  label?: string;
}

export interface CloudForgeGroup {
  id: string;
  name: string;
  resources: string[];
  color?: string;
}

interface ImportArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (architecture: CloudForgeArchitecture) => void;
  currentProvider?: string;
}

// Validation result type
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary?: {
    resourceCount: number;
    connectionCount: number;
    provider: string;
  };
}

// Sample template for users to see
const SAMPLE_TEMPLATE = `{
  "version": "1.0",
  "metadata": {
    "name": "My Architecture",
    "description": "Description of your architecture",
    "cloud_provider": "aws"
  },
  "resources": [
    {
      "id": "vpc-main",
      "type": "aws_vpc",
      "name": "Main VPC",
      "properties": {
        "cidr_block": "10.0.0.0/16"
      }
    },
    {
      "id": "ec2-web",
      "type": "aws_instance",
      "name": "Web Server",
      "parent": "vpc-main",
      "properties": {
        "instance_type": "t3.medium"
      }
    }
  ],
  "connections": [
    { "from": "ec2-web", "to": "vpc-main" }
  ]
}`;

export default function ImportArchitectureModal({
  isOpen,
  onClose,
  onImport,
  currentProvider,
}: ImportArchitectureModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'template'>('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate the JSON input
  const validateArchitecture = useCallback((jsonStr: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Try to parse JSON
    let data: any;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      return { valid: false, errors: ['Invalid JSON syntax: ' + (e as Error).message], warnings: [] };
    }

    // Check version
    if (!data.version) {
      errors.push('Missing required field: version');
    } else if (data.version !== '1.0') {
      warnings.push(`Unknown schema version: ${data.version}. Expected "1.0"`);
    }

    // Check metadata
    if (!data.metadata) {
      errors.push('Missing required field: metadata');
    } else {
      if (!data.metadata.name) {
        errors.push('Missing required field: metadata.name');
      }
      if (!data.metadata.cloud_provider) {
        errors.push('Missing required field: metadata.cloud_provider');
      } else if (!['aws', 'azure', 'gcp'].includes(data.metadata.cloud_provider)) {
        errors.push(`Invalid cloud_provider: ${data.metadata.cloud_provider}. Must be "aws", "azure", or "gcp"`);
      }
      // Check if provider matches current project
      if (currentProvider && data.metadata.cloud_provider !== currentProvider) {
        warnings.push(`Architecture provider (${data.metadata.cloud_provider}) differs from current project (${currentProvider})`);
      }
    }

    // Check resources
    if (!data.resources) {
      errors.push('Missing required field: resources');
    } else if (!Array.isArray(data.resources)) {
      errors.push('resources must be an array');
    } else {
      const resourceIds = new Set<string>();
      data.resources.forEach((resource: any, index: number) => {
        if (!resource.id) {
          errors.push(`Resource at index ${index} missing required field: id`);
        } else {
          if (resourceIds.has(resource.id)) {
            errors.push(`Duplicate resource ID: ${resource.id}`);
          }
          resourceIds.add(resource.id);
        }
        if (!resource.type) {
          errors.push(`Resource "${resource.id || index}" missing required field: type`);
        }
        if (!resource.name) {
          errors.push(`Resource "${resource.id || index}" missing required field: name`);
        }
        if (resource.parent && !resourceIds.has(resource.parent)) {
          // Parent might be defined later, we'll check at the end
        }
      });

      // Validate parent references
      data.resources.forEach((resource: any) => {
        if (resource.parent && !resourceIds.has(resource.parent)) {
          errors.push(`Resource "${resource.id}" references non-existent parent: ${resource.parent}`);
        }
      });
    }

    // Check connections
    if (data.connections) {
      if (!Array.isArray(data.connections)) {
        errors.push('connections must be an array');
      } else {
        const resourceIds = new Set(data.resources?.map((r: any) => r.id) || []);
        data.connections.forEach((conn: any, index: number) => {
          if (!conn.from) {
            errors.push(`Connection at index ${index} missing required field: from`);
          } else if (!resourceIds.has(conn.from)) {
            errors.push(`Connection references non-existent resource: ${conn.from}`);
          }
          if (!conn.to) {
            errors.push(`Connection at index ${index} missing required field: to`);
          } else if (!resourceIds.has(conn.to)) {
            errors.push(`Connection references non-existent resource: ${conn.to}`);
          }
        });
      }
    }

    const valid = errors.length === 0;
    const summary = valid ? {
      resourceCount: data.resources?.length || 0,
      connectionCount: data.connections?.length || 0,
      provider: data.metadata?.cloud_provider || 'unknown',
    } : undefined;

    return { valid, errors, warnings, summary };
  }, [currentProvider]);

  // Handle JSON input change
  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      const result = validateArchitecture(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [validateArchitecture]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      handleJsonChange(content);
    };
    reader.readAsText(file);
  }, [handleJsonChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      handleFileUpload(file);
      setActiveTab('paste');
    }
  }, [handleFileUpload]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!validation?.valid) return;
    try {
      const architecture = JSON.parse(jsonInput) as CloudForgeArchitecture;
      onImport(architecture);
      onClose();
      setJsonInput('');
      setValidation(null);
    } catch (e) {
      console.error('Import error:', e);
    }
  }, [jsonInput, validation, onImport, onClose]);

  // Load sample template
  const loadSampleTemplate = useCallback(() => {
    setJsonInput(SAMPLE_TEMPLATE);
    handleJsonChange(SAMPLE_TEMPLATE);
    setActiveTab('paste');
  }, [handleJsonChange]);

  // Copy sample to clipboard
  const copySampleToClipboard = useCallback(() => {
    navigator.clipboard.writeText(SAMPLE_TEMPLATE);
  }, []);

  // Download sample template
  const downloadSampleTemplate = useCallback(() => {
    const blob = new Blob([SAMPLE_TEMPLATE], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cloudforge-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Architecture</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Import a CloudForge JSON architecture file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-6">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Paste JSON
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </span>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'template'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Schema Info
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Architecture JSON
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="Paste your CloudForge architecture JSON here..."
                  className="w-full h-64 px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 resize-none"
                  spellCheck={false}
                />
              </div>

              {/* Validation Results */}
              {validation && (
                <div className={`rounded-xl border p-4 ${
                  validation.valid
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    {validation.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${validation.valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                        {validation.valid ? 'Valid Architecture' : 'Validation Errors'}
                      </p>

                      {/* Summary */}
                      {validation.summary && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            {validation.summary.resourceCount} resources
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {validation.summary.connectionCount} connections
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 rounded text-xs font-medium uppercase">
                            {validation.summary.provider}
                          </span>
                        </div>
                      )}

                      {/* Errors */}
                      {validation.errors.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                          {validation.errors.map((error, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-400">-</span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Warnings */}
                      {validation.warnings.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-amber-600 dark:text-amber-400">
                          {validation.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400">!</span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                  : 'border-gray-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  isDragging ? 'bg-violet-100 dark:bg-violet-500/20' : 'bg-gray-100 dark:bg-slate-800'
                }`}>
                  <FileJson className={`w-8 h-8 ${isDragging ? 'text-violet-500' : 'text-gray-400 dark:text-slate-500'}`} />
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your JSON file'}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors"
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 rounded-xl p-4 border border-violet-200 dark:border-violet-500/30">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CloudForge Architecture Schema v1.0</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Use this JSON format to define your cloud infrastructure. Resources are automatically positioned and connected on the canvas.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Sample Template
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={copySampleToClipboard}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                    <button
                      onClick={downloadSampleTemplate}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={loadSampleTemplate}
                      className="px-3 py-1.5 text-xs bg-violet-500 hover:bg-violet-600 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Use Template
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-900 dark:bg-slate-950 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto font-mono">
                  {SAMPLE_TEMPLATE}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Required Fields</h4>
                  <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <li><code className="text-violet-500">version</code> - Schema version ("1.0")</li>
                    <li><code className="text-violet-500">metadata.name</code> - Architecture name</li>
                    <li><code className="text-violet-500">metadata.cloud_provider</code> - aws/azure/gcp</li>
                    <li><code className="text-violet-500">resources</code> - Array of resources</li>
                    <li><code className="text-violet-500">resources[].id</code> - Unique ID</li>
                    <li><code className="text-violet-500">resources[].type</code> - Terraform type</li>
                    <li><code className="text-violet-500">resources[].name</code> - Display name</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Optional Fields</h4>
                  <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <li><code className="text-cyan-500">resources[].properties</code> - Config object</li>
                    <li><code className="text-cyan-500">resources[].position</code> - x, y coordinates</li>
                    <li><code className="text-cyan-500">resources[].parent</code> - Parent resource ID</li>
                    <li><code className="text-cyan-500">connections</code> - Resource connections</li>
                    <li><code className="text-cyan-500">connections[].from/to</code> - Resource IDs</li>
                    <li><code className="text-cyan-500">metadata.description</code> - Description</li>
                  </ul>
                </div>
              </div>

              <div className="text-center pt-4">
                <a
                  href="/docs/CLOUDFORGE_ARCHITECTURE_SCHEMA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  View Full Documentation →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Supported formats: .json (CloudForge Architecture Schema v1.0)
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!validation?.valid}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl font-medium hover:from-violet-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Architecture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
