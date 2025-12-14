import { memo, useMemo, useState, useCallback, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';

const GRID_SIZE = 10; // Increased from 1 for more stable resizing
const MIN_SIZE = 60;
const MAX_SIZE = 400;
const DEFAULT_NODE_SIZE = 120;
const SELECTION_COLOR = '#E60000';
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

const clampSize = (value: number | undefined, min: number, max: number, fallback: number) => {
  if (value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(value, max));
};

const snapToGrid = (value: number) => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

function ResourceNodeEnhanced({ id, data, selected }: NodeProps<ResourceNodeData>) {
  const { setNodes, getNode } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  // Get current size from node data or style
  const currentNode = getNode(id);
  const styleWidth = typeof currentNode?.style?.width === 'number' ? currentNode.style.width : undefined;
  const dataSize = typeof data.size === 'number' ? data.size : undefined;
  
  const size = clampSize(dataSize ?? styleWidth, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE);

  const iconPath = data.icon || getCloudIconPath(data.resourceType);

  const configRecord = data.config as Record<string, unknown> | undefined;
  const configName = typeof configRecord?.name === 'string' ? configRecord.name : undefined;
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
    background: '#ffffff',
    border: `2px solid ${HANDLE_COLOR}`,
    boxShadow: '0 2px 4px rgba(15,23,42,0.25)',
    transition: 'opacity 120ms ease',
    opacity: handleVisible ? 1 : 0,
    pointerEvents: handleVisible ? 'auto' : 'none',
    zIndex: 10,
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

  // Handle resize using NodeResizer's onResize callback
  const handleResize = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      // Use the larger dimension to maintain square aspect ratio
      const newWidth = params.width ?? size;
      const newHeight = params.height ?? size;
      const newSize = snapToGrid(clampSize(Math.max(newWidth, newHeight), MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE));

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: newSize,
                  height: newSize,
                },
                data: {
                  ...node.data,
                  size: newSize,
                },
              }
            : node
        )
      );
    },
    [id, setNodes, size]
  );

  return (
    <>
      {/* Use React Flow's NodeResizer for accurate resizing */}
      <NodeResizer
        color={SELECTION_COLOR}
        isVisible={selected}
        minWidth={MIN_SIZE}
        minHeight={MIN_SIZE}
        maxWidth={MAX_SIZE}
        maxHeight={MAX_SIZE}
        onResize={handleResize}
        keepAspectRatio
        handleStyle={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: SELECTION_COLOR,
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(230, 0, 0, 0.4)',
        }}
        lineStyle={{
          border: `1.5px dashed ${SELECTION_COLOR}`,
          borderRadius: '8px',
        }}
      />

      <div
        className="relative flex flex-col items-center justify-center overflow-visible"
        style={{
          width: size,
          height: size,
          cursor: 'move',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          // Use CSS containment to reduce layout thrashing
          contain: 'layout style',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Connection handles - all 4 sides */}
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

        {/* Main content area */}
        <div
          className="relative flex items-center justify-center w-full h-full"
          style={{
            background: selected ? 'rgba(230, 0, 0, 0.03)' : 'transparent',
            border: selected ? `2px solid ${SELECTION_COLOR}` : '1px solid transparent',
            borderRadius: '8px',
            boxShadow: selected ? '0 4px 16px rgba(230, 0, 0, 0.15)' : 'none',
            padding: '8px',
            transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
          }}
        >
          {resolvedIconUrl ? (
            <img
              src={resolvedIconUrl}
              alt={data.resourceLabel || data.resourceType}
              className="pointer-events-none select-none w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <CloudIcon icon={iconPath} size={size - 24} className="w-full h-full" />
          )}
          
          {/* Configuration indicator */}
          {isConfigured && (
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
              title={`${configEntries.length} properties configured`}
            >
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        {/* Label below the node */}
        <div className="absolute top-full mt-2 w-max max-w-[200px] text-center flex flex-col items-center pointer-events-none select-none">
          <span 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors duration-150 ${
              selected 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-900/90 dark:bg-gray-800 text-white'
            }`}
          >
            {displayName}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-mono truncate max-w-full">
            {data.resourceType}
          </span>
        </div>
      </div>
    </>
  );
}

export default memo(ResourceNodeEnhanced);
