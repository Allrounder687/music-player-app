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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        className={`fixed left-0 top-8 bottom-0 ${isCollapsed ? 'w-16' : 'w-56'} text-${theme.colors.text.secondary} flex flex-col border-r z-40 transition-all duration-300 gpu-accelerated`}
        style={{ 
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary
        }}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaMusic 
              className="text-xl cursor-pointer" 
              style={{ color: theme.colors.primary.main }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            />
            {!isCollapsed && <h1 className="text-lg font-bold">Music App</h1>}
          </div>
          {!isCollapsed && <ThemeSelector />}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : `hover:bg-opacity-20 hover:bg-white`
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? theme.colors.primary.main : 'transparent',
                color: isActive ? 'white' : theme.colors.text.secondary
              })}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`${isCollapsed ? 'text-lg' : ''}`}>
                {React.cloneElement(item.icon, { 
                  className: isCollapsed ? '' : 'mr-3',
                  style: { color: 'currentColor' }
                })}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: theme.colors.border.primary }}>
          <button
            onClick={handleOpenFolder}
            className={`w-full flex items-center p-2 rounded-lg hover:bg-opacity-20 hover:bg-white transition-colors mb-2 ${isCollapsed ? 'justify-center' : ''}`}
            style={{ color: theme.colors.text.secondary }}
            title={isCollapsed ? "Open Folder" : ''}
          >
            <FaFolder className={isCollapsed ? '' : 'mr-3'} />
            {!isCollapsed && <span>Open Folder</span>}
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
