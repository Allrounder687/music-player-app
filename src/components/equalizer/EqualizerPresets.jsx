import React from 'react';
import { useTheme } from '../../store/ThemeContext';

const PRESETS = {
  flat: { name: "Flat", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: "Rock", gains: [5, 3, -1, -2, -1, 2, 4, 6, 6, 6] },
  pop: { name: "Pop", gains: [-1, 2, 4, 4, 1, -1, -2, -2, -1, -1] },
  jazz: { name: "Jazz", gains: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  classical: { name: "Classical", gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4] },
  electronic: { name: "Electronic", gains: [4, 3, 1, 0, -2, 2, 1, 1, 3, 4] },
  hiphop: { name: "Hip Hop", gains: [5, 4, 1, 3, -1, -1, 1, -1, 2, 3] },
  vocal: { name: "Vocal", gains: [-2, -1, 2, 4, 4, 3, 2, 1, 0, -1] },
  bass: { name: "Bass Boost", gains: [6, 5, 4, 2, 1, -1, -2, -3, -3, -3] },
  treble: { name: "Treble Boost", gains: [-3, -3, -2, -1, 1, 2, 4, 5, 6, 6] },
};

export const EqualizerPresets = ({ 
  currentPreset, 
  onPresetChange, 
  className = "" 
}) => {
  const { theme } = useTheme();

  const getButtonClasses = (isActive) => `
    px-3 py-1 rounded-md text-sm font-medium transition-all duration-200
    ${isActive
      ? `bg-${theme.colors.primary.main} text-white`
      : `bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} hover:bg-${theme.colors.background.hover}`
    }
  `;

  return (
    <div className={className}>
      <label className={`block text-sm font-medium text-${theme.colors.text.secondary} mb-2`}>
        Presets
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onPresetChange(key, preset.gains)}
            className={getButtonClasses(currentPreset === key)}
            aria-pressed={currentPreset === key}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export { PRESETS };