import { memo, useCallback, useMemo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { getResourceDefinition } from '../../lib/resources/resourceDefinitions';
import { getResourceIcon } from '../../lib/resources/iconMapping';

type ContainerNodeData = {
  label?: string;
  resourceType: string;
  description?: string;
  config?: Record<string, unknown>;
};

const MIN_WIDTH = 320;
const MIN_HEIGHT = 220;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1000;
const DEFAULT_WIDTH = 420;
const DEFAULT_HEIGHT = 320;

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

function ResizableContainerNode(props: NodeProps<ContainerNodeData>) {
  const { data, selected } = props;
  const resource = getResourceDefinition(data.resourceType);
  const iconConfig = getResourceIcon(data.resourceType);
  const accent = resource?.color || '#2563EB';

  const measuredWidth = (props as unknown as { width?: number }).width;
  const measuredHeight = (props as unknown as { height?: number }).height;
  const width = clamp(measuredWidth, MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH);
  const height = clamp(measuredHeight, MIN_HEIGHT, MAX_HEIGHT, DEFAULT_HEIGHT);

  const [isCollapsed, setCollapsed] = useState(false);

  const borderColor = selected ? accent : '#CBD5E1';
  const headerBg = useMemo(() => hexToRgba(accent, 0.08), [accent]);
  const badgeBg = useMemo(() => hexToRgba(accent, 0.18), [accent]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <>
      {!isCollapsed && selected && (
        <NodeResizer
          color={accent}
          isVisible
          handleStyle={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: accent,
            border: '2px solid white',
          }}
          lineStyle={{ borderWidth: 2, borderColor: accent }}
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          maxWidth={MAX_WIDTH}
          maxHeight={MAX_HEIGHT}
        />
      )}

      <div
        className="flex h-full flex-col rounded-xl border bg-white shadow-sm transition-all duration-150"
        style={{
          borderColor,
          width,
          height: isCollapsed ? 68 : height,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3"
          style={{ background: accent }}
        />

        <div
          className="flex items-center gap-3 px-4 py-3 border-b rounded-t-xl"
          style={{ backgroundColor: headerBg, borderColor: hexToRgba(accent, 0.2) }}
        >
          <div
            className="flex items-center justify-center rounded-md bg-white border shadow-sm flex-shrink-0"
            style={{ width: 42, height: 42, borderColor: hexToRgba(accent, 0.28) }}
          >
            {iconConfig?.iconSvg ? (
              <div style={{ width: 28, height: 28 }} dangerouslySetInnerHTML={{ __html: iconConfig.iconSvg }} />
            ) : (
              <span className="text-2xl">{iconConfig?.fallbackEmoji || resource?.icon || '📦'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900 truncate">
              {data.label || resource?.label}
            </div>
            {!isCollapsed && (
              <div className="text-[11px] uppercase tracking-wide text-slate-500 truncate">
                {resource?.type}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium px-2 py-1 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: badgeBg, color: accent }}
            >
              Container
            </span>
            <button
              onClick={toggleCollapsed}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/70 transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex-1 relative px-4 py-4 text-xs text-slate-500">
            <div className="absolute inset-4 rounded-xl border-2 border-dashed border-slate-300 pointer-events-none" />
            <div className="relative h-full w-full flex flex-col gap-3">
              {data.description && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600">
                  {data.description}
                </div>
              )}
              {data.config && Object.keys(data.config).length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                    Configuration
                  </h4>
                  <div className="space-y-1 text-slate-600">
                    {Object.entries(data.config)
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
          style={{ background: accent }}
        />
      </div>
    </>
  );
}

export default memo(ResizableContainerNode);
