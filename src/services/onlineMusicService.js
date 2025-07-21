/**
 * Online Music Service
 * Handles loading and fetching music from online sources defined in sources.json
 */

/**
 * Load sources configuration from sources.json
 * @returns {Promise<Array>} Array of source configurations
 */
async function loadSources() {
  try {
    // In development, fetch from the public directory
    // In production (Electron), we might need to adjust the path
    const response = await fetch('/sources.json');
    
    if (!response.ok) {
      console.warn('Could not load sources.json, using empty sources array');
      return [];
    }
    
    const sources = await response.json();
    console.log('Loaded sources:', sources);
    return Array.isArray(sources) ? sources : [];
  } catch (error) {
    console.error('Error loading sources.json:', error);
    return [];
  }
}

/**
 * Fetch songs from a single source URL
 * @param {Object} source - Source configuration object
 * @returns {Promise<Array>} Array of songs from this source
 */
async function fetchSongsFromSource(source) {
  try {
    console.log(`Fetching songs from ${source.name}: ${source.url}`);
    
    const response = await fetch(source.url);
    
    if (!response.ok) {
      console.error(`Failed to fetch from ${source.name}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    // Ensure we have an array of songs
    let songs = [];
    if (Array.isArray(data)) {
      songs = data;
    } else if (data.songs && Array.isArray(data.songs)) {
      songs = data.songs;
    } else if (data.tracks && Array.isArray(data.tracks)) {
      songs = data.tracks;
    } else {
      console.warn(`Unexpected data format from ${source.name}:`, data);
      return [];
    }
    
    // Limit the number of tracks for demo purposes (max 5 per source)
    const limitedSongs = songs.slice(0, 5);
    
    // Normalize song format and add source information
    const normalizedSongs = limitedSongs.map((song, index) => {
      // Generate a unique ID for online tracks
      const id = `online_${source.name.toLowerCase().replace(/\s+/g, '_')}_${index}_${Date.now()}`;
      
      // Handle different API formats - if it's not music data, create demo tracks
      let title, artist, album, previewUrl;
      
      if (song.title && (song.streamUrl || song.url || song.previewUrl || song.src)) {
        // This looks like actual music data
        title = song.title || song.name || 'Unknown Title';
        artist = song.artist || song.author || 'Unknown Artist';
        album = song.album || source.name;
        previewUrl = song.streamUrl || song.url || song.previewUrl || song.src;
      } else {
        // This doesn't look like music data - create demo entries for testing
        title = `Demo Track ${index + 1} (${song.title || 'Sample'})`;
        artist = `Online Artist from ${source.name}`;
        album = `${source.name} Collection`;
        previewUrl = '/audio/sample1.mp3'; // Use local sample for demo
      }
      
      return {
        id,
        title,
        artist,
        album,
        duration: song.duration || 180, // Default 3 minutes if not specified
        imageUrl: song.imageUrl || song.albumArt || song.thumbnail || '/images/album-placeholder.svg',
        previewUrl,
        source: 'Online', // Mark as online source
        sourceName: source.name, // Keep track of which source this came from
        isOnline: true, // Flag to distinguish from local files
      };
    });
    
    console.log(`Successfully fetched ${normalizedSongs.length} songs from ${source.name}`);
    return normalizedSongs;
    
  } catch (error) {
    console.error(`Error fetching songs from ${source.name}:`, error);
    return [];
  }
}

/**
 * Main function to get all online songs from all configured sources
 * @returns {Promise<Array>} Combined array of all online songs
 */
export async function getOnlineSongs() {
  try {
    console.log('=== Online Music Support: Fetching songs from all sources ===');
    
    // Load source configurations
    const sources = await loadSources();
    
    if (sources.length === 0) {
      console.log('No sources configured, returning empty array');
      return [];
    }
    
    console.log(`Found ${sources.length} source(s) to fetch from`);
    
    // Fetch songs from all sources in parallel
    const fetchPromises = sources.map(source => fetchSongsFromSource(source));
    const songArrays = await Promise.all(fetchPromises);
    
    // Combine all songs into a single array
    const allOnlineSongs = songArrays.flat();
    
    console.log(`=== Online Music Support: Successfully fetched ${allOnlineSongs.length} total songs ===`);
    
    return allOnlineSongs;
    
  } catch (error) {
    console.error('Error in getOnlineSongs:', error);
    return [];
  }
}

/**
 * Refresh online songs (useful for manual refresh)
 * @returns {Promise<Array>} Fresh array of all online songs
 */
export async function refreshOnlineSongs() {
  console.log('=== Online Music Support: Refreshing online songs ===');
  return await getOnlineSongs();
}

/**
 * Check if a track is from an online source
 * @param {Object} track - Track object to check
 * @returns {boolean} True if track is from online source
 */
export function isOnlineTrack(track) {
  return track && (track.isOnline === true || track.source === 'Online');
}

/**
 * Get available online sources
 * @returns {Promise<Array>} Array of source configurations
 */
export async function getAvailableSources() {
  return await loadSources();
}