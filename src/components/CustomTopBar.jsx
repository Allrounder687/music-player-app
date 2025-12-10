import React from 'react';
import { useTheme } from '../store/ThemeContext';

export const CustomTopBar = () => {
  const { theme } = useTheme();

  const handleMinimize = () => {
    if (window.electron?.window) {
      window.electron.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron?.window) {
      window.electron.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.electron?.window) {
      window.electron.window.close();
    }
  };

  return (
    <div 
      className={`
        fixed top-0 left-0 right-0 z-50 h-8 
        ${theme.colors.background.secondary} 
        border-b border-${theme.colors.border.primary}
        flex items-center justify-between px-4
        select-none
      `}
      style={{ 
        WebkitAppRegion: 'drag',
        backgroundColor: theme.colors.background.secondary 
      }}
    >
      {/* Left side - App title */}
      <div className={`text-sm font-medium ${theme.colors.text.primary}`}>
        Music Player
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center space-x-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={handleMinimize}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            hover:bg-${theme.colors.background.tertiary}
            transition-colors duration-200
          `}
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" className={`fill-${theme.colors.text.secondary}`}>
            <rect width="10" height="1" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            hover:bg-${theme.colors.background.tertiary}
            transition-colors duration-200
          `}
          title="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className={`fill-${theme.colors.text.secondary}`}>
            <rect width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            hover:bg-red-500 hover:text-white
            transition-colors duration-200
          `}
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
};