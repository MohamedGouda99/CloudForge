import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import {
  ArrowLeft,
  DollarSign,
  Folder,
  Cloud,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Server,
  ExternalLink,
  Activity,
  Zap,
  BarChart3,
  PieChart,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    total_cost: number;
    currency: string;
    total_projects: number;
    total_resources: number;
  };
  projects: Array<{
    id: number;
    name: string;
    cloud_provider: string;
    monthly_cost: number;
    resource_count: number;
    updated_at: string | null;
  }>;
  by_provider: Array<{
    provider: string;
    cost: number;
    color: string;
  }>;
  resources: Array<{
    project_id: number;
    project_name: string;
    name: string;
    resource_type: string;
    monthly_cost: number;
    hourly_cost: number;
  }>;
}

const providerLogos: Record<string, string> = {
  aws: '/cloud_icons/aws-logo.svg',
  azure: '/cloud_icons/azure-logo.svg',
  gcp: '/cloud_icons/gcp-logo.svg',
};

const providerGradients: Record<string, string> = {
  aws: 'from-orange-500 to-yellow-500',
  azure: 'from-blue-500 to-cyan-500',
  gcp: 'from-red-500 to-yellow-500',
};

// Animated counter hook with decimal support
function useAnimatedCounter(endValue: number, duration: number = 1500, decimals: number = 0) {
  const [count, setCount] = useState(0);
  const prevEndValue = useRef(endValue);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (endValue === 0) {
      setCount(0);
      return;
    }

    let startTime: number;
    const startValue = prevEndValue.current !== endValue ? 0 : count;
    prevEndValue.current = endValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * easeOutExpo;

      if (decimals > 0) {
        setCount(parseFloat(currentValue.toFixed(decimals)));
      } else {
        setCount(Math.floor(currentValue));
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [endValue, duration, decimals]);

  return count;
}

