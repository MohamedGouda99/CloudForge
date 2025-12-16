/**
 * AWS Configuration Panel
 * Dynamic configuration panel for AWS resources with rich form fields
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Node } from 'reactflow';
import {
  X,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Link2,
  Info,
  Settings2,
  Layers,
  Code2,
} from 'lucide-react';
import {
  getResourceSchema,
  validateSchema,
  getDefaultValues,
  SchemaField,
  ResourceSchema,
} from '../lib/resources/resourceSchemas';
import { ServiceBlockField } from '../lib/aws/serviceLoader';
import CloudIcon from './CloudIcon';
import { resolveResourceIcon } from '../lib/resources/iconResolver';

interface AWSConfigPanelProps {
  node: Node;
  allNodes: Node[];
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

type TabId = 'config' | 'blocks' | 'outputs' | 'terraform';

export default function AWSConfigPanel({
  node,
  allNodes,
  onUpdate,
  onClose,
}: AWSConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('config');
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [blockValues, setBlockValues] = useState<Record<string, unknown[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Required']));
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const nodeData = node.data as Record<string, unknown>;
  const resourceType = nodeData.resourceType as string;
  const schema = useMemo(() => getResourceSchema(resourceType), [resourceType]);

  // Group fields by their group property
  const fieldsByGroup = useMemo(() => {
    const groups: Record<string, SchemaField[]> = { Required: [], Optional: [] };
    for (const field of schema.fields) {
      const group = field.group || 'Optional';
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
    }
    return groups;
  }, [schema]);

  // Initialize form values from node config
  useEffect(() => {
    const existingConfig = (nodeData.config as Record<string, unknown>) || {};
    const defaults = getDefaultValues(schema);
    setFormValues({
      name: nodeData.displayName || '',
      ...defaults,
      ...existingConfig,
    });
    
    // Initialize block values
    const blocks: Record<string, unknown[]> = {};
    if (schema.blocks) {
      for (const block of schema.blocks) {
        blocks[block.name] = existingConfig[block.name] as unknown[] || [];
      }
    }
    setBlockValues(blocks);
  }, [node.id, schema, nodeData]);

  // Get available resources for reference fields
  const getReferenceCandidates = useCallback(
    (field: SchemaField) => {
      if (!field.reference) return [];
      const { resourceType: refType, outputName } = field.reference;
      return allNodes
        .filter((n) => {
          const data = n.data as Record<string, unknown>;
          return data.resourceType === refType && n.id !== node.id;
        })
        .map((n) => {
          const data = n.data as Record<string, unknown>;
          return {
            nodeId: n.id,
            displayName: (data.displayName as string) || n.id,
            terraformRef: `${refType}.${n.id}.${outputName}`,
          };
        });
    },
    [allNodes, node.id]
  );

  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      setFormValues((prev) => ({ ...prev, [fieldName]: value }));
      setSaveStatus('idle');
    },
    []
  );

  const handleSave = useCallback(() => {
    const validationErrors = validateSchema(schema, formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaveStatus('error');
      return;
    }

    const { name, ...restConfig } = formValues;
    const configWithBlocks = {
      ...restConfig,
      ...blockValues,
    };

    onUpdate(node.id, {
      ...nodeData,
      displayName: name || nodeData.displayName,
      config: configWithBlocks,
    });

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [schema, formValues, blockValues, node.id, nodeData, onUpdate]);

  const handleReset = useCallback(() => {
    const defaults = getDefaultValues(schema);
    setFormValues({
      name: nodeData.displayName || '',
      ...defaults,
    });
    setErrors({});
    setSaveStatus('idle');
  }, [schema, nodeData]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const toggleBlock = useCallback((blockName: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockName)) {
        next.delete(blockName);
      } else {
        next.add(blockName);
      }
      return next;
    });
  }, []);

  const addBlockInstance = useCallback((blockName: string) => {
    setBlockValues((prev) => ({
      ...prev,
      [blockName]: [...(prev[blockName] || []), {}],
    }));
    setExpandedBlocks((prev) => new Set([...prev, blockName]));
  }, []);

  const removeBlockInstance = useCallback((blockName: string, index: number) => {
    setBlockValues((prev) => ({
      ...prev,
      [blockName]: (prev[blockName] || []).filter((_, i) => i !== index),
    }));
  }, []);

  const updateBlockInstance = useCallback(
    (blockName: string, index: number, fieldName: string, value: unknown) => {
      setBlockValues((prev) => ({
        ...prev,
        [blockName]: (prev[blockName] || []).map((instance, i) =>
          i === index ? { ...(instance as Record<string, unknown>), [fieldName]: value } : instance
        ),
      }));
    },
    []
  );

  // Render a form field
  const renderField = (field: SchemaField, prefix = '') => {
    const fieldKey = prefix ? `${prefix}.${field.name}` : field.name;
    const value = formValues[field.name] ?? '';
    const error = errors[field.name];

    return (
      <div key={fieldKey} className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          {field.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          {field.required && <span className="text-red-500">*</span>}
          {field.reference && (
            <Link2 className="w-3.5 h-3.5 text-blue-500" />
          )}
        </label>
        
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}

        {/* Text/String field */}
        {(field.type === 'text' || field.type === 'string') && !field.options && (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            className={`w-full px-3 py-2 rounded-lg border bg-background text-sm
              ${error ? 'border-red-500' : 'border-border'} 
              focus:outline-none focus:ring-2 focus:ring-primary/50`}
          />
        )}

        {/* Number field */}
        {field.type === 'number' && (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleFieldChange(field.name, e.target.valueAsNumber || 0)}
            placeholder={field.placeholder || ''}
            className={`w-full px-3 py-2 rounded-lg border bg-background text-sm
              ${error ? 'border-red-500' : 'border-border'} 
              focus:outline-none focus:ring-2 focus:ring-primary/50`}
          />
        )}

        {/* Checkbox/Boolean field */}
        {(field.type === 'checkbox' || field.type === 'boolean') && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
            />
            <span className="text-sm text-muted-foreground">Enable</span>
          </label>
        )}

        {/* Select field */}
        {(field.type === 'select' || field.options) && (
          <select
            value={value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border bg-background text-sm
              ${error ? 'border-red-500' : 'border-border'} 
              focus:outline-none focus:ring-2 focus:ring-primary/50`}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Reference field */}
        {field.type === 'reference' && (
          <div className="space-y-2">
            <select
              value={value as string}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border bg-background text-sm
                ${error ? 'border-red-500' : 'border-border'} 
                focus:outline-none focus:ring-2 focus:ring-primary/50`}
            >
              <option value="">Select resource...</option>
              {getReferenceCandidates(field).map((candidate) => (
                <option key={candidate.nodeId} value={candidate.terraformRef}>
                  {candidate.displayName} ({candidate.terraformRef})
                </option>
              ))}
            </select>
            {field.reference && (
              <p className="text-xs text-blue-500">
                References: {field.reference.resourceType}.{field.reference.outputName}
              </p>
            )}
          </div>
        )}

        {/* Textarea field */}
        {field.type === 'textarea' && (
          <textarea
            value={value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border bg-background text-sm resize-y
              ${error ? 'border-red-500' : 'border-border'} 
              focus:outline-none focus:ring-2 focus:ring-primary/50`}
          />
        )}

        {/* Tags field */}
        {field.type === 'tags' && (
          <TagsInput
            value={(value as Record<string, string>) || {}}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        )}

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
      </div>
    );
  };

  // Render a block section
  const renderBlock = (block: ServiceBlockField) => {
    const instances = blockValues[block.name] || [];
    const isExpanded = expandedBlocks.has(block.name);

    return (
      <div key={block.name} className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleBlock(block.name)}
          className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {block.label}
              {block.multiple && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({instances.length})
                </span>
              )}
            </span>
          </div>
          {block.multiple && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addBlockInstance(block.name);
              }}
              className="p-1 rounded hover:bg-primary/10 text-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </button>

        {isExpanded && (
          <div className="p-4 space-y-4 bg-background/50">
            {block.description && (
              <p className="text-xs text-muted-foreground">{block.description}</p>
            )}

            {block.multiple ? (
              instances.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <p>No {block.label.toLowerCase()} configured</p>
                  <button
                    onClick={() => addBlockInstance(block.name)}
                    className="mt-2 text-primary hover:underline"
                  >
                    Add {block.label}
                  </button>
                </div>
              ) : (
                instances.map((instance, index) => (
                  <div
                    key={index}
                    className="border border-border/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {block.label} #{index + 1}
                      </span>
                      <button
                        onClick={() => removeBlockInstance(block.name, index)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {block.fields.map((field) => (
                      <div key={field.name} className="space-y-1">
                        <label className="text-xs font-medium text-foreground">
                          {field.label}
                        </label>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={
                            ((instance as Record<string, unknown>)[field.name] as string) || ''
                          }
                          onChange={(e) =>
                            updateBlockInstance(block.name, index, field.name, e.target.value)
                          }
                          className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ))
              )
            ) : (
              // Single block
              <div className="space-y-3">
                {block.fields.map((field) => {
                  const blockField: SchemaField = {
                    name: field.name,
                    type: field.type as SchemaField['type'],
                    description: field.description,
                    default: field.default,
                    required: field.required,
                    options: field.options,
                    group: 'Optional',
                  };
                  return renderField(blockField, block.name);
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const icon = useMemo(() => {
    return resolveResourceIcon(resourceType, nodeData.icon as string);
  }, [resourceType, nodeData.icon]);

  return (
    <div className="w-96 h-full bg-card border-l border-border flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CloudIcon icon={icon} size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {(nodeData.displayName as string) || schema.label}
            </h2>
            <p className="text-xs text-muted-foreground">{resourceType}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['config', 'blocks', 'outputs', 'terraform'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
          >
            {tab === 'config' && <Settings2 className="w-4 h-4 inline mr-1.5" />}
            {tab === 'blocks' && <Layers className="w-4 h-4 inline mr-1.5" />}
            {tab === 'outputs' && <Link2 className="w-4 h-4 inline mr-1.5" />}
            {tab === 'terraform' && <Code2 className="w-4 h-4 inline mr-1.5" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Name field always first */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                Resource Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={(formValues.name as string) || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="my-resource"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Grouped fields */}
            {Object.entries(fieldsByGroup).map(([group, fields]) => (
              <div key={group} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm">{group}</span>
                  <span className="text-xs text-muted-foreground">({fields.length})</span>
                </button>
                {expandedGroups.has(group) && (
                  <div className="p-4 space-y-4 bg-background/50">
                    {fields.map((field) => renderField(field))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div className="space-y-4">
            {schema.blocks && schema.blocks.length > 0 ? (
              schema.blocks.map((block) => renderBlock(block))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No nested blocks for this resource</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'outputs' && (
          <div className="space-y-3">
            {schema.outputs && schema.outputs.length > 0 ? (
              schema.outputs.map((output) => (
                <div
                  key={output.name}
                  className="p-3 border border-border rounded-lg bg-secondary/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-primary">{output.name}</code>
                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {output.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{output.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No outputs defined</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'terraform' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Preview of generated Terraform code</span>
            </div>
            <pre className="p-4 bg-secondary/50 rounded-lg text-xs font-mono overflow-x-auto">
              {generatePreview(schema, formValues, blockValues)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/10">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" /> Fix errors
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg
              hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Tags input component
function TagsInput({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addTag = () => {
    if (newKey && newValue) {
      onChange({ ...value, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const removeTag = (key: string) => {
    const { [key]: _, ...rest } = value;
    onChange(rest);
  };

  return (
    <div className="space-y-2">
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="flex-1 px-2 py-1 bg-secondary rounded text-xs">
            {k}: {v}
          </span>
          <button onClick={() => removeTag(k)} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
          className="flex-1 px-2 py-1 border border-border rounded text-sm"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value"
          className="flex-1 px-2 py-1 border border-border rounded text-sm"
        />
        <button
          onClick={addTag}
          className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Generate Terraform preview
function generatePreview(
  schema: ResourceSchema,
  values: Record<string, unknown>,
  blocks: Record<string, unknown[]>
): string {
  const resourceName = (values.name as string) || 'example';
  const lines: string[] = [];
  lines.push(`resource "${schema.type}" "${resourceName.replace(/[^a-z0-9_]/gi, '_')}" {`);

  for (const field of schema.fields) {
    const value = values[field.name];
    if (value !== undefined && value !== null && value !== '' && field.name !== 'name') {
      if (field.type === 'checkbox' || field.type === 'boolean') {
        lines.push(`  ${field.name} = ${value ? 'true' : 'false'}`);
      } else if (field.type === 'number') {
        lines.push(`  ${field.name} = ${value}`);
      } else if (field.type === 'reference') {
        lines.push(`  ${field.name} = ${value}`);
      } else if (typeof value === 'object') {
        lines.push(`  ${field.name} = ${JSON.stringify(value)}`);
      } else {
        lines.push(`  ${field.name} = "${value}"`);
      }
    }
  }

  for (const [blockName, instances] of Object.entries(blocks)) {
    for (const instance of instances) {
      lines.push('');
      lines.push(`  ${blockName} {`);
      for (const [k, v] of Object.entries(instance as Record<string, unknown>)) {
        if (v !== undefined && v !== null && v !== '') {
          lines.push(`    ${k} = "${v}"`);
        }
      }
      lines.push('  }');
    }
  }

  lines.push('}');
  return lines.join('\n');
}





