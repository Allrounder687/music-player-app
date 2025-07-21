import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaHeart,
  FaList,
  FaMusic,
  FaFolder,
  FaPalette,
  FaTimes,
  FaClock,
  FaHistory,
  FaFireAlt,
} from "react-icons/fa";
import { FileSelector } from "./FileSelector";
import { ThemeSelector } from "./ThemeSelector";

export const Sidebar = ({ isVisible, toggleSidebar }) => {
  const [showFileSelector, setShowFileSelector] = useState(false);

  const navItems = [
    { to: "/", icon: <FaHome />, label: "Now Playing" },
    { to: "/library", icon: <FaMusic />, label: "Library" },
    { to: "/favourites", icon: <FaHeart />, label: "Favourites" },
    { to: "/playlists", icon: <FaList />, label: "Playlists" },
    { to: "/recent", icon: <FaClock />, label: "Recently Added" },
    { to: "/history", icon: <FaHistory />, label: "Recently Played" },
    { to: "/popular", icon: <FaFireAlt />, label: "Most Played" },
  ];

  const handleOpenFolder = () => {
    setShowFileSelector(true);
  };

  // Determine sidebar width based on visibility
  const sidebarWidth = isVisible ? "w-56" : "w-16";

  return (
    <>
      <div
        className={`${sidebarWidth} flex flex-col h-full border-r transition-all duration-300`}
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className={`p-4 flex items-center ${
            isVisible ? "justify-center" : "justify-center"
          }`}
        >
          {isVisible ? (
            <div className="flex items-center">
              <FaMusic
                style={{ color: "var(--accent-color)" }}
                className="text-xl"
              />
            </div>
          ) : (
            <FaMusic
              style={{ color: "var(--accent-color)" }}
              className="text-xl"
            />
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors ${
                  isActive ? "text-white" : ""
                } ${isVisible ? "" : "justify-center"}`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive
                  ? "var(--accent-color)"
                  : "transparent",
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              })}
              title={!isVisible ? item.label : undefined}
            >
              <div className={isVisible ? "mr-3" : ""}>{item.icon}</div>
              {isVisible && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div
          className="p-3 border-t"
          style={{ borderColor: "var(--border-color)" }}
        >
          {/* Theme Selector */}
          <div className={`mb-3 flex ${isVisible ? "" : "justify-center"}`}>
            {isVisible ? (
              <div
                className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <FaPalette className="mr-3" />
                <span>Theme</span>
                <div className="ml-auto">
                  <ThemeSelector />
                </div>
              </div>
            ) : (
              <button
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                title="Change Theme"
              >
                <FaPalette />
                <div className="mt-1">
                  <ThemeSelector compact={true} />
                </div>
              </button>
            )}
          </div>

          {/* Open Folder Button */}
          <button
            onClick={handleOpenFolder}
            className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors ${
              isVisible ? "" : "justify-center"
            }`}
            style={{ color: "var(--text-secondary)" }}
            title={!isVisible ? "Open Folder" : undefined}
          >
            <FaFolder className={isVisible ? "mr-3" : ""} />
            {isVisible && <span>Open Folder</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {showFileSelector && (
        <FileSelector onClose={() => setShowFileSelector(false)} />
      )}
    </>
  );
};
