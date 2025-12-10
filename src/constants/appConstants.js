/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

// Performance constants
export const PERFORMANCE = {
  ANIMATION_FRAME_THROTTLE: 16, // ~60fps
  DEBOUNCE_DELAY: 300,
  CACHE_MAX_SIZE: 1000,
  SIMILARITY_CACHE_SIZE: 1000,
  LYRICS_CACHE_SIZE: 500,
};

// Audio constants
export const AUDIO = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_FORMATS: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'],
  DEFAULT_VOLUME: 0.7,
  SEEK_STEP: 10, // seconds
};

// UI constants
export const UI = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  CARD_HOVER_SCALE: 1.02,
};

// Theme constants
export const THEME = {
  STORAGE_KEY: 'musicAppTheme',
  DEFAULT_THEME: 'dark',
  CSS_VARIABLE_PREFIX: '--color-',
};

// Duplicate detection constants
export const DUPLICATE_DETECTION = {
  MIN_SIMILARITY_THRESHOLD: 0.7,
  HIGH_SIMILARITY_THRESHOLD: 0.9,
  VERY_HIGH_SIMILARITY_THRESHOLD: 0.95,
  MAX_DURATION_DIFF: 10, // seconds
  MIN_LENGTH_RATIO: 0.3,
};

// Smart playlist constants
export const SMART_PLAYLISTS = {
  DEFAULT_LIMIT: 50,
  RANDOM_LIMIT: 25,
  RECENTLY_ADDED_DAYS: 7,
  MIN_TRACKS_FOR_SUGGESTION: 5,
};