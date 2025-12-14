import { CheckCircle2, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface StatusBarProps {
  connected?: boolean;
  lastSaved?: string;
  validationStatus?: 'valid' | 'warning' | 'error' | 'unknown';
  resourceCount?: number;
  cloudProvider?: string;
}

export default function StatusBar({
  connected = true,
  lastSaved,
  validationStatus = 'unknown',
  resourceCount = 0,
  cloudProvider = 'aws',
}: StatusBarProps) {
  const statusIcons = {
    valid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    warning: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    unknown: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  };

  const { icon: StatusIcon, color, bg } = statusIcons[validationStatus];

  return (
    <div className="h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs">
      {/* Left: Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-600" />
              <span className="text-red-600">Disconnected</span>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

        <div className="flex items-center gap-1.5">
          <StatusIcon className={`w-3 h-3 ${color}`} />
          <span className="text-gray-600 dark:text-gray-400">
            {validationStatus === 'valid' && 'Validated'}
            {validationStatus === 'warning' && 'Warnings'}
            {validationStatus === 'error' && 'Errors'}
            {validationStatus === 'unknown' && 'Not validated'}
          </span>
        </div>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
        <span>{resourceCount} resource{resourceCount !== 1 ? 's' : ''}</span>
        <span>•</span>
        <span className="uppercase font-semibold">{cloudProvider}</span>
        {lastSaved && (
          <>
            <span>•</span>
            <span>Saved {lastSaved}</span>
          </>
        )}
      </div>

      {/* Right: Vodafone Badge */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Powered by</span>
        <img src="/vodafone.png" alt="Vodafone" className="h-3 w-auto" />
        <span className="text-gray-500">Enterprise</span>
      </div>
    </div>
  );
}

