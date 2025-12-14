import { Clock, CheckCircle2, AlertTriangle, XCircle, Zap, GitBranch, Upload, Download } from 'lucide-react';

interface Activity {
  id: string;
  type: 'deploy' | 'save' | 'error' | 'warning' | 'update' | 'export' | 'import';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
}

const activityIcons = {
  deploy: { icon: Zap, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  save: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  warning: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  update: { icon: GitBranch, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  export: { icon: Download, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  import: { icon: Upload, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
};

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'deploy',
    title: 'Infrastructure deployed',
    description: 'Production environment successfully deployed to AWS',
    timestamp: '2 minutes ago',
    user: 'admin',
  },
  {
    id: '2',
    type: 'save',
    title: 'Project saved',
    description: 'Vodafone Production Infrastructure updated',
    timestamp: '15 minutes ago',
    user: 'admin',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Cost threshold warning',
    description: 'Monthly cost approaching $1000 limit',
    timestamp: '1 hour ago',
    user: 'system',
  },
];

export default function ActivityFeed({ activities = defaultActivities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">View all</button>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayActivities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        ) : (
          displayActivities.map((activity) => {
            const { icon: ActivityIcon, color, bg } = activityIcons[activity.type];
            
            return (
              <div
                key={activity.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`${bg} p-2 rounded-lg flex-shrink-0`}>
                    <ActivityIcon className={`w-4 h-4 ${color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                      <span>{activity.timestamp}</span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

