/**
 * Music Provider Service
 * 
 * An implementation of the music provider that works in the browser environment.
 * This version uses real YouTube API for YouTube results and mock data for other providers.
 */

// Import YouTube service
import { searchYouTube, getYouTubeStreamURL } from './youtubeService.js';

// Create a singleton instance
let isInitialized = false;
let initializationPromise = null;

// Provider data
const PROVIDERS = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'spotify'
  },
  {
    id: 'saavn',
    name: 'JioSaavn',
    icon: 'music'
  }
];

// Mock results for non-YouTube providers
const MOCK_SPOTIFY_RESULTS = {
  'shape of you': [
    {
      id: 'spotify:7qiZfU4dY1lWllzX7mPBI3',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: 'Divide',
      duration: 233,
      coverArt: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
      provider: 'Spotify',
      providerSpecific: { trackId: '7qiZfU4dY1lWllzX7mPBI3' }
    }
  ],
  'despacito': [
    {
      id: 'spotify:6habFhsOp2NvshLv26DqMb',
      title: 'Despacito',
      artist: 'Luis Fonsi, Daddy Yankee',
      album: 'VIDA',
      duration: 229,
      coverArt: 'https://i.scdn.co/image/ab67616d0000b27358f483f5a4b5e228d5de5f17',
      provider: 'Spotify',
      providerSpecific: { trackId: '6habFhsOp2NvshLv26DqMb' }
    }
  ]
};

// Default mock results for Spotify
const DEFAULT_SPOTIFY_RESULTS = [
  {
    id: 'spotify:mock1',
    title: 'Mock Spotify Song',
    artist: 'Spotify Artist',
    album: 'Spotify Album',
    duration: 240,
    coverArt: '/images/album-placeholder.svg',
    provider: 'Spotify',
    providerSpecific: { trackId: 'mock1' }
  }
];

/**
 * Initialize the music provider
 * @returns {Promise<boolean>} True if initialization was successful
 */
export async function initializeMusicProvider() {
  // If already initialized, return immediately
  if (isInitialized) {
    return true;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = new Promise(async (resolve) => {
    try {
      console.log('Initializing music provider...');

      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Music provider initialized successfully');
      isInitialized = true;
      resolve(true);
    } catch (error) {
      console.error('Failed to initialize music provider:', error);
      resolve(false);
    }
  });

  return initializationPromise;
}

/**
 * Search for songs across all providers
 * @param {string} query Search query
 * @param {object} options Search options
 * @returns {Promise<Array>} Search results
 */
export async function searchSongs(query, options = {}) {
  try {
    // Make sure the provider is initialized
    if (!isInitialized) {
      const success = await initializeMusicProvider();
      if (!success) {
        console.error('Music provider not initialized');
        return [];
      }
    }

    // Normalize query for lookup
    const normalizedQuery = query.toLowerCase().trim();

    // Search YouTube using the real API
    const youtubeResults = await searchYouTube(query, options);
    console.log('YouTube search results:', youtubeResults);

    // Get mock Spotify results
    const spotifyResults = MOCK_SPOTIFY_RESULTS[normalizedQuery] ||
      DEFAULT_SPOTIFY_RESULTS.map(result => ({
        ...result,
        title: `${query} - ${result.title}`
      }));

    // Combine results
    const allResults = [...youtubeResults, ...spotifyResults];

    return allResults;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

/**
 * Get a streamable URL for a song
 * @param {string} songId Song ID in format "provider:id"
 * @returns {Promise<string>} Streamable URL
 */
export async function getStreamURL(songId) {
  try {
    // Make sure the provider is initialized
    if (!isInitialized) {
      const success = await initializeMusicProvider();
      if (!success) {
        throw new Error('Music provider not initialized');
      }
    }

    // Parse the song ID to get provider and ID
    const [provider, id] = songId.split(':');

    if (provider === 'youtube') {
      // Check if the track has the useYtDlp flag
      const useYtDlp = window.electron?.ytdlp !== undefined;

      // Use the YouTube service to get the stream URL
      return await getYouTubeStreamURL(id, useYtDlp);
    } else if (provider === 'spotify') {
      // For demo purposes, return a sample audio file
      return '/audio/sample1.mp3';
    } else {
      // For other providers, return a sample audio file
      return '/audio/sample2.mp3';
    }
  } catch (error) {
    console.error('Failed to get stream URL:', error);
    throw error;
  }
}

/**
 * Check if a track is from a streaming provider
 * @param {object} track Track object
 * @returns {boolean} True if the track is from a streaming provider
 */
export function isStreamingTrack(track) {
  return track && track.id && track.id.includes(':') && track.provider;
}

/**
 * Get all available providers
 * @returns {Array} List of providers
 */
export function getProviders() {
  return PROVIDERS;
}