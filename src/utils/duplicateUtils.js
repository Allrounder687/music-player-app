/**
 * Utility functions for duplicate detection and management
 */

/**
 * Formats file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "3.2 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Formats duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "3:45")
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '--:--';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculates similarity percentage between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity percentage (0-100)
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
};

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Normalizes a string for comparison (lowercase, trim, remove special chars)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export const normalizeString = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Gets quality score for a track based on various factors
 * @param {Object} track - Track object
 * @returns {number} Quality score
 */
export const getQualityScore = (track) => {
  let score = 0;
  
  // File size (larger usually means better quality)
  if (track.file?.size) {
    score += Math.min(track.file.size / (10 * 1024 * 1024), 10); // Max 10 points for 10MB+
  }
  
  // Bitrate
  if (track.bitrate) {
    score += Math.min(track.bitrate / 32, 10); // Max 10 points for 320kbps+
  }
  
  // Sample rate
  if (track.sampleRate) {
    score += Math.min(track.sampleRate / 4410, 10); // Max 10 points for 44.1kHz+
  }
  
  // Metadata completeness
  if (track.title && track.title !== 'Unknown Title') score += 2;
  if (track.artist && track.artist !== 'Unknown Artist') score += 2;
  if (track.album && track.album !== 'Unknown Album') score += 1;
  if (track.year) score += 1;
  if (track.genre) score += 1;
  
  // Album art
  if (track.imageUrl && !track.imageUrl.includes('placeholder')) score += 2;
  
  return score;
};