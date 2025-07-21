import React from "react";
import { useTheme } from "../store/ThemeContext";
import { ImportMusic } from "./ImportMusic";

export const FileSelector = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ImportMusic onClose={onClose} />
    </div>
  );
};
