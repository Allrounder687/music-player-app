import { useTheme } from '../store/ThemeContext';

/**
 * Custom hook that provides theme utility functions
 * @returns {Object} Theme utilities
 */
export const useThemeUtils = () => {
  const { theme } = useTheme();

  /**
   * Get Tailwind class for a theme color
   * @param {string} colorPath - Dot notation path to color (e.g., 'primary.main', 'background.secondary')
   * @param {string} prefix - Tailwind prefix (e.g., 'bg', 'text', 'border')
   * @returns {string} Tailwind class
   */
  const getThemeClass = (colorPath, prefix = '') => {
    const pathParts = colorPath.split('.');
    let color = theme.colors;
    
    for (const part of pathParts) {
      color = color?.[part];
    }
    
    if (!color) {
      console.warn(`Theme color path "${colorPath}" not found`);
      return '';
    }
    
    return prefix ? `${prefix}-${color}` : color;
  };

  /**
   * Get multiple theme classes at once
   * @param {Object} classMap - Object mapping class names to color paths
   * @returns {string} Space-separated class string
   */
  const getThemeClasses = (classMap) => {
    return Object.entries(classMap)
      .map(([prefix, colorPath]) => getThemeClass(colorPath, prefix))
      .filter(Boolean)
      .join(' ');
  };

  /**
   * Check if current theme is dark
   * @returns {boolean} Whether current theme is dark
   */
  const isDarkTheme = () => {
    return theme.colors.background.main !== 'white';
  };

  return {
    getThemeClass,
    getThemeClasses,
    isDarkTheme,
  };
};