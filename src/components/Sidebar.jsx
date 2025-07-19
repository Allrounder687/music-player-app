import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaHeart,
  FaList,
  FaMusic,
  FaFolder,
  FaPalette,
  FaKeyboard,
  FaInfoCircle,
} from "react-icons/fa";
import { FileSelector } from "./FileSelector";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "../store/ThemeContext";
import { useMusic } from "../store/MusicContext";

export const Sidebar = () => {
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const { theme } = useTheme();
  const { tracks, playlists } = useMusic();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'o':
            e.preventDefault();
            setShowFileSelector(true);
            break;
          case '/':
            e.preventDefault();
            setShowKeyboardShortcuts(!showKeyboardShortcuts);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts]);

  const navItems = [
    { to: "/", icon: <FaHome className="mr-3" />, label: "Now Playing", count: null },
    { to: "/library", icon: <FaMusic className="mr-3" />, label: "Library", count: tracks.length },
    {
      to: "/favourites",
      icon: <FaHeart className="mr-3" />,
      label: "Favourites",
      count: playlists.favorites?.length || 0,
    },
    { to: "/playlists", icon: <FaList className="mr-3" />, label: "Playlists", count: Object.keys(playlists.custom || {}).length },
  ];

  const handleOpenFolder = () => {
    setShowFileSelector(true);
  };

  return (
    <>
      <div
        className={`w-56 bg-${theme.colors.background.secondary} text-${theme.colors.text.secondary} flex flex-col h-full border-r border-${theme.colors.border} transition-all duration-200`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaMusic className={`text-${theme.colors.primary.main} text-xl animate-pulse`} />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Music App</h1>
          </div>
          <ThemeSelector />
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? `bg-${theme.colors.primary.main} text-${theme.colors.text.primary} shadow-md`
                    : `hover:bg-${theme.colors.background.tertiary} hover:shadow-sm`
                }`
              }
            >
              <div className="flex items-center">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count !== null && (
                <span className={`text-xs px-2 py-1 rounded-full bg-${theme.colors.background.main} text-${theme.colors.text.muted} group-hover:bg-opacity-80 transition-all`}>
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`p-3 border-t border-${theme.colors.border} space-y-2`}>
          <button
            onClick={handleOpenFolder}
            className={`w-full flex items-center p-3 rounded-lg hover:bg-${theme.colors.background.tertiary} transition-all duration-200 group hover:shadow-sm`}
            title="Open Folder (Ctrl/Cmd + O)"
          >
            <FaFolder className="mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Open Folder</span>
          </button>

          <button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            className={`w-full flex items-center p-3 rounded-lg hover:bg-${theme.colors.background.tertiary} transition-all duration-200 group hover:shadow-sm`}
            title="Keyboard Shortcuts (Ctrl/Cmd + /)"
          >
            <FaKeyboard className="mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Shortcuts</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-${theme.colors.background.main} rounded-lg p-6 m-4 max-w-md w-full max-h-96 overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold text-${theme.colors.text.primary}`}>
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className={`text-${theme.colors.text.muted} hover:text-${theme.colors.text.primary} text-xl`}
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      Space
                    </kbd>
                    <span className="ml-2 text-sm">Play/Pause</span>
                  </div>
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      ←
                    </kbd>
                    <span className="ml-2 text-sm">Previous</span>
                  </div>
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      →
                    </kbd>
                    <span className="ml-2 text-sm">Next</span>
                  </div>
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      Ctrl+O
                    </kbd>
                    <span className="ml-2 text-sm">Open Folder</span>
                  </div>
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      Ctrl+/
                    </kbd>
                    <span className="ml-2 text-sm">Shortcuts</span>
                  </div>
                  <div>
                    <kbd className={`px-2 py-1 bg-${theme.colors.background.secondary} rounded text-sm`}>
                      M
                    </kbd>
                    <span className="ml-2 text-sm">Mute</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFileSelector && (
        <FileSelector onClose={() => setShowFileSelector(false)} />
      )}
    </>
  );
};
