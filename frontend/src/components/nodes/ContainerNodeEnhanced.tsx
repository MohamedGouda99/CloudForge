import { memo, useMemo, useState, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from 'reactflow';
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

  // Get icon path for the container type
  const iconPath = data.icon || getCloudIconPath(data.resourceType);
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

  // Use RAF for ultra-smooth resizing performance
  const rafRef = useRef<number | null>(null);
  const [transientSize, setTransientSize] = useState<{ width: number; height: number } | null>(null);

  // Optimized resize handler using RAF and local state
  const handleResize = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const nextWidth = clamp(params.width, MIN_WIDTH, MAX_WIDTH, DEFAULT_CONTAINER_SIZE.width);
      const nextHeight = clamp(params.height, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_CONTAINER_SIZE.height);

      // Update local transient state for instant visual feedback
      setTransientSize({ width: nextWidth, height: nextHeight });

      // Schedule RAF to batch DOM updates
      rafRef.current = requestAnimationFrame(() => {
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
      });
    },
    [id, setNodes]
  );

  // Snap to grid and finalize after resize ends
  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width?: number; height?: number }) => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const nextWidth = snap(clamp(params.width, MIN_WIDTH, MAX_WIDTH, DEFAULT_CONTAINER_SIZE.width));
      const nextHeight = snap(clamp(params.height, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_CONTAINER_SIZE.height));

      // Clear transient state
      setTransientSize(null);

      // Commit final snapped size
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

  // Use transient size during resize, otherwise use actual size
  const displayWidth = transientSize?.width ?? width;
  const displayHeight = transientSize?.height ?? height;

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Border color based on container type
  const borderColor = useMemo(() => {
    const type = data.resourceType?.toLowerCase() || '';
    if (type.includes('vpc') || type.includes('virtual_network')) return '#10B981'; // Green for VPC
    if (type.includes('subnet')) return '#3B82F6'; // Blue for Subnet
    if (type.includes('region') || type.includes('resource_group')) return '#F59E0B'; // Orange for region/resource group
    if (type.includes('availability_zone')) return '#8B5CF6'; // Purple for AZ
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
        onResizeEnd={handleResizeEnd}
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
        style={{
          position: 'relative',
          width: displayWidth,
          height: displayHeight,
          // Allow clicks to pass through to nested nodes
          pointerEvents: 'none',
        }}
      >
        {/* Border frame - single div with border, pointer-events only on border area via pseudo approach */}
        {/* Top border strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            borderTop: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderLeft: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderRight: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            pointerEvents: 'auto',
            cursor: 'move',
            zIndex: 1,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        {/* Bottom border strip */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 14,
            borderBottom: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderLeft: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderRight: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            pointerEvents: 'auto',
            cursor: 'move',
            zIndex: 1,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        {/* Left border strip */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            bottom: 14,
            left: 0,
            width: 14,
            borderLeft: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            pointerEvents: 'auto',
            cursor: 'move',
            zIndex: 1,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        {/* Right border strip */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            bottom: 14,
            right: 0,
            width: 14,
            borderRight: selected ? `2px solid ${SELECTION_COLOR}` : `2px dashed ${borderColor}`,
            pointerEvents: 'auto',
            cursor: 'move',
            zIndex: 1,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />

        {/* Connection handles on all 4 sides */}
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`container-target-${pos}`}
            id={`container-target-${pos}`}
            type="target"
            position={pos}
            style={{ ...connectionHandleStyle, pointerEvents: handlesVisible ? 'auto' : 'none' }}
          />
        ))}
        {[Position.Top, Position.Bottom, Position.Left, Position.Right].map((pos) => (
          <Handle
            key={`container-source-${pos}`}
            id={`container-source-${pos}`}
            type="source"
            position={pos}
            style={{ ...connectionHandleStyle, pointerEvents: handlesVisible ? 'auto' : 'none' }}
          />
        ))}

        {/* Small icon in top-left corner to identify container type */}
        {resolvedIconUrl && (
          <div
            className="absolute top-2 left-2 w-7 h-7 rounded-md flex items-center justify-center bg-white/80 border shadow-sm"
            style={{
              borderColor: `${borderColor}40`,
              pointerEvents: 'auto',
              cursor: 'move',
              zIndex: 10,
            }}
          >
            <img
              src={resolvedIconUrl}
              alt={data.resourceType}
              className="w-4 h-4 object-contain"
              draggable={false}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default memo(ContainerNodeEnhanced);
