import { useState, useEffect, useRef, useMemo } from 'react';
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

// Animated counter hook - fixed version
function useAnimatedCounter(endValue: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const prevEndValue = useRef(endValue);

  useEffect(() => {
    // Reset and animate when endValue changes
    if (endValue === 0) {
      setCount(0);
      return;
    }

    let startTime: number;
    let animationFrame: number;
    const startValue = prevEndValue.current !== endValue ? 0 : count;
    prevEndValue.current = endValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setCount(Math.floor(currentValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return count;
}

// Animated Donut Chart Component
function AnimatedDonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  delay = 0,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1500, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setAnimationProgress(easeOutQuart);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, data]);

  let cumulativePercent = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Data segments */}
        {data.map((item, index) => {
          const percent = total > 0 ? item.value / total : 0;
          const strokeDasharray = circumference * percent * animationProgress;
          const strokeDashoffset = -circumference * cumulativePercent * animationProgress;
          cumulativePercent += percent;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          ${Math.floor(total * animationProgress).toLocaleString()}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
      </div>
    </div>
  );
}

// Animated Bar Chart Component
function AnimatedBarChart({
  data,
  delay = 0,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  delay?: number;
}) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1200, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setAnimationProgress(easeOutQuart);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, data]);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {item.label}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${(item.value * animationProgress).toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                style={{
                  width: `${percentage * animationProgress}%`,
                  backgroundColor: item.color,
                }}
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    transform: `translateX(${animationProgress < 1 ? '-100%' : '100%'})`,
                    transition: 'transform 0.8s ease-out',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Animated progress bar component
function AnimatedProgressBar({
  percentage,
  color,
  delay = 0
}: {
  percentage: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay + 300);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${width}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// Fade-in animation wrapper
function FadeIn({
  children,
  delay = 0,
  direction = 'up'
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const transforms = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  };

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : transforms[direction],
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async (isRefresh = false) => {
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
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
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
  };

  // Animated counters - use actual values from data
  const totalCost = data?.summary.total_cost || 0;
  const totalProjects = data?.summary.total_projects || 0;
  const totalResources = data?.summary.total_resources || 0;

  const animatedCost = useAnimatedCounter(totalCost, 1500);
  const animatedProjects = useAnimatedCounter(totalProjects, 1000);
  const animatedResources = useAnimatedCounter(totalResources, 1200);

  // Prepare chart data
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <FadeIn>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'No data available'}</p>
            <button
              onClick={() => loadAnalytics()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  const totalProviderCost = data.by_provider.reduce((sum, p) => sum + p.cost, 0);
  const avgCostPerProject = data.summary.total_projects > 0
    ? data.summary.total_cost / data.summary.total_projects
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Detailed cost breakdown and insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAnalytics(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                -5%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Monthly Cost</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${animatedCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{data.summary.currency}</p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {animatedProjects}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Cloud className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Resources</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {animatedResources}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Server className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Cost/Project</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${avgCostPerProject.toFixed(2)}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Cost by Provider */}
        <FadeIn delay={500}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Cost Distribution</h2>
            <div className="flex items-center justify-center">
              {donutChartData.length > 0 ? (
                <div className="flex flex-col items-center gap-6">
                  <AnimatedDonutChart data={donutChartData} size={200} strokeWidth={35} delay={600} />
                  <div className="flex flex-wrap justify-center gap-4">
                    {donutChartData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No cost data available</p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Bar Chart - Top Projects */}
        <FadeIn delay={600}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Projects by Cost</h2>
            {barChartData.length > 0 ? (
              <AnimatedBarChart data={barChartData} delay={700} />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No projects found</p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Cost by Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={700}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cost by Provider</h2>
            <div className="space-y-5">
              {data.by_provider.map((provider, index) => {
                const percentage = totalProviderCost > 0 ? (provider.cost / totalProviderCost) * 100 : 0;
                return (
                  <div key={provider.provider} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={providerLogos[provider.provider.toLowerCase()]}
                          alt={provider.provider}
                          className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {provider.provider}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ${provider.cost.toLocaleString()}
                      </span>
                    </div>
                    <AnimatedProgressBar
                      percentage={percentage}
                      color={provider.color}
                      delay={700 + index * 150}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Projects Table */}
        <FadeIn delay={800} direction="right">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cost by Project</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resources
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monthly Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No projects found. Create a project and run Infracost to see cost data.
                      </td>
                    </tr>
                  ) : (
                    data.projects.map((project, index) => (
                      <tr
                        key={project.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                        style={{
                          animation: `fadeInRow 0.3s ease-out ${900 + index * 100}ms both`,
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={providerLogos[project.cloud_provider]}
                              alt={project.cloud_provider}
                              className="w-4 h-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                              {project.cloud_provider}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {project.resource_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-bold text-gray-900 dark:text-white">
                            ${project.monthly_cost.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-110"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data.projects.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-6 py-3 text-right text-lg font-bold text-red-600 dark:text-red-400">
                        ${data.summary.total_cost.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Resource Cost Breakdown */}
      {data.resources.length > 0 && (
        <FadeIn delay={900}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Resources by Cost</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Detailed breakdown of cost-bearing resources</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hourly
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monthly
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.resources.map((resource, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      style={{
                        animation: `fadeInRow 0.3s ease-out ${1000 + idx * 50}ms both`,
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{resource.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {resource.resource_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {resource.project_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                        ${resource.hourly_cost.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${resource.monthly_cost.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Empty State for Resources */}
      {data.resources.length === 0 && data.projects.length > 0 && (
        <FadeIn delay={900}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Resource Costs Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Run Infracost on your projects to see detailed resource-level cost breakdown.
            </p>
          </div>
        </FadeIn>
      )}

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
