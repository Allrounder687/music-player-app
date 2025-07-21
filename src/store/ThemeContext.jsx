import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Define theme configurations with CSS variable values
export const themes = {
  default: {
    name: "Default Purple",
    colors: {
      primary: {
        main: "#8B5CF6", // purple-500
        light: "#A78BFA", // purple-400
        dark: "#7C3AED", // purple-600
      },
      background: {
        main: "#111827", // gray-900
        secondary: "#1F2937", // gray-800
        tertiary: "#374151", // gray-700
        hover: "#374151", // gray-700
      },
      text: {
        primary: "#FFFFFF", // white
        secondary: "#D1D5DB", // gray-300
        muted: "#9CA3AF", // gray-400
      },
      border: "#374151", // gray-700
    },
  },
  royalBlue: {
    name: "Royal Dark Blue",
    colors: {
      primary: {
        main: "#2563EB", // blue-600
        light: "#3B82F6", // blue-500
        dark: "#1D4ED8", // blue-700
      },
      background: {
        main: "#0C1B44", // blue-950
        secondary: "#0F2257", // blue-900
        tertiary: "#1A3A8F", // blue-800
        hover: "#1A3A8F", // blue-800
      },
      text: {
        primary: "#FFFFFF", // white
        secondary: "#E0E7FF", // blue-100
        muted: "#C7D2FE", // blue-200
      },
      border: "#1E3A8A", // blue-800
    },
  },
  crimsonDesert: {
    name: "Crimson Desert",
    colors: {
      primary: {
        main: "#DC2626", // red-600
        light: "#EF4444", // red-500
        dark: "#B91C1C", // red-700
      },
      background: {
        main: "#451A03", // amber-950
        secondary: "#78350F", // amber-900
        tertiary: "#92400E", // amber-800
        hover: "#92400E", // amber-800
      },
      text: {
        primary: "#FFFFFF", // white
        secondary: "#FEF3C7", // amber-100
        muted: "#FDE68A", // amber-200
      },
      border: "#92400E", // amber-800
    },
  },
  black: {
    name: "Black",
    colors: {
      primary: {
        main: "#9CA3AF", // gray-400
        light: "#D1D5DB", // gray-300
        dark: "#6B7280", // gray-500
      },
      background: {
        main: "#000000", // black
        secondary: "#030712", // gray-950
        tertiary: "#111827", // gray-900
        hover: "#111827", // gray-900
      },
      text: {
        primary: "#FFFFFF", // white
        secondary: "#D1D5DB", // gray-300
        muted: "#6B7280", // gray-500
      },
      border: "#1F2937", // gray-800
    },
  },
  midnightBlack: {
    name: "Midnight Black",
    colors: {
      primary: {
        main: "#6366F1", // indigo-500
        light: "#818CF8", // indigo-400
        dark: "#4F46E5", // indigo-600
      },
      background: {
        main: "#000000", // black
        secondary: "#030712", // gray-950
        tertiary: "#111827", // gray-900
        hover: "#111827", // gray-900
      },
      text: {
        primary: "#EEF2FF", // indigo-50
        secondary: "#C7D2FE", // indigo-200
        muted: "#A5B4FC", // indigo-300
      },
      border: "#312E81", // indigo-900
    },
  },
  emeraldNight: {
    name: "Emerald Night",
    colors: {
      primary: {
        main: "#10B981", // emerald-500
        light: "#34D399", // emerald-400
        dark: "#059669", // emerald-600
      },
      background: {
        main: "#030712", // gray-950
        secondary: "#111827", // gray-900
        tertiary: "#1F2937", // gray-800
        hover: "#1F2937", // gray-800
      },
      text: {
        primary: "#FFFFFF", // white
        secondary: "#D1FAE5", // emerald-100
        muted: "#A7F3D0", // emerald-200
      },
      border: "#064E3B", // emerald-900
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("default");

  // Load theme from localStorage on initial render
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("musicAppTheme");
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error);
    }
  }, []);

  // Apply theme changes to the document using CSS variables
  const applyTheme = useCallback((themeName) => {
    try {
      localStorage.setItem("musicAppTheme", themeName);

      // Get theme colors
      const theme = themes[themeName];
      if (!theme) return;

      // Set CSS variables
      const root = document.documentElement;

      // Primary colors
      root.style.setProperty("--accent-color", theme.colors.primary.main);
      root.style.setProperty(
        "--accent-color-light",
        theme.colors.primary.light
      );
      root.style.setProperty("--accent-color-dark", theme.colors.primary.dark);

      // Background colors
      root.style.setProperty("--bg-primary", theme.colors.background.main);
      root.style.setProperty(
        "--bg-secondary",
        theme.colors.background.secondary
      );
      root.style.setProperty("--bg-tertiary", theme.colors.background.tertiary);
      root.style.setProperty("--bg-hover", theme.colors.background.hover);

      // Text colors
      root.style.setProperty("--text-primary", theme.colors.text.primary);
      root.style.setProperty("--text-secondary", theme.colors.text.secondary);
      root.style.setProperty("--text-muted", theme.colors.text.muted);

      // Border color
      root.style.setProperty("--border-color", theme.colors.border);

      // Add theme class to body
      document.body.className = `theme-${themeName}`;
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, []);

  // Save theme to localStorage and apply changes when it changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  // Theme change handler
  const changeTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    currentTheme,
    theme: themes[currentTheme],
    changeTheme,
    availableThemes: Object.keys(themes).map((key) => ({
      id: key,
      name: themes[key].name,
    })),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
