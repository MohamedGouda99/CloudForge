import { memo, useMemo, useState, useRef, useEffect, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
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

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw';

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
  const { setNodes, getNode } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const resizingRef = useRef(false);
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
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#ffffff',
    border: `2px solid ${HANDLE_COLOR}`,
    boxShadow: '0 2px 4px rgba(15,23,42,0.3)',
    transition: 'all 120ms ease',
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

  const startResize = (handle: ResizeHandle, e: React.PointerEvent) => {
    if (resizingRef.current) return;

    e.stopPropagation();
    e.preventDefault();

    resizingRef.current = true;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const node = getNode(id);
    if (!node) {
      resizingRef.current = false;
      return;
    }

    // Disable node dragging during resize
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, draggable: false } : n
      )
    );

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = size;
    const startPosX = node.position.x;
    const startPosY = node.position.y;

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newSize = startSize;
      let newX = startPosX;
      let newY = startPosY;

      // Calculate new size and position based on which corner is being dragged
      // The opposite corner stays fixed in absolute position
      switch (handle) {
        case 'se': {
          // Dragging bottom-right, top-left corner stays fixed
          // Top-left is at (startPosX, startPosY) - keep it there
          const newWidth = startSize + deltaX;
          const newHeight = startSize + deltaY;
          newSize = Math.max(newWidth, newHeight);
          // Position doesn't change because top-left is the anchor
          newX = startPosX;
          newY = startPosY;
          break;
        }
        case 'sw': {
          // Dragging bottom-left, top-right corner stays fixed
          // Top-right is at (startPosX + startSize, startPosY)
          const anchorX = startPosX + startSize;
          const newWidth = startSize - deltaX;
          const newHeight = startSize + deltaY;
          newSize = Math.max(newWidth, newHeight);
          // New top-left position so that top-right stays at anchorX
          newX = anchorX - newSize;
          newY = startPosY;
          break;
        }
        case 'ne': {
          // Dragging top-right, bottom-left corner stays fixed
          // Bottom-left is at (startPosX, startPosY + startSize)
          const anchorY = startPosY + startSize;
          const newWidth = startSize + deltaX;
          const newHeight = startSize - deltaY;
          newSize = Math.max(newWidth, newHeight);
          // New top-left position so that bottom-left stays at anchorY
          newX = startPosX;
          newY = anchorY - newSize;
          break;
        }
        case 'nw': {
          // Dragging top-left, bottom-right corner stays fixed
          // Bottom-right is at (startPosX + startSize, startPosY + startSize)
          const anchorX = startPosX + startSize;
          const anchorY = startPosY + startSize;
          const newWidth = startSize - deltaX;
          const newHeight = startSize - deltaY;
          newSize = Math.max(newWidth, newHeight);
          // New top-left position so that bottom-right stays at (anchorX, anchorY)
          newX = anchorX - newSize;
          newY = anchorY - newSize;
          break;
        }
      }

      newSize = snapSize(clampSize(newSize, MIN_SIZE, MAX_SIZE));

      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id
            ? {
                ...n,
                position: { x: newX, y: newY },
                style: { ...n.style, width: newSize, height: newSize },
                data: { ...n.data, size: newSize },
                draggable: false,
              }
            : n
        )
      );
    };

    const onEnd = (endEvent: PointerEvent) => {
      target.releasePointerCapture(endEvent.pointerId);
      resizingRef.current = false;

      // Re-enable node dragging after resize
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === id ? { ...n, draggable: true } : n
        )
      );

      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
  };

  return (
    <>
      <div
        className="relative flex flex-col items-center justify-center transition-all duration-150 overflow-visible"
        style={{
          width: size,
          height: size,
          cursor: resizingRef.current ? 'default' : 'move',
          border: 'none',
          outline: 'none',
          background: 'transparent',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Selection border */}
        {selected && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              border: `1px dashed ${SELECTION_COLOR}`,
              borderRadius: '8px',
            }}
          />
        )}

        {/* Resize handles - 4 corners only */}
        {selected && (
          <>
            {(['nw', 'ne', 'se', 'sw'] as ResizeHandle[]).map((handle) => {
              const handleSize = 12;
              const offset = -handleSize / 2;

              let positionStyle: CSSProperties = { position: 'absolute', zIndex: 1000 };
              let cursor = '';

              switch (handle) {
                case 'nw':
                  positionStyle = { ...positionStyle, top: offset, left: offset, cursor: 'nwse-resize' };
                  break;
                case 'ne':
                  positionStyle = { ...positionStyle, top: offset, right: offset, cursor: 'nesw-resize' };
                  break;
                case 'se':
                  positionStyle = { ...positionStyle, bottom: offset, right: offset, cursor: 'nwse-resize' };
                  break;
                case 'sw':
                  positionStyle = { ...positionStyle, bottom: offset, left: offset, cursor: 'nesw-resize' };
                  break;
              }

              return (
                <div
                  key={handle}
                  className="nodrag nopan"
                  style={{
                    ...positionStyle,
                    width: handleSize,
                    height: handleSize,
                    borderRadius: '50%',
                    backgroundColor: SELECTION_COLOR,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
                    pointerEvents: 'auto',
                    touchAction: 'none',
                  }}
                  onPointerDown={(e) => startResize(handle, e)}
                />
              );
            })}
          </>
        )}

        {/* Connection handles */}
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
