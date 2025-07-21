// Utility functions for file handling

/**
 * Generates a unique ID for tracks
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return `track-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Checks if a file is an audio file based on extension or MIME type
 * @param {File} file - The file to check
 * @returns {boolean} True if the file is an audio file
 */
export const isAudioFile = (file) => {
  // List of audio file extensions (without the dot)
  const audioExtensions = [
    "mp3",
    "wav",
    "ogg",
    "m4a",
    "flac",
    "aac",
    "wma",
    "mp4a",
    "m4p",
    "m4b",
  ];

  // Get the file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.split(".").pop();

  // Debug logging to help diagnose issues
  console.log(
    `Checking file: ${fileName}, extension: ${extension}, type: ${
      file.type || "unknown"
    }`
  );

  // First check by extension - this is the most reliable method
  if (audioExtensions.includes(extension)) {
    console.log(`File ${fileName} accepted by extension: ${extension}`);
    return true;
  }

  // Check by MIME type if available
  if (file.type && file.type.startsWith("audio/")) {
    console.log(`File ${fileName} accepted by MIME type: ${file.type}`);
    return true;
  }

  // Special case for M4A files which might have different MIME types
  if (
    extension === "m4a" ||
    file.type === "audio/mp4" ||
    file.type === "audio/x-m4a"
  ) {
    console.log(`Accepting M4A file: ${fileName}`);
    return true;
  }

  console.log(`File ${fileName} rejected as non-audio`);
  return false;
};

/**
 * Parses metadata from audio files
 * @param {File} file - The audio file
 * @returns {Promise<Object>} The parsed metadata
 */
export const parseAudioMetadata = async (file) => {
  // First check if it's an audio file
  if (!isAudioFile(file)) {
    console.log(`Skipping non-audio file: ${file.name}`);
    return null;
  }

  return new Promise((resolve) => {
    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);
    console.log(`Processing file: ${file.name}, URL: ${url}`);

    // Store the original file object to ensure it's accessible for playback
    const fileObject = file;

    // Create an audio element to get duration
    const audio = new Audio();

    // Set up event listeners before setting src
    audio.addEventListener("loadedmetadata", () => {
      console.log(
        `Metadata loaded for: ${file.name}, duration: ${audio.duration}`
      );

      // Basic metadata from filename
      const filename = file.name;
      const filenameParts = filename.split(".");
      filenameParts.pop(); // Remove extension
      const title = filenameParts.join("."); // Rejoin if there were multiple dots

      // Create track object
      const track = {
        id: generateId(),
        title: title,
        artist: "Unknown Artist", // Default values
        album: "Unknown Album",
        duration: audio.duration || 0, // Default to 0 if duration is NaN
        imageUrl: null,
        previewUrl: url, // Store the blob URL directly
        filePath: file.path || file.webkitRelativePath || file.name,
        fileType: file.type || `audio/${filename.split(".").pop()}`, // Fallback type based on extension
        fileSize: file.size,
        dateAdded: new Date().toISOString(),
        // Store the file object for direct access
        file: fileObject,
      };

      resolve(track);
    });

    // Handle errors
    audio.addEventListener("error", (e) => {
      console.error(`Error loading audio file: ${file.name}`, e.target.error);
      // Don't revoke the URL as we need it for playback
      // URL.revokeObjectURL(url);

      // Even if we can't load metadata, still create a basic track
      const filename = file.name;
      const filenameParts = filename.split(".");
      filenameParts.pop(); // Remove extension
      const title = filenameParts.join("."); // Rejoin if there were multiple dots

      // Create a basic track with default duration
      const track = {
        id: generateId(),
        title: title,
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: 0, // Default duration
        imageUrl: null,
        previewUrl: url, // Keep the URL for playback
        filePath: file.path || file.webkitRelativePath || file.name,
        fileType: file.type || `audio/${filename.split(".").pop()}`,
        fileSize: file.size,
        dateAdded: new Date().toISOString(),
        // Store the file object for direct access
        file: fileObject,
      };

      resolve(track);
    });

    // Set src after adding event listeners
    audio.src = url;

    // Set a timeout in case the audio element gets stuck
    const timeout = setTimeout(() => {
      console.warn(`Timeout loading metadata for: ${file.name}`);
      // Don't revoke the URL as we need it for playback
      // URL.revokeObjectURL(url);

      // Create a basic track with default values
      const filename = file.name;
      const filenameParts = filename.split(".");
      filenameParts.pop();
      const title = filenameParts.join(".");

      const track = {
        id: generateId(),
        title: title,
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: 0,
        imageUrl: null,
        previewUrl: url, // Keep the URL for playback
        filePath: file.path || file.webkitRelativePath || file.name,
        fileType: file.type || `audio/${filename.split(".").pop()}`,
        fileSize: file.size,
        dateAdded: new Date().toISOString(),
        // Store the file object for direct access
        file: fileObject,
      };

      resolve(track);
    }, 5000); // 5 second timeout

    // Clear timeout when metadata is loaded
    audio.addEventListener("loadedmetadata", () => {
      clearTimeout(timeout);
    });

    // Load the audio
    audio.load();
  });
};

