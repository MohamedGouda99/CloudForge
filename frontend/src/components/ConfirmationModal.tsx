import React, { useEffect, useState } from 'react';
import { AlertTriangle, Rocket, Trash2, X, Loader2 } from 'lucide-react';

type ActionType = 'apply' | 'destroy' | 'warning';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  actionType?: ActionType;
  isLoading?: boolean;
}

const actionConfig = {
  apply: {
    icon: Rocket,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    buttonBg: 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600',
    buttonShadow: 'shadow-emerald-500/30',
    accentColor: 'emerald',
  },
  destroy: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
    buttonShadow: 'shadow-red-500/30',
    accentColor: 'red',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    buttonShadow: 'shadow-amber-500/30',
    accentColor: 'amber',
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  actionType = 'warning',
  isLoading = false,
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const config = actionConfig[actionType];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimatingOut(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
          isAnimatingOut
            ? 'scale-95 opacity-0 translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Animated top accent bar */}
        <div className="h-1 w-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              actionType === 'apply'
                ? 'from-emerald-400 via-cyan-400 to-emerald-400'
                : actionType === 'destroy'
                ? 'from-red-400 via-orange-400 to-red-400'
                : 'from-amber-400 via-orange-400 to-amber-400'
            }`}
            style={{
              animation: 'shimmer 2s ease-in-out infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {/* Animated icon container */}
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-xl ${config.iconBg} flex items-center justify-center transform transition-transform duration-500 hover:scale-110`}
              style={{
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            >
              <Icon className={`w-7 h-7 ${config.iconColor}`} />
            </div>
            {/* Orbiting particle */}
            <div
              className={`absolute w-2 h-2 rounded-full ${
                actionType === 'apply' ? 'bg-emerald-400' : actionType === 'destroy' ? 'bg-red-400' : 'bg-amber-400'
              }`}
              style={{
                animation: 'orbit 3s linear infinite',
                top: '50%',
                left: '50%',
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please confirm your action
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Message box with subtle animation */}
          <div
            className={`p-4 rounded-xl mb-6 border transition-all duration-300 ${
              actionType === 'apply'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : actionType === 'destroy'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}
          >
            <p className={`text-sm ${
              actionType === 'apply'
                ? 'text-emerald-800 dark:text-emerald-200'
                : actionType === 'destroy'
                ? 'text-red-800 dark:text-red-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-5 py-3 rounded-xl font-medium text-white transition-all duration-200 active:scale-95 shadow-lg ${config.buttonBg} ${config.buttonShadow} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon className="w-4 h-4" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none ${
            actionType === 'apply' ? 'bg-emerald-400' : actionType === 'destroy' ? 'bg-red-400' : 'bg-amber-400'
          }`}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; }
          50% { box-shadow: 0 0 20px -5px currentColor; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(32px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(32px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
