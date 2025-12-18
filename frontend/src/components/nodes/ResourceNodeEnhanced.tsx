import { memo, useMemo, useState, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';

const GRID_SIZE = 10;
const MIN_SIZE = 60;
const MAX_SIZE = 400;
const DEFAULT_NODE_SIZE = 120;
const SELECTION_COLOR = '#E60000';
const HANDLE_COLOR = '#38A1F8';
const LABEL_OFFSET = 8; // Space between node and label

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

  // Get current dimensions from node style (support independent width/height)
  const currentNode = getNode(id);
  const styleWidth = typeof currentNode?.style?.width === 'number' ? currentNode.style.width : undefined;
  const styleHeight = typeof currentNode?.style?.height === 'number' ? currentNode.style.height : undefined;
  const dataSize = typeof data.size === 'number' ? data.size : undefined;

  // Use independent width/height, fallback to size for backwards compatibility
  const width = clampSize(styleWidth ?? dataSize, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE);
  const height = clampSize(styleHeight ?? dataSize, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE);

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

  // Transient dimensions for instant visual feedback - independent width/height like Draw.io
  const [transientDimensions, setTransientDimensions] = useState<{ width: number; height: number } | null>(null);

  // Draw.io-style resize handler - each side resizes independently, others stay fixed
  const handleResize = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      const newWidth = params.width ?? width;
      const newHeight = params.height ?? height;

      // Clamp dimensions independently - no aspect ratio constraint
      const clampedWidth = clampSize(newWidth, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE);
      const clampedHeight = clampSize(newHeight, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE);

      // Update ONLY local transient state - instant 1:1 visual feedback, zero lag
      setTransientDimensions({ width: clampedWidth, height: clampedHeight });
    },
    [width, height]
  );

  // Snap to grid and commit final dimensions after resize ends
  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      const newWidth = params.width ?? width;
      const newHeight = params.height ?? height;

      // Snap each dimension independently to grid
      const snappedWidth = snapToGrid(clampSize(newWidth, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE));
      const snappedHeight = snapToGrid(clampSize(newHeight, MIN_SIZE, MAX_SIZE, DEFAULT_NODE_SIZE));

      // Clear transient state
      setTransientDimensions(null);

      // Commit final snapped dimensions to global state
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: snappedWidth,
                  height: snappedHeight,
                },
                data: {
                  ...node.data,
                  size: undefined, // Remove legacy size field
                },
              }
            : node
        )
      );
    },
    [id, setNodes, width, height]
  );

  // Use transient dimensions during resize, otherwise use actual dimensions
  const displayWidth = transientDimensions?.width ?? width;
  const displayHeight = transientDimensions?.height ?? height;

  return (
    <div
      style={{
        position: 'relative',
        width: displayWidth,
        height: displayHeight,
        background: 'transparent',
      }}
    >
      {/* Draw.io-style NodeResizer: all 8 handles, independent side resizing, no aspect ratio lock */}
      {selected && (
        <NodeResizer
          color={SELECTION_COLOR}
          isVisible={true}
          minWidth={MIN_SIZE}
          minHeight={MIN_SIZE}
          maxWidth={MAX_SIZE}
          maxHeight={MAX_SIZE}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          keepAspectRatio={false}
          shouldResize={() => true}
          handleStyle={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: SELECTION_COLOR,
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(230, 0, 0, 0.4)',
            zIndex: 1000,
          }}
          lineStyle={{
            display: 'none',
          }}
        />
      )}

      {/* Custom selection border - positioned exactly on the node bounds */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: `2px solid ${SELECTION_COLOR}`,
            borderRadius: '4px',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: 'move',
          background: 'transparent',
          position: 'relative',
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

        {/* Icon - fills entire node like Draw.io/Brainboard */}
        {resolvedIconUrl ? (
          <img
            src={resolvedIconUrl}
            alt={data.resourceLabel || data.resourceType}
            className="pointer-events-none select-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            draggable={false}
          />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudIcon icon={iconPath} size={Math.max(displayWidth, displayHeight)} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Configuration indicator - positioned outside the node bounds */}
        {isConfigured && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
            title={`${configEntries.length} properties configured`}
          >
            <svg style={{ width: '10px', height: '10px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}

        {/* Label below the node - positioned outside the measured area */}
        <div
          style={{
            position: 'absolute',
            top: `${displayHeight + LABEL_OFFSET}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              backgroundColor: selected ? '#E60000' : 'rgba(17, 24, 39, 0.9)',
              color: 'white',
              transition: 'background-color 150ms ease',
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              marginTop: '4px',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#9CA3AF',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {data.resourceType}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ResourceNodeEnhanced);
