import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = () => {
  const { availableThemes, changeTheme, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleThemeChange = useCallback((themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  }, [changeTheme]);

  // Theme color indicators
  const themeColors = useMemo(() => ({
    light: "bg-blue-600",
    dark: "bg-blue-500",
    default: "bg-purple-500",
    royalBlue: "bg-blue-600",
    crimsonDesert: "bg-red-600",
    black: "bg-gray-800",
    midnightBlack: "bg-indigo-500",
    emeraldNight: "bg-emerald-500",
    glassmorphism: "bg-gradient-to-r from-blue-400 to-purple-500",
  }), []);

  // Use inline styles for dynamic theming to avoid Tailwind purging issues
  const buttonStyle = {
    backgroundColor: `var(--color-bg-secondary)`,
    color: `var(--color-text-secondary)`,
    borderColor: `var(--color-border)`,
  };

  const dropdownStyle = {
    backgroundColor: `var(--color-bg-secondary)`,
    borderColor: `var(--color-border)`,
    boxShadow: `0 10px 15px -3px var(--color-shadow), 0 4px 6px -2px var(--color-shadow)`,
  };

  const headerStyle = {
    color: `var(--color-text-muted)`,
  };

  const getItemStyle = useCallback((themeOption) => {
    const isSelected = currentTheme === themeOption.id;
    return {
      backgroundColor: isSelected ? `var(--color-primary-main)` : 'transparent',
      color: isSelected ? 'white' : `var(--color-text-secondary)`,
    };
  }, [currentTheme]);

  return (
    <div className="relative non-draggable">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDropdown();
        }}
        style={buttonStyle}
        className="p-2 rounded-lg transition-all duration-200 flex items-center gap-2 border hover:opacity-80 non-draggable clickable cursor-pointer"
        title="Change theme"
      >
        <FaPalette className="h-4 w-4" />
        <span className="text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 rounded-lg border non-draggable dropdown-menu clickable"
          style={{
            ...dropdownStyle,
            zIndex: 9999,
          }}
        >
          <div className="py-2" role="menu" aria-orientation="vertical">
            <div 
              style={headerStyle}
              className="px-3 py-2 text-xs font-medium uppercase tracking-wider"
            >
              Select Theme
            </div>
            {availableThemes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleThemeChange(themeOption.id);
                }}
                style={getItemStyle(themeOption)}
                className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-all duration-200 hover:opacity-80 non-draggable clickable cursor-pointer"
                role="menuitem"
                onMouseEnter={(e) => {
                  if (currentTheme !== themeOption.id) {
                    e.target.style.backgroundColor = 'var(--color-bg-hover)';
                    e.target.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== themeOption.id) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <span>{themeOption.name}</span>
                <span
                  className={`h-3 w-3 rounded-full ${themeColors[themeOption.id]} ${
                    currentTheme === themeOption.id ? 'ring-2 ring-white' : ''
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
