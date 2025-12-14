import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store/authStore';
import { useThemeStore } from '../lib/store/themeStore';
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Shield,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface EnterpriseHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function EnterpriseHeader({ onToggleSidebar, sidebarOpen = true }: EnterpriseHeaderProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, title: 'Deployment successful', message: 'Production infrastructure deployed', time: '2m ago', type: 'success' },
    { id: 2, title: 'Security scan complete', message: 'No vulnerabilities found', time: '1h ago', type: 'info' },
    { id: 3, title: 'Cost alert', message: 'Monthly cost increased by 5%', time: '2h ago', type: 'warning' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/vodafone.png" alt="Vodafone" className="h-8 w-auto" />
            <div className="hidden md:flex items-center border-l border-gray-300 dark:border-gray-600 pl-3">
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">CloudForge</span>
                <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                  Enterprise
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Global Search */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, resources, documentation..."
              className="w-full pl-11 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-600
                       text-gray-900 dark:text-white placeholder-gray-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 
                         text-xs text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-500">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Action */}
          <button className="hidden lg:flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            <Zap className="w-4 h-4" />
            Deploy
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Help */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Help & Documentation">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.username?.[0]?.toUpperCase() || 'V'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">Vodafone Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {user?.username?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Profile Settings</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Security</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">Preferences</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <img src="/vodafone.png" alt="Vodafone" className="h-3 w-auto" />
                    <span>v1.0.0 Enterprise</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

