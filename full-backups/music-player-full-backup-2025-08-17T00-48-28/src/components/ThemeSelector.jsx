import React, { useState } from "react";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = () => {
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
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1.5 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white flex items-center"
        title="Change theme"
      >
        <FaPalette className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                  currentTheme === theme.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                role="menuitem"
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
