import React, { useState } from "react";
import {
  FaFolder,
  FaFile,
  FaPlus,
  FaCheck,
  FaSpinner,
  FaPlay,
} from "react-icons/fa";
import { useMusic } from "../store/MusicContext";
import { importFolderDialog, importFilesDialog } from "../utils/fileUtils";
import { useTheme } from "../store/ThemeContext";

export const ImportMusic = ({ onClose }) => {
  const { setQueue } = useMusic();
  const { theme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const [importedTracks, setImportedTracks] = useState([]);
  const [importStatus, setImportStatus] = useState("");

  const handleImportFolder = async () => {
    setIsImporting(true);
    setImportStatus("Selecting folder...");

    try {
      setImportStatus(
        "Scanning folder for audio files (MP3, WAV, OGG, M4A, FLAC)..."
      );

      // Add a listener to window.console.log to capture logs
      const originalConsoleLog = console.log;
      const logs = [];

      console.log = function (...args) {
        logs.push(args.join(" "));
        originalConsoleLog.apply(console, args);

        // Update status with file scanning info
        if (args[0] && typeof args[0] === "string") {
          const msg = args[0];
          if (
            msg.includes("Processing file:") ||
            msg.includes("Found") ||
            msg.includes("Selected")
          ) {
            setImportStatus(`Scanning: ${logs.length} files examined...`);
          }
        }
      };

      const tracks = await importFolderDialog();

      // Restore original console.log
      console.log = originalConsoleLog;

      if (tracks.length > 0) {
        setImportedTracks(tracks);
        setImportStatus(`Processing ${tracks.length} audio files...`);

        // Add to library but don't autoplay
        setQueue(tracks, false);

        setImportStatus(`Successfully imported ${tracks.length} tracks`);
      } else {
        // Provide more detailed error message
        setImportStatus(
          `No audio files found in the selected folder. We looked through ${logs.length} files but none were recognized as audio files. Make sure the folder contains MP3, WAV, OGG, M4A, or FLAC files.`
        );
      }
    } catch (error) {
      console.error("Error importing folder:", error);
      setImportStatus(
        `Error importing folder: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFiles = async () => {
    setIsImporting(true);
    setImportStatus("Selecting files...");

    try {
      const tracks = await importFilesDialog(true);

      if (tracks.length > 0) {
        setImportedTracks(tracks);
        setImportStatus(`Processing ${tracks.length} audio files...`);

        // Add to library but don't autoplay
        setQueue(tracks, false);

        setImportStatus(`Successfully imported ${tracks.length} tracks`);
      } else {
        setImportStatus(
          "No audio files selected. Please select MP3, WAV, OGG, M4A, or FLAC files."
        );
      }
    } catch (error) {
      console.error("Error importing files:", error);
      setImportStatus(
        `Error importing files: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handlePlayImported = () => {
    if (importedTracks.length > 0) {
      setQueue(importedTracks, true); // Play the imported tracks
      if (onClose) onClose();
    }
  };

  return (
    <div
      className={`bg-${
        theme?.colors?.background?.secondary || "gray-800"
      } rounded-xl p-6 w-full max-w-md`}
    >
      <h2
        className={`text-2xl font-bold mb-6 text-${
          theme?.colors?.text?.main || "white"
        }`}
      >
        Import Music
      </h2>

      <div className="space-y-4 mb-6">
        <button
          onClick={handleImportFolder}
          disabled={isImporting}
          className={`w-full flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-${
            theme?.colors?.border?.main || "gray-600"
          } hover:border-${
            theme?.colors?.primary?.main || "purple-500"
          } transition-colors`}
        >
          <div className="flex flex-col items-center">
            {isImporting ? (
              <FaSpinner
                className={`text-3xl text-${
                  theme?.colors?.primary?.main || "purple-500"
                } animate-spin mb-2`}
              />
            ) : (
              <FaFolder
                className={`text-3xl text-${
                  theme?.colors?.primary?.main || "purple-500"
                } mb-2`}
              />
            )}
            <span
              className={`text-${
                theme?.colors?.text?.main || "white"
              } font-medium`}
            >
              Import Folder
            </span>
            <span
              className={`text-sm text-${
                theme?.colors?.text?.muted || "gray-400"
              } mt-1`}
            >
              Import all audio files from a folder
            </span>
          </div>
        </button>

        <button
          onClick={handleImportFiles}
          disabled={isImporting}
          className={`w-full flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-${
            theme?.colors?.border?.main || "gray-600"
          } hover:border-${
            theme?.colors?.primary?.main || "purple-500"
          } transition-colors`}
        >
          <div className="flex flex-col items-center">
            {isImporting ? (
              <FaSpinner
                className={`text-3xl text-${
                  theme?.colors?.primary?.main || "purple-500"
                } animate-spin mb-2`}
              />
            ) : (
              <FaFile
                className={`text-3xl text-${
                  theme?.colors?.primary?.main || "purple-500"
                } mb-2`}
              />
            )}
            <span
              className={`text-${
                theme?.colors?.text?.main || "white"
              } font-medium`}
            >
              Import Files
            </span>
            <span
              className={`text-sm text-${
                theme?.colors?.text?.muted || "gray-400"
              } mt-1`}
            >
              Select specific audio files to import
            </span>
          </div>
        </button>
      </div>

      {importStatus && (
        <div
          className={`mb-6 p-3 rounded-lg ${
            importStatus.includes("Error")
              ? "bg-red-900/20 text-red-400"
              : importStatus.includes("Successfully")
              ? "bg-green-900/20 text-green-400"
              : "bg-blue-900/20 text-blue-400"
          }`}
        >
          <p className="text-sm">{importStatus}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className={`px-4 py-2 text-sm font-medium text-${
            theme?.colors?.text?.muted || "gray-300"
          } hover:text-${theme?.colors?.text?.main || "white"}`}
        >
          Close
        </button>

        {importedTracks.length > 0 && (
          <button
            onClick={handlePlayImported}
            className={`bg-${
              theme?.colors?.primary?.main || "purple-600"
            } hover:bg-${
              theme?.colors?.primary?.dark || "purple-700"
            } text-white px-6 py-2 rounded-full text-sm font-medium flex items-center transition-colors`}
          >
            <FaPlay className="mr-2" /> Play Imported
          </button>
        )}
      </div>
    </div>
  );
};
