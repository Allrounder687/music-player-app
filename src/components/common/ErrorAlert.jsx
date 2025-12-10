import React from 'react';
import { useTheme } from '../../store/ThemeContext';

export const ErrorAlert = ({ error, onDismiss, className = '' }) => {
  const { theme } = useTheme();

  if (!error) return null;

  return (
    <div
      className={`p-4 rounded-lg border border-red-500/20 bg-red-500/10 flex items-start gap-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        <p className={`text-sm font-medium text-${theme.colors.text.primary}`}>
          {error}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary}
            transition-colors duration-200 p-1 rounded hover:bg-red-500/10
          `}
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;