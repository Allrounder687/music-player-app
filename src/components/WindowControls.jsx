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
  const isElectron =
    typeof window !== "undefined" && window.electron !== undefined;

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

  // Use inline styles for better theme compatibility
  const buttonBaseStyle = {
    width: "40px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-secondary)",
    backgroundColor: "transparent",
    transition: "background-color 0.2s ease, color 0.2s ease",
    border: "none",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="flex items-center">
      {/* Minimize button */}
      <button
        onClick={handleMinimize}
        style={buttonBaseStyle}
        className="hover:bg-gray-700"
        title="Minimize"
      >
        <FaWindowMinimize />
      </button>

      {/* Maximize/Restore button */}
      <button
        onClick={handleMaximize}
        style={buttonBaseStyle}
        className="hover:bg-gray-700"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <FaWindowRestore /> : <FaWindowMaximize />}
      </button>

      {/* Close button - always red on hover */}
      <button
        onClick={handleClose}
        style={buttonBaseStyle}
        className="hover:bg-red-600 hover:text-white"
        title="Close"
      >
        <FaTimes />
      </button>
    </div>
  );
};
