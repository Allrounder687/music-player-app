/**
 * Track validation utilities
 * Helps identify and clean up invalid tracks from the music library
 */

/**
 * Validates if a track has a valid audio source
 * @param {Object} track - The track to validate
 * @returns {Promise<boolean>} - True if track is valid, false otherwise
 */
export const validateTrack = async (track) => {
  if (!track) return false;

  // Check if track has required properties
  if (!track.id || !track.title) {
    console.warn('Track missing required properties:', track);
    return false;
  }

  // Check if track has a valid audio source
  const hasValidSource = 
    (track.file instanceof File) ||
    (track.previewUrl && (
      track.previewUrl.startsWith('http') ||
      track.previewUrl.startsWith('blob:') ||
      track.previewUrl.startsWith('/audio/')
    )) ||
    (track.path && await checkFileExists(track.path)) ||
    (track.filePath && await checkFileExists(track.filePath));

  if (!hasValidSource) {
    console.warn('Track has no valid audio source:', track);
    return false;
  }

  return true;
};

/**
 * Checks if a file exists (for Electron environment)
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - True if file exists
 */
const checkFileExists = async (filePath) => {
  if (!filePath || typeof filePath !== 'string') return false;

  // For web URLs, assume they exist (we can't check without CORS issues)
  if (filePath.startsWith('http') || filePath.startsWith('blob:')) {
    return true;
  }

  // For local files, check if we're in Electron and can access the file system
  if (window.electron?.fs) {
    try {
      const result = await window.electron.fs.exists(filePath);
      return result;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  // If not in Electron, we can't check file existence
  return false;
};

/**
 * Validates an array of tracks and returns only valid ones
 * @param {Array} tracks - Array of tracks to validate
 * @returns {Promise<Array>} - Array of valid tracks
 */
export const validateTracks = async (tracks) => {
  if (!Array.isArray(tracks)) return [];

  const validationPromises = tracks.map(async (track) => {
    const isValid = await validateTrack(track);
    return isValid ? track : null;
  });

  const results = await Promise.all(validationPromises);
  return results.filter(Boolean);
};

/**
 * Finds invalid tracks in a library
 * @param {Array} tracks - Array of tracks to check
 * @returns {Promise<Array>} - Array of invalid tracks
 */
export const findInvalidTracks = async (tracks) => {
  if (!Array.isArray(tracks)) return [];

  const validationPromises = tracks.map(async (track) => {
    const isValid = await validateTrack(track);
    return isValid ? null : track;
  });

  const results = await Promise.all(validationPromises);
  return results.filter(Boolean);
};

/**
 * Creates a cleaned version of track data for storage
 * Removes blob URLs and other temporary data that shouldn't be persisted
 * @param {Object} track - Track to clean
 * @returns {Object} - Cleaned track data
 */
export const cleanTrackForStorage = (track) => {
  if (!track) return null;

  const cleaned = { ...track };

  // Remove blob URLs as they're temporary
  if (cleaned.previewUrl && cleaned.previewUrl.startsWith('blob:')) {
    delete cleaned.previewUrl;
  }

  // Remove File objects as they can't be serialized
  if (cleaned.file instanceof File) {
    // Keep the file name for reference but remove the File object
    cleaned.fileName = cleaned.file.name;
    delete cleaned.file;
  }

  // Remove any other non-serializable properties
  delete cleaned.audioElement;
  delete cleaned.audioContext;

  return cleaned;
};

/**
 * Repairs a track by attempting to restore missing properties
 * @param {Object} track - Track to repair
 * @returns {Object} - Repaired track (or original if no repairs possible)
 */
export const repairTrack = (track) => {
  if (!track) return null;

  const repaired = { ...track };

  // If track has a fileName but no file, try to create a placeholder
  if (repaired.fileName && !repaired.file && !repaired.previewUrl && !repaired.path) {
    // We can't restore the actual file, but we can mark it as needing re-import
    repaired.needsReimport = true;
    repaired.originalFileName = repaired.fileName;
  }

  // Ensure required properties exist
  if (!repaired.id) {
    repaired.id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  if (!repaired.title && repaired.fileName) {
    repaired.title = repaired.fileName.replace(/\.(mp3|wav|ogg|m4a|flac)$/i, '');
  }

  if (!repaired.artist) {
    repaired.artist = 'Unknown Artist';
  }

  if (!repaired.album) {
    repaired.album = 'Unknown Album';
  }

  return repaired;
};

export default {
  validateTrack,
  validateTracks,
  findInvalidTracks,
  cleanTrackForStorage,
  repairTrack,
};