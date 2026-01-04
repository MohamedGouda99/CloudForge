import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Cpu,
  HardDrive,
  Database,
  Network,
  Shield,
  BarChart3,
  Boxes,
  AppWindow,
  Circle,
} from 'lucide-react';

// Constants for panel sizing
const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;
const DEFAULT_PANEL_WIDTH = 288;
import CloudIcon from './CloudIcon';
import {
  getResourcesForProvider,
  getCategoriesForProvider,
  CloudProvider,
  CloudResource,
} from '../lib/resources';
import { resolveResourceIcon } from '../lib/resources/iconResolver';

export interface ResourcePaletteProps {
  provider: CloudProvider;
  onDragStart?: (event: React.DragEvent, resourceType: string, resource: CloudResource) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onToggleCollapse?: () => void;
  onResourceClick?: (resource: CloudResource) => void;
  // New props for resizable and animated panel
  panelWidth?: number;
  onWidthChange?: (width: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  compute: <Cpu className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  networking: <Network className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  containers: <Boxes className="w-4 h-4" />,
  application: <AppWindow className="w-4 h-4" />,
  other: <Circle className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  database: 'Database',
  networking: 'Network',
  security: 'Security',
  analytics: 'Analytics',
  containers: 'Containers',
  application: 'Application',
  other: 'Other',
};

// Provider icons with local PNG files
const PROVIDER_ICONS: { id: CloudProvider; label: string; icon: string }[] = [
  { id: 'aws', label: 'AWS', icon: '/cloud_icons/AWS/aws.png' },
  { id: 'azure', label: 'Azure', icon: '/cloud_icons/Azure/azure.png' },
  { id: 'gcp', label: 'GCP', icon: '/cloud_icons/GCP/gcp.png' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface ResourceItemProps {
  resource: CloudResource;
  onDragStart: (event: React.DragEvent, resourceType: string, resource: CloudResource) => void;
}

function ResourceItem({ resource, onDragStart }: ResourceItemProps) {
  const icon = resolveResourceIcon(resource.type, resource.icon);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      setIsDragging(true);
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/json', JSON.stringify(resource));
      event.dataTransfer.setData('text/plain', resource.type);
      onDragStart(event, resource.type, resource);
    },
    [resource, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab
                 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10
                 border border-transparent hover:border-border/50
                 transition-all duration-150 ease-out
                 hover:shadow-sm active:cursor-grabbing active:scale-[0.98]
                 ${isDragging ? 'opacity-50 border-primary/50' : ''}`}
      title={resource.description}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                      bg-white dark:bg-white
                      border border-gray-200 dark:border-gray-600 shadow-sm">
        <CloudIcon icon={icon} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight">
          {resource.label}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate mt-0.5">
          {resource.type}
        </p>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100
                      transition-opacity duration-150"
           style={{
             background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, transparent 100%)',
           }}
      />
    </div>
  );
}

interface CategoryAccordionProps {
  category: string;
  resources: CloudResource[];
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart: (event: React.DragEvent, resourceType: string, resource: CloudResource) => void;
}

function CategoryAccordion({
  category,
  resources,
  isExpanded,
  onToggle,
  onDragStart,
}: CategoryAccordionProps) {
  const icon = CATEGORY_ICONS[category] || <Circle className="w-4 h-4" />;
  const label = CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
      >
        <span className="text-gray-400 dark:text-gray-500 transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="w-4 h-4" />
        </span>
        <span className="text-red-600 dark:text-red-400">{icon}</span>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full
                         bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          {resources.length}
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          maxHeight: isExpanded ? `${resources.length * 56 + 12}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-2 pb-2 space-y-1">
          {resources.map((resource) => (
            <ResourceItem
              key={resource.type}
              resource={resource}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResourcePalette({
  provider,
  onDragStart,
  collapsed = false,
  onCollapsedChange,
  onToggleCollapse,
  onResourceClick,
  panelWidth = DEFAULT_PANEL_WIDTH,
  onWidthChange,
}: ResourcePaletteProps) {
  const [internalProvider, setInternalProvider] = useState<CloudProvider>(provider);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['compute', 'storage', 'database']));
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!onWidthChange) return;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newWidth = e.clientX;
        const clampedWidth = Math.min(Math.max(newWidth, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
        onWidthChange(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafId);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  useEffect(() => {
    setInternalProvider(provider);
  }, [provider]);

  const resources = useMemo(() => {
    return getResourcesForProvider(internalProvider);
  }, [internalProvider]);

  const categories = useMemo(() => {
    return getCategoriesForProvider(internalProvider);
  }, [internalProvider]);

  const filteredResources = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return resources;
    }
    const search = debouncedSearchTerm.toLowerCase();
    return resources.filter(
      (r) =>
        r.label.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search)
    );
  }, [resources, debouncedSearchTerm]);

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

  const sortedCategories = useMemo(() => {
    const order = ['compute', 'storage', 'database', 'networking', 'security', 'analytics', 'containers', 'application', 'other'];
    return categories
      .filter((cat) => resourcesByCategory[cat]?.length > 0)
      .sort((a, b) => {
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
  }, [categories, resourcesByCategory]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleCollapseToggle = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      onCollapsedChange?.(!collapsed);
    }
  }, [collapsed, onCollapsedChange, onToggleCollapse]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Calculate current width based on collapsed state
  const currentWidth = collapsed ? 0 : panelWidth;

  return (
    <div className="h-full relative flex" ref={panelRef}>
      {/* Main Panel with animated width */}
      <div
        className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden"
        style={{
          width: currentWidth,
          minWidth: collapsed ? 0 : MIN_PANEL_WIDTH,
          transition: isResizing ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
      {/* Header with Terraform version */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Resources</h2>
        <button
          onClick={handleCollapseToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Collapse palette"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Terraform version selector */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Terraform</span>
        <select className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500/30">
          <option>5.52.0</option>
          <option>5.51.0</option>
          <option>5.50.0</option>
          <option>4.x</option>
        </select>
      </div>

      {/* Quick add buttons */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          <button className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            variable
          </button>
          <button className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            local
          </button>
          <button className="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            output
          </button>
        </div>
      </div>

      {/* Modules section */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-900 dark:text-white">Modules</span>
        </div>
        <div className="flex gap-1">
          <button className="flex-1 px-2 py-1.5 text-xs rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            + Import
          </button>
          <button className="flex-1 px-2 py-1.5 text-xs rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            📦 Catalog
          </button>
        </div>
      </div>

      {/* Provider icon tiles */}
      <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 gap-2">
          {PROVIDER_ICONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setInternalProvider(p.id)}
              className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                         ${internalProvider === p.id
                           ? 'border-purple-500 bg-white dark:bg-white'
                           : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-white'
                         }`}
              title={p.label}
            >
              <img
                src={p.icon}
                alt={p.label}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className={`mt-1 text-xs font-medium ${internalProvider === p.id ? 'text-purple-700 dark:text-purple-700' : 'text-gray-600 dark:text-gray-600'}`}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg
                       bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       text-gray-900 dark:text-white
                       placeholder:text-gray-400 dark:placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50
                       transition-all duration-150"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        {debouncedSearchTerm && (
          <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {sortedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Circle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No resources found</p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          sortedCategories.map((category) => (
            <CategoryAccordion
              key={category}
              category={category}
              resources={resourcesByCategory[category]}
              isExpanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
              onDragStart={onDragStart || (() => {})}
            />
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
          Drag resources to canvas
        </p>
      </div>
      </div>
      {/* End of Main Panel */}

      {/* Toggle Arrow Button - Floating on right edge */}
      <button
        onClick={handleCollapseToggle}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-5 h-10
                   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   rounded-r-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700
                   flex items-center justify-center transition-colors"
        title={collapsed ? 'Expand palette' : 'Collapse palette'}
      >
        <ChevronRight
          className="w-4 h-4 text-gray-500"
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>

      {/* Resize Handle - Only visible when not collapsed */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 -right-1 w-2 h-full cursor-ew-resize z-20
                     hover:bg-primary/20 active:bg-primary/30 transition-colors"
          style={{
            opacity: isResizing ? 1 : 0,
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={(e) => { if (!isResizing) (e.target as HTMLElement).style.opacity = '0'; }}
        />
      )}
    </div>
  );
}

export type { CloudResource };
