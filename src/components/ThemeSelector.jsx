import React, { useState, useRef, useEffect } from "react";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = ({ compact = false }) => {
  const { availableThemes, changeTheme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
      <div className="static" ref={dropdownRef}>
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
            className="rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-[100]"
            style={{
              backgroundColor: "var(--bg-secondary)",
              position: "fixed",
              top: "auto",
              left: "20px",
              width: "200px",
              marginTop: "10px",
            }}
          >
            <div className="py-2 p-3" role="menu">
              {availableThemes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between cursor-pointer mb-1 rounded ${
                    currentTheme === theme.id ? "ring-1 ring-white" : ""
                  } hover:bg-gray-700`}
                  role="menuitem"
                  title={theme.name}
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  <span>{theme.name}</span>
                  <span
                    className={`h-4 w-4 rounded-full ${themeColors[theme.id]}`}
                  ></span>
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
    <div className="relative" ref={dropdownRef}>
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
          className="rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-[100]"
          style={{
            backgroundColor: "var(--bg-secondary)",
            position: "absolute",
            top: "100%",
            right: "-10px",
            width: "200px",
          }}
        >
          <div className="py-2 p-2" role="menu" aria-orientation="vertical">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between cursor-pointer mb-1 rounded ${
                  currentTheme === theme.id ? "ring-1 ring-white" : ""
                } hover:bg-gray-700`}
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
                  className={`h-4 w-4 rounded-full ${themeColors[theme.id]}`}
                ></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
