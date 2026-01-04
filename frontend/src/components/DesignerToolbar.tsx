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
  ChevronLeft,
  Key,
  Shield,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Undo2,
  Redo2,
  Grid3X3,
  Camera,
  FileDown,
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
  variant?: 'default' | 'danger' | 'success' | 'info';
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
      ? 'bg-primary/20 text-primary border-primary/40 shadow-lg shadow-primary/20 scale-105'
      : 'bg-secondary/80 text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 hover:scale-105',
    danger: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 hover:shadow-md hover:shadow-destructive/20 hover:scale-105',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/20 hover:scale-105 dark:text-emerald-400',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 hover:shadow-md hover:shadow-blue-500/20 hover:scale-105 dark:text-blue-400',
  };

  return (
    <Tooltip content={label} shortcut={shortcut}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`h-9 w-9 inline-flex items-center justify-center rounded-xl text-sm font-medium
          transition-all duration-200 ease-out border border-border/60 backdrop-blur-sm
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          active:scale-95
          ${variantStyles[variant]}
          ${loading ? 'cursor-wait animate-pulse' : ''}`}
      >
        {loading ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : (
          <span className="h-4.5 w-4.5 flex items-center justify-center transition-transform duration-200">{icon}</span>
        )}
      </button>
    </Tooltip>
  );
}

// New: Labeled Action Button for prominent actions
interface LabeledActionButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant: 'validate' | 'plan' | 'apply' | 'destroy' | 'security' | 'cost';
}

function LabeledActionButton({
  icon,
  label,
  shortcut,
  onClick,
  loading = false,
  disabled = false,
  variant,
}: LabeledActionButtonProps) {
  const variantStyles = {
    validate: {
      base: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      hover: 'hover:from-blue-500/25 hover:to-cyan-500/25 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20',
      glow: 'group-hover:bg-blue-400',
    },
    plan: {
      base: 'bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
      hover: 'hover:from-violet-500/25 hover:to-purple-500/25 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20',
      glow: 'group-hover:bg-violet-400',
    },
    apply: {
      base: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      hover: 'hover:from-emerald-500/25 hover:to-teal-500/25 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20',
      glow: 'group-hover:bg-emerald-400',
    },
    destroy: {
      base: 'bg-gradient-to-r from-red-500/15 to-orange-500/15 text-red-600 dark:text-red-400 border-red-500/30',
      hover: 'hover:from-red-500/25 hover:to-orange-500/25 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20',
      glow: 'group-hover:bg-red-400',
    },
    security: {
      base: 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      hover: 'hover:from-amber-500/25 hover:to-orange-500/25 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20',
      glow: 'group-hover:bg-amber-400',
    },
    cost: {
      base: 'bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-600 dark:text-green-400 border-green-500/30',
      hover: 'hover:from-green-500/25 hover:to-emerald-500/25 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20',
      glow: 'group-hover:bg-green-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <Tooltip content={`${label}${shortcut ? ` (${shortcut})` : ''}`}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`group relative h-9 px-3.5 inline-flex items-center gap-2 rounded-xl text-sm font-semibold
          transition-all duration-300 ease-out border backdrop-blur-sm
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          active:scale-95 hover:scale-105
          ${style.base} ${style.hover}
          ${loading ? 'cursor-wait' : ''}`}
      >
        {/* Animated glow effect */}
        <span className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 ${style.glow}`} />

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="h-4 w-4 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        <span className="relative font-medium">{label}</span>
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
    description?: string;
    shortcut?: string;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'success' | 'warning';
    loading?: boolean;
  }[];
  loading?: boolean;
  variant?: 'default' | 'security' | 'cost';
}

