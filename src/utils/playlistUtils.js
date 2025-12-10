import { PLAYLIST_TYPES, DEFAULT_RANDOM_LIMIT, PLAYLIST_ICONS } from '../constants/smartPlaylistConstants';

/**
 * Generates playlist tracks based on criteria
 * @param {Array} tracks - All available tracks
 * @param {Object} criteria - Playlist generation criteria
 * @returns {Array} Generated playlist tracks
 */
export const generatePlaylistTracks = (tracks, criteria) => {
  switch (criteria.type) {
    case PLAYLIST_TYPES.ALL:
      return tracks;
    case PLAYLIST_TYPES.RANDOM:
      return [...tracks]
        .sort(() => 0.5 - Math.random())
        .slice(0, criteria.limit || DEFAULT_RANDOM_LIMIT);
    case PLAYLIST_TYPES.FAVORITES:
      return tracks.filter(track => track.isFavorite);
    case PLAYLIST_TYPES.GENRE:
      return tracks.filter(track => 
        track.genre && track.genre.toLowerCase().includes(criteria.genre.toLowerCase())
      ).slice(0, criteria.limit || 50);
    case PLAYLIST_TYPES.DECADE:
      const startYear = criteria.decade;
      const endYear = criteria.decade + 9;
      return tracks.filter(track => 
        track.year && track.year >= startYear && track.year <= endYear
      ).slice(0, criteria.limit || 50);
    case PLAYLIST_TYPES.ARTIST:
      return tracks.filter(track => 
        track.artist && track.artist.toLowerCase().includes(criteria.artist.toLowerCase())
      ).slice(0, criteria.limit || 50);
    default:
      return tracks;
  }
};

/**
 * Creates smart playlist suggestions based on available tracks
 * @param {Array} tracks - All available tracks
 * @returns {Array} Array of playlist suggestions
 */
export const createSmartPlaylistSuggestions = (tracks) => {
  if (tracks.length === 0) return [];

  const suggestions = [
    {
      id: 'all-tracks',
      name: 'All Tracks',
      description: `Play all ${tracks.length} tracks in your library`,
      icon: PLAYLIST_ICONS[PLAYLIST_TYPES.ALL],
      criteria: { type: PLAYLIST_TYPES.ALL }
    },
    {
      id: 'random-mix',
      name: 'Random Mix',
      description: `${DEFAULT_RANDOM_LIMIT} random songs from your library`,
      icon: PLAYLIST_ICONS[PLAYLIST_TYPES.RANDOM],
      criteria: { type: PLAYLIST_TYPES.RANDOM, limit: DEFAULT_RANDOM_LIMIT }
    }
  ];

  // Add favorites if any exist
  const favoriteCount = tracks.filter(track => track.isFavorite).length;
  if (favoriteCount > 0) {
    suggestions.push({
      id: 'favorites',
      name: 'Favorites',
      description: `Your ${favoriteCount} favorite tracks`,
      icon: PLAYLIST_ICONS[PLAYLIST_TYPES.FAVORITES],
      criteria: { type: PLAYLIST_TYPES.FAVORITES }
    });
  }

  return suggestions;
};

/**
 * Validates playlist criteria
 * @param {Object} criteria - Playlist criteria to validate
 * @returns {boolean} Whether criteria is valid
 */
export const validatePlaylistCriteria = (criteria) => {
  if (!criteria || typeof criteria !== 'object') return false;
  if (!criteria.type || !Object.values(PLAYLIST_TYPES).includes(criteria.type)) return false;
  
  // Additional validation based on type
  switch (criteria.type) {
    case PLAYLIST_TYPES.GENRE:
      return Boolean(criteria.genre);
    case PLAYLIST_TYPES.DECADE:
      return Boolean(criteria.decade) && criteria.decade > 1900 && criteria.decade < 2100;
    case PLAYLIST_TYPES.ARTIST:
      return Boolean(criteria.artist);
    default:
      return true;
  }
};