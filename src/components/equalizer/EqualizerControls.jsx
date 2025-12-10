import React, { memo } from 'react';
import { useTheme } from '../../store/ThemeContext';

export const EqualizerControls = memo(({ 
  isEnabled, 
  onToggle, 
  onReset, 
  onClose 
}) => {
  const { theme } = useTheme();

  const getToggleClasses = () => `
    px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
    ${isEnabled 
      ? `bg-${theme.colors.primary.main} text-white` 
      : `bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary}`
    }
  `;

  const getButtonClasses = () => `
    p-1 rounded-md transition-all duration-200
    hover:bg-${theme.colors.background.hover}
    text-${theme.colors.text.secondary}
    hover:text-${theme.colors.text.primary}
  `;

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-lg font-semibold text-${theme.colors.text.primary}`}>
        Equalizer
      </h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={getToggleClasses()}
          aria-pressed={isEnabled}
          aria-label={`${isEnabled ? 'Disable' : 'Enable'} equalizer`}
        >
          {isEnabled ? "ON" : "OFF"}
        </button>
        <button
          onClick={onReset}
          className={getButtonClasses()}
          aria-label="Reset equalizer to flat"
          title="Reset to Flat"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className={getButtonClasses()}
          aria-label="Close equalizer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
});