/**
 * Online Music Service
 * Handles loading and fetching music from online sources defined in sources.json
 */

/**
 * Load sources configuration from sources.json
 */
async function loadSources() {
  try {
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
 * Create fallback songs when a source fails to load
 */
function createFallbackSongs(source) {
  console.log('Creating fallback songs for ' + source.name);
  
  // For SoundBound sources, create more interesting fallback tracks
  const isSoundBound = source.name.includes('Provider') || source.url.includes('shabinder') || source.url.includes('soundbound');
  
  const tracks = [];
  const providers = ['Spotify', 'YouTube', 'SoundCloud', 'Saavn', 'Gaana'];
  const genres = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Classical', 'Jazz'];
  
  // Create 5 tracks for SoundBound sources, 2 for others
  const count = isSoundBound ? 5 : 2;
  
  for (let i = 0; i < count; i++) {
    const provider = isSoundBound ? source.name.replace('Provider', '') : providers[i % providers.length];
    const genre = genres[i % genres.length];
    
    tracks.push({
      id: 'fallback_' + source.name.toLowerCase().replace(/\\s+/g, '_') + '_' + i + '_' + Date.now(),
      title: isSoundBound ? provider + ' Demo Track ' + (i + 1) : 'Fallback Track ' + (i + 1),
      artist: isSoundBound ? genre + ' Artist from ' + provider : 'Generated for ' + source.name,
      album: isSoundBound ? provider + ' ' + genre + ' Collection' : source.name + ' Fallback Collection',
      duration: 180 + (i * 30), // Varying durations
      imageUrl: '/images/album-placeholder.svg',
      previewUrl: i % 2 === 0 ? '/audio/sample1.mp3' : '/audio/sample2.mp3',
      source: isSoundBound ? 'SoundBound' : 'Online',
      sourceName: source.name,
      isOnline: true,
      isFallback: true,
      provider: isSoundBound ? provider : undefined,
      genre: isSoundBound ? genre : undefined
    });
  }
  
  return tracks;
}

/**
 * Fetch songs from a single source URL
 */
async function fetchSongsFromSource(source) {
  try {
    console.log('Fetching songs from ' + source.name + ': ' + source.url);
    
    // Check if URL is external
    const isExternalUrl = source.url.startsWith('http://') || source.url.startsWith('https://');
    const isSoundBound = source.name.includes('Provider') || source.url.includes('shabinder') || source.url.includes('soundbound');
    
    // For external URLs, especially SoundBound, we'll use fallback data instead of trying to fetch
    // This is because CORS issues will prevent us from accessing these resources directly
    if (isExternalUrl && isSoundBound) {
      console.log('Using fallback data for SoundBound source: ' + source.name);
      return createFallbackSongs(source);
    }
    
    let response;
    try {
      // For other external URLs, try to fetch but be prepared for CORS issues
      response = await fetch(source.url);
    } catch (fetchError) {
      console.warn('Error fetching from ' + source.name + ': ' + fetchError.message);
      return createFallbackSongs(source);
    }
    
    if (!response.ok) {
      console.error('Failed to fetch from ' + source.name + ': ' + response.status);
      return createFallbackSongs(source);
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
      console.warn('Unexpected data format from ' + source.name);
      return createFallbackSongs(source);
    }
    
    // Limit to 5 songs
    const limitedSongs = songs.slice(0, 5);
    
    // Normalize song format
    const normalizedSongs = limitedSongs.map((song, index) => {
      const id = 'online_' + source.name.toLowerCase().replace(/\\s+/g, '_') + '_' + index + '_' + Date.now();
      
      let title, artist, album, previewUrl;
      
      if (song.title && (song.streamUrl || song.url || song.previewUrl || song.src)) {
        title = song.title || song.name || 'Unknown Title';
        artist = song.artist || song.author || 'Unknown Artist';
        album = song.album || source.name;
        previewUrl = song.streamUrl || song.url || song.previewUrl || song.src;
      } else {
        title = 'Demo Track ' + (index + 1) + ' (' + (song.title || song.body || 'Sample') + ')';
        artist = 'Online Artist from ' + source.name;
        album = source.name + ' Collection';
        previewUrl = '/audio/sample1.mp3';
      }
      
      return {
        id,
        title,
        artist,
        album,
        duration: song.duration || 180,
        imageUrl: song.imageUrl || song.albumArt || song.thumbnail || '/images/album-placeholder.svg',
        previewUrl,
        source: 'Online',
        sourceName: source.name,
        isOnline: true
      };
    });
    
    console.log('Successfully fetched ' + normalizedSongs.length + ' songs from ' + source.name);
    return normalizedSongs;
    
  } catch (error) {
    console.error('Error fetching songs from ' + source.name + ':', error);
    return createFallbackSongs(source);
  }
}

/**
 * Main function to get all online songs from all configured sources
 */
export async function getOnlineSongs() {
  try {
    console.log('=== Online Music Support: Fetching songs from all sources ===');
    
    const sources = await loadSources();
    
    if (sources.length === 0) {
      console.log('No sources configured, returning empty array');
      return [];
    }
    
    console.log('Found ' + sources.length + ' source(s) to fetch from');
    
    const fetchPromises = sources.map(source => fetchSongsFromSource(source));
    const songArrays = await Promise.all(fetchPromises);
    
    const allOnlineSongs = songArrays.flat();
    
    console.log('=== Online Music Support: Successfully fetched ' + allOnlineSongs.length + ' total songs ===');
    
    return allOnlineSongs;
    
  } catch (error) {
    console.error('Error in getOnlineSongs:', error);
    return [];
  }
}

/**
 * Refresh online songs (useful for manual refresh)
 */
export async function refreshOnlineSongs() {
  console.log('=== Online Music Support: Refreshing online songs ===');
  return await getOnlineSongs();
}

/**
 * Check if a track is from an online source
 */
export function isOnlineTrack(track) {
  return track && (track.isOnline === true || track.source === 'Online' || track.source === 'SoundBound');
}

/**
 * Get available online sources
 */
export async function getAvailableSources() {
  return await loadSources();
}
