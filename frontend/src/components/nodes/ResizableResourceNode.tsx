import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { getResourceDefinition } from '../../lib/resources/resourceDefinitions';
import { getResourceIcon } from '../../lib/resources/iconMapping';

type ResourceNodeData = {
  label?: string;
  displayName?: string;
  resourceType: string;
  resourceLabel?: string;
  resourceCategory?: string;
  config?: Record<string, unknown>;
};

const MIN_WIDTH = 120;
const MIN_HEIGHT = 120;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 160;

const clamp = (value: number | undefined, min: number, max: number, fallback: number) => {
  const resolved = value ?? fallback;
  return Math.min(Math.max(resolved, min), max);
};

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized.length === 3 ? sanitized.repeat(2) : sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function ResizableResourceNode(props: NodeProps<ResourceNodeData>) {
  const { data, selected } = props;
  const resource = getResourceDefinition(data.resourceType);
  const iconConfig = getResourceIcon(data.resourceType);
  const accent = resource?.color || '#F97316';

  const measuredWidth = (props as unknown as { width?: number }).width;
  const measuredHeight = (props as unknown as { height?: number }).height;
  const width = clamp(measuredWidth, MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH);
  const height = clamp(measuredHeight, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_HEIGHT);

  const label = (data.displayName ?? data.label ?? resource?.label ?? data.resourceType).split('\n')[0];
  const typeLabel = resource?.type ?? data.resourceType;

  const borderColor = selected ? accent : '#CBD5F5';
  const labelBg = useMemo(() => hexToRgba(accent, 0.12), [accent]);
  const labelColor = accent;

  const labelSectionHeight = 36;
  const iconAreaHeight = Math.max(48, height - labelSectionHeight);
  const iconMaxSize = Math.min(iconAreaHeight - 12, width - 24);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        color={accent}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: accent,
          border: '2px solid white',
        }}
        lineStyle={{ borderWidth: 1.5, borderColor: accent }}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        maxWidth={MAX_WIDTH}
        maxHeight={MAX_HEIGHT}
        keepAspectRatio
      />

      <div
        className="flex h-full w-full flex-col rounded-lg border bg-white shadow-sm transition-all duration-150"
        style={{
          borderColor,
          width,
          height,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2"
          style={{ background: accent }}
        />

        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-md"
            style={{
              width: iconMaxSize,
              height: iconMaxSize,
            }}
          >
            {iconConfig?.iconSvg ? (
              <div
                style={{ width: '100%', height: '100%' }}
                dangerouslySetInnerHTML={{ __html: iconConfig.iconSvg }}
              />
            ) : (
              <span className="text-4xl">{iconConfig?.fallbackEmoji || resource?.icon || '💻'}</span>
            )}
          </div>
        </div>

        <div
          className="px-3 py-1 border-t text-center leading-tight"
          style={{
            backgroundColor: labelBg,
            color: labelColor,
          }}
        >
          <div className="text-xs font-semibold truncate">{label}</div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500 truncate">{typeLabel}</div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2"
          style={{ background: accent }}
        />
      </div>
    </>
  );
}

export default memo(ResizableResourceNode);
