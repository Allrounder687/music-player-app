/**
 * Library cleanup service
 * Handles cleaning up invalid tracks and maintaining library health
 */

import { validateTracks, findInvalidTracks, cleanTrackForStorage } from '../utils/trackValidator.js';
import { ErrorHandler } from '../utils/errorHandler.js';

export class LibraryCleanupService {
  static isCleanupInProgress = false;
  static cleanupCallbacks = new Set();

  /**
   * Register a callback to be called when cleanup operations occur
   * @param {Function} callback - Function to call with cleanup results
   */
  static onCleanup(callback) {
    this.cleanupCallbacks.add(callback);
    return () => this.cleanupCallbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks about cleanup results
   * @private
   */
  static notifyCleanup(results) {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        ErrorHandler.logError(error, 'LibraryCleanupService.notifyCleanup');
      }
    });
  }

  /**
   * Validates all tracks in the library and removes invalid ones
   * @param {Array} tracks - Array of tracks to validate
   * @returns {Promise<Object>} - Cleanup results
   */
  static async cleanupLibrary(tracks) {
    if (this.isCleanupInProgress) {
      console.log('Cleanup already in progress, skipping...');
      return { valid: tracks, invalid: [], removed: 0 };
    }

    try {
      this.isCleanupInProgress = true;
      console.log(`Starting library cleanup for ${tracks.length} tracks...`);

      // Find invalid tracks
      const invalidTracks = await findInvalidTracks(tracks);
      const validTracks = await validateTracks(tracks);

      const results = {
        valid: validTracks,
        invalid: invalidTracks,
        removed: invalidTracks.length,
        total: tracks.length,
      };

      console.log(`Library cleanup completed:`, results);

      // Notify callbacks
      this.notifyCleanup(results);

      // Show user notification if any tracks were removed
      if (invalidTracks.length > 0) {
        this.showCleanupNotification(results);
      }

      return results;
    } catch (error) {
      ErrorHandler.logError(error, 'LibraryCleanupService.cleanupLibrary');
      return { valid: tracks, invalid: [], removed: 0, error: error.message };
    } finally {
      this.isCleanupInProgress = false;
    }
  }

  /**
   * Removes a specific invalid track
   * @param {Array} tracks - Current tracks array
   * @param {string} trackId - ID of track to remove
   * @returns {Array} - Updated tracks array
   */
  static removeInvalidTrack(tracks, trackId) {
    const trackToRemove = tracks.find(track => track.id === trackId);
    
    if (trackToRemove) {
      console.log(`Removing invalid track: ${trackToRemove.title}`);
      
      // Revoke blob URL if it exists
      if (trackToRemove.previewUrl && trackToRemove.previewUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(trackToRemove.previewUrl);
        } catch (error) {
          console.error('Error revoking blob URL:', error);
        }
      }

      const updatedTracks = tracks.filter(track => track.id !== trackId);
      
      // Notify about the removal
      this.notifyCleanup({
        valid: updatedTracks,
        invalid: [trackToRemove],
        removed: 1,
        total: tracks.length,
      });

      return updatedTracks;
    }

    return tracks;
  }

  /**
   * Cleans track data for storage (removes temporary/non-serializable data)
   * @param {Array} tracks - Tracks to clean
   * @returns {Array} - Cleaned tracks
   */
  static cleanTracksForStorage(tracks) {
    return tracks.map(cleanTrackForStorage).filter(Boolean);
  }

  /**
   * Shows a notification to the user about cleanup results
   * @private
   */
  static showCleanupNotification(results) {
    const { removed, invalid } = results;
    
    if (removed === 0) return;

    const message = removed === 1 
      ? `Removed 1 invalid track: "${invalid[0]?.title || 'Unknown'}"`
      : `Removed ${removed} invalid tracks from your library`;

    // Try to show system notification if available
    if (window.electron?.showNotification) {
      window.electron.showNotification({
        title: 'Library Cleanup',
        body: message,
        type: 'info'
      });
    } else {
      // Fallback to console log
      console.log(`Library Cleanup: ${message}`);
    }

    // You could also dispatch a custom event for UI components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('libraryCleanup', {
        detail: results
      }));
    }
  }

  /**
   * Performs a quick health check on the library
   * @param {Array} tracks - Tracks to check
   * @returns {Object} - Health check results
   */
  static async healthCheck(tracks) {
    try {
      const totalTracks = tracks.length;
      const tracksWithFiles = tracks.filter(track => 
        track.file instanceof File || 
        (track.previewUrl && track.previewUrl.startsWith('blob:'))
      ).length;
      
      const tracksWithPaths = tracks.filter(track => 
        track.path || track.filePath
      ).length;
      
      const tracksWithUrls = tracks.filter(track => 
        track.previewUrl && (
          track.previewUrl.startsWith('http') || 
          track.previewUrl.startsWith('/audio/')
        )
      ).length;

      const tracksWithoutSource = tracks.filter(track => 
        !track.file && 
        !track.previewUrl && 
        !track.path && 
        !track.filePath
      ).length;

      return {
        total: totalTracks,
        withFiles: tracksWithFiles,
        withPaths: tracksWithPaths,
        withUrls: tracksWithUrls,
        withoutSource: tracksWithoutSource,
        healthScore: totalTracks > 0 ? ((totalTracks - tracksWithoutSource) / totalTracks) * 100 : 100,
      };
    } catch (error) {
      ErrorHandler.logError(error, 'LibraryCleanupService.healthCheck');
      return { error: error.message };
    }
  }
}

export default LibraryCleanupService;