import { memo, useMemo, useState, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';

const GRID_SIZE = 10;
const MIN_SIZE = 40;
const MAX_SIZE = 640;
const DEFAULT_NODE_SIZE = 96;
const SELECTION_COLOR = '#2A8BFF';
const HANDLE_COLOR = '#38A1F8';

type ResourceNodeData = {
  label?: string;
  displayName?: string;
  resourceType: string;
  resourceLabel?: string;
  resourceCategory?: string;
  resourceDescription?: string;
  config?: Record<string, unknown>;
  icon?: string;
  category?: string;
  size?: number;
};

const clampSize = (value: number | undefined, min: number, max: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(value, max));
};

const snapSize = (value: number) => {
  if (!Number.isFinite(value)) {
    return DEFAULT_NODE_SIZE;
  }
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(value / GRID_SIZE) * GRID_SIZE));
};

function ResourceNodeEnhanced({ id, data, selected }: NodeProps<ResourceNodeData>) {
  const { setNodes } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const size = snapSize(clampSize(data.size ?? DEFAULT_NODE_SIZE, MIN_SIZE, MAX_SIZE));

  const iconPath = data.icon || getCloudIconPath(data.resourceType);

  const configRecord = data.config as Record<string, unknown> | undefined;
  const configName = typeof configRecord?.name === 'string'
    ? (configRecord.name as string)
    : undefined;

  const labelName = typeof data.label === 'string' ? data.label.split('\n')[0] : undefined;

  const displayName =
    (typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName : undefined) ||
    configName ||
    data.resourceLabel ||
    labelName ||
    data.resourceType ||
    'Resource';

  const configEntries = data.config
    ? Object.entries(data.config).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
    : [];
  const isConfigured = configEntries.length > 0;

  const handleVisible = selected || hovered;
  const connectionHandleStyle: CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: HANDLE_COLOR,
    border: '1px solid #ffffff',
    boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
    transition: 'opacity 120ms ease',
    opacity: handleVisible ? 1 : 0,
    pointerEvents: handleVisible ? 'auto' : 'none',
  };
  const resolvedIconUrl = useMemo(() => {
    if (!iconPath) return null;
    if (iconPath.startsWith('http')) return iconPath;
    if (iconPath.startsWith('/api/')) {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      return `${base}${iconPath}`;
    }
    if (iconPath.endsWith('.svg') || iconPath.endsWith('.png')) {
      return iconPath;
    }
    return null;
  }, [iconPath]);

  const handleResize = (_event: unknown, params: { width?: number; height?: number }) => {
    const rawNext = Math.max(params.width ?? size, params.height ?? size);
    const nextSize = snapSize(rawNext);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              style: {
                ...node.style,
                width: nextSize,
                height: nextSize,
              },
              data: {
                ...node.data,
                size: nextSize,
              },
            }
          : node
      )
    );
  };

  return (
    <>
      {selected && (
        <NodeResizer
          color={SELECTION_COLOR}
          isVisible
          minWidth={MIN_SIZE}
          minHeight={MIN_SIZE}
          maxWidth={MAX_SIZE}
          maxHeight={MAX_SIZE}
          keepAspectRatio
          onResize={handleResize}
          handleStyle={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: SELECTION_COLOR,
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
          }}
          lineStyle={{
            border: `1px dashed ${SELECTION_COLOR}`,
            borderRadius: '8px',
          }}
        />
      )}

      <div
        className="relative flex flex-col items-center justify-center transition-all duration-150 overflow-visible"
        style={{
          width: size,
          height: size,
          cursor: 'move',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`target-${pos}`}
            id={`target-${pos}`}
            type="target"
            position={pos}
            style={connectionHandleStyle}
          />
        ))}
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`source-${pos}`}
            id={`source-${pos}`}
            type="source"
            position={pos}
            style={connectionHandleStyle}
          />
        ))}

        <div
          className="relative flex items-center justify-center w-full h-full"
          style={{
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            backgroundColor: 'transparent',
            transition: 'box-shadow 150ms ease, border 150ms ease',
          }}
        >
          {resolvedIconUrl ? (
            <img
              src={resolvedIconUrl}
              alt={data.resourceLabel || data.resourceType}
              className="pointer-events-none select-none w-full h-full object-contain"
            />
          ) : (
            <CloudIcon icon={iconPath} size={size - 4} className="w-full h-full" />
          )}
          {isConfigured && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          )}
        </div>

        <div className="absolute top-full mt-2 w-max max-w-[200px] text-center flex flex-col items-center pointer-events-none select-none">
          <span className="px-2 py-1 rounded-md bg-slate-900 text-xs font-semibold text-white shadow-md">
            {displayName}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-slate-400 font-mono">
            {data.resourceType}
          </span>
        </div>
      </div>
    </>
  );
}

export default memo(ResourceNodeEnhanced);



