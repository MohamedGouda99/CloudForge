import { memo, useMemo, useState, useCallback, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';

const GRID_SIZE = 10;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 180;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const DEFAULT_CONTAINER_SIZE = {
  width: 500,
  height: 350,
};
const SELECTION_COLOR = '#2A8BFF';
const HANDLE_COLOR = '#38A1F8';

const getConfigName = (config?: Record<string, unknown>): string | undefined => {
  if (!config) return undefined;
  const raw = config.name;
  return typeof raw === 'string' && raw.trim() ? raw : undefined;
};

type ContainerNodeData = {
  label?: string;
  displayName?: string;
  resourceType: string;
  resourceLabel?: string;
  resourceCategory?: string;
  resourceDescription?: string;
  config?: Record<string, unknown>;
  icon?: string;
  category?: string;
  size?: { width: number; height: number };
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const clamp = (value: number | undefined, min: number, max: number, fallback: number) => {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(value, max));
};

const snap = (value: number) => {
  if (!Number.isFinite(value)) return value;
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

function ContainerNodeEnhanced({ id, data, selected }: NodeProps<ContainerNodeData>) {
  const { setNodes, getNode } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  
  const currentNode = getNode(id);

  // Get dimensions from multiple sources with fallbacks
  const styleWidth = toNumber(currentNode?.style?.width);
  const styleHeight = toNumber(currentNode?.style?.height);
  const dataWidth = data.size?.width;
  const dataHeight = data.size?.height;

  const width = snap(clamp(dataWidth ?? styleWidth, MIN_WIDTH, MAX_WIDTH, DEFAULT_CONTAINER_SIZE.width));
  const height = snap(clamp(dataHeight ?? styleHeight, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_CONTAINER_SIZE.height));

  const iconPath = data.icon || getCloudIconPath(data.resourceType);
  const category = data.category || data.resourceCategory || 'container';
  const configName = getConfigName(data.config);
  
  const displayName = useMemo(() => {
    return (
      (typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName : undefined) ||
      configName ||
      (typeof data.label === 'string' && data.label.trim() ? data.label : undefined) ||
      data.resourceLabel ||
      data.resourceType
    );
  }, [data.displayName, configName, data.label, data.resourceLabel, data.resourceType]);

  const configEntries = useMemo(() => {
    if (!data.config) return [];
    return Object.entries(data.config).filter(
      ([_, value]) => value !== undefined && value !== '' && value !== null
    );
  }, [data.config]);

  const handlesVisible = selected || hovered;
  const connectionHandleStyle: CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: HANDLE_COLOR,
    border: '2px solid #ffffff',
    boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
    transition: 'opacity 120ms ease',
    opacity: handlesVisible ? 1 : 0,
    pointerEvents: handlesVisible ? 'auto' : 'none',
  };

  const resolvedIconUrl = useMemo(() => {
    if (!iconPath) return null;
    if (iconPath.startsWith('http')) return iconPath;
    if (iconPath.startsWith('/api/')) {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      return `${base}${iconPath}`;
    }
    if (iconPath.endsWith('.svg') || iconPath.endsWith('.png')) return iconPath;
    return null;
  }, [iconPath]);

  // Memoized resize handler to prevent unnecessary re-renders
  const handleResize = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      const nextWidth = snap(clamp(params.width, MIN_WIDTH, MAX_WIDTH, DEFAULT_CONTAINER_SIZE.width));
      const nextHeight = snap(clamp(params.height, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_CONTAINER_SIZE.height));

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: nextWidth,
                  height: nextHeight,
                },
                data: {
                  ...node.data,
                  size: { width: nextWidth, height: nextHeight },
                },
              }
            : node
        )
      );
    },
    [id, setNodes]
  );

  // Border color based on container type
  const borderColor = useMemo(() => {
    const type = data.resourceType?.toLowerCase() || '';
    if (type.includes('vpc') || type.includes('virtual_network')) return '#8B5CF6';
    if (type.includes('subnet')) return '#10B981';
    if (type.includes('region') || type.includes('resource_group')) return '#F59E0B';
    return '#6B7280';
  }, [data.resourceType]);

  return (
    <>
      <NodeResizer
        color={SELECTION_COLOR}
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        maxWidth={MAX_WIDTH}
        maxHeight={MAX_HEIGHT}
        onResize={handleResize}
        handleStyle={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: SELECTION_COLOR,
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(42, 139, 255, 0.35)',
        }}
        lineStyle={{
          border: `2px dashed ${SELECTION_COLOR}`,
          borderRadius: '12px',
        }}
      />

      <div
        className="relative flex h-full w-full flex-col"
        style={{
          width,
          height,
          border: `2px dashed ${selected ? SELECTION_COLOR : borderColor}`,
          borderRadius: '12px',
          background: selected ? 'rgba(42, 139, 255, 0.02)' : 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(2px)',
          cursor: 'move',
          transition: 'border-color 150ms ease, background 150ms ease',
          // CSS containment for performance
          contain: 'layout style',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Connection handles on all 4 sides */}
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`container-target-${pos}`}
            id={`container-target-${pos}`}
            type="target"
            position={pos}
            style={connectionHandleStyle}
          />
        ))}
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`container-source-${pos}`}
            id={`container-source-${pos}`}
            type="source"
            position={pos}
            style={connectionHandleStyle}
          />
        ))}

        {/* Header with icon and name - Brainboard style */}
        <div 
          className="absolute top-3 left-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/95 border shadow-sm max-w-[calc(100%-24px)]"
          style={{ borderColor: `${borderColor}40` }}
        >
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${borderColor}15` }}
          >
            {resolvedIconUrl ? (
              <img 
                src={resolvedIconUrl} 
                alt={data.resourceLabel || data.resourceType} 
                className="w-5 h-5 object-contain"
                draggable={false}
              />
            ) : (
              <CloudIcon icon={iconPath} size={20} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div 
              className="font-semibold text-gray-800 truncate text-sm leading-tight"
              style={{ maxWidth: width - 140 }}
            >
              {displayName}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-medium mt-0.5" style={{ color: borderColor }}>
              {category}
            </div>
          </div>
        </div>

        {/* Drop zone indicator */}
        <div 
          className="absolute inset-6 top-16 rounded-lg border-2 border-dashed pointer-events-none flex items-center justify-center"
          style={{ borderColor: `${borderColor}30` }}
        >
          <span className="text-xs text-gray-400 font-medium">
            Drop resources here
          </span>
        </div>

        {/* Configuration panel - Brainboard style */}
        {configEntries.length > 0 && (
          <div 
            className="absolute bottom-3 right-3 rounded-lg bg-white/95 border px-3 py-2 text-xs shadow-sm max-w-[280px]"
            style={{ borderColor: `${borderColor}30` }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: borderColor }}
              />
              <span className="font-semibold text-gray-700">Configuration</span>
            </div>
            <ul className="space-y-1">
              {configEntries.slice(0, 4).map(([key, value]) => (
                <li key={key} className="flex items-center gap-1.5 text-gray-600">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="truncate" title={String(value)}>{String(value)}</span>
                </li>
              ))}
              {configEntries.length > 4 && (
                <li className="text-gray-400 italic">+{configEntries.length - 4} more properties</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(ContainerNodeEnhanced);
