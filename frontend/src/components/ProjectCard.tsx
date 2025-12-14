import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Share2,
  Eye,
  Settings,
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description?: string;
  cloud_provider: 'aws' | 'azure' | 'gcp';
  created_at: string;
  updated_at: string;
  resource_count?: number;
  status?: 'active' | 'archived' | 'draft';
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onExport?: (id: number) => void;
  onShare?: (id: number) => void;
}

const providerConfig = {
  aws: {
    name: 'AWS',
    icon: '☁️',
    logo: '/api/icons/AWS/aws.png',
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    border: 'border-orange-300 dark:border-orange-700',
  },
  azure: {
    name: 'Azure',
    icon: '🔷',
    logo: '/api/icons/Azure/azure.png',
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
  },
  gcp: {
    name: 'GCP',
    icon: '🔴',
    logo: '/api/icons/GCP/gcp.png',
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
  },
};

export default function ProjectCard({ project, onDelete, onDuplicate, onExport, onShare }: ProjectCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const provider = providerConfig[project.cloud_provider];
  const timeAgo = new Date(project.updated_at).toLocaleDateString();

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700
                  hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden">
      {/* Colored Top Border */}
      <div className={`h-1.5 bg-gradient-to-r ${provider.color}`}></div>

      {/* Main Content */}
      <div onClick={() => navigate(`/projects/${project.id}`)} className="p-6">
        {/* Logo and Provider Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center
                         group-hover:scale-110 transition-transform shadow-lg p-3 bg-white dark:bg-gray-100 ring-4 ring-gray-100 dark:ring-gray-700">
              <img
                src={provider.logo}
                alt={provider.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Provider Badge Pill */}
          <div className={`px-3 py-1.5 ${provider.bg} ${provider.border} border rounded-full`}>
            <span className={`text-sm font-semibold ${provider.color}`}>{provider.name}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
          {project.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem] mb-4">
          {project.description || 'No description provided'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo}</span>
          </div>

          {project.resource_count !== undefined && (
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              <Settings className="w-3.5 h-3.5" />
              <span className="font-medium">{project.resource_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Open
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(project.id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExport?.(project.id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(project.id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project.id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      {project.status && (
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            project.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {project.status}
          </span>
        </div>
      )}
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
      <div className="animate-pulse">
        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

