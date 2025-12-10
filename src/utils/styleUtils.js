/**
 * Utility functions for generating consistent theme-based styles
 */

// Theme-aware style generator with better type safety
export const createButtonStyles = (theme, variant = 'primary') => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200';
  
  // Use object-based approach for better maintainability
  const variantStyles = {
    primary: [
      `bg-${theme.colors.primary.main}`,
      `hover:bg-${theme.colors.primary.dark}`,
      'text-white'
    ],
    secondary: [
      `bg-${theme.colors.background.secondary}`,
      `hover:bg-${theme.colors.background.hover}`,
      `text-${theme.colors.text.secondary}`,
      `hover:text-${theme.colors.text.primary}`,
      `border border-${theme.colors.border}`
    ],
    ghost: [
      'bg-transparent',
      `hover:bg-${theme.colors.background.hover}`,
      `text-${theme.colors.text.secondary}`,
      `hover:text-${theme.colors.text.primary}`
    ]
  };
  
  const selectedVariant = variantStyles[variant] || variantStyles.primary;
  return [baseStyles, ...selectedVariant].join(' ');
};

export const createIconButtonStyles = (theme, active = false) => `
  p-2 rounded-lg transition-all duration-200
  ${active 
    ? `bg-${theme.colors.primary.main} text-white` 
    : `bg-${theme.colors.background.secondary} hover:bg-${theme.colors.background.hover} text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary}`
  }
  border border-${theme.colors.border}
`;

export const createInputStyles = (theme, size = 'default') => {
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    default: 'px-3 py-2',
    large: 'px-4 py-3 text-lg'
  };

  return `
    w-full rounded-lg transition-all duration-200
    bg-${theme.colors.background.secondary}
    border border-${theme.colors.border}
    text-${theme.colors.text.primary}
    placeholder-${theme.colors.text.muted}
    focus:ring-2 focus:ring-${theme.colors.primary.main}
    focus:border-transparent
    hover:border-${theme.colors.primary.light}
    ${sizeClasses[size]}
  `;
};

export const createCardStyles = (theme, selected = false) => `
  backdrop-blur-md 
  border border-${theme.colors.border} 
  rounded-xl 
  shadow-lg shadow-${theme.colors.shadow}
  transition-all duration-300 ease-in-out
  bg-${theme.colors.background.glass}
  ${selected ? `ring-2 ring-${theme.colors.primary.main}` : ''}
`;

/**
 * Formats duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "3:45")
 * @example
 * formatDuration(225) // Returns "3:45"
 * formatDuration(0) // Returns "--:--"
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
/**
 * Creates loading spinner styles
 * @param {string} size - Size variant ('small', 'default', 'large')
 * @param {string} color - Color class (e.g., 'white', 'blue-500')
 * @returns {string} CSS classes for loading spinner
 */
export const createLoadingSpinnerStyles = (size = 'default', color = 'current') => {
  const sizeClasses = {
    small: 'h-3 w-3',
    default: 'h-4 w-4', 
    large: 'h-6 w-6'
  };

  const borderClasses = {
    small: 'border',
    default: 'border-2',
    large: 'border-2'
  };

  return `
    animate-spin rounded-full 
    ${sizeClasses[size]} 
    ${borderClasses[size]} 
    border-${color} 
    border-t-transparent
  `;
};

/**
 * Creates consistent grid layout classes
 * @param {Object} options - Grid configuration
 * @returns {string} CSS classes for grid layout
 */
export const createGridStyles = ({ 
  cols = { sm: 1, md: 2, lg: 3 }, 
  gap = 4 
} = {}) => {
  return `
    grid 
    grid-cols-${cols.sm} 
    md:grid-cols-${cols.md} 
    lg:grid-cols-${cols.lg} 
    gap-${gap}
  `;
};

/**
 * Creates accessible focus styles
 * @param {Object} theme - Theme object
 * @returns {string} CSS classes for focus states
 */
export const createFocusStyles = (theme) => `
  focus:outline-none 
  focus:ring-2 
  focus:ring-${theme.colors.primary.main} 
  focus:ring-offset-2 
  focus:ring-offset-${theme.colors.background.main}
`;