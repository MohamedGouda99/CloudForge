import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
  loading?: boolean;
}

export default function MetricsCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-white',
  iconBg = 'bg-gradient-to-br from-blue-500 to-blue-600',
  description,
  loading = false,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUp;
    if (trend === 'down') return ArrowDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (trend === 'down') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 
                  hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>

      <div className="mb-1">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {value}
        </h3>
      </div>

      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}

export function MetricsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {children}
    </div>
  );
}

