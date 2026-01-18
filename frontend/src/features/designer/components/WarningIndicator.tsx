/**
 * Warning Indicator Component
 *
 * Displays a warning indicator for invalid containment relationships.
 * Used with the "warn but allow" pattern for visual feedback.
 */

import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export interface ContainmentWarning {
  childType: string;
  parentType: string;
  message: string;
  suggestedParents?: string[];
  suggestedChildren?: string[];
}

interface WarningIndicatorProps {
  warning: ContainmentWarning;
  onDismiss?: () => void;
  compact?: boolean;
}

/**
 * Warning indicator for containment validation issues
 */
export function WarningIndicator({ warning, onDismiss, compact = false }: WarningIndicatorProps) {
  if (compact) {
    return (
      <div
        className="absolute -top-2 -right-2 z-10 p-1 bg-yellow-500 rounded-full cursor-pointer"
        title={warning.message}
      >
        <AlertTriangle className="w-3 h-3 text-white" />
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            Containment Warning
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            {warning.message}
          </p>

          {warning.suggestedParents && warning.suggestedParents.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Suggested parent containers:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {warning.suggestedParents.slice(0, 3).map((parent) => (
                  <span
                    key={parent}
                    className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs text-yellow-700 dark:text-yellow-300"
                  >
                    {parent}
                  </span>
                ))}
              </div>
            </div>
          )}

          {warning.suggestedChildren && warning.suggestedChildren.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Valid children for this container:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {warning.suggestedChildren.slice(0, 3).map((child) => (
                  <span
                    key={child}
                    className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs text-yellow-700 dark:text-yellow-300"
                  >
                    {child}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-0.5 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded"
          >
            <X className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Info tooltip for containment validation status
 */
interface ContainmentInfoProps {
  validChildTypes: string[];
  currentChildren?: string[];
}

export function ContainmentInfo({ validChildTypes, currentChildren = [] }: ContainmentInfoProps) {
  const invalidChildren = currentChildren.filter(
    (child) => !validChildTypes.includes(child)
  );

  return (
    <div className="text-xs">
      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
        <Info className="w-3 h-3" />
        <span>Valid child types</span>
      </div>

      {validChildTypes.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {validChildTypes.slice(0, 5).map((type) => (
            <span
              key={type}
              className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300"
            >
              {type.replace('aws_', '')}
            </span>
          ))}
          {validChildTypes.length > 5 && (
            <span className="px-1.5 py-0.5 text-gray-500">
              +{validChildTypes.length - 5} more
            </span>
          )}
        </div>
      ) : (
        <span className="text-gray-500">No defined children</span>
      )}

      {invalidChildren.length > 0 && (
        <div className="mt-2 text-yellow-600 dark:text-yellow-400">
          <span className="font-medium">{invalidChildren.length}</span> child node(s) have warnings
        </div>
      )}
    </div>
  );
}

export default WarningIndicator;
