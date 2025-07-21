import React, { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = ({ compact = false }) => {
  const { availableThemes, changeTheme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

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

  // For compact mode, just show the color indicator
  if (compact) {
    return (
      <div className="relative">
        <div
          onClick={toggleDropdown}
          className="p-1 rounded-full hover:bg-gray-700 flex items-center justify-center cursor-pointer"
          title="Change theme"
          style={{ backgroundColor: "transparent" }}
        >
          <div className={`h-3 w-3 rounded-full ${currentThemeColor}`}></div>
        </div>

        {isOpen && (
          <div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-32 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="py-1 grid grid-cols-3 gap-2 p-2" role="menu">
              {availableThemes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full h-6 rounded flex items-center justify-center cursor-pointer ${
                    currentTheme === theme.id ? "ring-2 ring-white" : ""
                  }`}
                  role="menuitem"
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
                >
                  <div
                    className={`h-3 w-3 rounded-full ${themeColors[theme.id]}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular mode with text labels
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-full hover:bg-gray-700 flex items-center justify-center"
        title="Change theme"
        style={{ backgroundColor: "transparent" }}
      >
        <div className={`h-3 w-3 rounded-full ${currentThemeColor}`}></div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                  currentTheme === theme.id
                    ? "bg-opacity-30 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                role="menuitem"
                style={{
                  backgroundColor:
                    currentTheme === theme.id
                      ? "var(--accent-color-dark)"
                      : "transparent",
                  color:
                    currentTheme === theme.id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                <span>{theme.name}</span>
                <span
                  className={`h-3 w-3 rounded-full ${themeColors[theme.id]}`}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