/**
 * Imports audio files from a folder
 * @param {FileList|File[]} files - The files to import
 * @returns {Promise<Array>} Array of parsed track objects
 */
export const importAudioFiles = async (files) => {
  if (!files || files.length === 0) {
    console.log("No files provided to importAudioFiles");
    return [];
  }

  console.log(`Processing ${files.length} files`);

  // Convert FileList to Array if needed
  const fileArray = Array.from(files);

  // Filter for audio files using our helper function
  const audioFiles = fileArray.filter(isAudioFile);

  console.log(
    `Found ${audioFiles.length} audio files out of ${fileArray.length} total files`
  );

  if (audioFiles.length === 0) {
    return [];
  }

  // Process each file
  const trackPromises = audioFiles.map((file) => parseAudioMetadata(file));
  const tracks = await Promise.all(trackPromises);

  // Filter out any null results
  const validTracks = tracks.filter((track) => track !== null);
  console.log(`Successfully processed ${validTracks.length} audio tracks`);

  return validTracks;
};

/**
 * Opens a folder picker dialog and imports audio files
 * @returns {Promise<Array>} Array of parsed track objects
 */
export const importFolderDialog = async () => {
  try {
    console.log("Starting folder import dialog");

    // Always use the simple input method which is more reliable
    console.log("Using file input method for folder selection");

    // Create an input element
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true; // This is the key attribute for folder selection
    input.directory = true; // For Firefox
    input.multiple = true;

    // Don't set accept attribute as it can be too restrictive
    // input.accept = "audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.wma";

    // Wait for the user to select files
    const files = await new Promise((resolve) => {
      input.onchange = (e) => {
        console.log(
          `Selected ${e.target.files.length} files via input element`
        );
        resolve(e.target.files);
      };
      input.click();
    });

    if (!files || files.length === 0) {
      console.log("No files selected");
      return [];
    }

    console.log(`User selected ${files.length} files from folder`);

    // Process all files with extensions that match audio files
    const potentialAudioFiles = Array.from(files).filter((file) => {
      const ext = file.name.toLowerCase().split(".").pop();
      return ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"].includes(ext);
    });

    console.log(
      `Found ${potentialAudioFiles.length} potential audio files by extension`
    );

    // Process these files directly without additional filtering
    const trackPromises = potentialAudioFiles.map((file) => {
      console.log(`Processing file by extension: ${file.name}`);
      return parseAudioMetadata(file);
    });

    const tracks = await Promise.all(trackPromises);
    const validTracks = tracks.filter((track) => track !== null);

    console.log(`Successfully processed ${validTracks.length} audio tracks`);
    return validTracks;
  } catch (error) {
    console.error("Error importing folder:", error);
    return [];
  }
};

/**
 * Opens a file picker dialog and imports audio files
 * @param {boolean} multiple - Whether to allow multiple file selection
 * @returns {Promise<Array>} Array of parsed track objects
 */
export const importFilesDialog = async (multiple = true) => {
  try {
    // Check if the File System Access API is available
    if ("showOpenFilePicker" in window) {
      const fileHandles = await window.showOpenFilePicker({
        multiple,
        types: [
          {
            description: "Audio Files",
            accept: {
              "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
            },
          },
        ],
      });

      const files = await Promise.all(
        fileHandles.map((handle) => handle.getFile())
      );
      return await importAudioFiles(files);
    } else {
      // Fallback for browsers that don't support the File System Access API
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = multiple;
      input.accept = "audio/*,.mp3,.wav,.ogg,.m4a,.flac";

      // Wait for the user to select files
      const files = await new Promise((resolve) => {
        input.onchange = (e) => resolve(e.target.files);
        input.click();
      });

      return await importAudioFiles(files);
    }
  } catch (error) {
    console.error("Error importing files:", error);
    return [];
  }
};
