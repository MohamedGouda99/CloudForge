import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { NodeType } from '../../lib/api/workflowClient';

interface NodeConfigDrawerProps {
  node: Node;
  nodeTypes: NodeType[];
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, any>, label?: string) => void;
  onDelete: (nodeId: string) => void;
}

const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  nodeTypes,
  onClose,
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState(node.data.label || '');
  const [config, setConfig] = useState<Record<string, any>>(node.data.config || {});
  const [command, setCommand] = useState<string>('');

  const nodeTypeDef = nodeTypes.find((nt) => nt.type_id === node.data.nodeType);

  // Check if this is a Terraform node
  const isTerraformNode = node.data.nodeType?.startsWith('terraform_');
  const terraformCommands = ['validate', 'plan', 'apply', 'destroy'];

  useEffect(() => {
    setLabel(node.data.label || '');
    setConfig(node.data.config || {});

    // Extract command from terraform node type
    if (isTerraformNode) {
      const cmd = node.data.nodeType.replace('terraform_', '');
      setCommand(cmd);
    }
  }, [node, isTerraformNode]);

  // Auto-save changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSave(node.id, config, label);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeout);
  }, [label, config, node.id, onSave]);

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default ?? '';

    if (schema.enum) {
      return (
        <select
          value={value}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-900"
        >
          <option value="">Select...</option>
          {schema.enum.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    switch (schema.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">Enable</span>
          </label>
        );

      case 'integer':
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-900"
          />
        );

      case 'object':
        return (
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleConfigChange(key, JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={4}
            className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm font-mono text-gray-900"
            placeholder="{}"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-900"
            placeholder={schema.description}
          />
        );
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Task details</h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100 text-sm font-medium"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Task Name */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Task name</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-gray-900"
            placeholder={nodeTypeDef?.display_name || 'Enter task name'}
          />
        </div>

        {/* Command dropdown for Terraform */}
        {isTerraformNode && (
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              Command <span className="text-purple-500">●</span>
            </label>
            <select
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-gray-900"
            >
              {terraformCommands.map((cmd) => (
                <option key={cmd} value={cmd}>
                  {cmd}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Target (for additional configuration) */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Target</label>
          <input
            type="text"
            value={config.target || ''}
            onChange={(e) => handleConfigChange('target', e.target.value)}
            className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-gray-900"
            placeholder="Optional target path"
          />
        </div>

        {/* Other Configuration Fields */}
        {nodeTypeDef?.config_schema?.properties && (
          <div className="space-y-4">
            {Object.entries(nodeTypeDef.config_schema.properties)
              .filter(([key]) => key !== 'target') // Already shown above
              .map(([key, schema]: [string, any]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-2">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    {nodeTypeDef.config_schema.required?.includes(key) && (
                      <span className="text-purple-500 ml-1">●</span>
                    )}
                  </label>
                  {renderConfigField(key, schema)}
                  {schema.description && (
                    <div className="text-xs text-gray-500 mt-1">{schema.description}</div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer - No buttons, auto-save style like Brainboard */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Changes are saved automatically
        </div>
      </div>
    </div>
  );
};

export default NodeConfigDrawer;
