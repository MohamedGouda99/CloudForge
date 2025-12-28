import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Save,
  Download,
  Upload,
  PanelLeftClose,
  PanelLeft,
  Code,
  Map,
  CheckCircle,
  Play,
  Rocket,
  Trash2,
  Bot,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  Loader2,
  Circle,
  User,
  Home,
  ChevronRight,
  Key,
  Shield,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { CloudProvider } from '../lib/resources';
import CloudIcon from './CloudIcon';

interface DesignerToolbarProps {
  projectName: string;
  projectDescription?: string;
  provider: CloudProvider;
  hasUnsavedChanges?: boolean;
  isSaving: boolean;
  hasCredentials?: boolean;
  showCode?: boolean;
  showMinimap?: boolean;
  showAssistant?: boolean;
  terraformAction?: string | null;
  zoom?: number;
  onSave: () => void;
  onCredentials?: () => void;
  onExport: () => void;
  onImport: () => void;
  onDownload?: () => void;
  onToggleSidebar?: () => void;
  onToggleCode: () => void;
  onToggleMinimap: () => void;
  onToggleAssistant?: () => void;
  onValidate: () => void;
  onPlan: () => void;
  onApply: () => void;
  onDestroy: () => void;
  onTfsec?: () => void;
  onTerrascan?: () => void;
  onInfracost?: () => void;
  onOpenAssistant?: () => void;
  onOpenSettings?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  sidebarOpen?: boolean;
  codePanelOpen?: boolean;
  minimapOpen?: boolean;
  terraformLoading?: 'validate' | 'plan' | 'apply' | 'destroy' | null;
  userName?: string;
  onNavigateHome?: () => void;
}

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

function Tooltip({ content, shortcut, children, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), 400);
  }, []);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {visible && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1.5 text-xs font-medium
            bg-foreground text-background rounded-md shadow-lg whitespace-nowrap
            pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150
            ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}`}
        >
          <div className="flex items-center gap-2">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted-foreground/20 rounded">
                {shortcut}
              </kbd>
            )}
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45
              ${position === 'bottom' ? '-top-1' : '-bottom-1'}`}
          />
        </div>
      )}
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  onClick,
  active = false,
  loading = false,
  disabled = false,
  variant = 'default',
}: ToolbarButtonProps) {
  const variantStyles = {
    default: active
      ? 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/20'
      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 dark:text-green-400',
  };

  return (
    <Tooltip content={label} shortcut={shortcut}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm font-medium 
          transition-all border border-border/80 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${loading ? 'cursor-wait' : ''}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="h-4 w-4 flex items-center justify-center">{icon}</span>
        )}
      </button>
    </Tooltip>
  );
}

interface ToolbarDropdownProps {
  icon: React.ReactNode;
  label: string;
  items: {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    loading?: boolean;
  }[];
  loading?: boolean;
}

