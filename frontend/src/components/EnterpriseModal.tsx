import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showVodafone?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
};

export default function EnterpriseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showVodafone = true,
}: EnterpriseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col
                   animate-in slide-in-from-bottom duration-300 border border-gray-200 dark:border-gray-700`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {showVodafone && (
                  <img src="/vodafone.png" alt="Vodafone" className="h-6 w-auto" />
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

