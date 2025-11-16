import { useMemo, useState } from 'react';
import { NodeType } from '../../lib/api/workflowClient';
import { getToolIcon } from './iconAssets';
import { getNodeColor, getNodeIcon } from './nodeVisuals';
import { Search, X } from 'lucide-react';

interface TaskPaletteDrawerProps {
  open: boolean;
  nodeTypes: NodeType[];
  onClose: () => void;
  onSelect: (nodeType: NodeType) => void;
}

const TaskPaletteDrawer = ({ open, nodeTypes, onClose, onSelect }: TaskPaletteDrawerProps) => {
  const [query, setQuery] = useState('');

  const groupedNodeTypes = useMemo(() => {
    const filtered = nodeTypes.filter((node) => {
      if (!query) return true;
      const normalized = query.toLowerCase();
      return (
        node.display_name.toLowerCase().includes(normalized) ||
        node.description?.toLowerCase().includes(normalized) ||
        node.category?.toLowerCase().includes(normalized)
      );
    });

    const grouping = new Map<string, NodeType[]>();
    filtered.forEach((node) => {
      const key = node.category || 'Other';
      if (!grouping.has(key)) {
        grouping.set(key, []);
      }
      grouping.get(key)!.push(node);
    });
    return grouping;
  }, [nodeTypes, query]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-purple-100 shadow-2xl z-40 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-purple-50">
        <div>
          <p className="text-xs uppercase tracking-wider text-purple-500 font-semibold">Task palette</p>
          <p className="text-sm text-gray-500">Choose the next step of your pipeline</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition"
          aria-label="Close task drawer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-4 border-b border-purple-50">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm text-gray-800"
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-150px)] px-6 pb-6 pt-4 space-y-6">
        {groupedNodeTypes.size === 0 && (
          <div className="text-sm text-gray-500 bg-purple-50 rounded-xl px-4 py-3">
            No tasks match “{query}”. Try a different name.
          </div>
        )}

        {[...groupedNodeTypes.entries()].map(([category, tasks]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{category}</p>
              <span className="text-xs text-gray-400">{tasks.length} option{tasks.length > 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {tasks.map((task) => {
                const color = getNodeColor(task.type_id);
                const icon = getNodeIcon(task.type_id);
                const iconImage = getToolIcon(task.type_id);
                return (
                  <button
                    key={task.type_id}
                    onClick={() => onSelect(task)}
                    className="text-left rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition bg-white p-3 flex flex-col gap-2"
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {iconImage ? (
                        <img src={iconImage} alt={task.display_name} className="w-8 h-8 object-contain" />
                      ) : (
                        icon
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{task.display_name}</p>
                      {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPaletteDrawer;
