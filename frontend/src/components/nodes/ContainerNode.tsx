import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getResourceDefinition } from '../../lib/resources/resourceDefinitions';

function ContainerNode({ data, selected }: NodeProps) {
  const resource = getResourceDefinition(data.resourceType);
  const icon = resource?.icon || '📦';
  const color = resource?.color || '#3B82F6';

  return (
    <div
      className="px-4 py-3 shadow-lg rounded-lg border-2 bg-white/95 backdrop-blur-sm min-w-[200px]"
      style={{
        borderColor: selected ? color : '#E5E7EB',
        borderStyle: 'dashed',
        borderWidth: '2px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{ background: color }}
      />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900" style={{ color }}>
            {data.label || resource?.label}
          </div>
          <div className="text-xs text-gray-500">{resource?.type}</div>
        </div>
        {selected && (
          <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
            Container
          </div>
        )}
      </div>

      {data.description && (
        <div className="text-xs text-gray-600 mt-2 border-t pt-2">
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{ background: color }}
      />
    </div>
  );
}

export default memo(ContainerNode);
