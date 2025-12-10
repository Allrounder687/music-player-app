/**
 * Utility functions for audio handling
 */

/**
 * Creates a blob URL for a local file path
 * This is needed because the audio element can't directly play local file paths
 * @param {string} filePath - Path to the local audio file or blob URL
 * @returns {Promise<string>} - Blob URL that can be used in an audio element
 */
export const createAudioUrl = async (filePath) => {
  // Handle web URLs directly
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://") ||
    filePath.startsWith("blob:")
  ) {
    return filePath;
  }

  // Handle relative paths for sample files
  if (filePath.startsWith("/")) {
    // For development server, ensure the path is correct
    // Remove any leading slash to make it relative to the base URL
    const path = filePath.startsWith("/") ? filePath.substring(1) : filePath;
    console.log(`Using relative path: ${path}`);

    // For sample audio files or any other relative paths, use the full URL
    const fullUrl = window.location.origin + "/" + path;
    console.log(`Using full URL for relative path: ${fullUrl}`);
    return fullUrl;
  }

  // If we're in a browser and this is a File object from the File API
  if (typeof filePath === "object" && filePath instanceof File) {
    console.log(`Creating blob URL for File object: ${filePath.name}`);
    try {
      const blobUrl = URL.createObjectURL(filePath);
      console.log(`Created blob URL for file: ${blobUrl}`);
      return blobUrl;
    } catch (error) {
      console.error(
        `Error creating blob URL for file: ${filePath.name}`,
        error
      );
      // If we can't create a blob URL, try to use the file directly
      if (filePath.path) {
        return filePath.path;
      }
      throw error;
    }
  }

  // Check if we're in Electron
  if (!window.electron?.audio) {
    console.warn("Not running in Electron or audio API not available");

    // If the path looks like it might be a blob URL that was stored as a string
    if (typeof filePath === "string" && filePath.includes("previewUrl")) {
      try {
        // Try to parse it as JSON to extract the previewUrl
        const trackData = JSON.parse(filePath);
        if (trackData && trackData.previewUrl) {
          console.log(
            `Extracted previewUrl from JSON string: ${trackData.previewUrl}`
          );
          return trackData.previewUrl;
        }
      } catch (e) {
        // Not JSON, continue with normal processing
      }
    }

    return filePath; // Return the original path as fallback
  }

  try {
    console.log(`Creating audio URL for: ${filePath}`);

    // Use the IPC bridge to read the file
    const result = await window.electron.audio.readFile(filePath);

    if (!result.success) {
      console.error("Failed to read audio file:", result.error);
      return filePath;
    }

    console.log(
      `Successfully read file data, size: ${result.data.length} chars`
    );

    try {
      // Create a blob URL from the base64 data
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      const blobUrl = URL.createObjectURL(blob);

      console.log(`Created blob URL: ${blobUrl}`);
      return blobUrl;
    } catch (blobError) {
      console.error("Error creating blob:", blobError);
      return filePath;
    }
  } catch (error) {
    console.error("Error creating audio URL:", error);
    return filePath; // Return the original path as fallback
  }
};

/**
 * Extracts metadata from an audio file
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<Object>} - Object containing metadata
 */
export const extractMetadata = async (filePath) => {
  // Check if we're in Electron
  if (!window.electron?.audio) {
    // Fallback for non-Electron environments
    const fileName = filePath.split("/").pop().split("\\").pop();
    const title = fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, "");

    return {
      title,
      artist: "Unknown Artist",
      album: "Unknown Album",
      duration: 180, // Default duration in seconds
    };
  }

  try {
    // Use the IPC bridge to get metadata
    const result = await window.electron.audio.getMetadata(filePath);

    if (!result.success) {
      console.error("Failed to get audio metadata:", result.error);
      // Fallback to basic metadata
      const fileName = filePath.split("/").pop().split("\\").pop();
      const title = fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, "");

      return {
        title,
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: 180, // Default duration in seconds
      };
    }

    return result.metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);

    // Fallback to basic metadata
    const fileName = filePath.split("/").pop().split("\\").pop();
    const title = fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, "");

    return {
      title,
      artist: "Unknown Artist",
      album: "Unknown Album",
      duration: 180, // Default duration in seconds
    };
  }
};

/**
 * Formats time in seconds to a human-readable string (MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

/**
 * Generates a placeholder image for tracks without album art
 * @param {string} title - Track title
 * @returns {string} - URL to a placeholder image
 */
export const generatePlaceholderImage = (title) => {
  // In a real app, you might generate a colorful placeholder based on the title
  // For now, we'll just return a static placeholder
  return "/images/album-placeholder.svg";
};
