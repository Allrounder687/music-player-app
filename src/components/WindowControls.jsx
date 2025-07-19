import React, { useState, useEffect } from "react";
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

  // Check if we're running in Electron
  const isElectron = window.electron !== undefined;

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
      if (unsubscribeMaximize) unsubscribeMaximize();
      if (unsubscribeUnmaximize) unsubscribeUnmaximize();
    };
  }, [isElectron]);

  const handleMinimize = () => {
    if (isElectron) {
      window.electron.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (isElectron) {
      window.electron.window.maximize();
    }
  };

  const handleClose = () => {
    if (isElectron) {
      window.electron.window.close();
    }
  };

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
