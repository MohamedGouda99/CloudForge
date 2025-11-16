import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { getToolIcon } from './iconAssets';
import { getNodeColor, getNodeIcon } from './nodeVisuals';
import { ConnectionDirection } from './types';

type NodeData = {
  label: string;
  nodeType: string;
  config?: Record<string, any>;
  onRequestAddTask?: (direction?: ConnectionDirection) => void;
  onRequestConfigure?: () => void;
  onRequestDelete?: () => void;
};

const connectorConfig: Record<
  ConnectionDirection,
  {
    buttonClass: string;
    sourcePosition: Position;
    targetPosition: Position;
    sourceOffset?: string;
    targetOffset?: string;
  }
> = {
  top: {
    buttonClass: '-top-5 left-1/2 -translate-x-1/2',
    sourcePosition: Position.Top,
    targetPosition: Position.Top,
  },
  right: {
    buttonClass: 'top-1/2 -translate-y-1/2 -right-5',
    sourcePosition: Position.Right,
    targetPosition: Position.Right,
  },
  bottom: {
    buttonClass: 'left-1/2 -bottom-5 -translate-x-1/2',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Bottom,
  },
  left: {
    buttonClass: 'top-1/2 -translate-y-1/2 -left-5',
    sourcePosition: Position.Left,
    targetPosition: Position.Left,
  },
};

const CustomWorkflowNode: React.FC<NodeProps<NodeData>> = ({ id, data, selected }) => {
  const icon = getNodeIcon(data.nodeType);
  const iconImage = getToolIcon(data.nodeType);
  const accent = getNodeColor(data.nodeType);
  const configKeys = Object.keys(data.config ?? {});
  const hasConfig = configKeys.length > 0;

  const handleAdd = (event: React.MouseEvent, direction: ConnectionDirection) => {
    event.stopPropagation();
    data.onRequestAddTask?.(direction);
  };

  return (
    <div className="relative">
      {Object.entries(connectorConfig).map(([direction, config]) => (
        <React.Fragment key={`${id}-${direction}`}>
          <Handle
            id={`target-${direction}`}
            type="target"
            position={config.targetPosition}
            className="w-3 h-3 !bg-purple-500 border-2 border-white"
          />
          <Handle
            id={`source-${direction}`}
            type="source"
            position={config.sourcePosition}
            className="w-3 h-3 !bg-purple-500 border-2 border-white"
          />
          <button
            onClick={(event) => handleAdd(event, direction as ConnectionDirection)}
            className={`absolute ${config.buttonClass} bg-white border-2 border-purple-200 text-purple-600 rounded-full p-1.5 shadow hover:bg-purple-600 hover:text-white transition`}
            title="Add next task"
          >
            <Plus size={14} />
          </button>
        </React.Fragment>
      ))}

      <div
        className={`px-5 py-4 rounded-2xl border-2 bg-white shadow ${
          selected ? 'border-purple-500' : 'border-transparent'
        } min-w-[240px]`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl overflow-hidden" style={{ backgroundColor: `${accent}22`, color: accent }}>
            {iconImage ? <img src={iconImage} alt={data.nodeType} className="w-10 h-10 object-contain" /> : icon}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-semibold text-gray-900 truncate">{data.label}</div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{data.nodeType}</div>
          </div>
        </div>

        {hasConfig && (
          <div className="mt-3 text-xs text-gray-500 bg-purple-50 rounded-lg px-3 py-2">
            {configKeys.length} configuration field
            {configKeys.length > 1 ? 's' : ''}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-4 text-gray-500">
          <button
            onClick={(event) => {
              event.stopPropagation();
              data.onRequestDelete?.();
            }}
            className="p-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              data.onRequestConfigure?.();
            }}
            className="p-1.5 rounded-full hover:bg-purple-50 hover:text-purple-600 transition"
            title="Configure task"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomWorkflowNode;
