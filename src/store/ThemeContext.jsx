import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { validateTheme, getSafeTheme } from "../utils/themeValidator";

// Define theme configurations
export const themes = {
  light: {
    name: "Light Mode",
    colors: {
      primary: {
        main: "#2563eb", // blue-600
        light: "#3b82f6", // blue-500
        dark: "#1d4ed8", // blue-700
      },
      background: {
        main: "#ffffff", // white
        secondary: "#f9fafb", // gray-50
        tertiary: "#f3f4f6", // gray-100
        hover: "#e5e7eb", // gray-200
        glass: "rgba(255, 255, 255, 0.9)",
      },
      text: {
        primary: "#111827", // gray-900
        secondary: "#4b5563", // gray-600
        muted: "#6b7280", // gray-500
      },
      border: "#d1d5db", // gray-300
      shadow: "rgba(17, 24, 39, 0.1)",
    },
  },
  dark: {
    name: "Dark Mode",
    colors: {
      primary: {
        main: "#3b82f6", // blue-500
        light: "#60a5fa", // blue-400
        dark: "#2563eb", // blue-600
      },
      background: {
        main: "#111827", // gray-900
        secondary: "#1f2937", // gray-800
        tertiary: "#374151", // gray-700
        hover: "#374151", // gray-700
        glass: "rgba(17, 24, 39, 0.8)",
      },
      text: {
        primary: "#ffffff", // white
        secondary: "#d1d5db", // gray-300
        muted: "#9ca3af", // gray-400
      },
      border: "#374151", // gray-700
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  default: {
    name: "Default Purple",
    colors: {
      primary: {
        main: "#a855f7", // purple-500
        light: "#c084fc", // purple-400
        dark: "#9333ea", // purple-600
      },
      background: {
        main: "#111827", // gray-900
        secondary: "#1f2937", // gray-800
        tertiary: "#374151", // gray-700
        hover: "#374151", // gray-700
        glass: "rgba(17, 24, 39, 0.8)",
      },
      text: {
        primary: "#ffffff",
        secondary: "#d1d5db",
        muted: "#9ca3af",
      },
      border: "#374151",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  royalBlue: {
    name: "Royal Dark Blue",
    colors: {
      primary: {
        main: "#2563eb", // blue-600
        light: "#3b82f6", // blue-500
        dark: "#1d4ed8", // blue-700
      },
      background: {
        main: "#172554", // blue-950
        secondary: "#1e3a8a", // blue-900
        tertiary: "#1e40af", // blue-800
        hover: "#1e40af", // blue-800
        glass: "rgba(23, 37, 84, 0.8)",
      },
      text: {
        primary: "#ffffff",
        secondary: "#dbeafe", // blue-100
        muted: "#bfdbfe", // blue-200
      },
      border: "#1e40af",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  crimsonDesert: {
    name: "Crimson Desert",
    colors: {
      primary: {
        main: "#dc2626", // red-600
        light: "#ef4444", // red-500
        dark: "#b91c1c", // red-700
      },
      background: {
        main: "#451a03", // amber-950
        secondary: "#78350f", // amber-900
        tertiary: "#92400e", // amber-800
        hover: "#92400e", // amber-800
        glass: "rgba(69, 26, 3, 0.8)",
      },
      text: {
        primary: "#ffffff",
        secondary: "#fef3c7", // amber-100
        muted: "#fde68a", // amber-200
      },
      border: "#92400e",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  black: {
    name: "Black",
    colors: {
      primary: {
        main: "#9ca3af", // gray-400
        light: "#d1d5db", // gray-300
        dark: "#6b7280", // gray-500
      },
      background: {
        main: "#000000",
        secondary: "#030712", // gray-950
        tertiary: "#111827", // gray-900
        hover: "#111827",
        glass: "rgba(0, 0, 0, 0.8)",
      },
      text: {
        primary: "#ffffff",
        secondary: "#d1d5db",
        muted: "#6b7280",
      },
      border: "#1f2937", // gray-800
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  midnightBlack: {
    name: "Midnight Black",
    colors: {
      primary: {
        main: "#6366f1", // indigo-500
        light: "#818cf8", // indigo-400
        dark: "#4f46e5", // indigo-600
      },
      background: {
        main: "#000000",
        secondary: "#030712",
        tertiary: "#111827",
        hover: "#111827",
        glass: "rgba(0, 0, 0, 0.8)",
      },
      text: {
        primary: "#eef2ff", // indigo-50
        secondary: "#c7d2fe", // indigo-200
        muted: "#a5b4fc", // indigo-300
      },
      border: "#312e81", // indigo-900
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  emeraldNight: {
    name: "Emerald Night",
    colors: {
      primary: {
        main: "#10b981", // emerald-500
        light: "#34d399", // emerald-400
        dark: "#059669", // emerald-600
      },
      background: {
        main: "#020617", // gray-950
        secondary: "#111827", // gray-900
        tertiary: "#1f2937", // gray-800
        hover: "#1f2937",
        glass: "rgba(2, 6, 23, 0.8)",
      },
      text: {
        primary: "#ffffff",
        secondary: "#d1fae5", // emerald-100
        muted: "#a7f3d0", // emerald-200
      },
      border: "#064e3b", // emerald-900
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
  glassmorphism: {
    name: "Glassmorphism",
    colors: {
      primary: {
        main: "#3b82f6", // blue-500
        light: "#60a5fa", // blue-400
        dark: "#2563eb", // blue-600
      },
      background: {
        main: "#0f172a", // slate-900 (fallback)
        secondary: "rgba(255, 255, 255, 0.1)",
        tertiary: "rgba(255, 255, 255, 0.2)",
        hover: "rgba(255, 255, 255, 0.15)",
        glass: "rgba(255, 255, 255, 0.05)",
      },
      text: {
        primary: "#ffffff",
        secondary: "rgba(255, 255, 255, 0.9)",
        muted: "rgba(255, 255, 255, 0.7)",
      },
      border: "rgba(255, 255, 255, 0.2)",
      shadow: "rgba(0, 0, 0, 0.25)",
    },
  },
};

/**
 * @typedef {Object} Theme
 * @property {string} name - Display name of the theme
 * @property {Object} colors - Color palette configuration
 * @property {Object} colors.primary - Primary color variants
 * @property {Object} colors.background - Background color variants
 * @property {Object} colors.text - Text color variants
 * @property {string} colors.border - Border color
 * @property {string} colors.shadow - Shadow color
 */

const ThemeContext = createContext();

/**
 * Theme provider component that manages theme state and provides theme context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("dark");

  // Load theme from localStorage on initial render - no dependencies needed
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("musicAppTheme");
      if (savedTheme && themes[savedTheme] && validateTheme(themes[savedTheme])) {
        setCurrentTheme(savedTheme);
      } else if (savedTheme && themes[savedTheme]) {
        console.warn(`Theme "${savedTheme}" has invalid structure, using default`);
        setCurrentTheme("default");
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error);
      setCurrentTheme("default");
    }
  }, []);

  // Apply theme changes to the document with CSS custom properties
  const applyTheme = useCallback((themeName) => {
    try {
      localStorage.setItem("musicAppTheme", themeName);

      const theme = themes[themeName];
      if (!theme) return;

      const root = document.documentElement;
      const { colors } = theme;

      // Set CSS custom properties for better performance and maintainability
      root.style.setProperty('--color-primary-main', colors.primary.main);
      root.style.setProperty('--color-primary-light', colors.primary.light);
      root.style.setProperty('--color-primary-dark', colors.primary.dark);
      root.style.setProperty('--color-bg-main', colors.background.main);
      root.style.setProperty('--color-bg-secondary', colors.background.secondary);
      root.style.setProperty('--color-bg-tertiary', colors.background.tertiary);
      root.style.setProperty('--color-bg-hover', colors.background.hover);
      root.style.setProperty('--color-bg-glass', colors.background.glass);
      root.style.setProperty('--color-text-primary', colors.text.primary);
      root.style.setProperty('--color-text-secondary', colors.text.secondary);
      root.style.setProperty('--color-text-muted', colors.text.muted);
      root.style.setProperty('--color-border', colors.border);
      root.style.setProperty('--color-shadow', colors.shadow);

      // Apply theme class for conditional styling
      document.body.className = `theme-${themeName}`;
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, []);

  // Save theme to localStorage and apply changes when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Theme change handler with validation
  const changeTheme = useCallback((themeName) => {
    if (themes[themeName] && validateTheme(themes[themeName])) {
      setCurrentTheme(themeName);
    } else {
      console.warn(`Invalid theme "${themeName}", falling back to default`);
      setCurrentTheme("default");
    }
  }, []);

  // Memoize available themes list to prevent recreation
  const availableThemes = useMemo(
    () => Object.keys(themes).map((key) => ({
      id: key,
      name: themes[key].name,
    })),
    []
  );

  // Get safe theme with validation
  const safeTheme = useMemo(
    () => getSafeTheme(themes[currentTheme]),
    [currentTheme]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentTheme,
      theme: safeTheme,
      changeTheme,
      availableThemes,
    }),
    [currentTheme, safeTheme, changeTheme, availableThemes]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context with enhanced error handling
 * @returns {Object} Theme context value
 * @throws {Error} When used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider. " +
      "Make sure your component is wrapped with <ThemeProvider>."
    );
  }

  // Additional runtime validation in development
  if (process.env.NODE_ENV === 'development') {
    if (!context.theme || !validateTheme(context.theme)) {
      console.warn('Invalid theme detected in useTheme hook:', context.theme);
    }
  }

  return context;
};
