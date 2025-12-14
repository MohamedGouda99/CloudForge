import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.toLowerCase() === 'confirm') {
      onConfirm();
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleClose = () => {
    setInputValue('');
    setError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          error ? 'animate-shake' : 'animate-in zoom-in-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delete Project
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              You are about to permanently delete the project{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{projectName}"
              </span>
              . All associated data will be lost.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                To confirm deletion, please type{' '}
                <span className="font-mono font-bold">confirm</span> below:
              </p>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(false);
              }}
              placeholder="Type 'confirm' to proceed"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${
                  error
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                }
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                outline-none
              `}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium animate-in slide-in-from-top-1">
                Please type "confirm" exactly as shown
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!inputValue}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                inputValue
                  ? 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/30'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              Delete Project
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
