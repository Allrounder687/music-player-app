/**
 * yt-dlp Service
 * 
 * This service provides functions for interacting with yt-dlp through the Electron IPC bridge.
 */

/**
 * Ensure yt-dlp is installed
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
export async function ensureYtDlp() {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.ensure();
}

/**
 * Get video information
 * @param {string} url Video URL
 * @returns {Promise<{success: boolean, info?: Object, error?: string}>}
 */
export async function getVideoInfo(url) {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.getVideoInfo(url);
}

/**
 * Get available formats for a video
 * @param {string} url Video URL
 * @returns {Promise<{success: boolean, formats?: Array, error?: string}>}
 */
export async function getFormats(url) {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.getFormats(url);
}

/**
 * Download a video
 * @param {string} url Video URL
 * @param {string} outputDir Output directory
 * @param {string} format Format code (optional)
 * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
 */
export async function downloadVideo(url, outputDir, format = null) {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.downloadVideo(url, outputDir, format);
}

/**
 * Extract audio from a video
 * @param {string} url Video URL
 * @param {string} outputDir Output directory
 * @param {string} format Audio format (mp3, m4a, etc.)
 * @param {string} quality Audio quality (0-9 for VBR, 128K, etc.)
 * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
 */
export async function extractAudio(url, outputDir, format = 'mp3', quality = '192') {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.extractAudio(url, outputDir, format, quality);
}

/**
 * Get a direct stream URL for a video
 * @param {string} url Video URL
 * @param {string} format Format code (optional)
 * @returns {Promise<{success: boolean, streamUrl?: string, error?: string}>}
 */
export async function getStreamUrl(url, format = null) {
    if (!window.electron?.ytdlp) {
        return { success: false, error: 'Electron ytdlp API not available' };
    }

    return await window.electron.ytdlp.getStreamUrl(url, format);
}

/**
 * Convert a YouTube video ID to a track object
 * @param {string} videoId YouTube video ID
 * @param {Object} videoInfo Video info from yt-dlp (optional)
 * @returns {Promise<Object>} Track object
 */
export async function convertYouTubeToTrack(videoId, videoInfo = null) {
    try {
        // If video info wasn't provided, fetch it
        if (!videoInfo) {
            const result = await getVideoInfo(`https://www.youtube.com/watch?v=${videoId}`);
            if (!result.success) {
                throw new Error(result.error);
            }
            videoInfo = result.info;
        }

        // Create a track object from the video info
        return {
            id: `youtube:${videoId}`,
            title: videoInfo.title,
            artist: videoInfo.uploader || videoInfo.channel || 'YouTube',
            album: 'YouTube',
            duration: videoInfo.duration,
            imageUrl: videoInfo.thumbnail,
            provider: 'YouTube',
            providerSpecific: {
                videoId: videoId,
                channelId: videoInfo.channel_id,
                useYtDlp: true // Flag to use yt-dlp for streaming
            }
        };
    } catch (error) {
        console.error('Error converting YouTube video to track:', error);

        // Return a basic track object with the video ID
        return {
            id: `youtube:${videoId}`,
            title: 'Unknown YouTube Video',
            artist: 'YouTube',
            album: 'YouTube',
            duration: 0,
            imageUrl: `/images/album-placeholder.svg`,
            provider: 'YouTube',
            providerSpecific: {
                videoId: videoId,
                useYtDlp: true
            }
        };
    }
}