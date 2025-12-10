import React, { useState, useEffect, useCallback } from "react";
import {
  FaWindowMinimize,
  FaWindowMaximize,
  FaWindowRestore,
  FaTimes,
} from "react-icons/fa";

export const WindowControls = () => {
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

    // In development mode with Vite, window.electron might be defined but incomplete
    // Check if receive function exists and is a function
    if (!window.electron || typeof window.electron.receive !== "function") {
      console.warn(
        "window.electron.receive is not available. Window state changes will not be tracked."
      );
      return;
    }

    try {
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
        if (typeof unsubscribeUnmaximize === "function")
          unsubscribeUnmaximize();
      };
    } catch (error) {
      console.error("Error setting up window state listeners:", error);
    }
  }, [isElectron]);

  if (!isElectron) return null;

  return (
    <div className="flex items-center">
      {/* Minimize button - using CSS variables for theme compatibility */}
      <button
        onClick={handleMinimize}
        className="p-2 hover:bg-gray-700 transition-colors"
        style={{ color: "var(--text-secondary)" }}
        title="Minimize"
      >
        <FaWindowMinimize />
      </button>

      {/* Maximize/Restore button - using CSS variables for theme compatibility */}
      <button
        onClick={handleMaximize}
        className="p-2 hover:bg-gray-700 transition-colors"
        style={{ color: "var(--text-secondary)" }}
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <FaWindowRestore /> : <FaWindowMaximize />}
      </button>

      {/* Close button - always red on hover for consistency */}
      <button
        onClick={handleClose}
        className="p-2 hover:bg-red-600 hover:text-white transition-colors"
        style={{ color: "var(--text-secondary)" }}
        title="Close"
      >
        <FaTimes />
      </button>
    </div>
  );
};
