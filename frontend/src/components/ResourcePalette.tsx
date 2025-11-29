import { useState, useMemo, useCallback, useEffect } from 'react';
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

const PROVIDER_TABS: { id: CloudProvider; label: string; shortLabel: string }[] = [
  { id: 'aws', label: 'Amazon Web Services', shortLabel: 'AWS' },
  { id: 'azure', label: 'Microsoft Azure', shortLabel: 'Azure' },
  { id: 'gcp', label: 'Google Cloud Platform', shortLabel: 'GCP' },
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

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/json', JSON.stringify(resource));
      event.dataTransfer.setData('text/plain', resource.type);

      const ghost = event.currentTarget.cloneNode(true) as HTMLElement;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      ghost.style.opacity = '0.8';
      ghost.style.transform = 'scale(1.05)';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, 40, 20);
      setTimeout(() => document.body.removeChild(ghost), 0);

      onDragStart(event, resource.type, resource);
    },
    [resource, onDragStart]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab
                 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10
                 border border-transparent hover:border-border/50
                 transition-all duration-150 ease-out
                 hover:shadow-sm active:cursor-grabbing active:scale-[0.98]"
      title={resource.description}
    >
      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md
                      bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
                      border border-border/30 shadow-sm">
        <CloudIcon icon={icon} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {resource.label}
        </p>
        <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
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
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left
                   hover:bg-secondary/50 transition-colors duration-150"
      >
        <span className="text-muted-foreground transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="w-4 h-4" />
        </span>
        <span className="text-primary/80">{icon}</span>
        <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full
                         bg-primary/10 text-primary border border-primary/20">
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
}: ResourcePaletteProps) {
  const [internalProvider, setInternalProvider] = useState<CloudProvider>(provider);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['compute', 'storage', 'database']));

  const debouncedSearchTerm = useDebounce(searchTerm, 200);

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

  if (collapsed) {
    return (
      <div className="glass-panel w-12 h-full flex flex-col items-center py-3 rounded-xl">
        <button
          onClick={handleCollapseToggle}
          className="p-2 rounded-lg hover:bg-secondary/70 transition-colors"
          title="Expand palette"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex flex-col items-center gap-2 mt-4">
          {PROVIDER_TABS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setInternalProvider(p.id);
                if (onToggleCollapse) {
                  onToggleCollapse();
                } else {
                  onCollapsedChange?.(false);
                }
              }}
              className={`p-2 rounded-lg transition-all duration-150 ${
                internalProvider === p.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              }`}
              title={p.label}
            >
              <span className="text-xs font-bold">{p.shortLabel.charAt(0)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel w-72 h-full flex flex-col rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Resources</h2>
        <button
          onClick={handleCollapseToggle}
          className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
          title="Collapse palette"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex border-b border-border/50">
        {PROVIDER_TABS.map((p) => (
          <button
            key={p.id}
            onClick={() => setInternalProvider(p.id)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition-all duration-150 relative
                       ${internalProvider === p.id
                         ? 'text-primary'
                         : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                       }`}
          >
            <span className="relative z-10">{p.shortLabel}</span>
            {internalProvider === p.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg
                       bg-secondary/50 border border-border/50
                       placeholder:text-muted-foreground/60
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                       transition-all duration-150"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
                         hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {debouncedSearchTerm && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Circle className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No resources found</p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-2 text-xs text-primary hover:underline"
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
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-border/30 bg-secondary/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Drag resources to canvas
        </p>
      </div>
    </div>
  );
}

export type { CloudResource };
