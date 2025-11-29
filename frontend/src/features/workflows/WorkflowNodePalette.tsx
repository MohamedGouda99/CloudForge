import React, { useState } from 'react';
import { NodeType } from '../../lib/api/workflowClient';

interface WorkflowNodePaletteProps {
  nodeTypes: NodeType[];
  onAddNode: (nodeType: NodeType) => void;
}

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({ nodeTypes, onAddNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group node types by category
  const categories = ['all', ...new Set(nodeTypes.map((nt) => nt.category))];

  const filteredNodeTypes = nodeTypes.filter((nt) => {
    const matchesCategory = selectedCategory === 'all' || nt.category === selectedCategory;
    const matchesSearch =
      nt.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      terraform: 'text-green-400',
      security: 'text-amber-400',
      cost: 'text-blue-400',
      notification: 'text-purple-400',
      control: 'text-red-400',
      custom: 'text-gray-400',
    };
    return colors[category] || 'text-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      terraform: '🏗',
      security: '🛡',
      cost: '💲',
      notification: '📬',
      control: '🎛',
      custom: '⚙',
    };
    return icons[category] || '●';
  };

  return (
    <div className="w-80 bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold mb-2 text-gray-900">Node Library</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-900"
        />
      </div>

      {/* Category Filter */}
      <div className="p-2 border-b border-gray-200 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
        {filteredNodeTypes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No nodes found</div>
        ) : (
          <div className="space-y-2">
            {filteredNodeTypes.map((nodeType) => (
              <button
                key={nodeType.type_id}
                onClick={() => onAddNode(nodeType)}
                className="w-full text-left p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-400 rounded-lg transition-colors group shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`text-2xl ${getCategoryColor(nodeType.category)}`}>
                    {getCategoryIcon(nodeType.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                      {nodeType.display_name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {nodeType.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs font-medium ${getCategoryColor(nodeType.category)}`}
                      >
                        {nodeType.category}
                      </span>
                      {nodeType.docker_image && (
                        <span className="text-xs text-gray-500" title={nodeType.docker_image}>
                          🐳
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-600 bg-white">
        {filteredNodeTypes.length} of {nodeTypes.length} nodes
      </div>
    </div>
  );
};

export default WorkflowNodePalette;
