import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const ThemeSelector = () => {
  const { availableThemes, changeTheme, currentTheme, theme } = useTheme();
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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleThemeChange = useCallback((themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  }, [changeTheme]);

  // Memoized theme color indicators - more maintainable approach
  const themeColors = useMemo(() => ({
    light: "bg-blue-600",
    dark: "bg-blue-500", 
    default: "bg-purple-500",
    royalBlue: "bg-blue-600",
    crimsonDesert: "bg-red-600",
    black: "bg-gray-800",
    midnightBlack: "bg-indigo-500",
    emeraldNight: "bg-emerald-500",
  }), []);

  // Generate inline styles for dynamic theming instead of dynamic Tailwind classes
  const buttonStyles = useMemo(() => ({
    backgroundColor: `var(--color-bg-secondary)`,
    color: `var(--color-text-secondary)`,
    borderColor: `var(--color-border)`,
  }), []);

  const dropdownStyles = useMemo(() => ({
    backgroundColor: `var(--color-bg-secondary)`,
    borderColor: `var(--color-border)`,
    boxShadow: `0 10px 15px -3px var(--color-shadow), 0 4px 6px -2px var(--color-shadow)`,
  }), []);

  const getMenuItemStyles = useCallback((themeOption) => {
    const isSelected = currentTheme === themeOption.id;
    return {
      backgroundColor: isSelected 
        ? `var(--color-primary-main)` 
        : 'transparent',
      color: isSelected 
        ? 'white' 
        : `var(--color-text-secondary)`,
    };
  }, [currentTheme]);

  return (
    <div className="relative non-draggable">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        style={buttonStyles}
        className="p-2 rounded-lg transition-all duration-200 flex items-center gap-2 border hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
        title="Change theme"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <FaPalette className="h-4 w-4" />
        <span className="text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={dropdownStyles}
          className="absolute right-0 mt-2 w-56 rounded-lg border z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-2">
            <div 
              className="px-3 py-2 text-xs font-medium uppercase tracking-wider opacity-60"
              style={{ color: `var(--color-text-muted)` }}
            >
              Select Theme
            </div>
            {availableThemes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                style={getMenuItemStyles(themeOption)}
                className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset"
                role="menuitem"
                tabIndex={0}
              >
                <span>{themeOption.name}</span>
                <span
                  className={`h-3 w-3 rounded-full ${themeColors[themeOption.id]} ${
                    currentTheme === themeOption.id ? 'ring-2 ring-white' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};