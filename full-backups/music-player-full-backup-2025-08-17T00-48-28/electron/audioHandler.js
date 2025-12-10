const { ipcMain } = require("electron");
const fs = require("fs").promises;
const path = require("path");
// Import music-metadata with CommonJS syntax for compatibility with Electron
const mm = require("music-metadata/lib/core");

/**
 * Register audio-related IPC handlers
 */
function registerAudioHandlers() {
  // Handle reading audio file data
  ipcMain.handle("audio:readFile", async (event, filePath) => {
    try {
      console.log(`Reading audio file: ${filePath}`);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (accessError) {
        console.error(`File does not exist or is not accessible: ${filePath}`);
        return {
          success: false,
          error: `File not accessible: ${accessError.message}`,
        };
      }

      // Read the file as a buffer
      const buffer = await fs.readFile(filePath);

      console.log(
        `Successfully read file: ${filePath}, size: ${buffer.length} bytes`
      );

      // Return the buffer as a base64 string
      return {
        success: true,
        data: buffer.toString("base64"),
        mimeType: getMimeType(filePath),
        size: buffer.length,
      };
    } catch (error) {
      console.error(`Error reading audio file: ${filePath}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Handle getting audio metadata
  ipcMain.handle("audio:getMetadata", async (event, filePath) => {
    try {
      console.log(`Getting metadata for: ${filePath}`);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (accessError) {
        console.error(`File does not exist or is not accessible: ${filePath}`);
        return {
          success: false,
          error: `File not accessible: ${accessError.message}`,
        };
      }

      // Get file stats
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);

      try {
        // Use music-metadata to extract metadata
        const metadata = await mm.parseFile(filePath);
        console.log(`Successfully parsed metadata for: ${filePath}`);

        // Extract cover art if available
        let coverArt = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          const base64Data = picture.data.toString("base64");
          coverArt = `data:${picture.format};base64,${base64Data}`;
          console.log(`Extracted cover art for: ${filePath}`);
        }

        return {
          success: true,
          metadata: {
            title:
              metadata.common.title ||
              fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
            artist: metadata.common.artist || "Unknown Artist",
            album: metadata.common.album || "Unknown Album",
            genre: metadata.common.genre ? metadata.common.genre[0] : undefined,
            year: metadata.common.year,
            duration: metadata.format.duration || 0,
            size: stats.size,
            lastModified: stats.mtime,
            path: filePath,
            coverArt: coverArt,
          },
        };
      } catch (metadataError) {
        console.error(`Error parsing metadata: ${metadataError.message}`);

        // Fallback to basic metadata
        return {
          success: true,
          metadata: {
            title: fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, ""),
            artist: "Unknown Artist",
            album: "Unknown Album",
            duration: 180, // Default duration in seconds
            size: stats.size,
            lastModified: stats.mtime,
            path: filePath,
          },
        };
      }
    } catch (error) {
      console.error(`Error getting audio metadata: ${filePath}`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

/**
 * Get the MIME type for an audio file based on its extension
 * @param {string} filePath - Path to the audio file
 * @returns {string} - MIME type
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".m4a":
      return "audio/m4a";
    case ".flac":
      return "audio/flac";
    default:
      return "audio/mpeg"; // Default to MP3
  }
}

module.exports = {
  registerAudioHandlers,
};
