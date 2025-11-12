import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  if (!isOpen) return null;
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l shadow-xl z-20 flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 text-sm text-gray-700">{children}</div>
    </div>
  );
}
