import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import {
  X,
  Settings2,
  Link2,
  Sliders,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Box,
  ArrowRight,
  ArrowLeft,
  Save,
  RotateCcw,
} from 'lucide-react';
import CloudIcon from './CloudIcon';
import { getCloudIconPath } from '../lib/resources/cloudIconsComplete';
import { resolveResourceIcon } from '../lib/resources/iconResolver';
import {
  getResourceSchema,
  getSchemaFieldsByGroup,
  validateField,
  validateSchema,
  getDefaultValues,
  SchemaField,
} from '../lib/resources/resourceSchemas';

export interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
  onOpenConfig?: () => void;
  connections: { incoming: Edge[]; outgoing: Edge[] };
  allNodes?: Node[];
  nodes?: Node[];
}

type TabId = 'properties' | 'connections' | 'advanced';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'properties', label: 'Properties', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'connections', label: 'Connections', icon: <Link2 className="w-4 h-4" /> },
  { id: 'advanced', label: 'Advanced', icon: <Sliders className="w-4 h-4" /> },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface TagInputProps {
  value: Record<string, string> | undefined;
  onChange: (value: Record<string, string>) => void;
  placeholder?: string;
}

function TagInput({ value = {}, onChange, placeholder }: TagInputProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      onChange({ ...value, [newKey.trim()]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const entries = Object.entries(value);

  return (
    <div className="space-y-2">
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 px-2 py-1.5 bg-secondary/50 rounded-md text-sm"
            >
              <span className="font-medium text-foreground">{k}</span>
              <span className="text-muted-foreground">=</span>
              <span className="flex-1 text-foreground truncate">{v}</span>
              <button
                type="button"
                onClick={() => handleRemove(k)}
                className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
          className="flex-1 px-2 py-1.5 text-sm rounded-md border border-border bg-background
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder || 'Value'}
          className="flex-1 px-2 py-1.5 text-sm rounded-md border border-border bg-background
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newKey.trim()}
          className="px-2 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface FieldRendererProps {
  field: SchemaField;
  value: any;
  error: string | null;
  onChange: (name: string, value: any) => void;
  allValues: Record<string, any>;
}

function FieldRenderer({ field, value, error, onChange, allValues }: FieldRendererProps) {
  if (field.dependsOn) {
    const dependencyValue = allValues[field.dependsOn.field];
    if (dependencyValue !== field.dependsOn.value) {
      return null;
    }
  }

  const inputClasses = `w-full px-3 py-2 text-sm rounded-lg border bg-background
    transition-all duration-150
    ${error
      ? 'border-destructive focus:ring-destructive/30'
      : 'border-border focus:ring-primary/30 focus:border-primary/50'
    }
    focus:outline-none focus:ring-2
    placeholder:text-muted-foreground/60`;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'cidr':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={inputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(field.name, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-secondary rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm
                            peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-foreground">{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${inputClasses} font-mono text-xs resize-y min-h-[80px]`}
          />
        );

      case 'tags':
        return (
          <TagInput
            value={value}
            onChange={(v) => onChange(field.name, v)}
            placeholder={field.placeholder}
          />
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(field.name, parsed);
              } catch {
                onChange(field.name, e.target.value);
              }
            }}
            placeholder={field.placeholder}
            rows={5}
            className={`${inputClasses} font-mono text-xs resize-y min-h-[100px]`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1.5">
      {field.type !== 'checkbox' && (
        <label className="flex items-center gap-1 text-sm font-medium text-foreground">
          {field.label}
          {field.validation?.required && <span className="text-destructive">*</span>}
        </label>
      )}
      {renderInput()}
      {field.description && !error && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface ConnectionItemProps {
  node: Node | undefined;
  direction: 'incoming' | 'outgoing';
  edge: Edge;
}

function ConnectionItem({ node, direction }: ConnectionItemProps) {
  const nodeData = node?.data as any;
  const icon = nodeData?.icon || getCloudIconPath(nodeData?.resourceType);

  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background border border-border">
        <CloudIcon icon={icon} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {nodeData?.displayName || nodeData?.config?.name || nodeData?.resourceLabel || 'Unnamed Resource'}
        </p>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {nodeData?.resourceType || node?.type || 'Unknown'}
        </p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        {direction === 'incoming' ? (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs">from</span>
          </>
        ) : (
          <>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">to</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPanel({
  selectedNode,
  onUpdateNode,
  onClose,
  onOpenConfig,
  connections,
  allNodes,
  nodes,
}: PropertiesPanelProps) {
  const effectiveNodes = allNodes || nodes || [];
  const [activeTab, setActiveTab] = useState<TabId>('properties');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const initialValuesRef = useRef<Record<string, any>>({});

  const nodeData = selectedNode?.data as any;
  const resourceType = nodeData?.resourceType;
  const schema = useMemo(() => resourceType ? getResourceSchema(resourceType) : undefined, [resourceType]);

  const basicFields = useMemo(() => schema ? getSchemaFieldsByGroup(schema, 'basic') : [], [schema]);
  const advancedFields = useMemo(() => schema ? getSchemaFieldsByGroup(schema, 'advanced') : [], [schema]);

  const icon = useMemo(() => {
    if (!nodeData) return null;
    return nodeData.icon || resolveResourceIcon(resourceType, nodeData.icon);
  }, [nodeData, resourceType]);

  useEffect(() => {
    if (selectedNode && nodeData) {
      const existingConfig = nodeData.config || {};
      const schemaDefaults = schema ? getDefaultValues(schema) : {};
      const merged = {
        name: nodeData.displayName || nodeData.config?.name || '',
        ...schemaDefaults,
        ...existingConfig,
      };
      setFormValues(merged);
      initialValuesRef.current = merged;
      setErrors({});
      setIsDirty(false);
      setSaveStatus('idle');
    }
  }, [selectedNode?.id, schema]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value };
      setIsDirty(true);
      return next;
    });

    if (schema) {
      const field = schema.fields.find((f) => f.name === name);
      if (field) {
        const error = validateField(field, value, formValues);
        setErrors((prev) => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    }
  }, [schema, formValues]);

  const debouncedValues = useDebounce(formValues, 800);

  useEffect(() => {
    if (!selectedNode || !isDirty) return;
    if (Object.keys(errors).length > 0) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      const { name, ...restConfig } = debouncedValues;
      onUpdateNode(selectedNode.id, {
        ...nodeData,
        displayName: name || nodeData.displayName,
        config: restConfig,
      });
      setSaveStatus('saved');
      setIsDirty(false);

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 200);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedValues, selectedNode, isDirty, errors, onUpdateNode, nodeData]);

  const handleSave = useCallback(() => {
    if (!selectedNode || !schema) return;

    const validationErrors = validateSchema(schema, formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const { name, ...restConfig } = formValues;
    onUpdateNode(selectedNode.id, {
      ...nodeData,
      displayName: name || nodeData.displayName,
      config: restConfig,
    });
    setSaveStatus('saved');
    setIsDirty(false);

    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, [selectedNode, schema, formValues, onUpdateNode, nodeData]);

  const handleReset = useCallback(() => {
    setFormValues(initialValuesRef.current);
    setErrors({});
    setIsDirty(false);
  }, []);

  const getNodeById = useCallback((id: string) => {
    return effectiveNodes.find((n) => n.id === id);
  }, [effectiveNodes]);

  if (!selectedNode) {
    return (
      <div className="w-80 h-full bg-card/95 backdrop-blur border-l border-border flex flex-col
                      shadow-[-4px_0_24px_rgba(0,0,0,0.08)]">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <Box className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Selection</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Select a resource on the canvas to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  const displayName = nodeData?.displayName || nodeData?.config?.name || nodeData?.resourceLabel || 'Resource';
  const resourceLabel = nodeData?.resourceLabel || resourceType || 'Unknown Type';
  const isContainer = schema?.isContainer || nodeData?.isContainer;

  return (
    <div className="w-80 h-full bg-card/95 backdrop-blur border-l border-border flex flex-col
                    shadow-[-4px_0_24px_rgba(0,0,0,0.08)] animate-in slide-in-from-right duration-200">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-secondary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-background to-secondary
                          border border-border shadow-sm flex items-center justify-center">
              <CloudIcon icon={icon} size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm leading-tight">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                {resourceLabel}
              </p>
              {isContainer && (
                <span className="inline-flex items-center px-1.5 py-0.5 mt-1 text-[10px] font-medium
                               bg-primary/10 text-primary rounded">
                  Container
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground
                       hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 flex border-b border-border bg-background/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium
                       transition-all duration-150 relative
                       ${activeTab === tab.id
                         ? 'text-primary'
                         : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                       }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'properties' && (
          <div className="p-4 space-y-4">
            {schema ? (
              <>
                {basicFields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={formValues[field.name]}
                    error={errors[field.name] || null}
                    onChange={handleFieldChange}
                    allValues={formValues}
                  />
                ))}
                {basicFields.length === 0 && (
                  <div className="py-8 text-center">
                    <Settings2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No properties available</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <FieldRenderer
                  field={{
                    name: 'name',
                    label: 'Name',
                    type: 'text',
                    placeholder: 'Resource name',
                    validation: { required: true },
                  }}
                  value={formValues.name}
                  error={errors.name || null}
                  onChange={handleFieldChange}
                  allValues={formValues}
                />
                <div className="py-4 text-center border border-dashed border-border rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    No schema defined for this resource type.
                    <br />
                    Add custom properties in the Advanced tab.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Incoming ({connections.incoming.length})
              </h4>
              {connections.incoming.length > 0 ? (
                <div className="space-y-2">
                  {connections.incoming.map((edge) => (
                    <ConnectionItem
                      key={edge.id}
                      edge={edge}
                      direction="incoming"
                      node={getNodeById(edge.source)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-3 text-center bg-secondary/20 rounded-lg">
                  No incoming connections
                </p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Outgoing ({connections.outgoing.length})
              </h4>
              {connections.outgoing.length > 0 ? (
                <div className="space-y-2">
                  {connections.outgoing.map((edge) => (
                    <ConnectionItem
                      key={edge.id}
                      edge={edge}
                      direction="outgoing"
                      node={getNodeById(edge.target)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-3 text-center bg-secondary/20 rounded-lg">
                  No outgoing connections
                </p>
              )}
            </div>

            {connections.incoming.length === 0 && connections.outgoing.length === 0 && (
              <div className="py-6 text-center">
                <Link2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No connections yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Drag from connection handles to create edges
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-4 space-y-4">
            {schema && advancedFields.length > 0 ? (
              advancedFields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  value={formValues[field.name]}
                  error={errors[field.name] || null}
                  onChange={handleFieldChange}
                  allValues={formValues}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <Sliders className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No advanced properties</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Node Info
              </h4>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Node ID</dt>
                  <dd className="font-mono text-foreground">{selectedNode.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-mono text-foreground">{selectedNode.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Position</dt>
                  <dd className="font-mono text-foreground">
                    {Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)}
                  </dd>
                </div>
                {selectedNode.parentNode && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Parent</dt>
                    <dd className="font-mono text-foreground truncate max-w-[120px]">
                      {selectedNode.parentNode}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {saveStatus === 'idle' && isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Unsaved changes
              </span>
            )}
            {Object.keys(errors).length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground
                         hover:text-foreground"
                title="Reset changes"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || Object.keys(errors).length > 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                       bg-primary text-primary-foreground hover:bg-primary/90
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
