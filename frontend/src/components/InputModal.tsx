import React, { useEffect, useState, useRef } from 'react';
import { Edit3, X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Save',
  cancelText = 'Cancel',
}: InputModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimatingOut(false);
      setInputValue(defaultValue);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    } else if (isVisible) {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }
  }, [isOpen, defaultValue]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
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
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!inputValue.trim()}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