function ToolbarDropdown({ icon, label, items, loading, variant = 'default' }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const variantStyles = {
    default: 'bg-secondary/80 text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30',
    security: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
    cost: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50',
  };

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
          className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-sm font-medium
            transition-all duration-200 ease-out border border-border/60 backdrop-blur-sm
            hover:shadow-md hover:scale-105 active:scale-95
            ${variantStyles[variant]}
            ${open ? 'shadow-lg scale-105' : ''}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="h-4 w-4 flex items-center justify-center">{icon}</span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[240px] py-2
          bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50
          animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-200">
          {items.map((item, index) => {
            const itemVariantStyles = {
              default: 'text-foreground hover:bg-primary/10 hover:text-primary',
              danger: 'text-red-600 dark:text-red-400 hover:bg-red-500/10',
              success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
              warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10',
            };
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                disabled={item.loading}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left
                  transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                  hover:pl-5 ${itemVariantStyles[item.variant || 'default']}`}
              >
                {item.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 flex items-center justify-center flex-shrink-0 transition-transform">
                    {item.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium block">{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-muted-foreground block">{item.description}</span>
                  )}
                </div>
                {item.shortcut && (
                  <kbd className="px-2 py-1 text-[10px] font-mono bg-muted/50 rounded-md text-muted-foreground border border-border/50 flex-shrink-0">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-7 bg-gradient-to-b from-transparent via-border/60 to-transparent mx-2" />;
}

function ToolbarGroup({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold mr-1 hidden xl:inline">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

const providerColors: Record<CloudProvider, string> = {
  aws: 'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 border-orange-500/40 dark:text-orange-400',
  azure: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-600 border-blue-500/40 dark:text-blue-400',
  gcp: 'bg-gradient-to-r from-red-500/15 to-yellow-500/15 text-red-600 border-red-500/40 dark:text-red-400',
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
  const [terraformExpanded, setTerraformExpanded] = useState(false);
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
    <div className="glass-panel h-14 px-4 flex items-center justify-between gap-4 rounded-xl border border-border/40 shadow-lg">
      {/* Left Section: Navigation & Project Info */}
      <div className="flex items-center gap-3 min-w-0">
        {onNavigateHome && (
          <Tooltip content="Back to Projects" position="bottom">
            <button
              onClick={onNavigateHome}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl
                text-muted-foreground hover:text-foreground hover:bg-secondary/80
                border border-transparent hover:border-border/40
                transition-all duration-200 hover:scale-105 active:scale-95"
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
            <h1 className="font-bold text-foreground truncate max-w-[120px] lg:max-w-[180px]">
              {projectName}
            </h1>
            {hasUnsavedChanges && (
              <Tooltip content="Unsaved changes" position="bottom">
                <div className="flex items-center gap-1 text-amber-500">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2
            transition-all duration-200 hover:scale-105
            ${providerColors[provider]}`}
        >
          <CloudIcon icon={provider} size={14} />
          <span className="hidden sm:inline">{providerShortNames[provider]}</span>
        </div>
      </div>

      {/* Center Section: Canvas Tools */}
      <div className="flex items-center gap-1.5">
        {/* Selection/Move Tool */}
        <Tooltip content="Select">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </button>
        </Tooltip>

        {/* Zoom Controls */}
        <Tooltip content="Zoom In">
          <button
            onClick={onZoomIn}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Zoom Out">
          <button
            onClick={onZoomOut}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Fit View">
          <button
            onClick={onFitView}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Undo/Redo */}
        <Tooltip content="Undo">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150">
            <Undo2 className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip content="Redo">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150">
            <Redo2 className="h-4 w-4" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Grid/Snap */}
        <Tooltip content="Toggle Grid">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150">
            <Grid3X3 className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Export/Screenshot */}
        <Tooltip content="Export Image">
          <button
            onClick={onExport}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
          >
            <Camera className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Download */}
        <Tooltip content="Download Terraform">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150">
            <FileDown className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {/* Right Section: Collapsible Terraform Actions + Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Display */}
        <div className="bg-secondary/60 rounded-lg px-2.5 py-1.5 border border-border/40">
          <span className="text-xs font-semibold text-foreground tabular-nums">{Math.round(zoom)}%</span>
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Collapsible Terraform Actions */}
        <div className="flex items-center">
          {/* Animated Action Buttons Container */}
          <div
            className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${
              terraformExpanded ? 'max-w-[400px] opacity-100 mr-2' : 'max-w-0 opacity-0'
            }`}
          >
            {/* Plan Button */}
            <button
              onClick={onPlan}
              disabled={terraformLoading === 'plan'}
              className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                whitespace-nowrap transition-all duration-200 transform
                ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                bg-[#714EFF] text-white hover:bg-[#5f3ee6] shadow-md shadow-[#714EFF]/25
                disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ transitionDelay: terraformExpanded ? '50ms' : '0ms' }}
            >
              {terraformLoading === 'plan' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Plan
            </button>

            {/* Validate Button */}
            <button
              onClick={onValidate}
              disabled={terraformLoading === 'validate'}
              className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                whitespace-nowrap transition-all duration-200 transform
                ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm
                dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ transitionDelay: terraformExpanded ? '100ms' : '0ms' }}
            >
              {terraformLoading === 'validate' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Validate
            </button>

            {/* Apply Button */}
            <button
              onClick={onApply}
              disabled={terraformLoading === 'apply'}
              className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                whitespace-nowrap transition-all duration-200 transform
                ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                bg-[#714EFF] text-white hover:bg-[#5f3ee6] shadow-md shadow-[#714EFF]/25
                disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ transitionDelay: terraformExpanded ? '150ms' : '0ms' }}
            >
              {terraformLoading === 'apply' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Rocket className="h-3.5 w-3.5" />
              )}
              Apply
            </button>

            {/* Destroy Button */}
            <button
              onClick={onDestroy}
              disabled={terraformLoading === 'destroy'}
              className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                whitespace-nowrap transition-all duration-200 transform
                ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md shadow-red-500/25
                disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ transitionDelay: terraformExpanded ? '200ms' : '0ms' }}
            >
              {terraformLoading === 'destroy' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Destroy
            </button>
          </div>

          {/* Toggle Arrow Button */}
          <Tooltip content={terraformExpanded ? "Hide Actions" : "Terraform Actions"}>
            <button
              onClick={() => setTerraformExpanded(!terraformExpanded)}
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl
                transition-all duration-300 ease-out
                ${terraformExpanded
                  ? 'bg-[#714EFF] text-white shadow-lg shadow-[#714EFF]/30 rotate-180'
                  : 'bg-[#714EFF] text-white shadow-md shadow-[#714EFF]/25 hover:shadow-lg hover:shadow-[#714EFF]/30'
                }
                hover:scale-105 active:scale-95`}
            >
              <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
            </button>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Credentials */}
        <Tooltip content={hasCredentials ? "Credentials Configured" : "Set Cloud Credentials"}>
          <button
            onClick={onCredentials || (() => {})}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl
              transition-all duration-200 hover:scale-105 active:scale-95
              ${hasCredentials
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/40 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 border border-amber-500/40 dark:text-amber-400 animate-pulse'}`}
          >
            <Key className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* AI Assistant */}
        <Tooltip content="AI Assistant">
          <button
            onClick={onOpenAssistant || (() => {})}
            className="h-9 px-3 inline-flex items-center gap-2 rounded-xl text-sm font-medium
              transition-all duration-200 hover:scale-105 active:scale-95
              bg-gradient-to-r from-red-500/15 to-red-600/15 text-red-600 border border-red-500/40
              hover:from-red-500/25 hover:to-red-600/25 hover:shadow-lg hover:shadow-red-500/20
              dark:text-red-400"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden lg:inline font-medium">AI</span>
          </button>
        </Tooltip>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl
              bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/40
              hover:from-primary/30 hover:to-primary/20 hover:shadow-lg hover:shadow-primary/20 hover:scale-105
              active:scale-95 transition-all duration-200
              ${userMenuOpen ? 'from-primary/30 to-primary/20 shadow-lg shadow-primary/20 scale-105' : ''}`}
          >
            <User className="h-4 w-4" />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 min-w-[180px] py-2
              bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50
              animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-200">
              {userName && (
                <div className="px-4 py-2.5 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground">{userName}</p>
                  <p className="text-[10px] text-muted-foreground">Logged in</p>
                </div>
              )}
              <button
                onClick={() => {
                  onOpenSettings?.();
                  setUserMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left
                  text-foreground hover:bg-primary/10 hover:text-primary hover:pl-5 transition-all duration-150"
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
