import { useEffect, useRef } from 'react';
import {
  Cloud,
  Database,
  Box,
  Trash2,
  Copy,
  Lock,
  Edit3,
  FileCode,
  GitBranch,
  EyeOff,
  ChevronRight,
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCloudConfig: () => void;
  onSwitchToData: () => void;
  onSwitchToContainer: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLock: () => void;
  onEditTitle: () => void;
  onState: () => void;
  onEditTFFilename: () => void;
  onHighlightConnections: () => void;
  onOmitFromCode: () => void;
}

export default function ResourceContextMenu({
  x,
  y,
  onClose,
  onCloudConfig,
  onSwitchToData,
  onSwitchToContainer,
  onDelete,
  onDuplicate,
  onLock,
  onEditTitle,
  onState,
  onEditTFFilename,
  onHighlightConnections,
  onOmitFromCode,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: Cloud,
      label: 'Cloud configuration',
      onClick: () => {
        onCloudConfig();
        onClose();
      },
    },
    {
      icon: Database,
      label: 'Switch to data',
      onClick: () => {
        onSwitchToData();
        onClose();
      },
    },
    {
      icon: Box,
      label: 'Switch to container',
      onClick: () => {
        onSwitchToContainer();
        onClose();
      },
      disabled: true,
    },
    { divider: true },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => {
        onDelete();
        onClose();
      },
      danger: true,
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick: () => {
        onDuplicate();
        onClose();
      },
    },
    {
      icon: Lock,
      label: 'Lock',
      onClick: () => {
        onLock();
        onClose();
      },
    },
    { divider: true },
    {
      icon: Edit3,
      label: 'Edit title',
      onClick: () => {
        onEditTitle();
        onClose();
      },
    },
    {
      icon: FileCode,
      label: 'State',
      onClick: () => {
        onState();
        onClose();
      },
      hasSubmenu: true,
    },
    {
      icon: FileCode,
      label: 'Edit TF filename',
      onClick: () => {
        onEditTFFilename();
        onClose();
      },
    },
    { divider: true },
    {
      icon: GitBranch,
      label: 'Highlight connections',
      onClick: () => {
        onHighlightConnections();
        onClose();
      },
    },
    {
      icon: EyeOff,
      label: 'Omit from code',
      onClick: () => {
        onOmitFromCode();
        onClose();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[220px] z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {menuItems.map((item, index) => {
        if ('divider' in item && item.divider) {
          return <div key={`divider-${index}`} className="border-t border-gray-200 my-1" />;
        }

        const Icon = item.icon!;
        const isDisabled = item.disabled || false;

        return (
          <button
            key={index}
            onClick={item.onClick}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              isDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.hasSubmenu && <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
        );
      })}
    </div>
  );
}
