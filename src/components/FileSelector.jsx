import React, { useState } from "react";
import { FaFolder, FaMusic, FaPlay, FaSpinner } from "react-icons/fa";
import { useMusic } from "../store/MusicContext";
import { useTheme } from "../store/ThemeContext";
import { extractMetadata, generatePlaceholderImage } from "../utils/audioUtils";

export const FileSelector = ({ onClose }) => {
  const { setQueue } = useMusic();
  const { theme } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleAddToQueue = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);

    try {
      // Find all selected files across all folders
      const selectedFilesData = [];
      folders.forEach((folder) => {
        folder.children.forEach((file) => {
          if (selectedFiles.includes(file.id)) {
            selectedFilesData.push({
              id: file.id,
              file: file,
              folder: folder.name,
            });
          }
        });
      });

      // Process files one by one to extract metadata
      const selectedSongs = [];

      for (const item of selectedFilesData) {
        try {
          // Extract metadata from the file
          const metadata = await extractMetadata(item.file.path);

          selectedSongs.push({
            id: item.id,
            title:
              metadata.title ||
              item.file.name.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
            artist: metadata.artist || "Unknown Artist",
            album: metadata.album || item.folder,
            duration: metadata.duration || 180, // Default duration
            imageUrl: metadata.imageUrl || "/images/album-placeholder.svg",
            path: item.file.path,
            previewUrl: item.file.path,
          });
        } catch (error) {
          console.warn(
            `Could not extract metadata for ${item.file.name}:`,
            error
          );

          // Add a basic version of the file
          selectedSongs.push({
            id: item.id,
            title: item.file.name.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
            artist: "Unknown Artist",
            album: item.folder,
            duration: 180, // Default duration
            imageUrl: "/images/album-placeholder.svg",
            path: item.file.path,
            previewUrl: item.file.path,
          });
        }
      }

      console.log("Adding songs to queue:", selectedSongs);

      if (selectedSongs.length > 0) {
        // Add selected songs to queue
        setQueue(selectedSongs, true);
        onClose();
      } else {
        alert("No valid audio files were selected.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing selected files:", error);
      alert("An error occurred while processing the selected files.");
      setIsLoading(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      // Check if we're running in Electron
      if (window.electron?.fs?.openDialog) {
        setIsLoading(true);

        try {
          // Show the file dialog with proper options
          const result = await window.electron.fs.openDialog({
            title: "Select Audio Files",
            defaultPath: "", // Use default music folder
            buttonLabel: "Select Files",
            properties: ["openFile", "multiSelections"],
            filters: [
              {
                name: "Audio Files",
                extensions: ["mp3", "wav", "ogg", "m4a", "flac"],
              },
              { name: "All Files", extensions: ["*"] },
            ],
          });

          // Process the selected files
          if (result && result.files && result.files.length > 0) {
            // Create a folder name based on the parent directory of the first file
            const firstFilePath = result.files[0].path;
            const pathParts = firstFilePath.split(/[\/\\]/);
            const parentFolder =
              pathParts[pathParts.length - 2] || "Selected Files";

            // Create a new folder with the selected files
            const newFolder = {
              id: `folder-${Date.now()}`,
              name: parentFolder,
              type: "folder",
              children: result.files.map((file, index) => ({
                id: `file-${Date.now()}-${index}`,
                name: file.name,
                type: "file",
                path: file.path,
                size: file.size,
                lastModified: file.lastModified,
              })),
            };

            // Add the new folder to the list
            setFolders((prev) => [...prev, newFolder]);

            // Expand the new folder
            setExpandedFolders((prev) => ({
              ...prev,
              [newFolder.id]: true,
            }));

            // Select all the new files
            setSelectedFiles(newFolder.children.map((file) => file.id));

            // Don't immediately play the files, just show them in the UI
            setIsLoading(false);
          } else {
            // User canceled the dialog
            setIsLoading(false);
          }
        } catch (dialogError) {
          console.error("Error opening dialog:", dialogError);
          setIsLoading(false);

          // Show a more user-friendly error
          const errorMessage = dialogError.message || "Unknown error";
          const friendlyMessage = errorMessage.includes("ENOENT")
            ? "Could not access the file system. Please check your permissions."
            : `Error opening file dialog: ${errorMessage}`;

          alert(friendlyMessage);
        }
      } else {
        // Fallback for web or when not running in Electron
        alert(
          "This feature requires the desktop app. File selection is not available in the web version."
        );
      }
    } catch (error) {
      console.error("Error in file selection:", error);
      setIsLoading(false);
      alert("An unexpected error occurred while selecting files.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50">
      <div
        className={`max-w-2xl mx-auto mt-20 bg-${
          theme?.colors?.background?.main || "gray-800"
        } rounded-lg shadow-xl`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b border-${
            theme?.colors?.border?.main || "gray-700"
          }`}
        >
          <h2
            className={`text-xl font-semibold text-${
              theme?.colors?.text?.main || "white"
            }`}
          >
            Select Audio Files
          </h2>
          <button
            onClick={onClose}
            className={`text-${
              theme?.colors?.text?.muted || "gray-400"
            } hover:text-${theme?.colors?.text?.main || "white"}`}
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleOpenFolder}
            disabled={isLoading}
            className={`mb-4 flex items-center px-4 py-2 bg-${
              theme?.colors?.primary?.main || "purple-600"
            } hover:bg-${
              theme?.colors?.primary?.dark || "purple-700"
            } text-white rounded`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <FaFolder className="mr-2" />
                Select Audio Files
              </>
            )}
          </button>

          {folders.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`mb-4 border border-${
                    theme?.colors?.border?.main || "gray-700"
                  } rounded p-2 bg-${
                    theme?.colors?.background?.secondary || "gray-700"
                  }`}
                >
                  <div
                    className={`flex items-center cursor-pointer p-2 hover:bg-${
                      theme?.colors?.background?.hover || "gray-600"
                    }`}
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <span className="mr-2 text-xs">
                      {expandedFolders[folder.id] ? "▼" : "►"}
                    </span>
                    <FaFolder
                      className={`mr-2 text-${
                        theme?.colors?.text?.muted || "gray-500"
                      }`}
                    />
                    <span
                      className={`text-${theme?.colors?.text?.main || "white"}`}
                    >
                      {folder.name} ({folder.children.length} files)
                    </span>
                  </div>

                  {expandedFolders[folder.id] && (
                    <div className="pl-8">
                      {folder.children.map((file) => (
                        <div
                          key={file.id}
                          className={`flex justify-between items-center p-2 my-1 rounded cursor-pointer ${
                            selectedFiles.includes(file.id)
                              ? `bg-${
                                  theme?.colors?.primary?.light || "purple-500"
                                } bg-opacity-20`
                              : `hover:bg-${
                                  theme?.colors?.background?.hover || "gray-600"
                                }`
                          }`}
                        >
                          <div className="flex items-center">
                            <FaMusic
                              className={`mr-2 text-${
                                theme?.colors?.text?.muted || "gray-500"
                              }`}
                            />
                            <span
                              className={`text-${
                                theme?.colors?.text?.main || "white"
                              }`}
                            >
                              {file.name}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Play this single file immediately
                                const song = {
                                  id: file.id,
                                  title: file.name.replace(
                                    /\.(mp3|wav|ogg|m4a|flac)$/i,
                                    ""
                                  ),
                                  artist: "Unknown Artist",
                                  album: folder.name,
                                  duration: 180,
                                  imageUrl: "/images/album-placeholder.svg",
                                  path: file.path,
                                  previewUrl: file.path,
                                };

                                setQueue([song], true);
                                onClose();
                              }}
                              className={`mr-2 p-1 rounded-full bg-${
                                theme?.colors?.primary?.main || "purple-600"
                              } hover:bg-${
                                theme?.colors?.primary?.dark || "purple-700"
                              } text-white`}
                              title="Play now"
                            >
                              <FaPlay className="h-3 w-3" />
                            </button>

                            <input
                              type="checkbox"
                              className="ml-2 form-checkbox"
                              checked={selectedFiles.includes(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {folders.length === 0 && (
            <div
              className={`p-8 text-center text-${
                theme?.colors?.text?.muted || "gray-500"
              }`}
            >
              <FaMusic className="mx-auto h-12 w-12 opacity-50" />
              <p className="text-sm mt-2">
                Click "Select Audio Files" to browse your music
              </p>
            </div>
          )}
        </div>

        <div
          className={`flex justify-between items-center p-4 border-t border-${
            theme?.colors?.border?.main || "gray-700"
          }`}
        >
          <div>
            <span
              className={`text-sm text-${
                theme?.colors?.text?.muted || "gray-400"
              }`}
            >
              {selectedFiles.length} files selected
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 bg-${
                theme?.colors?.background?.tertiary || "gray-600"
              } hover:bg-${
                theme?.colors?.background?.hover || "gray-500"
              } rounded text-${theme?.colors?.text?.main || "white"}`}
            >
              Cancel
            </button>

            <button
              onClick={handleAddToQueue}
              disabled={selectedFiles.length === 0 || isLoading}
              className={`px-4 py-2 rounded flex items-center ${
                selectedFiles.length === 0 || isLoading
                  ? `bg-${
                      theme?.colors?.background?.tertiary || "gray-600"
                    } cursor-not-allowed text-${
                      theme?.colors?.text?.muted || "gray-400"
                    }`
                  : `bg-${
                      theme?.colors?.primary?.main || "purple-600"
                    } hover:bg-${
                      theme?.colors?.primary?.dark || "purple-700"
                    } text-white`
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  Play Selected
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
