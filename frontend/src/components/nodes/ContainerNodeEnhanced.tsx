import { memo, useMemo, useState, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';

const GRID_SIZE = 10;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const DEFAULT_CONTAINER_SIZE = {
  width: 600,
  height: 420,
};
const SELECTION_COLOR = '#2A8BFF';
const HANDLE_COLOR = '#38A1F8';

const getConfigName = (config?: Record<string, unknown>): string | undefined => {
  if (!config) {
    return undefined;
  }
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

const toNumber = (value: unknown | undefined): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const clampDimension = (value: number | undefined, min: number, max: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(value, max));
};

const snap = (value: number) => {
  if (!Number.isFinite(value)) {
    return value;
  }
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

function ContainerNodeEnhanced({ id, data, selected }: NodeProps<ContainerNodeData>) {
  const { setNodes, getNode } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const currentNode = getNode(id);

  const styleWidth =
    toNumber(currentNode?.style?.width) ?? toNumber((currentNode as any)?.width);
  const styleHeight =
    toNumber(currentNode?.style?.height) ?? toNumber((currentNode as any)?.height);

  const width = snap(
    clampDimension(
      data.size?.width ?? styleWidth ?? DEFAULT_CONTAINER_SIZE.width,
      MIN_WIDTH,
      MAX_WIDTH
    )
  );
  const height = snap(
    clampDimension(
      data.size?.height ?? styleHeight ?? DEFAULT_CONTAINER_SIZE.height,
      MIN_HEIGHT,
      MAX_HEIGHT
    )
  );

  const iconPath = data.icon || getCloudIconPath(data.resourceType);
  const category = data.category || data.resourceCategory || 'container';
  const configName = getConfigName(data.config as Record<string, unknown> | undefined);
  const displayName =
    (typeof data.displayName === 'string' && data.displayName.trim() ? data.displayName : undefined) ||
    configName ||
    (typeof data.label === 'string' && data.label.trim() ? data.label : undefined) ||
    data.resourceLabel ||
    data.resourceType;

  const configEntries: Array<[string, unknown]> = data.config
    ? Object.entries(data.config).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
    : [];

  const handlesVisible = selected || hovered;
  const connectionHandleStyle: CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: HANDLE_COLOR,
    border: '1px solid #ffffff',
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
    if (iconPath.endsWith('.svg') || iconPath.endsWith('.png')) {
      return iconPath;
    }
    return null;
  }, [iconPath]);

  const handleResize = (_event: unknown, params: { width?: number; height?: number }) => {
    const nextWidth = snap(clampDimension(params.width ?? width, MIN_WIDTH, MAX_WIDTH));
    const nextHeight = snap(clampDimension(params.height ?? height, MIN_HEIGHT, MAX_HEIGHT));

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
  };

  return (
    <>
      {selected && (
        <NodeResizer
          color={SELECTION_COLOR}
          isVisible
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
            boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
          }}
          lineStyle={{
            border: `1px dashed ${SELECTION_COLOR}`,
            borderRadius: '12px',
          }}
        />
      )}

      <div
        className="relative flex h-full w-full flex-col"
        style={{
          width,
          height,
          border: '2px dashed #9CA3AF',
          borderRadius: '12px',
          background: 'transparent',
          boxShadow: 'none',
          cursor: 'move',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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

        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 border border-gray-200 shadow-sm max-w-full">
          {resolvedIconUrl ? (
            <img src={resolvedIconUrl} alt={data.resourceLabel || data.resourceType} className="w-6 h-6 object-contain" />
          ) : (
            <CloudIcon icon={iconPath} size={24} />
          )}
          <div className="text-left text-xs">
            <div className="font-semibold text-gray-700 truncate" style={{ maxWidth: width - 160 }}>
              {displayName}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">{category}</div>
          </div>
        </div>

        {configEntries.length > 0 && (
          <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-3 py-2 text-xs text-gray-600 border border-gray-200 shadow-sm">
            <div className="font-semibold text-gray-700 mb-1">Configuration</div>
            <ul className="space-y-0.5">
              {configEntries.slice(0, 4).map(([key, value]) => (
                <li key={key} className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="truncate max-w-[160px]" title={String(value)}>{String(value)}</span>
                </li>
              ))}
              {configEntries.length > 4 && (
                <li className="italic text-gray-400">+{configEntries.length - 4} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(ContainerNodeEnhanced);



