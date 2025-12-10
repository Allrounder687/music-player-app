/**
 * Constants for smart playlist functionality
 */

export const PLAYLIST_TYPES = {
  ALL: 'all',
  RANDOM: 'random',
  FAVORITES: 'favorites',
  GENRE: 'genre',
  DECADE: 'decade',
  ARTIST: 'artist',
  ALBUM: 'album',
  MOST_PLAYED: 'mostPlayed',
  RECENTLY_ADDED: 'recentlyAdded',
  HIGH_RATED: 'highRated',
  DURATION: 'duration'
};

export const PLAYLIST_ICONS = {
  [PLAYLIST_TYPES.ALL]: '🎵',
  [PLAYLIST_TYPES.RANDOM]: '🎲',
  [PLAYLIST_TYPES.FAVORITES]: '❤️',
  [PLAYLIST_TYPES.GENRE]: '🎼',
  [PLAYLIST_TYPES.DECADE]: '📻',
  [PLAYLIST_TYPES.ARTIST]: '🎤',
  [PLAYLIST_TYPES.ALBUM]: '💿',
  [PLAYLIST_TYPES.MOST_PLAYED]: '🔥',
  [PLAYLIST_TYPES.RECENTLY_ADDED]: '🆕',
  [PLAYLIST_TYPES.HIGH_RATED]: '⭐',
  [PLAYLIST_TYPES.DURATION]: '⏱️'
};

export const DEFAULT_RANDOM_LIMIT = 25;
export const DEFAULT_PLAYLIST_LIMIT = 50;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5
};

export const SMART_PLAYLIST_CATEGORIES = {
  AUTOMATIC: 'automatic',
  CUSTOM: 'custom',
  DISCOVERY: 'discovery'
};