function ToolbarDropdown({ icon, label, items, loading }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip content={label}>
        <button
          onClick={() => setOpen(!open)}
          className={`h-8 px-2 inline-flex items-center gap-1 rounded-lg text-sm font-medium 
            transition-all border border-border/80 bg-secondary text-secondary-foreground 
            hover:bg-secondary/80 ${open ? 'bg-primary/15 border-primary/30' : ''}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="h-4 w-4 flex items-center justify-center">{icon}</span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] py-1 
          glass-panel rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              disabled={item.loading}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-sm text-left
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                ${item.variant === 'danger' 
                  ? 'text-destructive hover:bg-destructive/10' 
                  : 'text-foreground hover:bg-secondary/80'}`}
            >
              {item.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="h-4 w-4 flex items-center justify-center">{item.icon}</span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border/60 mx-1" />;
}

function ToolbarGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex items-center gap-1">
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1 hidden lg:inline">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

const providerColors: Record<CloudProvider, string> = {
  aws: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400',
  azure: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  gcp: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400',
};

const providerShortNames: Record<CloudProvider, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

export default function DesignerToolbar({
  projectName,
  provider,
  hasUnsavedChanges,
  isSaving,
  hasCredentials,
  onSave,
  onCredentials,
  onExport,
  onImport,
  onToggleSidebar,
  onToggleCode,
  onToggleMinimap,
  onValidate,
  onPlan,
  onApply,
  onDestroy,
  onTfsec,
  onTerrascan,
  onInfracost,
  onOpenAssistant,
  onOpenSettings,
  sidebarOpen,
  codePanelOpen,
  minimapOpen = true,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onFitView,
  terraformLoading = null,
  userName,
  onNavigateHome,
}: DesignerToolbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="glass-panel h-12 px-3 flex items-center justify-between gap-4 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        {onNavigateHome && (
          <Tooltip content="Back to Projects" position="bottom">
            <button
              onClick={onNavigateHome}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg
                text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Home className="h-4 w-4" />
            </button>
          </Tooltip>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <span className="hidden sm:inline">Projects</span>
            <ChevronRight className="h-3.5 w-3.5 hidden sm:inline" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-semibold text-foreground truncate max-w-[150px] lg:max-w-[200px]">
              {projectName}
            </h1>
            {hasUnsavedChanges && (
              <Tooltip content="Unsaved changes" position="bottom">
                <div className="flex items-center gap-1 text-amber-500">
                  <Circle className="h-2 w-2 fill-current" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5
            ${providerColors[provider]}`}
        >
          <CloudIcon icon={provider} size={14} />
          <span className="hidden sm:inline">{providerShortNames[provider]}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <ToolbarGroup>
          <ToolbarButton
            icon={<Save className="h-4 w-4" />}
            label="Save"
            shortcut="⌘S"
            onClick={onSave}
            loading={isSaving}
          />
          <ToolbarButton
            icon={<Download className="h-4 w-4" />}
            label="Export"
            shortcut="⌘E"
            onClick={onExport}
          />
          <ToolbarButton
            icon={<Upload className="h-4 w-4" />}
            label="Import"
            shortcut="⌘I"
            onClick={onImport}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            icon={sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            label={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            shortcut="⌘B"
            onClick={onToggleSidebar || (() => {})}
            active={sidebarOpen}
          />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            label={codePanelOpen ? 'Hide Code' : 'Show Code'}
            shortcut="⌘J"
            onClick={onToggleCode}
            active={codePanelOpen}
          />
          <ToolbarButton
            icon={<Map className="h-4 w-4" />}
            label={minimapOpen ? 'Hide Minimap' : 'Show Minimap'}
            shortcut="⌘M"
            onClick={onToggleMinimap}
            active={minimapOpen}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            icon={<CheckCircle className="h-4 w-4" />}
            label="Validate"
            shortcut="⌘⇧V"
            onClick={onValidate}
            loading={terraformLoading === 'validate'}
            variant="default"
          />
          <ToolbarButton
            icon={<Play className="h-4 w-4" />}
            label="Plan"
            shortcut="⌘⇧P"
            onClick={onPlan}
            loading={terraformLoading === 'plan'}
            variant="default"
          />
          <ToolbarDropdown
            icon={<Rocket className="h-4 w-4" />}
            label="Deploy Actions"
            loading={terraformLoading === 'apply' || terraformLoading === 'destroy'}
            items={[
              {
                icon: <Rocket className="h-4 w-4" />,
                label: 'Apply',
                shortcut: '⌘⇧A',
                onClick: onApply,
                loading: terraformLoading === 'apply',
              },
              {
                icon: <Trash2 className="h-4 w-4" />,
                label: 'Destroy',
                shortcut: '⌘⇧D',
                onClick: onDestroy,
                variant: 'danger',
                loading: terraformLoading === 'destroy',
              },
            ]}
          />
          <ToolbarDropdown
            icon={<Shield className="h-4 w-4" />}
            label="Security & Cost"
            items={[
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                label: 'Tfsec Scan',
                onClick: onTfsec || (() => {}),
              },
              {
                icon: <ShieldAlert className="h-4 w-4" />,
                label: 'Terrascan',
                onClick: onTerrascan || (() => {}),
              },
              {
                icon: <DollarSign className="h-4 w-4" />,
                label: 'Infracost',
                onClick: onInfracost || (() => {}),
              },
            ]}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <Tooltip content={hasCredentials ? "Credentials Configured" : "Set Credentials"}>
            <button
              onClick={onCredentials || (() => {})}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm font-medium
                transition-all border border-border/80
                ${hasCredentials
                  ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 dark:text-green-400'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 dark:text-amber-400'}`}
            >
              <Key className="h-4 w-4" />
            </button>
          </Tooltip>
          <ToolbarButton
            icon={<Bot className="h-4 w-4" />}
            label="AI Assistant"
            shortcut="⌘K"
            onClick={onOpenAssistant || (() => {})}
          />
          <ToolbarButton
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            shortcut="⌘,"
            onClick={onOpenSettings || (() => {})}
          />
        </ToolbarGroup>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
          <Tooltip content="Zoom Out" shortcut="⌘-">
            <button
              onClick={onZoomOut}
              disabled={!onZoomOut}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md
                text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <span className="text-xs font-medium text-muted-foreground min-w-[40px] text-center">
            {Math.round(zoom)}%
          </span>
          <Tooltip content="Zoom In" shortcut="⌘+">
            <button
              onClick={onZoomIn}
              disabled={!onZoomIn}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md
                text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Fit View" shortcut="⌘0">
            <button
              onClick={onFitView}
              disabled={!onFitView}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md
                text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>

        <ToolbarDivider />

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full
              bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <User className="h-4 w-4" />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 min-w-[160px] py-1 
              glass-panel rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
              {userName && (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
                    {userName}
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  onOpenSettings?.();
                  setUserMenuOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-left
                  text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
