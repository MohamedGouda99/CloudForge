import { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  Clock,
  TrendingUp,
  Filter,
  Layers,
} from 'lucide-react';
import CloudIcon from './CloudIcon';
import {
  getResourcesForProvider,
  getCategoriesForProvider,
  CloudProvider,
  CloudResource,
} from '../lib/resources';
import { resolveResourceIcon } from '../lib/resources/iconResolver';

interface EnhancedResourcePaletteProps {
  provider: CloudProvider;
  onDragStart?: (event: React.DragEvent, resourceType: string, resource: CloudResource) => void;
  onResourceClick?: (resource: CloudResource) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  database: 'Database',
  networking: 'Network',
  security: 'Security & Identity',
  analytics: 'Analytics',
  containers: 'Containers',
  application: 'Application Services',
  other: 'Other Services',
};

const CATEGORY_ICONS: Record<string, any> = {
  compute: '🖥️',
  storage: '💾',
  database: '🗄️',
  networking: '🌐',
  security: '🔒',
  analytics: '📊',
  containers: '📦',
  application: '⚡',
  other: '⚙️',
};

export default function EnhancedResourcePalette({
  provider,
  onDragStart,
  onResourceClick,
}: EnhancedResourcePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['compute', 'storage', 'database', 'networking'])
  );
  const [view, setView] = useState<'grid' | 'list'>('list');

  const resources = useMemo(() => getResourcesForProvider(provider), [provider]);
  const categories = useMemo(() => getCategoriesForProvider(provider), [provider]);

  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return resources;
    
    const search = searchTerm.toLowerCase();
    return resources.filter(
      (r) =>
        r.label.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search)
    );
  }, [resources, searchTerm]);

  const resourcesByCategory = useMemo(() => {
    const grouped: Record<string, CloudResource[]> = {};
    filteredResources.forEach((r) => {
      if (!grouped[r.category]) {
        grouped[r.category] = [];
      }
      grouped[r.category].push(r);
    });
    return grouped;
  }, [filteredResources]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDragStart = (event: React.DragEvent, resource: CloudResource) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(resource));
    event.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) {
      onDragStart(event, resource.type, resource);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Resources</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Star className="w-3 h-3" />
            Favorites
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Clock className="w-3 h-3" />
            Recent
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category);
            const categoryResources = resourcesByCategory[category] || [];
            
            if (categoryResources.length === 0) return null;

            return (
              <div key={category} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {categoryResources.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Category Resources */}
                {isExpanded && (
                  <div className="mt-1 space-y-1 pl-2">
                    {categoryResources.map((resource) => {
                      const icon = resolveResourceIcon(resource.type, resource.icon);
                      
                      return (
                        <div
                          key={resource.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, resource)}
                          onClick={() => onResourceClick?.(resource)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 
                                   rounded-lg cursor-move transition-all group border border-transparent 
                                   hover:border-red-200 dark:hover:border-red-800"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 
                                       rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform
                                       border border-gray-300 dark:border-gray-600">
                            <CloudIcon icon={icon} size={20} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400">
                              {resource.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {resource.type.split('_').slice(1).join('_')}
                            </p>
                          </div>

                          <TrendingUp className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p className="font-semibold mb-1">Drag resources to canvas</p>
          <p>Double-click to configure</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1">
          <img src="/vodafone.png" alt="Vodafone" className="h-3 w-auto opacity-60" />
          <span className="text-xs text-gray-400">Enterprise Edition</span>
        </div>
      </div>
    </div>
  );
}

