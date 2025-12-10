/**
 * Constants for library management and file handling
 */

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',      // MP3
  'audio/wav',       // WAV
  'audio/ogg',       // OGG
  'audio/mp4',       // M4A
  'audio/x-m4a',     // M4A (alternative MIME type)
  'audio/flac',      // FLAC
  'audio/aac',       // AAC
  'audio/x-ms-wma',  // WMA
  'audio/webm',      // WebM Audio
];

export const SUPPORTED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.flac',
  '.aac',
  '.wma',
  '.webm'
];

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

export const SORT_FIELDS = {
  TITLE: 'title',
  ARTIST: 'artist',
  ALBUM: 'album',
  DURATION: 'duration',
  YEAR: 'year',
  DATE_ADDED: 'dateAdded'
};

export const FILTER_TYPES = {
  ALL: 'all',
  FAVORITES: 'favorites',
  RECENT: 'recent',
  IMPORTED: 'imported'
};

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMPORT_FILES = 100;