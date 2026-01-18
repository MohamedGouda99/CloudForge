import { useState, useMemo, useEffect, useCallback } from 'react';
import { Node } from 'reactflow';
import {
  X,
  Save,
  CheckCircle2,
  Link2,
  Plus,
  Layers,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';
import { getResourceSchema, hasRichSchema, getResourceSchemaAsync } from '../../lib/resources/resourceSchemaAPI';
import {
  PropertyDefinition,
  TerraformReference,
  isStructuredReference,
  sanitizeTerraformName,
  getReferenceDisplayValue,
  mapSchemaFieldType,
} from './types';
import { DEFAULT_PROPERTIES, RESOURCE_PROPERTIES } from './resourceProperties';

interface PropertyEditorProps {
  selectedNode: Node;
  nodes: Node[];
  onUpdateNode?: (nodeId: string, updates: any) => void;
  onClose?: () => void;
}

export default function PropertyEditor({
  selectedNode,
  nodes,
  onUpdateNode,
  onClose,
}: PropertyEditorProps) {
  const [configFormData, setConfigFormData] = useState<Record<string, any>>({});
  const [blockFormData, setBlockFormData] = useState<Record<string, any[]>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [resourceSchema, setResourceSchema] = useState<ReturnType<typeof getResourceSchema> | null>(null);

  // Load schema from API with fallback to sync version
  useEffect(() => {
    const resourceType = (selectedNode.data as any)?.resourceType || '';
    if (!resourceType) return;

    // First try sync (from cache)
    const syncSchema = getResourceSchema(resourceType);
    setResourceSchema(syncSchema);

    // If no rich schema in cache, try async load
    if (!hasRichSchema(resourceType)) {
      setSchemaLoading(true);
      getResourceSchemaAsync(resourceType)
        .then(schema => {
          setResourceSchema(schema);
        })
        .catch(console.error)
        .finally(() => setSchemaLoading(false));
    }
  }, [selectedNode]);

  const resourceProperties = useMemo(() => {
    const resourceType = (selectedNode.data as any)?.resourceType || '';
    if (hasRichSchema(resourceType) && resourceSchema) {
      return resourceSchema.fields.map(field => ({
        name: field.name,
        label: field.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: mapSchemaFieldType(field.type),
        placeholder: field.placeholder || field.description,
        options: field.options,
        required: field.required,
        description: field.description,
        reference: field.reference,
      })) as PropertyDefinition[];
    }
    return RESOURCE_PROPERTIES[resourceType] || DEFAULT_PROPERTIES;
  }, [selectedNode, resourceSchema]);

  const resourceBlocks = useMemo(() => resourceSchema?.blocks || [], [resourceSchema]);
  const resourceOutputs = useMemo(() => resourceSchema?.outputs || [], [resourceSchema]);

  useEffect(() => {
    const nodeData = selectedNode.data as any;
    const existingConfig = nodeData?.config || {};
    const initialData: Record<string, any> = {};
    resourceProperties.forEach(prop => {
      if (existingConfig[prop.name] !== undefined) {
        initialData[prop.name] = existingConfig[prop.name];
      } else if (prop.type === 'checkbox') {
        initialData[prop.name] = false;
      } else {
        initialData[prop.name] = '';
      }
    });
    initialData.displayName = nodeData?.displayName || existingConfig.name || '';
    setConfigFormData(initialData);

    const initialBlocks: Record<string, any[]> = {};
    resourceBlocks.forEach(block => {
      const blockData = existingConfig[block.name];
      if (Array.isArray(blockData) && blockData.length > 0) {
        initialBlocks[block.name] = blockData;
      } else if (block.multiple) {
        initialBlocks[block.name] = [];
      } else {
        initialBlocks[block.name] = [{}];
      }
    });
    setBlockFormData(initialBlocks);

    const blocksWithData = new Set<string>();
    resourceBlocks.forEach(block => {
      if (initialBlocks[block.name]?.length > 0 &&
          initialBlocks[block.name].some((inst: any) => Object.keys(inst).length > 0)) {
        blocksWithData.add(block.name);
      }
    });
    setExpandedBlocks(blocksWithData);
  }, [selectedNode?.id, resourceProperties, resourceBlocks]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setConfigFormData(prev => ({ ...prev, [fieldName]: value }));
    setSaveStatus('idle');
  }, []);

  const toggleBlockExpand = useCallback((blockName: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      next.has(blockName) ? next.delete(blockName) : next.add(blockName);
      return next;
    });
  }, []);

  const addBlockInstance = useCallback((blockName: string) => {
    setBlockFormData(prev => ({ ...prev, [blockName]: [...(prev[blockName] || []), {}] }));
    setExpandedBlocks(prev => new Set([...prev, blockName]));
    setSaveStatus('idle');
  }, []);

  const removeBlockInstance = useCallback((blockName: string, index: number) => {
    setBlockFormData(prev => ({ ...prev, [blockName]: (prev[blockName] || []).filter((_, i) => i !== index) }));
    setSaveStatus('idle');
  }, []);

  const updateBlockField = useCallback((blockName: string, index: number, fieldName: string, value: any) => {
    setBlockFormData(prev => ({
      ...prev,
      [blockName]: (prev[blockName] || []).map((inst, i) => i === index ? { ...inst, [fieldName]: value } : inst),
    }));
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(() => {
    if (!onUpdateNode) return;
    setSaveStatus('saving');
    const { displayName, ...configData } = configFormData;
    const cleanedBlocks: Record<string, any[]> = {};
    for (const [blockName, instances] of Object.entries(blockFormData)) {
      const nonEmpty = instances.filter((inst: any) => Object.values(inst).some(v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)));
      if (nonEmpty.length > 0) cleanedBlocks[blockName] = nonEmpty;
    }
    onUpdateNode(selectedNode.id, {
      displayName: displayName || configData.name || (selectedNode.data as any)?.resourceLabel,
      config: { ...configData, ...cleanedBlocks },
    });
    setTimeout(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }, 300);
  }, [selectedNode, onUpdateNode, configFormData, blockFormData]);

  const renderField = (prop: PropertyDefinition) => {
    if (prop.type === 'text') return <input type="text" value={configFormData[prop.name] || ''} onChange={(e) => handleFieldChange(prop.name, e.target.value)} placeholder={prop.placeholder} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF] placeholder:text-gray-400" />;
    if (prop.type === 'number') return <input type="number" value={configFormData[prop.name] || ''} onChange={(e) => handleFieldChange(prop.name, e.target.value ? Number(e.target.value) : '')} placeholder={prop.placeholder} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF] placeholder:text-gray-400" />;
    if (prop.type === 'select') return <select value={configFormData[prop.name] || ''} onChange={(e) => handleFieldChange(prop.name, e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]"><option value="">Select {prop.label}</option>{prop.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>;
    if (prop.type === 'checkbox') return <label className="flex items-center gap-3 cursor-pointer"><div className="relative"><input type="checkbox" checked={!!configFormData[prop.name]} onChange={(e) => handleFieldChange(prop.name, e.target.checked)} className="sr-only peer" /><div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-[#714EFF] transition-colors" /><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" /></div><span className="text-sm text-gray-600 dark:text-gray-400">{configFormData[prop.name] ? 'Enabled' : 'Disabled'}</span></label>;
    if (prop.type === 'textarea') return <textarea value={configFormData[prop.name] || ''} onChange={(e) => handleFieldChange(prop.name, e.target.value)} placeholder={prop.placeholder} rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF] placeholder:text-gray-400 resize-y" />;
    if (prop.type === 'reference') return (
      <div className="space-y-1">
        <select value={isStructuredReference(configFormData[prop.name]) ? configFormData[prop.name].nodeId : ''} onChange={(e) => {
          const nodeId = e.target.value;
          if (!nodeId || !prop.reference) { handleFieldChange(prop.name, ''); return; }
          handleFieldChange(prop.name, { __ref: true, nodeId, resourceType: prop.reference.resourceType, outputName: prop.reference.outputName } as TerraformReference);
        }} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF]">
          <option value="">Select resource...</option>
          {nodes.filter(n => prop.reference && (n.data as any)?.resourceType === prop.reference.resourceType && n.id !== selectedNode?.id).map(n => {
            const d = n.data as any;
            const name = d?.displayName || d?.resourceLabel || n.id;
            return <option key={n.id} value={n.id}>{name} ({prop.reference?.resourceType}.{sanitizeTerraformName(name)}.{prop.reference?.outputName})</option>;
          })}
        </select>
        {configFormData[prop.name] && <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1 font-mono"><CheckCircle2 className="w-3 h-3" />{getReferenceDisplayValue(configFormData[prop.name], nodes)}</p>}
        {prop.reference && <p className="text-[10px] text-blue-500 flex items-center gap-1"><Link2 className="w-3 h-3" />References: {prop.reference.resourceType}.{prop.reference.outputName}</p>}
      </div>
    );
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <CloudIcon icon={(selectedNode.data as any)?.icon || getCloudIconPath((selectedNode.data as any)?.resourceType)} size={24} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{(selectedNode.data as any)?.displayName || (selectedNode.data as any)?.resourceLabel || 'Configuration'}</h3>
            <p className="text-[10px] text-gray-500 font-mono">{(selectedNode.data as any)?.resourceType}</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">Display Name<span className="text-red-500">*</span></label>
          <input type="text" value={configFormData.displayName || ''} onChange={(e) => handleFieldChange('displayName', e.target.value)} placeholder="Resource display name" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714EFF]/30 focus:border-[#714EFF] placeholder:text-gray-400" />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3"><h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Properties</h4></div>
        {resourceProperties.map((prop) => (
          <div key={prop.name} className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">{prop.label}{prop.required && <span className="text-red-500">*</span>}</label>
            {renderField(prop)}
            {prop.description && <p className="text-[10px] text-gray-400">{prop.description}</p>}
          </div>
        ))}

        {resourceBlocks.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Layers className="w-3.5 h-3.5" />Configuration Blocks</h4>
            <div className="space-y-2">
              {resourceBlocks.map(block => {
                const instances = blockFormData[block.name] || [];
                const isExpanded = expandedBlocks.has(block.name);
                return (
                  <div key={block.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button onClick={() => toggleBlockExpand(block.name)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-2">{isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}<span className="text-xs font-medium text-gray-700 dark:text-gray-300">{block.label}{block.multiple && <span className="ml-1 text-gray-400">({instances.length})</span>}</span></div>
                      {block.multiple && <button onClick={(e) => { e.stopPropagation(); addBlockInstance(block.name); }} className="p-1 rounded hover:bg-[#714EFF]/20 text-[#714EFF]" title={`Add ${block.label}`}><Plus className="w-3.5 h-3.5" /></button>}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3">
                        {block.description && <p className="text-[10px] text-gray-400">{block.description}</p>}
                        {instances.length === 0 ? <div className="text-center py-3 text-xs text-gray-400"><p>No {block.label.toLowerCase()} configured</p><button onClick={() => addBlockInstance(block.name)} className="mt-1 text-[#714EFF] hover:underline">Add {block.label}</button></div> : instances.map((inst: any, i: number) => (
                          <div key={i} className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 space-y-2">
                            <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700"><span className="text-[10px] font-medium text-gray-500">{block.label} #{i + 1}</span><button onClick={() => removeBlockInstance(block.name, i)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" title="Remove"><Trash2 className="w-3 h-3" /></button></div>
                            {block.fields.map(field => (
                              <div key={field.name} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500 min-w-[80px] truncate" title={field.label}>{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</span>
                                {field.type === 'number' ? <input type="number" value={inst[field.name] ?? ''} onChange={(e) => updateBlockField(block.name, i, field.name, e.target.valueAsNumber || 0)} placeholder={field.description || field.label} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900" /> : field.type === 'boolean' || field.type === 'checkbox' ? <input type="checkbox" checked={!!inst[field.name]} onChange={(e) => updateBlockField(block.name, i, field.name, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#714EFF]" /> : field.type === 'list' ? <input type="text" value={Array.isArray(inst[field.name]) ? inst[field.name].join(', ') : inst[field.name] || ''} onChange={(e) => updateBlockField(block.name, i, field.name, e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0))} placeholder={field.description || 'Comma-separated values'} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900" /> : field.options ? <select value={inst[field.name] || ''} onChange={(e) => updateBlockField(block.name, i, field.name, e.target.value)} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"><option value="">Select...</option>{field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select> : <input type="text" value={inst[field.name] || ''} onChange={(e) => updateBlockField(block.name, i, field.name, e.target.value)} placeholder={field.description || field.label} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900" />}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {resourceOutputs.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Link2 className="w-3.5 h-3.5" />Available Outputs</h4>
            <div className="space-y-1">{resourceOutputs.slice(0, 5).map(output => <div key={output.name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"><code className="text-[#714EFF] font-mono">{output.name}</code><span className="text-gray-400">-&gt;</span><span className="text-gray-500 truncate">{output.description}</span></div>)}{resourceOutputs.length > 5 && <p className="text-[10px] text-gray-400 text-center">+{resourceOutputs.length - 5} more outputs</p>}</div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">{saveStatus === 'saving' && <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-1.5 h-1.5 bg-[#714EFF] rounded-full animate-pulse" />Saving...</span>}{saveStatus === 'saved' && <span className="flex items-center gap-1.5 text-xs text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Saved</span>}</div>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[#714EFF] text-white hover:bg-[#5E3FD9] transition-colors disabled:opacity-50"><Save className="w-4 h-4" />Save</button>
        </div>
      </div>
    </div>
  );
}
