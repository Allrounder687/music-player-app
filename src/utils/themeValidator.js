/**
 * Validates theme structure to ensure consistency
 * @param {Object} theme - Theme object to validate
 * @returns {boolean} - Whether theme is valid
 */
export const validateTheme = (theme) => {
  const requiredStructure = {
    name: 'string',
    colors: {
      primary: ['main', 'light', 'dark'],
      background: ['main', 'secondary', 'tertiary', 'hover', 'glass'],
      text: ['primary', 'secondary', 'muted'],
      border: 'string',
      shadow: 'string'
    }
  };

  try {
    // Validate basic structure
    if (!theme.name || typeof theme.name !== 'string') return false;
    if (!theme.colors || typeof theme.colors !== 'object') return false;

    // Validate color structure
    for (const [category, properties] of Object.entries(requiredStructure.colors)) {
      if (Array.isArray(properties)) {
        if (!theme.colors[category]) return false;
        for (const prop of properties) {
          if (!theme.colors[category][prop]) return false;
        }
      } else if (!theme.colors[category]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Theme validation error:', error);
    return false;
  }
};

/**
 * Gets a safe theme with fallbacks for missing properties
 * @param {Object} theme - Theme object
 * @returns {Object} - Safe theme object
 */
export const getSafeTheme = (theme) => {
  if (validateTheme(theme)) return theme;

  // Return default theme structure with fallbacks
  return {
    name: theme.name || 'Unknown Theme',
    colors: {
      primary: {
        main: theme.colors?.primary?.main || '#3b82f6',
        light: theme.colors?.primary?.light || '#60a5fa',
        dark: theme.colors?.primary?.dark || '#2563eb',
      },
      background: {
        main: theme.colors?.background?.main || '#111827',
        secondary: theme.colors?.background?.secondary || '#1f2937',
        tertiary: theme.colors?.background?.tertiary || '#374151',
        hover: theme.colors?.background?.hover || '#374151',
        glass: theme.colors?.background?.glass || 'rgba(17, 24, 39, 0.8)',
      },
      text: {
        primary: theme.colors?.text?.primary || '#ffffff',
        secondary: theme.colors?.text?.secondary || '#d1d5db',
        muted: theme.colors?.text?.muted || '#9ca3af',
      },
      border: theme.colors?.border || '#374151',
      shadow: theme.colors?.shadow || 'rgba(0, 0, 0, 0.25)',
    }
  };
};