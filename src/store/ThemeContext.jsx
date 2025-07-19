import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Define theme configurations
export const themes = {
  default: {
    name: "Default Purple",
    colors: {
      primary: {
        main: "purple-500",
        light: "purple-400",
        dark: "purple-600",
      },
      background: {
        main: "gray-900",
        secondary: "gray-800",
        tertiary: "gray-700",
      },
      text: {
        primary: "white",
        secondary: "gray-300",
        muted: "gray-400",
      },
      border: "gray-700",
    },
  },
  royalBlue: {
    name: "Royal Dark Blue",
    colors: {
      primary: {
        main: "blue-600",
        light: "blue-500",
        dark: "blue-700",
      },
      background: {
        main: "blue-950",
        secondary: "blue-900",
        tertiary: "blue-800",
      },
      text: {
        primary: "white",
        secondary: "blue-100",
        muted: "blue-200",
      },
      border: "blue-800",
    },
  },
  crimsonDesert: {
    name: "Crimson Desert",
    colors: {
      primary: {
        main: "red-600",
        light: "red-500",
        dark: "red-700",
      },
      background: {
        main: "amber-950",
        secondary: "amber-900",
        tertiary: "amber-800",
      },
      text: {
        primary: "white",
        secondary: "amber-100",
        muted: "amber-200",
      },
      border: "amber-800",
    },
  },
  black: {
    name: "Black",
    colors: {
      primary: {
        main: "gray-400",
        light: "gray-300",
        dark: "gray-500",
      },
      background: {
        main: "black",
        secondary: "gray-950",
        tertiary: "gray-900",
      },
      text: {
        primary: "white",
        secondary: "gray-300",
        muted: "gray-500",
      },
      border: "gray-800",
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("default");

  // Load theme from localStorage on initial render - no dependencies needed
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

  // Apply theme changes to the document
  const applyTheme = useCallback((themeName) => {
    try {
      localStorage.setItem("musicAppTheme", themeName);

      // Apply theme to CSS variables
      const theme = themes[themeName];
      if (!theme) return;

      // Update CSS variables based on the selected theme
      document.body.className =
        themeName === "default"
          ? `bg-${theme.colors.background.main} text-${theme.colors.text.primary}`
          : `theme-${themeName} bg-${theme.colors.background.main} text-${theme.colors.text.primary}`;
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
