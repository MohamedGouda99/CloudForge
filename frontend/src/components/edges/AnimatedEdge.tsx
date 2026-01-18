import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from 'reactflow';
import { useDisplaySettings } from '../../context/DisplaySettingsContext';

const DEFAULT_EDGE_COLOR = '#2A8BFF';

interface AnimatedEdgeProps extends EdgeProps {
  data?: {
    label?: string;
  };
}

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: AnimatedEdgeProps) {
  const {
    showConnectors,
    showConnectorLabels,
    animateConnectorLine,
    animateConnectorCircles,
  } = useDisplaySettings();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Circle offsets for animation (3 circles at different starting positions)
  const circleOffsets = [0, 0.33, 0.66];

  if (!showConnectors) {
    return null;
  }

  const displayLabel = showConnectorLabels ? (label || data?.label) : undefined;
  const edgeColor = (style?.stroke as string) || DEFAULT_EDGE_COLOR;

  return (
    <>
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: animateConnectorLine ? '8 4' : undefined,
          animation: animateConnectorLine
            ? 'dashedLineAnimation 0.5s linear infinite'
            : undefined,
        }}
      />

      {/* Animated circles along the path */}
      {animateConnectorCircles && (
        <g>
          {circleOffsets.map((offset, index) => (
            <circle
              key={`circle-${id}-${index}`}
              r={4}
              fill={edgeColor}
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
            >
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin={`${offset * 2}s`}
                path={edgePath}
              />
            </circle>
          ))}
        </g>
      )}

      {/* Edge label */}
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-600 shadow-sm
              text-gray-700 dark:text-gray-300"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Global animation styles */}
      <style>
        {`
          @keyframes dashedLineAnimation {
            from {
              stroke-dashoffset: 24;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </>
  );
}

export default memo(AnimatedEdge);
