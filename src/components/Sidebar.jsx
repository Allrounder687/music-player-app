import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaHeart,
  FaList,
  FaMusic,
  FaFolder,
  FaPalette,
} from "react-icons/fa";
import { FileSelector } from "./FileSelector";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "../store/ThemeContext";

export const Sidebar = () => {
  const [showFileSelector, setShowFileSelector] = useState(false);
  // Removed Electron test state
  const { theme } = useTheme();

  const navItems = [
    { to: "/", icon: <FaHome className="mr-3" />, label: "Now Playing" },
    { to: "/library", icon: <FaMusic className="mr-3" />, label: "Library" },
    {
      to: "/favourites",
      icon: <FaHeart className="mr-3" />,
      label: "Favourites",
    },
    { to: "/playlists", icon: <FaList className="mr-3" />, label: "Playlists" },
  ];

  const handleOpenFolder = () => {
    setShowFileSelector(true);
  };

  return (
    <>
      <div
        className={`w-56 bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} flex flex-col h-full border-r border-${theme.colors.border}`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaMusic className={`text-${theme.colors.primary.main} text-xl`} />
            <h1 className="text-lg font-bold">Music App</h1>
          </div>
          <ThemeSelector />
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? `bg-${theme.colors.primary.main} text-${theme.colors.text.primary}`
                    : `hover:bg-${theme.colors.background.tertiary}`
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`p-3 border-t border-${theme.colors.border}`}>
          <button
            onClick={handleOpenFolder}
            className={`w-full flex items-center p-2 rounded-lg hover:bg-${theme.colors.background.tertiary} transition-colors mb-2`}
          >
            <FaFolder className="mr-3" />
            <span>Open Folder</span>
          </button>

          <button
            onClick={() => (window.location.href = "/library")}
            className={`w-full flex items-center p-2 rounded-lg hover:bg-${theme.colors.background.tertiary} transition-colors`}
          >
            <FaMusic className="mr-3" />
            <span>View Library</span>
          </button>
        </div>
      </div>

      {showFileSelector && (
        <FileSelector onClose={() => setShowFileSelector(false)} />
      )}

      {/* Electron test removed */}
    </>
  );
};
