import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { useThemeStore } from '../../lib/store/themeStore';
import apiClient from '../../lib/api/client';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { toast } from '../../components/Toast';
import { resolveResourceIcon } from '../../lib/resources/iconResolver';
import {
  Plus,
  Folder,
  Cloud,
  DollarSign,
  Users,
  Search,
  BarChart3,
  Download,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Copy,
  Share2,
  Trash2,
  ExternalLink,
  Activity,
  Server,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Cpu,
  GitBranch,
  Bell,
  Settings,
  HelpCircle,
  Calendar,
  Target,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';

interface DiagramNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: {
    resourceType?: string;
    icon?: string;
    label?: string;
  };
}

interface Project {
  id: number;
  name: string;
  cloud_provider: 'aws' | 'azure' | 'gcp';
  description: string;
  created_at: string;
  updated_at: string;
  resource_count?: number;
  status?: 'active' | 'archived' | 'draft';
  diagram_data?: {
    nodes?: DiagramNode[];
    edges?: any[];
    thumbnail?: string; // Base64 PNG image of the canvas
  };
}

interface DashboardStats {
  total_projects: number;
  total_resources: number;
  total_cost: number;
  currency: string;
  team_members: number;
}

// Technical colors
const colors = {
  primary: '#0EA5E9',
  secondary: '#06B6D4',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  vodafone: '#E60000',
};

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, ref };
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  accentColor,
  prefix = '',
  suffix = '',
  loading = false,
}: {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down';
  icon: any;
  accentColor: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const { count, ref } = useAnimatedCounter(numericValue);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-300 group shadow-sm dark:shadow-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 20px 40px -20px ${accentColor}20` : '',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-300"
        style={{
          background: isHovered
            ? `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
            : 'transparent',
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              trend === 'up'
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-gray-500 dark:text-slate-400 text-sm">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}
            {typeof value === 'number' ? count.toLocaleString() : value}
            {suffix}
          </p>
        )}
      </div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({
  icon: Icon,
  title,
  description,
  onClick,
  accentColor,
  isPrimary = false,
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  accentColor: string;
  isPrimary?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left w-full group overflow-hidden ${
        isPrimary
          ? 'bg-gradient-to-r from-red-50 dark:from-red-600/20 to-red-100/50 dark:to-red-500/10 border-2 border-dashed border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/50'
          : 'bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
      style={{
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Shimmer effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent transition-transform duration-700 ${
          isHovered ? 'translate-x-full' : '-translate-x-full'
        }`}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{
          background: isPrimary ? colors.vodafone : `${accentColor}15`,
          border: isPrimary ? 'none' : `1px solid ${accentColor}30`,
        }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: isPrimary ? 'white' : accentColor }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-white/90 transition-colors">
          {title}
        </div>
        <div className="text-sm text-gray-500 dark:text-slate-400 truncate">{description}</div>
      </div>
      <ChevronRight
        className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-all duration-300 ${
          isHovered ? 'translate-x-1 text-gray-600 dark:text-slate-300' : ''
        }`}
      />
    </button>
  );
};

// Mini Architecture Thumbnail Component
const ArchitectureThumbnail = ({ nodes, provider }: { nodes?: DiagramNode[]; provider: string }) => {
  if (!nodes || nodes.length === 0) {
    // Empty state - show placeholder
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
        <div className="text-center">
          <Layers className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 dark:text-slate-500">No resources yet</span>
        </div>
      </div>
    );
  }

  // Filter out container types for resource count
  const containerTypes = ['vpc', 'subnet', 'region', 'availability_zone', 'container'];
  const resourceNodes = nodes.filter(n => !containerTypes.includes(n.type || ''));

  // Calculate bounds to scale nodes into thumbnail
  const minX = Math.min(...nodes.map(n => n.position.x));
  const maxX = Math.max(...nodes.map(n => n.position.x));
  const minY = Math.min(...nodes.map(n => n.position.y));
  const maxY = Math.max(...nodes.map(n => n.position.y));
  const width = maxX - minX + 150;
  const height = maxY - minY + 150;
  const scale = Math.min(200 / width, 100 / height, 0.3);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50 overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />
      {/* Render mini nodes */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ padding: '12px' }}
      >
        <div className="relative" style={{ width: width * scale, height: height * scale }}>
          {nodes.slice(0, 15).map((node, idx) => {
            const x = (node.position.x - minX) * scale;
            const y = (node.position.y - minY) * scale;
            const resourceType = node.data?.resourceType || node.type || '';
            const iconHint = node.data?.icon;
            const isContainer = containerTypes.includes(node.type || '');

            // Resolve the icon using the resourceType
            const resolvedIcon = !isContainer ? resolveResourceIcon(resourceType, iconHint) : '';

            return (
              <div
                key={node.id || idx}
                className={`absolute ${isContainer ? 'rounded border border-dashed' : 'rounded-md shadow-sm bg-white dark:bg-slate-700'}`}
                style={{
                  left: x,
                  top: y,
                  width: isContainer ? 50 * scale : 28,
                  height: isContainer ? 40 * scale : 28,
                  backgroundColor: isContainer ? 'rgba(59, 130, 246, 0.08)' : undefined,
                  borderColor: isContainer ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0,0,0,0.1)',
                  borderWidth: isContainer ? 1 : 1,
                }}
              >
                {!isContainer && resolvedIcon && (
                  <img
                    src={resolvedIcon}
                    alt=""
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Node count badge */}
      {resourceNodes.length > 0 && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 dark:bg-slate-800/90 rounded text-[10px] font-medium text-gray-600 dark:text-slate-300 shadow-sm border border-gray-200 dark:border-slate-700">
          {resourceNodes.length} resource{resourceNodes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({
  project,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  onShare,
}: {
  project: Project;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onExport: (id: number) => void;
  onShare: (id: number) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const providerConfig = {
    aws: {
      color: '#FF9900',
      bg: 'bg-white dark:bg-white',
      border: 'border-orange-200 dark:border-orange-300',
      logo: '/cloud_logos/aws.png',
      name: 'AWS',
    },
    azure: {
      color: '#0078D4',
      bg: 'bg-white dark:bg-white',
      border: 'border-blue-200 dark:border-blue-300',
      logo: '/cloud_logos/azure.png',
      name: 'Azure',
    },
    gcp: {
      color: '#4285F4',
      bg: 'bg-white dark:bg-white',
      border: 'border-sky-200 dark:border-sky-300',
      logo: '/cloud_logos/gcp.png',
      name: 'GCP',
    },
  };

  const config = providerConfig[project.cloud_provider] || providerConfig.aws;
  const timeAgo = getTimeAgo(project.updated_at);
  const nodes = project.diagram_data?.nodes || [];
  const thumbnail = project.diagram_data?.thumbnail;

  return (
    <div
      className="relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-300 group overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg cursor-pointer"
      onClick={() => onOpen(project.id)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Thumbnail Preview Area */}
      <div className="relative h-32 border-b border-gray-200 dark:border-slate-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${project.name} architecture preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <ArchitectureThumbnail nodes={nodes} provider={project.cloud_provider} />
        )}

        {/* Menu button - absolute positioned in thumbnail area */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white shadow-sm"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(project.id);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Designer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExport(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <div className="border-t border-gray-200 dark:border-slate-700 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Provider badge - absolute positioned in thumbnail area */}
        <div className="absolute bottom-2 left-2">
          <div className={`${config.bg} ${config.border} border rounded px-1.5 py-0.5 flex items-center gap-1 shadow-sm`}>
            <img
              src={config.logo}
              alt={config.name}
              className="h-3.5 w-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-[10px] font-medium" style={{ color: config.color }}>
              {config.name}
            </span>
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Project info */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 mb-3">
          {project.description || 'No description'}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({
  icon: Icon,
  title,
  description,
  time,
  type,
}: {
  icon: any;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}) => {
  const typeConfig = {
    success: { color: colors.success, bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    info: { color: colors.primary, bg: 'bg-sky-100 dark:bg-sky-500/10' },
    warning: { color: colors.warning, bg: 'bg-amber-100 dark:bg-amber-500/10' },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div
        className={`${config.bg} p-2 rounded-lg flex-shrink-0`}
        style={{ border: `1px solid ${config.color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{time}</span>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>
        {value}%
      </span>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
        }}
      />
    </div>
  </div>
);

// Settings Modal Component
const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    security: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Appearance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Toggle dark theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDarkMode ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push alerts' },
                { key: 'updates', label: 'Product Updates', desc: 'New features and improvements' },
                { key: 'security', label: 'Security Alerts', desc: 'Critical security notifications' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-cyan-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Account
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Settings</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Update your profile information</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Update your password</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">API Keys</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Manage your API access tokens</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Danger Zone
            </h3>
            <button className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-xs text-red-500 dark:text-red-400/70">Permanently delete your account and data</p>
              </div>
              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-slate-400">CloudForge v1.0.0</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Support Modal Component
const SupportModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'faq' | 'chat'>('contact');
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    message: '',
  });
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: 'Hello! Welcome to CloudForge Enterprise Support. How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: 'user' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "Thank you for your message. Let me look into that for you.",
        "I understand. Could you provide more details about the issue?",
        "That's a great question! Let me help you with that.",
        "I'm checking our documentation for the best solution.",
        "Our engineering team is aware of this. Is there anything else I can help with?",
      ];
      const agentMessage = {
        sender: 'agent' as const,
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1500);
  };

  if (!isOpen) return null;

  const handleSubmitTicket = () => {
    // In a real app, this would submit to an API
    alert('Support ticket submitted successfully! Our team will contact you shortly.');
    setFormData({ subject: '', priority: 'medium', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden border border-gray-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-red-600 to-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Enterprise Support</h2>
              <p className="text-white/70 text-sm">We're here to help 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800">
          {[
            { id: 'contact', label: 'Contact Us', icon: Users },
            { id: 'chat', label: 'Live Chat', icon: Activity },
            { id: 'ticket', label: 'Submit Ticket', icon: AlertCircle },
            { id: 'faq', label: 'Quick Help', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-500/10'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Response within 4 hours</p>
                    </div>
                  </div>
                  <a href="mailto:support@cloudforge.vodafone.com" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    support@cloudforge.vodafone.com
                  </a>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Phone Support</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">24/7 Enterprise Hotline</p>
                    </div>
                  </div>
                  <a href="tel:+18001234567" className="text-green-600 dark:text-green-400 text-sm hover:underline">
                    +1 (800) 123-4567
                  </a>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Instant support</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
                  >
                    Start Chat Session
                  </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Documentation</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Self-service guides</p>
                    </div>
                  </div>
                  <button className="text-orange-600 dark:text-orange-400 text-sm hover:underline" onClick={() => { onClose(); window.location.href = '/docs'; }}>
                    Browse Docs
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ticket' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Issue affecting work</option>
                  <option value="high">High - Critical issue</option>
                  <option value="urgent">Urgent - System down</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitTicket}
                disabled={!formData.subject || !formData.message}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Submit Support Ticket
              </button>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              {[
                { q: 'How do I generate Terraform code?', a: 'Open your project in the Designer, add resources to the canvas, configure them, then click "Generate Terraform" in the toolbar.' },
                { q: 'How do I run cost estimation?', a: 'After generating Terraform code, click the "Estimate Cost" button. This uses Infracost to analyze your infrastructure costs.' },
                { q: 'How do I export my project?', a: 'Go to your project card on the dashboard, click the three-dot menu, and select "Export" to download as JSON.' },
                { q: 'How do I collaborate with my team?', a: 'Share your project link with team members. They can view and edit the project if they have access.' },
                { q: 'What cloud providers are supported?', a: 'CloudForge currently supports AWS, Azure, and Google Cloud Platform (GCP).' },
              ].map((item, index) => (
                <details key={index} className="group bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{item.q}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-slate-400">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-[400px]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    CS
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">CloudForge Support</p>
                  <p className="text-xs text-green-500">Online - Typically replies instantly</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-red-600 text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-red-200' : 'text-gray-400 dark:text-slate-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Support team online
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function EnhancedDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: number | null;
    projectName: string;
  }>({
    isOpen: false,
    projectId: null,
    projectName: '',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    total_projects: 0,
    total_resources: 0,
    total_cost: 0,
    currency: 'USD',
    team_members: 1,
  });

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', isDarkMode);
    setIsLoaded(true);
    loadProjects();
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/projects/');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterProvider === 'all' || project.cloud_provider === filterProvider;
    return matchesSearch && matchesFilter;
  });

  const handleOpenProject = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleDeleteProject = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setDeleteModal({ isOpen: true, projectId: id, projectName: project.name });
  };

  const confirmDeleteProject = async () => {
    if (!deleteModal.projectId) return;
    const projectName = deleteModal.projectName;

    try {
      await apiClient.delete(`/api/projects/${deleteModal.projectId}`);
      toast.success('Project deleted', `"${projectName}" has been removed`);
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project', 'Please try again');
    }
  };

  const handleDuplicateProject = async (id: number) => {
    try {
      const original = projects.find((p) => p.id === id);
      if (!original) return;

      const response = await apiClient.get(`/api/projects/${id}`);
      const projectData = response.data;

      const newName = `${original.name} Copy`;
      const createResponse = await apiClient.post('/api/projects/', {
        name: newName,
        description: original.description || '',
        cloud_provider: original.cloud_provider,
      });

      const newProjectId = createResponse.data.id;

      if (projectData.diagram_data) {
        const diagramData = projectData.diagram_data;
        const idMapping: Record<string, string> = {};
        const newNodes =
          diagramData.nodes?.map((node: any) => {
            const newId = `${node.data?.resourceType || 'node'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            idMapping[node.id] = newId;
            return { ...node, id: newId };
          }) || [];

        const newEdges =
          diagramData.edges?.map((edge: any) => ({
            ...edge,
            id: `${idMapping[edge.source] || edge.source}-${idMapping[edge.target] || edge.target}`,
            source: idMapping[edge.source] || edge.source,
            target: idMapping[edge.target] || edge.target,
          })) || [];

        await apiClient.put(`/api/projects/${newProjectId}`, {
          diagram_data: { ...diagramData, nodes: newNodes, edges: newEdges },
        });
      }

      toast.success('Project duplicated!', `Created "${newName}"`);
      loadProjects();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        'Please try again';
      toast.error('Failed to duplicate project', errorMsg);
    }
  };

  const handleExportProject = async (id: number) => {
    try {
      const project = projects.find((p) => p.id === id);
      if (!project) return;

      const response = await apiClient.get(`/api/projects/${id}`);
      const projectData = response.data;

      const exportData = {
        name: projectData.name,
        description: projectData.description,
        cloud_provider: projectData.cloud_provider,
        diagram_data: projectData.diagram_data,
        exported_at: new Date().toISOString(),
        version: '1.0',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${project.name.replace(/\s+/g, '_')}_export.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Project exported!', `Downloaded as ${filename}`);
    } catch (error) {
      toast.error('Failed to export project', 'Please try again');
    }
  };

  const handleShareProject = async (id: number) => {
    try {
      const shareUrl = `${window.location.origin}/projects/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', shareUrl);
    } catch (error) {
      toast.error('Failed to copy link', 'Please try again');
    }
  };

  const handleExportData = async () => {
    try {
      const analyticsResponse = await apiClient.get('/api/dashboard/analytics');
      const analytics = analyticsResponse.data;

      const headers = [
        'Project',
        'Cloud Provider',
        'Resources',
        'Monthly Cost (USD)',
      ];
      const rows = analytics.projects.map((p: any) => [
        p.name,
        p.cloud_provider.toUpperCase(),
        p.resource_count,
        `$${p.monthly_cost}`,
      ]);

      const csvContent = [
        '# CloudForge Dashboard Export',
        `# Generated: ${new Date().toISOString()}`,
        `# User: ${user?.username || 'Unknown'}`,
        '',
        '## Summary',
        `Total Projects,${analytics.summary.total_projects}`,
        `Total Resources,${analytics.summary.total_resources}`,
        `Total Cost,$${analytics.summary.total_cost}`,
        '',
        '## Projects',
        headers.join(','),
        ...rows.map((r: any[]) => r.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloudforge-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export complete!', 'Dashboard data downloaded as CSV');
    } catch (error) {
      toast.error('Failed to export data', 'Please try again');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 lg:p-8 transition-colors duration-300">
      {/* Background grid - only visible in dark mode */}
      <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14, 165, 233, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14, 165, 233, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.username || 'User'}
                </h1>
                <span className="text-2xl">👋</span>
              </div>
              <p className="text-gray-500 dark:text-slate-400">
                Here's what's happening with your infrastructure today
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-all shadow-sm dark:shadow-none">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/projects/new')}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium flex items-center gap-2 hover:from-red-500 hover:to-red-400 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <StatsCard
            title="Total Projects"
            value={projects.length}
            change={12}
            trend="up"
            icon={Folder}
            accentColor={colors.primary}
            loading={loading}
          />
          <StatsCard
            title="Active Resources"
            value={stats.total_resources}
            change={8}
            trend="up"
            icon={Server}
            accentColor={colors.success}
            loading={loading}
          />
          <StatsCard
            title="Monthly Cost"
            value={stats.total_cost}
            change={5}
            trend="down"
            icon={DollarSign}
            accentColor={colors.secondary}
            prefix="$"
            loading={loading}
          />
          <StatsCard
            title="Team Members"
            value={stats.team_members}
            change={2}
            trend="up"
            icon={Users}
            accentColor={colors.accent}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div
          className={`bg-white dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 p-6 transition-all duration-700 delay-200 shadow-sm dark:shadow-none ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionButton
              icon={Plus}
              title="New Project"
              description="Create infrastructure"
              onClick={() => navigate('/projects/new')}
              accentColor={colors.vodafone}
              isPrimary
            />
            <QuickActionButton
              icon={BarChart3}
              title="View Analytics"
              description="Cost & usage reports"
              onClick={() => navigate('/analytics')}
              accentColor={colors.primary}
            />
            <QuickActionButton
              icon={Download}
              title="Export Data"
              description="Download reports"
              onClick={handleExportData}
              accentColor={colors.secondary}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Section - 2 columns */}
          <div
            className={`lg:col-span-2 bg-white dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 transition-all duration-700 delay-300 shadow-sm dark:shadow-none ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                    Your Projects
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {filteredProjects.length} project
                    {filteredProjects.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-40 pl-9 pr-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="gcp">GCP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    Get started by creating your first infrastructure project
                  </p>
                  <button
                    onClick={() => navigate('/projects/new')}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:from-red-500 hover:to-red-400 transition-all shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.slice(0, 4).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={handleOpenProject}
                      onDelete={handleDeleteProject}
                      onDuplicate={handleDuplicateProject}
                      onExport={handleExportProject}
                      onShare={handleShareProject}
                    />
                  ))}
                </div>
              )}

              {filteredProjects.length > 4 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/projects')}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all"
                  >
                    View All Projects
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div
              className={`bg-white dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 p-6 transition-all duration-700 delay-400 shadow-sm dark:shadow-none ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                Recent Activity
              </h3>
              <div className="space-y-1">
                <ActivityItem
                  icon={CheckCircle2}
                  title="Deployment Complete"
                  description="Production environment updated"
                  time="2m ago"
                  type="success"
                />
                <ActivityItem
                  icon={GitBranch}
                  title="New Version"
                  description="Terraform v1.5.0 available"
                  time="1h ago"
                  type="info"
                />
                <ActivityItem
                  icon={Shield}
                  title="Security Scan"
                  description="All checks passed"
                  time="3h ago"
                  type="success"
                />
                <ActivityItem
                  icon={AlertCircle}
                  title="Cost Alert"
                  description="AWS spending up 15%"
                  time="5h ago"
                  type="warning"
                />
              </div>
            </div>

            {/* Performance Metrics */}
            <div
              className={`bg-white dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 p-6 transition-all duration-700 delay-500 shadow-sm dark:shadow-none ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                This Month
              </h3>
              <div className="space-y-5">
                <ProgressBar
                  label="Deployments"
                  value={75}
                  color={colors.success}
                />
                <ProgressBar
                  label="Security Score"
                  value={98}
                  color={colors.primary}
                />
                <ProgressBar
                  label="Cost Efficiency"
                  value={85}
                  color={colors.secondary}
                />
              </div>
            </div>

            {/* Support Card */}
            <div
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{
                background: `linear-gradient(135deg, ${colors.vodafone} 0%, #B91C1C 100%)`,
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <img
                      src="/vodafone.png"
                      alt="Vodafone"
                      className="h-6 w-auto"
                      onError={(e) => {
                        e.currentTarget.parentElement!.innerHTML =
                          '<span class="text-red-600 font-bold">V</span>';
                      }}
                    />
                  </div>
                  <span className="text-white/80 text-sm font-medium">
                    Enterprise Support
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
                <p className="text-white/70 text-sm mb-5">
                  Our team is available 24/7 to assist with your infrastructure
                  needs.
                </p>
                <button
                  onClick={() => setShowSupport(true)}
                  className="w-full py-2.5 bg-white text-red-600 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div
          className={`bg-white dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 p-6 lg:p-8 transition-all duration-700 delay-700 shadow-sm dark:shadow-none ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-transparent">
                <img
                  src="/vodafone.png"
                  alt="Vodafone"
                  className="h-9 w-auto"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-red-600 font-bold text-2xl">V</span>';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Vodafone CloudForge Enterprise
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Secure, scalable infrastructure management for global teams
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/docs')}
                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-xl font-medium transition-all"
              >
                Documentation
              </button>
              <button
                onClick={() => setShowSupport(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/25"
              >
                Get Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, projectId: null, projectName: '' })
        }
        onConfirm={confirmDeleteProject}
        projectName={deleteModal.projectName}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </div>
  );
}
