import React, { useState, useEffect, useCallback } from "react";
import {
  FaWindowMinimize,
  FaWindowMaximize,
  FaWindowRestore,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../store/ThemeContext";

export const WindowControls = () => {
  const { theme } = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);

  // Check if we're running in Electron - this won't change during component lifecycle
  const isElectron = window.electron !== undefined;

  // Define handlers with useCallback to prevent unnecessary re-renders
  const handleMinimize = useCallback(() => {
    if (isElectron) {
      window.electron.window.minimize();
    }
  }, [isElectron]);

  const handleMaximize = useCallback(() => {
    if (isElectron) {
      window.electron.window.maximize();
    }
  }, [isElectron]);

  const handleClose = useCallback(() => {
    if (isElectron) {
      window.electron.window.close();
    }
  }, [isElectron]);

  // Set up event listeners for window state changes
  useEffect(() => {
    if (!isElectron) return;

    // Listen for window state changes
    const unsubscribeMaximize = window.electron.receive(
      "window:maximized",
      () => {
        setIsMaximized(true);
      }
    );

    const unsubscribeUnmaximize = window.electron.receive(
      "window:unmaximized",
      () => {
        setIsMaximized(false);
      }
    );

    // Cleanup listeners
    return () => {
      if (typeof unsubscribeMaximize === "function") unsubscribeMaximize();
      if (typeof unsubscribeUnmaximize === "function") unsubscribeUnmaximize();
    };
  }, [isElectron]);

  if (!isElectron) return null;

  return (
    <div className="flex items-center">
      <button
        onClick={handleMinimize}
        className={`p-2 hover:bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary}`}
        title="Minimize"
      >
        <FaWindowMinimize />
      </button>
      <button
        onClick={handleMaximize}
        className={`p-2 hover:bg-${theme.colors.background.tertiary} text-${theme.colors.text.secondary}`}
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <FaWindowRestore /> : <FaWindowMaximize />}
      </button>
      <button
        onClick={handleClose}
        className={`p-2 hover:bg-red-600 text-${theme.colors.text.secondary} hover:text-white`}
        title="Close"
      >
        <FaTimes />
      </button>
    </div>
  );
};
