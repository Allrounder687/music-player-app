import React, { useState } from "react";
import { FaSearch, FaBell, FaUserCircle, FaMusic } from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";
import { WindowControls } from "./WindowControls";

export const Topbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  return (
    <header
      className={`bg-${theme.colors.background.secondary} border-b border-${theme.colors.border} select-none`}
    >
      {/* Draggable title bar */}
      <div
        className="flex items-center justify-between h-8 px-3 draggable"
        style={{ WebkitAppRegion: "drag" }} // Make the title bar draggable in Electron
      >
        <div className="flex items-center">
          <FaMusic className={`text-${theme.colors.primary.main} mr-2`} />
          <span className={`text-${theme.colors.text.primary} font-medium`}>
            Music Player
          </span>
        </div>

        {/* Window controls - not draggable */}
        <div style={{ WebkitAppRegion: "no-drag" }}>
          <WindowControls />
        </div>
      </div>

      {/* Search bar and user controls */}
      <div className="flex items-center justify-between p-3">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className={`text-${theme.colors.text.muted} text-sm`} />
          </div>
          <input
            type="text"
            className={`block w-full pl-9 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary} placeholder-${theme.colors.text.muted} focus:outline-none focus:ring-1 focus:ring-${theme.colors.primary.main} focus:border-transparent text-sm`}
            placeholder="Search songs, artists, or albums"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            className={`p-1.5 rounded-full hover:bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary} hover:text-${theme.colors.text.primary}`}
          >
            <FaBell className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-2">
            <FaUserCircle
              className={`h-6 w-6 text-${theme.colors.text.muted}`}
            />
            <span
              className={`text-sm font-medium text-${theme.colors.text.secondary}`}
            >
              User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
