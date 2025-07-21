import React, { useState } from "react";
import { FaSearch, FaMusic, FaBars, FaTimes } from "react-icons/fa";
import { WindowControls } from "./WindowControls";

export const Topbar = ({ toggleSidebar, sidebarVisible }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className="select-none border-b"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Draggable title bar */}
      <div
        className="flex items-center justify-between h-10 px-3 draggable"
        style={{ WebkitAppRegion: "drag" }} // Make the title bar draggable in Electron
      >
        <div className="flex items-center">
          <FaMusic className="mr-2" style={{ color: "var(--accent-color)" }} />
          <span
            className="font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            FaiXaL Music Player
          </span>
        </div>

        {/* Window controls - not draggable */}
        <div style={{ WebkitAppRegion: "no-drag" }}>
          <WindowControls />
        </div>
      </div>

      {/* Search bar and sidebar toggle */}
      <div className="flex items-center p-3">
        {/* Sidebar toggle button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 mr-2 non-draggable"
          style={{
            backgroundColor: "transparent",
            color: "var(--text-muted)",
            WebkitAppRegion: "no-drag",
          }}
          title={sidebarVisible ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarVisible ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>

        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-transparent rounded-md leading-5 focus:outline-none focus:ring-1 focus:border-transparent text-sm"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              borderColor: "transparent",
            }}
            placeholder="Search songs, artists, or albums"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};
