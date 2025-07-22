/**
 * YouTube Service
 * 
 * This service provides functions for interacting with the YouTube API.
 */

// YouTube API key
const YOUTUBE_API_KEY = 'AIzaSyDGWLiteiRBccfm3w2Xe9FS3mfOXu-v0CA';

/**
 * Search for videos on YouTube
 * @param {string} query Search query
 * @param {object} options Search options
 * @returns {Promise<Array>} Search results
 */
export async function searchYouTube(query, options = {}) {
    try {
        const limit = options.limit || 10;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(query + ' music')}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;

        console.log('Searching YouTube with query:', query);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log('No YouTube results found');
            return [];
        }

        console.log(`Found ${data.items.length} YouTube results`);

        // Get video IDs for duration lookup
        const videoIds = data.items.map(item => item.id.videoId).join(',');

        // Get video durations
        let durations = {};
        try {
            const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
            const durationResponse = await fetch(durationUrl);

            if (durationResponse.ok) {
                const durationData = await durationResponse.json();

                // Create a map of video ID to duration
                durations = durationData.items.reduce((acc, item) => {
                    // Parse ISO 8601 duration format (PT1H2M3S)
                    const duration = item.contentDetails.duration;
                    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

                    if (match) {
                        const hours = parseInt(match[1] || 0, 10);
                        const minutes = parseInt(match[2] || 0, 10);
                        const seconds = parseInt(match[3] || 0, 10);

                        acc[item.id] = hours * 3600 + minutes * 60 + seconds;
                    } else {
                        acc[item.id] = 0;
                    }

                    return acc;
                }, {});

                console.log('Retrieved durations for YouTube videos:', durations);
            }
        } catch (error) {
            console.error('Error fetching video durations:', error);
        }

        // Transform YouTube results to our format
        return data.items.map(item => ({
            id: `youtube:${item.id.videoId}`,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            album: 'YouTube',
            duration: durations[item.id.videoId] || 0,
            coverArt: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '/images/album-placeholder.svg',
            provider: 'YouTube',
            providerSpecific: {
                videoId: item.id.videoId,
                channelId: item.snippet.channelId
            }
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
}

/**
 * Get a streamable URL for a YouTube video
 * @param {string} videoId YouTube video ID
 * @param {boolean} useYtDlp Whether to use yt-dlp for streaming
 * @returns {Promise<string>} Streamable URL
 */
export async function getYouTubeStreamURL(videoId, useYtDlp = false) {
    // If yt-dlp is enabled and available, use it to get a direct stream URL
    if (useYtDlp && window.electron?.ytdlp) {
        try {
            console.log('Attempting to use yt-dlp for direct streaming...');
            // Call the IPC method directly instead of importing the service
            const result = await window.electron.ytdlp.getStreamUrl(`https://www.youtube.com/watch?v=${videoId}`, 'bestaudio');

            if (result.success && result.streamUrl) {
                console.log('Using yt-dlp direct stream URL');
                return result.streamUrl;
            } else {
                console.warn('yt-dlp did not return a valid stream URL:', result);
            }
        } catch (error) {
            console.error('Error getting yt-dlp stream URL:', error);
            // Fall back to embed URL
        }
    }

    // Fall back to YouTube embed URL
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
}

/**
 * Get video details from YouTube API
 * @param {string} videoId YouTube video ID
 * @returns {Promise<object>} Video details
 */
export async function getVideoDetails(videoId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found');
        }

        const video = data.items[0];

        // Parse duration
        const duration = video.contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        let durationInSeconds = 0;

        if (match) {
            const hours = parseInt(match[1] || 0, 10);
            const minutes = parseInt(match[2] || 0, 10);
            const seconds = parseInt(match[3] || 0, 10);

            durationInSeconds = hours * 3600 + minutes * 60 + seconds;
        }

        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            thumbnails: video.snippet.thumbnails,
            duration: durationInSeconds,
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount
        };
    } catch (error) {
        console.error('Error getting video details:', error);
        throw error;
    }
}