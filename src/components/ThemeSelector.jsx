import React, { useState } from "react";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = ({ compact = false }) => {
  const { availableThemes, changeTheme, currentTheme } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState(null);

  // Theme color indicators
  const themeColors = {
    default: "bg-purple-500",
    royalBlue: "bg-blue-600",
    crimsonDesert: "bg-red-600",
    black: "bg-gray-800",
    midnightBlack: "bg-indigo-500",
    emeraldNight: "bg-emerald-500",
  };

  // Get current theme color
  const currentThemeColor = themeColors[currentTheme] || "bg-purple-500";

  // For compact mode (collapsed sidebar)
  if (compact) {
    return (
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {availableThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            onMouseEnter={() => setHoveredTheme(theme.id)}
            onMouseLeave={() => setHoveredTheme(null)}
            className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 ${
              currentTheme === theme.id
                ? "ring-2 ring-white scale-110"
                : hoveredTheme === theme.id
                ? "scale-110"
                : ""
            }`}
            title={theme.name}
            style={{
              backgroundColor: `var(--${
                theme.id === "default"
                  ? "accent-color"
                  : theme.id === "royalBlue"
                  ? "blue-600"
                  : theme.id === "crimsonDesert"
                  ? "red-600"
                  : theme.id === "black"
                  ? "gray-800"
                  : theme.id === "midnightBlack"
                  ? "indigo-500"
                  : "emerald-500"
              })`,
            }}
          />
        ))}
      </div>
    );
  }

  // Regular mode (expanded sidebar)
  return (
    <div className="flex items-center gap-1">
      {availableThemes.map((theme) => (
        <div
          key={theme.id}
          onClick={() => changeTheme(theme.id)}
          onMouseEnter={() => setHoveredTheme(theme.id)}
          onMouseLeave={() => setHoveredTheme(null)}
          className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 ${
            currentTheme === theme.id
              ? "ring-2 ring-white scale-110"
              : hoveredTheme === theme.id
              ? "scale-110"
              : ""
          }`}
          title={theme.name}
          style={{
            backgroundColor: `var(--${
              theme.id === "default"
                ? "accent-color"
                : theme.id === "royalBlue"
                ? "blue-600"
                : theme.id === "crimsonDesert"
                ? "red-600"
                : theme.id === "black"
                ? "gray-800"
                : theme.id === "midnightBlack"
                ? "indigo-500"
                : "emerald-500"
            })`,
          }}
        />
      ))}
    </div>
  );
};
