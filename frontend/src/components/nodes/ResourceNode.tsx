import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getResourceDefinition } from '../../lib/resources/resourceDefinitions';

function ResourceNode({ data, selected }: NodeProps) {
  const resource = getResourceDefinition(data.resourceType);
  const icon = resource?.icon || '💻';
  const color = resource?.color || '#3B82F6';

  return (
    <div
      className="px-4 py-3 shadow-md rounded-lg border-2 bg-white min-w-[160px]"
      style={{
        borderColor: selected ? color : '#E5E7EB',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2"
        style={{ background: color }}
      />

      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">
            {data.label || resource?.label}
          </div>
          <div className="text-xs text-gray-500">{resource?.type}</div>
        </div>
      </div>

      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2"
        style={{ background: color }}
      />
    </div>
  );
}

export default memo(ResourceNode);
