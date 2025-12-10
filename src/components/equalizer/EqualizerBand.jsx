import React from 'react';
import { useTheme } from '../../store/ThemeContext';

export const EqualizerBand = ({ 
  band, 
  index, 
  onGainChange, 
  disabled = false,
  className = "" 
}) => {
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="h-32 w-8 relative mb-2">
        <input
          type="range"
          min="-12"
          max="12"
          step="0.5"
          value={band.gain}
          onChange={(e) => onGainChange(index, parseFloat(e.target.value))}
          className="slider-vertical h-full w-full"
          disabled={disabled}
          aria-label={`${band.label} frequency band gain`}
          aria-valuemin="-12"
          aria-valuemax="12"
          aria-valuenow={band.gain}
          aria-valuetext={`${band.gain > 0 ? '+' : ''}${band.gain.toFixed(1)}dB`}
        />
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-0.5 h-full bg-${theme.colors.border}
        `} />
      </div>
      <span className={`text-xs text-${theme.colors.text.muted} text-center`}>
        {band.label}
      </span>
      <span className={`text-xs text-${theme.colors.text.secondary} font-mono`}>
        {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}dB
      </span>
    </div>
  );
};