// Sparkline Component
function Sparkline({ data, color = '#EF4444', height = 40 }: { data: number[]; color?: string; height?: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1000, 1);
      setAnimationProgress(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [data]);

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y * animationProgress + height * (1 - animationProgress)}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${color})`}
        className="transition-all duration-500"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

// Animated Ring Chart
function AnimatedRingChart({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#EF4444',
  label,
  value,
  delay = 0,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
  delay?: number;
}) {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1500;
        const easeOut = 1 - Math.pow(1 - Math.min(elapsed, 1), 4);
        setProgress(easeOut * percentage);
        if (elapsed < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          className="transition-all duration-300 drop-shadow-lg"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );
}

// Animated Donut Chart
function AnimatedDonutChart({
  data,
  size = 220,
  strokeWidth = 35,
  delay = 0,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1500, 1);
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setAnimationProgress(easeOutExpo);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, data]);

  let cumulativePercent = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {data.map((item, index) => (
            <filter key={index} id={`shadow-${index}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={item.color} floodOpacity="0.3" />
            </filter>
          ))}
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />
        {data.map((item, index) => {
          const percent = total > 0 ? item.value / total : 0;
          const strokeDasharray = circumference * percent * animationProgress;
          const strokeDashoffset = -circumference * cumulativePercent * animationProgress;
          cumulativePercent += percent;
          const isHovered = hoveredIndex === index;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter={`url(#shadow-${index})`}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: 'center',
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          ${Math.floor(total * animationProgress).toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost</span>
      </div>
    </div>
  );
}

// Animated Bar Chart
function AnimatedBarChart({
  data,
  delay = 0,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  delay?: number;
}) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1200, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setAnimationProgress(easeOutQuart);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, data]);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const isHovered = hoveredIndex === index;
        return (
          <div
            key={index}
            className={`group cursor-pointer transition-all duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold truncate max-w-[180px] transition-colors ${isHovered ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {item.label}
              </span>
              <span className={`text-sm font-bold transition-all ${isHovered ? 'text-lg' : ''}`} style={{ color: item.color }}>
                ${(item.value * animationProgress).toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-4 rounded-full relative overflow-hidden transition-all duration-500"
                style={{
                  width: `${percentage * animationProgress}%`,
                  background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                  boxShadow: isHovered ? `0 0 20px ${item.color}50` : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color,
  delay = 0,
  sparklineData,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
  delay?: number;
  sparklineData?: number[];
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const gradients: Record<string, string> = {
    purple: 'from-purple-500 to-indigo-600',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${isHovered ? 'shadow-2xl scale-[1.02] -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[color]} opacity-5 rounded-full transform translate-x-8 -translate-y-8 transition-transform duration-500 ${isHovered ? 'scale-150' : ''}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === 'up'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</h3>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
          {value}
        </p>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-10">
            <Sparkline data={sparklineData} color={color === 'purple' ? '#8B5CF6' : color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#F59E0B'} />
          </div>
        )}
      </div>
    </div>
  );
}

// Floating Particles Background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-red-500/10 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Section Header
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// Main Component
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'resources'>('overview');

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await apiClient.get('/api/dashboard/analytics');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCSV = useCallback(() => {
    if (!data) return;

    const headers = ['Project', 'Cloud Provider', 'Monthly Cost', 'Resources'];
    const rows = data.projects.map(p => [
      p.name,
      p.cloud_provider.toUpperCase(),
      `$${p.monthly_cost}`,
      p.resource_count,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      `Total Cost,$${data.summary.total_cost}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudforge-cost-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  // Animated values
  const animatedCost = useAnimatedCounter(data?.summary.total_cost || 0, 2000, 2);
  const animatedProjects = useAnimatedCounter(data?.summary.total_projects || 0, 1500);
  const animatedResources = useAnimatedCounter(data?.summary.total_resources || 0, 1800);

  // Chart data
  const donutChartData = useMemo(() => {
    if (!data) return [];
    return data.by_provider
      .filter(p => p.cost > 0)
      .map(p => ({
        label: p.provider,
        value: p.cost,
        color: p.color,
      }));
  }, [data]);

  const barChartData = useMemo(() => {
    if (!data) return [];
    return data.projects.slice(0, 5).map((p, i) => ({
      label: p.name,
      value: p.monthly_cost,
      color: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][i % 5],
    }));
  }, [data]);

  // Sparkline data (mock trend data)
  const sparklineData = useMemo(() => {
    return [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-red-500 animate-spin" />
            <div className="absolute inset-4 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-4 rounded-full border-4 border-t-red-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse text-lg font-medium">Loading Analytics...</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Crunching the numbers</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'No data available'}</p>
          <button
            onClick={() => loadAnalytics()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalProviderCost = data.by_provider.reduce((sum, p) => sum + p.cost, 0);
  const avgCostPerProject = data.summary.total_projects > 0
    ? data.summary.total_cost / data.summary.total_projects
    : 0;
  const avgCostPerResource = data.summary.total_resources > 0
    ? data.summary.total_cost / data.summary.total_resources
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Cost Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Activity className="w-4 h-4" />
                Real-time infrastructure cost insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAnalytics(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 group"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="font-medium text-gray-700 dark:text-gray-300">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <Download className="w-4 h-4 group-hover:animate-bounce" />
              Export Report
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-fit animate-slideUp">
          {(['overview', 'projects', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                icon={DollarSign}
                label="Total Monthly Cost"
                value={`$${animatedCost.toLocaleString()}`}
                trend="down"
                trendValue="-5.2%"
                color="purple"
                delay={100}
                sparklineData={sparklineData}
              />
              <StatsCard
                icon={Folder}
                label="Active Projects"
                value={animatedProjects}
                trend="up"
                trendValue="+12%"
                color="blue"
                delay={200}
                sparklineData={sparklineData.map(v => v * 0.8)}
              />
              <StatsCard
                icon={Layers}
                label="Total Resources"
                value={animatedResources}
                trend="up"
                trendValue="+8%"
                color="green"
                delay={300}
                sparklineData={sparklineData.map(v => v * 1.2)}
              />
              <StatsCard
                icon={Zap}
                label="Avg Cost/Project"
                value={`$${avgCostPerProject.toFixed(2)}`}
                color="orange"
                delay={400}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <SectionHeader icon={PieChart} title="Cost Distribution" subtitle="By cloud provider" />
                <div className="flex flex-col items-center">
                  {donutChartData.length > 0 ? (
                    <>
                      <AnimatedDonutChart data={donutChartData} size={240} strokeWidth={40} delay={500} />
                      <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {donutChartData.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-sm font-bold" style={{ color: item.color }}>${item.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Cloud className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No cost data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Projects */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <SectionHeader icon={BarChart3} title="Top Projects" subtitle="By monthly cost" />
                {barChartData.length > 0 ? (
                  <AnimatedBarChart data={barChartData} delay={600} />
                ) : (
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No projects found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-slideUp" style={{ animationDelay: '0.5s' }}>
                <SectionHeader icon={Cloud} title="Cloud Providers" />
                <div className="space-y-4">
                  {data.by_provider.map((provider, index) => {
                    const percentage = totalProviderCost > 0 ? (provider.cost / totalProviderCost) * 100 : 0;
                    return (
                      <div key={provider.provider} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${providerGradients[provider.provider.toLowerCase()] || 'from-gray-500 to-gray-600'}`}>
                              <img
                                src={providerLogos[provider.provider.toLowerCase()]}
                                alt={provider.provider}
                                className="w-5 h-5 filter brightness-0 invert"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{provider.provider}</span>
                          </div>
                          <span className="font-bold" style={{ color: provider.color }}>${provider.cost.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: provider.color,
                              animation: `growWidth 1s ease-out ${0.6 + index * 0.1}s both`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-slideUp" style={{ animationDelay: '0.6s' }}>
                <SectionHeader icon={Activity} title="Cost Metrics" />
                <div className="grid grid-cols-2 gap-4">
                  <AnimatedRingChart
                    percentage={Math.min((avgCostPerProject / 100) * 100, 100)}
                    color="#8B5CF6"
                    label="Per Project"
                    value={`$${avgCostPerProject.toFixed(0)}`}
                    delay={700}
                  />
                  <AnimatedRingChart
                    percentage={Math.min((avgCostPerResource / 20) * 100, 100)}
                    color="#10B981"
                    label="Per Resource"
                    value={`$${avgCostPerResource.toFixed(0)}`}
                    delay={800}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-slideUp" style={{ animationDelay: '0.7s' }}>
                <SectionHeader icon={CheckCircle2} title="Status" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="text-green-700 dark:text-green-400 font-medium">Budget Status</span>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">On Track</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">Cost Trend</span>
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">Decreasing</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <span className="text-purple-700 dark:text-purple-400 font-medium">Last Updated</span>
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Just now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <SectionHeader icon={Folder} title="All Projects" subtitle="Complete project cost breakdown" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Project', 'Provider', 'Resources', 'Monthly Cost', 'Action'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No projects found</p>
                      </td>
                    </tr>
                  ) : (
                    data.projects.map((project, index) => (
                      <tr
                        key={project.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group animate-slideIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {project.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${providerGradients[project.cloud_provider] || 'from-gray-500 to-gray-600'}`}>
                              <img
                                src={providerLogos[project.cloud_provider]}
                                alt={project.cloud_provider}
                                className="w-4 h-4 filter brightness-0 invert"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase">
                              {project.cloud_provider}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                            {project.resource_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${project.monthly_cost.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-110"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data.projects.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 font-bold text-gray-900 dark:text-white">Total</td>
                      <td className="px-6 py-4 text-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
                        ${data.summary.total_cost.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <SectionHeader icon={Server} title="Resource Costs" subtitle="Detailed resource-level breakdown" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Resource', 'Type', 'Project', 'Hourly', 'Monthly'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.resources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Server className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No resource costs available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Run Infracost on your projects to see costs</p>
                      </td>
                    </tr>
                  ) : (
                    data.resources.map((resource, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors animate-slideIn"
                        style={{ animationDelay: `${idx * 0.03}s` }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white">{resource.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400">
                            {resource.resource_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {resource.project_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          ${resource.hourly_cost.toFixed(4)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 dark:text-white">${resource.monthly_cost.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes growWidth {
          from { width: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out both; }
        .animate-slideUp { animation: slideUp 0.6s ease-out both; }
        .animate-slideIn { animation: slideIn 0.4s ease-out both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
